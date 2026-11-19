import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue';
import { dropTarget, isTreeContainer, topmostIds, type TaoTreeDrop, type TaoTreeMove, type TaoTreeNode, type TaoTreeRow } from './tree';

/**
 * Moving the rows of TaoTree: by the pointer (drag a row, the others stay), and by the keyboard (Ctrl+X or Ctrl+C on a row,
 * Ctrl+V on the place). The tree changes nothing: it asks the app with `move(...)` and shows its rows as pending while the
 * promise the app returns is not settled; a rejected promise leaves the data as it was.
 * Перенос строк TaoTree: указателем (тащить строку) и с клавиатуры (Ctrl+X или Ctrl+C на строке, Ctrl+V на месте). Дерево
 * ничего не меняет: оно просит приложение через `move(...)` и показывает строки ждущими, пока обещание приложения не
 * выполнено; отклонённое обещание оставляет данные как были.
 */

/** Pointer travel before a press becomes a drag, px: a click that shakes is still a click. / Сдвиг до начала перетаскивания. */
const DRAG_START = 5;
/** A closed folder under the pointer opens after this long, ms. / Закрытая папка под указателем раскрывается через это время. */
const OPEN_DELAY = 650;
/** The band at the top and bottom of the scrolling box where the list scrolls, px. / Полоса у края, где список прокручивается. */
const EDGE = 36;
/** The fastest edge scroll, px a second: by time, so a 120 Hz screen scrolls as fast as a 60 Hz one. / px в секунду. */
const EDGE_SPEED = 800;

export interface TreeMoveTexts {
    count: (count: number) => string;
    root: string;
    cut: string;
    copy: string;
    moved: string;
    copied: string;
    canceled: string;
    refused: string;
}

export interface TreeMoveOptions {
    root: Ref<HTMLElement | null>;
    rows: () => readonly TaoTreeRow[];
    rowEl: (index: number) => HTMLElement | null | undefined;
    /** Off without a move listener. / Выключено без слушателя move. */
    enabled: () => boolean;
    movable: (node: TaoTreeNode) => boolean;
    canDrop: (move: TaoTreeMove) => boolean;
    selected: () => ReadonlySet<string>;
    childIds: (parentId: string | null) => readonly string[] | undefined;
    parentOf: (id: string) => string | null | undefined;
    node: (id: string) => TaoTreeNode | undefined;
    expand: (row: TaoTreeRow) => unknown;
    move: (move: TaoTreeMove) => unknown;
    /** After the app settled the move: `from` are the old parents. / После того как приложение выполнило перенос. */
    moved: (move: TaoTreeMove, from: (string | null)[]) => void;
    failed: (move: TaoTreeMove, error: unknown) => void;
    announce: (text: string) => void;
    texts: () => TreeMoveTexts;
}

interface Press {
    x: number;
    y: number;
    index: number;
    pointerId: number;
}

function fill(template: string, values: Record<string, string>) {
    return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

function scrollParent(el: HTMLElement | null): HTMLElement | null {
    for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
        const overflow = getComputedStyle(p).overflowY;
        if (/(auto|scroll)/.test(overflow) && p.scrollHeight > p.clientHeight) {
            return p;
        }
    }
    return null;
}

export function useTreeMove(o: TreeMoveOptions) {
    /** The ids being dragged by the pointer. / id, которые тащат указателем. */
    const dragging = shallowRef<ReadonlySet<string>>(new Set());
    const drop = shallowRef<TaoTreeDrop | null>(null);
    /** The pointer is over a place `canDrop` refused. / Указатель над местом, которое canDrop не принял. */
    const refused = ref(false);
    const ghost = ref<{ x: number; y: number; text: string; copy: boolean } | null>(null);
    /** Rows whose move the app has not settled yet. / Строки, перенос которых приложение ещё не выполнило. */
    const pending = shallowRef<ReadonlySet<string>>(new Set());
    /** Rows cut or copied by the keyboard, waiting for Ctrl+V. / Строки, вырезанные или скопированные с клавиатуры. */
    const clipboard = shallowRef<{ ids: string[]; copy: boolean } | null>(null);

    let press: Press | null = null;
    let ids: string[] = [];
    let copy = false;
    let last = { x: 0, y: 0 };
    let swallow = false;
    let openTimer: ReturnType<typeof setTimeout> | undefined;
    let openFor = '';
    let frame = 0;
    let scroller: HTMLElement | null = null;

    const label = (list: readonly string[]) =>
        list.length === 1 ? (o.node(list[0]!)?.label ?? list[0]!) : o.texts().count(list.length);
    const targetLabel = (move: Pick<TaoTreeMove, 'parentId'>) =>
        move.parentId === null ? o.texts().root : (o.node(move.parentId)?.label ?? move.parentId);

    /** The ids a gesture on this row moves: the selection when the row is in it, otherwise the row. / Что переносит жест. */
    function idsFor(row: TaoTreeRow): string[] {
        const selected = o.selected();
        const picked = selected.has(row.node.id)
            ? o
                  .rows()
                  .map((r) => r.node.id)
                  .filter((id) => selected.has(id))
            : [row.node.id];
        return topmostIds(picked, o.parentOf).filter((id) => {
            const node = o.node(id);
            return node && !node.disabled && o.movable(node) && !pending.value.has(id);
        });
    }

    const moveOf = (d: TaoTreeDrop, list: string[], asCopy: boolean): TaoTreeMove => ({
        ids: list,
        parentId: d.parentId,
        index: d.index,
        targetId: d.targetId,
        position: d.position,
        copy: asCopy,
    });

    async function commit(move: TaoTreeMove) {
        const from = move.ids.map((id) => o.parentOf(id) ?? null);
        pending.value = new Set([...pending.value, ...move.ids]);
        o.announce(fill(move.copy ? o.texts().copied : o.texts().moved, { item: label(move.ids), target: targetLabel(move) }));
        try {
            await o.move(move);
            o.moved(move, from);
        } catch (error) {
            o.failed(move, error);
        } finally {
            const next = new Set(pending.value);
            move.ids.forEach((id) => next.delete(id));
            pending.value = next;
        }
    }

    // ---------- the pointer / указатель ----------

    /** The row under a y of the window: the rows stand in order, so a binary search. / Строка под y окна: бинарный поиск. */
    function rowAt(y: number): number {
        const count = o.rows().length;
        let lo = 0;
        let hi = count - 1;
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const box = o.rowEl(mid)?.getBoundingClientRect();
            if (!box) {
                return -1;
            }
            if (y < box.top) {
                hi = mid - 1;
            } else if (y >= box.bottom) {
                lo = mid + 1;
            } else {
                return mid;
            }
        }
        return -1;
    }

    function levelAt(x: number, el: HTMLElement): number {
        const box = el.getBoundingClientRect();
        const indent = el.querySelector('.tao-tree__toggle')?.getBoundingClientRect().width || 16;
        const start = box.left + (parseFloat(getComputedStyle(el).paddingLeft) || 0);
        return Math.max(1, Math.floor((x - start) / indent) + 1);
    }

    function clearOpen() {
        clearTimeout(openTimer);
        openFor = '';
    }

    function update() {
        const rows = o.rows();
        const index = rowAt(last.y);
        const el = index >= 0 ? o.rowEl(index) : null;
        let next: TaoTreeDrop | null = null;
        refused.value = false;
        if (el) {
            const box = el.getBoundingClientRect();
            next = dropTarget({
                rows,
                over: index,
                fraction: box.height ? (last.y - box.top) / box.height : 0.5,
                level: levelAt(last.x, el),
                dragged: ids,
                childIds: o.childIds,
                parentOf: o.parentOf,
            });
            if (next && !o.canDrop(moveOf(next, ids, copy))) {
                next = null;
                refused.value = true;
            }
        }
        drop.value = next;
        if (ghost.value) {
            ghost.value = { ...ghost.value, x: last.x, y: last.y, copy };
        }
        // a closed folder the drop goes into opens after a moment, a lazy one loads
        // закрытая папка, в которую встаёт перенос, через мгновение раскрывается, ленивая подгружается
        const row = index >= 0 ? rows[index] : undefined;
        const opens = next?.position === 'inside' && next.mark.side === 'inside' && row && row.branch && !row.expanded;
        if (!opens) {
            clearOpen();
        } else if (openFor !== row.node.id) {
            clearOpen();
            openFor = row.node.id;
            openTimer = setTimeout(() => {
                const now = o.rows().find((r) => r.node.id === openFor);
                if (now && !now.expanded) {
                    void Promise.resolve(o.expand(now)).then(() => dragging.value.size && update());
                }
            }, OPEN_DELAY);
        }
    }

    let frameAt = 0;
    function startEdgeScroll() {
        if (!frame && typeof requestAnimationFrame !== 'undefined') {
            frameAt = performance.now();
            frame = requestAnimationFrame(edgeScroll);
        }
    }

    function edgeScroll(now: number) {
        frame = 0;
        if (!dragging.value.size) {
            return;
        }
        // a frame after a long pause (a hidden tab) scrolls no more than a normal one / после паузы не дальше обычного кадра
        const dt = Math.min(50, Math.max(0, now - frameAt)) / 1000;
        frameAt = now;
        const box = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
        const into = last.y < box.top + EDGE ? last.y - (box.top + EDGE) : last.y > box.bottom - EDGE ? last.y - (box.bottom - EDGE) : 0;
        if (into) {
            const depth = Math.max(-1, Math.min(1, into / EDGE));
            const step = Math.round(depth * EDGE_SPEED * dt);
            if (scroller) {
                scroller.scrollTop += step;
            } else {
                window.scrollBy(0, step);
            }
            update();
        }
        frame = requestAnimationFrame(edgeScroll);
    }

    function begin() {
        const row = o.rows()[press!.index];
        ids = row ? idsFor(row) : [];
        if (!ids.length) {
            press = null;
            stopListening();
            return;
        }
        dragging.value = new Set(ids);
        ghost.value = { x: last.x, y: last.y, text: label(ids), copy };
        scroller = scrollParent(o.root.value);
        document.addEventListener('keydown', onDragKey, true);
        document.addEventListener('keyup', onDragKey, true);
        window.addEventListener('blur', cancel);
        startEdgeScroll();
        update();
    }

    function onPointerDown(event: PointerEvent, index: number) {
        if (!o.enabled() || event.button !== 0 || event.pointerType === 'touch' || press || dragging.value.size) {
            return;
        }
        // the chevron, the box and the actions keep their own clicks / у стрелки, флажка и действий свои клики
        if ((event.target as Element | null)?.closest?.('.tao-tree__toggle, .tao-tree__check, .tao-tree__actions')) {
            return;
        }
        const node = o.rows()[index]?.node;
        if (!node || node.disabled || !o.movable(node) || pending.value.has(node.id)) {
            return;
        }
        press = { x: event.clientX, y: event.clientY, index, pointerId: event.pointerId };
        last = { x: event.clientX, y: event.clientY };
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', cancel);
    }

    function onPointerMove(event: PointerEvent) {
        if (!press || event.pointerId !== press.pointerId) {
            return;
        }
        last = { x: event.clientX, y: event.clientY };
        copy = event.ctrlKey || event.altKey;
        if (!dragging.value.size) {
            if (Math.hypot(last.x - press.x, last.y - press.y) < DRAG_START) {
                return;
            }
            begin();
            return;
        }
        event.preventDefault();
        update();
    }

    function onPointerUp(event: PointerEvent) {
        if (!press || event.pointerId !== press.pointerId) {
            return;
        }
        const wasDrag = dragging.value.size > 0;
        const asCopy = event.ctrlKey || event.altKey;
        const target = drop.value;
        const list = ids;
        finish(); // resets copy, ids and drop: read them first / сбрасывает copy, ids и drop: читаем их раньше
        if (wasDrag) {
            // the click that follows the release is the end of the drag, not a pick
            // клик, который идёт за отпусканием, — конец перетаскивания, а не выбор
            swallow = true;
            setTimeout(() => (swallow = false));
            if (target) {
                void commit(moveOf(target, list, asCopy));
            }
        }
    }

    function onDragKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            cancel();
            o.announce(o.texts().canceled);
            return;
        }
        // Ctrl or Alt pressed or let go without a move: the ghost shows the copy at once
        // Ctrl или Alt нажали или отпустили без движения: призрак сразу показывает копию
        const next = event.ctrlKey || event.altKey;
        if (next !== copy) {
            copy = next;
            update();
        }
    }

    function stopListening() {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', cancel);
        document.removeEventListener('keydown', onDragKey, true);
        document.removeEventListener('keyup', onDragKey, true);
        window.removeEventListener('blur', cancel);
    }

    function finish() {
        press = null;
        ids = [];
        copy = false;
        stopListening();
        clearOpen();
        if (frame) {
            cancelAnimationFrame(frame);
            frame = 0;
        }
        dragging.value = new Set();
        drop.value = null;
        refused.value = false;
        ghost.value = null;
    }

    function cancel() {
        finish();
    }

    // ---------- the keyboard: cut / copy and paste / клавиатура ----------

    /** Ctrl+X, Ctrl+C, Ctrl+V and Escape on a row; true when it took the key. / true, если клавиша взята. */
    function onKeydown(event: KeyboardEvent, index: number): boolean {
        if (!o.enabled()) {
            return false;
        }
        const row = o.rows()[index];
        if (!row) {
            return false;
        }
        const mod = event.ctrlKey || event.metaKey;
        const key = event.key.toLowerCase();
        if (mod && (key === 'x' || key === 'c') && !event.altKey && !event.shiftKey) {
            const list = idsFor(row);
            if (!list.length) {
                return false;
            }
            event.preventDefault();
            clipboard.value = { ids: list, copy: key === 'c' };
            o.announce(fill(key === 'c' ? o.texts().copy : o.texts().cut, { item: label(list) }));
            return true;
        }
        if (mod && key === 'v' && clipboard.value) {
            event.preventDefault();
            const { ids: list, copy: asCopy } = clipboard.value;
            const alive = list.filter((id) => o.node(id));
            // a folder takes the rows at its end, any other row after itself
            // папка берёт строки в конец, любая другая строка — после себя
            const into = isTreeContainer(row.node) && !row.node.disabled;
            const d = dropTarget({
                rows: o.rows(),
                over: index,
                fraction: into ? 0.5 : 0.99,
                dragged: alive,
                childIds: o.childIds,
                parentOf: o.parentOf,
            });
            const move = d && moveOf(d, alive, asCopy);
            if (!move || !alive.length || !o.canDrop(move)) {
                o.announce(fill(o.texts().refused, { item: label(alive.length ? alive : list), target: row.node.label }));
                return true;
            }
            if (!asCopy) {
                clipboard.value = null;
            }
            void commit(move);
            return true;
        }
        if (event.key === 'Escape' && clipboard.value) {
            event.preventDefault();
            clipboard.value = null;
            o.announce(o.texts().canceled);
            return true;
        }
        return false;
    }

    onBeforeUnmount(finish);

    return {
        dragging,
        drop,
        refused,
        ghost,
        pending,
        clipboard,
        onPointerDown,
        onKeydown,
        /** The click right after a drag: the tree ignores it. / Клик сразу после перетаскивания: дерево его не считает. */
        swallowClick: () => swallow,
        cancel,
    };
}
