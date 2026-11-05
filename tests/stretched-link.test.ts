import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoStretchedLink from '../src/components/TaoStretchedLink.vue';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import stretchCss from '../src/styles/contexts/stretch.css?raw';
// @ts-expect-error Vite `?raw` import
import indexCss from '../src/styles/index.css?raw';

// 5.28.0: TaoStretchedLink and the stretched context: a whole card or row is one link, the buttons inside it still work.
// 5.28.0: TaoStretchedLink и контекст растянутой ссылки: вся карточка или строка это одна ссылка, кнопки внутри работают.

const css = (stretchCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector: string) => css.match(new RegExp(String.raw`(?:^|\})\s*${selector}\s*\{([^}]*)\}`))?.[1] ?? '';

describe('TaoStretchedLink', () => {
    it('is a TaoLink with the stretched class: a plain <a> without a router', () => {
        const w = mount(TaoStretchedLink, { props: { to: '/a' }, slots: { default: 'Open' } });
        expect(w.element.tagName).toBe('A');
        expect(w.classes()).toContain('tao-stretched-link');
        expect(w.attributes('href')).toBe('/a');
        expect(w.text()).toBe('Open');
    });

    it('takes the props of TaoLink: newTab and private', () => {
        const tab = mount(TaoStretchedLink, { props: { to: 'https://x.dev', newTab: true } });
        expect(tab.attributes('target')).toBe('_blank');
        expect(tab.attributes('rel')).toBe('noopener');
        const hard = mount(TaoStretchedLink, { props: { to: 'https://x.dev', newTab: true, private: true } });
        expect(hard.attributes('rel')).toBe('noopener noreferrer');
    });

    it('passes class, aria and listeners on to the link', async () => {
        let clicked = 0;
        const w = mount(TaoStretchedLink, { props: { to: '#' }, attrs: { class: 'mine', 'aria-label': 'Open it', onClick: () => clicked++ } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-stretched-link', 'mine']));
        expect(w.attributes('aria-label')).toBe('Open it');
        await w.trigger('click');
        expect(clicked).toBe(1);
    });
});

describe('stretched context: the stylesheet', () => {
    it('is in the layer order, after the contexts that came before it', () => {
        const imported = [...(indexCss as string).matchAll(/@import "\.\/([^"]+)"/g)].map((m) => m[1]);
        expect(imported).toContain('contexts/stretch.css');
        expect(imported.indexOf('contexts/stretch.css')).toBeGreaterThan(imported.indexOf('contexts/surface.css'));
    });

    it('the container is positioned and the link layer covers it', () => {
        expect(rule(String.raw`\.tao-stretched`)).toMatch(/position:\s*relative/);
        const layer = rule(String.raw`\.tao-stretched-link::after`);
        expect(layer).toMatch(/content:\s*''/);
        expect(layer).toMatch(/position:\s*absolute/);
        expect(layer).toMatch(/inset:\s*0/);
    });

    it('a control marked raise sits above the layer', () => {
        const raise = rule(String.raw`\.tao-stretched-raise`);
        expect(raise).toMatch(/position:\s*relative/);
        expect(raise).toMatch(/z-index:\s*1\b/);
    });

    it('the focus ring goes round the container, inside its edge', () => {
        expect(rule(String.raw`\.tao-stretched-link:focus-visible`)).toMatch(/outline:\s*none/);
        const ring = rule(String.raw`\.tao-stretched-link:focus-visible::after`);
        expect(ring).toMatch(/outline:\s*2px solid var\(--tao-color-accent\)/);
        expect(ring).toMatch(/outline-offset:\s*-2px/);
    });

    it('never gives the link a property that makes it the containing block of its own layer', () => {
        // filter / transform / perspective / will-change / contain on the link (or its :hover) shrink the ::after to the link, and the
        // pointer then flickers between the layer and what lies under it. The context must not do it itself.
        // filter / transform / perspective / will-change / contain на ссылке сжимают ::after до ссылки, и курсор мигает.
        const linkRules = [...css.matchAll(/(\.tao-stretched-link[^{]*)\{([^}]*)\}/g)];
        expect(linkRules.length).toBeGreaterThan(0);
        for (const [, selector, body] of linkRules) {
            expect(`${selector}{${body}}`).not.toMatch(/\b(filter|transform|perspective|will-change|contain|backdrop-filter)\s*:/);
        }
    });

    it('reads tokens only: the focus colour and the panel radius', () => {
        expect(css).toMatch(/var\(--tao-color-accent\)/);
        expect(css).toMatch(/var\(--tao-stretched-radius,\s*var\(--tao-radius-panel\)\)/);
        expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/);
    });
});
