import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';
// @ts-expect-error a plain .mjs build script with no declarations
import { TAO_LAYERS, taoLayers } from '../scripts/postcssTaoLayers.mjs';

// The kit lives in the layers `tao.*`, an app's own CSS is outside of them and wins whatever the specificity.
// Набор живёт в слоях `tao.*`, собственный CSS приложения вне их и побеждает при любой специфичности.

const root = resolve(__dirname, '..');
const indexCss = readFileSync(resolve(root, 'src/styles/index.css'), 'utf8');
const run = (css: string, from: string) => postcss([taoLayers(resolve(root, 'src'))]).process(css, { from }).css;

describe('the core stylesheet', () => {
    it('declares the order of the layers first', () => {
        expect(indexCss).toContain(`@layer ${TAO_LAYERS.join(', ')};`);
        expect(indexCss.indexOf('@layer tao.tokens,')).toBeLessThan(indexCss.indexOf('@import'));
    });

    it('puts every file it imports into a layer', () => {
        const imports = indexCss.match(/^@import .*;$/gm) ?? [];
        expect(imports.length).toBeGreaterThan(10);
        for (const line of imports) {
            expect(line).toMatch(/layer\(tao\.[a-z]+\);$/);
        }
    });

    it('tokens < themes < base < typography < contexts < components', () => {
        expect(TAO_LAYERS).toEqual(['tao.tokens', 'tao.themes', 'tao.base', 'tao.typography', 'tao.contexts', 'tao.components']);
    });
});

describe('the component CSS plugin', () => {
    const rule = '.a[data-v-1]{color:red}';

    it('wraps the style of a component of the kit in tao.components, order of the layers first', () => {
        const out = run(rule, resolve(root, 'src/components/TaoButton.vue?vue&type=style&index=0&scoped=true&lang.css'));
        expect(out).toContain(`@layer ${TAO_LAYERS.join(', ')};`);
        expect(out).toMatch(/@layer tao\.components\s*\{/);
        expect(out).toContain('.a[data-v-1]{color:red}');
        expect(out.indexOf('@layer tao.tokens')).toBeLessThan(out.indexOf('@layer tao.components'));
    });

    it('wraps the stylesheet a component imports (the date panel)', () => {
        expect(run(rule, resolve(root, 'src/styles/date-popup.css'))).toMatch(/@layer tao\.components\s*\{/);
    });

    it('leaves the core stylesheet to its own imports, the palettes to beat the theme, an app to be outside', () => {
        expect(run(rule, resolve(root, 'src/styles/contexts/surface.css'))).toBe(rule);
        expect(run(rule, resolve(root, 'src/styles/palettes/lagoon.css'))).toBe(rule);
        expect(run(rule, resolve(root, 'showcase/components/DemoCard.vue'))).toBe(rule);
        expect(run(rule, resolve(root, 'showcase/styles.css'))).toBe(rule);
    });
});
