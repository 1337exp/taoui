<script lang="ts" setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

interface Props {
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
    placeholder?: string;
    modelValue: number | string;
}

const props = withDefaults(defineProps<Props>(), {
    min: 0,
    max: 100,
    step: 1,
    showValue: false,
    placeholder: '',
});

const emit = defineEmits(['update:modelValue']);

function packModelValue(value: number): string | number {
    return typeof props.modelValue === 'string' ? `${value}` : value;
}

function unpackModelValue(): number {
    return typeof props.modelValue === 'string' ? parseFloat(props.modelValue) : props.modelValue;
}

const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

const shadowInputRef = ref<HTMLInputElement | null>(null);
const shadowModel = ref('0');
const showShadowModel = ref(false);

const progressPercent = computed(() => {
    const range = props.max - props.min;
    return ((unpackModelValue() - props.min) / range) * 100;
});

function clampValue(v: number) {
    return Math.min(Math.max(v, props.min), props.max);
}

function calculateValue(event: MouseEvent | TouchEvent): number {
    if (!trackRef.value) {
        return props.min;
    }

    const rect = trackRef.value.getBoundingClientRect();
    const clientX = 'touches' in event ? event.touches[0]!.clientX : event.clientX;
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ratio = x / rect.width;

    const v = Math.round(props.min + ratio * (props.max - props.min));
    return clampValue(Math.round((v - props.min) / props.step) * props.step + props.min);
}

function handleMove(event: MouseEvent | TouchEvent) {
    emit('update:modelValue', packModelValue(calculateValue(event)));
}

function onMouseUp(event: MouseEvent | TouchEvent) {
    const evBtn = 'touches' in event ? undefined : event.button;
    if ((typeof evBtn !== 'undefined' && evBtn !== 0) || showShadowModel.value) {
        return;
    }
    isDragging.value = false;
}

function onMouseDown(event: MouseEvent | TouchEvent) {
    const evBtn = 'touches' in event ? undefined : event.button;
    if ((typeof evBtn !== 'undefined' && evBtn !== 0) || showShadowModel.value) {
        return;
    }

    isDragging.value = true;
    handleMove(event);
    event.preventDefault();
}

function onMouseMove(event: MouseEvent | TouchEvent) {
    if (!isDragging.value) {
        return;
    }
    handleMove(event);
}

function onBlurShadowModel() {
    if (shadowModel.value) {
        const newValue = packModelValue(clampValue(parseFloat(shadowModel.value) || 0));
        shadowModel.value = `${newValue}`;
        emit('update:modelValue', newValue);
    }
    showShadowModel.value = false;
}

function onShadowKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        shadowInputRef.value?.blur();
    }
}

function onContextMenu() {
    if (props.showValue) {
        shadowModel.value = `${props.modelValue}`;
        showShadowModel.value = true;
        // ждём рендера инпута перед фокусом
        requestAnimationFrame(() => shadowInputRef.value?.focus());
    }
}

onMounted(() => {
    window.addEventListener('mouseleave', onMouseUp);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchend', onMouseUp);
    window.addEventListener('touchmove', onMouseMove);
});

onBeforeUnmount(() => {
    window.removeEventListener('mouseleave', onMouseUp);
    window.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchend', onMouseUp);
    window.removeEventListener('touchmove', onMouseMove);
});
</script>

<template>
    <div
        ref="trackRef"
        class="tao-slider"
        :class="{ 'tao-slider--show-value': showValue }"
        @contextmenu.prevent="onContextMenu"
        @mousedown="onMouseDown"
        @touchstart="onMouseDown"
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
            @mousedown.stop
        />
        <div v-else-if="showValue" class="tao-slider__value">
            <slot name="pre-value" />{{ modelValue }}<slot name="post-value" />
        </div>
    </div>
</template>

<style scoped>
.tao-slider {
    position: relative;
    width: 100%;
    height: 14px;
    cursor: pointer;
    user-select: none;
}

.tao-slider--show-value {
    height: 20px;
}

.tao-slider__track {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: var(--tao-radius-sm);
    background-color: var(--tao-color-surface-sunken);
}

.tao-slider__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: var(--tao-color-accent);
    border-radius: var(--tao-radius-sm);
}

.tao-slider__thumb {
    position: absolute;
    top: 50%;
    width: 20px;
    height: 20px;
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
    font-size: var(--tao-font-size-sm);
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
