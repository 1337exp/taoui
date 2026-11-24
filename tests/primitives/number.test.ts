import { describe, expect, it } from 'vitest';
import { clamp, decimalsOf, normalizeNumber, roundTo } from '../../src/primitives/number';

// v6: the number primitives, one copy for the whole kit (the cases moved here from the drag number and the slider tests)
// v6: числовые примитивы, одна копия на весь набор (случаи переехали сюда из тестов drag number и слайдера)

describe('clamp', () => {
    it('either bound may be missing', () => {
        expect(clamp(5, 0, 3)).toBe(3);
        expect(clamp(-5, 0, 3)).toBe(0);
        expect(clamp(-5)).toBe(-5);
        expect(clamp(50, undefined, 10)).toBe(10);
        expect(clamp(-50, -10)).toBe(-10);
    });

    it('a value inside is left alone', () => {
        expect(clamp(2, 0, 3)).toBe(2);
        expect(clamp(0, 0, 3)).toBe(0);
    });

    it('min above max: max wins, as Math.min(Math.max(v, min), max) did', () => {
        expect(clamp(5, 10, 3)).toBe(3);
        expect(clamp(-1, 10, 3)).toBe(3);
    });
});

describe('decimalsOf', () => {
    it('counts the decimals of a step, also when it is written with an exponent', () => {
        expect(decimalsOf(5)).toBe(0);
        expect(decimalsOf(0.25)).toBe(2);
        expect(decimalsOf(0.001)).toBe(3);
        expect(decimalsOf(1e-7)).toBe(7);
        expect(decimalsOf(1.5e-7)).toBe(8);
    });

    it('a negative step counts like its size; not a number or no step is 0', () => {
        expect(decimalsOf(-0.5)).toBe(1);
        expect(decimalsOf(0)).toBe(0);
        expect(decimalsOf(Number.NaN)).toBe(0);
        expect(decimalsOf(Number.POSITIVE_INFINITY)).toBe(0);
    });
});

describe('roundTo', () => {
    it('rounds away the dust of the floating point', () => {
        expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
        expect(roundTo(2.6, 0)).toBe(3);
        expect(roundTo(1.005, 1)).toBe(1);
    });

    it('never gives -0', () => {
        expect(Object.is(roundTo(-0.4, 0), 0)).toBe(true);
        expect(Object.is(roundTo(-0.0004, 2), 0)).toBe(true);
    });

    it('no more than 12 places, a negative number of places is a whole number', () => {
        expect(roundTo(1 / 3, 20)).toBe(roundTo(1 / 3, 12));
        expect(roundTo(2.5, -3)).toBe(3);
    });
});

describe('normalizeNumber', () => {
    it('rounds, clamps, and rounds again: a bound off the grain stays whole', () => {
        expect(normalizeNumber(0.349, { precision: 2, max: 0.35 })).toBe(0.35);
        expect(normalizeNumber(9.99, { precision: 0, max: 9.4 })).toBe(9);
        expect(normalizeNumber(0.1 + 0.2, { precision: 1 })).toBe(0.3);
    });
});
