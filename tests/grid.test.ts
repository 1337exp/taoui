import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoGrid from '../src/components/TaoGrid.vue';
import TaoGridItem from '../src/components/TaoGridItem.vue';
import { FULL_SPAN, perSize, spanNumber } from '../src/grid';
// @ts-expect-error Vite `?raw` imports: the component source as text
import gridSource from '../src/components/TaoGrid.vue?raw';
// @ts-expect-error Vite `?raw` import
import itemSource from '../src/components/TaoGridItem.vue?raw';

// An adaptive bento: values per width class of the grid itself, mobile first; spans never run past the columns.
// Адаптивный bento: значения по классам ширины самой сетки, от меньшего; охват не вылезает за колонки.

describe('perSize', () => {
    it('a plain value is the same everywhere, or another one on compact when asked', () => {
        expect(perSize(4, 1)).toEqual({ compact: 4, medium: 4, expanded: 4 });
        expect(perSize(4, 1, 1)).toEqual({ compact: 1, medium: 4, expanded: 4 });
    });

    it('an object fills the missing classes from the smaller one, mobile first', () => {
        expect(perSize({ compact: 3, expanded: 6 }, 1)).toEqual({ compact: 3, medium: 3, expanded: 6 });
        expect(perSize({ medium: 2 }, 1)).toEqual({ compact: 1, medium: 2, expanded: 2 });
        expect(perSize(undefined, 0)).toEqual({ compact: 0, medium: 0, expanded: 0 });
    });

    it("'full' is a span larger than any grid", () => {
        expect(spanNumber('full')).toBe(FULL_SPAN);
        expect(spanNumber(0)).toBe(1);
        expect(spanNumber(2.4)).toBe(2);
    });
});

const style = (el: Element) => (el as HTMLElement).getAttribute('style') ?? '';

describe('TaoGrid', () => {
    it('the outer element measures, the inner one lays out (a container cannot ask about itself)', () => {
        const w = mount(TaoGrid, { slots: { default: () => h('i') } });
        expect(w.classes()).toContain('tao-grid');
        expect(w.find('.tao-grid__cells').exists()).toBe(true);
        expect(gridSource).toContain('container: tao-grid / inline-size');
        expect(gridSource).toMatch(/\.tao-grid__cells \{[^}]*display: grid/);
    });

    it('a catalog (min) is not a bento and sets no columns', () => {
        const w = mount(TaoGrid, { props: { min: 180 } });
        expect(w.classes()).not.toContain('tao-grid--fixed');
        expect(style(w.element)).toContain('--tao-grid-min: 180px');
        expect(style(w.element)).not.toContain('--_tao-cols');
    });

    it('plain cols: one column on compact (a phone), the number from medium on', () => {
        const w = mount(TaoGrid, { props: { cols: 4 } });
        expect(w.classes()).toContain('tao-grid--fixed');
        expect(style(w.element)).toContain('--_tao-cols-compact: 1; --_tao-cols-medium: 4; --_tao-cols-expanded: 4');
    });

    it('cols per width class', () => {
        const w = mount(TaoGrid, { props: { cols: { compact: 3, expanded: 6 } } });
        expect(style(w.element)).toContain('--_tao-cols-compact: 3; --_tao-cols-medium: 3; --_tao-cols-expanded: 6');
    });

    it('the width classes are 600px and 840px of the grid itself, as in TaoNav', () => {
        expect(gridSource).toContain('@container tao-grid (width >= 600px)');
        expect(gridSource).toContain('@container tao-grid (width >= 840px)');
        expect(itemSource).toContain('@container tao-grid (width >= 600px)');
        expect(itemSource).toContain('@container tao-grid (width >= 840px)');
    });

    it('rowHeight gives the rows a minimum height, so a 2-row tile looks taller', () => {
        expect(style(mount(TaoGrid, { props: { cols: 4, rowHeight: 80 } }).element)).toContain('--tao-grid-row-height: 80px');
        expect(gridSource).toContain('grid-auto-rows: minmax(var(--tao-grid-row-height, auto), auto)');
    });
});

describe('TaoGridItem', () => {
    it('plain col and row: the same col everywhere, one row on compact', () => {
        const s = style(mount(TaoGridItem, { props: { col: 2, row: 2 } }).element);
        expect(s).toContain('--_tao-col-compact: 2; --_tao-col-medium: 2; --_tao-col-expanded: 2');
        expect(s).toContain('--_tao-row-compact: 1; --_tao-row-medium: 2; --_tao-row-expanded: 2');
    });

    it("per class, with 'full' and order: the side block goes last on a phone", () => {
        const s = style(mount(TaoGridItem, { props: { col: { compact: 'full', expanded: 2 }, order: { compact: 9, expanded: 0 } } }).element);
        expect(s).toContain(`--_tao-col-compact: ${FULL_SPAN}; --_tao-col-medium: ${FULL_SPAN}; --_tao-col-expanded: 2`);
        expect(s).toContain('--_tao-order-compact: 9; --_tao-order-medium: 9; --_tao-order-expanded: 0');
    });

    it('a span is clamped to the columns there are (no implicit columns), 1 in a catalog', () => {
        expect(itemSource).toContain('grid-column: span min(var(--_tao-col), var(--_tao-cols, 1))');
    });
});
