import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoTree from '../src/components/TaoTree.vue';
// @ts-expect-error Vite `?raw` import: the component as text, to read its styles
import css from '../src/components/TaoTree.vue?raw';
import {
    checkState,
    checkUnits,
    dropTarget,
    menuSelection,
    moveTreeNodes,
    sortTreeNodes,
    toggleCheck,
    topmostIds,
    visibleRows,
    type TaoTreeNode,
} from '../src/tree';

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

    it('a load that hands back the id of an ancestor does not loop: that node stays a leaf', () => {
        // the demo bug of 5.17.0: `load` ignored the node and answered with the same ids at every level
        // ошибка демо до 5.17.1: `load` не смотрел на узел и на каждом уровне отвечал одними и теми же id
        const vue: TaoTreeNode = { id: 'vue', label: 'vue', hasChildren: true };
        const loaded = new Map<string, TaoTreeNode[]>([['vue', [vue]]]);
        const loadedChildren = (node: TaoTreeNode) => node.children ?? loaded.get(node.id);
        const rows = visibleRows([vue], new Set(['vue']), loadedChildren);
        expect(rows.map((r) => `${r.node.id}:${r.level}`)).toEqual(['vue:1', 'vue:2']);
        expect(rows[1]).toMatchObject({ branch: false, expanded: false });
        expect(checkUnits(vue, loadedChildren)).toEqual(['vue']);
    });
});

describe('moving rows: the pure part', () => {
    const parents = new Map<string, string | null>();
    const kids = new Map<string | null, string[]>();
    const index = (list: TaoTreeNode[], parent: string | null) => {
        kids.set(parent, list.map((n) => n.id));
        list.forEach((n) => {
            parents.set(n.id, parent);
            if (n.children) index(n.children, n.id);
        });
    };
    index(nodes, null);
    const childIds = (id: string | null) => kids.get(id);
    const parentOf = (id: string) => parents.get(id);
    const rows = visibleRows(nodes, new Set(['src', 'lib']), own); // src app lib a b docs readme lock
    const at = (id: string) => rows.findIndex((r) => r.node.id === id);
    const drop = (over: string, fraction: number, dragged: string[], level?: number) =>
        dropTarget({ rows, over: at(over), fraction, level, dragged, childIds, parentOf });

    it('topmostIds: a child goes with its parent', () => {
        expect(topmostIds(['a', 'lib', 'readme'], parentOf)).toEqual(['lib', 'readme']);
    });

    it('a leaf splits in halves: before / after, the index among the siblings without the moved ones', () => {
        expect(drop('readme', 0.2, ['a'])).toMatchObject({ parentId: null, index: 2, position: 'before', targetId: 'readme' });
        expect(drop('readme', 0.8, ['a'])).toMatchObject({ parentId: null, index: 3, position: 'after' });
        // moving a root down: it is taken out first, so readme is at 1, after it is 2
        expect(drop('readme', 0.8, ['src'])).toMatchObject({ parentId: null, index: 2 });
    });

    it('a folder: the top quarter before, the middle inside at the end, the bottom quarter after (a closed one)', () => {
        expect(drop('docs', 0.1, ['app'])).toMatchObject({ position: 'before', parentId: null, index: 1 });
        expect(drop('docs', 0.5, ['app'])).toMatchObject({ position: 'inside', parentId: 'docs', index: 0, mark: { side: 'inside' } });
        expect(drop('docs', 0.9, ['app'])).toMatchObject({ position: 'after', parentId: null, index: 2 });
        expect(drop('lib', 0.5, ['readme'])).toMatchObject({ position: 'inside', parentId: 'lib', index: 2 });
    });

    it('below an open folder is its first child, the mark one level in', () => {
        expect(drop('lib', 0.9, ['readme'])).toMatchObject({ position: 'inside', parentId: 'lib', index: 0, mark: { rowId: 'lib', side: 'after', level: 3 } });
    });

    it('after the last row of a branch, the pointer level takes the drop out of it', () => {
        expect(drop('b', 0.9, ['readme'])).toMatchObject({ parentId: 'lib', index: 2 });
        expect(drop('b', 0.9, ['readme'], 2)).toMatchObject({ parentId: 'src', index: 2, targetId: 'lib', mark: { rowId: 'b', level: 2 } });
        expect(drop('b', 0.9, ['readme'], 1)).toMatchObject({ parentId: null, index: 1, targetId: 'src', mark: { level: 1 } });
        // a, not the last of lib, keeps its level / a не последняя в lib и остаётся на своём уровне
        expect(drop('a', 0.9, ['readme'], 1)).toMatchObject({ parentId: 'lib', index: 1 });
    });

    it('not onto itself, not into its own descendants, not where nothing changes; a disabled folder is a leaf', () => {
        expect(drop('lib', 0.5, ['lib'])).toBeNull();
        expect(drop('a', 0.5, ['src'])).toBeNull();
        expect(drop('app', 0.9, ['lib'])).toBeNull(); // lib is already right after app
        expect(drop('app', 0.2, ['lib'])).toMatchObject({ parentId: 'src', index: 0 });
        expect(drop('src', 0.5, ['readme'])).toMatchObject({ position: 'inside' });
        const locked: TaoTreeNode = { id: 'box', label: 'box', children: [], disabled: true };
        const r = visibleRows([locked], new Set(), own);
        expect(dropTarget({ rows: r, over: 0, fraction: 0.5, dragged: ['x'], childIds: () => [], parentOf: () => null })!.position).toBe('after');
    });

    it('sortTreeNodes: none keeps the data, name puts folders first and reads numbers as numbers', () => {
        const list: TaoTreeNode[] = [
            { id: '10', label: 'file 10' },
            { id: 'b', label: 'beta', children: [] },
            { id: '2', label: 'File 2' },
            { id: 'a', label: 'Alpha', hasChildren: true },
        ];
        expect(sortTreeNodes(list, 'none')).toBe(list);
        expect(sortTreeNodes(list, 'name', 'en').map((n) => n.id)).toEqual(['a', 'b', '2', '10']);
        // your own compare as it is: a plain descending localeCompare, «File 2» after «file 10»
        expect(sortTreeNodes(list, (x, y) => y.label.localeCompare(x.label)).map((n) => n.id)).toEqual(['2', '10', 'b', 'a']);
        expect(list[0]!.id).toBe('10'); // the input is left alone
    });

    it('sorted: only the folder changes — a folder takes the rows, a leaf hands them to its folder, the top level has no row', () => {
        const sorted = (over: string, fraction: number, dragged: string[]) =>
            dropTarget({ rows, over: at(over), fraction, dragged, childIds, parentOf, sorted: true });
        expect(sorted('lib', 0.05, ['readme'])).toMatchObject({ parentId: 'lib', position: 'inside', index: 2, mark: { rowId: 'lib', side: 'inside' } });
        expect(sorted('a', 0.05, ['readme'])).toMatchObject({ parentId: 'lib', targetId: 'a', mark: { rowId: 'lib' } });
        expect(sorted('readme', 0.5, ['a'])).toMatchObject({ parentId: null, mark: { rowId: '', level: 0 } });
        // the same folder: a sort would put it back, so nothing to do / та же папка: сортировка вернёт на место
        expect(sorted('b', 0.9, ['a'])).toBeNull();
        expect(sorted('app', 0.1, ['lib'])).toBeNull();
    });

    it('moveTreeNodes: takes the nodes out, puts them at the index of the new parent, leaves the input alone', () => {
        const moved = moveTreeNodes(nodes, { ids: ['a', 'readme'], parentId: 'src', index: 0 });
        expect(moved.map((n) => n.id)).toEqual(['src', 'docs', 'lock']);
        expect(moved[0]!.children!.map((n) => n.id)).toEqual(['a', 'readme', 'app', 'lib']);
        expect(moved[0]!.children![3]!.children!.map((n) => n.id)).toEqual(['b']);
        expect(nodes[0]!.children!.map((n) => n.id)).toEqual(['app', 'lib']);
        expect(moveTreeNodes(nodes, { ids: ['app'], parentId: null, index: 99 }).map((n) => n.id)).toEqual(['src', 'docs', 'readme', 'lock', 'app']);
        expect(moveTreeNodes(nodes, { ids: ['readme'], parentId: 'docs', index: 0 })[1]!.children!.map((n) => n.id)).toEqual(['readme']);
    });
});

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

function tree(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    const w = mount(TaoTree, { props: { items: nodes, ...props }, slots: slots as never, attachTo: document.body });
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

    it('a saved expanded with lazy folders: they load by themselves, level by level, and the chain opens', async () => {
        // the view an app saved: docs and its lazy child api open / вид, который сохранило приложение
        const load = vi.fn(async (node: TaoTreeNode) =>
            node.id === 'docs' ? [{ id: 'api', label: 'api', hasChildren: true }] : [{ id: 'ref', label: 'ref.md' }],
        );
        const w = tree({ load, expanded: ['docs', 'api'] });
        expect(load).toHaveBeenCalledWith(expect.objectContaining({ id: 'docs' }));
        for (let i = 0; i < 4; i++) {
            await new Promise((r) => setTimeout(r));
            await nextTick();
        }
        expect(load.mock.calls.map(([n]) => n.id)).toEqual(['docs', 'api']);
        expect(ids(w)).toEqual(['src', 'docs', 'api', 'ref.md', 'README.md', 'package-lock.json']);
        expect(w.emitted('update:expanded')).toBeUndefined(); // the saved view is not touched / сохранённый вид не трогается
    });

    it('a saved lazy folder whose load fails is closed again, with load-error, and not loaded in a loop', async () => {
        const load = vi.fn(() => Promise.reject(new Error('gone')));
        const w = tree({ load, expanded: ['docs'] });
        await new Promise((r) => setTimeout(r));
        await nextTick();
        expect(w.emitted('load-error')).toHaveLength(1);
        expect(w.emitted('update:expanded')!.at(-1)).toEqual([[]]);
        await w.setProps({ expanded: [] });
        await new Promise((r) => setTimeout(r));
        expect(load).toHaveBeenCalledTimes(1);
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

    it('a single click selects; a double click opens a branch or emits open for a leaf; Enter does the same after it selects', async () => {
        const w = tree();
        await items(w)[0]!.trigger('click');
        expect(w.emitted('update:expanded')).toBeUndefined();
        await items(w)[0]!.trigger('dblclick');
        expect(w.emitted('update:expanded')).toEqual([[['src']]]);
        const byText = (text: string) => items(w).find((i) => i.text() === text)!;
        await byText('README.md').trigger('dblclick');
        expect(w.emitted('open')![0]![0]).toMatchObject({ id: 'readme' });
        await key(byText('README.md').element, 'Enter');
        expect(w.emitted('open')).toHaveLength(2);
        expect(w.emitted('update:selected')!.at(-1)).toEqual(['readme']);
        await byText('package-lock.json').trigger('dblclick'); // disabled
        expect(w.emitted('open')).toHaveLength(2);
    });

    it('a double click on the chevron or the box is not a second toggle of the row', async () => {
        const w = tree({ checkable: true });
        const toggle = items(w)[0]!.find('.tao-tree__toggle');
        await toggle.trigger('click');
        await toggle.trigger('click');
        await toggle.trigger('dblclick');
        expect(w.emitted('update:expanded')).toEqual([[['src']], [[]]]);
    });

    it('multiple selection: the two clicks of a double click do not leave the row unselected', async () => {
        const w = tree({ selection: 'multiple' });
        const row = items(w)[2]!;
        await row.trigger('click');
        await w.setProps({ selected: ['readme'] });
        await row.trigger('click');
        await w.setProps({ selected: [] });
        await row.trigger('dblclick');
        expect(w.emitted('update:selected')!.at(-1)).toEqual([['readme']]);
        expect(w.emitted('open')).toHaveLength(1);
    });

    it('selection none: a double click on a branch is not a third toggle; a leaf opens', async () => {
        const w = tree({ selection: 'none' });
        await items(w)[0]!.trigger('click');
        await items(w)[0]!.trigger('dblclick');
        expect(w.emitted('update:expanded')).toEqual([[['src']]]);
        await items(w).find((i) => i.text() === 'README.md')!.trigger('dblclick');
        expect(w.emitted('open')![0]![0]).toMatchObject({ id: 'readme' });
    });

    it('hint: a quiet note after the label, part of the row text; tone: a class on the row', () => {
        const w = tree({
            items: [
                { id: 'nm', label: 'node_modules', hint: 'library root', tone: 'muted' },
                { id: 'x', label: 'x.ts', tone: 'danger' },
            ],
        });
        // a hidden comma between them: the row reads «node_modules, library root», not one word
        expect(items(w)[0]!.text()).toBe('node_modules, library root');
        expect(items(w)[0]!.classes()).toContain('tao-tree__row--muted');
        expect(items(w)[1]!.find('.tao-tree__hint').exists()).toBe(false);
        expect(items(w)[1]!.classes()).toContain('tao-tree__row--danger');
    });

    it('size and ariaLabel', () => {
        const w = tree({ size: 'small', ariaLabel: 'Files' });
        expect(w.classes()).toContain('tao-size-small');
        expect(w.attributes('aria-label')).toBe('Files');
    });
});

describe('TaoTree look', () => {
    it('the selection is a tint only: no rule of a selected row sets the colour of its text or icon', () => {
        // the accent of the text is left to what the app marks on purpose (tone): a walk through the tree must not shine
        // акцент текста оставлен тому, что приложение отмечает нарочно (tone): прогулка по дереву не должна светиться
        const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].filter(([, selector]) => /--selected/.test(selector!));
        expect(rules.length).toBeGreaterThan(0);
        expect(rules.filter(([, , body]) => /(^|;|\s)color\s*:/.test(body!)).map(([s]) => s.trim())).toEqual([]);
    });
});

describe('TaoTree moving rows', () => {
    // happy-dom has no layout: every row is 24px tall, one under another, the chevron 16px wide
    // у happy-dom нет раскладки: строка 24px высотой, одна под другой, стрелка 16px шириной
    const ROW = 24;
    let restore: (() => void) | undefined;
    function layout() {
        const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
            const row = this.closest('[role="treeitem"]') as HTMLElement | null;
            const all = [...document.querySelectorAll('[role="treeitem"]')];
            const i = row ? all.indexOf(row) : 0;
            const width = this.classList.contains('tao-tree__toggle') ? 16 : 300;
            return { top: i * ROW, bottom: (i + 1) * ROW, left: 0, right: width, width, height: ROW, x: 0, y: i * ROW, toJSON: () => ({}) } as DOMRect;
        });
        restore = () => spy.mockRestore();
    }
    afterEach(() => {
        restore?.();
        restore = undefined;
        vi.useRealTimers();
    });
    const pointer = (type: string, target: EventTarget, x: number, y: number, extra: PointerEventInit = {}) => {
        target.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, button: 0, pointerId: 1, pointerType: 'mouse', bubbles: true, cancelable: true, ...extra }));
    };
    const row = (w: VueWrapper, label: string) => items(w).find((i) => i.find('.tao-tree__label').text() === label)!.element;
    const y = (w: VueWrapper, label: string, fraction: number) => items(w).findIndex((i) => i.find('.tao-tree__label').text() === label) * ROW + fraction * ROW;
    async function drag(w: VueWrapper, from: string, to: string, fraction: number, extra: PointerEventInit = {}) {
        pointer('pointerdown', row(w, from), 200, y(w, from, 0.5));
        pointer('pointermove', document, 200, y(w, from, 0.5) + 10, extra);
        pointer('pointermove', document, 200, y(w, to, fraction), extra);
        await nextTick();
    }
    const moveTree = (props: Record<string, unknown> = {}) => {
        layout();
        return tree({ expanded: ['src', 'lib'], ...props });
    };

    it('a row dropped in the middle of a folder goes inside it, at the end; the click after the drop is not a pick', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove });
        await drag(w, 'README.md', 'lib', 0.5);
        expect(row(w, 'lib').classList).toContain('tao-tree__row--drop-inside');
        expect(row(w, 'README.md').classList).toContain('tao-tree__row--dragged');
        expect(document.querySelector('.tao-tree__ghost')?.textContent).toBe('README.md');
        pointer('pointerup', document, 200, y(w, 'lib', 0.5));
        row(w, 'lib').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await nextTick();
        expect(onMove).toHaveBeenCalledWith({ ids: ['readme'], parentId: 'lib', index: 2, targetId: 'lib', position: 'inside', copy: false });
        expect(w.emitted('update:selected')).toBeUndefined();
        expect(document.querySelector('.tao-tree__ghost')).toBeNull();
        expect(w.find('.tao-tree__row--drop-inside').exists()).toBe(false);
    });

    it('a press that hardly moves is a click, not a drag', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove });
        pointer('pointerdown', row(w, 'README.md'), 200, 150);
        pointer('pointermove', document, 202, 152);
        pointer('pointerup', document, 202, 152);
        await row(w, 'README.md').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(onMove).not.toHaveBeenCalled();
        expect(w.emitted('update:selected')).toEqual([['readme']]);
    });

    it('a selected row takes the whole selection with it (the topmost only); Ctrl makes it a copy', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove, selection: 'multiple', selected: ['a', 'lib', 'readme'] });
        await drag(w, 'README.md', 'docs', 0.1, { ctrlKey: true });
        expect(document.querySelector('.tao-tree__ghost')?.textContent).toBe('+2 items');
        pointer('pointerup', document, 200, y(w, 'docs', 0.1), { ctrlKey: true });
        expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ ids: ['lib', 'readme'], parentId: null, index: 1, position: 'before', copy: true }));
    });

    it('Escape cancels a drag', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove });
        await drag(w, 'README.md', 'lib', 0.5);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        pointer('pointerup', document, 200, y(w, 'lib', 0.5));
        expect(onMove).not.toHaveBeenCalled();
        await nextTick();
        expect(w.find('.tao-tree__row--dragged').exists()).toBe(false);
    });

    it('canDrop false: no mark, a «no» cursor, nothing is moved', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove, canDrop: () => false });
        await drag(w, 'README.md', 'lib', 0.5);
        expect(w.classes()).toContain('tao-tree--refused');
        expect(w.find('.tao-tree__row--drop-inside').exists()).toBe(false);
        pointer('pointerup', document, 200, y(w, 'lib', 0.5));
        expect(onMove).not.toHaveBeenCalled();
    });

    it('a promise: the rows wait (aria-busy) and cannot be dragged again; a rejected one comes as move-error', async () => {
        let reject!: (error: Error) => void;
        const onMove = vi.fn(() => new Promise((_, r) => (reject = r)));
        const w = moveTree({ onMove });
        await drag(w, 'README.md', 'lib', 0.5);
        pointer('pointerup', document, 200, y(w, 'lib', 0.5));
        await nextTick();
        expect(row(w, 'README.md').getAttribute('aria-busy')).toBe('true');
        expect(row(w, 'README.md').classList).toContain('tao-tree__row--pending');
        await drag(w, 'README.md', 'docs', 0.1);
        pointer('pointerup', document, 200, y(w, 'docs', 0.1));
        expect(onMove).toHaveBeenCalledTimes(1);
        reject(new Error('offline'));
        await new Promise((r) => setTimeout(r));
        await nextTick();
        expect(w.emitted('move-error')![0]![1]).toBeInstanceOf(Error);
        expect(row(w, 'README.md').getAttribute('aria-busy')).toBeNull();
    });

    it('a closed folder under the pointer opens after a moment, a lazy one loads', async () => {
        vi.useFakeTimers();
        const load = vi.fn(async () => [{ id: 'guide', label: 'guide.md' }]);
        const w = moveTree({ onMove: vi.fn(), load });
        await drag(w, 'README.md', 'docs', 0.5);
        expect(load).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(700);
        expect(load).toHaveBeenCalled();
        expect(w.emitted('update:expanded')!.at(-1)![0]).toContain('docs');
        pointer('pointerup', document, 0, 0);
    });

    it('the keyboard: Ctrl+X on a row, Ctrl+V on a folder moves it to its end, said in the live region; Escape forgets the cut', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove });
        await key(row(w, 'README.md'), 'x'); // without Ctrl: type-ahead, nothing cut
        row(w, 'README.md').dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true, cancelable: true }));
        await flushAll();
        expect(row(w, 'README.md').classList).toContain('tao-tree__row--cut');
        expect(document.querySelector('[role="status"]')?.textContent).toContain('README.md cut');
        row(w, 'lib').dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }));
        await flushAll();
        expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ ids: ['readme'], parentId: 'lib', index: 2, position: 'inside' }));
        expect(document.querySelector('[role="status"]')?.textContent).toBe('README.md moved to lib.');
        row(w, 'App.vue').dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true }));
        await key(row(w, 'App.vue'), 'Escape');
        expect(document.querySelector('[role="status"]')?.textContent).toBe('Move canceled.');
        row(w, 'README.md').dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }));
        expect(onMove).toHaveBeenCalledTimes(1);
    });

    it('Ctrl+V on a leaf puts the rows after it; a place they cannot go is said, not done', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove });
        row(w, 'src').dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true, cancelable: true }));
        row(w, 'a.ts').dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }));
        await flushAll();
        expect(onMove).not.toHaveBeenCalled();
        expect(document.querySelector('[role="status"]')?.textContent).toContain('cannot go');
        row(w, 'README.md').dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true }));
        expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ ids: ['src'], parentId: null, index: 2, position: 'after' }));
    });

    it('sort="name": the rows stand folders first by name; a drag between rows goes into their folder, no line', async () => {
        const onMove = vi.fn();
        const w = moveTree({ onMove, sort: 'name' });
        expect(items(w).map((i) => i.find('.tao-tree__label').text())).toEqual(['docs', 'src', 'lib', 'a.ts', 'b.ts', 'App.vue', 'package-lock.json', 'README.md']);
        expect(nodes.map((n) => n.id)).toEqual(['src', 'docs', 'readme', 'lock']); // the data is not touched
        await drag(w, 'README.md', 'a.ts', 0.1);
        expect(w.find('.tao-tree__row--drop-before').exists()).toBe(false);
        expect(row(w, 'lib').classList).toContain('tao-tree__row--drop-inside');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await drag(w, 'a.ts', 'README.md', 0.9);
        expect(w.classes()).toContain('tao-tree--drop-root');
        pointer('pointerup', document, 200, y(w, 'README.md', 0.9));
        expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ ids: ['a'], parentId: null, position: 'inside' }));
    });

    it('without @move nothing drags and Ctrl+X is left alone', async () => {
        const w = moveTree();
        await drag(w, 'README.md', 'lib', 0.5);
        expect(document.querySelector('.tao-tree__ghost')).toBeNull();
        const event = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true, bubbles: true, cancelable: true });
        row(w, 'README.md').dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
        pointer('pointerup', document, 0, 0);
    });
});

const flushAll = async () => {
    await nextTick();
    await nextTick();
};

describe('TaoTree context menu', () => {
    const flush = async () => {
        await nextTick();
        await nextTick();
        await nextTick();
    };
    const rightClick = async (el: Element, x = 120, y = 40) => {
        const event = new MouseEvent('contextmenu', { clientX: x, clientY: y, bubbles: true, cancelable: true });
        el.dispatchEvent(event);
        await flush();
        return event;
    };
    const menuItems = () => [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    const menuFor = () => vi.fn((node: TaoTreeNode, selected: string[]) => [
        { id: 'rename', label: `Rename ${node.label}` },
        { id: 'delete', label: `Delete ${selected.length}` },
    ]);

    it('menuSelection: a node outside the selection becomes the selection; inside it, the selection stays', () => {
        expect(menuSelection('single', new Set(['a']), { id: 'b' })).toBe('b');
        expect(menuSelection('multiple', new Set(['a']), { id: 'b' })).toEqual(['b']);
        expect(menuSelection('multiple', new Set(['a', 'b']), { id: 'b' })).toBeUndefined();
        expect(menuSelection('none', new Set(), { id: 'b' })).toBeUndefined();
        expect(menuSelection('single', new Set(), { id: 'b', disabled: true })).toBeUndefined();
    });

    it('a right click on a row opens the menu built for it, selects the row without a select event, prevents the default', async () => {
        const menu = menuFor();
        const w = tree({ menu, selected: 'src' });
        const event = await rightClick(items(w)[2]!.element);
        expect(event.defaultPrevented).toBe(true);
        expect(menu).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }), ['readme']);
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Rename README.md', 'Delete 1']);
        expect(w.emitted('update:selected')).toEqual([['readme']]);
        expect(w.emitted('select')).toBeUndefined();
        expect(w.emitted('menu')![0]![0]).toMatchObject({ id: 'readme' });
        expect(w.classes()).toContain('tao-tree--menu-open');
        menuItems()[1]!.click();
        await flush();
        expect(w.emitted('menu-select')![0]).toEqual(['delete', expect.objectContaining({ id: 'readme' }), ['readme']]);
    });

    it('a right click inside a multiple selection keeps it, and the menu acts on all of it', async () => {
        const menu = menuFor();
        const w = tree({ menu, selection: 'multiple', selected: ['src', 'readme'] });
        await rightClick(items(w)[2]!.element);
        expect(menu).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }), ['src', 'readme']);
        expect(w.emitted('update:selected')).toBeUndefined();
        expect(menuItems()[1]!.textContent?.trim()).toBe('Delete 2');
    });

    it('Shift+F10 and the Menu key open it from the keyboard; the contextmenu the browser sends after is not a second request', async () => {
        const w = tree({ menu: [{ id: 'open', label: 'Open' }] });
        const row = items(w)[0]!.element;
        (row as HTMLElement).focus();
        await key(row, 'F10'); // no Shift: nothing
        expect(menuItems()).toHaveLength(0);
        row.dispatchEvent(new KeyboardEvent('keydown', { key: 'F10', shiftKey: true, bubbles: true, cancelable: true }));
        await flush();
        expect(menuItems().map((i) => i.textContent?.trim())).toEqual(['Open']);
        const after = await rightClick(row, 0, 0);
        expect(after.defaultPrevented).toBe(true);
        expect(w.emitted('menu')).toHaveLength(1);
    });

    it('without menu, or with an empty list, the browser keeps its own menu; the menu event still comes', async () => {
        const plain = tree();
        const event = await rightClick(items(plain)[0]!.element);
        expect(event.defaultPrevented).toBe(false);
        expect(plain.emitted('menu')![0]![0]).toMatchObject({ id: 'src' });
        const empty = tree({ menu: () => [] });
        expect((await rightClick(items(empty)[0]!.element)).defaultPrevented).toBe(false);
        expect(empty.emitted('update:selected')).toBeUndefined();
    });

    it('a menu handler that prevents the default takes the request: no menu of ours', async () => {
        const w = mount(TaoTree, {
            props: { items: nodes, menu: [{ id: 'open', label: 'Open' }], onMenu: (_node: TaoTreeNode, e: Event) => e.preventDefault() },
            attachTo: document.body,
        });
        wrappers.push(w);
        await rightClick(items(w)[0]!.element);
        expect(menuItems()).toHaveLength(0);
    });
});
