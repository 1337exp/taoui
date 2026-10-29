import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoButton from '../src/components/TaoButton.vue';

describe('TaoButton shortcut', () => {
    it('shows the key at the end, hidden from a screen reader, and gives it as aria-keyshortcuts', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-plus', shortcut: 'N' }, slots: { default: 'New note' } });
        const kbd = w.find('kbd.tao-button__shortcut');
        expect(kbd.text()).toBe('N');
        expect(kbd.attributes('aria-hidden')).toBe('true');
        expect(w.attributes('aria-keyshortcuts')).toBe('N');
        expect(w.element.lastElementChild).toBe(kbd.element);
    });

    it('without it, nothing', () => {
        const w = mount(TaoButton, { slots: { default: 'Save' } });
        expect(w.find('kbd').exists()).toBe(false);
        expect(w.attributes('aria-keyshortcuts')).toBeUndefined();
    });
});
