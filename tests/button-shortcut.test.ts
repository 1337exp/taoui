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

    it('an icon-only button does not print the key (no room in the square): it is in the title and in aria-keyshortcuts', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-undo', shortcut: 'Ctrl+Z' }, attrs: { 'aria-label': 'Undo' } });
        expect(w.find('kbd').exists()).toBe(false);
        expect(w.attributes('aria-keyshortcuts')).toBe('Ctrl+Z');
        expect(w.attributes('title')).toBe('Undo (Ctrl+Z)');
    });

    it('with no label to put before it, the title is the key alone; a title of its own wins', () => {
        expect(mount(TaoButton, { props: { icon: 'tao-undo', shortcut: 'Ctrl+Z' }, attrs: { 'aria-labelledby': 'x' } }).attributes('title')).toBe('Ctrl+Z');
        const own = mount(TaoButton, { props: { icon: 'tao-undo', shortcut: 'Ctrl+Z' }, attrs: { 'aria-label': 'Undo', title: 'Take it back' } });
        expect(own.attributes('title')).toBe('Take it back');
    });

    it('a button with text keeps the key in the button and sets no title of its own', () => {
        const w = mount(TaoButton, { props: { icon: 'tao-plus', shortcut: 'N' }, slots: { default: 'New' } });
        expect(w.find('kbd').exists()).toBe(true);
        expect(w.attributes('title')).toBeUndefined();
    });

    it('without it, nothing', () => {
        const w = mount(TaoButton, { slots: { default: 'Save' } });
        expect(w.find('kbd').exists()).toBe(false);
        expect(w.attributes('aria-keyshortcuts')).toBeUndefined();
    });
});
