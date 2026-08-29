<script lang="ts" setup>
import { computed } from 'vue';

interface Props {
    value?: boolean;
    modelValue?: boolean;
    label?: string;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    value: undefined,
    modelValue: undefined,
    label: '',
    disabled: false,
});

const emit = defineEmits(['update:modelValue', 'change']);

const isChecked = computed({
    get: () => {
        if (props.modelValue !== undefined) {
            return props.modelValue;
        }
        return props.value;
    },
    set: (value) => {
        if (props.modelValue !== undefined) {
            emit('update:modelValue', value);
        }
        emit('change', value);
    },
});

function onInputChange(event: Event) {
    if (props.disabled) {
        return;
    }
    const target = event.target as HTMLInputElement;
    isChecked.value = target.checked;
}
</script>

<template>
    <label class="tao-checkbox" :class="{ 'tao-checkbox--disabled': props.disabled }">
        <slot name="pre" :text="props.label" />

        <input
            class="tao-checkbox__input"
            type="checkbox"
            :checked="isChecked"
            :disabled="props.disabled"
            @change="onInputChange"
        />

        <span class="tao-checkbox__box"></span>
        <span v-if="props.label" class="tao-checkbox__label">{{ props.label }}</span>
        <span v-else class="tao-checkbox__label"><slot /></span>

        <slot name="post" :text="props.label" />
    </label>
</template>

<style scoped>
.tao-checkbox {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    cursor: pointer;
    user-select: none;
    font-size: var(--tao-font-size-lg);
    color: var(--tao-color-text);
}

.tao-checkbox__input {
    display: none;
}

.tao-checkbox__box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background-color: var(--tao-color-surface-raised);
    border: 2px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    transition: var(--tao-transition-base);
}

.tao-checkbox__box::after {
    content: '';
    display: block;
    width: 12px;
    height: 12px;
    background-color: transparent;
    border-radius: 2px;
    transform: scale(0);
    transition: var(--tao-transition-base);
}

.tao-checkbox__label {
    font-size: var(--tao-font-size-sm);
    white-space: nowrap;
    color: var(--tao-color-text-muted);
}

.tao-checkbox--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-checkbox__input:checked + .tao-checkbox__box {
    border-color: var(--tao-color-accent);
    background-color: var(--tao-color-accent);
}

.tao-checkbox__input:checked + .tao-checkbox__box::after {
    background-color: var(--tao-color-on-accent);
    transform: scale(1);
}

.tao-checkbox__input:focus-visible + .tao-checkbox__box {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}
</style>
