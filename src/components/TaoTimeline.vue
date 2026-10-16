<script lang="ts" setup>
import { computed } from 'vue';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import type { TaoSliderMark } from '../slider';
import TaoButton from './TaoButton.vue';
import TaoSlider from './TaoSlider.vue';

defineOptions({ name: 'TaoTimeline' });

// Таймлайн: кнопки «играть» и «в начало», слайдер по времени с метками событий и подпись «время / длина».
// Компонент только показывает и отдаёт действия пользователя: сам время не ведёт. Вести его можно чем угодно
// (например, usePlayback из @1337exp/taoux/playback): `v-model` время, `v-model:playing` играет ли.
const props = withDefaults(
    defineProps<{
        /** Current time. / Текущее время. */
        modelValue: number;
        /** Whether it is playing (the play button state). / Идёт ли воспроизведение (вид кнопки). */
        playing?: boolean;
        /** Length; the slider goes from 0 to it. / Длина; слайдер идёт от 0 до неё. */
        length: number;
        /** Slider step. / Шаг слайдера. */
        step?: number;
        /** Event marks: numbers or `{ value, label? }`. / Метки событий: числа или `{ value, label? }`. */
        marks?: readonly (number | TaoSliderMark)[];
        /** Marks above the slider (`start`) or below (`end`). / Метки над слайдером (`start`) или под ним (`end`). */
        marksSide?: 'start' | 'end';
        /** Text of a time value (marks, label). / Текст значения времени (метки, подпись). */
        format?: (time: number) => string;
        /** Pause when the user grabs the slider. / Ставить на паузу, когда пользователь взялся за слайдер. */
        pauseOnScrub?: boolean;
        /** The «to start» button. / Кнопка «в начало». */
        showRestart?: boolean;
        /** The «time / length» label. / Подпись «время / длина». */
        showTime?: boolean;
        /** `thin` — a thin track (default), `bar` — a thick one. / `thin` — тонкий трек (по умолчанию), `bar` — толстый. */
        variant?: 'bar' | 'thin';
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        disabled?: boolean;
        // Тексты: по умолчанию из локали, проп главнее
        playLabel?: string;
        pauseLabel?: string;
        restartLabel?: string;
    }>(),
    {
        playing: false,
        step: 0.01,
        marksSide: 'end',
        pauseOnScrub: true,
        showRestart: true,
        showTime: true,
        variant: 'thin',
        disabled: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [time: number];
    'update:playing': [playing: boolean];
    /** The «to start» button: the time is set to 0 as well. / Кнопка «в начало»: время тоже ставится в 0. */
    restart: [];
    /** The user finished scrubbing. / Пользователь закончил перемотку. */
    seek: [time: number];
}>();

defineSlots<{
    /** Caption of a mark. / Подпись метки. */
    mark?(props: { mark: TaoSliderMark; active: boolean }): unknown;
    /** The time label; replaces «time / length». / Подпись времени; заменяет «время / длина». */
    time?(props: { time: number; length: number; text: string }): unknown;
}>();

const l10n = useLocaleText(props, 'timeline');
const text = (t: number) => (props.format ? props.format(t) : t.toFixed(2));
const label = computed(() => `${text(props.modelValue)} / ${text(props.length)}`);

function onScrub(time: number) {
    emit('update:modelValue', time);
    if (props.pauseOnScrub && props.playing) emit('update:playing', false);
}

function onRestart() {
    emit('update:modelValue', 0);
    emit('restart');
}
</script>

<template>
    <div
        class="tao-timeline"
        :class="[sizeClass(size), `tao-timeline--${variant}`, { 'tao-timeline--marks-start': marksSide === 'start', 'tao-timeline--disabled': disabled }]"
    >
        <div class="tao-timeline__controls">
            <TaoButton
                size="small"
                variant="secondary"
                :disabled="disabled"
                :aria-label="playing ? l10n.pauseLabel : l10n.playLabel"
                :aria-pressed="playing"
                @click="emit('update:playing', !playing)"
            >
                {{ playing ? '❚❚' : '▶' }}
            </TaoButton>
            <TaoButton v-if="showRestart" size="small" variant="ghost" :disabled="disabled" :aria-label="l10n.restartLabel" @click="onRestart">⏮</TaoButton>
        </div>

        <div class="tao-timeline__track">
            <TaoSlider
                :model-value="modelValue"
                :min="0"
                :max="length"
                :step="step"
                :marks="marks"
                :marks-side="marksSide"
                :format="text"
                :variant="variant"
                :size="size"
                :disabled="disabled"
                @update:model-value="onScrub"
                @change="emit('seek', $event)"
            >
                <template v-if="$slots.mark" #mark="slot"><slot name="mark" v-bind="slot" /></template>
            </TaoSlider>
        </div>

        <div v-if="showTime" class="tao-timeline__time">
            <slot name="time" :time="modelValue" :length="length" :text="label">{{ label }}</slot>
        </div>
    </div>
</template>

<style scoped>
.tao-timeline {
    /* Высота ряда с кнопками; рейка слайдера стоит по её центру, а метки висят ниже (или выше). Те же формулы, что в TaoSlider. */
    --tao-timeline-hit: calc(var(--tao-indicator-size) - 4px);
    --tao-timeline-pad: calc((var(--tao-control-height) - var(--tao-timeline-hit)) / 2);

    display: flex;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
}

.tao-timeline--thin {
    --tao-timeline-hit: calc(var(--tao-indicator-size) - 2px);
}

.tao-timeline--marks-start {
    align-items: flex-end;
}

.tao-timeline--disabled {
    cursor: not-allowed;
}

.tao-timeline__controls {
    display: flex;
    flex: none;
    gap: 4px;
}

.tao-timeline__track {
    flex: 1;
    min-width: 0;
    padding-top: var(--tao-timeline-pad);
}

.tao-timeline--marks-start .tao-timeline__track {
    padding-top: 0;
    padding-bottom: var(--tao-timeline-pad);
}

.tao-timeline__time {
    flex: none;
    min-width: 7ch;
    height: var(--tao-control-height);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}
</style>
