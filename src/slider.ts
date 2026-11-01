// Чистая логика TaoSlider: значение ↔ позиция, шаг, метки, ручки диапазона. Без Vue и DOM, поэтому проверяется тестами.
import { parseColor, toHex } from './color';
import { contrastRatio } from './palette';
import type { TaoSize } from './size';

/** Метка на шкале: значение, подпись (нет подписи: только черта). */
export interface TaoSliderMark {
    value: number;
    label?: string;
}

/** The colour roles a zone can wear. / Цветовые роли, в которые можно красить зону. */
export type TaoSliderZoneTone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

/**
 * A zone of the scale: it runs from the end of the previous one to `to` (the first from `min`, the last to `max`), so zones
 * never overlap and leave no gap. / Зона шкалы: идёт от конца предыдущей до `to` (первая от `min`, последняя до `max`), поэтому
 * зоны не пересекаются и не оставляют дыр.
 */
export interface TaoSliderZone {
    to: number;
    /** A colour role of the theme (default `accent`). / Роль цвета темы (по умолчанию `accent`). */
    tone?: TaoSliderZoneTone;
    /** Any CSS colour; wins over `tone`. Its contrast is yours to keep. / Любой CSS-цвет; главнее `tone`. Контраст — на вас. */
    color?: string;
    /** A dot on the scale where the zone ends (not at `max`). / Точка на шкале там, где зона кончается (не на `max`). */
    dot?: boolean;
    /**
     * The zone has no colour until the value reaches it: the bar looks plain and is painted as it fills; its dot shows when
     * the fill gets there. / У зоны нет цвета, пока значение до неё не дошло: полоса выглядит обычной и красится по мере
     * заполнения; её точка видна, когда заливка дошла.
     */
    reveal?: boolean;
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
    /**
     * Side of the marks: `end` (default) — below a horizontal slider / right of a vertical one, `start` — above / left.
     * / Сторона меток: `end` (по умолчанию) — под горизонтальным слайдером и справа от вертикального, `start` — над и слева.
     */
    marksSide?: 'start' | 'end';
    /** The value can only be on a mark (stepped scale with captions). / Значение только на метках (ступенчатая шкала с подписями). */
    discrete?: boolean;
    /** Text for numbers (marks, bar). / Текст чисел (метки, полоса). */
    format?: (value: number) => string;
    /**
     * No round thumbs: a flat bar with the fill only (the thumbs stay for keyboard and screen readers). A range collapsed into one point
     * shows a small dash there. / Без круглых ручек: плоская полоса с заливкой (для клавиатуры и скринридеров ручки остаются).
     * Диапазон, сведённый в точку, показывает там короткий штрих.
     */
    flat?: boolean;
    /**
     * Zones of the scale in colour: `{ to, tone?, color?, dot? }`, each runs to its `to`. The bar shows them dimmed, the filled
     * part in full colour, and the thumb takes the colour of the zone it stands in.
     * Зоны шкалы цветом: `{ to, tone?, color?, dot? }`, каждая идёт до своего `to`. Полоса показывает их приглушённо,
     * закрашенная часть полным цветом, а ручка берёт цвет зоны, в которой стоит.
     */
    zones?: readonly TaoSliderZone[];
    /**
     * A bubble with the value beside the thumb, in the colour of its zone (the accent without zones). Off by default.
     * `true`: it shows while the thumb is dragged, hovered or has the keyboard focus; `'always'`: it stays. The text is the
     * `format` of the value, or the `#bubble` slot. Leave room for it above a horizontal bar (to the right of a vertical one).
     * Плашка со значением у ручки, цвета её зоны (без зон — акцент). По умолчанию выключена. `true`: видна, пока ручку тянут,
     * на неё наведён указатель или у неё фокус клавиатуры; `'always'`: видна всегда. Текст — `format` значения или слот `#bubble`.
     * Оставьте ей место над горизонтальной полосой (справа от вертикальной).
     */
    bubble?: boolean | 'always';
    /** Vertical: the maximum is at the top. / Вертикальный: максимум сверху. */
    vertical?: boolean;
    disabled?: boolean;
    /** Red track outline. The message goes to TaoFormField `error`. / Красная обводка трека. Текст ошибки — в `error` у TaoFormField. */
    error?: boolean;
    /** `bar` — thick track, a form control. `thin` — thin track (seek, volume). / `bar` — толстый трек, форм-контрол. `thin` — тонкий (seek, громкость). */
    variant?: 'bar' | 'thin';
    /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
    size?: TaoSize;
    /** Accessible name of the thumbs. / Имя ручек для скринридеров. */
    ariaLabel?: string;
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

/** A zone ready to draw: its bounds, its CSS colour and whether it ends with a dot. / Зона к отрисовке: границы, CSS-цвет и точка на конце. */
export interface TaoSliderResolvedZone {
    from: number;
    to: number;
    color: string;
    /** The colour of a label on it: a role of the theme, a hex, or '' (the browser picks, see the bubble). / Цвет подписи на ней. */
    on: string;
    dot: boolean;
    reveal: boolean;
}

/** The CSS colour of a zone: `color` as given, else the theme role of `tone`, else the accent. / CSS-цвет зоны. */
export function zoneColor(zone: Pick<TaoSliderZone, 'tone' | 'color'>): string {
    if (zone.color) return zone.color;
    if (zone.tone === 'neutral') return 'var(--tao-color-text-muted)';
    return `var(--tao-color-${zone.tone ?? 'accent'})`;
}

const INK = '#0d0d0d';
const PAPER = '#ffffff';

/**
 * The colour of a label on a zone: the `on-` role of its tone; for a colour of your own the better of black and white when it can
 * be read here (hex, rgb, hsl), else '' and the browser decides in CSS.
 * Цвет подписи на зоне: роль `on-` её тона; для своего цвета чёрный или белый, что читается лучше, если цвет разбирается здесь
 * (hex, rgb, hsl), иначе '' и решает браузер в CSS.
 */
export function zoneOn(zone: Pick<TaoSliderZone, 'tone' | 'color'>): string {
    if (zone.color) {
        const rgba = parseColor(zone.color);
        if (!rgba) return '';
        const hex = toHex(rgba);
        return contrastRatio(INK, hex) >= contrastRatio(PAPER, hex) ? INK : PAPER;
    }
    return zone.tone === 'neutral' ? 'var(--tao-color-bg)' : `var(--tao-color-on-${zone.tone ?? 'accent'})`;
}

/**
 * Zones from the setting: sorted by `to`, kept inside min…max, a repeated or empty one dropped; the first starts at `min`, the
 * last is stretched to `max`. A dot sits where its zone really ended, so none at `max`.
 * Зоны из настройки: по возрастанию `to`, внутри min…max, повтор и пустая отбрасываются; первая от `min`, последняя
 * растянута до `max`. Точка стоит там, где зона кончилась на самом деле, поэтому на `max` её нет.
 */
export function normalizeZones(zones: readonly TaoSliderZone[] | undefined, min: number, max: number): TaoSliderResolvedZone[] {
    if (!zones?.length || !(max > min)) return [];
    const sorted = zones.filter((z) => Number.isFinite(z.to)).sort((a, b) => a.to - b.to);
    const out: TaoSliderResolvedZone[] = [];
    let from = min;
    for (const zone of sorted) {
        const to = clamp(zone.to, min, max);
        if (to <= from) continue;
        out.push({ from, to, color: zoneColor(zone), on: zoneOn(zone), dot: !!zone.dot && to < max, reveal: !!zone.reveal });
        from = to;
    }
    const last = out[out.length - 1];
    if (last && last.to < max) out[out.length - 1] = { ...last, to: max };
    return out;
}

/** The zone a value stands in; a value on a border belongs to the zone that ends there. / Зона, в которой стоит значение; на границе — та, что там кончается. */
export function zoneAt(value: number, zones: readonly TaoSliderResolvedZone[]): TaoSliderResolvedZone | undefined {
    return zones.find((z) => value <= z.to) ?? zones[zones.length - 1];
}

/**
 * A hard-stop gradient of the zones along the bar (from the start, from the bottom when vertical). `dimmed` is the layer of the
 * whole bar: a zone with `reveal` is clear there, so it shows only where the fill has been.
 * Градиент зон с жёсткими границами вдоль полосы. `dimmed` — слой всей полосы: зона с `reveal` в нём прозрачна и видна только там, где прошла заливка.
 */
export function zoneGradient(zones: readonly TaoSliderResolvedZone[], min: number, max: number, vertical = false, dimmed = false): string {
    const stops = zones.map((z) => `${dimmed && z.reveal ? 'transparent' : z.color} ${ratioOf(z.from, min, max) * 100}% ${ratioOf(z.to, min, max) * 100}%`);
    return `linear-gradient(${vertical ? 'to top' : 'to right'}, ${stops.join(', ')})`;
}
