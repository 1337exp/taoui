<script lang="ts" setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, useId } from 'vue';
import { formFieldKey } from '../formField';
import { listenFocusLoss } from '../focusLoss';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoSlider' });

const props = withDefaults(
    defineProps<{
        min?: number;
        max?: number;
        step?: number;
        showValue?: boolean;
        placeholder?: string;
        modelValue: number | string;
        disabled?: boolean;
        /** Red track outline. The message goes to TaoFormField `error`. / Красная обводка трека. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** `bar` — thick track, a form control. `thin` — thin track (seek, volume). / `bar` — толстый трек, форм-контрол. `thin` — тонкий (seek, громкость). */
        variant?: 'bar' | 'thin';
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** Шаг изменения значения при прокрутке колёсика мыши. 0 — отключено. */
        wheel?: number;
    }>(),
    {
        min: 0,
        max: 100,
        step: 1,
        showValue: false,
        placeholder: '',
        disabled: false,
        error: false,
        variant: 'bar',
        wheel: 0,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number | string];
    /** The user finished changing: drag released, key, wheel, typed value. / Пользователь закончил менять: отпустил, клавиша, колёсико, ввод. */
    change: [value: number | string];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const describedBy = computed(() => field?.describedBy.value);
const invalid = computed(() => props.error || Boolean(field?.invalid.value));

function packModelValue(value: number): string | number {
    return typeof props.modelValue === 'string' ? `${value}` : value;
}

function unpackModelValue(): number {
    const raw = typeof props.modelValue === 'string' ? parseFloat(props.modelValue) : props.modelValue;
    return Number.isFinite(raw) ? raw : props.min;
}

const current = computed(() => unpackModelValue());

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
let dragPointer = -1;
let dragStartValue = 0;

const shadowInputRef = ref<HTMLInputElement | null>(null);
const shadowModel = ref('0');
const showShadowModel = ref(false);

const progressPercent = computed(() => {
    const range = props.max - props.min;
    if (range <= 0) {
        return 0;
    }
    return ((current.value - props.min) / range) * 100;
});

function clampValue(v: number) {
    return Math.min(Math.max(v, props.min), props.max);
}

function commit(value: number, final = false) {
    const next = clampValue(value);
    const changed = next !== current.value;
    emit('update:modelValue', packModelValue(next));
    if (final && changed) {
        emit('change', packModelValue(next));
    }
}

function calculateValue(event: PointerEvent): number {
    if (!trackRef.value) {
        return props.min;
    }

    const rect = trackRef.value.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const ratio = rect.width ? x / rect.width : 0;

    const v = props.min + ratio * (props.max - props.min);
    return clampValue(Math.round((v - props.min) / props.step) * props.step + props.min);
}

function releaseDragCapture() {
    const el = trackRef.value;
    const id = dragPointer;
    if (!el || id === -1) {
        return;
    }
    if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(id)) {
        return;
    }
    try {
        el.releasePointerCapture(id);
    } catch {
        /* already released by the browser */
    }
}

function endDrag() {
    if (!isDragging.value) {
        return;
    }
    isDragging.value = false;
    releaseDragCapture();
    dragPointer = -1;
    if (current.value !== dragStartValue) {
        emit('change', packModelValue(current.value));
    }
}

function onPointerDown(event: PointerEvent) {
    if (props.disabled || showShadowModel.value || event.button !== 0 || !trackRef.value) {
        return;
    }

    dragPointer = event.pointerId;
    dragStartValue = current.value;
    isDragging.value = true;
    commit(calculateValue(event));
    event.preventDefault();
    try {
        trackRef.value.setPointerCapture(event.pointerId);
    } catch {
        /* untrusted events / capture already gone */
    }
}

function onPointerMove(event: PointerEvent) {
    if (!isDragging.value || event.pointerId !== dragPointer) {
        return;
    }
    commit(calculateValue(event));
}

function onPointerEnd(event: PointerEvent) {
    if (!isDragging.value) {
        return;
    }
    if (dragPointer !== -1 && event.pointerId !== dragPointer) {
        return;
    }
    endDrag();
}

function onLostPointerCapture() {
    endDrag();
}

function onKeydown(event: KeyboardEvent) {
    if (props.disabled || showShadowModel.value) {
        return;
    }

    const keys: Record<string, number> = {
        ArrowLeft: -props.step,
        ArrowDown: -props.step,
        ArrowRight: props.step,
        ArrowUp: props.step,
        PageDown: -props.step * 10,
        PageUp: props.step * 10,
    };

    if (event.key in keys) {
        event.preventDefault();
        commit(current.value + keys[event.key]!, true);
        return;
    }

    if (event.key === 'Home') {
        event.preventDefault();
        commit(props.min, true);
        return;
    }

    if (event.key === 'End') {
        event.preventDefault();
        commit(props.max, true);
    }
}

function onWheel(event: WheelEvent) {
    if (props.disabled || props.wheel <= 0 || showShadowModel.value) {
        return;
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? props.wheel : -props.wheel;
    commit(current.value + delta, true);
}

function onBlurShadowModel() {
    if (shadowModel.value) {
        const next = clampValue(parseFloat(shadowModel.value) || 0);
        shadowModel.value = `${packModelValue(next)}`;
        commit(next, true);
    }
    showShadowModel.value = false;
}

function onShadowKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        shadowInputRef.value?.blur();
    }
}

function onContextMenu() {
    if (props.disabled || !props.showValue) {
        return;
    }
    shadowModel.value = `${props.modelValue}`;
    showShadowModel.value = true;
    requestAnimationFrame(() => shadowInputRef.value?.focus());
}

let stopFocusLoss: (() => void) | undefined;

onMounted(() => {
    stopFocusLoss = listenFocusLoss(endDrag);
});

onBeforeUnmount(() => {
    endDrag();
    stopFocusLoss?.();
});
</script>

<template>
    <div
        :id="controlId"
        ref="trackRef"
        class="tao-slider"
        :class="[
            `tao-slider--${variant}`,
            sizeClass(size),
            { 'tao-slider--show-value': showValue, 'tao-slider--disabled': disabled, 'tao-slider--invalid': invalid },
        ]"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="current"
        :aria-disabled="disabled || undefined"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
        @contextmenu.prevent="onContextMenu"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerEnd"
        @pointercancel="onPointerEnd"
        @lostpointercapture="onLostPointerCapture"
        @keydown="onKeydown"
        @wheel="onWheel"
    >
        <div class="tao-slider__track"></div>
        <div class="tao-slider__fill" :style="{ width: `${progressPercent}%` }"></div>
        <div class="tao-slider__thumb" :style="{ left: `${progressPercent}%` }"></div>

        <input
            v-if="showShadowModel"
            ref="shadowInputRef"
            v-model="shadowModel"
            type="number"
            inputmode="numeric"
            :placeholder="placeholder"
            class="tao-slider__shadow-input"
            @blur="onBlurShadowModel"
            @keydown="onShadowKeydown"
            @pointerdown.stop
        />
        <div v-else-if="showValue" class="tao-slider__value">
            <slot name="pre-value" />{{ modelValue }}<slot name="post-value" />
        </div>
    </div>
</template>

<style scoped>
.tao-slider {
    /* bar: 14 / 20 at medium / bar: 14 / 20 в medium */
    --tao-slider-hit: calc(var(--tao-indicator-size) - 4px);
    --tao-slider-track: var(--tao-slider-hit);
    --tao-slider-thumb: calc(var(--tao-indicator-size) + 2px);

    position: relative;
    width: 100%;
    height: var(--tao-slider-hit);
    cursor: pointer;
    user-select: none;
    touch-action: none;
}

.tao-slider:focus {
    outline: none;
}

.tao-slider:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 4px;
    border-radius: var(--tao-radius-sm);
}

.tao-slider--show-value {
    --tao-slider-hit: calc(var(--tao-indicator-size) + 2px);
}

/* Тонкий трек, hit-area шире картинки — seek / громкость. 16 / 4 / 12 в medium. */
.tao-slider--thin {
    --tao-slider-hit: calc(var(--tao-indicator-size) - 2px);
    --tao-slider-track: 4px;
    --tao-slider-thumb: calc(var(--tao-indicator-size) - 6px);
}

.tao-slider--thin.tao-slider--show-value {
    --tao-slider-hit: calc(var(--tao-indicator-size) + 2px);
}

.tao-slider--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-slider--disabled .tao-slider__thumb {
    cursor: not-allowed;
}

.tao-slider__track,
.tao-slider__fill {
    position: absolute;
    top: 50%;
    left: 0;
    height: var(--tao-slider-track);
    border-radius: var(--tao-radius-sm);
    transform: translateY(-50%);
}

.tao-slider__track {
    width: 100%;
    background-color: var(--tao-color-surface-sunken);
}

.tao-slider__fill {
    background-color: var(--tao-color-accent);
}

.tao-slider--invalid .tao-slider__track {
    box-shadow: inset 0 0 0 1px var(--tao-color-danger);
}

.tao-slider--thin .tao-slider__track,
.tao-slider--thin .tao-slider__fill {
    border-radius: var(--tao-radius-full);
}

.tao-slider__thumb {
    position: absolute;
    top: 50%;
    width: var(--tao-slider-thumb);
    height: var(--tao-slider-thumb);
    background-color: var(--tao-color-accent);
    border: 2px solid var(--tao-color-surface-sunken);
    border-radius: var(--tao-radius-full);
    transform: translate(-50%, -50%);
    cursor: grab;
}

.tao-slider__thumb:active {
    cursor: grabbing;
}

.tao-slider__value,
.tao-slider__shadow-input {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: var(--tao-control-font-size-secondary);
    font-weight: 900;
    letter-spacing: 0.05em;
}

.tao-slider__value {
    color: var(--tao-color-text-strong);
    text-shadow: -1px -1px 0 var(--tao-color-bg), 1px -1px 0 var(--tao-color-bg),
        -1px 1px 0 var(--tao-color-bg), 1px 1px 0 var(--tao-color-bg);
}

.tao-slider__shadow-input {
    text-align: center;
    border: none;
    background: transparent;
    color: var(--tao-color-text-strong);
    font-family: inherit;
    outline: none;
}
</style>
