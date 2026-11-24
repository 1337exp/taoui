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

// 5.54.0: `format`, a mask as in TaoPinCode: `#` is a digit, any other character is drawn as it is
// 5.54.0: `format`, маска как в TaoPinCode: `#` — цифра, любой другой символ рисуется как есть
describe('TaoCounter format', () => {
    /** what the slots hold: digits as they are, a gap as a space, a muted digit in brackets / что в слотах: цифры как есть, пропуск — пробел, приглушённая цифра в скобках */
    const drawn = (w: ReturnType<typeof mount>) =>
        w
            .findAll('.tao-counter__slot')
            .map((slot) => {
                if (slot.classes('tao-counter__slot--space')) return ' ';
                const text = slot.find('.tao-counter__text');
                if (text.exists()) return text.text();
                const digit = slot.find('.tao-counter__digit');
                return digit.classes('tao-counter__digit--muted') ? `(${digit.text()})` : digit.text();
            })
            .join('');

    it('a clock: the colons are fixed text, the digits are bright', () => {
        const w = mount(TaoCounter, { props: { value: 330, format: '##:##:##', muteZeros: false } });
        expect(drawn(w)).toBe('00:03:30');
        expect(w.findAll('.tao-counter__slot--text')).toHaveLength(2);
        expect(w.findAll('.tao-counter__digit--muted')).toHaveLength(0);
    });

    it('the padding zeros are dimmed, the last digit never is', () => {
        expect(drawn(mount(TaoCounter, { props: { value: 5, format: '### ###' } }))).toBe('(0)(0)(0) (0)(0)5');
        expect(drawn(mount(TaoCounter, { props: { value: 0, format: '####' } }))).toBe('(0)(0)(0)0');
    });

    it('the mask fixes the width: a number that does not fit shows as all nines, it does not grow', () => {
        const w = mount(TaoCounter, { props: { value: 5_000_000, format: '### ###' } });
        expect(drawn(w)).toBe('999 999');
        expect(w.findAll('.tao-counter__digit')).toHaveLength(6);
    });

    it('a unit and a prefix are drawn as text', () => {
        const w = mount(TaoCounter, { props: { value: 250, format: '$### ###₽', muteZeros: false } });
        expect(drawn(w)).toBe('$000 250₽');
    });

    it('a digit written in the mask is text: it does not roll and takes no turn', async () => {
        const w = mount(TaoCounter, { props: { value: 11, format: '+7 ##' } });
        expect(drawn(w)).toBe('+7 11');
        expect(w.findAll('.tao-counter__slot')[1]!.find('.tao-counter__digit').exists()).toBe(false);
        await w.setProps({ value: 22 });
        // '+', '7', the gap take no turn; the units roll first, the tens after them
        expect(ranks(w)).toEqual(['--_rank: 0;', '--_rank: 0;', '--_rank: 0;', '--_rank: 1;', '--_rank: 0;']);
    });

    it('the digits roll in turn from the right across the separators', async () => {
        const w = mount(TaoCounter, { props: { value: 0, format: '##:##', muteZeros: false } });
        await w.setProps({ value: 1337 });
        // 00:00 → 13:37: the colon is a slot with no turn
        expect(ranks(w)).toEqual(['--_rank: 3;', '--_rank: 2;', '--_rank: 0;', '--_rank: 1;', '--_rank: 0;']);
    });

    it('the label says the number as drawn, without the padding zeros', () => {
        expect(mount(TaoCounter, { props: { value: 123, format: '$### ###' } }).find('.tao-counter').attributes('aria-label')).toBe('$123');
        expect(mount(TaoCounter, { props: { value: 330, format: '##:##:##', muteZeros: false } }).find('.tao-counter').attributes('aria-label')).toBe('00:03:30');
        expect(mount(TaoCounter, { props: { value: -42, format: '####' } }).find('.tao-counter').attributes('aria-label')).toBe('−42');
    });

    it('without a mask the label is still the number', () => {
        expect(mount(TaoCounter, { props: { value: 1337, maxDigits: 6 } }).find('.tao-counter').attributes('aria-label')).toBe('1337');
    });

    it('a fixed character has its own look: no frame, quieter than the digits', () => {
        const rule = (counterSource as string).match(/\.tao-counter__slot--text \{([^}]*)\}/)?.[1] ?? '';
        expect(rule).toMatch(/background:\s*transparent/);
        expect(rule).toMatch(/color:\s*var\(--tao-color-text-muted\)/);
    });
});

// 5.27.1: a digit is a layer before it moves, so its text is drawn the same at the start of the roll (no jump of a pixel)
// 5.27.1: цифра — слой до движения, поэтому её текст рисуется одинаково на старте качения (без прыжка на пиксель)
describe('TaoCounter digit layer', () => {
    it('the digit has will-change for what the roll animates', () => {
        const rule = (counterSource as string).match(/\.tao-counter__digit \{([^}]*)\}/)?.[1] ?? '';
        expect(rule).toMatch(/will-change:\s*transform,\s*opacity,\s*filter/);
    });
});
