import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import TaoAlert from '../src/components/TaoAlert.vue';
import TaoCard from '../src/components/TaoCard.vue';
import TaoCommandPalette from '../src/components/TaoCommandPalette.vue';
import TaoDrawer from '../src/components/TaoDrawer.vue';
import TaoModal from '../src/components/TaoModal.vue';
import TaoTag from '../src/components/TaoTag.vue';

// Every `close` says why: escape, outside (a press elsewhere), button, select. (A parent that keeps it open refuses with a handler that does nothing.)
// Каждый `close` говорит, почему: escape, outside (нажатие в другом месте), button, select.

afterEach(() => {
    document.body.innerHTML = '';
});

const noop = () => {};
const escape = async () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await nextTick();
};

describe('TaoModal', () => {
    const make = () => mount(TaoModal, { props: { modelValue: true, title: 'T', 'onUpdate:modelValue': noop }, slots: { default: () => 'body' }, attachTo: document.body });

    it('the close button says button', async () => {
        const w = make();
        await nextTick();
        document.querySelector<HTMLElement>('.tao-modal__close')!.click();
        expect(w.emitted('close')).toEqual([['button']]);
    });

    it('Escape says escape', async () => {
        const w = make();
        await nextTick();
        await escape();
        expect(w.emitted('close')).toEqual([['escape']]);
    });

    it('a press on the dimmed backdrop says outside', async () => {
        const w = make();
        await nextTick();
        const overlay = document.querySelector<HTMLElement>('.tao-modal-overlay')!;
        overlay.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        overlay.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
        expect(w.emitted('close')).toEqual([['outside']]);
    });
});

describe('TaoDrawer', () => {
    const make = () => mount(TaoDrawer, { props: { modelValue: true, 'onUpdate:modelValue': noop }, slots: { default: () => 'body' }, attachTo: document.body });

    it('Escape says escape, the backdrop outside, the button button', async () => {
        const w = make();
        await nextTick();
        document.querySelector<HTMLElement>('.tao-drawer__overlay')!.click();
        document.querySelector<HTMLElement>('.tao-drawer__close')?.click();
        await escape();
        expect(w.emitted('close')).toEqual([['outside'], ['button'], ['escape']]);
    });
});

describe('TaoCommandPalette', () => {
    const make = () =>
        mount(TaoCommandPalette, {
            props: { modelValue: true, items: [{ id: 'a', label: 'Alpha' }], 'onUpdate:modelValue': noop },
            attachTo: document.body,
        });

    it('Escape says escape', async () => {
        const w = make();
        await nextTick();
        await escape();
        expect(w.emitted('close')).toEqual([['escape']]);
    });
});

describe('the small ones', () => {
    it('TaoCard, TaoAlert and TaoTag: the cross says button', async () => {
        const card = mount(TaoCard, { props: { closable: true } });
        await card.find('.tao-card__close').trigger('click');
        expect(card.emitted('close')).toEqual([['button']]);

        const alert = mount(TaoAlert, { props: { closable: true, title: 'x' } });
        await alert.find('.tao-alert__close').trigger('click');
        expect(alert.emitted('close')).toEqual([['button']]);

        const tag = mount(TaoTag, { props: { closable: true }, slots: { default: () => 'tag' } });
        await tag.find('button').trigger('click');
        expect(tag.emitted('close')).toEqual([['button']]);
    });
});
