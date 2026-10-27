import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` imports: the stylesheets as text
import primitivesCss from '../src/styles/primitives.css?raw';
// @ts-expect-error Vite `?raw` import
import semanticCss from '../src/styles/semantic.css?raw';
// @ts-expect-error Vite `?raw` import
import lightCss from '../src/styles/themes/light.css?raw';

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
    it('finds the accent and danger pairs', () => {
        expect(pairs.map((pair) => pair.fill)).toEqual(expect.arrayContaining(['--tao-color-accent', '--tao-color-danger']));
    });

    for (const [theme, scope] of Object.entries(themes)) {
        for (const { on, fill } of pairs) {
            it(`${theme}: ${on} on ${fill} has at least 3:1 contrast (large / bold text)`, () => {
                expect(contrast(resolveValue(on, scope), resolveValue(fill, scope))).toBeGreaterThanOrEqual(3);
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
