import { describe, expect, it } from 'vitest';
import { counterDigits, counterLayout } from '../src/counterFormat';

// 5.54.0: the `format` mask of TaoCounter, apart from the component.
// 5.54.0: маска `format` у TaoCounter отдельно от компонента.

/** The cells as a string: digits and text as they are, a gap as a space, a padding zero as `_`. / Ячейки строкой: цифры и текст как есть, пропуск — пробел, добивающий ноль — `_`. */
const drawn = (value: number, options = {}) =>
    counterLayout(value, options)
        .cells.map((cell) => (cell.kind === 'digit' && cell.leadingZero ? '_' : cell.value))
        .join('');

describe('counterDigits', () => {
    it('the whole part, without the sign; not a number is 0', () => {
        expect(counterDigits(1337)).toBe('1337');
        expect(counterDigits(-42.9)).toBe('42');
        expect(counterDigits(Number.NaN)).toBe('0');
        expect(counterDigits(Number.POSITIVE_INFINITY)).toBe('0');
    });
});

describe('without a mask: the counter as it always was', () => {
    it('groups by thousands with a gap and pads to maxDigits', () => {
        expect(drawn(1337, { maxDigits: 6 })).toBe('__1 337');
        expect(drawn(0, { maxDigits: 6 })).toBe('___ __0');
        expect(drawn(5, { maxDigits: 1 })).toBe('5');
    });

    it('grows with the number, the width is a minimum', () => {
        expect(drawn(1234567, { maxDigits: 4 })).toBe('1 234 567');
        expect(counterLayout(1234567, { maxDigits: 4 }).clamped).toBe(false);
        expect(counterLayout(1, { maxDigits: 4 }).masked).toBe(false);
    });

    it('nine digits by default', () => {
        expect(counterLayout(7).cells.filter((c) => c.kind === 'digit')).toHaveLength(9);
    });

    it('the gaps are gaps, not digits', () => {
        const kinds = counterLayout(1337, { maxDigits: 6 }).cells.map((c) => c.kind);
        expect(kinds).toEqual(['digit', 'digit', 'digit', 'gap', 'digit', 'digit', 'digit']);
    });

    it('the label of a counter without a mask stays the number as a screen reader knew it', () => {
        expect(counterLayout(1337, { maxDigits: 6 }).text).toBe('1 337');
    });
});

describe('a mask', () => {
    it('# is a digit, any other character is drawn as it is', () => {
        expect(drawn(123456, { format: '##:##:##', muteZeros: false })).toBe('12:34:56');
        expect(drawn(1234567, { format: '#,###,###' })).toBe('1,234,567');
        expect(drawn(1234, { format: '#-##-##', muteZeros: false })).toBe('0-12-34');
        expect(drawn(1337, { format: '### ###' })).toBe('__1 337');
    });

    it('text in front of and after the digits is kept: a sign, a unit', () => {
        expect(drawn(1250, { format: '$####' })).toBe('$1250');
        expect(drawn(250, { format: '### ###₽' })).toBe('___ 250₽');
        expect(drawn(250, { format: '+7 ###' })).toBe('+7 250');
    });

    it('a space is a gap, anything else is text', () => {
        const kinds = counterLayout(1, { format: '#.# #' }).cells.map((c) => c.kind);
        expect(kinds).toEqual(['digit', 'text', 'digit', 'gap', 'digit']);
    });

    it('a digit written in the mask is text, it does not roll', () => {
        const cells = counterLayout(12, { format: '+7 ##' }).cells;
        expect(cells.find((c) => c.value === '7')?.kind).toBe('text');
    });

    it('the mask fixes the number of cells: the counter does not grow', () => {
        const layout = counterLayout(5, { format: '####', maxDigits: 9 });
        expect(layout.cells.filter((c) => c.kind === 'digit')).toHaveLength(4);
        expect(layout.masked).toBe(true);
    });

    it('a number that does not fit is shown as the largest one the mask holds, not as zeros', () => {
        const layout = counterLayout(1234567, { format: '### ###' });
        expect(drawn(1234567, { format: '### ###' })).toBe('999 999');
        expect(layout.clamped).toBe(true);
        expect(counterLayout(999999, { format: '### ###' }).clamped).toBe(false);
        expect(drawn(-5e9, { format: '##' })).toBe('99');
    });

    it('a mask with no cell is no mask: the counter falls back to maxDigits', () => {
        const layout = counterLayout(42, { format: '--', maxDigits: 3 });
        expect(layout.masked).toBe(false);
        expect(drawn(42, { format: '', maxDigits: 3 })).toBe('_42');
    });
});

describe('the padding zeros', () => {
    it('are dimmed by default, the last digit never is', () => {
        expect(drawn(0, { format: '####' })).toBe('___0');
        expect(drawn(5, { format: '##:##' })).toBe('__:_5');
    });

    it('muteZeros: false keeps every digit bright, for a clock', () => {
        expect(drawn(330, { format: '##:##:##', muteZeros: false })).toBe('00:03:30');
        expect(counterLayout(330, { format: '##:##:##', muteZeros: false }).cells.some((c) => c.leadingZero)).toBe(false);
    });

    it('a zero inside the number is not padding', () => {
        // 001,005: the two zeros in front are padding, the two after the 1 are the number
        expect(drawn(1005, { format: '###,###' })).toBe('__1,005');
        expect(drawn(100, { format: '####' })).toBe('_100');
    });
});

describe('the sign', () => {
    it('a negative number has a minus in front of the cells, not in them', () => {
        const layout = counterLayout(-42, { format: '####' });
        expect(layout.negative).toBe(true);
        expect(layout.cells.some((c) => c.value === '−')).toBe(false);
    });

    it('a fraction that truncates to zero has no minus', () => {
        expect(counterLayout(-0.5, { format: '####' }).negative).toBe(false);
        expect(counterLayout(Number.NaN).negative).toBe(false);
    });
});

describe('the text for a screen reader', () => {
    it('is the number as drawn, without the padding zeros and the separators between them', () => {
        expect(counterLayout(123, { format: '### ###' }).text).toBe('123');
        expect(counterLayout(1337, { format: '### ###' }).text).toBe('1 337');
        expect(counterLayout(0, { format: '### ###' }).text).toBe('0');
        expect(counterLayout(5, { format: '##:##' }).text).toBe('5');
    });

    it('keeps the text around the number, and the sign', () => {
        expect(counterLayout(123, { format: '$### ###' }).text).toBe('$123');
        expect(counterLayout(250, { format: '### ###₽' }).text).toBe('250₽');
        expect(counterLayout(-42, { format: '####' }).text).toBe('−42');
    });

    it('with every digit bright it is the whole mask, a clock reads as a clock', () => {
        expect(counterLayout(330, { format: '##:##:##', muteZeros: false }).text).toBe('00:03:30');
    });
});
