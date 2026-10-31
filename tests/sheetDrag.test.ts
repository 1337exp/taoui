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

    it('closes when pulled a third of its height or more', () => {
        expect(shouldDismissSheet(100, 300, 0)).toBe(true);
        expect(shouldDismissSheet(89, 300, 0)).toBe(false);
    });

    it('closes on a quick fling even when pulled little, but not on a twitch', () => {
        expect(shouldDismissSheet(40, 600, 0.8)).toBe(true);
        expect(shouldDismissSheet(10, 600, 2)).toBe(false);
        expect(shouldDismissSheet(40, 600, 0.2)).toBe(false);
    });

    it('does not close when it was not pulled down at all', () => {
        expect(shouldDismissSheet(0, 300, 5)).toBe(false);
        expect(shouldDismissSheet(50, 0, 5)).toBe(false);
    });
});
