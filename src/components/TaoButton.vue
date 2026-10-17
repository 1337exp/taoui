<script lang="ts" setup>
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoButton' });

interface Props {
    type?: 'button' | 'submit' | 'reset';
    /** Without it the button takes the size of its ancestors (medium by default). / Без него — размер предков (по умолчанию medium). */
    size?: TaoSize;
    variant?: 'primary' | 'secondary' | 'ghost' | 'text' | 'danger';
    /** Красит кнопку: danger / success / warning / info. Не вместо variant. */
    tone?: 'danger' | 'success' | 'warning' | 'info' | 'neutral' | '';
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    variant: 'primary',
    tone: '',
    disabled: false,
    loading: false,
    block: false,
    icon: '',
});

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
            `tao-button--${variant}`,
            {
                'tao-button--disabled': disabled,
                'tao-button--loading': loading,
                'tao-button--block': block,
                'tao-button--icon': !!icon,
                [`tao-button--tone-${tone}`]: !!tone,
            },
        ]"
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
    background-color: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
    text-shadow: var(--tao-button-primary-text-shadow, none);
}

.tao-button--primary:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-accent-hover);
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

.tao-button--ghost {
    background-color: transparent;
    color: var(--tao-color-accent);
}

.tao-button--ghost:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-accent-subtle-hover);
}

.tao-button--text {
    height: auto;
    padding: 2px 4px;
    background: transparent;
    color: var(--tao-color-accent);
}

.tao-button--text:hover:not(.tao-button--disabled) {
    color: var(--tao-color-accent-hover);
    background-color: var(--tao-color-accent-subtle-hover);
}

.tao-button--danger {
    background-color: var(--tao-color-danger);
    color: var(--tao-color-on-danger);
}

.tao-button--danger:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-danger-hover);
}

.tao-button--ghost.tao-button--tone-danger,
.tao-button--text.tao-button--tone-danger {
    color: var(--tao-color-danger-text);
}

.tao-button--ghost.tao-button--tone-danger:hover:not(.tao-button--disabled),
.tao-button--text.tao-button--tone-danger:hover:not(.tao-button--disabled) {
    color: var(--tao-color-danger-text-hover);
    background-color: var(--tao-color-danger-subtle);
}

.tao-button--ghost.tao-button--tone-success,
.tao-button--text.tao-button--tone-success {
    color: var(--tao-color-success-text);
}

.tao-button--ghost.tao-button--tone-success:hover:not(.tao-button--disabled),
.tao-button--text.tao-button--tone-success:hover:not(.tao-button--disabled) {
    color: var(--tao-color-success-text-hover);
    background-color: var(--tao-color-success-subtle);
}

.tao-button--ghost.tao-button--tone-warning,
.tao-button--text.tao-button--tone-warning {
    color: var(--tao-color-warning-text);
}

.tao-button--ghost.tao-button--tone-warning:hover:not(.tao-button--disabled),
.tao-button--text.tao-button--tone-warning:hover:not(.tao-button--disabled) {
    color: var(--tao-color-warning-text-hover);
    background-color: var(--tao-color-warning-subtle);
}

.tao-button--ghost.tao-button--tone-info,
.tao-button--text.tao-button--tone-info {
    color: var(--tao-color-info-text);
}

.tao-button--ghost.tao-button--tone-info:hover:not(.tao-button--disabled),
.tao-button--text.tao-button--tone-info:hover:not(.tao-button--disabled) {
    color: var(--tao-color-info-text-hover);
    background-color: var(--tao-color-info-subtle);
}

/* neutral: strong text, only the hover wash takes the theme colour; the quiet action next to a primary one (Cancel, Not now) */
.tao-button--ghost.tao-button--tone-neutral,
.tao-button--text.tao-button--tone-neutral {
    color: var(--tao-color-text-strong);
}

.tao-button--ghost.tao-button--tone-neutral:hover:not(.tao-button--disabled),
.tao-button--text.tao-button--tone-neutral:hover:not(.tao-button--disabled) {
    color: var(--tao-color-text-strong);
    background-color: var(--tao-color-accent-subtle-hover);
}

.tao-button--secondary.tao-button--tone-danger {
    color: var(--tao-color-danger-text);
    border-color: color-mix(in srgb, var(--tao-color-danger) 40%, transparent);
}

.tao-button--secondary.tao-button--tone-danger:hover:not(.tao-button--disabled) {
    color: var(--tao-color-danger-text-hover);
    background-color: var(--tao-color-danger-subtle);
}

.tao-button--primary.tao-button--tone-danger,
.tao-button--danger.tao-button--tone-danger {
    background-color: var(--tao-color-danger);
    color: var(--tao-color-on-danger);
}

.tao-button--primary.tao-button--tone-danger:hover:not(.tao-button--disabled),
.tao-button--danger.tao-button--tone-danger:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-danger-hover);
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
