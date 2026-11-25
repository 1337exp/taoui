<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed } from 'vue';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import type { TaoSliderMark } from '../slider';
import TaoButton from './TaoButton.vue';
import TaoSlider from './TaoSlider.vue';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoScrubber' });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoScrubber', { onSeek: 'use `@commit`' });

// Таймлайн: кнопки «играть» и «в начало», слайдер по времени с метками событий и подпись «время / длина».
// Компонент только показывает и отдаёт действия пользователя: сам время не ведёт. Вести его можно чем угодно
// (например, usePlayback из @1337exp/taoux/playback): `v-model` время, `v-model:playing` играет ли.
const props = withDefaults(
    defineProps<{
        /** Current time. / Текущее время. */
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

const model = defineModel<number>({ required: true });

const emit = defineEmits<{
    'update:playing': [playing: boolean];
    /** The «to start» button: the time is set to 0 as well. / Кнопка «в начало»: время тоже ставится в 0. */
    restart: [];
    /** The user finished scrubbing. / Пользователь закончил перемотку. */
    commit: [time: number];
}>();

defineSlots<{
    /** Caption of a mark. / Подпись метки. */
    mark?(props: { mark: TaoSliderMark; active: boolean }): unknown;
    /** The time label; replaces «time / length». / Подпись времени; заменяет «время / длина». */
    time?(props: { time: number; length: number; text: string }): unknown;
}>();

const l10n = useLocaleText(props, 'scrubber');
const text = (t: number) => (props.format ? props.format(t) : t.toFixed(2));
const label = computed(() => `${text(model.value)} / ${text(props.length)}`);

function onScrub(time: number) {
    model.value = time;
    if (props.pauseOnScrub && props.playing) emit('update:playing', false);
}

function onRestart() {
    model.value = 0;
    emit('restart');
}
</script>

<template>
    <div
        class="tao-scrubber"
        :class="[sizeClass(size), `tao-scrubber--${variant}`, { 'tao-scrubber--marks-start': marksSide === 'start', 'tao-scrubber--disabled': disabled }]"
    >
        <div class="tao-scrubber__controls">
            <TaoButton
                size="small"
                variant="secondary"
                :disabled="disabled"
                :aria-label="playing ? l10n.pauseLabel : l10n.playLabel"
                :aria-pressed="playing"
                @click="emit('update:playing', !playing)"
            >
                <TaoIcon :name="playing ? 'tao-pause' : 'tao-play'" />
            </TaoButton>
            <TaoButton v-if="showRestart" size="small" variant="ghost" :disabled="disabled" :aria-label="l10n.restartLabel" @click="onRestart"><TaoIcon name="tao-skip-back" /></TaoButton>
        </div>

        <div class="tao-scrubber__track">
            <TaoSlider
                :model-value="model"
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
                @commit="emit('commit', $event)"
            >
                <template v-if="$slots.mark" #mark="slot"><slot name="mark" v-bind="slot" /></template>
            </TaoSlider>
        </div>

        <div v-if="showTime" class="tao-scrubber__time">
            <slot name="time" :time="model" :length="length" :text="label">{{ label }}</slot>
        </div>
    </div>
</template>

<style scoped>
.tao-scrubber {
    /* Высота ряда с кнопками; рейка слайдера стоит по её центру, а метки висят ниже (или выше). Те же формулы, что в TaoSlider. */
    --tao-scrubber-hit: calc(var(--tao-indicator-size) - 4px);
    --tao-scrubber-pad: calc((var(--tao-control-height) - var(--tao-scrubber-hit)) / 2);

    display: flex;
    align-items: flex-start;
    gap: 8px;
    width: 100%;
}

.tao-scrubber--thin {
    --tao-scrubber-hit: calc(var(--tao-indicator-size) - 2px);
}

.tao-scrubber--marks-start {
    align-items: flex-end;
}

.tao-scrubber--disabled {
    cursor: not-allowed;
}

.tao-scrubber__controls {
    display: flex;
    flex: none;
    gap: 4px;
}

.tao-scrubber__track {
    flex: 1;
    min-width: 0;
    padding-top: var(--tao-scrubber-pad);
}

.tao-scrubber--marks-start .tao-scrubber__track {
    padding-top: 0;
    padding-bottom: var(--tao-scrubber-pad);
}

.tao-scrubber__time {
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
