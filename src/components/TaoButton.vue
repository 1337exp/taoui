<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue';
import { devWarning } from '../deprecate';
import { sizeClass, type TaoSize } from '../size';
import { toneClass, type TaoToneName } from '../tone';
import TaoIcon from './TaoIcon.vue';

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
    /** Icon before the text: a name for TaoIcon (`tao-plus`, a registered or font icon). Without text the button is a square. / Иконка перед текстом: имя для TaoIcon. Без текста кнопка квадратная. */
    icon?: string;
    /** Icon after the text. / Иконка после текста. */
    iconEnd?: string;
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
    iconEnd: '',
    minWidth: undefined,
});

const minWidthStyle = computed(() =>
    props.minWidth === undefined
        ? undefined
        : { '--tao-button-min-width': typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth },
);

const emit = defineEmits(['click']);

const slots = useSlots();
const attrs = useAttrs();
// no text, only an icon: a square of the control height, and it needs a name for screen readers
const iconOnly = computed(() => Boolean(props.icon || props.iconEnd) && !slots.default);
if (iconOnly.value && !attrs['aria-label'] && !attrs['aria-labelledby'] && !attrs.title) {
    devWarning('button:icon-only', 'TaoButton: a button with only an icon needs aria-label (or aria-labelledby / title).');
}

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
                'tao-button--icon-only': iconOnly,
                'tao-button--toned': !!tone && tone !== 'accent',
            },
        ]"
        :style="minWidthStyle"
        :type="type"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="tao-button__loader"></span>
        <TaoIcon v-if="icon" class="tao-button__icon" :name="icon" />
        <span v-if="$slots.default" class="tao-button__content"><slot /></span>
        <TaoIcon v-if="iconEnd" class="tao-button__icon" :name="iconEnd" />
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

/* an icon-only button is a square of the control height / кнопка только с иконкой — квадрат высотой с контрол */
.tao-button--icon-only:not(.tao-button--text) {
    width: var(--tao-control-height);
    padding: 0;
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
