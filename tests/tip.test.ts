import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// 5.55.0: a hint is the opposite of the theme, and that is said in ONE place (contexts/tip.css, the class `.tao-tip`).
// TaoCopy and TaoHeatmap had drawn their own tip on `surface-raised`, the colour of the panels it hangs over, and nobody
// remembered the inversion. This guard fails for the next hint that does the same.
// 5.55.0: подсказка обратна теме, и это сказано в ОДНОМ месте (contexts/tip.css, класс `.tao-tip`). TaoCopy и TaoHeatmap
// рисовали свою подсказку на `surface-raised`, цвете панелей под ней, и про инверсию никто не вспомнил. Сторож падает
// для следующей подсказки, которая сделает то же.

const read = (path: string) => readFileSync(path, 'utf8');
const components = readdirSync('src/components')
    .filter((f) => f.endsWith('.vue'))
    .map((f) => ({ name: f, source: read(join('src/components', f)) }));

const tipCss = read('src/styles/contexts/tip.css');

/** Not a hint: the preview of a dragged row looks like the row, it uses the layer of the hints only to float above the page. / Не подсказка: образ перетаскиваемой строки выглядит как строка, слой подсказок нужен ему лишь чтобы парить над страницей. */
const NOT_A_HINT = new Set(['TaoTree.vue']);

/** The declarations of the rule that has exactly this selector, in the style blocks of a component. / Объявления правила ровно с этим селектором в блоках стилей компонента. */
function rule(source: string, selector: string): string | undefined {
    const escaped = selector.replace(/[.\\]/g, '\\$&');
    return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(source)?.[1];
}

describe('the hint surface', () => {
    it('is one class, `.tao-tip`: the opposite of the theme, with the hooks for all hints at once', () => {
        const body = rule(tipCss, '.tao-tip')!;
        expect(body).toContain('--_tip-bg: var(--tao-tooltip-bg, var(--tao-color-text-strong))');
        expect(body).toContain('background: var(--_tip-bg)');
        expect(body).toContain('color: var(--tao-tooltip-text, var(--tao-color-bg))');
        expect(body).toContain('font-weight: var(--tao-tooltip-weight, 600)');
    });

    it('is part of the style entry', () => {
        expect(read('src/styles/index.css')).toContain('@import "./contexts/tip.css"');
    });

    it('the colour of the hints is worked out in one file: no component repeats the hook', () => {
        const repeats = components.filter(({ source }) => source.includes('var(--tao-tooltip-bg')).map(({ name }) => name);
        expect(repeats).toEqual([]);
    });
});

describe('every hint of the kit wears it', () => {
    // a hint is what takes the layer of the hints, or names its root a tip / tooltip
    // подсказка — это то, что занимает слой подсказок или называет корень tip / tooltip
    const hints = components.filter(
        ({ name, source }) => !NOT_A_HINT.has(name) && (/--tao-z-tooltip/.test(source) || /\n\.tao-[\w-]*(?:__tip|tooltip)\s*\{/.test(source)),
    );

    it('finds the hints we know', () => {
        expect(hints.map(({ name }) => name).sort()).toEqual(['TaoCopy.vue', 'TaoHeatmap.vue', 'TaoTooltip.vue']);
    });

    it.each(hints.map(({ name, source }) => [name, source] as const))('%s: the root of the hint has the class tao-tip', (_name, source) => {
        expect(source).toMatch(/class="[^"]*\btao-tip\b[^"]*"/);
    });

    it.each(hints.map(({ name, source }) => [name, source] as const))('%s: draws no colour, shadow or radius of its own', (_name, source) => {
        const root = /\n(\.tao-[\w-]*(?:__tip|tooltip))\s*\{/.exec(source)?.[1];
        expect(root).toBeTruthy();
        const body = rule(source, root!)!;
        for (const property of ['background', 'color', 'box-shadow', 'border-radius', 'font-size', 'font-weight']) {
            expect(body, `${root} must not set ${property}`).not.toMatch(new RegExp(`(?:^|[;\\s])${property}\\s*:`));
        }
    });

    it('an arrow takes the colour of its hint, not a colour of its own', () => {
        for (const { source } of hints) {
            for (const match of source.matchAll(/\n(\.tao-[\w-]*(?:arrow|__tip::after)[\w-]*(?:::after)?)\s*\{([^}]*)\}/g)) {
                if (/background\s*:/.test(match[2]!)) {
                    expect(match[2], match[1]).toContain('background: var(--_tip-bg)');
                }
            }
        }
    });
});

describe('the chart theme', () => {
    const chart = read('src/chart.ts');

    it('gives a chart library the same hint colours: the opposite of the theme, by the same hooks', () => {
        expect(chart).toContain("tooltip: color('--tao-tooltip-bg, var(--tao-color-text-strong)')");
        expect(chart).toContain("tooltipText: color('--tao-tooltip-text, var(--tao-color-bg)')");
        expect(chart).not.toMatch(/tooltip:\s*color\('--tao-color-surface-raised'\)/);
    });
});
