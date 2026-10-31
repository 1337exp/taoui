import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoPinCode from '../src/components/TaoPinCode.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoPinCode.vue?raw';

// 5.22.0: `bordered=false` is the light style: no frame at all, the states are told by the fill and the digit.
// 5.22.0: `bordered=false` — лёгкий стиль: рамки нет вовсе, состояния говорят заливка и цифра.

describe('TaoPinCode bordered', () => {
    it('framed by default; bordered=false adds the plain class and nothing else changes', () => {
        const framed = mount(TaoPinCode, { props: { length: 4 } });
        const plain = mount(TaoPinCode, { props: { length: 4, bordered: false } });
        expect(framed.classes()).not.toContain('tao-pin-code--plain');
        expect(plain.classes()).toContain('tao-pin-code--plain');
        expect(plain.findAll('input')).toHaveLength(4);
    });

    it('the plain frame is clear in every state, and still in the box so the cells do not jump', () => {
        expect(source).toMatch(/border: 3px solid var\(--tao-color-border-strong\)/);
        expect(source).toMatch(/\.tao-pin-code\.tao-pin-code--plain \.tao-pin-code__value \{\s*border-color: transparent/);
    });

    it('without the frame the focus, an error and a success are told by a tint of the fill', () => {
        for (const rule of [
            /--plain \.tao-pin-code__value:focus \{\s*background: color-mix\(in srgb, var\(--tao-color-accent\)/,
            /--plain \.tao-pin-code__value--invalid \{\s*background: color-mix\(in srgb, var\(--tao-color-danger\)/,
            /--plain\.tao-pin-code--success \.tao-pin-code__value \{\s*background: color-mix\(in srgb, var\(--tao-color-success\)/,
        ]) {
            expect(source).toMatch(rule);
        }
    });

    it('an error paints the digit red, as a success paints it green (framed or not)', () => {
        expect(source).toMatch(/\.tao-pin-code__value--invalid \{\s*border-color: var\(--tao-color-danger\);\s*color: var\(--tao-color-danger-text\)/);
        expect(source).toMatch(/\.tao-pin-code--success \.tao-pin-code__value \{\s*border-color: var\(--tao-color-success\);\s*color: var\(--tao-color-success-text\)/);
    });
});
