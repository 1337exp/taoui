import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoBlock from '../src/components/TaoBlock.vue';
import TaoCard from '../src/components/TaoCard.vue';
import { stripeClasses } from '../src/stripe';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import surfaceCss from '../src/styles/contexts/surface.css?raw';
// @ts-expect-error Vite `?raw` import
import semanticCss from '../src/styles/tokens/semantic.css?raw';

// A coloured stripe on one side of a panel: a role colour, clipped by the panel's own corners.
// Цветная полоса с одной стороны панели: цвет из роли, обрезана углами самой панели.

const css = (surfaceCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
/** The rule written for exactly this selector, else the first group that lists it. / Правило ровно для селектора. */
function rule(selector: string): string {
    const all = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({ list: selectors!.split(',').map((s) => s.trim()), body: body! }));
    const own = all.find((r) => r.list.length === 1 && r.list[0] === selector) ?? all.find((r) => r.list.includes(selector));
    if (!own) {
        throw new Error(`no rule for ${selector}`);
    }
    return own.body;
}

describe('stripeClasses', () => {
    it('no stripe, no classes', () => {
        expect(stripeClasses(undefined)).toEqual([]);
    });

    it('a side and a tone; the accent by default, the palette gradient on request', () => {
        expect(stripeClasses('top')).toEqual(['tao-stripe-top', 'tao-tone-accent']);
        expect(stripeClasses('left', 'danger')).toEqual(['tao-stripe-left', 'tao-tone-danger']);
        expect(stripeClasses('bottom', 'gradient')).toEqual(['tao-stripe-bottom', 'tao-stripe-gradient']);
    });
});

describe('the stripe in the stylesheet', () => {
    it('is a layer over the whole panel with the panel radius, so the corners clip it', () => {
        const layer = rule('.tao-stripe-top::after');
        expect(layer).toContain('inset: 0');
        expect(layer).toContain('border-radius: inherit');
        expect(layer).toContain('pointer-events: none');
        expect(layer).toContain('no-repeat');
    });

    it('stays inside the panel: the panel is a stacking context, so the stripe z-index cannot beat a sticky TaoNav bar', () => {
        expect(rule('.tao-stripe-top::after')).toContain('z-index: 1');
        expect(rule('.tao-panel')).toContain('isolation: isolate');
    });

    it('takes its colour from roles: the panel tone, or the theme gradient (along a left stripe, top to bottom)', () => {
        expect(rule('.tao-stripe-top')).not.toContain('#');
        expect(css).toMatch(/--_tao-stripe-image:\s*linear-gradient\(var\(--tao-tone\), var\(--tao-tone\)\)/);
        expect(rule('.tao-stripe-gradient')).toContain('var(--tao-gradient)');
        expect(rule('.tao-stripe-gradient.tao-stripe-left')).toContain('180deg');
    });

    it('the width is a token', () => {
        expect(semanticCss).toContain('--tao-stripe-width:');
        expect(rule('.tao-stripe-left')).toContain('var(--tao-stripe-width) 100%');
    });
});

describe('Card and Block stripe', () => {
    it('Card: no stripe by default; stripe and stripeTone add the classes', () => {
        expect(mount(TaoCard).classes().some((c) => c.startsWith('tao-stripe'))).toBe(false);
        const w = mount(TaoCard, { props: { stripe: 'left', stripeTone: 'success' } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-panel', 'tao-stripe-left', 'tao-tone-success']));
    });

    it('Block: the same, with the gradient', () => {
        const w = mount(TaoBlock, { props: { stripe: 'top', stripeTone: 'gradient' } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-panel', 'tao-stripe-top', 'tao-stripe-gradient']));
    });
});
