import { describe, expect, it } from 'vitest';
import { releaseVelocity, sheetOffset, shouldDismissSheet } from '../src/sheetDrag';

describe('sheetDrag', () => {
    it('the sheet follows the finger down and never goes above its place', () => {
        expect(sheetOffset(40)).toBe(40);
        expect(sheetOffset(-30)).toBe(0);
    });

    it('speed is taken over the last 100 ms only', () => {
        const samples = [{ t: 0, y: 0 }, { t: 400, y: 10 }, { t: 450, y: 40 }, { t: 500, y: 90 }];
        expect(releaseVelocity(samples)).toBeCloseTo(0.8, 5); // from t=400 (100 ms back): 80 px in 100 ms; t=0 is out of the window
    });

    it('speed is zero without samples and negative for a finger going up', () => {
        expect(releaseVelocity([])).toBe(0);
        expect(releaseVelocity([{ t: 0, y: 100 }, { t: 50, y: 60 }])).toBeLessThan(0);
    });

    it('closes when pulled half of its height or more, not on a graze', () => {
        expect(shouldDismissSheet(150, 300, 0)).toBe(true);
        expect(shouldDismissSheet(149, 300, 0)).toBe(false);
        expect(shouldDismissSheet(100, 300, 0)).toBe(false);
    });

    it('closes on a hard fling that went 15% of the height, not on a flick, a light swipe or a slow drift', () => {
        expect(shouldDismissSheet(100, 600, 1.4)).toBe(true);
        expect(shouldDismissSheet(90, 600, 1.2)).toBe(true);
        expect(shouldDismissSheet(80, 600, 1.4)).toBe(false);
        expect(shouldDismissSheet(40, 600, 1.4)).toBe(false);
        expect(shouldDismissSheet(10, 600, 3)).toBe(false);
        // a light swipe (0.8 px/ms, closed it before 5.22.0) and a brisk one (1.1) are only a pull: the sheet comes back
        expect(shouldDismissSheet(100, 600, 0.8)).toBe(false);
        expect(shouldDismissSheet(100, 600, 1.1)).toBe(false);
    });

    it('the threshold is yours: a share of the height, kept between 5% and the whole height', () => {
        expect(shouldDismissSheet(100, 300, 0, 0.3)).toBe(true);
        expect(shouldDismissSheet(100, 300, 0, 0.67)).toBe(false);
        expect(shouldDismissSheet(210, 300, 0, 0.67)).toBe(true);
        // a low threshold: the fling path is not longer than the threshold itself
        expect(shouldDismissSheet(20, 300, 1.4, 0.05)).toBe(true);
        // nonsense falls back or is held in range
        expect(shouldDismissSheet(150, 300, 0, Number.NaN)).toBe(true);
        expect(shouldDismissSheet(150, 300, 0, 5)).toBe(false);
        expect(shouldDismissSheet(300, 300, 0, 5)).toBe(true);
        expect(shouldDismissSheet(1, 300, 0, 0)).toBe(false);
    });

    it('does not close when it was not pulled down at all', () => {
        expect(shouldDismissSheet(0, 300, 5)).toBe(false);
        expect(shouldDismissSheet(50, 0, 5)).toBe(false);
    });
});
