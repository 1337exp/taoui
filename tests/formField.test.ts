import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { defineComponent, h, type Component } from 'vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDate from '../src/components/TaoDate.vue';
import TaoFormField from '../src/components/TaoFormField.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoSelect from '../src/components/TaoSelect.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';

// What useField gives every control: the id the label points at, aria-describedby and the invalid state.
// Что useField даёт каждому контролу: id для подписи, aria-describedby и состояние ошибки.

afterEach(() => {
    document.body.innerHTML = '';
});

// the focusable element of each control that carries the id
const controls: [string, Component, string, Record<string, unknown>][] = [
    ['TaoInput', TaoInput, 'input', { modelValue: '' }],
    ['TaoTextarea', TaoTextarea, 'textarea', { modelValue: '' }],
    ['TaoInputNumber', TaoInputNumber, 'input', { modelValue: 1 }],
    ['TaoQuantity', TaoQuantity, 'input', { modelValue: 1 }],
    ['TaoCheckbox', TaoCheckbox, 'input', { modelValue: false }],
    ['TaoSwitch', TaoSwitch, 'input', { modelValue: false }],
    ['TaoSelect', TaoSelect, '[role="combobox"]', { options: [] }],
    ['TaoCombobox', TaoCombobox, 'input', { options: [] }],
    ['TaoDate', TaoDate, '[role="combobox"]', {}],
];

function inField(control: Component, props: Record<string, unknown>, field: Record<string, unknown>) {
    const Host = defineComponent({ setup: () => () => h(TaoFormField as never, field, { default: () => h(control as never, props) }) });
    return mount(Host, { attachTo: document.body });
}

describe.each(controls)('%s inside TaoFormField', (_name, control, selector, props) => {
    it('takes the field id, so the label points at the control', () => {
        const w = inField(control, props, { label: 'Name' });
        const label = w.find('label.tao-form-field__label');
        const target = w.find(selector);
        expect(target.attributes('id')).toBeTruthy();
        expect(label.attributes('for')).toBe(target.attributes('id'));
    });

    it('is described by the hint, then by the error, and is invalid with an error', () => {
        const hinted = inField(control, props, { label: 'Name', hint: 'A hint' });
        const hintId = hinted.find('.tao-form-field__hint').attributes('id');
        expect(hinted.find(selector).attributes('aria-describedby')).toBe(hintId);
        expect(hinted.find(selector).attributes('aria-invalid')).toBeUndefined();

        const failed = inField(control, props, { label: 'Name', hint: 'A hint', error: 'Wrong' });
        const errorId = failed.find('.tao-form-field__error').attributes('id');
        expect(failed.find(selector).attributes('aria-describedby')).toBe(errorId);
    });
});

describe('a control alone', () => {
    it('gets its own id, no description, and error means invalid', () => {
        const w = mount(TaoInput, { props: { modelValue: '', error: true } });
        expect(w.find('input').attributes('id')).toBeTruthy();
        expect(w.find('input').attributes('aria-describedby')).toBeUndefined();
        expect(w.find('input').attributes('aria-invalid')).toBe('true');
    });

    it('an explicit id wins (Input, Textarea)', () => {
        expect(mount(TaoInput, { props: { modelValue: '', id: 'mine' } }).find('input').attributes('id')).toBe('mine');
        expect(mount(TaoTextarea, { props: { modelValue: '', id: 'mine' } }).find('textarea').attributes('id')).toBe('mine');
    });
});
