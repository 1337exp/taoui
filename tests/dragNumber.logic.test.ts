import { describe, expect, it } from 'vitest';
import {
    dragNumberAdvance,
    dragNumberResolve,
    dragNumberRepeatDelay,
    dragNumberSpeed,
    formatDragNumber,
    parseDragNumber,
} from '../src/dragNumber';

// 5.53.0: the logic of TaoDragNumber, apart from the component.
// 5.53.0: логика TaoDragNumber отдельно от компонента.

describe('dragNumberAdvance', () => {
    it('moves by pixels × speed, a tenth of it with Shift', () => {
        expect(dragNumberAdvance(0, 10, { speed: 0.5 })).toBe(5);
        expect(dragNumberAdvance(0, 10, { speed: 0.5, fine: true })).toBeCloseTo(0.5);
        expect(dragNumberAdvance(5, -4, { speed: 0.5 })).toBe(3);
    });

    it('stops at the bounds, and the way back starts at once, not after the overshoot', () => {
        const stopped = dragNumberAdvance(9, 100, { speed: 1, max: 10 });
        expect(stopped).toBe(10);
        expect(dragNumberAdvance(stopped, -1, { speed: 1, max: 10 })).toBe(9);
    });

    it('a slow drag adds up under the grain instead of being eaten by it', () => {
        let raw = 0;
        for (let i = 0; i < 20; i++) {
            raw = dragNumberAdvance(raw, 1, { speed: 0.1, fine: true });
        }
        expect(raw).toBeCloseTo(0.2);
        let moves = 0;
        let value = 0;
        for (let i = 0; i < 400; i++) {
            raw = dragNumberAdvance(raw, 1, { speed: 0.1, fine: true });
            const next = dragNumberResolve(raw, { precision: 0 }, 1);
            if (next !== value) {
                moves++;
                value = next;
            }
        }
        expect(moves).toBe(4);
    });
});

describe('dragNumberResolve / dragNumberSpeed', () => {
    it('Ctrl snaps to the grid of the step, from zero', () => {
        expect(dragNumberResolve(2.4, { precision: 2 }, 0.5, true)).toBe(2.5);
        expect(dragNumberResolve(2.2, { precision: 2 }, 0.5, true)).toBe(2);
        expect(dragNumberResolve(2.2, { precision: 2 }, 0.5)).toBe(2.2);
    });

    it('the speed is a quarter of a step per pixel, or the given one', () => {
        expect(dragNumberSpeed(1)).toBe(0.25);
        expect(dragNumberSpeed(0.5, 2)).toBe(2);
        expect(dragNumberSpeed(0.5, 0)).toBe(0.125);
    });
});

describe('dragNumberRepeatDelay', () => {
    it('a long pause first, then a steady pace that speeds up and stops at 40 ms', () => {
        expect(dragNumberRepeatDelay(0)).toBe(400);
        expect(dragNumberRepeatDelay(1)).toBe(120);
        expect(dragNumberRepeatDelay(2)).toBe(112);
        expect(dragNumberRepeatDelay(11)).toBe(40);
        expect(dragNumberRepeatDelay(500)).toBe(40);
    });
});

describe('formatDragNumber', () => {
    it('no trailing zeros', () => {
        expect(formatDragNumber(5, 2)).toBe('5');
        expect(formatDragNumber(0.5, 2)).toBe('0.5');
        expect(formatDragNumber(0.1 + 0.2, 2)).toBe('0.3');
    });
});

describe('parseDragNumber', () => {
    it('reads a number, a comma as the point, the typographic minus', () => {
        expect(parseDragNumber('5')).toBe(5);
        expect(parseDragNumber(' 0,5 ')).toBe(0.5);
        expect(parseDragNumber('−3.5')).toBe(-3.5);
        expect(parseDragNumber('+2')).toBe(2);
        expect(parseDragNumber('.5')).toBe(0.5);
        expect(parseDragNumber('5.')).toBe(5);
    });

    it('accepts the unit of the field after the number, and nothing else', () => {
        expect(parseDragNumber('5 m', 'm')).toBe(5);
        expect(parseDragNumber('5m', 'm')).toBe(5);
        expect(parseDragNumber('5 M', 'm')).toBe(5);
        expect(parseDragNumber('5 cm', 'm')).toBeNull();
        expect(parseDragNumber('5 m')).toBeNull();
    });

    it('is not a number: null, so the field goes back to its value', () => {
        expect(parseDragNumber('')).toBeNull();
        expect(parseDragNumber('-')).toBeNull();
        expect(parseDragNumber('abc')).toBeNull();
        expect(parseDragNumber('1e5')).toBeNull();
        expect(parseDragNumber('1 2')).toBeNull();
    });
});
