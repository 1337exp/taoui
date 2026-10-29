<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { heatmapLevel, heatmapSteps } from '../chart';
import { useTaoLocale } from '../locale';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoHeatmap' });

// A value for each pair of two things: orders by day and hour, visits by week and weekday. The colour says how much,
// by thresholds the legend names («500+»); the exact number is in the tip and for a screen reader in the cell.
// Значение для каждой пары: заказы по дню и часу, визиты по неделе и дню недели. Цвет говорит «сколько» по порогам,
// которые называет легенда («500+»); точное число — в подсказке, а для скринридера — в клетке.
const props = withDefaults(
    defineProps<{
        /** One array per row, one value per column; `null` is no data. / Массив на строку, значение на столбец; null — нет данных. */
        values: readonly (readonly (number | null)[])[];
        /** The row names: «Mon», «Tue». / Имена строк. */
        rows: readonly string[];
        /** The column names: «12 am», «1 am». / Имена столбцов. */
        cols: readonly string[];
        /** The thresholds, ascending; by default round numbers by the largest value. / Пороги по возрастанию; по умолчанию — круглые числа по наибольшему значению. */
        steps?: readonly number[];
        tone?: TaoToneName;
        /** What it shows, for a screen reader. / Что показывает, для скринридера. */
        label?: string;
        /** The thresholds with their colours under the map. / Пороги с цветами под картой. */
        legend?: boolean;
        /** How many of the lowest levels are hatched, so they read apart in grey too. / Сколько нижних уровней заштриховано, чтобы различаться и без цвета. */
        hatch?: number;
        /** Show every n-th column name (all are read); by default as often as they fit. / Показывать каждое n-е имя столбца (читаются все); по умолчанию — так часто, как помещаются. */
        labelEvery?: number;
        /** Where the column names stand. / Где стоят имена столбцов. */
        colLabels?: 'top' | 'bottom';
        /** The cell height, px; square cells by default. / Высота клетки, px; по умолчанию клетки квадратные. */
        cellHeight?: number;
        /** The gap between cells, px. / Зазор между клетками, px. */
        gap?: number;
        /** How a number is written; by default by the locale («2 140»). / Как записать число; по умолчанию по локали. */
        format?: (value: number) => string;
    }>(),
    {
        steps: undefined,
        tone: 'accent',
        label: undefined,
        legend: true,
        hatch: 1,
        labelEvery: undefined,
        colLabels: 'bottom',
        cellHeight: undefined,
        gap: 3,
        format: undefined,
    },
);

defineSlots<{
    /** The tip over a cell. / Подсказка над клеткой. */
    tip?(props: { row: string; col: string; value: number | null; text: string }): unknown;
}>();

const locale = useTaoLocale();
const numberFormat = computed(() => new Intl.NumberFormat(locale.value.code));
const write = (value: number | null) => (value === null || !Number.isFinite(value) ? '—' : props.format ? props.format(value) : numberFormat.value.format(value));

const thresholds = computed(() => (props.steps ? [...props.steps].sort((a, b) => a - b) : heatmapSteps(props.values)));
const top = computed(() => Math.max(1, thresholds.value.length));

interface Cell {
    key: string;
    value: number | null;
    level: number;
    text: string;
}

const grid = computed<Cell[][]>(() =>
    props.rows.map((_, r) =>
        props.cols.map((_, c) => {
            const raw = props.values[r]?.[c];
            const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
            return { key: `${r}-${c}`, value, level: heatmapLevel(value, thresholds.value), text: write(value) };
        }),
    ),
);

// the strength of a level: the first is faint, the last the full tone
// сила уровня: первый бледный, последний — тон целиком
const strength = (level: number) => Math.round(18 + (82 * (level - 1)) / Math.max(1, top.value - 1));
const levelStyle = (level: number) => (level > 0 ? { '--_mix': `${top.value === 1 ? 100 : strength(level)}%` } : undefined);
const levelClass = (level: number) => ({
    'tao-heatmap__fill--on': level > 0,
    'tao-heatmap__fill--hatch': level > 0 && level <= props.hatch && top.value > props.hatch,
});

const legendItems = computed(() => thresholds.value.map((step, i) => ({ level: i + 1, text: `${write(step)}+` })));
// without labelEvery the names show as often as they fit: the widest one and a gap over the width of a column
// без labelEvery имена показываются так часто, как помещаются: самое широкое с зазором на ширину столбца
const fitEvery = ref(1);
const every = computed(() => Math.max(1, Math.round(props.labelEvery ?? fitEvery.value)));
const quietCol = (c: number) => every.value > 1 && c % every.value !== 0;
const measure = ref<HTMLElement | null>(null);
let observer: ResizeObserver | undefined;

function fit() {
    const box = measure.value;
    const cell = root.value?.querySelector<HTMLElement>('[role=gridcell]');
    if (!box || !cell || props.labelEvery !== undefined) {
        return;
    }
    const widest = Math.max(0, ...[...box.children].map((el) => (el as HTMLElement).offsetWidth));
    const column = cell.getBoundingClientRect().width + props.gap;
    const need = column > 0 ? Math.ceil((widest + 8) / column) : 1;
    // a step the columns divide by, so the names keep a rhythm (every 2, 3, 4, 6 hours)
    // шаг, на который делится число столбцов, чтобы имена шли ровно (каждые 2, 3, 4, 6 часов)
    const n = props.cols.length;
    fitEvery.value = Array.from({ length: n }, (_, i) => i + 1).find((k) => k >= need && n % k === 0) ?? need;
}

onMounted(() => {
    fit();
    if (typeof ResizeObserver !== 'undefined' && root.value) {
        observer = new ResizeObserver(() => fit());
        observer.observe(root.value);
    }
});
onBeforeUnmount(() => observer?.disconnect());
watch(() => [props.cols, props.labelEvery, props.gap], () => nextTick(fit));

// one cell is in the tab order; the arrows move it
// одна клетка в порядке Tab; стрелки её двигают
const active = ref({ r: 0, c: 0 });
const root = ref<HTMLElement | null>(null);
const cellAt = (r: number, c: number) => root.value?.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${c}"]`) ?? null;

function move(r: number, c: number) {
    const rr = Math.min(props.rows.length - 1, Math.max(0, r));
    const cc = Math.min(props.cols.length - 1, Math.max(0, c));
    active.value = { r: rr, c: cc };
    cellAt(rr, cc)?.focus();
}

function onKeydown(event: KeyboardEvent) {
    const { r, c } = active.value;
    const last = { r: props.rows.length - 1, c: props.cols.length - 1 };
    const to: Record<string, () => void> = {
        ArrowRight: () => move(r, c + 1),
        ArrowLeft: () => move(r, c - 1),
        ArrowDown: () => move(r + 1, c),
        ArrowUp: () => move(r - 1, c),
        Home: () => move(event.ctrlKey ? 0 : r, 0),
        End: () => move(event.ctrlKey ? last.r : r, last.c),
        PageUp: () => move(0, c),
        PageDown: () => move(last.r, c),
    };
    const go = to[event.key];
    if (go) {
        event.preventDefault();
        go();
    }
}

// the tip: one for the map, put over the cell on whole pixels and kept inside the map
// подсказка: одна на карту, ставится над клеткой на целые пиксели и не выходит за края карты
const tipCell = ref<{ r: number; c: number } | null>(null);
const tipRef = ref<HTMLElement | null>(null);
const tipPlace = ref({ left: 0, top: 0, shown: false });
const tip = computed(() => {
    if (!tipCell.value) {
        return null;
    }
    const { r, c } = tipCell.value;
    const cell = grid.value[r]?.[c];
    return cell ? { row: props.rows[r], col: props.cols[c], value: cell.value, text: cell.text } : null;
});

async function show(r: number, c: number) {
    tipCell.value = { r, c };
    tipPlace.value = { ...tipPlace.value, shown: false };
    await nextTick();
    const el = cellAt(r, c);
    const box = root.value;
    const bubble = tipRef.value;
    if (!el || !box || !bubble || tipCell.value?.r !== r || tipCell.value?.c !== c) {
        return;
    }
    const cellRect = el.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const width = bubble.offsetWidth;
    const height = bubble.offsetHeight;
    const centre = cellRect.left - boxRect.left + cellRect.width / 2;
    const left = Math.round(Math.min(Math.max(0, centre - width / 2), Math.max(0, boxRect.width - width)));
    // above the cell; under it when the map has no room above (a card around it would cut the tip)
    // над клеткой; под ней, если над картой нет места (карточка вокруг обрезала бы подсказку)
    const above = cellRect.top - boxRect.top - height - 6;
    const below = cellRect.bottom - boxRect.top + 6;
    tipPlace.value = { left, top: Math.round(above >= 0 ? above : below), shown: true };
}

function hide() {
    tipCell.value = null;
}

function onFocusOut(event: FocusEvent) {
    if (!root.value?.contains(event.relatedTarget as Node | null)) {
        hide();
    }
}

const columns = computed(() => `auto repeat(${Math.max(1, props.cols.length)}, minmax(0, 1fr))`);
</script>

<template>
    <div ref="root" class="tao-heatmap" :class="toneClass(tone)">
        <div
            class="tao-heatmap__grid"
            :class="`tao-heatmap__grid--labels-${colLabels}`"
            role="grid"
            :aria-label="label"
            :aria-rowcount="rows.length + 1"
            :aria-colcount="cols.length + 1"
            :style="{ gridTemplateColumns: columns, gap: `${gap}px` }"
            @keydown="onKeydown"
            @pointerleave="hide"
            @focusout="onFocusOut"
        >
            <div class="tao-heatmap__row tao-heatmap__head" role="row">
                <span class="tao-heatmap__corner" role="columnheader" />
                <span
                    v-for="(col, c) in cols"
                    :key="`col-${c}`"
                    class="tao-heatmap__col"
                    role="columnheader"
                >
                    <span :class="quietCol(c) ? 'tao-sr-only' : 'tao-heatmap__col-text'">{{ col }}</span>
                </span>
            </div>
            <div v-for="(row, r) in rows" :key="`row-${r}`" class="tao-heatmap__row" role="row">
                <span class="tao-heatmap__name" role="rowheader">{{ row }}</span>
                <span
                    v-for="(cell, c) in grid[r]"
                    :key="cell.key"
                    class="tao-heatmap__cell"
                    role="gridcell"
                    :data-r="r"
                    :data-c="c"
                    :tabindex="active.r === r && active.c === c ? 0 : -1"
                    :style="cellHeight ? { height: `${cellHeight}px` } : undefined"
                    @pointerenter="show(r, c)"
                    @focus="active = { r, c }; show(r, c)"
                >
                    <span class="tao-heatmap__fill" :class="levelClass(cell.level)" :style="levelStyle(cell.level)" aria-hidden="true" />
                    <span class="tao-sr-only">{{ cell.text }}</span>
                </span>
            </div>
        </div>
        <div
            v-if="tip"
            ref="tipRef"
            class="tao-heatmap__tip"
            :class="{ 'tao-heatmap__tip--shown': tipPlace.shown }"
            :style="{ left: `${tipPlace.left}px`, top: `${tipPlace.top}px` }"
            aria-hidden="true"
        >
            <slot name="tip" v-bind="tip">
                <span class="tao-heatmap__tip-where">{{ tip.row }}, {{ tip.col }}</span>
                <strong class="tao-heatmap__tip-value">{{ tip.text }}</strong>
            </slot>
        </div>
        <div ref="measure" class="tao-heatmap__measure" aria-hidden="true">
            <span v-for="(col, c) in cols" :key="c">{{ col }}</span>
        </div>
        <ul v-if="legend && legendItems.length" class="tao-heatmap__legend" aria-hidden="true">
            <li v-for="item in legendItems" :key="item.level" class="tao-heatmap__legend-item">
                <span class="tao-heatmap__swatch tao-heatmap__fill" :class="levelClass(item.level)" :style="levelStyle(item.level)" />
                {{ item.text }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tao-heatmap {
    /* the tone tokens do not inherit: hand the colour down / токены тона не наследуются: передаём цвет вниз */
    --_c: var(--tao-tone);
    /* an empty cell shows on any surface: a card, a page, glass / пустая клетка видна на любой поверхности */
    --_empty: color-mix(in srgb, var(--tao-color-text) 8%, transparent);
    position: relative;
    display: grid;
    gap: var(--tao-space-3);
    min-width: 0;
    color: var(--tao-color-text);
    font-size: var(--tao-font-size-xs);
}

.tao-heatmap__grid {
    display: grid;
    min-width: 0;
}

/* each row is a row of the same grid: the names line up, the row keeps its role */
/* каждая строка — строка той же сетки: имена выровнены, у строки остаётся её роль */
.tao-heatmap__row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: center;
}

.tao-heatmap__grid--labels-bottom .tao-heatmap__head {
    order: 1;
}

.tao-heatmap__name {
    padding-inline-end: var(--tao-space-2);
    color: var(--tao-color-text-muted);
    white-space: nowrap;
}

.tao-heatmap__col {
    position: relative;
    min-width: 0;
    height: 1lh;
    color: var(--tao-color-text-muted);
}

/* a name may be wider than its column: it runs on over the quiet ones */
/* имя может быть шире столбца: оно заходит на соседние, чьи имена скрыты */
.tao-heatmap__col-text {
    position: absolute;
    inset-inline-start: 0;
    white-space: nowrap;
}

.tao-heatmap__cell {
    position: relative;
    display: block;
    min-width: 0;
    aspect-ratio: 1;
    border-radius: 3px;
}

.tao-heatmap__cell[style*='height'] {
    aspect-ratio: auto;
}

.tao-heatmap__cell:focus-visible {
    z-index: 1;
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-heatmap__fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--_empty);
    transition: background-color var(--tao-duration-base) ease;
}

.tao-heatmap__fill--on {
    background: color-mix(in srgb, var(--_c) var(--_mix, 100%), var(--_empty));
}

/* the faint levels are striped, so they read apart from the empty cells without colour too */
/* бледные уровни в полоску, чтобы отличаться от пустых клеток и без цвета */
.tao-heatmap__fill--hatch {
    background:
        linear-gradient(
            135deg,
            var(--_stripe) 0 12%,
            transparent 12% 50%,
            var(--_stripe) 50% 62%,
            transparent 62%
        ),
        color-mix(in srgb, var(--_c) var(--_mix, 100%), var(--_empty));
    /* a 6px tile that repeats: every stripe the same, about 1px thick and 4px apart; a gradient across the whole cell
       had fractional stops, and the browser drew its lines thicker and thinner by turns
       плитка 6px, которая повторяется: все полосы одинаковые, около 1px толщиной и через 4px; градиент на всю клетку
       давал дробные границы, и браузер рисовал линии то толще, то тоньше */
    --_stripe: color-mix(in srgb, var(--_c) 45%, transparent);
    background-size: 6px 6px, auto;
}

.tao-heatmap__cell:hover .tao-heatmap__fill {
    box-shadow: inset 0 0 0 1px var(--tao-color-border-strong);
}

.tao-heatmap__tip {
    position: absolute;
    z-index: 1;
    display: grid;
    gap: 2px;
    padding: var(--tao-space-2) var(--tao-space-3);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text-strong);
    border-radius: var(--tao-radius-control);
    box-shadow: var(--tao-shadow-lg);
    white-space: nowrap;
    pointer-events: none;
    visibility: hidden;
}

.tao-heatmap__tip--shown {
    visibility: visible;
}

.tao-heatmap__tip-where {
    color: var(--tao-color-text-muted);
}

.tao-heatmap__tip-value {
    font-size: var(--tao-font-size-sm);
    font-variant-numeric: tabular-nums;
}

.tao-heatmap__measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
    inset-inline-start: 0;
    top: 0;
}

.tao-heatmap__measure span {
    position: absolute;
}

.tao-heatmap__legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--tao-space-1) var(--tao-space-3);
    margin: 0;
    padding: 0;
    list-style: none;
    color: var(--tao-color-text-muted);
    font-variant-numeric: tabular-nums;
}

.tao-heatmap__legend-item {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-1);
}

.tao-heatmap__swatch {
    position: relative;
    inset: auto;
    width: 12px;
    height: 12px;
    border-radius: 3px;
}

@media (prefers-reduced-motion: reduce) {
    .tao-heatmap__fill {
        transition: none;
    }
}
</style>
