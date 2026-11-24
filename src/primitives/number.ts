// Number primitives of the kit: one clamp, one rounding, one count of decimals. Slider, drag number, input number, colour, split, carousel,
// pagination and the rest had a copy each (and the copies differed: one kept `-0`, one missed `1.5e-7`). No Vue, no DOM.
// Числовые примитивы набора: один clamp, одно округление, один подсчёт знаков. У слайдера, drag number, input number, цвета, split,
// карусели, пагинации и остальных было по копии (и копии различались: одна оставляла `-0`, другая не знала `1.5e-7`). Без Vue и DOM.

/** Keeps the value between `min` and `max`; either may be missing. When `min` is above `max`, `max` wins. / Держит значение между `min` и `max`; любого может не быть. Если `min` больше `max`, побеждает `max`. */
export function clamp(value: number, min?: number, max?: number): number {
    let next = value;
    if (min !== undefined && next < min) {
        next = min;
    }
    if (max !== undefined && next > max) {
        next = max;
    }
    return next;
}

/**
 * Decimal places of a step: `0.25` is 2, `5` is 0, `1.5e-7` is 8. Not a number, or no step, is 0.
 * Знаков после запятой у шага: `0.25` — 2, `5` — 0, `1.5e-7` — 8. Не число или нет шага — 0.
 */
export function decimalsOf(step: number): number {
    if (!Number.isFinite(step)) {
        return 0;
    }
    const text = String(Math.abs(step));
    const exponent = /e-(\d+)$/.exec(text);
    if (exponent) {
        const mantissa = text.slice(0, text.indexOf('e'));
        const dot = mantissa.indexOf('.');
        return Number(exponent[1]) + (dot === -1 ? 0 : mantissa.length - dot - 1);
    }
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : text.length - dot - 1;
}

/** Rounds to `digits` decimal places (`0.1 + 0.2` is `0.3`); never gives `-0`. / Округляет до `digits` знаков (`0.1 + 0.2` — `0.3`); `-0` не отдаёт. */
export function roundTo(value: number, digits: number): number {
    if (digits <= 0) {
        return Math.round(value) + 0;
    }
    const factor = 10 ** Math.min(digits, 12);
    return Math.round(value * factor) / factor + 0;
}

/** The bounds and the grain of a value. / Границы и зерно значения. */
export interface NumberLimits {
    min?: number;
    max?: number;
    /** Decimal places the value is rounded to. / Знаков после запятой, до которых округляется значение. */
    precision: number;
}

/** Round, clamp, round again (a bound may not sit on the grain). / Округлить, зажать, округлить (граница может не лежать на зерне). */
export function normalizeNumber(value: number, limits: NumberLimits): number {
    return roundTo(clamp(roundTo(value, limits.precision), limits.min, limits.max), limits.precision);
}
