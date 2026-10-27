// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { computePosition } from '../src/floating';
import { findByPrefix, firstEnabled, lastEnabled, stepEnabled } from '../src/listNav';

const viewport = { width: 1000, height: 800 };
const size = { width: 200, height: 100 };
const at = (left: number, top: number, width = 100, height = 30) => ({ left, top, width, height });

describe('computePosition', () => {
    it('bottom-start: below the anchor, left edges aligned', () => {
        const r = computePosition({ anchor: at(300, 100), size, viewport });
        expect(r).toMatchObject({ top: 134, left: 300, side: 'bottom' });
    });

    it('bottom-end aligns the right edges; a menu at the page edge falls back to the start edge', () => {
        expect(computePosition({ anchor: at(500, 100), size, viewport, placement: 'bottom-end' }).left).toBe(400);
        expect(computePosition({ anchor: at(20, 100), size, viewport, placement: 'bottom-end' }).left).toBe(20);
    });

    it('flips up when there is no room below and more above', () => {
        const r = computePosition({ anchor: at(300, 740), size, viewport });
        expect(r.side).toBe('top');
        expect(r.top).toBe(740 - 100 - 4);
    });

    it('does not flip when the opposite side is tighter', () => {
        const r = computePosition({ anchor: at(300, 20), size: { width: 200, height: 780 }, viewport, placement: 'top' });
        expect(r.side).toBe('bottom');
    });

    it('flip can be switched off', () => {
        expect(computePosition({ anchor: at(300, 740), size, viewport, flip: false }).side).toBe('bottom');
    });

    it('centres across the axis without an alignment and reports the anchor centre for an arrow', () => {
        const r = computePosition({ anchor: at(400, 300), size, viewport, placement: 'top', gap: 8 });
        expect(r).toMatchObject({ side: 'top', left: 350, top: 300 - 100 - 8 });
        expect(r.anchorOffset.x).toBe(100);
    });

    it('left / right sides', () => {
        expect(computePosition({ anchor: at(500, 300), size, viewport, placement: 'right-start' })).toMatchObject({ side: 'right', left: 604, top: 300 });
        expect(computePosition({ anchor: at(500, 300), size, viewport, placement: 'left-start' })).toMatchObject({ side: 'left', left: 296 });
    });

    it('clamps into the viewport on both axes', () => {
        const r = computePosition({ anchor: at(950, 10), size, viewport, placement: 'top' });
        expect(r.left + size.width).toBeLessThanOrEqual(1000 - 8);
        expect(r.top).toBeGreaterThanOrEqual(8);
    });
});

describe('list navigation', () => {
    const enabled = [true, false, true, true, false];

    it('steps over disabled items and wraps', () => {
        expect(stepEnabled(enabled, 0, 1)).toBe(2);
        expect(stepEnabled(enabled, 3, 1)).toBe(0);
        expect(stepEnabled(enabled, 0, -1)).toBe(3);
        expect(stepEnabled(enabled, 3, 1, false)).toBe(3);
        expect(stepEnabled([false, false], 0, 1)).toBe(-1);
    });

    it('first / last enabled', () => {
        expect(firstEnabled(enabled)).toBe(0);
        expect(lastEnabled(enabled)).toBe(3);
        expect(firstEnabled([false])).toBe(-1);
    });

    it('type-ahead finds the next label that starts with the text, skipping disabled ones', () => {
        const labels = ['Alpha', 'Beta', 'Bravo', 'Charlie'];
        const on = [true, true, false, true];
        expect(findByPrefix(labels, on, 'b', 0)).toBe(1);
        expect(findByPrefix(labels, on, 'b', 1)).toBe(1); // Bravo is disabled: all the way round to Beta
        expect(findByPrefix(labels, on, 'ch', 0)).toBe(3);
        expect(findByPrefix(labels, on, 'z', 0)).toBe(-1);
    });
});
