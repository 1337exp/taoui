import { afterEach, describe, expect, it } from 'vitest';
import { glideDuration, glideTarget, FLICK_SPEED } from '../src/carousel';
import { toCssBox, toCssLength } from '../src/length';
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
    afterEach(() => setTaoLocale(localeRu));

    it('is Russian by default', () => {
        expect(taoLocale().select.placeholder).toBe('Выберите');
        expect(taoLocale().code).toBe('ru-RU');
    });

    it('switches to a whole locale and to toast / confirm defaults', () => {
        setTaoLocale(localeEn);
        expect(taoLocale().select.placeholder).toBe('Select');
        expect(toastDefaults.closeLabel).toBe(localeEn.toast.closeLabel);
        expect(confirmDefaults.ok).toBe('OK');
    });

    it('merges a few keys on top of the base', () => {
        setTaoLocale({ select: { placeholder: 'Pick one' }, avatar: { dotLabels: { success: 'here' } } });
        expect(taoLocale().select.placeholder).toBe('Pick one');
        expect(taoLocale().select.clearText).toBe('Очистить');
        expect(taoLocale().avatar.dotLabels.success).toBe('here');
        expect(taoLocale().avatar.dotLabels.danger).toBe('занят');
    });

    it('fills {placeholders}', () => {
        expect(formatText('Слайд {n} из {count}', { n: 1, count: 5 })).toBe('Слайд 1 из 5');
        expect(formatText('{missing}', {})).toBe('{missing}');
    });
});
