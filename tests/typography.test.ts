import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import typographyCss from '../src/styles/typography.css?raw';
// @ts-expect-error Vite `?raw` import
import indexCss from '../src/styles/index.css?raw';

// The typography layer: a heading scale from a base and a ratio, an opt-in .tao-prose, heading classes for any tag.
// Слой типографики: шкала заголовков из базы и коэффициента, .tao-prose по выбору, классы заголовков для любого тега.

const css = (typographyCss as string).replace(/\/\*[\s\S]*?\*\//g, '');
/** Splits a selector list on the commas outside parentheses. / Делит список селекторов по запятым вне скобок. */
function splitSelectors(list: string): string[] {
    const out: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of list) {
        depth += ch === '(' ? 1 : ch === ')' ? -1 : 0;
        if (ch === ',' && depth === 0) {
            out.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    out.push(current.trim());
    return out;
}
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selectors, body]) => ({
    selectors: splitSelectors(selectors!),
    body: body!,
}));
const declarations = (body: string) => Object.fromEntries([...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1]!, m[2]!.trim()]));

/** Evaluates the heading chain with a base and a ratio, the way the browser does. / Считает шкалу, как браузер. */
function scale(base: number, ratio: number): number[] {
    const steps = rules.find((r) => r.selectors.includes('.tao-prose') && r.body.includes('--tao-heading-6'))!;
    const vars = declarations(steps.body);
    const value = (name: string): number => {
        const expr = vars[name]!;
        if (expr === 'var(--tao-text-base)') {
            return base;
        }
        const m = /^calc\(var\((--[a-z0-9-]+)\) \* var\(--tao-text-ratio\)\)$/.exec(expr);
        if (!m) {
            throw new Error(`unexpected ${name}: ${expr}`);
        }
        return (m[1] === '--tao-text-base' ? base : value(m[1]!)) * ratio;
    };
    return [1, 2, 3, 4, 5, 6].map((n) => Math.round(value(`--tao-heading-${n}`) * 100) / 100);
}

describe('typography', () => {
    it('is part of the stylesheet', () => {
        expect(indexCss).toContain('@import "./typography.css";');
    });

    it('base 16 and ratio 1.25 by default give 49 / 39 / 31 / 25 / 20 / 16', () => {
        const root = declarations(rules.find((r) => r.selectors.length === 1 && r.selectors[0] === ':root')!.body);
        expect(root['--tao-text-base']).toBe('16px');
        expect(root['--tao-text-ratio']).toBe('1.25');
        expect(scale(16, 1.25)).toEqual([48.83, 39.06, 31.25, 25, 20, 16]);
    });

    it('another ratio is the whole scale at once (1.2: a calmer page)', () => {
        expect(scale(16, 1.2)).toEqual([39.81, 33.18, 27.65, 23.04, 19.2, 16]);
    });

    it('the steps are recomputed on .tao-prose and on every heading class, so a ratio set on a wrapper reaches them', () => {
        const steps = rules.find((r) => r.body.includes('--tao-heading-6:'))!;
        expect(steps.selectors).toEqual(expect.arrayContaining([':root', '.tao-prose', '.tao-heading-1', '.tao-heading-6']));
    });

    it('h1 and h2 shrink on a narrow screen, never below the level two steps down', () => {
        const steps = declarations(rules.find((r) => r.body.includes('--tao-heading-1-fluid'))!.body);
        expect(steps['--tao-heading-1-fluid']).toMatch(/^clamp\(var\(--tao-heading-3\), .+, var\(--tao-heading-1\)\)$/);
        expect(steps['--tao-heading-2-fluid']).toMatch(/^clamp\(var\(--tao-heading-4\), .+, var\(--tao-heading-2\)\)$/);
    });

    it('nothing touches a bare element: every element rule is scoped to .tao-prose', () => {
        const bare = rules.flatMap((r) => r.selectors).filter((s) => /^(h[1-6]|p|ul|ol|a|code|pre|blockquote|hr|body)\b/.test(s));
        expect(bare).toEqual([]);
    });

    it('the rules inside .tao-prose weigh nothing against your CSS (:where)', () => {
        const prose = rules.flatMap((r) => r.selectors).filter((s) => s.startsWith('.tao-prose '));
        expect(prose.length).toBeGreaterThan(10);
        for (const selector of prose) {
            expect(selector, selector).toMatch(/^\.tao-prose (> )?:where\(/);
        }
    });

    it('heading classes give any tag the look of a level, after the prose rules so h2.tao-heading-4 is a level 4', () => {
        const order = rules.map((r) => r.selectors.join(','));
        const proseH2 = order.findIndex((s) => s === '.tao-prose :where(h2)');
        const class4 = order.findIndex((s) => s === '.tao-heading-4');
        expect(proseH2).toBeGreaterThanOrEqual(0);
        expect(class4).toBeGreaterThan(proseH2);
        expect(rules[class4]!.body).toContain('font-size: var(--tao-heading-4)');
    });

    it('colours come from roles: headings strong, links the link colour, code on a sunken surface', () => {
        expect(css).toMatch(/\.tao-prose :where\(a\) \{[^}]*var\(--tao-color-link\)/);
        expect(css).toMatch(/\.tao-prose :where\(code\) \{[^}]*var\(--tao-color-surface-sunken\)/);
        expect(css).not.toMatch(/#[0-9a-f]{3,6}\b/i);
    });
});
