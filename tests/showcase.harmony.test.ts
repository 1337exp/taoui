import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { CONTROLS } from '../showcase/harmony/controls.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { LADDER, LADDER_ROLES, MELT_RATIO, hoverProblem, judge, ladderStep } from '../showcase/harmony/measure.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { hoverCopies } from '../showcase/harmony/hover.js';
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

    it('two roles of one colour: the step the control is expected to be wins', () => {
        const same = { '--tao-color-accent': '#ffc04a', '--tao-color-accent-text': '#ffc04a' };
        expect(ladderStep('#ffc04a', same)).toBe('accent');
        expect(ladderStep('#ffc04a', same, 'accent-text')).toBe('accent-text');
        // a preference that is not this colour changes nothing
        expect(ladderStep('#ffc04a', same, 'text')).toBe('accent');
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

describe('showcase harmony: the states', () => {
    const state = (step: string | null, ratio: number) => ({ step, ratio });

    it('a hover that goes up the ladder or stays is fine, if the text still reads', () => {
        expect(hoverProblem(state('text', 12), state('strong', 14))).toBeNull();
        expect(hoverProblem(state('text', 12), state('text', 12))).toBeNull();
    });

    it('a hover that makes the text unreadable is wrong, whatever the colour', () => {
        expect(hoverProblem(state('text', 12), state('strong', 3.06))).toBe('3.06:1');
    });

    it('a hover that turns a step of the ladder into a colour of no step is wrong (a stray link colour)', () => {
        expect(hoverProblem(state('text', 12), state(null, 6))).toBe('text → other');
    });

    it('a hover that makes the text dimmer is wrong', () => {
        expect(hoverProblem(state('text', 12), state('muted', 6))).toBe('text → muted');
    });

    it('a colour of no step may change into another one (an accent, a link): the ratio is all that is asked', () => {
        expect(hoverProblem(state('accent-text', 6), state('accent-text', 5))).toBeNull();
        expect(hoverProblem(state(null, 19), state(null, 4.04))).toBe('4.04:1');
    });

    it('the text that does not read on its backdrop is counted, a disabled one is not', () => {
        const items = [
            item({ id: 'a', expect: { step: 'accent' }, step: 'accent' }),
            item({ id: 'b', expect: { step: 'disabled' }, step: 'disabled' }),
        ];
        (items[0] as Item & { ratio: number }).ratio = 3.8;
        (items[1] as Item & { ratio: number }).ratio = 1.5;
        expect(verdict(items, 'read').offenders).toEqual([{ id: 'a', detail: '3.80:1' }]);
    });

    it('a hover is judged by the problem the page found', () => {
        const hovered = item({ id: 'h' }) as Item & { hover?: { problem: string | null } };
        hovered.hover = { problem: '3.06:1' };
        expect(verdict([hovered], 'hover').offenders).toEqual([{ id: 'h', detail: '3.06:1' }]);
        hovered.hover = { problem: null };
        expect(verdict([hovered], 'hover').ok).toBe(true);
    });
});

describe('showcase harmony: hover read without a pointer', () => {
    // the pieces of a style sheet the way the browser gives them / куски таблицы стилей так, как их отдаёт браузер
    const style = (selectorText: string, cssText: string) => ({ selectorText, style: { cssText } });
    class CSSMediaRule {
        conditionText: string;
        cssRules: unknown[];
        constructor(conditionText: string, cssRules: unknown[]) {
            this.conditionText = conditionText;
            this.cssRules = cssRules;
        }
    }

    it('copies the rules with :hover, puts an attribute in its place and leaves the others', () => {
        const css = hoverCopies([style('.a', 'color: red;'), style('.b:hover', 'color: blue;'), style('.c:hover .d', 'color: green;')]);
        expect(css).toEqual(['.b[data-harmony-hover] { color: blue; }', '.c[data-harmony-hover] .d { color: green; }']);
    });

    it('keeps the @media around a copy and drops a group with no hover in it', () => {
        const css = hoverCopies([new CSSMediaRule('(min-width: 600px)', [style('.a:hover', 'color: red;')]), new CSSMediaRule('print', [style('.a', 'color: red;')])]);
        expect(css).toEqual(['@media (min-width: 600px) { .a[data-harmony-hover] { color: red; } }']);
    });
});
