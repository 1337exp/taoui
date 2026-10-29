import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoNav from '../src/components/TaoNav.vue';
import TaoPagination from '../src/components/TaoPagination.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import navSource from '../src/components/TaoNav.vue?raw';

// 5.7: a page size choice for TaoPagination; a line indicator for TaoNav.
// 5.7: выбор размера страницы у TaoPagination; индикатор-черта у TaoNav.

afterEach(() => {
    document.body.innerHTML = '';
});

describe('TaoPagination pageSizes', () => {
    it('without pageSizes there is no choice', () => {
        const w = mount(TaoPagination, { props: { total: 100 } });
        expect(w.find('.tao-pagination__sizes').exists()).toBe(false);
    });

    it('a labelled choice of the sizes, showing the current one', () => {
        const w = mount(TaoPagination, { props: { total: 500, pageSize: 20, pageSizes: [10, 20, 50] }, attachTo: document.body });
        const label = w.find('label.tao-pagination__sizes');
        expect(label.text()).toContain('Per page');
        expect(label.find('.tao-select__trigger').text()).toContain('20');
    });

    it('a new size keeps the first row on screen: rows 41–60 at 20 → page 1 at 50, page 5 at 10', async () => {
        const w = mount(TaoPagination, { props: { total: 500, page: 3, pageSize: 20, pageSizes: [10, 20, 50] }, attachTo: document.body });
        const select = w.findComponent({ name: 'TaoSelect' });
        select.vm.$emit('update:modelValue', 50);
        expect(w.emitted('update:pageSize')?.[0]).toEqual([50]);
        expect(w.emitted('update:page')?.[0]).toEqual([1]);
        select.vm.$emit('update:modelValue', 10);
        expect(w.emitted('update:page')?.[1]).toEqual([5]);
    });

    it('the same size, or a disabled pagination, changes nothing', () => {
        const same = mount(TaoPagination, { props: { total: 500, pageSize: 20, pageSizes: [10, 20] } });
        same.findComponent({ name: 'TaoSelect' }).vm.$emit('update:modelValue', 20);
        expect(same.emitted('update:pageSize')).toBeUndefined();
        const off = mount(TaoPagination, { props: { total: 500, pageSize: 20, pageSizes: [10, 20], disabled: true } });
        off.findComponent({ name: 'TaoSelect' }).vm.$emit('update:modelValue', 10);
        expect(off.emitted('update:pageSize')).toBeUndefined();
    });
});

describe('TaoNav indicator', () => {
    const items = [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
    ];

    it('pill by default, line when asked', () => {
        expect(mount(TaoNav, { props: { items, modelValue: 'a' } }).classes()).toContain('tao-nav--indicator-pill');
        expect(mount(TaoNav, { props: { items, modelValue: 'a', indicator: 'line' } }).classes()).toContain('tao-nav--indicator-line');
    });

    it('the line has no tint and follows the look through --_bar', () => {
        const css = (navSource as string).replace(/\r\n/g, '\n');
        expect(css).toMatch(/\.tao-nav--indicator-line \.tao-nav__item--active,\n\.tao-nav--indicator-line \.tao-nav__item--active:hover \{[^}]*background: transparent/);
        expect(css).toMatch(/\.tao-nav--indicator-line \.tao-nav__item--active::after \{[^}]*width: calc\(var\(--_bar\) \* 20px/);
    });
});
