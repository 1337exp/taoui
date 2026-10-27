import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoCalendar from '../src/components/TaoCalendar.vue';

const cell = (w: ReturnType<typeof mount>, label: string) =>
    w.findAll('[role="gridcell"]').find((el) => el.text() === label && !el.classes().includes('tao-date__day--outside'))!;
const month = (w: ReturnType<typeof mount>) => w.find('.tao-date__month').text();

describe('TaoCalendar: single', () => {
    const make = (props: Record<string, unknown> = {}) =>
        mount(TaoCalendar, { props: { modelValue: '2026-03-10', locale: 'en-US', ...props } });

    it('shows the month of the value, marks the selected day, and emits the ISO date on a click', async () => {
        const w = make();
        expect(month(w)).toContain('March');
        expect(cell(w, '10').attributes('aria-selected')).toBe('true');
        await cell(w, '15').trigger('click');
        expect(w.emitted('update:modelValue')).toEqual([['2026-03-15']]);
        expect(w.emitted('change')).toEqual([['2026-03-15']]);
    });

    it('min / max disable the days outside', async () => {
        const w = make({ min: '2026-03-05', max: '2026-03-20' });
        expect(cell(w, '25').attributes('disabled')).toBeDefined();
        expect(cell(w, '2').attributes('disabled')).toBeDefined();
        await cell(w, '25').trigger('click');
        expect(w.emitted('change')).toBeUndefined();
    });

    it('arrows move the cursor, PageDown / PageUp change the month, Enter picks the cursor day', async () => {
        const w = make();
        const root = w.find('.tao-calendar');
        await root.trigger('keydown', { key: 'ArrowRight' });
        await root.trigger('keydown', { key: 'ArrowDown' });
        await root.trigger('keydown', { key: 'Enter' });
        expect(w.emitted('change')).toEqual([['2026-03-18']]); // 10 + 1 + 7

        await root.trigger('keydown', { key: 'PageDown' });
        expect(month(w)).toContain('April');
        expect(w.emitted('view')).toBeDefined();
        await root.trigger('keydown', { key: 'PageUp' });
        await root.trigger('keydown', { key: 'PageUp' });
        expect(month(w)).toContain('February');
    });

    it('the month buttons change the month, "clear" appears with a value and emits null', async () => {
        const w = make();
        await w.findAll('.tao-date__nav')[1]!.trigger('click');
        expect(month(w)).toContain('April');
        await w.findAll('.tao-date__link')[1]!.trigger('click');
        expect(w.emitted('change')).toEqual([[null]]);
        expect(make({ modelValue: null }).findAll('.tao-date__link')).toHaveLength(1); // only "today"
    });

    it('"today" picks today', async () => {
        const w = make({ modelValue: null });
        await w.findAll('.tao-date__link')[0]!.trigger('click');
        const today = w.emitted('change')![0]![0] as string;
        expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});

describe('TaoCalendar: range', () => {
    const make = (props: Record<string, unknown> = {}) =>
        mount(TaoCalendar, { props: { mode: 'range', modelValue: null, locale: 'en-US', ...props } });

    it('the first click starts a range and emits nothing, the second completes it, in order', async () => {
        const w = make({ modelValue: { start: '2026-03-01', end: '2026-03-02' } });
        await cell(w, '14').trigger('click');
        expect(w.emitted('change')).toBeUndefined();
        await cell(w, '10').trigger('click'); // backwards: sorted
        expect(w.emitted('change')).toEqual([[{ start: '2026-03-10', end: '2026-03-14' }]]);
    });

    it('while drawing, the days between follow the pointer', async () => {
        const w = make({ modelValue: { start: '2026-03-01', end: '2026-03-02' } });
        await cell(w, '10').trigger('click');
        await cell(w, '14').trigger('mouseenter');
        const inside = w.findAll('.tao-date__day--in-range').map((el) => el.text());
        expect(inside).toEqual(['11', '12', '13']);
        expect(cell(w, '10').classes()).toContain('tao-date__day--range-start');
        expect(cell(w, '14').classes()).toContain('tao-date__day--range-end');
    });

    it('the committed range is highlighted; "today" is a one-day range', async () => {
        const w = make({ modelValue: { start: '2026-03-10', end: '2026-03-12' } });
        expect(w.findAll('.tao-date__day--selected').map((el) => el.text())).toEqual(['10', '12']);
        await w.findAll('.tao-date__link')[0]!.trigger('click');
        const range = w.emitted('change')![0]![0] as { start: string; end: string };
        expect(range.start).toBe(range.end);
    });

    it('focus() puts the focus on the calendar so its keys work', async () => {
        const w = mount(TaoCalendar, { attachTo: document.body, props: { modelValue: null } });
        await (w.vm as unknown as { focus: () => Promise<void> }).focus();
        await nextTick();
        expect(document.activeElement).toBe(w.find('.tao-calendar').element);
        w.unmount();
    });
});
