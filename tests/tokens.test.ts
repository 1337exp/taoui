import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import primitivesCss from '../src/styles/primitives.css?raw';
// @ts-expect-error Vite `?raw` import
import semanticCss from '../src/styles/semantic.css?raw';
// @ts-expect-error Vite `?raw` import
import lightCss from '../src/styles/themes/light.css?raw';
// @ts-expect-error Vite `?raw` import
import toneCss from '../src/styles/tone.css?raw';

/**
 * Guards for the token layers (see CONTRIBUTING.md, "Colour tokens"):
 * a theme only overrides tokens that exist, and every solid fill has a readable `on-*` text colour.
 */


function declarations(css: string): Map<string, string> {
    const out = new Map<string, string>();
    for (const [, name, value] of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(--tao-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
        out.set(name, value.trim());
    }
    return out;
}

const primitives = declarations(primitivesCss);
const semantic = declarations(semanticCss);
const light = declarations(lightCss);

/** Hooks a theme may set without them being part of semantic.css (read with a fallback by one component). */
const COMPONENT_HOOKS = new Set(['--tao-button-primary-text-shadow']);

describe('theme overrides', () => {
    it('light.css only sets tokens that semantic.css defines (or a documented component hook)', () => {
        const unknown = [...light.keys()].filter((name) => !semantic.has(name) && !COMPONENT_HOOKS.has(name));
        expect(unknown).toEqual([]);
    });

    it('every colour token of the dark theme is set by the light theme', () => {
        const colours = [...semantic.keys()].filter((name) => name.startsWith('--tao-color-'));
        const missing = colours.filter((name) => !light.has(name));
        // tokens the light theme deliberately inherits
        const inherited = new Set<string>();
        expect(missing.filter((name) => !inherited.has(name))).toEqual([]);
    });
});

function resolveValue(name: string, scope: Map<string, string>, depth = 0): string {
    if (depth > 10) throw new Error(`token loop at ${name}`);
    const value = scope.get(name);
    if (value === undefined) throw new Error(`${name} is not defined`);
    const ref = value.match(/^var\((--tao-[a-z0-9-]+)\)$/);
    return ref ? resolveValue(ref[1], scope, depth + 1) : value;
}

function luminance(hex: string): number {
    const [r, g, b] = hex
        .replace('#', '')
        .match(/../g)!
        .map((part) => parseInt(part, 16) / 255)
        .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

const themes: Record<string, Map<string, string>> = {
    dark: new Map([...primitives, ...semantic]),
    light: new Map([...primitives, ...semantic, ...light]),
};

// `--tao-color-on-X` is the text on the solid `--tao-color-X`.
const pairs = [...semantic.keys()]
    .filter((name) => name.startsWith('--tao-color-on-'))
    .map((on) => ({ on, fill: on.replace('--tao-color-on-', '--tao-color-') }))
    .filter(({ fill }) => semantic.has(fill));

describe('on-* text colours', () => {
    it('finds a pair for the accent and for every status', () => {
        expect(pairs.map((pair) => pair.fill)).toEqual(
            expect.arrayContaining(['--tao-color-accent', '--tao-color-danger', '--tao-color-success', '--tao-color-warning', '--tao-color-info']),
        );
    });

    for (const [theme, scope] of Object.entries(themes)) {
        for (const { on, fill } of pairs) {
            // The light accent is the brand rose (#ff227a) with white text: 3.64:1, an accepted exception for 14px / 500 labels.
            // Every other pair has to reach AA for normal text.
            const floor = theme === 'light' && fill === '--tao-color-accent' ? 3.5 : 4.5;
            it(`${theme}: ${on} on ${fill} has at least ${floor}:1 contrast`, () => {
                expect(contrast(resolveValue(on, scope), resolveValue(fill, scope))).toBeGreaterThanOrEqual(floor);
            });
        }
    }
});

// `--tao-color-<status>-text` is the status colour as text (buttons, tags, error messages); the plain token is for fills.
const textTokens = ['danger', 'success', 'warning', 'info'].map((status) => `--tao-color-${status}-text`);

describe('status text colours', () => {
    for (const [theme, scope] of Object.entries(themes)) {
        for (const token of textTokens) {
            for (const surface of ['--tao-color-bg', '--tao-color-surface-raised']) {
                it(`${theme}: ${token} on ${surface} has at least 4.5:1 contrast`, () => {
                    expect(contrast(resolveValue(token, scope), resolveValue(surface, scope))).toBeGreaterThanOrEqual(4.5);
                });
            }
        }
    }
});

// The accent as TEXT (ghost / text Button, tone text): the plain accent is picked for a fill, this one for reading.
describe('accent text colour', () => {
    for (const [theme, scope] of Object.entries(themes)) {
        for (const token of ['--tao-color-accent-text', '--tao-color-accent-text-hover']) {
            for (const surface of ['--tao-color-bg', '--tao-color-surface-raised']) {
                it(`${theme}: ${token} on ${surface} has at least 4.5:1 contrast`, () => {
                    expect(contrast(resolveValue(token, scope), resolveValue(surface, scope))).toBeGreaterThanOrEqual(4.5);
                });
            }
        }
    }
});

// styles/tone.css: `.tao-tone-<name>` sets the `--tao-tone*` tokens, and a component reads only those.
const TONE_TOKENS = ['', '-hover', '-on', '-text', '-text-hover', '-subtle', '-wash'].map((suffix) => `--tao-tone${suffix}`);
const toneBlocks = new Map<string, Map<string, string>>(
    [...(toneCss as string).replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\.tao-tone-([a-z]+)\s*\{([^}]*)\}/g)].map((m) => [m[1]!, declarations(m[2]!)]),
);

describe('tone context', () => {
    it('has the accent and every status tone', () => {
        expect([...toneBlocks.keys()].sort()).toEqual(['accent', 'danger', 'info', 'neutral', 'success', 'warning']);
    });

    for (const [name, block] of toneBlocks) {
        it(`${name} sets every --tao-tone* token`, () => {
            expect(TONE_TOKENS.filter((token) => !block.has(token))).toEqual([]);
        });

        it(`${name} points only at tokens that semantic.css defines`, () => {
            const refs = [...block.values()].flatMap((value) => [...value.matchAll(/var\((--tao-[a-z0-9-]+)\)/g)].map((m) => m[1]!));
            expect(refs.filter((ref) => !semantic.has(ref))).toEqual([]);
        });
    }

    for (const [theme, scope] of Object.entries(themes)) {
        for (const [name, block] of toneBlocks) {
            for (const surface of ['--tao-color-bg', '--tao-color-surface-raised']) {
                it(`${theme}: ${name} text reads at 4.5:1 on ${surface}`, () => {
                    const text = resolveValue(block.get('--tao-tone-text')!.replace(/^var\((.*)\)$/, '$1'), scope);
                    expect(contrast(text, resolveValue(surface, scope))).toBeGreaterThanOrEqual(4.5);
                });
            }
        }
    }
});

// Components take layers and transitions from tokens, not literals.
const componentSources = (import.meta as unknown as { glob: (p: string, o: object) => unknown }).glob('../src/components/*.vue', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('component styles use tokens', () => {
    it('no component writes a literal z-index above content', () => {
        const offenders = Object.entries(componentSources)
            .filter(([, source]) => /z-index:\s*\d{3,}/.test(source))
            .map(([file]) => file);
        expect(offenders).toEqual([]);
    });

    it('--tao-transition-base does not animate `all`', () => {
        expect(semanticCss).toMatch(/--tao-transition-base:/);
        const value = (semantic.get('--tao-transition-base') ?? '').trim();
        expect(value).not.toMatch(/^all/);
    });

    it('no component transitions `all`', () => {
        const offenders = Object.entries(componentSources)
            .filter(([, source]) => /transition:\s*all/.test(source))
            .map(([file]) => file);
        expect(offenders).toEqual([]);
    });
});
