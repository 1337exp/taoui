import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import TaoButton from '../src/components/TaoButton.vue';
import TaoCommandList from '../src/components/TaoCommandList.vue';
import TaoKbd from '../src/components/TaoKbd.vue';

describe('TaoKbd', () => {
    it('is a kbd with the key from the slot; cap by default, plain on request', () => {
        const cap = mount(TaoKbd, { slots: { default: () => 'Ctrl+K' } });
        expect(cap.element.tagName).toBe('KBD');
        expect(cap.text()).toBe('Ctrl+K');
        expect(cap.classes()).toContain('tao-kbd');
        expect(cap.classes()).not.toContain('tao-kbd--plain');

        const plain = mount(TaoKbd, { props: { variant: 'plain' }, slots: { default: () => 'Z' } });
        expect(plain.classes()).toContain('tao-kbd--plain');
    });

    it('is what a button and a command list draw their key with (one look in every place)', () => {
        const button = mount(TaoButton, { props: { shortcut: 'N' }, slots: { default: () => 'New' } });
        expect(button.find('kbd.tao-kbd.tao-button__shortcut').text()).toBe('N');

        const list = mount(TaoCommandList, { props: { items: [{ id: 'a', label: 'Save', shortcut: 'Ctrl+S' }] } });
        expect(list.find('kbd.tao-kbd.tao-kbd--plain').text()).toBe('Ctrl+S');
    });

    it('has zero specificity (:where), so the place that holds a key sets its own size', () => {
        const css = readFileSync('src/components/TaoKbd.vue', 'utf8');
        expect(css).toContain(':where(.tao-kbd)');
        expect(css).toContain(':where(.tao-kbd--plain)');
    });

    it('a neutral tone has a grey wash, not the accent one', () => {
        const css = readFileSync('src/styles/contexts/tone.css', 'utf8');
        const neutral = css.match(/\.tao-tone-neutral \{[\s\S]*?\n\}/)![0];
        expect(neutral).toContain('--tao-tone-wash: color-mix(in srgb, var(--tao-color-text) 10%, transparent)');
        expect(neutral).not.toContain('accent');
    });
});
