import type { TaoMenuItem } from './menu';

/**
 * One node of TaoTree: a file, a folder, an object. A plain data tree; the tree never changes it.
 * Один узел TaoTree: файл, папка, объект. Простое дерево данных; TaoTree его не меняет.
 */
export interface TaoTreeNode {
    id: string;
    label: string;
    /** Icon name for TaoIcon. / Имя иконки для TaoIcon. */
    icon?: string;
    children?: TaoTreeNode[];
    /**
     * It has children that are not here yet: the tree calls `load(node)` when it opens.
     * У узла есть дети, которых ещё нет: дерево зовёт `load(node)` при раскрытии.
     */
    hasChildren?: boolean;
    disabled?: boolean;
    /**
     * A quiet note after the label: «library root», «3 files», a branch name. It is part of the row's accessible name.
     * Тихая подпись после имени: «library root», «3 файла», имя ветки. Входит в доступное имя строки.
     */
    hint?: string;
    /**
     * The colour of the label: `muted` for an excluded or ignored node, the others for a state (added, changed, broken).
     * Not the only sign of a state for a screen reader: say it in `hint` or the label too.
     * Цвет подписи: `muted` для исключённого или игнорируемого узла, остальные для состояния (добавлен, изменён, сломан).
     * Для скринридера это не единственный признак: скажите о состоянии и в `hint` или подписи.
     */
    tone?: TaoTreeTone;
}

/** The colour of a row's label. / Цвет подписи строки. */
export type TaoTreeTone = 'muted' | 'accent' | 'info' | 'success' | 'warning' | 'danger';

/** `none` — nothing to select, `single` — one node, `multiple` — a set. / Режим выбора. */
export type TaoTreeSelection = 'none' | 'single' | 'multiple';

/**
 * The context menu of a row: a list for every row, or a function of the node and the ids the menu acts on (the selection
 * after the right click, see `menuSelection`). An empty list leaves the browser's own menu.
 * Контекстное меню строки: один список для всех строк или функция от узла и id, на которые действует меню (выбор после
 * правого клика, см. `menuSelection`). Пустой список оставляет меню браузера.
 */
export type TaoTreeMenu = TaoMenuItem[] | ((node: TaoTreeNode, selected: string[]) => TaoMenuItem[]);

/**
 * What a right click (or the Menu key) on a node does to the selection, as file managers and IDEs do: a node outside the
 * selection becomes the only selected one; a node inside it keeps the whole selection, so the menu acts on all of it.
 * Returns the new value, or undefined when the selection stays (no selection mode, a disabled node, already selected).
 * Что правый клик (или клавиша Menu) по узлу делает с выбором, как в файловых менеджерах и IDE: узел вне выбора становится
 * единственным выбранным; узел внутри выбора оставляет его целиком, и меню действует на всё выбранное.
 * Возвращает новое значение или undefined, если выбор не меняется (режим none, узел выключен, уже выбран).
 */
export function menuSelection(
    mode: TaoTreeSelection,
    selected: ReadonlySet<string>,
    node: Pick<TaoTreeNode, 'id' | 'disabled'>,
): string | string[] | undefined {
    if (mode === 'none' || node.disabled || selected.has(node.id)) {
        return undefined;
    }
    return mode === 'single' ? node.id : [node.id];
}

/** The state of a checkbox: `mixed` is a parent with only some of its leaves checked. / Состояние чекбокса. */
export type TaoTreeCheckState = 'checked' | 'unchecked' | 'mixed';

/** A visible row of the tree: the node and where it stands. / Видимая строка дерева: узел и его место. */
export interface TaoTreeRow {
    node: TaoTreeNode;
    level: number;
    parentId: string | null;
    /** 1-based position among its siblings and their count (aria-posinset / aria-setsize). */
    posinset: number;
    setsize: number;
    /** It has children (loaded or still to load). / Есть дети (загруженные или ещё нет). */
    branch: boolean;
    expanded: boolean;
}

/** Children of a node: its own, or the ones loaded for it. / Дети узла: свои или подгруженные. */
export type TaoTreeChildren = (node: TaoTreeNode) => readonly TaoTreeNode[] | undefined;

/**
 * The rows a reader sees: the roots and the children of every expanded node, depth first.
 * An id is unique in the whole tree: a node whose id is already one of its ancestors' is a leaf, so a wrong `load` cannot loop.
 * Строки, которые видны: корни и дети каждого раскрытого узла, в глубину.
 * Id уникален во всём дереве: узел с id одного из своих предков остаётся листом, так что неверный `load` не зациклит дерево.
 */
export function visibleRows(nodes: readonly TaoTreeNode[], expanded: ReadonlySet<string>, children: TaoTreeChildren): TaoTreeRow[] {
    const rows: TaoTreeRow[] = [];
    const ancestors = new Set<string>();
    const walk = (list: readonly TaoTreeNode[], level: number, parentId: string | null) => {
        list.forEach((node, index) => {
            const repeated = ancestors.has(node.id);
            const own = repeated ? undefined : children(node);
            const branch = !repeated && (Boolean(own?.length) || (Boolean(node.hasChildren) && own === undefined));
            const open = branch && expanded.has(node.id);
            rows.push({ node, level, parentId, posinset: index + 1, setsize: list.length, branch, expanded: open });
            if (open && own) {
                ancestors.add(node.id);
                walk(own, level + 1, node.id);
                ancestors.delete(node.id);
            }
        });
    };
    walk(nodes, 1, null);
    return rows;
}

/**
 * The checkable units under a node: the nodes without (loaded) children. A leaf is its own unit.
 * Отмечаемые единицы под узлом: узлы без (загруженных) детей. Лист — сам себе единица.
 */
export function checkUnits(node: TaoTreeNode, children: TaoTreeChildren, ancestors: ReadonlySet<string> = new Set()): string[] {
    const own = ancestors.has(node.id) ? undefined : children(node);
    if (!own?.length) {
        return node.disabled ? [] : [node.id];
    }
    const path = new Set(ancestors).add(node.id);
    return own.flatMap((child) => checkUnits(child, children, path));
}

/**
 * A parent is checked when all its units are, mixed when some are. The model holds units only.
 * Родитель отмечен, когда отмечены все его единицы, и mixed, когда часть. В модели только единицы.
 */
export function checkState(node: TaoTreeNode, checked: ReadonlySet<string>, children: TaoTreeChildren): TaoTreeCheckState {
    const units = checkUnits(node, children);
    if (!units.length) {
        return checked.has(node.id) ? 'checked' : 'unchecked';
    }
    const count = units.filter((id) => checked.has(id)).length;
    return count === 0 ? 'unchecked' : count === units.length ? 'checked' : 'mixed';
}

/**
 * Toggling a node checks every unit under it, or unchecks them all when it was fully checked.
 * Переключение узла отмечает все единицы под ним или снимает все, если он был отмечен целиком.
 */
export function toggleCheck(node: TaoTreeNode, checked: ReadonlySet<string>, children: TaoTreeChildren): Set<string> {
    const next = new Set(checked);
    const units = checkUnits(node, children);
    const on = checkState(node, checked, children) !== 'checked';
    for (const id of units) {
        if (on) {
            next.add(id);
        } else {
            next.delete(id);
        }
    }
    return next;
}

// ---------- moving rows / перенос строк ----------

/** How a drop meets the row it is aimed at. / Как перенос встаёт относительно строки. */
export type TaoTreeDropPosition = 'before' | 'after' | 'inside';

/**
 * A move the tree asks the app to make (`@move`). The tree never changes `nodes`: the app moves the data (or sends it to a
 * server), and the tree shows the result. `index` is the place among the children of `parentId` once the moved nodes
 * are taken out of it, so `moveTreeNodes` (or a `splice`) can use it as it is.
 * Перенос, который дерево просит сделать приложение (`@move`). Дерево не меняет `nodes`: данные переносит приложение (или
 * отправляет на сервер), а дерево показывает результат. `index` — место среди детей `parentId`, когда переносимые узлы
 * из них уже вынуты, поэтому `moveTreeNodes` (или `splice`) берёт его как есть.
 */
export interface TaoTreeMove {
    /** The moved nodes, the topmost only (a child goes with its parent), in the order of the rows. / Переносимые узлы. */
    ids: string[];
    /** The new parent; null for the top level. / Новый родитель; null — верхний уровень. */
    parentId: string | null;
    index: number;
    /** The row the drop was aimed at, and how. / Строка, на которую целились, и как. */
    targetId: string;
    position: TaoTreeDropPosition;
    /** Ctrl or Alt was held (or Ctrl+C was used): the app puts copies with new ids. / Копия, а не перенос. */
    copy: boolean;
}

/** Where a drop goes and where its mark is drawn. / Куда встаёт перенос и где рисуется его метка. */
export interface TaoTreeDrop {
    parentId: string | null;
    index: number;
    targetId: string;
    position: TaoTreeDropPosition;
    /** The row the mark is drawn on, the side, and the level the line starts at. / Строка метки, сторона и уровень линии. */
    mark: { rowId: string; side: TaoTreeDropPosition; level: number };
}

/** Can the node hold children: it has a list (an empty one too) or children still to load. / Может ли узел держать детей. */
export function isTreeContainer(node: TaoTreeNode): boolean {
    return Array.isArray(node.children) || Boolean(node.hasChildren);
}

/**
 * The order of the rows: `none` keeps the order of the data (and rows can be dragged between each other), `name` puts
 * folders first and sorts by name as people read it («file 2» before «file 10»), a function is your own compare. With a
 * sort the order is the tree's, so a drag only changes the folder, never the place among siblings.
 * Порядок строк: `none` держит порядок данных (и строки можно ставить между другими), `name` ставит папки первыми и
 * сортирует по имени так, как читают люди («файл 2» раньше «файл 10»), функция — своё сравнение. С сортировкой порядок
 * задаёт дерево, поэтому перенос меняет только папку, а не место среди соседей.
 */
export type TaoTreeSort = 'none' | 'name' | ((a: TaoTreeNode, b: TaoTreeNode) => number);

/** Folders first, then the labels by `Intl.Collator` with numbers as numbers. / Папки первыми, затем подписи. */
export function compareTreeNodes(locale?: string): (a: TaoTreeNode, b: TaoTreeNode) => number {
    let collator: Intl.Collator;
    try {
        collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    } catch {
        collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    }
    return (a, b) => Number(isTreeContainer(b)) - Number(isTreeContainer(a)) || collator.compare(a.label, b.label);
}

/** One level of nodes in the order of `sort`: a sorted copy, or the list itself for `none`. / Один уровень в порядке sort. */
export function sortTreeNodes(list: readonly TaoTreeNode[], sort: TaoTreeSort, locale?: string): readonly TaoTreeNode[] {
    if (sort === 'none') {
        return list;
    }
    return list.slice().sort(sort === 'name' ? compareTreeNodes(locale) : sort);
}

/**
 * Keeps the topmost of the ids: a node whose ancestor is in the list goes with that ancestor. `parentOf` knows every node,
 * not only the visible ones. / Оставляет верхние: узел, чей предок в списке, едет вместе с ним.
 */
export function topmostIds(ids: readonly string[], parentOf: (id: string) => string | null | undefined): string[] {
    const set = new Set(ids);
    return ids.filter((id) => {
        for (let p = parentOf(id); p != null; p = parentOf(p)) {
            if (set.has(p)) {
                return false;
            }
        }
        return true;
    });
}

export interface TaoTreeDropInput {
    rows: readonly TaoTreeRow[];
    /** The row under the pointer (or the keyboard target). / Строка под указателем. */
    over: number;
    /** Where on it, 0 at the top to 1 at the bottom. / Где на ней: 0 сверху, 1 снизу. */
    fraction: number;
    /**
     * The level the pointer's x stands at: below the last row of a branch a smaller level puts the drop after an ancestor,
     * so a node can be taken out of a folder. / Уровень по x указателя: под последней строкой ветки меньший уровень ставит
     * перенос после предка, так узел можно вынуть из папки.
     */
    level?: number;
    /** The dragged nodes, topmost, in the order of the rows. / Переносимые узлы. */
    dragged: readonly string[];
    /** The ids of the children of a node (null: the roots), known or loaded. / id детей узла. */
    childIds: (parentId: string | null) => readonly string[] | undefined;
    parentOf: (id: string) => string | null | undefined;
    /**
     * The tree keeps a sort: only the folder changes. A folder takes the rows, any other row hands them to its own folder.
     * Дерево держит сортировку: меняется только папка. Папка принимает строки, любая другая строка отдаёт их своей папке.
     */
    sorted?: boolean;
}

/**
 * Where rows dragged over a row land. A folder takes its top quarter as «before», the bottom quarter as «after» and the
 * middle as «inside» (at the end); a leaf splits in halves. «After» an open folder is its first child. Null where they
 * cannot go: onto themselves or into their own descendants, or where nothing would change.
 * Куда встают строки, которые тащат над строкой. У папки верхняя четверть — «перед», нижняя — «после», середина — «внутрь»
 * (в конец); у листа — половины. «После» раскрытой папки — её первый ребёнок. Null, куда нельзя: на самих себя или в
 * своих потомков, и туда, где ничего не изменится.
 */
export function dropTarget(input: TaoTreeDropInput): TaoTreeDrop | null {
    const { rows, fraction, dragged, childIds, parentOf } = input;
    const hovered = rows[input.over];
    if (!hovered) {
        return null;
    }
    const moving = new Set(dragged);
    for (let p: string | null | undefined = hovered.node.id; p != null; p = parentOf(p)) {
        if (moving.has(p)) {
            return null;
        }
    }
    const container = isTreeContainer(hovered.node) && !hovered.node.disabled;
    if (input.sorted) {
        // no place among siblings to pick: the folder of the row, or the row itself when it is one
        // места среди соседей не выбрать: папка строки или сама строка, если она папка
        const parentId = container ? hovered.node.id : hovered.parentId;
        const now = childIds(parentId) ?? [];
        if (dragged.every((id) => now.includes(id))) {
            return null; // already there: a sort would put them back where they are / уже там
        }
        const parentRow = parentId === null ? undefined : rows.find((row) => row.node.id === parentId);
        return {
            parentId,
            index: now.filter((id) => !moving.has(id)).length,
            targetId: hovered.node.id,
            position: 'inside',
            // the top level has no row: the mark is the whole tree (an empty rowId) / у верхнего уровня нет строки
            mark: { rowId: parentRow ? parentId! : '', side: 'inside', level: parentRow?.level ?? 0 },
        };
    }
    let position: TaoTreeDropPosition = container
        ? fraction < 0.25
            ? 'before'
            : fraction > 0.75
              ? 'after'
              : 'inside'
        : fraction < 0.5
          ? 'before'
          : 'after';
    const rest = (parentId: string | null) => (childIds(parentId) ?? []).filter((id) => !moving.has(id));

    let drop: TaoTreeDrop;
    if (position === 'after' && hovered.expanded && (childIds(hovered.node.id)?.length ?? 0) > 0) {
        // below an open folder is the start of its children / под раскрытой папкой — начало её детей
        position = 'inside';
        drop = {
            parentId: hovered.node.id,
            index: 0,
            targetId: hovered.node.id,
            position,
            mark: { rowId: hovered.node.id, side: 'after', level: hovered.level + 1 },
        };
    } else if (position === 'inside') {
        drop = {
            parentId: hovered.node.id,
            index: rest(hovered.node.id).length,
            targetId: hovered.node.id,
            position,
            mark: { rowId: hovered.node.id, side: 'inside', level: hovered.level },
        };
    } else {
        let target = hovered;
        if (position === 'after' && input.level !== undefined) {
            // out of the branches the row is the last of, as far as the pointer went left
            // из веток, последней строкой которых она стоит, насколько указатель ушёл влево
            while (target.level > input.level && target.posinset === target.setsize && target.parentId !== null) {
                const parent = rows.find((row) => row.node.id === target.parentId);
                if (!parent) {
                    break;
                }
                target = parent;
            }
        }
        const siblings = rest(target.parentId);
        const at = siblings.indexOf(target.node.id);
        drop = {
            parentId: target.parentId,
            index: position === 'before' ? at : at + 1,
            targetId: target.node.id,
            position,
            mark: { rowId: hovered.node.id, side: position, level: target.level },
        };
    }

    // nothing would change: the nodes are already there, in that order / ничего не изменится
    const now = childIds(drop.parentId) ?? [];
    if (dragged.every((id) => now.includes(id))) {
        const others = now.filter((id) => !moving.has(id));
        const after = [...others.slice(0, drop.index), ...dragged, ...others.slice(drop.index)];
        if (after.length === now.length && after.every((id, i) => id === now[i])) {
            return null;
        }
    }
    return drop;
}

/**
 * The tree with a move made, for an app that keeps its data as `TaoTreeNode[]`: a new array, the nodes it passes
 * through copied, the others kept. A copy (`move.copy`) needs new ids, so it is the app's to make; this helper moves.
 * Children loaded by `load` are not in `nodes`: such an app moves them in its own store.
 * Дерево с выполненным переносом, для приложения, которое хранит данные как `TaoTreeNode[]`: новый массив, узлы по пути
 * скопированы, остальные те же. Копии (`move.copy`) нужны новые id, их делает приложение; помощник переносит.
 * Дети, подгруженные через `load`, не лежат в `nodes`: такое приложение переносит их в своём хранилище.
 */
export function moveTreeNodes(nodes: readonly TaoTreeNode[], move: Pick<TaoTreeMove, 'ids' | 'parentId' | 'index'>): TaoTreeNode[] {
    const moving = new Set(move.ids);
    const taken = new Map<string, TaoTreeNode>();
    const strip = (list: readonly TaoTreeNode[]): TaoTreeNode[] =>
        list
            .filter((node) => {
                if (moving.has(node.id)) {
                    taken.set(node.id, node);
                    return false;
                }
                return true;
            })
            .map((node) => (node.children ? { ...node, children: strip(node.children) } : node));
    const stripped = strip(nodes);
    const items = move.ids.map((id) => taken.get(id)).filter((node): node is TaoTreeNode => Boolean(node));
    const insert = (list: readonly TaoTreeNode[]) => {
        const next = list.slice();
        next.splice(Math.max(0, Math.min(move.index, next.length)), 0, ...items);
        return next;
    };
    if (move.parentId === null) {
        return insert(stripped);
    }
    const put = (list: readonly TaoTreeNode[]): TaoTreeNode[] =>
        list.map((node) =>
            node.id === move.parentId ? { ...node, children: insert(node.children ?? []) } : node.children ? { ...node, children: put(node.children) } : node,
        );
    return put(stripped);
}
