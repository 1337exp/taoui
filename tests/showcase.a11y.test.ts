import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { ALL_ROLES, FILL_RATIO, LAB_ROWS, PAIRS, PROMISES, ROLE_ROWS, TEXT_RATIO } from '../showcase/a11y/pairs.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { KEYS } from '../showcase/a11y/keys.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { hslToHex } from '../showcase/a11y/colors.js';
// @ts-expect-error Vite `?raw` import
import darkCss from '../src/styles/themes/dark.css?raw';
// @ts-expect-error Vite `?raw` import
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import
import navSource from '../showcase/books/guide.nav.js?raw';
// @ts-expect-error Vite `?raw` import
import sectionsSource from '../showcase/books/guide.sections.js?raw';
import { MIN_STATUS_DISTANCE } from '../src/palette';

// the section "Contrast and keyboard" reads these data modules: they may name only roles that exist, and promise only
// the numbers the palettes are tested for
// раздел «Контраст и клавиатура» читает эти модули: в них могут быть только существующие роли и только те числа,
// на которые палитры проверены тестами

describe('showcase a11y: the data', () => {
    it('reads only roles that both default themes define', () => {
        for (const role of ALL_ROLES as string[]) {
            expect(darkCss, `dark ${role}`).toContain(`${role}:`);
            expect(lightCss, `light ${role}`).toContain(`${role}:`);
        }
    });

    it('asks for 4.5:1 of a text and 3:1 of a fill, nothing else', () => {
        const needs = [...ROLE_ROWS, ...PAIRS, ...LAB_ROWS].map((row: { need?: number }) => row.need).filter(Boolean);
        expect(new Set(needs)).toEqual(new Set([TEXT_RATIO, FILL_RATIO]));
        expect(TEXT_RATIO).toBe(4.5);
        expect(FILL_RATIO).toBe(3);
    });

    it('promises the status distance the palettes are built with', () => {
        expect(PROMISES.map((p: { value: string }) => p.value)).toContain(`≥ ${MIN_STATUS_DISTANCE}`);
    });

    it('every key card has keys and both languages', () => {
        for (const row of KEYS as { keys: string[]; en: string; ru: string }[]) {
            expect(row.keys.length).toBeGreaterThan(0);
            expect(row.en.length).toBeGreaterThan(10);
            expect(row.ru).toMatch(/[а-яё]/i);
        }
    });

    it('a colour from hsl is a hex the maths agrees with', () => {
        expect(hslToHex(0, 100, 50)).toBe('#ff0000');
        expect(hslToHex(120, 100, 25)).toBe('#008000');
        expect(hslToHex(0, 0, 100)).toBe('#ffffff');
    });
});

describe('showcase a11y: it is wired in', () => {
    it('has a navigation entry and a section', () => {
        expect(navSource).toContain("id: 'a11y'");
        expect(sectionsSource).toContain("'a11y': DemoA11y");
    });
});
