import { mount, type VueWrapper } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import TaoContextMenu from '../src/components/TaoContextMenu.vue';
import TaoMenu from '../src/components/TaoMenu.vue';
import TaoPopover from '../src/components/TaoPopover.vue';
import { anchorRect, computePosition, isVirtualAnchor } from '../src/floating';
import type { TaoMenuItem } from '../src/menu';

// A menu (and a popover) at a point of the screen: a virtual anchor instead of an element.
// Меню (и поповер) в точке экрана: виртуальный якорь вместо элемента.

const items: TaoMenuItem[] = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta', items: [{ id: 'b1', label: 'Beta one' }] },
];
const wrappers: VueWrapper[] = [];
const SIZE = { width: 160, height: 80 };

beforeEach(() => {
    // happy-dom has no layout: the panel is 160 x 80, the window 1024 x 768
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => SIZE.width });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => SIZE.height });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 768 });
});

afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
    document.body.innerHTML = '';
    delete (HTMLElement.prototype as { offsetWidth?: number }).offsetWidth;
    delete (HTMLElement.prototype as { offsetHeight?: number }).offsetHeight;
});

const panel = () => document.querySelector<HTMLElement>('.tao-menu');
const spot = () => ({ left: parseFloat(panel()!.style.left), top: parseFloat(panel()!.style.top) });
const flush = async () => {
    await nextTick();
    await nextTick();
    await nextTick();
};

async function mountAt(anchor: unknown, extra: Record<string, unknown> = {}) {
    const w = mount(TaoMenu, { props: { items, open: true, anchor: anchor as never, ...extra }, attachTo: document.body });
    wrappers.push(w);
    await flush();
    return w;
}

describe('virtual anchor maths', () => {
    it('isVirtualAnchor tells a point from an element and from nothing', () => {
        expect(isVirtualAnchor({ x: 1, y: 2 })).toBe(true);
        expect(isVirtualAnchor(document.createElement('div'))).toBe(false);
        expect(isVirtualAnchor(null)).toBe(false);
    });

    it('anchorRect: a point is a box of 0 x 0 unless width / height are given', () => {
        expect(anchorRect({ x: 10, y: 20 })).toEqual({ left: 10, top: 20, width: 0, height: 0 });
        expect(anchorRect({ x: 10, y: 20, width: 5, height: 6 })).toEqual({ left: 10, top: 20, width: 5, height: 6 });
    });

    it('computePosition at a point: start-aligned below, the gap keeps the point uncovered', () => {
        const r = computePosition({ anchor: anchorRect({ x: 100, y: 100 }), size: SIZE, viewport: { width: 1024, height: 768 }, placement: 'bottom-start', gap: 4 });
        expect(r).toMatchObject({ left: 100, top: 104, side: 'bottom' });
    });
});

describe('TaoMenu at a point', () => {
    it('opens at the point: fixed, left edge at x, just below y', async () => {
        await mountAt({ x: 200, y: 150 }, { placement: 'bottom-start' });
        expect(panel()!.style.position).toBe('fixed');
        expect(spot()).toEqual({ left: 200, top: 154 });
    });

    it('flips above the point at the bottom edge and shifts left at the right edge', async () => {
        await mountAt({ x: 1000, y: 740 }, { placement: 'bottom-start' });
        // above: the bottom of the panel stays 4px over the point; shifted: the right edge stays 8px inside the window
        expect(spot()).toEqual({ left: 1024 - 8 - SIZE.width, top: 740 - 4 - SIZE.height });
    });

    it('moves when the point changes while open', async () => {
        const w = await mountAt({ x: 100, y: 100 });
        await w.setProps({ anchor: { x: 300, y: 250 } });
        await flush();
        expect(spot()).toEqual({ left: 300, top: 254 });
    });

    it('switches between an element and a point, both ways', async () => {
        const button = document.createElement('button');
        document.body.append(button);
        button.getBoundingClientRect = () => ({ left: 50, top: 60, width: 40, height: 20, right: 90, bottom: 80, x: 50, y: 60, toJSON: () => ({}) });
        const w = await mountAt(button, { placement: 'bottom-start' });
        expect(panel()!.style.position).toBe('absolute');
        await w.setProps({ anchor: { x: 400, y: 300 } });
        await flush();
        expect(panel()!.style.position).toBe('fixed');
        expect(spot()).toEqual({ left: 400, top: 304 });
        await w.setProps({ anchor: button });
        await flush();
        expect(panel()!.style.position).toBe('absolute');
        expect(spot()).toEqual({ left: 50, top: 84 });
    });

    it('an element anchor is unchanged: below the element, a press on it is not "outside"', async () => {
        const button = document.createElement('button');
        document.body.append(button);
        button.getBoundingClientRect = () => ({ left: 50, top: 60, width: 40, height: 20, right: 90, bottom: 80, x: 50, y: 60, toJSON: () => ({}) });
        const w = await mountAt(button, { placement: 'bottom-start' });
        button.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(w.emitted('close')).toBeUndefined();
        expect(spot()).toEqual({ left: 50, top: 84 });
    });

    it('Escape closes it and the focus goes back to what had it before', async () => {
        const before = document.createElement('button');
        document.body.append(before);
        before.focus();
        const w = mount(TaoMenu, { props: { items, open: false, anchor: { x: 10, y: 10 }, 'onUpdate:open': undefined } as never, attachTo: document.body });
        wrappers.push(w);
        await w.setProps({ open: true });
        await flush();
        expect(document.activeElement).toBe(panel());
        panel()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        // Escape goes through the layer on the document
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();
        expect(w.emitted('close')?.[0]).toEqual(['escape']);
        await w.setProps({ open: false });
        await flush();
        expect(document.activeElement).toBe(before);
    });

    it('a press outside closes it and leaves the focus where the user put it', async () => {
        const before = document.createElement('button');
        const other = document.createElement('input');
        document.body.append(before, other);
        before.focus();
        const w = mount(TaoMenu, { props: { items, open: false, anchor: { x: 10, y: 10 } }, attachTo: document.body });
        wrappers.push(w);
        await w.setProps({ open: true });
        await flush();
        other.focus();
        other.dispatchEvent(new Event('pointerdown', { bubbles: true }));
        expect(w.emitted('close')?.[0]).toEqual(['outside']);
        await w.setProps({ open: false });
        await flush();
        expect(document.activeElement).toBe(other);
    });

    it('arrows, Enter and a submenu work as with an element anchor', async () => {
        const w = await mountAt({ x: 10, y: 10 });
        const menu = panel()!;
        const press = async (key: string) => {
            menu.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
            await flush();
        };
        await press('ArrowDown');
        await press('ArrowRight');
        expect(document.querySelectorAll('.tao-menu')).toHaveLength(2);
        await press('ArrowLeft');
        await press('Enter');
        expect(w.emitted('select')).toBeUndefined();
        await press('ArrowUp');
        await press('Enter');
        expect(w.emitted('select')).toEqual([['a']]);
    });

});

describe('TaoContextMenu on a point', () => {
    it('contextmenu opens the menu at the client coordinates and prevents the default', async () => {
        const w = mount(TaoContextMenu, { props: { items }, slots: { default: () => h('div', { class: 'area' }, 'x') }, attachTo: document.body });
        wrappers.push(w);
        const event = new MouseEvent('contextmenu', { clientX: 220, clientY: 130, bubbles: true, cancelable: true });
        w.find('.area').element.dispatchEvent(event);
        await flush();
        expect(event.defaultPrevented).toBe(true);
        expect(spot()).toEqual({ left: 220, top: 134 });
        expect(document.querySelector('.tao-context-menu__anchor')).toBeNull();
    });
});

describe('closeOnScroll closes only for a scroll that moves the anchor', () => {
    // the showcase bug: an autoplaying carousel elsewhere on the page scrolled its track every few seconds and closed every
    // open context menu, which looked like «the menu closes when the pointer leaves it»
    // ошибка showcase: карусель с автопрокруткой в другом месте страницы прокручивала ленту и закрывала любое меню
    const scroll = (target: EventTarget) => target.dispatchEvent(new Event('scroll', { bubbles: false }));

    it('a point: a container elsewhere does not close it; the container under the point and the page do', async () => {
        const holder = document.createElement('div');
        const row = document.createElement('div');
        const carousel = document.createElement('div');
        holder.append(row);
        document.body.append(holder, carousel);
        const spy = vi.spyOn(document, 'elementFromPoint').mockReturnValue(row);
        const w = await mountAt({ x: 100, y: 100 }, { closeOnScroll: true });
        scroll(carousel);
        expect(w.emitted('close')).toBeUndefined();
        scroll(holder);
        expect(w.emitted('close')![0]).toEqual(['scroll']);
        await w.setProps({ open: false });
        await w.setProps({ open: true });
        await flush();
        scroll(document);
        expect(w.emitted('close')![1]).toEqual(['scroll']);
        spy.mockRestore();
    });

    it('an element anchor: only a scroll of something that holds it', async () => {
        const pane = document.createElement('div');
        const button = document.createElement('button');
        pane.append(button);
        const other = document.createElement('div');
        document.body.append(pane, other);
        const w = await mountAt(button, { closeOnScroll: true });
        scroll(other);
        expect(w.emitted('close')).toBeUndefined();
        scroll(pane);
        expect(w.emitted('close')![0]).toEqual(['scroll']);
    });
});

describe('TaoPopover at a point', () => {
    it('hangs from the point instead of the trigger', async () => {
        const open = ref(true);
        const Host = defineComponent({
            setup: () => () =>
                h(TaoPopover, { modelValue: open.value, anchor: { x: 300, y: 200 } }, { default: () => h('span', 'hi') }),
        });
        const w = mount(Host, { attachTo: document.body });
        wrappers.push(w);
        await flush();
        const el = document.querySelector<HTMLElement>('.tao-popover__panel')!;
        expect(el.style.position).toBe('fixed');
        expect(parseFloat(el.style.left)).toBe(300);
        expect(parseFloat(el.style.top)).toBe(204);
        vi.restoreAllMocks();
    });
});
