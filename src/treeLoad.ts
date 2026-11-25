import { shallowReactive, watch, type WatchSource } from 'vue';
import type { TaoTreeNode, TaoTreeRow } from './tree';

/**
 * Lazy children of TaoTree: a node with `hasChildren` and no `children` asks `load` for them once it opens. The tree keeps what
 * came back (`loaded`) and which nodes are loading now (`loading`); the rest of the tree reads them through `raw`.
 * Ленивые дети TaoTree: узел с `hasChildren` без `children` просит их у `load`, когда раскрывается. Дерево держит то, что пришло
 * (`loaded`), и какие узлы грузятся сейчас (`loading`); остальное дерево читает их через `raw`.
 */
export interface TreeLoadOptions {
    /** The loader of the app; no loader, no lazy nodes. / Загрузчик приложения; без него ленивых узлов нет. */
    load: () => ((node: TaoTreeNode) => Promise<TaoTreeNode[]>) | undefined;
    expanded: () => ReadonlySet<string>;
    setExpanded: (ids: Set<string>) => void;
    checked: () => ReadonlySet<string>;
    setChecked: (ids: Set<string>) => void;
    /** The children of a node in the order they stand (own or loaded). / Дети узла в том порядке, в каком стоят (свои или подгруженные). */
    children: (node: TaoTreeNode) => readonly TaoTreeNode[] | undefined;
    /** `load` failed. / `load` упал. */
    failed: (node: TaoTreeNode, error: unknown) => void;
}

export function useTreeLoad(o: TreeLoadOptions) {
    const loaded = shallowReactive(new Map<string, TaoTreeNode[]>());
    const loading = shallowReactive(new Set<string>());
    const raw = (node: TaoTreeNode) => node.children ?? loaded.get(node.id);

    /** Loads the children of a lazy node; false when `load` failed (reported through `failed`). / Подгружает детей. */
    async function loadChildren(node: TaoTreeNode): Promise<boolean> {
        loading.add(node.id);
        try {
            const list = await o.load()!(node);
            loaded.set(node.id, list);
            // a checked lazy node hands its check to the children it turned out to have
            // отмеченный ленивый узел передаёт отметку детям, которые у него оказались
            if (o.checked().has(node.id) && list.length) {
                const next = new Set(o.checked());
                next.delete(node.id);
                list.filter((child) => !child.disabled).forEach((child) => next.add(child.id));
                o.setChecked(next);
            }
            return true;
        } catch (error) {
            o.failed(node, error);
            return false;
        } finally {
            loading.delete(node.id);
        }
    }

    /** Opens a branch row, loading its children first when they are not here yet. / Раскрывает ветку, при нужде сначала подгрузив детей. */
    async function expand(row: TaoTreeRow) {
        const { node } = row;
        if (!row.branch || row.expanded || loading.has(node.id)) {
            return;
        }
        if (o.children(node) === undefined && node.hasChildren) {
            if (!o.load() || !(await loadChildren(node))) {
                return;
            }
        }
        o.setExpanded(new Set([...o.expanded(), node.id]));
    }

    /** Children loaded for a folder a move touched are stale: load them again if it is open. / Дети, подгруженные папке, которой коснулся перенос, устарели: если она открыта, грузим заново. */
    async function reload(node: TaoTreeNode | undefined) {
        if (!node || node.children || !loaded.has(node.id)) {
            return;
        }
        loaded.delete(node.id);
        const load = o.load();
        if (!o.expanded().has(node.id) || !load) {
            return;
        }
        loading.add(node.id);
        try {
            loaded.set(node.id, await load(node));
        } catch (error) {
            o.failed(node, error);
        } finally {
            loading.delete(node.id);
        }
    }

    // An `expanded` that came from outside (a saved view, the app) can hold lazy folders whose children are not loaded yet:
    // they are loaded here, the visible ones first; their own open children show up as rows and are loaded in turn, so a
    // saved chain (node_modules / vue / dist) opens level by level. A folder whose load fails is closed again.
    // `expanded`, пришедший снаружи (сохранённый вид, приложение), может держать ленивые папки без загруженных детей: они
    // подгружаются здесь, видимые; их раскрытые дети появляются строками и подгружаются следом, так сохранённая цепочка
    // (node_modules / vue / dist) раскрывается уровень за уровнем. Папка, у которой загрузка упала, снова закрывается.
    function watchRows(rows: WatchSource<readonly TaoTreeRow[]>) {
        watch(
            rows,
            (list) => {
                if (!o.load()) {
                    return;
                }
                for (const row of list) {
                    const { node } = row;
                    if (row.expanded && node.hasChildren && raw(node) === undefined && !loading.has(node.id)) {
                        void loadChildren(node).then((ok) => {
                            if (!ok && o.expanded().has(node.id)) {
                                const next = new Set(o.expanded());
                                next.delete(node.id);
                                o.setExpanded(next);
                            }
                        });
                    }
                }
            },
            { immediate: true },
        );
    }

    return { loading, raw, expand, reload, watchRows };
}
