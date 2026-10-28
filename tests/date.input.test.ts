import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import TaoDate from '../src/components/TaoDate.vue';
import { formatTaoDateShort, parseTaoDateInput, taoDateOrder } from '../src/date';

// 5.6: typing a date, as the old Next Up did: 5, 5.3, 05.03.26.
// 5.6: ввод даты с клавиатуры, как в старом Next Up.

const ru = { locale: 'ru-RU', reference: '2026-10-29' };
const us = { locale: 'en-US', reference: '2026-10-29' };

describe('the order of a locale', () => {
    it('day-month-year, month-day-year, year-month-day', () => {
        expect(taoDateOrder('ru-RU')).toEqual(['d', 'm', 'y']);
        expect(taoDateOrder('en-US')).toEqual(['m', 'd', 'y']);
        expect(taoDateOrder('ja-JP')).toEqual(['y', 'm', 'd']);
    });

    it('the field writes a date in numbers, as the locale does', () => {
        expect(formatTaoDateShort('2026-03-05', 'ru-RU')).toBe('05.03.2026');
        expect(formatTaoDateShort('2026-03-05', 'en-US')).toBe('03/05/2026');
    });
});

describe('parseTaoDateInput', () => {
    it.each([
        ['5', '2026-10-05'],
        ['5.3', '2026-03-05'],
        ['5/3', '2026-03-05'],
        ['5 3', '2026-03-05'],
        ['5,3', '2026-03-05'],
        ['05.03.26', '2026-03-05'],
        ['5.3.2026', '2026-03-05'],
        ['0503', '2026-03-05'],
        ['050326', '2026-03-05'],
        ['05032026', '2026-03-05'],
        ['2026-03-05', '2026-03-05'],
        ['1.1.99', '1999-01-01'],
        ['  29.2.28 ', '2028-02-29'],
    ])('ru: %s → %s', (text, iso) => {
        expect(parseTaoDateInput(text, ru)).toBe(iso);
    });

    it('en-US reads the month first', () => {
        expect(parseTaoDateInput('3/5', us)).toBe('2026-03-05');
        expect(parseTaoDateInput('5.3', us)).toBe('2026-05-03');
        expect(parseTaoDateInput('3/5/26', us)).toBe('2026-03-05');
    });

    it('ja-JP: a full date starts with the year, a short one is month and day', () => {
        expect(parseTaoDateInput('2026/3/5', { locale: 'ja-JP', reference: '2026-10-29' })).toBe('2026-03-05');
        expect(parseTaoDateInput('3/5', { locale: 'ja-JP', reference: '2026-10-29' })).toBe('2026-03-05');
    });

    it.each(['', 'abc', '31.02', '32', '5.13', '5.3.202', '1.2.3.4', '12345', '5a'])('ru: «%s» is not a date', (text) => {
        expect(parseTaoDateInput(text, ru)).toBeNull();
    });

    it('a partial date is completed from the reference', () => {
        expect(parseTaoDateInput('5', { locale: 'ru-RU', reference: '2025-01-20' })).toBe('2025-01-05');
    });
});

describe('TaoDate editable', () => {
    const mountDate = (props: Record<string, unknown> = {}) =>
        mount(TaoDate, { props: { editable: true, locale: 'ru-RU', modelValue: '2026-10-29', ...props }, attachTo: document.body });
    const value = (w: ReturnType<typeof mountDate>) => (w.find('input').element as HTMLInputElement).value;

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('is a text field with the date in numbers and a calendar button', () => {
        const w = mountDate();
        expect(value(w)).toBe('29.10.2026');
        expect(w.find('.tao-date__toggle').attributes('aria-haspopup')).toBe('dialog');
        expect(w.find('.tao-date__toggle').attributes('aria-label')).toBeTruthy();
    });

    it('applies the typed text on Enter and on leaving the field', async () => {
        const w = mountDate();
        const input = w.find('input');
        await input.setValue('5.3');
        await input.trigger('keydown', { key: 'Enter' });
        expect(w.emitted('update:modelValue')?.[0]).toEqual(['2026-03-05']);
        expect(w.emitted('change')?.[0]).toEqual(['2026-03-05']);
        await w.setProps({ modelValue: '2026-03-05' });
        expect(value(w)).toBe('05.03.2026');

        await input.setValue('7');
        await input.trigger('blur');
        expect(w.emitted('update:modelValue')?.[1]).toEqual(['2026-03-07']);
    });

    it('a text that is not a date, or a date out of range, puts the value back', async () => {
        const w = mountDate({ max: '2026-12-31' });
        const input = w.find('input');
        await input.setValue('31.02');
        await input.trigger('blur');
        expect(value(w)).toBe('29.10.2026');
        await input.setValue('1.1.27');
        await input.trigger('blur');
        expect(value(w)).toBe('29.10.2026');
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('an empty field clears; the same date emits nothing', async () => {
        const w = mountDate();
        const input = w.find('input');
        await input.setValue('29.10.2026');
        await input.trigger('blur');
        expect(w.emitted('update:modelValue')).toBeUndefined();
        await input.setValue('');
        await input.trigger('blur');
        expect(w.emitted('update:modelValue')?.[0]).toEqual([null]);
    });

    it('Esc drops the typing and keeps the value', async () => {
        const w = mountDate();
        const input = w.find('input');
        await input.setValue('1.1');
        await input.trigger('keydown', { key: 'Escape' });
        expect(value(w)).toBe('29.10.2026');
        await input.trigger('blur');
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('your own parse and format are used; ↓ opens the calendar', async () => {
        const w = mountDate({ parse: (t: string) => (t === 'завтра' ? '2026-10-30' : null), format: (iso: string) => `[${iso}]` });
        const input = w.find('input');
        expect(value(w)).toBe('[2026-10-29]');
        await input.setValue('завтра');
        await input.trigger('keydown', { key: 'Enter' });
        expect(w.emitted('update:modelValue')?.[0]).toEqual(['2026-10-30']);
        await input.trigger('keydown', { key: 'ArrowDown' });
        expect(document.querySelector('.tao-date__panel')).not.toBeNull();
    });

    it('without editable it is the button as before', () => {
        const w = mount(TaoDate, { props: { modelValue: '2026-10-29' } });
        expect(w.find('input').exists()).toBe(false);
        expect(w.find('.tao-date__trigger').attributes('role')).toBe('combobox');
    });
});
