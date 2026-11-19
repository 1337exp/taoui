<script lang="ts" setup>
import { computed, nextTick, ref, shallowReactive, shallowRef, useId, watch } from 'vue';
import type { TaoVirtualAnchor } from '../floating';
import { useListNav } from '../listNav';
import { formatText, localeEn, useLocaleText, useTaoLocale } from '../locale';
import type { TaoMenuItem } from '../menu';
import { sizeClass, type TaoSize } from '../size';
import {
    checkState,
    menuSelection,
    sortTreeNodes,
    toggleCheck,
    visibleRows,
    type TaoTreeCheckState,
    type TaoTreeMenu,
    type TaoTreeMove,
    type TaoTreeNode,
    type TaoTreeRow,
    type TaoTreeSelection,
    type TaoTreeSort,
} from '../tree';
import { useTreeMove } from '../treeMove';
import TaoIcon from './TaoIcon.vue';
import TaoMenu from './TaoMenu.vue';

defineOptions({ name: 'TaoTree' });

// A tree of files or objects: expand and collapse, select, check with tri-state parents, load children lazily.
// ARIA tree: one tab stop, ↑ / ↓ walk the visible rows, → opens or goes to the first child, ← closes or goes to the
// parent, Home / End, type-ahead, `*` opens the siblings, Enter / Space pick. The rows are a flat list with
// aria-level, so a large tree renders as one list.
// Дерево файлов или объектов: раскрытие, выбор, чекбоксы с промежуточным состоянием родителя, ленивая подгрузка.
// ARIA tree: одна остановка Tab, ↑ / ↓ по видимым строкам, → раскрывает или идёт к первому ребёнку, ← сворачивает
// или идёт к родителю, Home / End, поиск по буквам, `*` раскрывает соседей, Enter / Space выбирают.
const props = withDefaults(
    defineProps<{
        nodes: TaoTreeNode[];
        /** Ids of the expanded nodes (`v-model:expanded`); without it the tree keeps them itself. / id раскрытых узлов. */
        expanded?: string[];
        selection?: TaoTreeSelection;
        /** `v-model:selected`: an id (single) or a list of ids (multiple). / id или список id. */
        selected?: string | string[] | null;
        /** Checkboxes; a parent is checked, unchecked or mixed by its leaves. / Чекбоксы; родитель по своим листьям. */
        checkable?: boolean;
        /** `v-model:checked`: the ids of the checked nodes without children. / id отмеченных узлов без детей. */
        checked?: string[];
        /** Loads the children of a node with `hasChildren`. / Подгружает детей узла с `hasChildren`. */
        load?: (node: TaoTreeNode) => Promise<TaoTreeNode[]>;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        /**
         * The context menu of a row (right click, the Menu key, Shift+F10): a list, or `(node, selected) => items`.
         * A right click outside the selection selects that row first; the pick comes as `menu-select`.
         * Контекстное меню строки (правый клик, клавиша Menu, Shift+F10): список или `(node, selected) => items`.
         * Правый клик вне выбора сначала выбирает строку; выбранный пункт приходит в `menu-select`.
         */
        menu?: TaoTreeMenu;
        /**
         * `@move`: the rows can be dragged to another place, and cut / copied and pasted with Ctrl+X / Ctrl+C / Ctrl+V. The
         * tree changes nothing: make the move in your data (`moveTreeNodes`); return a promise and the rows wait for it,
         * a rejected one comes as `move-error`. A prop, not only an event, so the tree can wait for what it returns.
         * `@move`: строки можно перетащить в другое место, а также вырезать / скопировать и вставить (Ctrl+X / Ctrl+C /
         * Ctrl+V). Дерево ничего не меняет: перенос делаете вы в своих данных (`moveTreeNodes`); верните обещание, и
         * строки его подождут, отклонённое придёт в `move-error`. Проп, а не только событие: дерево ждёт его ответ.
         */
        onMove?: (move: TaoTreeMove) => unknown;
        /**
         * The order of the rows: `none` the data's (a drag can put a row between others), `name` folders first and by
         * name, or your compare. With a sort a drag only changes the folder: onto a folder puts the rows in it, onto
         * any other row into that row's folder. The tree sorts what it shows; `nodes` stays as it is.
         * Порядок строк: `none` — как в данных (перенос ставит строку между другими), `name` — папки первыми и по имени,
         * или своё сравнение. С сортировкой перенос меняет только папку: на папку — в неё, на другую строку — в её
         * папку. Дерево сортирует то, что показывает; `nodes` не меняется.
         */
        sort?: TaoTreeSort;
        /** Which rows can be moved (with `@move`); all but disabled ones by default. / Какие строки можно переносить. */
        movable?: boolean | ((node: TaoTreeNode) => boolean);
        /**
         * May the rows go there: false shows a «no» cursor and no mark (a file into a file is already refused).
         * Можно ли туда: false — курсор «нельзя» и нет метки (файл в файл и так не принимается).
         */
        canDrop?: (move: TaoTreeMove) => boolean;
        /** Accessible name of the tree. / Имя дерева для скринридера. */
        ariaLabel?: string;
        loadingLabel?: string;
        /** Accessible name of the context menu. / Имя контекстного меню для скринридера. */
        menuLabel?: string;
    }>(),
    {
        expanded: undefined,
        selection: 'single',
        selected: undefined,
        checkable: false,
        checked: undefined,
        load: undefined,
        size: undefined,
        menu: undefined,
        onMove: undefined,
        sort: 'none',
        movable: true,
        canDrop: undefined,
        ariaLabel: undefined,
        loadingLabel: undefined,
        menuLabel: undefined,
    },
);
const l10n = useLocaleText(props, 'tree');
const locale = useTaoLocale();
/** A text of the tree, English for a locale written before 5.51.0. / Текст дерева; английский для старой локали. */
const text = <K extends keyof typeof localeEn.tree>(key: K) => (l10n.value[key] ?? localeEn.tree[key])!;

const emit = defineEmits<{
    'update:expanded': [ids: string[]];
    'update:selected': [value: string | string[] | null];
    'update:checked': [ids: string[]];
    /** A node was picked (click, Enter, Space without checkboxes). / Узел выбран. */
    select: [node: TaoTreeNode];
    /**
     * A node without children was opened: a double click or Enter (a file into an editor). A branch opens and closes instead.
     * Узел без детей открыт: двойной клик или Enter (файл в редактор). Ветка вместо этого раскрывается и сворачивается.
     */
    open: [node: TaoTreeNode];
    /** `load` failed; the node stays closed. / `load` упал; узел остаётся закрытым. */
    'load-error': [node: TaoTreeNode, error: unknown];
    /**
     * A context menu was asked for on a row. Without `menu` the browser's own menu follows unless you call
     * `event.preventDefault()`: the place for a menu of your own.
     * На строке попросили контекстное меню. Без `menu` дальше откроется меню браузера, если не вызвать
     * `event.preventDefault()`: место для своего меню.
     */
    menu: [node: TaoTreeNode, event: MouseEvent | KeyboardEvent];
    /** An item of `menu` was picked: its id, the row and the ids it acts on. / Выбран пункт `menu`. */
    'menu-select': [id: string, node: TaoTreeNode, selected: string[]];
    /** The promise `@move` returned was rejected; the data is as it was. / Обещание `@move` отклонено; данные прежние. */
    'move-error': [move: TaoTreeMove, error: unknown];
}>();

interface NodeSlot {
    node: TaoTreeNode;
    level: number;
    expanded: boolean;
    selected: boolean;
}

defineSlots<{
    /** The icon before the label. / Иконка перед подписью. */
    icon?(props: NodeSlot): unknown;
    /** The label. / Подпись. */
    label?(props: NodeSlot): unknown;
    /** Buttons at the end of the row, shown on hover and focus. / Кнопки в конце строки, видны при наведении и фокусе. */
    actions?(props: NodeSlot): unknown;
}>();

// ---------- models: controlled when the prop is given, otherwise kept here ----------

const ownExpanded = ref<string[]>([]);
const ownSelected = ref<string | string[] | null>(null);
const ownChecked = ref<string[]>([]);

const expandedSet = computed(() => new Set(props.expanded ?? ownExpanded.value));
const selectedSet = computed(() => {
    const value = props.selected !== undefined ? props.selected : ownSelected.value;
    return new Set(value === null ? [] : Array.isArray(value) ? value : [value]);
});
const checkedSet = computed(() => new Set(props.checked ?? ownChecked.value));

function setExpanded(ids: Set<string>) {
    const list = [...ids];
    ownExpanded.value = list;
    emit('update:expanded', list);
}

function setChecked(ids: Set<string>) {
    const list = [...ids];
    ownChecked.value = list;
    emit('update:checked', list);
}

function setSelected(value: string | string[] | null) {
    ownSelected.value = value;
    emit('update:selected', value);
}

// ---------- lazy children ----------

const loaded = shallowReactive(new Map<string, TaoTreeNode[]>());
const loading = shallowReactive(new Set<string>());
const raw = (node: TaoTreeNode) => node.children ?? loaded.get(node.id);

// the order the rows stand in: the data's, or the sort's; one sorted copy per list until the sort or the data change
// порядок строк: как в данных или по сортировке; одна отсортированная копия на список, пока не сменились сортировка и данные
const order = computed(() => {
    const sort = props.sort;
    const code = locale.value.code;
    const cache = new WeakMap<readonly TaoTreeNode[], readonly TaoTreeNode[]>();
    return (list: readonly TaoTreeNode[]) => {
        let sorted = cache.get(list);
        if (!sorted) {
            sorted = sortTreeNodes(list, sort, code);
            cache.set(list, sorted);
        }
        return sorted;
    };
});
const children = (node: TaoTreeNode) => {
    const own = raw(node);
    return own && order.value(own);
};

const rows = computed(() => visibleRows(order.value(props.nodes), expandedSet.value, children));
const rowIndex = computed(() => new Map(rows.value.map((row, index) => [row.node.id, index])));

async function expand(row: TaoTreeRow) {
    const { node } = row;
    if (!row.branch || row.expanded || loading.has(node.id)) {
        return;
    }
    if (children(node) === undefined && node.hasChildren) {
        if (!props.load) {
            return;
        }
        loading.add(node.id);
        try {
            const list = await props.load(node);
            loaded.set(node.id, list);
            // a checked lazy node hands its check to the children it turned out to have
            // отмеченный ленивый узел передаёт отметку детям, которые у него оказались
            if (checkedSet.value.has(node.id) && list.length) {
                const next = new Set(checkedSet.value);
                next.delete(node.id);
                list.filter((child) => !child.disabled).forEach((child) => next.add(child.id));
                setChecked(next);
            }
        } catch (error) {
            emit('load-error', node, error);
            return;
        } finally {
            loading.delete(node.id);
        }
    }
    setExpanded(new Set([...expandedSet.value, node.id]));
}

function collapse(row: TaoTreeRow) {
    // read before closing: the rows are recomputed as soon as the set changes
    const focused = rows.value[current.value];
    const focusInside = Boolean(focused && isInside(focused, row.node.id));
    const next = new Set(expandedSet.value);
    next.delete(row.node.id);
    setExpanded(next);
    // the focus was inside the closed branch: it goes to the branch itself
    if (focusInside) {
        void nextTick(() => focusRow(rowIndex.value.get(row.node.id) ?? 0));
    }
}

function isInside(row: TaoTreeRow, ancestorId: string): boolean {
    let parentId = row.parentId;
    while (parentId) {
        if (parentId === ancestorId) {
            return true;
        }
        const parent = rows.value[rowIndex.value.get(parentId) ?? -1];
        parentId = parent?.parentId ?? null;
    }
    return false;
}

function toggle(row: TaoTreeRow) {
    if (row.expanded) {
        collapse(row);
    } else {
        void expand(row);
    }
}

// ---------- selection and checks ----------

function pick(row: TaoTreeRow) {
    const { node } = row;
    if (node.disabled) {
        return;
    }
    if (props.selection === 'single') {
        setSelected(node.id);
    } else if (props.selection === 'multiple') {
        const next = new Set(selectedSet.value);
        if (next.has(node.id)) {
            next.delete(node.id);
        } else {
            next.add(node.id);
        }
        setSelected([...next]);
    }
    emit('select', node);
}

function check(row: TaoTreeRow) {
    if (!row.node.disabled) {
        setChecked(toggleCheck(row.node, checkedSet.value, children));
    }
}

const stateOf = (row: TaoTreeRow): TaoTreeCheckState => checkState(row.node, checkedSet.value, children);
const ariaChecked = (row: TaoTreeRow) => {
    const state = stateOf(row);
    return state === 'mixed' ? 'mixed' : state === 'checked' ? 'true' : 'false';
};

// ---------- focus: one tab stop, roving tabindex over the rows ----------

const treeId = useId();
const rowRefs = ref<(HTMLElement | null)[]>([]);
const treeRef = ref<HTMLElement | null>(null);
const current = ref(0);
const rowDomId = (row: TaoTreeRow) => `${treeId}-${row.node.id}`;

// the focused row may disappear (its parent closed elsewhere, new data): keep the index inside the list
watch(
    () => rows.value.length,
    (length) => {
        if (current.value >= length) {
            current.value = Math.max(0, length - 1);
        }
    },
);

function focusRow(index: number) {
    current.value = index;
    rowRefs.value[index]?.focus();
}

const nav = useListNav({
    enabled: () => rows.value.map(() => true),
    active: current,
    labels: () => rows.value.map((row) => row.node.label),
    loop: false,
    onMove: (index) => rowRefs.value[index]?.focus(),
});

function onKeydown(event: KeyboardEvent, index: number) {
    const row = rows.value[index];
    if (!row) {
        return;
    }
    current.value = index;
    if (onMenuKey(event, row, index) || moveRows.onKeydown(event, index)) {
        return;
    }
    if (event.key === '*') {
        event.preventDefault();
        // every sibling of this row opens / открываются все соседи этой строки
        rows.value.filter((other) => other.parentId === row.parentId && other.branch && !other.expanded).forEach((other) => void expand(other));
        return;
    }
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (row.branch && !row.expanded) {
            void expand(row);
        } else if (row.expanded) {
            focusRow(index + 1);
        }
        return;
    }
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (row.expanded) {
            collapse(row);
        } else if (row.parentId) {
            focusRow(rowIndex.value.get(row.parentId) ?? index);
        }
        return;
    }
    if (event.key === 'Enter') {
        event.preventDefault();
        if (props.selection !== 'none') {
            pick(row);
        }
        activateRow(row);
        return;
    }
    if (event.key === ' ' && !(event.target as HTMLElement).closest('.tao-tree__actions')) {
        event.preventDefault();
        if (props.checkable) {
            check(row);
        } else if (props.selection === 'none') {
            toggle(row);
        } else {
            pick(row);
        }
        return;
    }
    nav.onKeydown(event);
}

/** The default action of a row: a branch opens or closes, a leaf is opened. / Действие строки по умолчанию. */
function activateRow(row: TaoTreeRow) {
    if (row.node.disabled) {
        return;
    }
    if (row.branch) {
        toggle(row);
    } else {
        emit('open', row.node);
    }
}

// A single click selects, a double click acts, as in a file manager. The two clicks of a double click came first: in a
// multiple selection they toggled the row twice, so it is put back; with selection none the first click already toggled
// the branch, so only a leaf is opened.
// Одинарный клик выбирает, двойной действует, как в файловом менеджере. Два клика двойного пришли раньше: во
// множественном выборе они переключили строку дважды, её возвращаем; при selection none первый клик уже переключил
// ветку, поэтому открывается только лист.
function onRowDblClick(row: TaoTreeRow) {
    if (row.node.disabled) {
        return;
    }
    if (props.selection === 'multiple' && !selectedSet.value.has(row.node.id)) {
        setSelected([...selectedSet.value, row.node.id]);
    }
    if (props.selection === 'none' && row.branch) {
        return;
    }
    activateRow(row);
}

function onRowClick(row: TaoTreeRow, index: number) {
    if (moveRows.swallowClick()) {
        return;
    }
    current.value = index;
    if (props.selection === 'none') {
        if (row.branch) {
            toggle(row);
        }
        return;
    }
    pick(row);
}

// ---------- the context menu ----------

const menuOpen = ref(false);
const menuAnchor = ref<TaoVirtualAnchor | null>(null);
const menuItems = shallowRef<TaoMenuItem[]>([]);
const menuNode = shallowRef<TaoTreeNode | null>(null);
const menuIds = ref<string[]>([]);
// the Menu key opens the menu on keydown; the contextmenu event the browser sends after it is the same request
// клавиша Menu открывает меню на keydown; событие contextmenu, которое браузер шлёт следом, — та же просьба
let keyMenuAt = -Infinity;

/** Under the row, from the start of its label: where a menu opened from the keyboard hangs. / Под строкой, от начала подписи. */
function rowAnchor(index: number): TaoVirtualAnchor | null {
    const el = rowRefs.value[index];
    if (!el) {
        return null;
    }
    const box = el.getBoundingClientRect();
    const label = el.querySelector('.tao-tree__label')?.getBoundingClientRect();
    return { x: label ? label.left : box.left, y: box.top, width: 0, height: box.height };
}

/** Opens `menu` for a row; false when there is nothing to show (no `menu`, an empty list). */
function openMenu(row: TaoTreeRow, index: number, anchor: TaoVirtualAnchor | null): boolean {
    if (!props.menu || !anchor) {
        return false;
    }
    const change = menuSelection(props.selection, selectedSet.value, row.node);
    const ids =
        change !== undefined
            ? [row.node.id]
            : selectedSet.value.has(row.node.id)
              ? [...selectedSet.value]
              : [row.node.id];
    const items = typeof props.menu === 'function' ? props.menu(row.node, ids) : props.menu;
    if (!items.length) {
        return false;
    }
    if (change !== undefined) {
        setSelected(change);
    }
    current.value = index;
    menuNode.value = row.node;
    menuIds.value = ids;
    menuItems.value = items;
    menuAnchor.value = anchor;
    // a second right click while the menu is open moves it: close, then open at the new point
    // второй правый клик при открытом меню переносит его: закрыть и открыть в новой точке
    menuOpen.value = false;
    void nextTick(() => (menuOpen.value = true));
    return true;
}

function onRowContextMenu(event: MouseEvent, row: TaoTreeRow, index: number) {
    if (performance.now() - keyMenuAt < 500) {
        event.preventDefault();
        return;
    }
    emit('menu', row.node, event);
    if (event.defaultPrevented) {
        return;
    }
    // a contextmenu from the keyboard (where the keydown did not reach us) has no pointer: hang it from the row
    // contextmenu с клавиатуры (когда keydown до нас не дошёл) без указателя: вешаем меню на строку
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    const anchor = fromKeyboard ? rowAnchor(index) : { x: event.clientX, y: event.clientY };
    if (openMenu(row, index, anchor)) {
        event.preventDefault();
    }
}

function onMenuKey(event: KeyboardEvent, row: TaoTreeRow, index: number): boolean {
    if (!props.menu || !(event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey))) {
        return false;
    }
    emit('menu', row.node, event);
    // the app took it (a menu of its own), or ours opened: either way the contextmenu that follows is not a new request
    // приложение взяло его на себя (своё меню) или открылось наше: contextmenu следом — не новая просьба
    if (!event.defaultPrevented && !openMenu(row, index, rowAnchor(index))) {
        return false;
    }
    event.preventDefault();
    keyMenuAt = performance.now();
    return true;
}

function onMenuSelect(id: string) {
    if (menuNode.value) {
        emit('menu-select', id, menuNode.value, menuIds.value);
    }
}

// TaoMenu gives the focus back to the row itself / TaoMenu сам возвращает фокус строке
function onMenuClose() {
    menuOpen.value = false;
}

// ---------- moving rows ----------

// Every known node (closed branches and loaded children too): the parent, the children in order, the node by id.
// Каждый известный узел (и в свёрнутых ветках, и подгруженные): родитель, дети по порядку, узел по id.
const known = computed(() => {
    const parent = new Map<string, string | null>();
    const kids = new Map<string | null, string[]>();
    const byId = new Map<string, TaoTreeNode>();
    const walk = (list: readonly TaoTreeNode[], parentId: string | null) => {
        kids.set(
            parentId,
            list.map((node) => node.id),
        );
        for (const node of list) {
            if (byId.has(node.id)) {
                continue; // a repeated id (a wrong load) is a leaf, as in visibleRows / повтор id — лист
            }
            byId.set(node.id, node);
            parent.set(node.id, parentId);
            const own = children(node);
            if (own) {
                walk(own, node.id);
            }
        }
    };
    walk(order.value(props.nodes), null);
    return { parent, kids, byId };
});

/** Children loaded for a folder a move touched are stale: load them again if it is open. / Подгружает заново. */
async function reload(id: string) {
    const node = known.value.byId.get(id);
    if (!node || node.children || !loaded.has(id)) {
        return;
    }
    loaded.delete(id);
    if (!expandedSet.value.has(id) || !props.load) {
        return;
    }
    loading.add(id);
    try {
        loaded.set(id, await props.load(node));
    } catch (error) {
        emit('load-error', node, error);
    } finally {
        loading.delete(id);
    }
}

const canMove = computed(() => Boolean(props.onMove));
const liveText = ref('');
function announce(message: string) {
    // a new text each time, so the same words are read again / каждый раз новый текст, чтобы те же слова прочли снова
    liveText.value = '';
    void nextTick(() => (liveText.value = message));
}

const moveRows = useTreeMove({
    root: treeRef,
    rows: () => rows.value,
    rowEl: (index) => rowRefs.value[index],
    enabled: () => canMove.value,
    movable: (node) => (typeof props.movable === 'function' ? props.movable(node) : props.movable),
    canDrop: (move) => props.canDrop?.(move) ?? true,
    selected: () => selectedSet.value,
    childIds: (id) => known.value.kids.get(id),
    parentOf: (id) => known.value.parent.get(id),
    node: (id) => known.value.byId.get(id),
    sorted: () => props.sort !== 'none',
    expand: (row) => expand(row),
    move: (move) => props.onMove?.(move),
    moved: (move, from) => new Set([move.parentId, ...from]).forEach((id) => id !== null && void reload(id)),
    failed: (move, error) => emit('move-error', move, error),
    announce,
    texts: () => ({
        count: (count) => formatText(text('countLabel'), { count }),
        root: text('rootLabel'),
        cut: text('cutText'),
        copy: text('copyText'),
        moved: text('movedText'),
        copied: text('copiedText'),
        canceled: text('canceledText'),
        refused: text('refusedText'),
    }),
});

// top-level refs, so the template unwraps them / верхнеуровневые ref, чтобы шаблон их разворачивал
const { dragging, refused, ghost, pending, clipboard } = moveRows;
const isCut = (id: string) => Boolean(clipboard.value && !clipboard.value.copy && clipboard.value.ids.includes(id));

const dropClass = (row: TaoTreeRow) => {
    const mark = moveRows.drop.value?.mark;
    return mark && mark.rowId === row.node.id ? `tao-tree__row--drop-${mark.side}` : undefined;
};

const slotProps = (row: TaoTreeRow): NodeSlot => ({
    node: row.node,
    level: row.level,
    expanded: row.expanded,
    selected: selectedSet.value.has(row.node.id),
});
</script>

<template>
    <ul
        ref="treeRef"
        class="tao-tree"
        :class="[
            sizeClass(size),
            {
                'tao-tree--menu-open': menuOpen,
                'tao-tree--dragging': dragging.size > 0,
                'tao-tree--refused': refused,
                'tao-tree--drop-root': moveRows.drop.value?.mark.rowId === '',
            },
        ]"
        role="tree"
        :aria-label="l10n.ariaLabel"
        :aria-multiselectable="selection === 'multiple' || undefined"
    >
        <li
            v-for="(row, index) in rows"
            :id="rowDomId(row)"
            :key="row.node.id"
            :ref="(el) => (rowRefs[index] = el as HTMLElement | null)"
            class="tao-tree__row"
            :class="[
                row.node.tone && `tao-tree__row--toned tao-tree__row--${row.node.tone}`,
                dropClass(row),
                {
                    'tao-tree__row--selected': selectedSet.has(row.node.id),
                    'tao-tree__row--disabled': row.node.disabled,
                    'tao-tree__row--menu': menuOpen && menuNode?.id === row.node.id,
                    'tao-tree__row--dragged': dragging.has(row.node.id),
                    'tao-tree__row--pending': pending.has(row.node.id),
                    'tao-tree__row--cut': isCut(row.node.id),
                },
            ]"
            role="treeitem"
            :tabindex="current === index ? 0 : -1"
            :aria-level="row.level"
            :aria-setsize="row.setsize"
            :aria-posinset="row.posinset"
            :aria-expanded="row.branch ? row.expanded : undefined"
            :aria-selected="selection === 'none' ? undefined : selectedSet.has(row.node.id)"
            :aria-checked="checkable ? ariaChecked(row) : undefined"
            :aria-disabled="row.node.disabled || undefined"
            :aria-busy="loading.has(row.node.id) || pending.has(row.node.id) || undefined"
            :style="{ '--_level': row.level - 1, '--_drop-level': (moveRows.drop.value?.mark.level ?? 1) - 1 }"
            @keydown="onKeydown($event, index)"
            @pointerdown="moveRows.onPointerDown($event, index)"
            @click="onRowClick(row, index)"
            @dblclick="onRowDblClick(row)"
            @contextmenu="onRowContextMenu($event, row, index)"
            @focus="current = index"
        >
            <span v-for="n in row.level - 1" :key="n" class="tao-tree__guide" aria-hidden="true"></span>
            <span
                class="tao-tree__toggle"
                :class="{ 'tao-tree__toggle--open': row.expanded }"
                aria-hidden="true"
                @click.stop="row.branch && toggle(row)"
                @dblclick.stop
            >
                <span v-if="loading.has(row.node.id)" class="tao-tree__spinner" :title="l10n.loadingLabel"></span>
                <TaoIcon v-else-if="row.branch" name="tao-chevron-right" />
            </span>
            <span
                v-if="checkable"
                class="tao-tree__check"
                :class="`tao-tree__check--${stateOf(row)}`"
                aria-hidden="true"
                @click.stop="check(row)"
                @dblclick.stop
            ></span>
            <span v-if="$slots.icon || row.node.icon" class="tao-tree__icon" aria-hidden="true">
                <slot name="icon" v-bind="slotProps(row)">
                    <TaoIcon :name="row.node.icon!" />
                </slot>
            </span>
            <span class="tao-tree__label">
                <slot name="label" v-bind="slotProps(row)">{{ row.node.label }}</slot>
            </span>
            <!-- the hidden comma keeps the name and the hint two words for a screen reader («App.vue, changed»)
                 скрытая запятая не даёт скринридеру слить имя и подсказку в одно слово -->
            <span v-if="row.node.hint" class="tao-tree__hint"><span class="tao-sr-only">, </span>{{ row.node.hint }}</span>
            <span v-if="$slots.actions" class="tao-tree__actions" @click.stop @dblclick.stop @keydown.stop>
                <slot name="actions" v-bind="slotProps(row)" />
            </span>
        </li>
        <!-- teleported to the body: only two comment marks stay in the list / уходит в body, в списке остаются две метки -->
        <TaoMenu
            v-if="menu"
            :items="menuItems"
            :open="menuOpen"
            :anchor="menuAnchor"
            :label="text('menuLabel')"
            close-on-scroll
            @select="onMenuSelect"
            @close="onMenuClose"
        />
        <Teleport v-if="canMove" to="body">
            <!-- what is being dragged, under the pointer / что тащат, у указателя -->
            <div
                v-if="ghost"
                class="tao-tree__ghost"
                :class="sizeClass(size)"
                aria-hidden="true"
                :style="{ left: `${ghost.x + 14}px`, top: `${ghost.y + 10}px` }"
            >
                <span v-if="ghost.copy" class="tao-tree__ghost-copy">+</span>{{ ghost.text }}
            </div>
            <!-- moves said aloud: cut, moved, refused / переносы вслух -->
            <div class="tao-sr-only" role="status" aria-live="polite">{{ liveText }}</div>
        </Teleport>
    </ul>
</template>

<style scoped>
.tao-tree {
    --_indent: calc(var(--tao-control-height) * 0.6);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
}

.tao-tree__row {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    min-height: calc(var(--tao-control-height) - var(--tao-space-2));
    padding: 0 var(--tao-control-padding-x) 0 var(--tao-space-1);
    border-radius: var(--tao-radius-control);
    cursor: pointer;
    user-select: none;
    /* a row the pointer sweeps across changes at once, as in a system menu: a fade would trail behind it
       строку, по которой пробегает указатель, подсвечиваем сразу, как в системном меню */
    transition: none;
}

.tao-tree__row:hover {
    background: var(--tao-color-hover);
}

/* The selection is an everyday state: a tint behind the row, the text keeps its colour. The accent of the text is left
   to what the app marks on purpose (`tone`), or every walk through the tree would shine as much as a mark.
   Выбор — рядовое состояние: подложка под строкой, текст своего цвета. Акцент текста оставлен тому, что приложение
   отмечает нарочно (`tone`), иначе каждая прогулка по дереву светилась бы как метка. */
.tao-tree__row--selected,
.tao-tree__row--selected:hover {
    background: var(--tao-color-accent-subtle);
}

/* the selection of a tree without the focus is grey, as in an IDE or a file manager: the tint says where the keys go.
   An open context menu has the focus, but it is the tree's own: the selection keeps its tint then.
   Выбор в дереве без фокуса серый, как в IDE и файловом менеджере: подложка говорит, куда идут клавиши.
   Открытое контекстное меню забирает фокус, но оно часть дерева: тогда выбор остаётся с подложкой. */
.tao-tree:not(:focus-within):not(.tao-tree--menu-open) .tao-tree__row--selected {
    background: var(--tao-color-hover);
}

/* the row a context menu was opened for, when it is not the selection (no selection mode, a disabled row)
   строка, для которой открыто контекстное меню, когда она не в выборе (режим none, выключенная строка) */
.tao-tree__row--menu:not(.tao-tree__row--selected) {
    background: var(--tao-color-hover);
    box-shadow: inset 0 0 0 1px var(--tao-color-border-strong);
}

/* ---------- moving rows / перенос строк ---------- */

.tao-tree--dragging,
.tao-tree--dragging .tao-tree__row {
    cursor: grabbing;
}

.tao-tree--refused,
.tao-tree--refused .tao-tree__row {
    cursor: not-allowed;
}

/* while dragging the pointer sweeps over everything: no hover under it, only the mark
   при перетаскивании указатель проходит по всему: никакой подсветки под ним, только метка */
.tao-tree--dragging .tao-tree__row:hover:not(.tao-tree__row--selected):not(.tao-tree__row--drop-inside) {
    background: none;
}

.tao-tree__row--dragged,
.tao-tree__row--cut {
    opacity: 0.5;
}

.tao-tree__row--pending {
    opacity: 0.6;
    cursor: progress;
}

/* inside a folder: the whole row; before or after: a line from the level the rows will stand at
   внутрь папки — вся строка; перед или после — линия от уровня, на котором встанут строки */
.tao-tree__row.tao-tree__row--drop-inside {
    background: var(--tao-color-accent-subtle);
    box-shadow: inset 0 0 0 1px var(--tao-color-accent);
}

/* a sorted tree taking rows to its top level: the frame is the whole tree / сортированное дерево на верхний уровень: рамка — всё дерево */
.tao-tree--drop-root {
    border-radius: var(--tao-radius-control);
    box-shadow: inset 0 0 0 1px var(--tao-color-accent);
}

.tao-tree__row--drop-before::after,
.tao-tree__row--drop-after::after {
    content: '';
    position: absolute;
    left: calc(var(--tao-space-1) + var(--_drop-level) * var(--_indent));
    right: 0;
    height: 2px;
    border-radius: 1px;
    background: var(--tao-color-accent);
    pointer-events: none;
}

.tao-tree__row--drop-before::after {
    top: -1px;
}

.tao-tree__row--drop-after::after {
    bottom: -1px;
}

.tao-tree__ghost {
    position: fixed;
    z-index: var(--tao-z-tooltip);
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-1);
    max-width: 16rem;
    padding: var(--tao-space-1) var(--tao-space-2);
    overflow: hidden;
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-surface-raised);
    box-shadow: var(--tao-shadow-panel);
    color: var(--tao-color-text);
    font-size: var(--tao-control-font-size);
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
}

.tao-tree__ghost-copy {
    color: var(--tao-color-accent-text);
    font-weight: 600;
}

.tao-tree__row:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-tree__row--disabled {
    color: var(--tao-color-text-disabled);
    cursor: default;
}

/* one guide per level: a thin line under the toggle of the ancestor / направляющая на уровень */
.tao-tree__guide {
    flex: none;
    align-self: stretch;
    width: var(--_indent);
    background: linear-gradient(var(--tao-color-border), var(--tao-color-border)) no-repeat center / 1px 100%;
}

.tao-tree__toggle {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--_indent);
    height: var(--_indent);
    color: var(--tao-color-text-muted);
    transition: transform var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tree__toggle--open {
    transform: rotate(90deg);
}

.tao-tree__spinner {
    width: 0.8em;
    height: 0.8em;
    border: 2px solid var(--tao-color-border);
    border-top-color: var(--tao-color-accent);
    border-radius: var(--tao-radius-full);
    animation: tao-tree-spin 0.8s linear infinite;
}

@keyframes tao-tree-spin {
    to {
        transform: rotate(360deg);
    }
}

/* the checkbox is drawn, not a TaoCheckbox: a control inside a treeitem would be a second tab stop */
.tao-tree__check {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--tao-indicator-size);
    height: var(--tao-indicator-size);
    box-sizing: border-box;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    background: var(--tao-color-surface-raised);
}

.tao-tree__check--checked,
.tao-tree__check--mixed {
    border-color: var(--tao-color-accent);
    background: var(--tao-color-accent);
}

/* the same marks as TaoCheckbox: a tick when checked, a dash when mixed / те же знаки, что у TaoCheckbox */
.tao-tree__check--checked::after {
    content: '';
    box-sizing: border-box;
    width: 30%;
    height: 58%;
    border: solid var(--tao-color-on-accent);
    border-width: 0 2px 2px 0;
    transform: translateY(-12%) rotate(45deg);
}

.tao-tree__check--mixed::after {
    content: '';
    width: calc(var(--tao-indicator-size) - 8px);
    height: 2px;
    border-radius: 1px;
    background: var(--tao-color-on-accent);
}

.tao-tree__row--disabled .tao-tree__check {
    opacity: 0.5;
}

.tao-tree__icon {
    flex: none;
    display: inline-flex;
    color: var(--tao-color-text-muted);
}

.tao-tree__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* with a hint the label takes its own width and the hint the rest; short of room the hint gives way first
   с подсказкой подпись занимает свою ширину, подсказка — остальное; при нехватке места первой уступает подсказка */
.tao-tree__label:has(+ .tao-tree__hint) {
    flex: 0 1 auto;
}

.tao-tree__hint {
    flex: 1 1000 auto;
    min-width: 0;
    margin-inline-start: var(--tao-space-1);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--_quiet);
}

/* The tone colours the label. On a filled row (hover, selection, menu) the plain text roles fall under 4.5:1 (dark
   danger-text 4.1, text-muted 4.3), so a filled row takes the hover roles and a quiet colour a third of the way to the
   text: every pair stays at 4.5:1 or more in both themes. A disabled row stays disabled.
   Тон красит подпись. На залитой строке (наведение, выбор, меню) обычные роли текста опускаются ниже 4.5:1 (тёмная
   danger-text 4.1, text-muted 4.3), поэтому залитая строка берёт роли наведения и тихий цвет на треть ближе к тексту:
   все пары держат 4.5:1 и больше в обеих темах. Выключенная строка остаётся выключенной. */
.tao-tree__row {
    --_quiet: var(--tao-color-text-muted);
}

.tao-tree__row--muted {
    --_tone: var(--_quiet);
    --_tone-filled: var(--_quiet);
}

.tao-tree__row--accent {
    --_tone: var(--tao-color-accent-text);
    --_tone-filled: var(--tao-color-accent-text-hover);
}

.tao-tree__row--info {
    --_tone: var(--tao-color-info-text);
    --_tone-filled: var(--tao-color-info-text-hover);
}

.tao-tree__row--success {
    --_tone: var(--tao-color-success-text);
    --_tone-filled: var(--tao-color-success-text-hover);
}

.tao-tree__row--warning {
    --_tone: var(--tao-color-warning-text);
    --_tone-filled: var(--tao-color-warning-text-hover);
}

.tao-tree__row--danger {
    --_tone: var(--tao-color-danger-text);
    --_tone-filled: var(--tao-color-danger-text-hover);
}

/* :is() keeps this above the tone classes, whatever their order / :is() ставит это выше классов тона при любом порядке */
.tao-tree__row:is(:hover, .tao-tree__row--selected, .tao-tree__row--menu) {
    --_quiet: color-mix(in srgb, var(--tao-color-text-muted) 65%, var(--tao-color-text));
    --_tone: var(--_tone-filled);
}

.tao-tree__row--toned .tao-tree__label {
    color: var(--_tone);
}

.tao-tree__row--disabled .tao-tree__label,
.tao-tree__row--disabled .tao-tree__hint {
    color: var(--tao-color-text-disabled);
}

.tao-tree__actions {
    flex: none;
    display: inline-flex;
    gap: var(--tao-space-1);
    opacity: 0;
    transition: opacity var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tree__row:hover .tao-tree__actions,
.tao-tree__row:focus-within .tao-tree__actions {
    opacity: 1;
}

/* a finger has no hover: keep the actions visible / у пальца нет наведения: действия видны всегда */
@media (hover: none) {
    .tao-tree__actions {
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-tree__toggle {
        transition: none;
    }

    .tao-tree__spinner {
        animation-duration: 2.4s;
    }
}
</style>
