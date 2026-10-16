// Чистая логика TaoSlider: значение ↔ позиция, шаг, метки, ручки диапазона. Без Vue и DOM, поэтому проверяется тестами.
import type { TaoSize } from './size';

/** Метка на шкале: значение, подпись (нет подписи: только черта). */
export interface TaoSliderMark {
    value: number;
    label?: string;
}

/** Значение слайдера: число (одна ручка) или пара [от, до] (диапазон). */
export type TaoSliderValue = number | [number, number];

/** Настройки, общие у TaoSlider и TaoRangeSlider (кроме самого значения). */
export interface TaoSliderBaseProps {
    min?: number;
    max?: number;
    step?: number;
    /** Minimum distance between the thumbs of a range. / Наименьшее расстояние между ручками диапазона. */
    minGap?: number;
    /** Value drawn on the bar. / Значение поверх полосы. */
    showValue?: boolean;
    /**
     * Scale marks: `true` — automatic ticks with numbers, an array of numbers, or `{ value, label? }` objects.
     * / Метки шкалы: `true` — автоматические деления с числами, массив чисел или объекты `{ value, label? }`.
     */
    marks?: boolean | readonly (number | TaoSliderMark)[];
    /** The value can only be on a mark (stepped scale with captions). / Значение только на метках (ступенчатая шкала с подписями). */
    discrete?: boolean;
    /** Text for numbers (marks, bar). / Текст чисел (метки, полоса). */
    format?: (value: number) => string;
    /** Vertical: the maximum is at the top. / Вертикальный: максимум сверху. */
    vertical?: boolean;
    disabled?: boolean;
    /** Red track outline. The message goes to TaoFormField `error`. / Красная обводка трека. Текст ошибки — в `error` у TaoFormField. */
    error?: boolean;
    /** `bar` — thick track, a form control. `thin` — thin track (seek, volume). / `bar` — толстый трек, форм-контрол. `thin` — тонкий (seek, громкость). */
    variant?: 'bar' | 'thin';
    /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
    size?: TaoSize;
    /** Step for the mouse wheel (a single thumb only). 0 — off. / Шаг для колёсика мыши (только одна ручка). 0 — отключено. */
    wheel?: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Сколько знаков после запятой у шага: 0.05 → 2. Нужно, чтобы шаг не оставлял хвост float («0.30000000000000004»). */
export function decimalsOf(step: number): number {
    if (!Number.isFinite(step) || step <= 0) return 0;
    const s = String(step);
    if (s.includes('e-')) return Number(s.split('e-')[1]);
    return s.includes('.') ? s.split('.')[1]!.length : 0;
}

const roundTo = (v: number, decimals: number) => {
    const k = Math.pow(10, decimals);
    return Math.round(v * k) / k + 0; // + 0 убирает «-0»
};

/** Доля 0…1, на которой лежит значение (min = max даёт 0). */
export function ratioOf(value: number, min: number, max: number): number {
    return max > min ? clamp((value - min) / (max - min), 0, 1) : 0;
}

/** Значение для доли шкалы: прижато к шагу от `min` и к границам, без хвоста float. */
export function valueAt(ratio: number, min: number, max: number, step: number): number {
    const raw = min + clamp(ratio, 0, 1) * (max - min);
    if (!(step > 0)) return clamp(raw, min, max);
    const snapped = min + Math.round((raw - min) / step) * step;
    return clamp(roundTo(snapped, Math.max(decimalsOf(step), decimalsOf(min))), min, max);
}

/** Ближайшая из меток (при равном расстоянии берётся меньшая). Пустой список: значение как есть. */
export function nearestMark(value: number, marks: readonly number[]): number {
    let best = value;
    let bestDistance = Infinity;
    for (const m of marks) {
        const d = Math.abs(m - value);
        if (d < bestDistance || (d === bestDistance && m < best)) {
            best = m;
            bestDistance = d;
        }
    }
    return best;
}

/** Следующая метка от значения в направлении `dir` (1 вверх, -1 вниз); на краю остаётся на месте. */
export function stepMark(value: number, marks: readonly number[], dir: 1 | -1): number {
    const sorted = [...marks].sort((a, b) => a - b);
    const next = dir > 0 ? sorted.find((m) => m > value) : [...sorted].reverse().find((m) => m < value);
    return next ?? value;
}

/**
 * Какая ручка идёт к точке `target`: ближайшая. Если обе одинаково близко (стоят в одной точке), решает сторона:
 * правее точки берём верхнюю, левее нижнюю, а ровно в ней последнюю двигавшуюся.
 */
export function nearestThumb(values: readonly number[], target: number, last = 0): number {
    if (values.length < 2) return 0;
    const d0 = Math.abs(values[0]! - target);
    const d1 = Math.abs(values[1]! - target);
    if (d0 !== d1) return d0 < d1 ? 0 : 1;
    if (target > values[0]!) return 1;
    if (target < values[0]!) return 0;
    return last === 1 ? 1 : 0;
}

/** Ставит ручку `index` диапазона в `next`: ручки не перепрыгивают друг друга и держат зазор `gap`, значения в границах. */
export function moveThumb(values: readonly [number, number], index: 0 | 1, next: number, min: number, max: number, gap = 0): [number, number] {
    const [a, b] = values;
    return index === 0 ? [clamp(next, min, Math.max(min, b - gap)), b] : [a, clamp(next, Math.min(max, a + gap), max)];
}

/** Приводит значение к допустимому виду: в границах, диапазон по возрастанию. */
export function normalizeValue(value: TaoSliderValue, min: number, max: number): number[] {
    const list = Array.isArray(value) ? [value[0], value[1]] : [value];
    const clamped = list.map((v) => clamp(Number.isFinite(v) ? v : min, min, max));
    return clamped.length === 2 ? clamped.sort((x, y) => x - y) : clamped;
}

/** Шаг «1, 2, 5 × 10ⁿ», при котором на отрезке `span` выходит около `count` делений. */
export function niceStep(span: number, count: number): number {
    if (!(span > 0)) return 1;
    const raw = span / Math.max(1, count);
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / pow;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pow;
}

/** Значения «красивых» делений на отрезке min…max, включая кратные шагу края; около `count` штук. */
export function niceTicks(min: number, max: number, count = 5): number[] {
    if (!(max > min)) return [min];
    const step = niceStep(max - min, count);
    const decimals = decimalsOf(step);
    const out: number[] = [];
    for (let i = Math.ceil(min / step - 1e-9); i * step <= max + step * 1e-9; i++) out.push(roundTo(i * step, decimals));
    return out;
}

/**
 * Метки из настройки слайдера: `true` даёт красивые деления с подписями-числами, массив чисел метки с подписями-числами,
 * массив объектов берётся как есть. Метки вне шкалы отбрасываются, список по возрастанию.
 */
export function normalizeMarks(
    marks: boolean | readonly (number | TaoSliderMark)[] | undefined,
    min: number,
    max: number,
    format: (value: number) => string = String,
): TaoSliderMark[] {
    if (!marks) return [];
    const list: TaoSliderMark[] =
        marks === true ? niceTicks(min, max).map((value) => ({ value })) : marks.map((m) => (typeof m === 'number' ? { value: m } : m));
    return list
        .filter((m) => m.value >= min && m.value <= max)
        .map((m) => (m.label === undefined ? { ...m, label: format(m.value) } : m))
        .sort((a, b) => a.value - b.value);
}

/** Метка попадает в закрашенную часть: у одной ручки значение не больше неё, у диапазона между ручками. */
export function isMarkActive(markValue: number, values: readonly number[]): boolean {
    return values.length === 2 ? markValue >= values[0]! && markValue <= values[1]! : markValue <= (values[0] ?? 0);
}
