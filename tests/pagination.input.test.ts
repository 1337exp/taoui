import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoPagination from '../src/components/TaoPagination.vue';

// Hundreds of pages are not walked by clicks: a field to type the page in, always or from a number of pages on.
// Сотни страниц кликами не пролистать: поле для ввода страницы, всегда или начиная с какого-то числа страниц.

const pages = (count: number, props: Record<string, unknown> = {}) =>
    mount(TaoPagination, { props: { page: 3, total: count * 10, pageSize: 10, ...props } });

describe('TaoPagination pageInput', () => {
    it('is off by default', () => {
        expect(pages(500).find('.tao-pagination__input').exists()).toBe(false);
    });

    it('true: always there; a number: only from that many pages on', () => {
        expect(pages(3, { pageInput: true }).find('.tao-pagination__input').exists()).toBe(true);
        expect(pages(19, { pageInput: 20 }).find('.tao-pagination__input').exists()).toBe(false);
        expect(pages(20, { pageInput: 20 }).find('.tao-pagination__input').exists()).toBe(true);
    });

    it('shows the current page as the placeholder and names the range for a screen reader', () => {
        const input = pages(340, { pageInput: true }).find('.tao-pagination__input');
        expect(input.attributes('placeholder')).toBe('3');
        expect(input.attributes('aria-label')).toBe('Go to page, 1 to 340');
        expect(input.attributes('inputmode')).toBe('numeric');
        expect(input.attributes('style')).toContain('width: 4ch');
    });

    it('Enter goes to the typed page and clears the field', async () => {
        const w = pages(340, { pageInput: true });
        const input = w.find('.tao-pagination__input');
        await input.setValue('120');
        await input.trigger('keydown', { key: 'Enter' });
        expect(w.emitted('update:page')).toEqual([[120]]);
        expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('a page out of range is clamped; not a number is dropped; leaving the field also goes', async () => {
        const w = pages(340, { pageInput: true });
        const input = w.find('.tao-pagination__input');
        await input.setValue('9000');
        await input.trigger('keydown', { key: 'Enter' });
        await input.setValue('abc');
        await input.trigger('keydown', { key: 'Enter' });
        await input.setValue('7');
        await input.trigger('blur');
        expect(w.emitted('update:page')).toEqual([[340], [7]]);
    });

    it('Escape drops what was typed; disabled pagination disables the field', async () => {
        const w = pages(340, { pageInput: true });
        const input = w.find('.tao-pagination__input');
        await input.setValue('12');
        await input.trigger('keydown', { key: 'Escape' });
        await input.trigger('blur');
        expect(w.emitted('update:page')).toBeUndefined();
        expect(pages(340, { pageInput: true, disabled: true }).find('.tao-pagination__input').attributes('disabled')).toBeDefined();
    });
});
