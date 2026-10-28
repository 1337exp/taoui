<script lang="ts" setup>
import { computed } from 'vue';
import { chartColorVar, donutArcs, fraction, type TaoDonutSegment } from '../chart';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoDonut' });

// A share of a whole: one value of a max (a ring), or a few parts (a donut). Three to five parts read well; with
// more, a bar chart is clearer.
// Доля целого: одно значение из max (кольцо) или несколько частей (бублик). Хорошо читаются три–пять частей; больше —
// понятнее столбчатая диаграмма.
const props = withDefaults(
    defineProps<{
        /** The parts. Without them the ring shows `value` of `max`. / Части. Без них кольцо показывает value из max. */
        segments?: TaoDonutSegment[];
        value?: number;
        max?: number;
        /** The colour of the single ring. / Цвет одиночного кольца. */
        tone?: TaoToneName;
        /** What it shows, for a screen reader; the parts are read after it. / Что показывает, для скринридера. */
        label?: string;
        /** The outer size, px. / Внешний размер, px. */
        size?: number;
        /** The ring width, px. / Толщина кольца, px. */
        thickness?: number;
        /** A list of the parts with their shares next to the ring. / Список частей с долями рядом с кольцом. */
        legend?: boolean;
    }>(),
    {
        segments: undefined,
        value: 0,
        max: 100,
        tone: 'accent',
        label: undefined,
        size: 120,
        thickness: 12,
        legend: false,
    },
);

defineSlots<{
    /** The middle of the ring: a number, a word. / Середина кольца: число, слово. */
    default?(): unknown;
}>();

const radius = computed(() => Math.max(1, (props.size - props.thickness) / 2));
const centre = computed(() => props.size / 2);
const total = computed(() => (props.segments ?? []).reduce((sum, s) => sum + (s.value > 0 ? s.value : 0), 0));

interface Arc {
    key: string;
    start: number;
    length: number;
    stroke: string;
    tone?: TaoToneName;
    label: string;
    share: number;
}

const arcs = computed<Arc[]>(() => {
    if (!props.segments) {
        const share = fraction(props.value, 0, props.max);
        return [{ key: 'value', start: 0, length: share * 100, stroke: 'var(--tao-tone)', tone: props.tone, label: '', share }];
    }
    const placed = donutArcs(props.segments.map((s) => s.value));
    return props.segments.map((s, i) => ({
        key: `${i}-${s.label}`,
        start: placed[i][0],
        length: placed[i][1],
        stroke: s.color ?? (s.tone ? 'var(--tao-tone)' : chartColorVar(i)),
        tone: s.color ? undefined : s.tone,
        label: s.label,
        share: total.value > 0 ? Math.max(0, s.value) / total.value : 0,
    }));
});

const percent = (share: number) => `${Math.round(share * 100)}%`;

const summary = computed(() => {
    const parts = props.segments
        ? arcs.value.map((arc) => `${arc.label} ${percent(arc.share)}`).join(', ')
        : `${props.value} / ${props.max}`;
    return props.label ? `${props.label}: ${parts}` : parts;
});
</script>

<template>
    <div class="tao-donut" :class="{ 'tao-donut--legend': legend }">
        <div class="tao-donut__ring" :style="{ width: `${size}px`, height: `${size}px` }" role="img" :aria-label="summary">
            <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size" aria-hidden="true">
                <circle class="tao-donut__track" :cx="centre" :cy="centre" :r="radius" :stroke-width="thickness" />
                <circle
                    v-for="arc in arcs"
                    v-show="arc.length > 0"
                    :key="arc.key"
                    class="tao-donut__arc"
                    :class="toneClass(arc.tone)"
                    :cx="centre"
                    :cy="centre"
                    :r="radius"
                    :stroke-width="thickness"
                    pathLength="100"
                    :stroke-dasharray="`${arc.length} ${100 - arc.length}`"
                    :stroke-dashoffset="-arc.start"
                    :transform="`rotate(-90 ${centre} ${centre})`"
                    :style="{ stroke: arc.stroke }"
                />
            </svg>
            <div v-if="$slots.default" class="tao-donut__centre" aria-hidden="true">
                <slot />
            </div>
        </div>
        <ul v-if="legend && segments" class="tao-donut__legend" aria-hidden="true">
            <li v-for="arc in arcs" :key="arc.key" class="tao-donut__item">
                <span class="tao-donut__swatch" :class="toneClass(arc.tone)" :style="{ background: arc.stroke }" />
                <span class="tao-donut__name">{{ arc.label }}</span>
                <span class="tao-donut__share">{{ percent(arc.share) }}</span>
            </li>
        </ul>
    </div>
</template>

<style scoped>
.tao-donut {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--tao-space-3) var(--tao-space-4);
    color: var(--tao-color-text);
}

.tao-donut__ring {
    position: relative;
    flex: none;
}

.tao-donut__ring svg {
    display: block;
}

.tao-donut__track {
    fill: none;
    stroke: var(--tao-color-surface-sunken);
}

.tao-donut__arc {
    fill: none;
    transition: stroke-dasharray var(--tao-duration-base) ease, stroke-dashoffset var(--tao-duration-base) ease;
}

.tao-donut__centre {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--tao-color-text-strong);
    font-variant-numeric: tabular-nums;
}

.tao-donut__legend {
    display: grid;
    gap: var(--tao-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: var(--tao-font-size-sm);
}

.tao-donut__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--tao-space-2);
}

.tao-donut__swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
}

.tao-donut__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-donut__share {
    color: var(--tao-color-text-muted);
    font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
    .tao-donut__arc {
        transition: none;
    }
}
</style>
