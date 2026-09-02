<script lang="ts" setup>
import { computed, useSlots } from 'vue';

defineOptions({ name: 'TaoTag' });

interface Props {
    type?: 'neutral' | 'success' | 'danger' | 'error' | 'warning' | 'info' | '';
    color?: string;
    background?: string;
    borderColor?: string;
    pointer?: boolean;
    closable?: boolean;
    closeLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: '',
    pointer: false,
    closable: false,
    closeLabel: 'Убрать',
});

const emit = defineEmits<{
    close: [event: MouseEvent];
}>();

const slots = useSlots();
const tone = computed(() => (props.type === 'error' ? 'danger' : props.type));
const style = computed(() => ({
    color: props.color || '',
    background: props.background || '',
    'border-color': props.borderColor || '',
}));

function onClose(event: MouseEvent) {
    emit('close', event);
}
</script>

<template>
    <span
        class="tao-tag"
        :class="[
            tone ? `tao-tag--${tone}` : '',
            {
                'tao-tag--pointer': pointer,
                'tao-tag--closable': closable,
                'tao-tag--prefix': Boolean(slots.prefix),
            },
        ]"
        :style="style"
    >
        <span v-if="$slots.prefix" class="tao-tag__prefix">
            <slot name="prefix" />
        </span>
        <span class="tao-tag__text"><slot /></span>
        <button
            v-if="closable"
            type="button"
            class="tao-tag__close"
            :aria-label="closeLabel"
            @click.stop="onClose"
        >
            ✕
        </button>
    </span>
</template>

<style scoped>
.tao-tag {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    height: auto;
    margin: 0;
    padding: 1px var(--tao-space-2);
    vertical-align: middle;
    white-space: nowrap;
    text-align: start;
    line-height: 1.25;
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

.tao-tag--prefix {
    padding-block: 2px;
    padding-inline-start: 3px;
}

.tao-tag--closable {
    padding-inline-end: 2px;
}

.tao-tag__prefix {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
}

.tao-tag__prefix :deep(.tao-avatar) {
    display: block;
}

.tao-tag__text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

.tao-tag__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: var(--tao-radius-full);
    background: transparent;
    color: currentColor;
    opacity: 0.72;
    font-family: inherit;
    font-size: 11px;
    line-height: 1;
    cursor: pointer;
}

.tao-tag__close:hover {
    opacity: 1;
    background: color-mix(in srgb, currentColor 14%, transparent);
}

.tao-tag__close:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
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
