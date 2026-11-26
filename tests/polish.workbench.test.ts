import { mount } from '@vue/test-utils';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { h } from 'vue';
import TaoMenubar from '../src/components/TaoMenubar.vue';
import TaoTooltip from '../src/components/TaoTooltip.vue';
import TaoWorkbench from '../src/components/TaoWorkbench.vue';

// What the first look at the frame of an editor asked for: a flat menu bar, a raised hint, no line under the panel title, blocks that are
// right in the light theme too.
// Что попросил первый взгляд на рамку редактора: плоская полоса меню, поднятая подсказка, без линии под заголовком панели, блоки, верные
// и в светлой теме.

afterEach(() => {
    document.body.innerHTML = '';
});

const source = (file: string) => readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const menu = [{ id: 'f', label: 'File', items: [{ id: 'n', label: 'New' }] }];

describe('TaoMenubar flat', () => {
    it('sits on the surface: no fill, no frame, no padding, and no frame style of the context', () => {
        const w = mount(TaoMenubar, { props: { items: menu, flat: true, bordered: true } });
        expect(w.classes()).toContain('tao-menubar--flat');
        expect(w.attributes('style') ?? '').not.toContain('--tao-frame');
        expect(source('src/components/TaoMenubar.vue')).toMatch(/\.tao-menubar--flat \{\s*padding: 0;\s*background: transparent;\s*border: 0;/);
    });

    it('not flat: a raised panel as before', () => {
        expect(mount(TaoMenubar, { props: { items: menu } }).classes()).not.toContain('tao-menubar--flat');
    });
});

describe('TaoTooltip variant', () => {
    const tip = async (variant?: 'inverse' | 'raised') => {
        const w = mount(TaoTooltip, { props: { content: 'Hint', variant }, slots: { default: () => h('button', 'x') }, attachTo: document.body });
        await w.find('.tao-tooltip-wrapper').trigger('mouseenter');
        return w;
    };

    it('inverse by default, raised on request', async () => {
        const a = await tip();
        expect(document.querySelector('.tao-tooltip')!.classList.contains('tao-tooltip--raised')).toBe(false);
        a.unmount();
        const b = await tip('raised');
        expect(document.querySelector('.tao-tooltip')!.classList.contains('tao-tooltip--raised')).toBe(true);
        b.unmount();
    });

    it('raised takes the colours of the theme through the hooks of the hint, with a frame that follows the arrow', () => {
        const css = source('src/components/TaoTooltip.vue');
        expect(css).toMatch(/\.tao-tooltip--raised \{[^}]*--tao-tooltip-bg: var\(--tao-color-surface-raised\)/);
        expect(css).toMatch(/\.tao-tooltip--raised \{[^}]*border: 1px solid var\(--tao-color-border-strong\)/);
        for (const side of ['top', 'bottom', 'left', 'right']) {
            expect(css).toContain(`.tao-tooltip--raised.tao-tooltip--${side} .tao-tooltip__arrow`);
        }
    });
});

// happy-dom has no real focus ring: say what `:focus-visible` answers, and leave every other selector to the real `matches`
// у happy-dom нет настоящего кольца фокуса: говорим, что отвечает `:focus-visible`, остальные селекторы оставляем настоящему `matches`
function focusVisible(initial: boolean) {
    let answer = initial;
    const real = Element.prototype.matches;
    const spy = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (this: Element, selector: string) {
        return selector === ':focus-visible' ? answer : real.call(this, selector);
    });
    return { set: (value: boolean) => (answer = value), restore: () => spy.mockRestore() };
}

describe('TaoTooltip dismiss and frame (fourth review)', () => {
    it('a focus the page moved after a click (not :focus-visible) does not light the hint; a keyboard focus does', async () => {
        const w = mount(TaoTooltip, { props: { content: 'Hint' }, slots: { default: () => h('button', 'x') }, attachTo: document.body });
        const focus = focusVisible(false);
        await w.find('.tao-tooltip-wrapper').trigger('focusin');
        expect(document.querySelector('.tao-tooltip')).toBeNull();
        focus.set(true);
        await w.find('.tao-tooltip-wrapper').trigger('focusin');
        expect(document.querySelector('.tao-tooltip')).not.toBeNull();
        focus.restore();
        w.unmount();
    });

    it('Escape on the trigger hides the hint without moving the focus (WCAG 1.4.13: dismissable)', async () => {
        const w = mount(TaoTooltip, { props: { content: 'Hint' }, slots: { default: () => h('button', 'x') }, attachTo: document.body });
        const visible = focusVisible(true);
        await w.find('.tao-tooltip-wrapper').trigger('focusin');
        visible.restore();
        expect(document.querySelector('.tao-tooltip')).not.toBeNull();
        await w.find('button').trigger('keydown', { key: 'Escape' });
        expect(document.querySelector('.tao-tooltip')).toBeNull();
        w.unmount();
    });

    it('Escape dismisses a hint that came up under the pointer too, and the key still reaches the page', async () => {
        const w = mount(TaoTooltip, { props: { content: 'Hint' }, slots: { default: () => h('button', 'x') }, attachTo: document.body });
        await w.find('.tao-tooltip-wrapper').trigger('mouseenter');
        expect(document.querySelector('.tao-tooltip')).not.toBeNull();
        const parent: string[] = [];
        window.addEventListener('keydown', (e) => parent.push(e.key), { once: true });
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await w.vm.$nextTick();
        expect(document.querySelector('.tao-tooltip')).toBeNull();
        expect(parent).toEqual(['Escape']);
        w.unmount();
    });

    it('the arrow is border-box: the frame of a raised hint does not make it bigger than the 8px its offsets assume', () => {
        expect(source('src/components/TaoTooltip.vue')).toMatch(/\.tao-tooltip__arrow \{\s*position: absolute;[^}]*box-sizing: border-box;/);
    });
});

describe('TaoWorkbench look', () => {
    it('the hints of the tools are raised', () => {
        const w = mount(TaoWorkbench, { props: { leftTools: [{ id: 'a', label: 'A' }] } });
        expect(w.findAllComponents(TaoTooltip).length).toBeGreaterThan(0);
        expect(w.findAllComponents(TaoTooltip).every((t) => t.props('variant') === 'raised')).toBe(true);
        w.unmount();
    });

    it('the panel title has no line under it', () => {
        const css = source('src/components/TaoWorkbench.vue');
        const head = /\.tao-workbench__panel-head \{[^}]*\}/.exec(css)![0];
        expect(head).not.toMatch(/border/);
    });

    it('the chrome and the blocks are chosen by the theme: white blocks on a grey chrome in light, darker blocks in dark', () => {
        const css = source('src/components/TaoWorkbench.vue');
        expect(css).toMatch(/background-color: light-dark\(color-mix\(in srgb, var\(--tao-color-bg\) 93%, var\(--tao-color-text-strong\)\), var\(--tao-color-bg\)\)/);
        expect(css).toMatch(/background: light-dark\(var\(--tao-color-bg\), color-mix\(in srgb, var\(--tao-color-bg\) 55%, black\)\)/);
    });
});
