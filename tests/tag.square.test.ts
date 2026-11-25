import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import TaoTag from '../src/components/TaoTag.vue';
// @ts-expect-error Vite `?raw` import: the component as text
import tagSfc from '../src/components/TaoTag.vue?raw';

// A tag with only an icon is a square of the tag height, as TaoButton does; text keeps its padding.
// Тег только с иконкой — квадрат высотой с тег, как у TaoButton; у текста отступы остаются.

const icon = () => h('i', { class: 'ico' });

describe('TaoTag square', () => {
    it('a #prefix and no text: a square by itself, and no empty text span', () => {
        const w = mount(TaoTag, { slots: { prefix: icon }, attrs: { 'aria-label': 'Verified' } });
        expect(w.classes()).toContain('tao-tag--square');
        expect(w.find('.tao-tag__text').exists()).toBe(false);
    });

    it('a #prefix with text is not a square', () => {
        const w = mount(TaoTag, { slots: { prefix: icon, default: () => 'Active' } });
        expect(w.classes()).not.toContain('tao-tag--square');
        expect(w.find('.tao-tag__text').text()).toBe('Active');
    });

    it('a default slot that draws nothing (v-if) counts as no text', () => {
        const w = mount(TaoTag, { slots: { prefix: icon, default: () => [] } });
        expect(w.classes()).toContain('tao-tag--square');
    });

    it('plain text is not a square', () => {
        expect(mount(TaoTag, { slots: { default: () => 'x' } }).classes()).not.toContain('tao-tag--square');
    });

    it('`square` makes an icon in the default slot a square, and it stays in the tag', () => {
        const w = mount(TaoTag, { props: { square: true }, slots: { default: icon }, attrs: { 'aria-label': 'Settings' } });
        expect(w.classes()).toContain('tao-tag--square');
        expect(w.find('.tao-tag__text .ico').exists()).toBe(true);
    });

    it('`square: false` keeps the padding even for an icon alone', () => {
        expect(mount(TaoTag, { props: { square: false }, slots: { prefix: icon } }).classes()).not.toContain('tao-tag--square');
    });

    it('a tag with a cross is never a square: the cross needs room', () => {
        const w = mount(TaoTag, { props: { closable: true }, slots: { prefix: icon } });
        expect(w.classes()).not.toContain('tao-tag--square');
    });

    it('the square has the tag height as its width, no padding and no gap, over the prefix padding too', () => {
        const css = (tagSfc as string).replace(/\r\n/g, '\n');
        expect(css).toMatch(/\.tao-tag--square,\n\.tao-tag--square\.tao-tag--prefix \{\s*width: var\(--tao-tag-height\);\s*padding: 0;\s*gap: 0;/);
    });
});
