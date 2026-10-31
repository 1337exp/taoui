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
}

/** `none` — nothing to select, `single` — one node, `multiple` — a set. / Режим выбора. */
export type TaoTreeSelection = 'none' | 'single' | 'multiple';

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
export type TaoTreeChildren = (node: TaoTreeNode) => TaoTreeNode[] | undefined;

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
