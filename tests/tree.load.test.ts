import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { indexNodes, visibleRows, type TaoTreeNode } from '../src/tree';
import { useTreeLoad } from '../src/treeLoad';

const lazyFolder: TaoTreeNode = { id: 'src', label: 'src', hasChildren: true };
const kids: TaoTreeNode[] = [
    { id: 'a', label: 'a' },
    { id: 'b', label: 'b', disabled: true },
    { id: 'c', label: 'c' },
];

/** The state a tree keeps, as plain refs, so the composable can be driven without a component. */
function setup(load: ((node: TaoTreeNode) => Promise<TaoTreeNode[]>) | undefined, nodes: TaoTreeNode[] = [lazyFolder]) {
    const expanded = ref(new Set<string>());
    const checked = ref(new Set<string>());
    const failed = vi.fn();
    const lazy = useTreeLoad({
        load: () => load,
        expanded: () => expanded.value,
        setExpanded: (ids) => (expanded.value = ids),
        checked: () => checked.value,
        setChecked: (ids) => (checked.value = ids),
        children: (node) => lazy.raw(node),
        failed,
    });
    const rows = () => visibleRows(nodes, expanded.value, (node) => lazy.raw(node));
    return { lazy, expanded, checked, failed, rows };
}

describe('useTreeLoad: expand', () => {
    it('loads the children first, then opens the row', async () => {
        const load = vi.fn(async () => kids);
        const { lazy, expanded, rows } = setup(load);
        const pending = lazy.expand(rows()[0]!);
        expect(lazy.loading.has('src')).toBe(true);
        expect(expanded.value.has('src')).toBe(false);
        await pending;
        expect(load).toHaveBeenCalledTimes(1);
        expect(lazy.loading.has('src')).toBe(false);
        expect(expanded.value.has('src')).toBe(true);
        expect(lazy.raw(lazyFolder)).toEqual(kids);
    });

    it('loads once: the second open uses what came', async () => {
        const load = vi.fn(async () => kids);
        const { lazy, expanded, rows } = setup(load);
        await lazy.expand(rows()[0]!);
        expanded.value = new Set();
        await lazy.expand(rows()[0]!);
        expect(load).toHaveBeenCalledTimes(1);
        expect(expanded.value.has('src')).toBe(true);
    });

    it('a failed load leaves the row closed and tells the app', async () => {
        const error = new Error('no disk');
        const { lazy, expanded, failed, rows } = setup(async () => Promise.reject(error));
        await lazy.expand(rows()[0]!);
        expect(failed).toHaveBeenCalledWith(lazyFolder, error);
        expect(expanded.value.has('src')).toBe(false);
        expect(lazy.loading.has('src')).toBe(false);
    });

    it('a row that is loading is not asked twice', async () => {
        const load = vi.fn(async () => kids);
        const { lazy, rows } = setup(load);
        const row = rows()[0]!;
        void lazy.expand(row);
        await lazy.expand(row);
        expect(load).toHaveBeenCalledTimes(1);
    });

    it('a checked lazy node hands its check to the enabled children it turned out to have', async () => {
        const { lazy, checked, rows } = setup(async () => kids);
        checked.value = new Set(['src']);
        await lazy.expand(rows()[0]!);
        expect([...checked.value].sort()).toEqual(['a', 'c']);
    });
});

describe('useTreeLoad: reload', () => {
    it('drops the children of a closed folder, so the next open asks again', async () => {
        const load = vi.fn(async () => kids);
        const { lazy, expanded, rows } = setup(load);
        await lazy.expand(rows()[0]!);
        expanded.value = new Set();
        await lazy.reload(lazyFolder);
        expect(lazy.raw(lazyFolder)).toBeUndefined();
        await lazy.expand(rows()[0]!);
        expect(load).toHaveBeenCalledTimes(2);
    });

    it('asks again at once for an open folder', async () => {
        const fresh: TaoTreeNode[] = [{ id: 'z', label: 'z' }];
        const load = vi.fn<(node: TaoTreeNode) => Promise<TaoTreeNode[]>>().mockResolvedValueOnce(kids).mockResolvedValueOnce(fresh);
        const { lazy, rows } = setup(load);
        await lazy.expand(rows()[0]!);
        await lazy.reload(lazyFolder);
        expect(lazy.raw(lazyFolder)).toEqual(fresh);
    });

    it('does not touch a folder that has its own children, or one never loaded', async () => {
        const load = vi.fn(async () => kids);
        const { lazy } = setup(load);
        await lazy.reload({ id: 'own', label: 'own', children: [] });
        await lazy.reload(lazyFolder);
        await lazy.reload(undefined);
        expect(load).not.toHaveBeenCalled();
    });
});

describe('useTreeLoad: an expanded that came from outside', () => {
    it('loads the lazy folders it holds open, level by level', async () => {
        const deep: TaoTreeNode = { id: 'deep', label: 'deep', hasChildren: true };
        const load = vi.fn(async (node: TaoTreeNode) => (node.id === 'src' ? [deep] : kids));
        const { lazy, expanded, rows } = setup(load);
        const list = ref(rows());
        expanded.value = new Set(['src', 'deep']);
        list.value = rows();
        lazy.watchRows(list);
        await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(1));
        list.value = rows();
        await vi.waitFor(() => expect(load).toHaveBeenCalledTimes(2));
        expect(load.mock.calls.map(([node]) => node.id)).toEqual(['src', 'deep']);
    });

    it('closes the folder again when its load fails', async () => {
        const { lazy, expanded, failed, rows } = setup(async () => Promise.reject(new Error('x')));
        expanded.value = new Set(['src']);
        lazy.watchRows(() => rows());
        await vi.waitFor(() => expect(expanded.value.has('src')).toBe(false));
        expect(failed).toHaveBeenCalledTimes(1);
        await nextTick();
    });

    it('does nothing without a loader', () => {
        const { lazy, expanded, rows } = setup(undefined);
        expanded.value = new Set(['src']);
        expect(() => lazy.watchRows(() => rows())).not.toThrow();
        expect(expanded.value.has('src')).toBe(true);
    });
});

describe('indexNodes', () => {
    const tree: TaoTreeNode[] = [
        { id: 'a', label: 'a', children: [{ id: 'a1', label: 'a1' }, { id: 'a2', label: 'a2', children: [{ id: 'a2x', label: 'a2x' }] }] },
        { id: 'b', label: 'b' },
    ];
    const index = indexNodes(tree, (node) => node.children);

    it('knows the parent, the children in order and the node of every id, closed branches included', () => {
        expect(index.parent.get('a')).toBeNull();
        expect(index.parent.get('a2x')).toBe('a2');
        expect(index.kids.get(null)).toEqual(['a', 'b']);
        expect(index.kids.get('a')).toEqual(['a1', 'a2']);
        expect(index.byId.get('a2x')?.label).toBe('a2x');
    });

    it('takes a repeated id for a leaf: the first one wins', () => {
        const twice = indexNodes(
            [
                { id: 'x', label: 'first', children: [{ id: 'x', label: 'inner' }] },
            ],
            (node) => node.children,
        );
        expect(twice.byId.get('x')?.label).toBe('first');
        expect(twice.parent.get('x')).toBeNull();
    });
});
