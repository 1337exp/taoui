<script lang="ts" setup>
import { computed } from 'vue';
import { sparklineArea, sparklinePath, sparklineRuns } from '../chart';
import { toCssLength } from '../length';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoSparkline' });

// A trend in a line of text or a card corner: no axes, no tooltip. It stretches to the width it is given.
// Тренд в строке текста или в углу карточки: без осей и подсказок. Растягивается на данную ширину.
const props = withDefaults(
    defineProps<{
        /** The series; `null` is a gap. / Ряд; `null` — разрыв. */
        values: (number | null)[];
        /** What it shows, for a screen reader: «Visits, last 30 days». / Что показывает, для скринридера. */
        label?: string;
        tone?: TaoToneName;
        /** A soft fill under the line. / Мягкая заливка под линией. */
        area?: boolean;
        /** A dot on the last value. / Точка на последнем значении. */
        dot?: boolean;
        /** The range; the data's own by default. / Диапазон; по умолчанию по данным. */
        min?: number;
        max?: number;
        /** Number = px. / Число = px. */
        height?: number | string;
    }>(),
    {
        label: undefined,
        tone: 'accent',
        area: false,
        dot: false,
        min: undefined,
        max: undefined,
        height: 32,
    },
);

const runs = computed(() => sparklineRuns(props.values, props.min, props.max));
const line = computed(() => sparklinePath(runs.value));
const fill = computed(() => (props.area ? sparklineArea(runs.value) : ''));
const last = computed(() => {
    const run = runs.value[runs.value.length - 1];
    const point = run?.[run.length - 1];
    // the dot belongs to the last value only, not to the end of an earlier run / точка только у последнего значения
    return point && point[0] === 100 ? point : undefined;
});
// the line is drawn inside the 3px padding: map 0…100 onto that box / линия внутри padding 3px
const inset = (n: number) => `calc(3px + (100% - 6px) * ${n / 100})`;
</script>

<template>
    <span
        class="tao-sparkline"
        :class="toneClass(tone)"
        :style="{ height: toCssLength(height) }"
        :role="label ? 'img' : undefined"
        :aria-label="label"
        :aria-hidden="label ? undefined : 'true'"
    >
        <svg class="tao-sparkline__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path v-if="fill" class="tao-sparkline__area" :d="fill" />
            <path class="tao-sparkline__line" :d="line" />
        </svg>
        <span
            v-if="dot && last"
            class="tao-sparkline__dot"
            :style="{ left: inset(last[0]), top: inset(last[1]) }"
            aria-hidden="true"
        />
    </span>
</template>

<style scoped>
.tao-sparkline {
    /* the tone tokens do not inherit: hand the colour down / токены тона не наследуются: передаём цвет вниз */
    --_c: var(--tao-tone);
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    min-width: 48px;
    vertical-align: middle;
    /* room for the stroke and the dot at the edges / место под линию и точку у краёв */
    padding: 3px;
}

.tao-sparkline__svg {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.tao-sparkline__line {
    fill: none;
    stroke: var(--_c);
    stroke-width: 1.5px;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
}

.tao-sparkline__area {
    fill: color-mix(in srgb, var(--_c) 16%, transparent);
    stroke: none;
}

.tao-sparkline__dot {
    position: absolute;
    width: 6px;
    height: 6px;
    margin: -3px 0 0 -3px;
    border-radius: 50%;
    background: var(--_c);
}
</style>
