import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoBreadcrumb from '../src/components/TaoBreadcrumb.vue';
import TaoLink from '../src/components/TaoLink.vue';
import TaoStretchedLink from '../src/components/TaoStretchedLink.vue';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import baseCss from '../src/styles/base.css?raw';

// 5.52.0: TaoLink is underlined (a link in a line of text must not rest on colour alone; in the light theme the link is the text colour).
// 5.52.0: TaoLink подчёркнут (ссылка в строке текста не должна держаться на одном цвете; в светлой теме она цвета текста).

const css = (baseCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector: string) => css.match(new RegExp(String.raw`(?:^|\})\s*${selector}\s*\{([^}]*)\}`))?.[1] ?? '';

describe('TaoLink underline', () => {
    it('has the tao-link class and is underlined by default', () => {
        const w = mount(TaoLink, { props: { to: '/a' }, slots: { default: 'Go' } });
        expect(w.element.tagName).toBe('A');
        expect(w.classes()).toContain('tao-link');
        expect(w.classes()).not.toContain('tao-link--hover');
        expect(w.classes()).not.toContain('tao-link--none');
    });

    it('underline="hover" and "none" add a modifier, and the class of the user stays', () => {
        expect(mount(TaoLink, { props: { to: '/a', underline: 'hover' } }).classes()).toContain('tao-link--hover');
        const none = mount(TaoLink, { props: { to: '/a', underline: 'none' }, attrs: { class: 'mine' } });
        expect(none.classes()).toEqual(expect.arrayContaining(['tao-link', 'tao-link--none', 'mine']));
    });

    it('the stylesheet: a line by default, none for "none", the line back under the pointer and the focus for "hover"', () => {
        expect(rule(String.raw`\.tao-link`)).toMatch(/text-decoration:\s*underline/);
        expect(rule(String.raw`\.tao-link--hover,\s*\.tao-link--none`)).toMatch(/text-decoration:\s*none/);
        expect(rule(String.raw`\.tao-link--hover:where\(:hover, :focus-visible\)`)).toMatch(/text-decoration:\s*underline/);
    });

    it('the rule weighs a class and no more: a class of your own, written later, wins', () => {
        // a selector with an element or a second class would beat `.my-link { text-decoration: none }`
        expect(css).not.toMatch(/a\.tao-link|\.tao-link\.[a-z]/);
    });
});

describe('the links the kit makes itself', () => {
    it('TaoStretchedLink keeps its look: no line (the card is the sign), and the prop can bring it back', () => {
        expect(mount(TaoStretchedLink, { props: { to: '/a' } }).classes()).toContain('tao-link--none');
        const w = mount(TaoStretchedLink, { props: { to: '/a', underline: 'always' } });
        expect(w.classes()).toEqual(expect.arrayContaining(['tao-link', 'tao-stretched-link']));
        expect(w.classes()).not.toContain('tao-link--none');
    });

    it('a crumb shows the line under the pointer only', () => {
        const w = mount(TaoBreadcrumb, { props: { items: [{ label: 'Home', to: '/' }, { label: 'Page' }] } });
        expect(w.find('a').classes()).toEqual(expect.arrayContaining(['tao-link', 'tao-link--hover', 'tao-breadcrumb__link']));
    });
});
