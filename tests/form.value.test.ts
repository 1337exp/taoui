import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import TaoColorInput from '../src/components/TaoColorInput.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDate from '../src/components/TaoDate.vue';
import TaoDateRange from '../src/components/TaoDateRange.vue';
import TaoPinCode from '../src/components/TaoPinCode.vue';
import TaoRangeSlider from '../src/components/TaoRangeSlider.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoSlider from '../src/components/TaoSlider.vue';

// A control that is not a native input still takes part in a form: it submits its value (`FormData`) and is validated (`required`),
// through a hidden input (TaoFormValue).
// Контрол, который не нативный input, всё равно участвует в форме: отправляет значение (`FormData`) и проверяется (`required`)
// через скрытый input (TaoFormValue).

afterEach(() => {
    document.body.innerHTML = '';
});

/** Mounts a control inside a real `<form>` and gives the form back. */
function inForm(component: unknown, props: Record<string, unknown>) {
    const form = document.createElement('form');
    document.body.appendChild(form);
    const w = mount(component as never, { props: props as never, attachTo: form });
    return { w, form, data: () => Object.fromEntries(new FormData(form).entries()) as Record<string, string> };
}

const items = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Bravo' },
];

describe('what a form submits', () => {
    it('TaoSelect: the id of the pick, not its label', () => {
        expect(inForm(TaoSelect, { items, modelValue: 'b', name: 'letter' }).data()).toEqual({ letter: 'b' });
    });

    it('TaoSelect: an empty pick submits an empty value', () => {
        expect(inForm(TaoSelect, { items, modelValue: null, name: 'letter' }).data()).toEqual({ letter: '' });
    });

    it('TaoCombobox: the id of the pick, not the text in its input', () => {
        const { data, w } = inForm(TaoCombobox, { items, modelValue: 'a', name: 'letter' });
        expect((w.find('input[role="combobox"]').element as HTMLInputElement).value).toBe('Alpha');
        expect(data()).toEqual({ letter: 'a' });
    });

    it('TaoDate: the ISO date, in both forms of the field', () => {
        expect(inForm(TaoDate, { modelValue: '2026-03-05', name: 'day' }).data()).toEqual({ day: '2026-03-05' });
        expect(inForm(TaoDate, { modelValue: '2026-03-05', name: 'day', editable: true }).data()).toEqual({ day: '2026-03-05' });
    });

    it('TaoDateRange: two values, <name>-start and <name>-end', () => {
        expect(inForm(TaoDateRange, { modelValue: { start: '2026-03-05', end: '2026-03-09' }, name: 'trip' }).data()).toEqual({
            'trip-start': '2026-03-05',
            'trip-end': '2026-03-09',
        });
    });

    it('TaoColorInput: the hex', () => {
        expect(inForm(TaoColorInput, { modelValue: '#ff8800', name: 'accent' }).data()).toEqual({ accent: '#ff8800' });
    });

    it('TaoSlider and TaoRangeSlider: the number, and the pair as <name>-from and <name>-to', () => {
        expect(inForm(TaoSlider, { modelValue: 7, min: 0, max: 10, name: 'volume' }).data()).toEqual({ volume: '7' });
        expect(inForm(TaoRangeSlider, { modelValue: [2, 8], min: 0, max: 10, name: 'band' }).data()).toEqual({ 'band-from': '2', 'band-to': '8' });
    });

    it('TaoPinCode: the whole code', () => {
        expect(inForm(TaoPinCode, { modelValue: '1234', length: 4, name: 'pin' }).data()).toEqual({ pin: '1234' });
    });

    it('a control without a name sends nothing', () => {
        const { data } = inForm(TaoSelect, { items, modelValue: 'a' });
        expect(data()).toEqual({});
    });

    it('a disabled control is disabled in the form too, so a browser sends nothing, as it does for a native one', () => {
        const { form } = inForm(TaoSelect, { items, modelValue: 'a', name: 'letter', disabled: true });
        expect(form.querySelector('input.tao-sr-only')!.hasAttribute('disabled')).toBe(true);
    });
});

describe('required: the native check of the form', () => {
    it.each([
        ['TaoSelect', TaoSelect, { items, modelValue: null }, { items, modelValue: 'a' }],
        ['TaoCombobox', TaoCombobox, { items, modelValue: null }, { items, modelValue: 'a' }],
        ['TaoDate', TaoDate, { modelValue: null }, { modelValue: '2026-03-05' }],
        ['TaoDateRange', TaoDateRange, { modelValue: null }, { modelValue: { start: '2026-03-05', end: '2026-03-06' } }],
        ['TaoColorInput', TaoColorInput, { modelValue: '', clearable: true }, { modelValue: '#ff8800' }],
        ['TaoPinCode', TaoPinCode, { modelValue: '12', length: 4 }, { modelValue: '1234', length: 4 }],
    ] as [string, unknown, Record<string, unknown>, Record<string, unknown>][])('%s: empty is invalid, filled is valid', (_, component, empty, filled) => {
        expect(inForm(component, { ...empty, name: 'x', required: true }).form.checkValidity()).toBe(false);
        expect(inForm(component, { ...filled, name: 'x', required: true }).form.checkValidity()).toBe(true);
    });

    it('the focus of the hidden input goes to the control the user can see', async () => {
        const { w, form } = inForm(TaoSelect, { items, modelValue: null, name: 'x', required: true });
        form.querySelector<HTMLInputElement>('input.tao-sr-only')!.focus();
        await nextTick();
        expect(document.activeElement).toBe(w.find('button.tao-select__trigger').element);
    });

    it('the control says it is required to a screen reader', () => {
        const { w } = inForm(TaoSelect, { items, modelValue: null, required: true });
        expect(w.find('button.tao-select__trigger').attributes('aria-required')).toBe('true');
    });
});

describe('readOnly on the fields that open something', () => {
    it('TaoSelect: the list does not open, the value goes with the form', async () => {
        const { w, data } = inForm(TaoSelect, { items, modelValue: 'a', name: 'letter', readOnly: true });
        const trigger = w.find('button.tao-select__trigger');
        await trigger.trigger('click');
        await trigger.trigger('keydown', { key: 'ArrowDown' });
        expect(trigger.attributes('aria-expanded')).toBe('false');
        expect(trigger.attributes('aria-readonly')).toBe('true');
        expect(data()).toEqual({ letter: 'a' });
    });

    it('TaoSelect: Delete does not clear it', async () => {
        const { w } = inForm(TaoSelect, { items, modelValue: 'a', readOnly: true });
        await w.find('button.tao-select__trigger').trigger('keydown', { key: 'Delete' });
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });

    it('TaoDate and TaoDateRange: the calendar does not open', async () => {
        const date = inForm(TaoDate, { modelValue: '2026-03-05', readOnly: true }).w;
        await date.find('button.tao-date__trigger').trigger('click');
        expect(date.find('button.tao-date__trigger').attributes('aria-expanded')).toBe('false');
        const range = inForm(TaoDateRange, { modelValue: null, readOnly: true }).w;
        await range.find('button.tao-date-range__trigger').trigger('click');
        expect(range.find('button.tao-date-range__trigger').attributes('aria-expanded')).toBe('false');
    });

    it('TaoDate editable: the text is readonly', () => {
        const { w } = inForm(TaoDate, { modelValue: '2026-03-05', editable: true, readOnly: true });
        expect(w.find('input.tao-date__input').attributes('readonly')).toBeDefined();
    });

    it('TaoCombobox: the input is readonly and the list stays shut', async () => {
        const { w } = inForm(TaoCombobox, { items, modelValue: 'a', readOnly: true });
        const input = w.find('input[role="combobox"]');
        expect(input.attributes('readonly')).toBeDefined();
        await input.trigger('keydown', { key: 'ArrowDown' });
        await input.trigger('mousedown');
        expect(input.attributes('aria-expanded')).toBe('false');
    });

    it('TaoColorInput: the palette does not open and Delete does not clear', async () => {
        const { w } = inForm(TaoColorInput, { modelValue: '#ff8800', readOnly: true, clearable: true });
        const button = w.find('button.tao-color-input');
        await button.trigger('click');
        await button.trigger('keydown', { key: 'Delete' });
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(document.querySelector('.tao-popover__panel')).toBeNull();
    });
});

describe('a form that is submitted', () => {
    it('is held back by an empty required field, and goes with a filled one', async () => {
        const value = ref<string | number | null>(null);
        const Host = defineComponent({
            setup: () => () => h('form', null, [h(TaoSelect, { items, modelValue: value.value, 'onUpdate:modelValue': (v: string | number | null) => (value.value = v), name: 'letter', required: true })]),
        });
        const w = mount(Host, { attachTo: document.body });
        const form = w.find('form').element as HTMLFormElement;
        expect(form.checkValidity()).toBe(false);
        value.value = 'b';
        await nextTick();
        expect(form.checkValidity()).toBe(true);
        expect(Object.fromEntries(new FormData(form).entries())).toEqual({ letter: 'b' });
    });
});
