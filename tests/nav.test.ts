import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';
import TaoNav from '../src/components/TaoNav.vue';
import type { TaoNavItem } from '../src/nav';
// @ts-expect-error Vite `?raw` import: the component source as text
import navSource from '../src/components/TaoNav.vue?raw';

const wrappers: VueWrapper[] = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
});

const items: TaoNavItem[] = [
    { id: 'home', label: 'Home', icon: 'tao-circle' },
    { id: 'search', label: 'Search', icon: 'tao-search', badge: 3 },
    { id: 'inbox', label: 'Inbox', href: '/inbox', badge: true },
    { id: 'lab', label: 'Lab', disabled: true },
];
const many: TaoNavItem[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => ({ id, label: id.toUpperCase() }));

function nav(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
    const w = mount(TaoNav, { props: { items, ...props }, slots, attachTo: document.body });
    wrappers.push(w);
    return w;
}
const entries = (w: VueWrapper) => w.findAll('.tao-nav__entry:not(.tao-nav__entry--more) .tao-nav__item');
const menus = () => [...document.body.querySelectorAll<HTMLElement>('[role="menu"]')];

describe('TaoNav', () => {
    it('is a named navigation landmark with a list of buttons and links', () => {
        const w = nav();
        expect(w.find('nav').attributes('aria-label')).toBe('Navigation');
        expect(w.findAll('nav li')).toHaveLength(4);
        expect(entries(w).map((e) => e.element.tagName)).toEqual(['BUTTON', 'BUTTON', 'A', 'BUTTON']);
        expect(entries(w)[2]!.attributes('href')).toBe('/inbox');
        expect(entries(w)[0]!.attributes('type')).toBe('button');
    });

    it('the current section carries aria-current="page" and the active look', () => {
        const w = nav({ modelValue: 'search' });
        expect(entries(w)[1]!.attributes('aria-current')).toBe('page');
        expect(entries(w)[1]!.classes()).toContain('tao-nav__item--active');
        expect(entries(w)[0]!.attributes('aria-current')).toBeUndefined();
    });

    it('a click picks the section: select (with the event) and update:modelValue', async () => {
        const w = nav();
        await entries(w)[1]!.trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([['search']]);
        expect(w.emitted('select')![0]![0]).toBe('search');
        expect(w.emitted('select')![0]![1]).toBeInstanceOf(Event);
    });

    it('a router can stop a link in @select and route itself', async () => {
        const onSelect = vi.fn((_id: string, event: Event) => event.preventDefault());
        const w = nav({ onSelect });
        const click = new MouseEvent('click', { bubbles: true, cancelable: true });
        entries(w)[2]!.element.dispatchEvent(click);
        await nextTick();
        expect(onSelect).toHaveBeenCalledOnce();
        expect(click.defaultPrevented).toBe(true);
    });

    it('a disabled section is neither picked nor followed', async () => {
        const w = nav({ items: [...items, { id: 'old', label: 'Old', href: '/old', disabled: true }] });
        expect(entries(w)[3]!.attributes('disabled')).toBeDefined();
        const link = entries(w)[4]!;
        expect(link.attributes('href')).toBeUndefined();
        expect(link.attributes('aria-disabled')).toBe('true');
        await link.trigger('click');
        expect(w.emitted('select')).toBeUndefined();
    });

    it('badges: a count is text, true is a hidden dot', () => {
        const w = nav();
        const badges = w.findAll('.tao-nav__badge');
        expect(badges[0]!.text()).toBe('3');
        expect(badges[1]!.classes()).toContain('tao-nav__badge--dot');
        expect(badges[1]!.attributes('aria-hidden')).toBe('true');
    });

    it('layout: a class per look, auto by default', () => {
        expect(nav().classes()).toContain('tao-nav--auto');
        for (const layout of ['bar', 'rail', 'drawer']) {
            expect(nav({ layout }).classes()).toContain(`tao-nav--${layout}`);
        }
    });

    it('without a page in the slot it is a standalone panel; with one it lays the page out after the navigation', () => {
        expect(nav().classes()).toContain('tao-nav--standalone');
        const w = nav({}, { default: () => h('p', { id: 'page' }, 'page') });
        expect(w.classes()).not.toContain('tao-nav--standalone');
        const shell = w.find('.tao-nav__shell').element;
        expect(shell.children[0]!.tagName).toBe('NAV');
        expect(shell.children[1]!.querySelector('#page')).not.toBeNull();
    });

    it('up to maxBarItems there is no «More»', () => {
        const w = nav({ items: many.slice(0, 5) });
        expect(w.find('.tao-nav__entry--more').exists()).toBe(false);
        expect(w.findAll('.tao-nav__entry--overflow')).toHaveLength(0);
    });

    it('with more items the bar keeps maxBarItems − 1 and «More» holds the rest in a menu', async () => {
        const w = nav({ items: many });
        expect(w.findAll('.tao-nav__entry--overflow').map((e) => e.text())).toEqual(['E', 'F', 'G']);
        const more = w.find('.tao-nav__entry--more button');
        expect(more.text()).toBe('More');
        expect(more.attributes('aria-haspopup')).toBe('menu');
        await more.trigger('click');
        expect(more.attributes('aria-expanded')).toBe('true');
        expect(menus()).toHaveLength(1);
        expect(menus()[0]!.textContent).toContain('G');
        expect(menus()[0]!.getAttribute('aria-label')).toBe('More');
    });

    it('a pick in «More» selects the section; «More» looks active while the current section is inside', async () => {
        const w = nav({ items: many });
        await w.find('.tao-nav__entry--more button').trigger('click');
        menus()[0]!.querySelectorAll<HTMLElement>('[role="menuitem"]')[1]!.click();
        await nextTick();
        expect(w.emitted('update:modelValue')).toEqual([['f']]);
        expect(menus()).toHaveLength(0);
        await w.setProps({ modelValue: 'f' });
        expect(w.find('.tao-nav__entry--more button').classes()).toContain('tao-nav__item--active');
    });

    it('a link in «More» navigates unless @select stops it', async () => {
        const assign = vi.fn();
        const original = window.location;
        Object.defineProperty(window, 'location', { value: { ...original, assign }, configurable: true });
        try {
            const linked = many.map((item) => ({ ...item, href: `/${item.id}` }));
            const w = nav({ items: linked });
            await w.find('.tao-nav__entry--more button').trigger('click');
            menus()[0]!.querySelector<HTMLElement>('[role="menuitem"]')!.click();
            await nextTick();
            expect(assign).toHaveBeenCalledWith('/e');

            const routed = nav({ items: linked, onSelect: (_id: string, event: Event) => event.preventDefault() });
            await routed.find('.tao-nav__entry--more button').trigger('click');
            menus()[0]!.querySelector<HTMLElement>('[role="menuitem"]')!.click();
            await nextTick();
            expect(assign).toHaveBeenCalledOnce();
        } finally {
            Object.defineProperty(window, 'location', { value: original, configurable: true });
        }
    });

    it('Escape in «More» closes it and gives the focus back', async () => {
        const w = nav({ items: many });
        const more = w.find('.tao-nav__entry--more button');
        await more.trigger('click');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await nextTick();
        await nextTick();
        expect(menus()).toHaveLength(0);
        expect(document.activeElement).toBe(more.element);
    });

    it('ariaLabel, moreLabel and the label slot', () => {
        const w = nav(
            { items: many, ariaLabel: 'Sections', moreLabel: 'Other' },
            { label: ({ item, active }: { item: TaoNavItem; active: boolean }) => `${item.label}${active ? '*' : ''}` } as never,
        );
        expect(w.find('nav').attributes('aria-label')).toBe('Sections');
        expect(w.find('.tao-nav__entry--more').text()).toBe('Other');
        expect(entries(w)[0]!.text()).toBe('A');
    });
});

// 5.2: the floating pill / 5.2: плавающая «пилюля»

describe('TaoNav floating', () => {
    it('floating adds its class; without it there is none', () => {
        const items: TaoNavItem[] = [{ id: 'a', label: 'A' }];
        expect(mount(TaoNav, { props: { items, floating: true } }).classes()).toContain('tao-nav--floating');
        expect(mount(TaoNav, { props: { items } }).classes()).not.toContain('tao-nav--floating');
    });

    it('only the bar look floats: --_bar is 1 there and 0 on the side, in the fixed looks and in auto', () => {
        const blocks = navSource.match(/--_bar: [01];/g) ?? [];
        expect(blocks.filter((b: string) => b.endsWith('1;'))).toHaveLength(2);
        expect(blocks.filter((b: string) => b.endsWith('0;'))).toHaveLength(4);
        expect(navSource).toMatch(/\.tao-nav--floating \.tao-nav__panel \{[^}]*border-radius: calc\(var\(--_bar\) \* var\(--tao-radius-full\)\)/);
        expect(navSource).toMatch(/\.tao-nav--floating \.tao-nav__panel \{[^}]*bottom: calc\(var\(--_bar\) \* \(var\(--tao-space-3\) \+ var\(--_safe-bottom\)\)\)/);
    });
});

// 5.4: the main action / 5.4: главное действие

describe('TaoNav #action', () => {
    const action = () => h('button', { class: 'fab' }, [h('span', { class: 'tao-nav__action-label' }, 'New')]);

    it('renders the action at the top of the panel, before the list, and nothing without the slot', () => {
        const w = nav({}, { action });
        const column = w.find('.tao-nav__column').element;
        expect(column.children[0]!.classList.contains('tao-nav__action')).toBe(true);
        expect(column.children[0]!.querySelector('.fab')).not.toBeNull();
        expect(column.children[1]!.classList.contains('tao-nav__list')).toBe(true);
        expect(w.find('.fab').text()).toBe('New');
        expect(nav().find('.tao-nav__action').exists()).toBe(false);
    });

    it('each look places it with variables: out of the bar and round, round on the rail, extended in the drawer', () => {
        const blocks = navSource.match(/--_action-position: \w+;\s*--_compact: [01];\s*--_action-width: [^;]+;\s*--_action-ratio: [^;]+;\s*--_action-shadow: [^;]+;\s*--_action-label-position: \w+;/g) ?? [];
        // bar, rail, drawer and the same three in auto / bar, rail, drawer и те же три в auto
        expect(blocks).toHaveLength(6);
        const look = (b: string) => b.replace(/\s+/g, ' ');
        const bar = 'absolute; --_compact: 1; --_action-width: auto; --_action-ratio: 1; --_action-shadow: var(--tao-shadow-lg); --_action-label-position: absolute;';
        const rail = 'static; --_compact: 1; --_action-width: auto; --_action-ratio: 1; --_action-shadow: none; --_action-label-position: absolute;';
        const drawer = 'static; --_compact: 0; --_action-width: 100%; --_action-ratio: auto; --_action-shadow: none; --_action-label-position: static;';
        expect(blocks.map(look)).toEqual([bar, rail, drawer, bar, rail, drawer].map((rest) => `--_action-position: ${rest}`));
        expect(navSource).toMatch(/\.tao-nav__action \{[^}]*position: var\(--_action-position\);[^}]*bottom: calc\(100% \+ var\(--tao-space-3\)\)/);
        expect(navSource).toMatch(/\.tao-nav--floating \.tao-nav__action \{[^}]*inset-inline-end: -1px/);
        expect(navSource).toMatch(/\.tao-nav__action :deep\(\.tao-nav__action-label\) \{[^}]*clip-path: inset\(calc\(var\(--_compact\) \* 50%\)\)/);
    });

    it('renders on the server with the action', async () => {
        const { createSSRApp } = await import('vue');
        const { renderToString } = await import('vue/server-renderer');
        const html = await renderToString(createSSRApp({ render: () => h(TaoNav, { items, floating: true }, { action, default: () => h('main', 'page') }) }));
        expect(html).toContain('tao-nav__action');
        expect(html).toContain('tao-nav__action-label');
    });
});
