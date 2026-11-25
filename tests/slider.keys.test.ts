import { describe, expect, it } from 'vitest';
import { keyTarget, snapValue, type TaoSliderScale } from '../src/slider';
import { parseTyped } from '../src/sliderEditor';

const plain: TaoSliderScale = { min: 0, max: 100, step: 5, stops: [] };
const stepped: TaoSliderScale = { min: 0, max: 100, step: 1, stops: [0, 25, 50, 100] };

describe('snapValue', () => {
    it('snaps to the step and the bounds on a continuous scale', () => {
        expect(snapValue(12, plain)).toBe(10);
        expect(snapValue(13, plain)).toBe(15);
        expect(snapValue(-30, plain)).toBe(0);
        expect(snapValue(900, plain)).toBe(100);
    });

    it('keeps no float tail', () => {
        expect(snapValue(0.30000000000000004, { min: 0, max: 1, step: 0.1, stops: [] })).toBe(0.3);
    });

    it('snaps to the nearest stop on a stepped scale (the smaller one on a tie)', () => {
        expect(snapValue(30, stepped)).toBe(25);
        expect(snapValue(75, stepped)).toBe(50);
        expect(snapValue(1000, stepped)).toBe(100);
    });
});

describe('keyTarget', () => {
    it('arrows move one step', () => {
        expect(keyTarget('ArrowRight', 20, plain)).toBe(25);
        expect(keyTarget('ArrowUp', 20, plain)).toBe(25);
        expect(keyTarget('ArrowLeft', 20, plain)).toBe(15);
        expect(keyTarget('ArrowDown', 20, plain)).toBe(15);
    });

    it('PageUp and PageDown move ten steps', () => {
        expect(keyTarget('PageUp', 20, plain)).toBe(70);
        expect(keyTarget('PageDown', 20, plain)).toBe(0);
    });

    it('Home and End go to the bounds', () => {
        expect(keyTarget('Home', 20, plain)).toBe(0);
        expect(keyTarget('End', 20, plain)).toBe(100);
    });

    it('stays inside the bounds', () => {
        expect(keyTarget('ArrowRight', 100, plain)).toBe(100);
        expect(keyTarget('ArrowLeft', 0, plain)).toBe(0);
    });

    it('goes stop by stop on a stepped scale, arrows and pages alike', () => {
        expect(keyTarget('ArrowRight', 25, stepped)).toBe(50);
        expect(keyTarget('ArrowLeft', 25, stepped)).toBe(0);
        expect(keyTarget('PageUp', 50, stepped)).toBe(100);
        expect(keyTarget('ArrowRight', 100, stepped)).toBe(100);
        expect(keyTarget('Home', 50, stepped)).toBe(0);
    });

    it('does nothing for any other key', () => {
        expect(keyTarget('Enter', 20, plain)).toBeNull();
        expect(keyTarget('a', 20, plain)).toBeNull();
        expect(keyTarget('Tab', 20, stepped)).toBeNull();
    });
});

describe('parseTyped', () => {
    it('reads a plain decimal, with a comma, spaces and a sign', () => {
        expect(parseTyped('42')).toBe(42);
        expect(parseTyped(' 1 000,5 ')).toBe(1000.5);
        expect(parseTyped('-3')).toBe(-3);
        expect(parseTyped('.5')).toBe(0.5);
        expect(parseTyped('1e3')).toBe(1000);
    });

    it('refuses what Number() would read but a person did not mean', () => {
        expect(parseTyped('0x10')).toBeNull();
        expect(parseTyped('1e500')).toBeNull();
        expect(parseTyped('Infinity')).toBeNull();
        expect(parseTyped('')).toBeNull();
        expect(parseTyped('abc')).toBeNull();
    });
});
