import { afterEach, describe, expect, it } from 'vitest';
import { glideDuration, glideTarget, FLICK_SPEED } from '../src/carousel';
import { toCssBox, toCssLength } from '../src/length';
import { decimalsOf, isMarkActive, moveThumb, nearestMark, nearestThumb, niceTicks, normalizeMarks, normalizeValue, ratioOf, stepMark, valueAt } from '../src/slider';
import { resolveSize, sizeClass } from '../src/size';
import { surfaceClass } from '../src/surface';
import { formatText, localeEn, localeRu, setTaoLocale, taoLocale } from '../src/locale';
import { confirmDefaults } from '../src/confirm/store';
import { toastDefaults } from '../src/toast/store';

describe('size', () => {
    it('adds a class only for an explicit size', () => {
        expect(sizeClass('small')).toBe('tao-size-small');
        expect(sizeClass(undefined)).toBeUndefined();
    });

    it('resolves the explicit prop first, then --tao-size, then medium', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        expect(resolveSize(el, 'large')).toBe('large');
        el.style.setProperty('--tao-size', 'small');
        expect(resolveSize(el)).toBe('small');
        el.style.setProperty('--tao-size', 'huge');
        expect(resolveSize(el)).toBe('medium');
        expect(resolveSize(null)).toBe('medium');
        el.remove();
    });
});

describe('surface', () => {
    it('flat and nothing add no class', () => {
        expect(surfaceClass('flat')).toBeUndefined();
        expect(surfaceClass(undefined)).toBeUndefined();
        expect(surfaceClass('glass')).toBe('tao-surface-glass');
    });

    it('toast and confirm float over the page, so they are glass by default', () => {
        expect(toastDefaults.surface).toBe('glass');
        expect(confirmDefaults.surface).toBe('glass');
    });
});

describe('length', () => {
    it('turns numbers into px and keeps strings', () => {
        expect(toCssLength(12)).toBe('12px');
        expect(toCssLength('1rem')).toBe('1rem');
        expect(toCssLength('')).toBeUndefined();
        expect(toCssLength(undefined)).toBeUndefined();
        expect(toCssBox([4, '1rem'])).toBe('4px 1rem');
        expect(toCssBox(16)).toBe('16px');
    });
});

describe('carousel glide', () => {
    const pitch = 100;
    const max = 1000;

    it('lands on a whole slide', () => {
        expect(glideTarget(130, 0, pitch, max)).toBe(100);
        expect(glideTarget(160, 0, pitch, max)).toBe(200);
        expect(glideTarget(130, 1, pitch, max) % pitch).toBe(0);
    });

    it('a flick moves at least one slide in its direction', () => {
        const fast = FLICK_SPEED + 0.01;
        expect(glideTarget(100, fast, pitch, max)).toBeGreaterThanOrEqual(200);
        expect(glideTarget(100, -fast, pitch, max)).toBeLessThanOrEqual(0);
        // a slow-ish flick back from 190 stops at the slide it was on / неспешный бросок назад с 190 — на слайде 1
        expect(glideTarget(190, -fast, pitch, max)).toBe(100);
    });

    it('stays inside the track', () => {
        expect(glideTarget(950, 5, pitch, max)).toBe(max);
        expect(glideTarget(20, -5, pitch, max)).toBe(0);
    });

    it('keeps the release speed and settles calmly from rest', () => {
        // ease-out cubic starts at 3·distance/duration → 3·300/1 = 900ms, capped
        expect(glideDuration(300, 1)).toBe(900);
        expect(glideDuration(300, 3)).toBe(300);
        expect(glideDuration(60, 0)).toBe(272);
        expect(glideDuration(-60, 2)).toBe(272);
    });
});

describe('locale', () => {
    afterEach(() => setTaoLocale(localeEn));

    it('is English by default', () => {
        expect(taoLocale().select.placeholder).toBe('Select');
        expect(taoLocale().code).toBe('en-US');
    });

    it('switches to a whole locale and to toast / confirm defaults', () => {
        setTaoLocale(localeRu);
        expect(taoLocale().select.placeholder).toBe('Выберите');
        expect(taoLocale().code).toBe('ru-RU');
        expect(toastDefaults.closeLabel).toBe(localeRu.toast.closeLabel);
        expect(confirmDefaults.ok).toBe(localeRu.confirm.ok);
    });

    it('merges a few keys on top of the base', () => {
        setTaoLocale({ select: { placeholder: 'Pick one' }, avatar: { dotLabels: { success: 'here' } } });
        expect(taoLocale().select.placeholder).toBe('Pick one');
        expect(taoLocale().select.clearText).toBe('Clear');
        expect(taoLocale().avatar.dotLabels.success).toBe('here');
        expect(taoLocale().avatar.dotLabels.danger).toBe('busy');
    });

    it('fills {placeholders}', () => {
        expect(formatText('Слайд {n} из {count}', { n: 1, count: 5 })).toBe('Слайд 1 из 5');
        expect(formatText('{missing}', {})).toBe('{missing}');
    });
});

describe('slider logic', () => {
    it('value from a ratio snaps to the step without a float tail', () => {
        expect(valueAt(0.5, 0, 100, 1)).toBe(50);
        expect(valueAt(0.333, 0, 1, 0.05)).toBe(0.35);
        expect(valueAt(0.3, 0, 1, 0.1)).toBe(0.3);
        expect(valueAt(2, 0, 10, 1)).toBe(10);
        expect(valueAt(-1, 5, 10, 1)).toBe(5);
        expect(valueAt(0.5, 1, 10, 3)).toBe(7); // шаг считается от min: 1, 4, 7, 10; 5.5 ровно посередине, округляем вверх
        expect(decimalsOf(0.05)).toBe(2);
        expect(decimalsOf(1e-7)).toBe(7);
        expect(ratioOf(5, 0, 10)).toBe(0.5);
        expect(ratioOf(5, 3, 3)).toBe(0);
    });

    it('marks: nearest, next in a direction, active part', () => {
        expect(nearestMark(6, [0, 5, 10])).toBe(5);
        expect(nearestMark(2.5, [0, 5])).toBe(0); // поровну: меньшая
        expect(stepMark(5, [10, 0, 5], 1)).toBe(10);
        expect(stepMark(5, [0, 5, 10], -1)).toBe(0);
        expect(stepMark(10, [0, 5, 10], 1)).toBe(10);
        expect(isMarkActive(3, [5])).toBe(true);
        expect(isMarkActive(7, [5])).toBe(false);
        expect(isMarkActive(7, [5, 8])).toBe(true);
        expect(isMarkActive(2, [5, 8])).toBe(false);
    });

    it('the nearest thumb of a range, ties are resolved by the side', () => {
        expect(nearestThumb([2, 8], 3)).toBe(0);
        expect(nearestThumb([2, 8], 7)).toBe(1);
        expect(nearestThumb([5, 5], 7)).toBe(1);
        expect(nearestThumb([5, 5], 3)).toBe(0);
        expect(nearestThumb([5, 5], 5, 1)).toBe(1);
        expect(nearestThumb([4], 9)).toBe(0);
    });

    it('thumbs do not cross and keep the gap, values are normalised', () => {
        expect(moveThumb([2, 6], 0, 9, 0, 10, 1)).toEqual([5, 6]);
        expect(moveThumb([2, 6], 1, 0, 0, 10, 1)).toEqual([2, 3]);
        expect(moveThumb([2, 6], 1, 99, 0, 10)).toEqual([2, 10]);
        expect(normalizeValue([9, 2], 0, 10)).toEqual([2, 9]);
        expect(normalizeValue(50, 0, 10)).toEqual([10]);
        expect(normalizeValue(Number.NaN, 0, 10)).toEqual([0]);
    });

    it('automatic ticks are 1-2-5 and marks are built from any form', () => {
        expect(niceTicks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
        expect(niceTicks(0, 1, 4)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
        expect(niceTicks(3, 3)).toEqual([3]);

        expect(normalizeMarks(false, 0, 10)).toEqual([]);
        expect(normalizeMarks([5, 20, 0], 0, 10, (v) => `${v}$`)).toEqual([{ value: 0, label: '0$' }, { value: 5, label: '5$' }]);
        expect(normalizeMarks([{ value: 1, label: 'D' }, { value: 2 }], 0, 10)).toEqual([{ value: 1, label: 'D' }, { value: 2, label: '2' }]);
        expect(normalizeMarks(true, 0, 10)[0]).toEqual({ value: 0, label: '0' });
    });
});

describe('tone', () => {
    it('toneClass gives the accent without a tone and warns once about an unknown one', async () => {
        const { toneClass } = await import('../src/tone');
        const { vi } = await import('vitest');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        expect(toneClass()).toBe('tao-tone-accent');
        expect(toneClass('danger')).toBe('tao-tone-danger');
        expect(warn).not.toHaveBeenCalled();
        toneClass('error' as never);
        toneClass('error' as never);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});
