import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoTree from '../src/components/TaoTree.vue';
import { checkState, checkUnits, toggleCheck, visibleRows, type TaoTreeNode } from '../src/tree';

const nodes: TaoTreeNode[] = [
    {
        id: 'src',
        label: 'src',
        children: [
            { id: 'app', label: 'App.vue' },
            { id: 'lib', label: 'lib', children: [{ id: 'a', label: 'a.ts' }, { id: 'b', label: 'b.ts' }] },
        ],
    },
    { id: 'docs', label: 'docs', hasChildren: true },
    { id: 'readme', label: 'README.md' },
    { id: 'lock', label: 'package-lock.json', disabled: true },
];
const own = (node: TaoTreeNode) => node.children;

describe('tree data', () => {
    it('visible rows: roots, then the children of the expanded nodes, depth first, with level and position', () => {
        const rows = visibleRows(nodes, new Set(['src', 'lib']), own);
        expect(rows.map((r) => `${r.node.id}:${r.level}`)).toEqual(['src:1', 'app:2', 'lib:2', 'a:3', 'b:3', 'docs:1', 'readme:1', 'lock:1']);
        expect(rows[2]).toMatchObject({ parentId: 'src', posinset: 2, setsize: 2, branch: true, expanded: true });
        expect(rows.find((r) => r.node.id === 'docs')).toMatchObject({ branch: true, expanded: false });
        expect(rows.find((r) => r.node.id === 'readme')!.branch).toBe(false);
    });

    it('a collapsed parent hides its whole branch', () => {
        expect(visibleRows(nodes, new Set(['lib']), own).map((r) => r.node.id)).toEqual(['src', 'docs', 'readme', 'lock']);
    });

    it('checks: units are the nodes without children; a parent is checked, unchecked or mixed by them', () => {
        const src = nodes[0]!;
        expect(checkUnits(src, own)).toEqual(['app', 'a', 'b']);
        expect(checkState(src, new Set(), own)).toBe('unchecked');
        expect(checkState(src, new Set(['a']), own)).toBe('mixed');
        expect(checkState(src, new Set(['app', 'a', 'b']), own)).toBe('checked');
    });

    it('toggling a parent checks all its units, or unchecks them when it was fully checked', () => {
        const lib = nodes[0]!.children![1]!;
        expect([...toggleCheck(lib, new Set(['a']), own)].sort()).toEqual(['a', 'b']);
        expect([...toggleCheck(lib, new Set(['a', 'b', 'app']), own)]).toEqual(['app']);
    });

    it('a disabled leaf is not a unit: the parent can be fully checked without it', () => {
        const parent: TaoTreeNode = { id: 'p', label: 'p', children: [{ id: 'x', label: 'x' }, { id: 'y', label: 'y', disabled: true }] };
        expect(checkUnits(parent, own)).toEqual(['x']);
        expect(checkState(parent, new Set(['x']), own)).toBe('checked');
    });
});

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

function tree(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    const w = mount(TaoTree, { props: { nodes, ...props }, slots: slots as never, attachTo: document.body });
    wrappers.push(w);
    return w;
}
const items = (w: VueWrapper) => w.findAll('[role="treeitem"]');
const ids = (w: VueWrapper) => items(w).map((i) => i.text());
const key = async (el: Element, name: string) => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    await nextTick();
    await nextTick();
};

describe('TaoTree', () => {
    it('is an ARIA tree with levels, positions and expanded states', () => {
        const w = tree({ expanded: ['src'] });
        expect(w.attributes('role')).toBe('tree');
        expect(w.attributes('aria-label')).toBe('Tree');
        const src = items(w)[0]!;
        expect(src.attributes()).toMatchObject({ 'aria-level': '1', 'aria-posinset': '1', 'aria-setsize': '4', 'aria-expanded': 'true' });
        expect(items(w)[1]!.attributes('aria-level')).toBe('2');
        expect(items(w)[1]!.attributes('aria-expanded')).toBeUndefined();
        expect(w.find('[aria-disabled="true"]').text()).toBe('package-lock.json');
    });

    it('is one tab stop', () => {
        const w = tree();
        expect(items(w).map((i) => i.attributes('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    });

    it('keeps its own expanded state without v-model, and reports it', async () => {
        const w = tree();
        await w.find('.tao-tree__toggle').trigger('click');
        expect(ids(w)).toEqual(['src', 'App.vue', 'lib', 'docs', 'README.md', 'package-lock.json']);
        expect(w.emitted('update:expanded')).toEqual([[['src']]]);
    });

    it('↓ / ↑ walk the visible rows without wrapping; Home / End jump', async () => {
        const w = tree({ expanded: ['src'] });
        (items(w)[0]!.element as HTMLElement).focus();
        await key(items(w)[0]!.element, 'ArrowDown');
        expect(document.activeElement).toBe(items(w)[1]!.element);
        await key(document.activeElement!, 'End');
        expect(document.activeElement).toBe(items(w)[5]!.element);
        await key(document.activeElement!, 'ArrowDown');
        expect(document.activeElement).toBe(items(w)[5]!.element);
        await key(document.activeElement!, 'Home');
        expect(document.activeElement).toBe(items(w)[0]!.element);
    });

    it('→ opens a closed branch, then goes to its first child; ← closes, then goes to the parent', async () => {
        const w = tree();
        const src = () => items(w)[0]!.element;
        await key(src(), 'ArrowRight');
        expect(w.emitted('update:expanded')!.at(-1)).toEqual([['src']]);
        await w.setProps({ expanded: ['src'] });
        await key(src(), 'ArrowRight');
        expect(document.activeElement).toBe(items(w)[1]!.element);
        await key(document.activeElement!, 'ArrowLeft');
        expect(document.activeElement).toBe(src());
        await key(src(), 'ArrowLeft');
        expect(w.emitted('update:expanded')!.at(-1)).toEqual([[]]);
    });

    it('closing a branch with the focus inside moves the focus to the branch', async () => {
        const w = tree();
        await w.find('.tao-tree__toggle').trigger('click');
        (items(w)[1]!.element as HTMLElement).focus();
        await items(w)[1]!.trigger('focus');
        await w.find('.tao-tree__toggle').trigger('click');
        await nextTick();
        expect(document.activeElement).toBe(items(w)[0]!.element);
    });

    it('* opens every sibling branch', async () => {
        const w = tree({ load: async () => [{ id: 'guide', label: 'guide.md' }] });
        await key(items(w)[0]!.element, '*');
        await new Promise((r) => setTimeout(r));
        await nextTick();
        expect(ids(w)).toContain('App.vue');
        expect(ids(w)).toContain('guide.md');
    });

    it('type-ahead jumps to a row by its first letters', async () => {
        const w = tree();
        await key(items(w)[0]!.element, 'r');
        expect(document.activeElement).toBe(items(w)[2]!.element);
    });

    it('single selection: a click or Enter selects, aria-selected follows, select is emitted', async () => {
        const w = tree();
        await items(w)[2]!.trigger('click');
        expect(w.emitted('update:selected')).toEqual([['readme']]);
        expect(w.emitted('select')![0]![0]).toMatchObject({ id: 'readme' });
        expect(items(w)[2]!.attributes('aria-selected')).toBe('true');
        await key(items(w)[0]!.element, 'Enter');
        expect(w.emitted('update:selected')!.at(-1)).toEqual(['src']);
    });

    it('multiple selection toggles membership; disabled nodes are not selected', async () => {
        const w = tree({ selection: 'multiple', selected: ['src'] });
        expect(w.attributes('aria-multiselectable')).toBe('true');
        await items(w)[2]!.trigger('click');
        expect(w.emitted('update:selected')!.at(-1)).toEqual([['src', 'readme']]);
        await items(w)[3]!.trigger('click');
        expect(w.emitted('update:selected')).toHaveLength(1);
    });

    it('selection none: no aria-selected, a click on a branch toggles it', async () => {
        const w = tree({ selection: 'none' });
        expect(items(w)[0]!.attributes('aria-selected')).toBeUndefined();
        await items(w)[0]!.trigger('click');
        expect(w.emitted('update:expanded')).toEqual([[['src']]]);
        expect(w.emitted('select')).toBeUndefined();
    });

    it('checkable: aria-checked with mixed parents; Space and the box toggle a whole branch', async () => {
        const w = tree({ checkable: true, expanded: ['src', 'lib'], checked: ['a'] });
        const byText = (text: string) => items(w).find((i) => i.text() === text)!;
        expect(byText('src').attributes('aria-checked')).toBe('mixed');
        expect(byText('lib').attributes('aria-checked')).toBe('mixed');
        expect(byText('a.ts').attributes('aria-checked')).toBe('true');
        expect(byText('lib').find('.tao-tree__check--mixed').exists()).toBe(true);
        await key(byText('lib').element, ' ');
        expect(w.emitted('update:checked')!.at(-1)).toEqual([['a', 'b']]);
        await byText('src').find('.tao-tree__check').trigger('click');
        expect([...(w.emitted('update:checked')!.at(-1)![0] as string[])].sort()).toEqual(['a', 'app', 'b']);
        expect(w.emitted('select')).toBeUndefined();
    });

    it('lazy children: a spinner while loading, then the rows; a checked lazy node hands its check to them', async () => {
        let resolve!: (list: TaoTreeNode[]) => void;
        const load = vi.fn(() => new Promise<TaoTreeNode[]>((r) => (resolve = r)));
        const w = tree({ load, checkable: true, checked: ['docs'] });
        const docs = () => items(w)[1]!;
        await docs().find('.tao-tree__toggle').trigger('click');
        expect(load).toHaveBeenCalledWith(expect.objectContaining({ id: 'docs' }));
        expect(docs().attributes('aria-busy')).toBe('true');
        expect(docs().find('.tao-tree__spinner').exists()).toBe(true);
        resolve([{ id: 'guide', label: 'guide.md' }, { id: 'api', label: 'api.md' }]);
        await new Promise((r) => setTimeout(r));
        await nextTick();
        expect(ids(w)).toContain('guide.md');
        expect(w.emitted('update:checked')!.at(-1)).toEqual([['guide', 'api']]);
        expect(docs().attributes('aria-busy')).toBeUndefined();
    });

    it('a failed load reports load-error and leaves the node closed', async () => {
        const w = tree({ load: () => Promise.reject(new Error('offline')) });
        await items(w)[1]!.find('.tao-tree__toggle').trigger('click');
        await new Promise((r) => setTimeout(r));
        await nextTick();
        expect(w.emitted('load-error')![0]![1]).toBeInstanceOf(Error);
        expect(items(w)[1]!.attributes('aria-expanded')).toBe('false');
    });

    it('slots: icon, label and actions get the node; Space inside actions is left to them', async () => {
        const action = vi.fn();
        const w = tree(
            {},
            {
                label: ({ node, level }: { node: TaoTreeNode; level: number }) => `${node.label}@${level}`,
                actions: ({ node }: { node: TaoTreeNode }) => h('button', { class: 'act', onClick: () => action(node.id) }, 'x'),
            },
        );
        expect(items(w)[0]!.find('.tao-tree__label').text()).toBe('src@1');
        await items(w)[2]!.find('.act').trigger('click');
        expect(action).toHaveBeenCalledWith('readme');
        expect(w.emitted('update:selected')).toBeUndefined();
    });

    it('size and ariaLabel', () => {
        const w = tree({ size: 'small', ariaLabel: 'Files' });
        expect(w.classes()).toContain('tao-size-small');
        expect(w.attributes('aria-label')).toBe('Files');
    });
});
