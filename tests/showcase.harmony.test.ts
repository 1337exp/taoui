import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { CONTROLS } from '../showcase/harmony/controls.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { LADDER, LADDER_ROLES, MELT_RATIO, judge, ladderStep } from '../showcase/harmony/measure.js';
// @ts-expect-error Vite `?raw` import
import darkCss from '../src/styles/themes/dark.css?raw';
// @ts-expect-error Vite `?raw` import
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import
import navSource from '../showcase/books/guide.nav.js?raw';
// @ts-expect-error Vite `?raw` import
import sectionsSource from '../showcase/books/guide.sections.js?raw';

// The bench "Controls side by side" measures with the browser and judges with these rules. The rules have no DOM, so they
// are held here; the data may name only steps and roles that exist.
// Стенд «Контролы рядом» мерит браузером, а судит этими правилами. DOM у них нет, поэтому их держит этот тест;
// в данных могут быть только существующие ступени и роли.

type Item = { id: string; expect: { step?: string | null; weight?: boolean; height?: boolean }; step?: string | null; weight?: number | null; height?: number | null; wanted?: number; fill?: number | null };
const item = (over: Partial<Item> & { id: string }): Item => ({ expect: {}, step: null, weight: null, height: null, wanted: 36, fill: null, ...over });
const verdict = (items: Item[], id: string) => judge(items).find((p: { id: string }) => p.id === id);

describe('showcase harmony: the data', () => {
    it('reads only roles that both default themes define', () => {
        for (const role of LADDER_ROLES as string[]) {
            expect(darkCss, `dark ${role}`).toContain(`${role}:`);
            expect(lightCss, `light ${role}`).toContain(`${role}:`);
        }
    });

    it('every control has a unique id, both languages and a step that exists', () => {
        const steps = new Set([...(LADDER as [string, string][]).map(([name]) => name), null]);
        const ids = new Set<string>();
        for (const control of CONTROLS as { id: string; en: string; ru: string; expect: { step: string | null } }[]) {
            expect(ids.has(control.id), control.id).toBe(false);
            ids.add(control.id);
            expect(control.en.length).toBeGreaterThan(2);
            expect(control.ru).toMatch(/[а-яё]/i);
            expect(steps.has(control.expect.step), control.id).toBe(true);
        }
    });
});

describe('showcase harmony: the rules', () => {
    it('names the step of the ladder a colour is, whatever its case', () => {
        const resolved = { '--tao-color-text': '#BFBFBF', '--tao-color-text-subtle': '#999999' };
        expect(ladderStep('#bfbfbf', resolved)).toBe('text');
        expect(ladderStep('#999999', resolved)).toBe('subtle');
        expect(ladderStep('#123456', resolved)).toBeNull();
    });

    it('a step is wrong when the colour is another step', () => {
        const items = [item({ id: 'a', expect: { step: 'text' }, step: 'text' }), item({ id: 'b', expect: { step: 'text' }, step: 'strong' })];
        expect(verdict(items, 'step').offenders).toEqual([{ id: 'b', detail: 'strong ≠ text' }]);
        expect(verdict(items, 'step').ok).toBe(false);
    });

    it('a control with no expected step is not judged', () => {
        expect(verdict([item({ id: 'tag', expect: { step: null }, step: 'accent' })], 'step').ok).toBe(true);
    });

    it('the weight is wrong for the one that is not the weight of most', () => {
        const items = [500, 500, 400].map((weight, n) => item({ id: `w${n}`, expect: { weight: true }, weight }));
        const weight = verdict(items, 'weight');
        expect(weight.house).toBe(500);
        expect(weight.offenders).toEqual([{ id: 'w2', detail: '400 ≠ 500' }]);
        // a control that says its weight does not matter (typed text) is not counted
        const typed = [...items.slice(0, 2), item({ id: 'input', expect: { weight: false }, weight: 400 })];
        expect(verdict(typed, 'weight').ok).toBe(true);
    });

    it('the height may be off by one pixel, not by two', () => {
        const tall = (height: number) => item({ id: 'h', expect: { height: true }, height, wanted: 36 });
        expect(verdict([tall(35)], 'height').ok).toBe(true);
        expect(verdict([tall(34)], 'height').ok).toBe(false);
    });

    it('a fill that is not seen on its surface is wrong, a control with no fill is not judged', () => {
        expect(MELT_RATIO).toBeGreaterThan(1);
        expect(verdict([item({ id: 'f', fill: 1.0 })], 'fill').ok).toBe(false);
        expect(verdict([item({ id: 'f', fill: 1.09 })], 'fill').ok).toBe(true);
        expect(verdict([item({ id: 'f', fill: null })], 'fill').checked).toBe(0);
    });
});

describe('showcase harmony: it is wired in', () => {
    it('has a navigation entry and a section', () => {
        expect(navSource).toContain("id: 'harmony'");
        expect(sectionsSource).toContain("'harmony': DemoHarmony");
    });
});
