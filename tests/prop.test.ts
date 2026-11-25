import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import TaoDragNumber from '../src/components/TaoDragNumber.vue';
import TaoInput from '../src/components/TaoInput.vue';
import TaoProp from '../src/components/TaoProp.vue';
import TaoSelect from '../src/components/TaoSelect.vue';

// TaoProp: the row of an inspector. The caption on the left, the control on the right, wired like a TaoFormField.
// TaoProp: строка инспектора. Подпись слева, контрол справа, связаны как у TaoFormField.

describe('TaoProp', () => {
    it('draws the caption and the control', () => {
        const w = mount(TaoProp, { props: { label: 'Width' }, slots: { default: () => h('span', { class: 'ctl' }, 'x') } });
        expect(w.find('.tao-prop__label').text()).toBe('Width');
        expect(w.find('.tao-prop__control .ctl').exists()).toBe(true);
    });

    it('the label points at the control: id, and the name for a screen reader', () => {
        const w = mount(TaoProp, { props: { label: 'Title' }, slots: { default: () => h(TaoInput, { modelValue: '' }) }, attachTo: document.body });
        const label = w.find('label');
        const input = w.find('input');
        expect(label.attributes('for')).toBeTruthy();
        expect(input.attributes('id')).toBe(label.attributes('for'));
        w.unmount();
    });

    it('a hint is the description of the control, an error replaces it and makes the control invalid', async () => {
        const w = mount(TaoProp, { props: { label: 'Title', hint: 'Up to 20' }, slots: { default: () => h(TaoInput, { modelValue: '' }) } });
        const input = w.find('input');
        const hint = w.find('.tao-prop__note');
        expect(hint.text()).toBe('Up to 20');
        expect(input.attributes('aria-describedby')).toBe(hint.attributes('id'));
        expect(input.attributes('aria-invalid')).toBeUndefined();
        await w.setProps({ error: 'Too long' });
        expect(w.find('.tao-prop__note').text()).toBe('Too long');
        expect(w.find('.tao-prop__note--error').exists()).toBe(true);
        expect(input.attributes('aria-invalid')).toBe('true');
        expect(w.classes()).toContain('tao-prop--invalid');
    });

    it('works with a field that is not a native input: a select is named by its row', () => {
        const w = mount(TaoProp, {
            props: { label: 'Blend' },
            slots: { default: () => h(TaoSelect, { items: [{ id: 'a', label: 'A' }], modelValue: 'a' }) },
        });
        expect(w.find('button.tao-select__trigger').attributes('id')).toBe(w.find('label').attributes('for'));
    });

    it('several controls stand in one row', () => {
        const w = mount(TaoProp, {
            props: { label: 'Position' },
            slots: { default: () => [h(TaoDragNumber, { modelValue: 1, label: 'X' }), h(TaoDragNumber, { modelValue: 2, label: 'Y' })] },
        });
        expect(w.findAll('.tao-prop__control .tao-drag-number')).toHaveLength(2);
    });

    it('a caption slot replaces the text, the whole label stays in the title', () => {
        const w = mount(TaoProp, { props: { label: 'Opacity' }, slots: { default: () => 'c', caption: () => h('b', { class: 'mark' }, '%') } });
        expect(w.find('.tao-prop__label .mark').exists()).toBe(true);
        expect(w.find('label').attributes('title')).toBe('Opacity');
    });

    it('labelWidth sets the caption column: a number is px, a string is a length', async () => {
        const w = mount(TaoProp, { props: { label: 'A', labelWidth: 96 }, slots: { default: () => 'c' } });
        expect(w.attributes('style')).toContain('--_label-width: 96px');
        await w.setProps({ labelWidth: '30%' });
        expect(w.attributes('style')).toContain('--_label-width: 30%');
    });

    it('a click on the caption of a row with a custom control focuses its first button', async () => {
        const w = mount(TaoProp, { props: { label: 'Zoom' }, slots: { default: () => h('button', { id: 'x' }, 'b') }, attachTo: document.body });
        await w.find('label').trigger('click');
        await nextTick();
        expect(document.activeElement).toBe(w.find('button').element);
        w.unmount();
    });
});
