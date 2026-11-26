import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoFormField from '../src/components/TaoFormField.vue';

// A «?» or a link after the label: a sibling of the label (a button inside a label takes its clicks and joins its name), and no change at all
// when there is no such slot.
// «?» или ссылка после подписи: рядом с подписью (кнопка внутри label забирает её клики и входит в её имя), а без слота разметка прежняя.

describe('TaoFormField #label-end', () => {
    it('stands beside the label, not inside it', () => {
        const w = mount(TaoFormField, { props: { label: 'Code' }, slots: { 'label-end': () => h('button', { class: 'help' }, '?'), default: () => h('input') } });
        expect(w.find('.tao-form-field__head .help').exists()).toBe(true);
        expect(w.find('label .help').exists()).toBe(false);
        expect(w.find('label').text()).toBe('Code');
    });

    it('a click on the label focuses the control, not the «?» beside it (a field whose control carries no id)', async () => {
        const w = mount(TaoFormField, {
            props: { label: 'Code' },
            slots: { 'label-end': () => h('button', { class: 'help' }, '?'), default: () => h('div', [h('input', { class: 'control' })]) },
            attachTo: document.body,
        });
        await w.find('label').trigger('click');
        expect(document.activeElement).toBe(w.find('.control').element);
        w.unmount();
    });

    it('with no slot (or one that draws nothing) the markup is the one it was', () => {
        const plain = mount(TaoFormField, { props: { label: 'Code' }, slots: { default: () => h('input') } });
        expect(plain.find('.tao-form-field__head').exists()).toBe(false);
        const empty = mount(TaoFormField, { props: { label: 'Code' }, slots: { 'label-end': () => [], default: () => h('input') } });
        expect(empty.find('.tao-form-field__head').exists()).toBe(false);
        expect(empty.find('label').exists()).toBe(true);
    });
});
