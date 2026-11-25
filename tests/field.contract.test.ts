import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoCheckbox from '../src/components/TaoCheckbox.vue';
import TaoColorInput from '../src/components/TaoColorInput.vue';
import TaoCombobox from '../src/components/TaoCombobox.vue';
import TaoDragNumber from '../src/components/TaoDragNumber.vue';
import TaoFileDrop from '../src/components/TaoFileDrop.vue';
import TaoFormField from '../src/components/TaoFormField.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoInputNumber from '../src/components/TaoInputNumber.vue';
import TaoPresetInput from '../src/components/TaoPresetInput.vue';
import TaoQuantity from '../src/components/TaoQuantity.vue';
import TaoRadio from '../src/components/TaoRadio.vue';
import TaoSwitch from '../src/components/TaoSwitch.vue';
import TaoTextarea from '../src/components/TaoTextarea.vue';
import { nativeFieldAttrs } from '../src/formField';

// The contract of a form control (`FieldProps`): the same names do the same on every field.
// Контракт элемента формы (`FieldProps`): одни и те же имена на каждом поле делают одно и то же.

const controls: [string, unknown, Record<string, unknown>, string][] = [
    ['TaoInput', TaoInput, {}, 'input'],
    ['TaoTextarea', TaoTextarea, {}, 'textarea'],
    ['TaoInputNumber', TaoInputNumber, { modelValue: 1 }, 'input'],
    ['TaoCombobox', TaoCombobox, { items: [] }, 'input'],
    ['TaoPresetInput', TaoPresetInput, { options: [] }, 'input'],
    ['TaoQuantity', TaoQuantity, { modelValue: 1 }, 'input'],
    ['TaoDragNumber', TaoDragNumber, { modelValue: 1 }, 'input'],
    ['TaoSwitch', TaoSwitch, {}, 'input'],
    ['TaoCheckbox', TaoCheckbox, {}, 'input'],
    ['TaoRadio', TaoRadio, { value: 'a' }, 'input'],
    ['TaoFileDrop', TaoFileDrop, {}, 'input'],
];

afterEach(() => {
    document.body.innerHTML = '';
});

describe('nativeFieldAttrs', () => {
    it('gives name, required and readonly, and leaves out what is off', () => {
        expect(nativeFieldAttrs({ name: 'q', required: true, readOnly: true })).toEqual({ name: 'q', required: true, readonly: true });
        expect(nativeFieldAttrs({})).toEqual({ name: undefined, required: undefined, readonly: undefined });
        expect(nativeFieldAttrs({ required: false, readOnly: false }).required).toBeUndefined();
    });
});

describe('every control takes the contract', () => {
    it.each(controls)('%s: name, required, id and invalid reach the control', (label, component, props, control) => {
        const w = mount(component as never, { props: { ...props, name: 'field', required: true, id: 'mine', invalid: true } as never });
        const el = w.find(control);
        // a combobox sends the id of the pick, not the text in its input: through a hidden one
        const holder = label === 'TaoCombobox' ? w.find('input.tao-sr-only') : el;
        expect(holder.attributes('name')).toBe('field');
        expect(holder.attributes('required')).toBeDefined();
        expect(el.attributes('id')).toBe('mine');
        expect(el.attributes('aria-invalid')).toBe('true');
    });

    it.each(controls)('%s: autofocus takes the focus when it appears', (_, component, props, control) => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        const w = mount(component as never, { props: { ...props, autofocus: true } as never, attachTo: host });
        expect(document.activeElement).toBe(w.find(control).element);
        w.unmount();
    });

    it.each(controls)('%s: an old `error` is not a prop any more', (_, component, props, control) => {
        const w = mount(component as never, { props: props as never, attrs: { error: true } });
        expect(w.find(control).attributes('aria-invalid')).toBeUndefined();
    });
});

describe('readOnly', () => {
    it.each([
        ['TaoInput', TaoInput, {}, 'input'],
        ['TaoTextarea', TaoTextarea, {}, 'textarea'],
        ['TaoInputNumber', TaoInputNumber, { modelValue: 1 }, 'input'],
        ['TaoQuantity', TaoQuantity, { modelValue: 1 }, 'input'],
        ['TaoDragNumber', TaoDragNumber, { modelValue: 1 }, 'input'],
        ['TaoPresetInput', TaoPresetInput, { options: [{ value: 1, label: 'One' }], modelValue: 1 }, 'input'],
    ] as [string, unknown, Record<string, unknown>, string][])('%s: the control is readonly, not disabled', (_, component, props, control) => {
        const w = mount(component as never, { props: { ...props, readOnly: true } as never });
        const el = w.find(control);
        expect(el.attributes('readonly')).toBeDefined();
        expect(el.attributes('disabled')).toBeUndefined();
    });

    it('TaoInputNumber: the arrows, Enter, blur and the steppers change nothing', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 5, step: 1, max: 3, readOnly: true, controls: true } });
        const input = w.find('input');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keydown', { key: 'Enter' });
        await input.trigger('blur');
        // max 3 would clamp the 5 on a blur that commits: a readonly field must not touch its value
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
        for (const step of w.findAll('.tao-input-number__step')) expect(step.attributes('disabled')).toBeDefined();
    });

    it('TaoQuantity: the arrows, ± and blur change nothing', async () => {
        const w = mount(TaoQuantity, { props: { modelValue: 5, readOnly: true } });
        const input = w.find('input');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keydown', { key: 'ArrowDown' });
        await input.trigger('focus');
        await input.setValue('2');
        await input.trigger('blur');
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
        for (const button of w.findAll('button')) expect(button.attributes('disabled')).toBeDefined();
    });

    it('TaoDragNumber: keys, typing, ± and a drag change nothing; the focus stays', async () => {
        const w = mount(TaoDragNumber, { props: { modelValue: 5, readOnly: true }, attachTo: document.body });
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.trigger('keydown', { key: 'Enter' });
        await input.setValue('9');
        await input.trigger('blur');
        const field = w.find('.tao-drag-number__field');
        await field.trigger('pointerdown', { clientX: 10, button: 0, pointerId: 1 });
        await field.trigger('pointermove', { clientX: 80, pointerId: 1 });
        await field.trigger('pointerup', { clientX: 80, pointerId: 1 });
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
        expect(input.attributes('disabled')).toBeUndefined();
        for (const button of w.findAll('button')) expect(button.attributes('disabled')).toBeDefined();
        w.unmount();
    });

    it('TaoPresetInput: the list does not open, the arrows and typing change nothing', async () => {
        const options = [{ value: 1, label: 'One' }, { value: 2, label: 'Two' }];
        const w = mount(TaoPresetInput, { props: { options, modelValue: 1, readOnly: true }, attachTo: document.body });
        const input = w.find('input');
        await input.trigger('focus');
        await input.trigger('keydown', { key: 'ArrowUp' });
        await input.setValue('Two');
        await input.trigger('keydown', { key: 'Enter' });
        expect(w.emitted('update:modelValue')).toBeUndefined();
        expect(w.emitted('commit')).toBeUndefined();
        expect(document.querySelector('[role="listbox"]')).toBeNull();
        for (const button of w.findAll('button')) expect(button.attributes('disabled')).toBeDefined();
        w.unmount();
    });

    it('TaoInputNumber: without readOnly the same blur does commit', async () => {
        const w = mount(TaoInputNumber, { props: { modelValue: 5, step: 1, max: 3 } });
        await w.find('input').trigger('blur');
        expect(w.emitted('commit')).toBeTruthy();
    });
});

describe('a TaoFormField reaches the controls', () => {
    it('TaoColorInput: the label points at its button, the error and the hint describe it', () => {
        const w = mount(TaoFormField, {
            props: { label: 'Accent', error: 'Pick one', hint: 'Any colour' },
            slots: { default: () => h(TaoColorInput, { modelValue: '#ff8800' }) },
            attachTo: document.body,
        });
        const button = w.find('button.tao-color-input');
        const label = w.find('label');
        expect(label.attributes('for')).toBeTruthy();
        expect(button.attributes('id')).toBe(label.attributes('for'));
        expect(button.attributes('aria-invalid')).toBe('true');
        expect(button.attributes('aria-describedby')).toBeTruthy();
    });

    it('TaoColorInput: the label names the button together with its own text, an aria-label of the app still wins', () => {
        const inField = mount(TaoFormField, {
            props: { label: 'Accent' },
            slots: { default: () => h(TaoColorInput, { modelValue: '#ff8800' }) },
            attachTo: document.body,
        });
        const button = inField.find('button.tao-color-input');
        expect(button.attributes('aria-label')).toBeUndefined();
        const ids = button.attributes('aria-labelledby')!.split(' ');
        expect(ids[0]).toBe(inField.find('label').attributes('id'));
        expect(ids[1]).toBe(button.attributes('id'));
        inField.unmount();

        const named = mount(TaoFormField, {
            props: { label: 'Accent' },
            slots: { default: () => h(TaoColorInput, { modelValue: '#ff8800', 'aria-label': 'Background' }) },
        });
        expect(named.find('button.tao-color-input').attributes('aria-label')).toBe('Background: #ff8800');
        expect(named.find('button.tao-color-input').attributes('aria-labelledby')).toBeUndefined();
    });

    it('TaoColorInput: its own invalid is the red frame', () => {
        const w = mount(TaoColorInput, { props: { modelValue: '#ff8800', invalid: true } });
        expect(w.find('button.tao-color-input').classes()).toContain('tao-color-input--invalid');
    });
});

describe('TaoFileDrop: disabled', () => {
    it('turns the zone off: the input is disabled and a drop adds nothing', async () => {
        const w = mount(TaoFileDrop, { props: { disabled: true } });
        expect(w.find('input').attributes('disabled')).toBeDefined();
        expect(w.classes()).toContain('tao-file-drop--disabled');
        const file = new File(['x'], 'a.txt');
        await w.find('.tao-file-drop__zone').trigger('drop', { dataTransfer: { files: [file] } });
        expect(w.emitted('update:modelValue')).toBeUndefined();
    });
});
