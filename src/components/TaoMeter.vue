<script lang="ts" setup>
import { computed } from 'vue';
import { fraction, meterTone } from '../chart';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoMeter' });

// A measured value in a known range: disk space, a battery, a score. Not the progress of a task (that is TaoProgress).
// With low / high / optimum it colours itself as the HTML <meter>: good, a warning, bad.
// Измеренное значение в известном диапазоне: место на диске, батарея, оценка. Не ход задачи (это TaoProgress).
// С low / high / optimum красится как HTML <meter>: хорошо, предупреждение, плохо.
const props = withDefaults(
    defineProps<{
        value: number;
        min?: number;
        max?: number;
        /** Below it the value is low. / Ниже — значение низкое. */
        low?: number;
        /** Above it the value is high. / Выше — значение высокое. */
        high?: number;
        /** The best value; the middle of the range by default. / Лучшее значение; по умолчанию середина. */
        optimum?: number;
        /** Shown above the bar and read by a screen reader. / Подпись над шкалой, её же читает скринридер. */
        label?: string;
        /** The value as text, right of the label: `true` or your own text («120 of 256 GB»). / Значение текстом справа. */
        valueText?: string | boolean;
        /** A fixed colour instead of the low / high logic. / Постоянный цвет вместо логики low / high. */
        tone?: TaoToneName;
    }>(),
    {
        min: 0,
        max: 100,
        low: undefined,
        high: undefined,
        optimum: undefined,
        label: undefined,
        valueText: false,
        tone: undefined,
    },
);

const share = computed(() => fraction(props.value, props.min, props.max));
const effectiveTone = computed(() => props.tone ?? meterTone(props.value, props.min, props.max, props.low, props.high, props.optimum));
const shown = computed(() => {
    if (typeof props.valueText === 'string') {
        return props.valueText;
    }
    return props.valueText ? String(props.value) : '';
});
</script>

<template>
    <div
        class="tao-meter"
        :class="[toneClass(effectiveTone), `tao-meter--${effectiveTone}`]"
        role="meter"
        :aria-valuenow="value"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuetext="typeof valueText === 'string' ? valueText : undefined"
        :aria-label="label"
    >
        <div v-if="label || shown" class="tao-meter__head" aria-hidden="true">
            <span class="tao-meter__label">{{ label }}</span>
            <span v-if="shown" class="tao-meter__value">{{ shown }}</span>
        </div>
        <div class="tao-meter__track">
            <div class="tao-meter__fill" :style="{ width: `${share * 100}%` }" />
        </div>
    </div>
</template>

<style scoped>
.tao-meter {
    --_c: var(--tao-tone);
    display: grid;
    gap: var(--tao-space-1);
    min-width: 80px;
    color: var(--tao-color-text);
    font-size: var(--tao-font-size-sm);
}

.tao-meter__head {
    display: flex;
    justify-content: space-between;
    gap: var(--tao-space-2);
}

.tao-meter__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-meter__value {
    flex: none;
    color: var(--tao-color-text-muted);
    font-variant-numeric: tabular-nums;
}

.tao-meter__track {
    height: 8px;
    overflow: hidden;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-surface-sunken);
    /* a sunken track on a sunken page still shows its edge / утопленная дорожка на утопленном фоне видна по краю */
    box-shadow: inset 0 0 0 1px var(--tao-color-border);
}

.tao-meter__fill {
    height: 100%;
    border-radius: inherit;
    background: var(--_c);
    transition: width var(--tao-duration-base) ease;
}

@media (prefers-reduced-motion: reduce) {
    .tao-meter__fill {
        transition: none;
    }
}
</style>
