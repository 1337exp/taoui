import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-expect-error Vite `?raw` import
import app from '../showcase/App.vue?raw';

// 5.23.0: the settings bar of the showcase: the frequent options inline, the rare ones in the "View" popover, built from the kit itself.
// 5.23.0: панель настроек шоукейса: частые опции в строке, редкие в поповере «Вид», собрана из самого набора.

const styles = readFileSync(resolve(__dirname, '../showcase/styles.css'), 'utf8');

describe('showcase settings bar', () => {
    it('is made of the kit: segmented controls, a select, a popover', () => {
        const source = app as string;
        for (const name of ['TaoSegmented', 'TaoSegmentedOption', 'TaoSelect', 'TaoPopover']) {
            expect(source, name).toContain(name);
        }
        expect(source).not.toContain('theme-switcher');
    });

    it('the rare options (density, frames) are inside the popover, the frequent ones (language, palette, mode) are not', () => {
        const source = app as string;
        const popover = source.slice(source.indexOf('<TaoPopover'), source.indexOf('</TaoPopover>'));
        expect(popover).toContain('setDensity');
        expect(popover).toContain('setFrames');
        expect(popover).not.toContain('setTheme');
        expect(popover).not.toContain('setPalette');
    });

    it('every control has a name for a screen reader (no visible legend: the bar is one line)', () => {
        const source = app as string;
        const bar = source.slice(source.indexOf('<div ref="barRef"'), source.indexOf('<div class="showcase-body">'));
        const segmented = bar.match(/<TaoSegmented [^>]*>/g) ?? [];
        expect(segmented.length).toBe(4);
        for (const tag of segmented) {
            expect(tag).toContain(':aria-label=');
            expect(tag).not.toContain(':legend=');
        }
    });

    it('the brand in the bar carries the version of the build, so it is clear what you work with', () => {
        const source = app as string;
        const brand = source.slice(source.indexOf('class="showcase-bar__brand"'), source.indexOf('class="showcase-bar__controls"'));
        expect(brand).toContain('<TaoTag');
        expect(brand).toContain('v{{ version }}');
    });

    it('sticks to the top, and does not stick on a phone', () => {
        const css = styles as string;
        expect(css).toMatch(/\.showcase-bar \{[^}]*position: sticky/);
        const media = css.slice(css.lastIndexOf('@media (max-width: 860px)'));
        expect(media).toMatch(/\.showcase-bar \{\s*position: static/);
    });
});
