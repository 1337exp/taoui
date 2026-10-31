import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TaoCounter from '../src/components/TaoCounter.vue';
// @ts-expect-error Vite `?raw` import
import counterSource from '../src/components/TaoCounter.vue?raw';

const ranks = (w: ReturnType<typeof mount>) => w.findAll('.tao-counter__slot').map((slot) => slot.attributes('style'));

describe('TaoCounter', () => {
    it('the digits that change roll in turn from the right', async () => {
        const w = mount(TaoCounter, { props: { value: 0, maxDigits: 6 } });
        await w.setProps({ value: 1337 });
        // 000 000 → 001 337: the gap between the groups is a slot too
        expect(ranks(w)).toEqual([
            '--_rank: 0;', '--_rank: 0;', '--_rank: 3;', '--_rank: 0;', '--_rank: 2;', '--_rank: 1;', '--_rank: 0;',
        ]);
    });

    it('a digit that stays does not make the changed one wait', async () => {
        const w = mount(TaoCounter, { props: { value: 1000, maxDigits: 4 } });
        await w.setProps({ value: 2000 });
        expect(ranks(w).every((style) => style === '--_rank: 0;')).toBe(true);
    });

    it('the first render has no turn', () => {
        const w = mount(TaoCounter, { props: { value: 1337, maxDigits: 4 } });
        expect(ranks(w).every((style) => style === '--_rank: 0;')).toBe(true);
    });

    it('the stagger is a token, and reduced motion turns the roll off', () => {
        const source = counterSource as string;
        expect(source).toContain('--tao-counter-stagger');
        expect(source).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*transition: none/);
    });
});
