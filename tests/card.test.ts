import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoBlock from '../src/components/TaoBlock.vue';
import TaoCard from '../src/components/TaoCard.vue';
// @ts-expect-error Vite `?raw` import: the component source and the surface styles as text
import cardSource from '../src/components/TaoCard.vue?raw';
// @ts-expect-error Vite `?raw` import
import surfaceCss from '../src/styles/contexts/surface.css?raw';

describe('TaoCard slots', () => {
    it('media, header, title, sub, body and footer render in their places', () => {
        const w = mount(TaoCard, {
            slots: { media: '<i>m</i>', header: 'H', title: 'T', sub: 'S', default: 'B', footer: 'F' },
        });
        expect(w.find('.tao-card__media').text()).toBe('m');
        expect(w.find('.tao-card__header').text()).toBe('H');
        expect(w.find('.tao-card__title').text()).toBe('T');
        expect(w.find('.tao-card__sub').text()).toBe('S');
        expect(w.find('.tao-card__body').text()).toBe('B');
        expect(w.find('.tao-card__footer').text()).toBe('F');
    });

    it('media alone makes a media-only tile', () => {
        expect(mount(TaoCard, { slots: { media: '<i>m</i>' } }).classes()).toContain('tao-card--media-only');
        expect(mount(TaoCard, { slots: { media: '<i>m</i>', default: 'x' } }).classes()).not.toContain('tao-card--media-only');
    });

    it('the corner slot makes room for itself: the card says so', () => {
        const w = mount(TaoCard, { slots: { title: 'T', corner: '<b>tag</b>' } });
        expect(w.find('.tao-card__corner').text()).toBe('tag');
        expect(w.classes()).toContain('tao-card--has-corner');
        expect(mount(TaoCard, { slots: { title: 'T' } }).classes()).not.toContain('tao-card--has-corner');
    });

    it('closable adds a named button that only emits close', async () => {
        const w = mount(TaoCard, { props: { closable: true }, slots: { default: 'B' } });
        const button = w.find('.tao-card__close');
        expect(button.attributes('aria-label')).toBe('Close');
        await button.trigger('click');
        expect(w.emitted('close')).toHaveLength(1);
        expect(w.find('.tao-card').exists() || w.classes().includes('tao-card')).toBe(true); // the parent removes it, not the card
        expect(mount(TaoCard, { slots: { default: 'B' } }).find('.tao-card__close').exists()).toBe(false);
    });

    it('closeLabel overrides the text', () => {
        expect(mount(TaoCard, { props: { closable: true, closeLabel: 'Dismiss' } }).find('.tao-card__close').attributes('aria-label')).toBe('Dismiss');
    });
});

describe('the panel contract', () => {
    it('Card and Block are panels; defaults come from tokens, only what is passed goes inline', () => {
        for (const component of [TaoCard, TaoBlock]) {
            const plain = mount(component, { slots: { default: 'x' } });
            expect(plain.classes()).toContain('tao-panel');
            expect(plain.attributes('style') ?? '').not.toContain('--tao-radius');
            expect(plain.attributes('style') ?? '').not.toContain('--tao-pad');

            const set = mount(component, { props: { radius: 20, padding: [12, 24] }, slots: { default: 'x' } });
            const style = set.attributes('style') ?? '';
            expect(style).toContain('--tao-radius: 20px');
            expect(style).toContain('--tao-pad: 12px'); // the first value, for concentric corners
        }
    });
});

// 5.56.0: `radius` by corner: a sharp side next to a stripe, a rounded other one
// 5.56.0: `radius` по углам: прямая сторона рядом с полосой, скруглённая другая
describe('the corners of a panel', () => {
    const style = (component: typeof TaoCard | typeof TaoBlock, radius: unknown) =>
        mount(component, { props: { radius: radius as never }, slots: { default: 'x' } }).attributes('style') ?? '';

    it('an array gives the corners one by one, in the order of CSS border-radius', () => {
        for (const component of [TaoCard, TaoBlock]) {
            const s = style(component, [0, 0, 12, 12]);
            expect(s).toContain('--tao-radius: 0px 0px 12px 12px');
            expect(s).toContain('--tao-radius-tl: 0px');
            expect(s).toContain('--tao-radius-tr: 0px');
            expect(s).toContain('--tao-radius-br: 12px');
            expect(s).toContain('--tao-radius-bl: 12px');
        }
    });

    it('a string of four lengths means the same; two are the diagonals', () => {
        const s = style(TaoCard, '0 16px');
        // a string is split into corners; a bare 0 becomes 0px, so calc() and max() of the inner radii stay valid
        expect(s).toContain('--tao-radius-tl: 0px;');
        expect(s).toContain('--tao-radius-tr: 16px;');
        expect(s).toContain('--tao-radius-br: 0px;');
        expect(s).toContain('--tao-radius-bl: 16px');
    });

    it('one length, or four equal ones, is the single property it always was', () => {
        for (const component of [TaoCard, TaoBlock]) {
            expect(style(component, 20)).toContain('--tao-radius: 20px');
            expect(style(component, 20)).not.toContain('--tao-radius-tl');
            expect(style(component, [8, 8, 8, 8])).not.toContain('--tao-radius-tl');
        }
    });

    it('a stripe follows the corners: the layer takes the radius of the panel', () => {
        const w = mount(TaoCard, { props: { stripe: 'top', radius: [0, 0, 12, 12] }, slots: { default: 'x' } });
        expect(w.classes()).toContain('tao-stripe-top');
        expect(w.attributes('style')).toContain('--tao-radius: 0px 0px 12px 12px');
        // the layer is `border-radius: inherit` (contexts/surface.css), so it clips by the same corners
        expect(surfaceCss).toMatch(/\.tao-stripe-top::after[\s\S]*?border-radius: inherit/);
    });

    it('the panel contract publishes each corner and each inner radius; --tao-radius-inner stays one length', () => {
        const panel = /\.tao-panel \{([^}]*)\}/.exec(surfaceCss)?.[1] ?? '';
        for (const corner of ['tl', 'tr', 'br', 'bl']) {
            expect(panel).toContain(`--tao-radius-${corner}: var(--tao-radius);`);
            expect(panel).toContain(`--tao-radius-inner-${corner}: max(0px, calc(var(--tao-radius-${corner}) - var(--tao-pad)));`);
        }
        // one length, the largest corner, so a child that sits in no corner keeps a fair value
        expect(panel).toMatch(/--tao-radius-inner: max\(0px, calc\(max\(var\(--tao-radius-tl\), var\(--tao-radius-tr\), var\(--tao-radius-br\), var\(--tao-radius-bl\)\) - var\(--tao-pad\)\)\);/);
        expect(panel).toContain('border-radius: var(--tao-radius);');
    });

    it('square: only the named corners are written and the radius is kept as it is', () => {
        for (const component of [TaoCard, TaoBlock]) {
            const w = mount(component, { props: { square: 'top' }, slots: { default: 'x' } });
            expect(w.classes()).toContain('tao-panel--corners');
            const s = w.attributes('style') ?? '';
            expect(s).toContain('--tao-radius-tl: 0px');
            expect(s).toContain('--tao-radius-tr: 0px');
            // no radius of its own: the token, or your own --tao-radius, stays in force for the other corners
            expect(s).not.toMatch(/--tao-radius:/);
            expect(s).not.toContain('--tao-radius-bl');
            expect(s).not.toContain('--tao-radius-br');

            const own = mount(component, { props: { radius: 20, square: ['bottom-left', 'top-right'] }, slots: { default: 'x' } }).attributes('style') ?? '';
            expect(own).toContain('--tao-radius: 20px');
            expect(own).toContain('--tao-radius-tr: 0px');
            expect(own).toContain('--tao-radius-bl: 0px');
        }
    });

    it('without square there is no marker class, so a hand-made --tao-radius on a panel keeps working', () => {
        for (const component of [TaoCard, TaoBlock]) {
            expect(mount(component, { slots: { default: 'x' } }).classes()).not.toContain('tao-panel--corners');
            expect(mount(component, { props: { square: '' }, slots: { default: 'x' } }).classes()).not.toContain('tao-panel--corners');
        }
    });

    it('the marker class builds the outline from the four corners, after the plain panel rule', () => {
        expect(surfaceCss).toMatch(/\.tao-panel--corners \{[^}]*border-radius: var\(--tao-radius-tl\) var\(--tao-radius-tr\) var\(--tao-radius-br\) var\(--tao-radius-bl\)/);
        expect(surfaceCss.indexOf('.tao-panel--corners')).toBeGreaterThan(surfaceCss.indexOf('.tao-panel {'));
    });

    it('a stripe stays straight on a squared side: the layer inherits the outline', () => {
        const w = mount(TaoCard, { props: { stripe: 'top', square: 'top' }, slots: { default: 'x' } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-stripe-top', 'tao-panel--corners']));
    });

    it('the close button sits in the top right corner and is concentric to it: the corner minus its offset, so the hover is round', () => {
        expect(cardSource).toMatch(/\.tao-card__close \{[^}]*border-radius: max\(0px, calc\(var\(--tao-radius-tr\) - var\(--tao-space-3\)\)\);/);
        // the gap it is measured by is the offset of the corner box it sits in, not the padding of the card
        expect(cardSource).toMatch(/\.tao-card__corner \{[^}]*top: var\(--tao-space-3\);[^}]*right: var\(--tao-space-3\);/);
    });
});

describe('media-only card', () => {
    it('the class the template sets is the one the stylesheet stretches (a picture fills a mosaic tile)', async () => {
        const { mount } = await import('@vue/test-utils');
        const { h } = await import('vue');
        const TaoCard = (await import('../src/components/TaoCard.vue')).default;
        // @ts-expect-error Vite `?raw` import: the component source as text
        const source = (await import('../src/components/TaoCard.vue?raw')).default as string;
        const w = mount(TaoCard, { props: { flush: true }, slots: { media: () => h('img', { src: 'x.png', alt: '' }) } });
        expect(w.classes()).toContain('tao-card--media-only');
        expect(source).toMatch(/\.tao-card--media-only \.tao-card__media \{[^}]*flex: 1 1 auto/);
        expect(source).not.toContain('cover-only');
    });
});
