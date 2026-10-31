import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoPinCode from '../src/components/TaoPinCode.vue';
// @ts-expect-error Vite `?raw` import: the component source as text
import source from '../src/components/TaoPinCode.vue?raw';

// 5.22.0: `bordered=false` is the light style: no frame at rest, the states still draw it.
// 5.22.0: `bordered=false` — лёгкий стиль: в покое без рамки, состояния рамку по-прежнему рисуют.

describe('TaoPinCode bordered', () => {
    it('framed by default; bordered=false adds the plain class and nothing else changes', () => {
        const framed = mount(TaoPinCode, { props: { length: 4 } });
        const plain = mount(TaoPinCode, { props: { length: 4, bordered: false } });
        expect(framed.classes()).not.toContain('tao-pin-code--plain');
        expect(plain.classes()).toContain('tao-pin-code--plain');
        expect(plain.findAll('input')).toHaveLength(4);
    });

    it('the frame stays in the box (the cells do not jump) and only its colour goes clear at rest', () => {
        expect(source).toMatch(/border: 3px solid var\(--_rest-border\)/);
        expect(source).toMatch(/\.tao-pin-code--plain \{\s*--_rest-border: transparent/);
    });

    it('focus, the active cell, an error and a success still colour the frame, after the rest colour in the file', () => {
        for (const rule of [
            /\.tao-pin-code__value--active,\s*\.tao-pin-code__value:focus \{\s*border-color: var\(--tao-color-accent\)/,
            /\.tao-pin-code__value--invalid \{\s*border-color: var\(--tao-color-danger\)/,
            /\.tao-pin-code--success \.tao-pin-code__value \{\s*border-color: var\(--tao-color-success\)/,
        ]) {
            expect(source).toMatch(rule);
        }
    });
});
