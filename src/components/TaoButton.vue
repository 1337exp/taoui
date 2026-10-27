<script lang="ts" setup>
import { computed } from 'vue';
import { sizeClass, type TaoSize } from '../size';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoButton' });

interface Props {
    type?: 'button' | 'submit' | 'reset';
    /** Without it the button takes the size of its ancestors (medium by default). / Без него — размер предков (по умолчанию medium). */
    size?: TaoSize;
    variant?: 'primary' | 'secondary' | 'ghost' | 'text';
    /** Colour of the button, on any `variant`: `danger` / `success` / `warning` / `info` / `neutral`; without it the theme accent. / Цвет кнопки на любом `variant`; без него — акцент темы. */
    tone?: TaoToneName;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    icon?: string;
    /** Minimum width (number = px). Same as the `--tao-button-min-width` variable. / Минимальная ширина (число = px). То же, что переменная `--tao-button-min-width`. */
    minWidth?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    variant: 'primary',
    tone: undefined,
    disabled: false,
    loading: false,
    block: false,
    icon: '',
    minWidth: undefined,
});

const minWidthStyle = computed(() =>
    props.minWidth === undefined
        ? undefined
        : { '--tao-button-min-width': typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth },
);

const emit = defineEmits(['click']);

function handleClick(event: MouseEvent) {
    if (!props.disabled && !props.loading) {
        emit('click', event);
    }
}
</script>

<template>
    <button
        class="tao-button"
        :class="[
            sizeClass(size),
            toneClass(tone),
            `tao-button--${variant}`,
            {
                'tao-button--disabled': disabled,
                'tao-button--loading': loading,
                'tao-button--block': block,
                'tao-button--icon': !!icon,
                'tao-button--toned': !!tone && tone !== 'accent',
            },
        ]"
        :style="minWidthStyle"
        :type="type"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="tao-button__loader"></span>
        <span v-if="icon" class="tao-button__icon">{{ icon }}</span>
        <span class="tao-button__content"><slot /></span>
    </button>
</template>

<style scoped>
.tao-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-2);
    height: var(--tao-control-height);
    min-width: var(--tao-button-min-width, 0);
    padding: 0 var(--tao-button-padding-x);

    border: none;
    border-radius: var(--tao-radius-control);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--tao-control-font-size);
    font-weight: 500;
    transition: var(--tao-transition-base);
    position: relative;
}

.tao-button:active:not(.tao-button--text) {
    transform: translateY(1px);
}

.tao-button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-button--primary {
    background-color: var(--tao-tone);
    color: var(--tao-tone-on);
    text-shadow: var(--tao-button-primary-text-shadow, none);
}

.tao-button--primary:hover:not(.tao-button--disabled) {
    background-color: var(--tao-tone-hover);
}

.tao-button--secondary {
    background-color: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border-strong);
}

.tao-button--secondary:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-surface-hover);
    color: var(--tao-color-text-strong);
}

/* A toned secondary: the tone as text and frame, its tint under the pointer. / Secondary с тоном: цвет тона в тексте и рамке. */
.tao-button--secondary.tao-button--toned {
    color: var(--tao-tone-text);
    border-color: color-mix(in srgb, var(--tao-tone) 40%, transparent);
}

.tao-button--secondary.tao-button--toned:hover:not(.tao-button--disabled) {
    color: var(--tao-tone-text-hover);
    background-color: var(--tao-tone-subtle);
}

.tao-button--ghost,
.tao-button--text {
    background-color: transparent;
    color: var(--tao-tone-text);
}

.tao-button--ghost:hover:not(.tao-button--disabled),
.tao-button--text:hover:not(.tao-button--disabled) {
    color: var(--tao-tone-text-hover);
    background-color: var(--tao-tone-wash);
}

.tao-button--text {
    height: auto;
    padding: 2px 4px;
}

.tao-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-button--block {
    width: 100%;
}

.tao-button--loading .tao-button__content {
    opacity: 0;
}

.tao-button__loader {
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid color-mix(in srgb, currentColor 15%, transparent);
    border-top-color: currentColor;
    border-radius: var(--tao-radius-full);
    animation: tao-spin 0.8s linear infinite;
}

.tao-button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

@keyframes tao-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
