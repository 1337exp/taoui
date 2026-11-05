import { describe, expect, it } from 'vitest';
import { computePosition } from '../src/floating';

// 5.27.1: a floating panel starts on whole pixels, so its text and buttons do not jump when they are repainted under the pointer.
// 5.27.1: плавающая панель начинается с целых пикселей, поэтому её текст и кнопки не прыгают при перерисовке под указателем.

const viewport = { width: 1000, height: 800 };

describe('computePosition puts the panel on whole pixels', () => {
    it('a fractional anchor and an odd panel: top and left are whole, for every side', () => {
        const anchor = { left: 100.4, top: 200.6, width: 80.3, height: 31.7 };
        const size = { width: 141, height: 33 };
        for (const placement of ['top', 'bottom', 'left', 'right', 'bottom-start', 'top-end'] as const) {
            const { top, left } = computePosition({ anchor, size, viewport, placement });
            expect(Number.isInteger(top), `${placement} top ${top}`).toBe(true);
            expect(Number.isInteger(left), `${placement} left ${left}`).toBe(true);
        }
    });

    it('centred above a button: the half pixel goes to the nearest whole one, not away', () => {
        const { left } = computePosition({ anchor: { left: 100, top: 300, width: 81, height: 30 }, size: { width: 140, height: 30 }, viewport, placement: 'top' });
        // 100 + 40.5 - 70 = 70.5
        expect(left).toBe(71);
    });

    it('the arrow still points at the middle of the anchor, from the rounded position', () => {
        const anchor = { left: 100.4, top: 200.6, width: 80.3, height: 31.7 };
        const { left, anchorOffset } = computePosition({ anchor, size: { width: 141, height: 33 }, viewport, placement: 'top' });
        expect(anchorOffset.x).toBeCloseTo(anchor.left + anchor.width / 2 - left, 6);
    });

    it('the pad at the edge of the window is kept (whole pixels do not eat into it)', () => {
        const { left, top } = computePosition({ anchor: { left: 0, top: 0, width: 10, height: 10 }, size: { width: 100, height: 40 }, viewport, placement: 'top', pad: 8 });
        expect(left).toBeGreaterThanOrEqual(8);
        expect(top).toBeGreaterThanOrEqual(8);
    });
});
