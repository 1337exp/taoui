<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoTag' });

interface Props {
    type?: 'neutral' | 'success' | 'danger' | 'error' | 'warning' | 'info' | '';
    color?: string;
    background?: string;
    borderColor?: string;
    pointer?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    pointer: false,
});

const tone = computed(() => (props.type === 'error' ? 'danger' : props.type));
const style = computed(() => ({
    color: props.color || '',
    background: props.background || '',
    'border-color': props.borderColor || '',
}));
</script>

<template>
    <div
        class="tao-tag"
        :class="[props.pointer && 'tao-tag--pointer', tone ? `tao-tag--${tone}` : '']"
        :style="style"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-tag {
    box-sizing: border-box;
    display: inline-block;
    height: auto;
    margin: 0;
    padding-inline: var(--tao-space-2);
    white-space: nowrap;
    text-align: start;
    color: var(--tao-color-accent);
    background: var(--tao-color-accent-subtle);
    border: 1px solid var(--tao-color-border);
    border-radius: var(--tao-radius-sm);
    transition: var(--tao-transition-base);
}

.tao-tag--pointer {
    cursor: pointer;
    user-select: none;
}

.tao-tag--neutral {
    color: var(--tao-color-text);
    background: var(--tao-color-surface-sunken);
    border-color: var(--tao-color-border-strong);
}

.tao-tag--success {
    color: var(--tao-color-success);
    background: color-mix(in srgb, var(--tao-color-success) 12%, transparent);
    border-color: color-mix(in srgb, var(--tao-color-success) 30%, transparent);
}

.tao-tag--danger,
.tao-tag--error {
    color: var(--tao-color-danger);
    background: var(--tao-color-danger-subtle);
    border-color: color-mix(in srgb, var(--tao-color-danger) 30%, transparent);
}

.tao-tag--warning {
    color: var(--tao-color-warning);
    background: var(--tao-color-warning-subtle);
    border-color: color-mix(in srgb, var(--tao-color-warning) 30%, transparent);
}

.tao-tag--info {
    color: var(--tao-color-info);
    background: var(--tao-color-info-subtle);
    border-color: color-mix(in srgb, var(--tao-color-info) 30%, transparent);
}
</style>
