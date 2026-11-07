import { mount } from '@vue/test-utils';
import { Comment, Fragment, createTextVNode, createVNode, defineComponent, h, ref } from 'vue';
import { describe, expect, it } from 'vitest';
import TaoButton from '../src/components/TaoButton.vue';
import { slotHasContent } from '../src/slots';

// 5.30.0: a slot that draws nothing is no text. A settings button written as
// `<TaoButton icon="tao-settings"><template v-if="wide">View</template><i v-if="dot" /></TaoButton>` kept an empty
// `.tao-button__content` span and its gap, so the icon sat off-centre.
// 5.30.0: слот, который ничего не рисует, — не текст. Кнопка настроек с `<template v-if>` и `<i v-if>` внутри оставляла
// пустую обёртку и зазор рядом с ней, иконка уезжала от центра.

describe('slotHasContent', () => {
    it('nothing, comments and blank text are empty', () => {
        expect(slotHasContent(undefined)).toBe(false);
        expect(slotHasContent([])).toBe(false);
        expect(slotHasContent([createVNode(Comment, null, 'v-if')])).toBe(false);
        expect(slotHasContent([createTextVNode('  \n ')])).toBe(false);
        expect(slotHasContent([createVNode(Fragment, null, [createVNode(Comment), createVNode(Comment)])])).toBe(false);
    });

    it('an element, a component or real text is content, also inside a fragment', () => {
        expect(slotHasContent([h('i')])).toBe(true);
        expect(slotHasContent([createTextVNode('Save')])).toBe(true);
        expect(slotHasContent([createVNode(Fragment, null, [createVNode(Comment), h('span', 'x')])])).toBe(true);
    });
});

describe('TaoButton with a slot that draws nothing', () => {
    const empty = () => [createVNode(Comment, null, 'v-if')];

    it('is an icon-only square, with no empty content wrapper', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-settings' }, attrs: { 'aria-label': 'View' }, slots: { default: empty } });
        expect(w.classes()).toContain('tao-button--icon-only');
        expect(w.find('.tao-button__content').exists()).toBe(false);
    });

    it('still has its content wrapper when the slot draws something', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-settings' }, slots: { default: 'View' } });
        expect(w.classes()).not.toContain('tao-button--icon-only');
        expect(w.find('.tao-button__content').text()).toBe('View');
    });

    it('follows the slot when its content comes and goes', async () => {
        const text = ref(false);
        const Host = defineComponent({
            setup: () => () => h(TaoButton, { icon: 'tao-settings', 'aria-label': 'View' }, { default: () => (text.value ? 'View' : [createVNode(Comment, null, 'v-if')]) }),
        });
        const w = mount(Host);
        expect(w.find('.tao-button--icon-only').exists()).toBe(true);
        text.value = true;
        await w.vm.$nextTick();
        expect(w.find('.tao-button--icon-only').exists()).toBe(false);
        expect(w.find('.tao-button__content').text()).toBe('View');
    });
});
