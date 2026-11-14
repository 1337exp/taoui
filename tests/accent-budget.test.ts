import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/**
 * The accent budget (showcase/guide/patterns/meta.js): the accent is for the main action, what is chosen or current, and the
 * focus. What the pointer is over is neutral. This reads the CSS of every component and of the contexts and fails on a rule that
 * tints a hover or a highlighted row with the accent. A solid accent control may go to `accent-hover` and `on-accent`: those are not
 * the accent roles checked here.
 * Бюджет акцента: акцент для главного действия, выбранного или текущего и фокуса. То, над чем курсор, нейтрально. Тест читает CSS и
 * падает на правиле, которое красит наведение или подсвеченную строку акцентом.
 */
const files = [
    ...readdirSync('src/components').filter((f) => f.endsWith('.vue')).map((f) => `src/components/${f}`),
    ...readdirSync('src/styles/contexts').filter((f) => f.endsWith('.css')).map((f) => `src/styles/contexts/${f}`),
];

/** An accent role: the accent itself, its subtle fills and its text colours (not `accent-hover` and not `on-accent`). */
const ACCENT_ROLE = /var\(--tao-color-accent(?:-subtle(?:-hover)?|-text(?:-hover)?)?\)/;
/** A property that paints. / Свойство, которое красит. */
const PAINT = /(?:^|[;\s])(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|border-color|box-shadow|fill|stroke)\s*:\s*[^;]*/g;

interface Rule {
    file: string;
    selector: string;
    body: string;
}

function rulesOf(file: string): Rule[] {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    const out: Rule[] = [];
    for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) out.push({ file, selector: m[1]!.trim().replace(/\s+/g, ' '), body: m[2]! });
    return out;
}

const rules = files.flatMap(rulesOf);
const paintsAccent = (body: string) => (body.match(PAINT) ?? []).some((decl) => ACCENT_ROLE.test(decl));

/** What a state chosen on purpose is called: the accent is allowed there even under the pointer. */
const CHOSEN = /selected|current|checked|pressed|active|open|focus|invalid|copied/;

describe('accent budget: the accent is not for what the pointer is over', () => {
    it('no :hover rule paints with an accent role, unless it is a chosen state', () => {
        const bad = rules.filter((r) => /:hover/.test(r.selector) && !CHOSEN.test(r.selector) && paintsAccent(r.body));
        expect(bad.map((r) => `${r.file}: ${r.selector}`)).toEqual([]);
    });

    it('the highlighted row of a menu and of a command list is neutral', () => {
        const rows = rules.filter((r) => r.selector === '.tao-menu__item--active' || r.selector === ".tao-command-list__option[aria-selected='true']");
        expect(rows).toHaveLength(2);
        for (const r of rows) expect(paintsAccent(r.body)).toBe(false);
    });

    it('the neutral tone has no accent in its wash (the hover of every neutral ghost control)', () => {
        const neutral = rules.find((r) => r.selector === '.tao-tone-neutral')!;
        expect(neutral.body).not.toMatch(/--tao-tone-wash:[^;]*accent/);
    });

    it('the check does see a violation (it is not blind)', () => {
        expect(paintsAccent('color: var(--tao-color-accent); background: var(--tao-color-hover)')).toBe(true);
        expect(paintsAccent('background: var(--tao-color-accent-subtle)')).toBe(true);
        expect(paintsAccent('background: var(--tao-color-accent-hover); color: var(--tao-color-on-accent)')).toBe(false);
        expect(paintsAccent('color: var(--tao-color-text-strong)')).toBe(false);
    });
});
