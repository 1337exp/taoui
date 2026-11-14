import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import TaoToolbar from '../src/components/TaoToolbar.vue';
import TaoToolbarGroup from '../src/components/TaoToolbarGroup.vue';
import TaoToolbarSeparator from '../src/components/TaoToolbarSeparator.vue';
import { planOverflow } from '../src/toolbar';

// 5.31: `overflow` keeps a toolbar in one row; the groups that do not fit go under a «⋮» button, the same elements, not copies.
// happy-dom has no layout, so the widths are read from attributes: `data-cw` on the bar is the width it has, `data-w` on a group is its own.
// 5.31: `overflow` держит панель в одной строке; группы, которые не влезли, уходят под «⋮», те же элементы, а не копии.
// В happy-dom нет вёрстки, поэтому ширины читаются из атрибутов: `data-cw` у панели — её ширина, `data-w` у группы — своя.

describe('planOverflow', () => {
    const group = (width: number, pinned = false) => ({ kind: 'group' as const, width, pinned });
    const sep = { kind: 'separator' as const, width: 1 };

    it('leaves everything when it fits', () => {
        expect(planOverflow([group(100), sep, group(100)], 300, 4, 36).size).toBe(0);
    });

    it('folds from the last group, with the separator before it, until the rest and the button fit', () => {
        const entries = [group(100), sep, group(100), sep, group(100)];
        // 100+1+100+1+100 + 4 gaps = 318 > 260; without the last: 100+1+100 + 2 gaps + 4 + 36 = 249
        expect([...planOverflow(entries, 260, 4, 36)].sort()).toEqual([3, 4]);
        // not enough for two groups and the button: the second goes too
        expect([...planOverflow(entries, 150, 4, 36)].sort()).toEqual([1, 2, 3, 4]);
    });

    it('never folds a pinned group or a loose item, even when they do not fit alone', () => {
        const entries = [group(100, true), sep, { kind: 'loose' as const, width: 200 }, sep, group(100)];
        expect([...planOverflow(entries, 50, 4, 36)].sort()).toEqual([3, 4]);
    });
});

class FakeResizeObserver {
    static all: FakeResizeObserver[] = [];
    constructor(public callback: () => void) {
        FakeResizeObserver.all.push(this);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

function fireResize() {
    for (const observer of FakeResizeObserver.all) {
        observer.callback();
    }
}

const widthOf = (el: Element) => Number(el.getAttribute('data-w') ?? 0);

let restore: (() => void)[] = [];

beforeEach(() => {
    FakeResizeObserver.all = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const rect = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const width = widthOf(this);
        return { width, height: 36, top: 0, left: 0, right: width, bottom: 36, x: 0, y: 0, toJSON: () => ({}) };
    });
    const client = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get(this: Element) {
            return Number(this.getAttribute('data-cw') ?? 0);
        },
    });
    restore = [
        () => rect.mockRestore(),
        () => (client ? Object.defineProperty(HTMLElement.prototype, 'clientWidth', client) : delete (HTMLElement.prototype as never as Record<string, unknown>).clientWidth),
    ];
});

afterEach(() => {
    restore.forEach((fn) => fn());
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
});

async function settle() {
    for (let i = 0; i < 4; i += 1) {
        await nextTick();
    }
}

interface Options {
    width: number;
    overflow?: boolean;
    orientation?: 'horizontal' | 'vertical';
    pinnedFirst?: boolean;
    onClick?: () => void;
    overflowLabel?: string;
}

/** Three groups of 100 (the first may be pinned), separators between, in a bar `width` wide; the «⋮» button counts as 36. */
function bar(options: Options) {
    const toolbar = ref<{ reveal: <T extends HTMLElement>(el: T) => Promise<T> } | null>(null);
    const w = mount(
        {
            render: () =>
                h(
                    TaoToolbar,
                    {
                        ref: toolbar,
                        'data-cw': options.width,
                        label: 'Tools',
                        overflow: options.overflow ?? true,
                        orientation: options.orientation ?? 'horizontal',
                        overflowLabel: options.overflowLabel,
                    },
                    () => [
                        h(TaoToolbarGroup, { label: 'A', 'data-w': 100, pinned: options.pinnedFirst ?? false }, () => h('button', { id: 'a1' }, 'a')),
                        h(TaoToolbarSeparator),
                        h(TaoToolbarGroup, { label: 'B', 'data-w': 100 }, () => h('button', { id: 'b1' }, 'b')),
                        h(TaoToolbarSeparator),
                        h(TaoToolbarGroup, { label: 'C', 'data-w': 100 }, () => h('button', { id: 'c1', onClick: options.onClick }, 'c')),
                    ],
                ),
        },
        { attachTo: document.body },
    );
    return { w, toolbar };
}

const root = () => document.querySelector('[role="toolbar"].tao-toolbar') as HTMLElement;
const more = () => root().querySelector('.tao-toolbar__more') as HTMLElement;
const moreShown = () => !more().hasAttribute('data-tao-away');
const menu = () => document.body.querySelector('.tao-toolbar__menu') as HTMLElement | null;
const awayHosts = () => root().querySelectorAll('.tao-toolbar-host[data-tao-away]').length;
const button = (id: string) => document.getElementById(id) as HTMLElement;
const inRow = (id: string) => root().contains(button(id)) && !button(id).closest('[data-tao-away]');

describe('TaoToolbar overflow: a bar that shrinks to its content', () => {
    /** The bar is only as wide as it is now (`data-cw`) but may grow to its `max-width`. */
    function shrinking(cw: number, maxWidth?: string) {
        const w = mount(
            {
                render: () =>
                    h(
                        TaoToolbar,
                        { 'data-cw': cw, label: 'Tools', overflow: true, style: maxWidth ? `max-width: ${maxWidth}` : undefined },
                        () => [
                            h(TaoToolbarGroup, { label: 'A', 'data-w': 100 }, () => h('button', { id: 'a1' }, 'a')),
                            h(TaoToolbarSeparator),
                            h(TaoToolbarGroup, { label: 'B', 'data-w': 100 }, () => h('button', { id: 'b1' }, 'b')),
                            h(TaoToolbarSeparator),
                            h(TaoToolbarGroup, { label: 'C', 'data-w': 100 }, () => h('button', { id: 'c1' }, 'c')),
                        ],
                    ),
            },
            { attachTo: document.body },
        );
        return w;
    }

    it('takes the room from max-width, not from its current (narrow) width: nothing folds when everything fits the limit', async () => {
        const w = shrinking(120, '400px');
        await settle();
        expect(awayHosts()).toBe(0);
        expect(moreShown()).toBe(false);
        w.unmount();
    });

    it('still folds what does not fit the max-width', async () => {
        const w = shrinking(120, '250px');
        await settle();
        expect(moreShown()).toBe(true);
        expect(inRow('a1') && inRow('b1')).toBe(true);
        expect(inRow('c1')).toBe(false);
        w.unmount();
    });

    it('a bar without max-width keeps using the width it has (as before)', async () => {
        const w = shrinking(250);
        await settle();
        expect(moreShown()).toBe(true);
        expect(inRow('c1')).toBe(false);
        w.unmount();
    });

    it('does not collapse step by step: the same room gives the same answer after a re-measure', async () => {
        const w = shrinking(120, '250px');
        await settle();
        const first = awayHosts();
        fireResize();
        await settle();
        fireResize();
        await settle();
        expect(awayHosts()).toBe(first);
        w.unmount();
    });
});

describe('TaoToolbar overflow', () => {
    it('shows no «⋮» and folds nothing when everything fits', async () => {
        const { w } = bar({ width: 400 });
        await settle();
        expect(moreShown()).toBe(false);
        expect(awayHosts()).toBe(0);
        expect(['a1', 'b1', 'c1'].every(inRow)).toBe(true);
        w.unmount();
    });

    it('folds the last group under «⋮» when it does not fit, and shows the button', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        expect(moreShown()).toBe(true);
        expect(inRow('a1') && inRow('b1')).toBe(true);
        expect(inRow('c1')).toBe(false);
        // the separator before the folded group goes with it
        expect(root().querySelectorAll('.tao-toolbar-separator[data-tao-away]').length).toBe(1);
        w.unmount();
    });

    it('is folded in the task of the mount: the first look is already the folded one', async () => {
        const { w } = bar({ width: 250 });
        await nextTick();
        expect(moreShown()).toBe(true);
        expect(inRow('c1')).toBe(false);
        w.unmount();
    });

    it('folds from the right: a narrower bar loses the second group too', async () => {
        const { w } = bar({ width: 150 });
        await settle();
        expect(inRow('a1')).toBe(true);
        expect(inRow('b1')).toBe(false);
        expect(inRow('c1')).toBe(false);
        w.unmount();
    });

    it('a pinned group never goes, even when the bar is too narrow for it', async () => {
        const { w } = bar({ width: 60, pinnedFirst: true });
        await settle();
        expect(inRow('a1')).toBe(true);
        expect(inRow('b1')).toBe(false);
        expect(inRow('c1')).toBe(false);
        expect(moreShown()).toBe(true);
        w.unmount();
    });

    it('follows the width there and back', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        expect(inRow('c1')).toBe(false);
        root().setAttribute('data-cw', '400');
        fireResize();
        await settle();
        expect(inRow('c1')).toBe(true);
        expect(moreShown()).toBe(false);
        root().setAttribute('data-cw', '150');
        fireResize();
        await settle();
        expect(inRow('b1')).toBe(false);
        expect(moreShown()).toBe(true);
        w.unmount();
    });

    it('opens the folded groups in a panel: the same elements, in order, and their handlers work', async () => {
        const onClick = vi.fn();
        const { w } = bar({ width: 150, onClick });
        await settle();
        const b = button('b1');
        const c = button('c1');
        more().querySelector('button')!.click();
        await settle();
        expect(menu()).not.toBeNull();
        expect(menu()!.contains(b) && menu()!.contains(c)).toBe(true);
        // the same elements the app made, in the order they had in the bar
        const order = Array.from(menu()!.querySelectorAll('button')).map((el) => el.id);
        expect(order).toEqual(['b1', 'c1']);
        expect(button('b1')).toBe(b);
        c.click();
        expect(onClick).toHaveBeenCalledTimes(1);
        w.unmount();
    });

    it('«⋮» is a labelled button that says it opens a panel and whether it is open', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        const trigger = more().querySelector('button')!;
        expect(trigger.getAttribute('aria-label')).toBe('More');
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        trigger.click();
        await settle();
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        w.unmount();
    });

    it('takes the name of the button from overflowLabel', async () => {
        const { w } = bar({ width: 250, overflowLabel: 'Ещё' });
        await settle();
        expect(more().querySelector('button')!.getAttribute('aria-label')).toBe('Ещё');
        w.unmount();
    });

    it('Escape closes the panel and gives the focus back to «⋮»', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        const trigger = more().querySelector('button')!;
        trigger.click();
        await settle();
        expect(document.activeElement).toBe(button('c1'));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await settle();
        expect(menu()).toBeNull();
        expect(document.activeElement).toBe(trigger);
        // closed, the group is back in its place, hidden
        expect(inRow('c1')).toBe(false);
        w.unmount();
    });

    it('a press outside closes the panel; a press on what the app marked data-tao-keep-open does not', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        const keep = document.createElement('div');
        keep.setAttribute('data-tao-keep-open', '');
        document.body.appendChild(keep);
        more().querySelector('button')!.click();
        await settle();
        keep.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await settle();
        expect(menu()).not.toBeNull();
        document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        await settle();
        expect(menu()).toBeNull();
        w.unmount();
    });

    it('the focus does not vanish when the button that had it goes into the menu', async () => {
        const { w } = bar({ width: 400 });
        await settle();
        button('c1').focus();
        expect(document.activeElement).toBe(button('c1'));
        root().setAttribute('data-cw', '250');
        fireResize();
        await settle();
        expect(inRow('c1')).toBe(false);
        expect(document.activeElement).toBe(more().querySelector('button'));
        w.unmount();
    });

    it('the arrows walk the visible buttons and «⋮»; a folded group is not a stop', async () => {
        const { w } = bar({ width: 250 });
        await settle();
        button('a1').focus();
        const press = async (target: Element, key: string) => {
            target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
            await nextTick();
        };
        await press(button('a1'), 'ArrowRight');
        expect(document.activeElement).toBe(button('b1'));
        await press(button('b1'), 'ArrowRight');
        expect(document.activeElement).toBe(more().querySelector('button'));
        await press(more().querySelector('button')!, 'ArrowRight');
        expect(document.activeElement).toBe(button('a1'));
        w.unmount();
    });

    it('reveal() opens the menu for a button that went into it and hands back the same element', async () => {
        const { w, toolbar } = bar({ width: 250 });
        await settle();
        const c = button('c1');
        expect(menu()).toBeNull();
        const anchor = await toolbar.value!.reveal(c);
        expect(anchor).toBe(c);
        expect(menu()!.contains(c)).toBe(true);
        // a button that is in the row is returned as it is, the menu stays shut
        const b = button('b1');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
        await settle();
        expect(await toolbar.value!.reveal(b)).toBe(b);
        expect(menu()).toBeNull();
        w.unmount();
    });

    it('a group added later is measured and folded when it does not fit', async () => {
        const extra = ref(false);
        const w = mount(
            {
                render: () =>
                    h(TaoToolbar, { 'data-cw': 250, overflow: true }, () => [
                        h(TaoToolbarGroup, { 'data-w': 100 }, () => h('button', { id: 'a1' }, 'a')),
                        h(TaoToolbarGroup, { 'data-w': 100 }, () => h('button', { id: 'b1' }, 'b')),
                        extra.value ? h(TaoToolbarGroup, { 'data-w': 100 }, () => h('button', { id: 'c1' }, 'c')) : null,
                    ]),
            },
            { attachTo: document.body },
        );
        await settle();
        expect(moreShown()).toBe(false);
        extra.value = true;
        await settle();
        expect(inRow('c1')).toBe(false);
        expect(moreShown()).toBe(true);
        w.unmount();
    });
});

describe('TaoToolbar without overflow', () => {
    it('is the old bar: it wraps, has no «⋮», and the groups are plain', async () => {
        const { w } = bar({ width: 250, overflow: false });
        await settle();
        expect(root().querySelector('.tao-toolbar__more')).toBeNull();
        expect(root().querySelector('.tao-toolbar-host')).toBeNull();
        expect(root().classList.contains('tao-toolbar--overflow')).toBe(false);
        expect(root().querySelectorAll('[role="group"]').length).toBe(3);
        expect(root().querySelectorAll('[data-tao-away]').length).toBe(0);
        w.unmount();
    });

    it('a vertical bar ignores overflow', async () => {
        const { w } = bar({ width: 250, orientation: 'vertical' });
        await settle();
        expect(root().querySelector('.tao-toolbar__more')).toBeNull();
        expect(root().querySelector('.tao-toolbar-host')).toBeNull();
        w.unmount();
    });

    it('a group outside a toolbar still renders as a group', () => {
        const w = mount(TaoToolbarGroup, { props: { label: 'Alone' }, slots: { default: '<button>x</button>' } });
        expect(w.find('[role="group"]').attributes('aria-label')).toBe('Alone');
        w.unmount();
    });
});

describe('TaoToolbar overflow on the server', () => {
    it('draws every group as it is, without errors', async () => {
        const app = createSSRApp({
            render: () =>
                h(TaoToolbar, { overflow: true, label: 'Tools' }, () => [
                    h(TaoToolbarGroup, { label: 'A' }, () => h('button', 'a')),
                    h(TaoToolbarSeparator),
                    h(TaoToolbarGroup, { label: 'B' }, () => h('button', 'b')),
                ]),
        });
        const html = await renderToString(app);
        expect(html).toContain('aria-label="A"');
        expect(html).toContain('aria-label="B"');
        expect(html).not.toContain('role="dialog"');
        expect(html.match(/ data-tao-away/g)?.length ?? 0).toBe(1); // only the «⋮» host, hidden until something is folded
    });
});
