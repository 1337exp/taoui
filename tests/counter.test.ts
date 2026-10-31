import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
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

    describe('while the digits roll', () => {
        // the real Transition hooks: the digits start to roll on the next frame and land after it
        const mountRolling = (value: number) =>
            mount(TaoCounter, { props: { value, maxDigits: 4 }, global: { stubs: { TransitionGroup: false } } });
        const shownDigits = (w: ReturnType<typeof mount>) =>
            w.findAll('.tao-counter__slot').map((slot) => slot.findAll('.tao-counter__digit').length);
        const landed = async () => {
            for (let i = 0; i < 6; i += 1) {
                await new Promise((resolve) => setTimeout(resolve, 20));
            }
            await nextTick();
        };

        it('holds the next value back and then rolls once to the latest', async () => {
            const w = mountRolling(0);
            await w.setProps({ value: 1 });
            await nextTick();
            await w.setProps({ value: 2 });
            await w.setProps({ value: 3 });
            // the label tells the real value at once; the wheels do not take it while a digit is rolling
            expect(w.find('.tao-counter').attributes('aria-label')).toBe('3');
            const units = () => w.findAll('.tao-counter__slot:last-child .tao-counter__digit').map((d) => d.text());
            expect(units()).toEqual(['0', '1']);
            await landed();
            expect(units()).toEqual(['3']);
            expect(Math.max(...shownDigits(w))).toBe(1);
        });
    });
});
