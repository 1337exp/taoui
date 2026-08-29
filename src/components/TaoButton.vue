<script lang="ts" setup>
interface Props {
    type?: 'button' | 'submit' | 'reset';
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    size: 'medium',
    variant: 'primary',
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
            `tao-button--${size}`,
            `tao-button--${variant}`,
            {
                'tao-button--disabled': disabled,
                'tao-button--loading': loading,
                'tao-button--block': block,
                'tao-button--icon': !!icon,
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

    border: none;
    border-radius: var(--tao-radius-control);
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition: var(--tao-transition-base);
    position: relative;
}

.tao-button:active {
    transform: translateY(1px);
}

.tao-button--small {
    padding: var(--tao-space-1) var(--tao-space-3);
    font-size: var(--tao-font-size-xs);
    height: 28px;
}

.tao-button--medium {
    padding: var(--tao-space-2) var(--tao-space-4);
    font-size: var(--tao-font-size-md);
    height: 36px;
}

.tao-button--large {
    padding: var(--tao-space-2) var(--tao-space-6);
    font-size: var(--tao-font-size-lg);
    height: 44px;
}

.tao-button--primary {
    background-color: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
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

.tao-button--danger {
    background-color: var(--tao-color-danger);
    color: var(--tao-color-text-strong);
}

.tao-button--danger:hover:not(.tao-button--disabled) {
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
