import type { TaoToneName } from './tone';

/**
 * Small charts and a bridge to real chart libraries.
 * TaoUI draws only what fits in a line of text or a card corner (TaoSparkline, TaoMeter, TaoDonut, TaoHeatmap). Axes, tooltips,
 * zoom and thousands of points belong to a chart library; `taoChartTheme()` hands it the colours of the current theme.
 *
 * Маленькие графики и мост к настоящим библиотекам графиков.
 * TaoUI рисует только то, что помещается в строку текста или угол карточки (TaoSparkline, TaoMeter, TaoDonut, TaoHeatmap). Оси,
 * подсказки, зум и тысячи точек — дело библиотеки графиков; `taoChartTheme()` отдаёт ей цвета текущей темы.
 */

/** One part of a donut. / Одна часть кольца. */
export interface TaoDonutSegment {
    label: string;
    value: number;
    /** A status colour; otherwise the next series colour (`--tao-color-chart-N`). / Статусный цвет; иначе следующий цвет серии. */
    tone?: TaoToneName;
    /** Any CSS colour, wins over tone. / Любой CSS-цвет, важнее tone. */
    color?: string;
}

/** The series colours, in order: `--tao-color-chart-1` … `-6`. / Цвета серий по порядку. */
export const TAO_CHART_COLORS = 6;

export const chartColorVar = (index: number) => `var(--tao-color-chart-${(index % TAO_CHART_COLORS) + 1})`;

/** A finite number, or undefined for a gap / Конечное число или undefined (разрыв) */
const finite = (v: number | null | undefined): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * The points of a sparkline in a 100 × 100 box (y grows down). The value range is the data's own unless min / max say
 * otherwise; a flat series lies in the middle. Gaps (null, NaN) split the line into runs.
 * Точки спарклайна в квадрате 100 × 100 (y растёт вниз). Диапазон — по данным, если min / max не заданы; ровный ряд
 * лежит посередине. Пропуски (null, NaN) рвут линию на отрезки.
 */
export function sparklineRuns(values: readonly (number | null)[], min?: number, max?: number): [number, number][][] {
    const real = values.filter(finite);
    if (!real.length) {
        return [];
    }
    const lo = finite(min) ? min : Math.min(...real);
    const hi = finite(max) ? max : Math.max(...real);
    const span = hi - lo;
    const last = Math.max(1, values.length - 1);
    const runs: [number, number][][] = [];
    let run: [number, number][] = [];
    values.forEach((v, i) => {
        if (!finite(v)) {
            if (run.length) {
                runs.push(run);
            }
            run = [];
            return;
        }
        const t = span > 0 ? (Math.min(hi, Math.max(lo, v)) - lo) / span : 0.5;
        run.push([round((i / last) * 100), round((1 - t) * 100)]);
    });
    if (run.length) {
        runs.push(run);
    }
    return runs;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** The SVG path of the line / Путь линии */
export function sparklinePath(runs: [number, number][][]): string {
    return runs
        .map((run) => (run.length === 1 ? [run[0], [run[0][0] + 0.01, run[0][1]] as [number, number]] : run))
        .map((run) => run.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(''))
        .join('');
}

/** The SVG path of the area under each run, down to the baseline / Путь заливки под каждым отрезком до низа */
export function sparklineArea(runs: [number, number][][]): string {
    return runs
        .filter((run) => run.length > 1)
        .map((run) => `M${run[0][0]} 100` + run.map(([x, y]) => `L${x} ${y}`).join('') + `L${run[run.length - 1][0]} 100Z`)
        .join('');
}

/** The largest of 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8 × 10ⁿ not above x: 2 380 → 2 000, 470 → 400. / Круглое число не больше x. */
export function niceFloor(x: number): number {
    if (!(x > 0) || !Number.isFinite(x)) {
        return 0;
    }
    const magnitude = 10 ** Math.floor(Math.log10(x));
    const mantissa = [8, 6, 5, 4, 3, 2.5, 2, 1.5, 1].find((m) => m * magnitude <= x * (1 + 1e-9)) ?? 1;
    return round(mantissa * magnitude);
}

/**
 * The thresholds of a heatmap: round numbers at 10, 20, 40, 60 and 80% of the largest value, so the legend reads
 * «200+, 500+, 1 000+, 1 500+, 2 000+». A value below the first one is an empty cell.
 * Пороги тепловой карты: круглые числа на 10, 20, 40, 60 и 80% от наибольшего значения, чтобы легенда читалась
 * «200+, 500+, 1 000+, 1 500+, 2 000+». Значение ниже первого — пустая клетка.
 */
export function heatmapSteps(values: readonly (readonly (number | null | undefined)[])[]): number[] {
    const real = values.flat().filter(finite);
    const max = real.length ? Math.max(...real) : 0;
    if (!(max > 0)) {
        return [];
    }
    const steps: number[] = [];
    for (const share of [0.1, 0.2, 0.4, 0.6, 0.8]) {
        const step = niceFloor(max * share);
        if (step > 0 && step > (steps[steps.length - 1] ?? 0)) {
            steps.push(step);
        }
    }
    return steps;
}

/**
 * The level of a value: 0 below the first threshold (or no value), n at or above the n-th.
 * Уровень значения: 0 ниже первого порога (или без значения), n — от n-го порога.
 */
export function heatmapLevel(value: number | null | undefined, steps: readonly number[]): number {
    if (!finite(value)) {
        return 0;
    }
    let level = 0;
    steps.forEach((step, i) => {
        if (value >= step) {
            level = i + 1;
        }
    });
    return level;
}

export type TaoMeterTone = 'accent' | 'success' | 'warning' | 'danger';

/**
 * The colour of a meter, as the HTML `<meter>` decides it. Without `low` / `high` it is the accent. Otherwise the
 * range splits into three regions; the region of `optimum` (the middle by default) is good, the next one a warning,
 * the far one bad.
 * Цвет шкалы, как его выбирает HTML `<meter>`. Без `low` / `high` — акцент. Иначе диапазон делится на три области:
 * область `optimum` (по умолчанию середина) — хорошо, соседняя — предупреждение, дальняя — плохо.
 */
export function meterTone(value: number, min: number, max: number, low?: number, high?: number, optimum?: number): TaoMeterTone {
    if (!finite(low) && !finite(high)) {
        return 'accent';
    }
    const lo = finite(low) ? Math.max(min, low) : min;
    const hi = finite(high) ? Math.min(max, Math.max(lo, high)) : max;
    const region = (v: number) => (v < lo ? 0 : v > hi ? 2 : 1);
    const best = region(finite(optimum) ? optimum : (min + max) / 2);
    const away = Math.abs(region(value) - best);
    return away === 0 ? 'success' : away === 1 ? 'warning' : 'danger';
}

/** Where a value sits in the range, 0…1 / Где значение в диапазоне, 0…1 */
export function fraction(value: number, min: number, max: number): number {
    if (!(max > min) || !finite(value)) {
        return 0;
    }
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

/**
 * The arcs of a donut on a circle of length 100: `[start, length]` for each part. With more than one part a small gap
 * separates them; a part too small for the gap still shows as a sliver.
 * Дуги кольца на окружности длиной 100: `[начало, длина]` каждой части. Если частей больше одной, их разделяет
 * небольшой зазор; часть меньше зазора всё равно видна полоской.
 */
export function donutArcs(values: readonly number[], gap = 1): [number, number][] {
    const parts = values.map((v) => (finite(v) && v > 0 ? v : 0));
    const total = parts.reduce((a, b) => a + b, 0);
    if (total <= 0) {
        return parts.map(() => [0, 0]);
    }
    const shown = parts.filter((v) => v > 0).length;
    const space = shown > 1 ? gap : 0;
    let start = 0;
    return parts.map((v) => {
        const share = (v / total) * 100;
        const arc: [number, number] = v > 0 ? [round(start + space / 2), round(Math.max(0.3, share - space))] : [round(start), 0];
        start += share;
        return arc;
    });
}

/** The colours a chart library needs, resolved to `rgb()` / `rgba()` strings. / Цвета для библиотеки графиков в rgb(). */
export interface TaoChartTheme {
    /** The series colours, `--tao-color-chart-1…6` / Цвета серий */
    colors: string[];
    /** Labels, legend / Подписи, легенда */
    text: string;
    /** Axis ticks, secondary labels / Деления осей, второстепенные подписи */
    textMuted: string;
    /** Grid lines / Линии сетки */
    grid: string;
    /** Axis lines / Линии осей */
    axis: string;
    /** Behind the chart (a card) / Фон под графиком (карточка) */
    background: string;
    /** A tooltip box / Подсказка */
    tooltip: string;
    tooltipText: string;
    danger: string;
    success: string;
    warning: string;
    fontFamily: string;
    fontSize: number;
}

/**
 * Turns any CSS colour the browser computed (`rgb()`, `color(srgb …)`) into `rgb()` / `rgba()`, which every chart
 * library parses: the roles are often `color-mix()`, and canvas-based libraries do not read it.
 * Приводит вычисленный браузером цвет к `rgb()` / `rgba()`, которые понимает любая библиотека: роли часто `color-mix()`.
 */
export function toRgb(computed: string): string {
    const value = computed.trim();
    const srgb = /^color\(srgb\s+([\d.e-]+)\s+([\d.e-]+)\s+([\d.e-]+)(?:\s*\/\s*([\d.e-]+%?))?\s*\)$/i.exec(value);
    const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(value);
    let channels: number[];
    let alphaText: string | undefined;
    if (srgb) {
        channels = [srgb[1], srgb[2], srgb[3]].map((c) => Math.round(Math.min(1, Math.max(0, Number(c))) * 255));
        alphaText = srgb[4];
    } else if (rgb) {
        channels = [rgb[1], rgb[2], rgb[3]].map((c) => Math.round(Number(c)));
        alphaText = rgb[4];
    } else {
        return value;
    }
    const alpha = alphaText === undefined ? 1 : alphaText.endsWith('%') ? Number(alphaText.slice(0, -1)) / 100 : Number(alphaText);
    return alpha >= 1 ? `rgb(${channels.join(', ')})` : `rgba(${channels.join(', ')}, ${round(alpha)})`;
}

/**
 * The colours of the theme at an element (the page by default), ready for Chart.js, ECharts, uPlot and the like.
 * Call it again when the theme changes, or use `watchTaoChartTheme`. On the server it returns empty strings.
 * Цвета темы в точке элемента (по умолчанию страницы), готовые для Chart.js, ECharts, uPlot и других. Вызовите снова
 * при смене темы или используйте `watchTaoChartTheme`. На сервере возвращает пустые строки.
 */
export function taoChartTheme(el?: Element | null): TaoChartTheme {
    const host = el ?? (typeof document === 'undefined' ? null : document.body ?? document.documentElement);
    const empty = { colors: Array.from({ length: TAO_CHART_COLORS }, () => ''), text: '', textMuted: '', grid: '', axis: '', background: '', tooltip: '', tooltipText: '', danger: '', success: '', warning: '', fontFamily: '', fontSize: 12 };
    if (!host || typeof getComputedStyle === 'undefined') {
        return empty;
    }
    // a probe inside the element resolves var() and color-mix() where the element is: its palette, its mode
    // проба внутри элемента вычисляет var() и color-mix() там, где элемент: с его палитрой и режимом
    const probe = host.ownerDocument.createElement('span');
    probe.style.display = 'none';
    host.appendChild(probe);
    const color = (role: string) => {
        probe.style.color = `var(${role})`;
        return toRgb(getComputedStyle(probe).color);
    };
    const style = getComputedStyle(host);
    const theme: TaoChartTheme = {
        colors: Array.from({ length: TAO_CHART_COLORS }, (_, i) => color(`--tao-color-chart-${i + 1}`)),
        text: color('--tao-color-text'),
        textMuted: color('--tao-color-text-muted'),
        grid: color('--tao-color-border'),
        axis: color('--tao-color-border-strong'),
        background: color('--tao-color-surface-raised'),
        tooltip: color('--tao-color-surface-raised'),
        tooltipText: color('--tao-color-text-strong'),
        danger: color('--tao-color-danger'),
        success: color('--tao-color-success'),
        warning: color('--tao-color-warning'),
        fontFamily: style.getPropertyValue('--tao-font-family').trim() || style.fontFamily,
        fontSize: 12,
    };
    probe.remove();
    return theme;
}

/**
 * Calls `apply` with the chart theme now and every time the theme, the mode or the palette changes (the attributes and
 * classes of `<html>`, the system light / dark). Returns the function that stops watching.
 * Вызывает `apply` с темой графиков сейчас и при каждой смене темы, режима или палитры (атрибуты и классы `<html>`,
 * системная светлая / тёмная). Возвращает функцию, которая прекращает слежение.
 */
export function watchTaoChartTheme(apply: (theme: TaoChartTheme) => void, el?: Element | null): () => void {
    if (typeof document === 'undefined') {
        return () => {};
    }
    const run = () => apply(taoChartTheme(el));
    run();
    const observer = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(run);
    observer?.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style', 'data-tao-theme', 'data-tao-mode'] });
    const media = typeof matchMedia === 'undefined' ? undefined : matchMedia('(prefers-color-scheme: dark)');
    media?.addEventListener('change', run);
    return () => {
        observer?.disconnect();
        media?.removeEventListener('change', run);
    };
}
