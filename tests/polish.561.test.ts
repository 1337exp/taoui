import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import darkCss from '../src/styles/themes/dark.css?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import: the stylesheet as text
import toneCss from '../src/styles/contexts/tone.css?raw';
// @ts-expect-error Vite `?raw` import: the component as text
import selectSfc from '../src/components/TaoSelect.vue?raw';
// @ts-expect-error Vite `?raw` import: the component as text
import dateSfc from '../src/components/TaoDate.vue?raw';
// @ts-expect-error Vite `?raw` import: the component as text
import rangeSfc from '../src/components/TaoDateRange.vue?raw';
// @ts-expect-error Vite `?raw` import: the component as text
import menuSfc from '../src/components/TaoMenu.vue?raw';
// @ts-expect-error Vite `?raw` import: the component as text
import tagSfc from '../src/components/TaoTag.vue?raw';

// 5.6.1: no flash on a field that opens a list; a hover that shows on any fill; the neutral hover a step, not a jump.
// 5.6.1: без вспышки у поля со списком; подсветка, видная на любой заливке; наведение нейтрального тона — шаг, а не скачок.

describe('a field that opens a list stays lit while it is open', () => {
    it.each([
        ['TaoSelect', selectSfc, 'tao-select'],
        ['TaoDate', dateSfc, 'tao-date'],
        ['TaoDateRange', rangeSfc, 'tao-date-range'],
    ])('%s', (_, sfc, block) => {
        expect(sfc as string).toContain(`.${block}__trigger:focus,\n.${block}--open .${block}__trigger {`);
    });

    it('the editable date field too', () => {
        expect(dateSfc as string).toContain('.tao-date__field:focus-within,\n.tao-date--open .tao-date__field {');
    });
});

describe('the hover wash', () => {
    it('both themes define it as a see-through wash of the strong text', () => {
        for (const css of [darkCss, lightCss] as string[]) {
            expect(css).toMatch(/--tao-color-hover: color-mix\(in srgb, var\(--tao-color-text-strong\) \d+%, transparent\);/);
        }
    });

    it('menu rows use it, not the solid surface-hover', () => {
        expect(menuSfc as string).toMatch(/\.tao-menu__item--active \{[^}]*background-color: var\(--tao-color-hover\)/);
        expect(menuSfc as string).not.toContain('surface-hover');
    });
});

describe('the neutral tone under the pointer', () => {
    it('is its own role, a step from the fill in both themes', () => {
        expect(toneCss as string).toMatch(/\.tao-tone-neutral \{[^}]*--tao-tone-hover: var\(--tao-color-neutral-hover\)/);
        expect(darkCss as string).toContain('--tao-color-neutral-hover: color-mix(in srgb, var(--tao-color-text-muted) 78%, var(--tao-color-bg));');
        expect(lightCss as string).toContain('--tao-color-neutral-hover: color-mix(in srgb, var(--tao-color-text-muted) 78%, var(--tao-color-text-strong));');
    });
});

describe('TaoTag', () => {
    it('keeps its text in the middle when it is wider than the text', () => {
        expect(tagSfc as string).toMatch(/\.tao-tag \{[^}]*justify-content: center;[^}]*text-align: center;/);
    });

    it('centres the letters, not the line box, where text-box is supported; the padding keeps the ascenders', () => {
        expect(tagSfc as string).toMatch(
            /@supports \(text-box: trim-both ex alphabetic\) \{\s*\.tao-tag__text \{\s*text-box: trim-both ex alphabetic;\s*padding-block: 0\.3em;/,
        );
    });
});
