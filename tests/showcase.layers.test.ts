import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { LAYERS } from '../showcase/layers/layers.js';
// @ts-expect-error plain JS data modules of the showcase, no type declarations
import { labelOn, themeCss, themeRatings, themeVars } from '../showcase/layers/theme.js';
// @ts-expect-error Vite `?raw` import
import indexCss from '../src/styles/index.css?raw';
// @ts-expect-error Vite `?raw` import
import navSource from '../showcase/nav.js?raw';
// @ts-expect-error Vite `?raw` import
import sectionsSource from '../showcase/sections.js?raw';
// @ts-expect-error Vite `?raw` import
import darkCss from '../src/styles/themes/dark.css?raw';
import { contrastRatio } from '../src/palette';

// the section "Layers and theming" shows the real files in the order the kit imports them, and builds an own theme
// раздел «Слои и темизация» показывает настоящие файлы в том порядке, в каком набор их подключает, и собирает свою тему

describe('showcase layers: the data', () => {
    it('lists the files in the order src/styles/index.css imports them', () => {
        const imported = [...(indexCss as string).matchAll(/@import "\.\/([^"]+)"/g)].map((m) => m[1]);
        const shown = (LAYERS as { files: { name: string }[] }[]).flatMap((layer) => layer.files.map((file) => file.name));
        // the second theme is a file of the same layer; every shown file is imported, and in the same order
        const inOrder = imported.filter((name) => shown.includes(name!));
        expect(shown.filter((name) => inOrder.includes(name))).toEqual(inOrder);
        for (const name of shown) {
            expect(imported, name).toContain(name);
        }
        // nothing imported is left out
        expect(shown.sort()).toEqual([...imported].sort());
    });

    it('every file is real text, and every layer says in both languages what it is and whether it is yours to touch', () => {
        for (const layer of LAYERS) {
            expect(['no', 'rare', 'yes']).toContain(layer.touch);
            for (const file of layer.files) {
                expect(file.source.length, file.name).toBeGreaterThan(200);
            }
            for (const lang of ['en', 'ru']) {
                for (const key of ['role', 'hint', 'note']) {
                    expect(layer[lang][key], `${layer.id} ${lang} ${key}`).toMatch(/\S/);
                }
            }
        }
        expect(LAYERS.filter((layer: { touch: string }) => layer.touch === 'yes').map((layer: { id: string }) => layer.id)).toEqual(['themes']);
    });
});

describe('showcase layers: the own theme', () => {
    const values = { accent: '#8f73ff', bg: '#12141f', radius: 14 };

    it('picks the label on the accent that reads better', () => {
        expect(labelOn('#ffc04a')).toBe('#0d0d0d');
        expect(labelOn('#1a237e')).toBe('#ffffff');
    });

    it('declares again every role made from the accent, and only roles the default theme has', () => {
        const vars = Object.keys(themeVars(values));
        for (const name of vars.filter((v) => v.startsWith('--tao-color-'))) {
            expect(darkCss, name).toContain(`${name}:`);
        }
        for (const derived of ['accent-hover', 'accent-active', 'accent-subtle', 'accent-subtle-hover', 'accent-text']) {
            expect(vars).toContain(`--tao-color-${derived}`);
        }
    });

    it('writes the corners on the roles components read, not on a primitive that is already resolved at :root', () => {
        const vars = themeVars(values);
        expect(vars['--tao-radius-panel']).toBe('14px');
        expect(vars['--tao-radius-control']).toBe('7px');
        expect(Object.keys(vars)).not.toContain('--tao-radius-md');
    });

    it('the file is a selector with the declarations; the ratings are the promises of the palettes', () => {
        const css = themeCss(values) as string;
        expect(css.startsWith('[data-tao-theme="mine"] {')).toBe(true);
        expect(css).toContain('--tao-color-accent: #8f73ff;');
        const ratings = themeRatings(values) as { id: string; ratio: number; need: number }[];
        expect(ratings.map((row) => row.need)).toEqual([3, 4.5, 4.5]);
        expect(ratings[0]!.ratio).toBeCloseTo(contrastRatio('#8f73ff', '#12141f'), 5);
        expect(ratings[2]!.ratio).toBeGreaterThan(4.5);
    });
});

describe('showcase layers: wiring', () => {
    it('is in the menu and in the sections', () => {
        expect(navSource).toContain("id: 'layers'");
        expect(sectionsSource).toContain("'layers': DemoLayers");
    });
});
