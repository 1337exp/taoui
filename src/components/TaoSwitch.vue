<script lang="ts" setup>
import { computed, inject, useId } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoSwitch' });

const props = withDefaults(
    defineProps<{
        modelValue?: boolean;
        label?: string;
        disabled?: boolean;
    }>(),
    {
        modelValue: false,
        label: '',
        disabled: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    change: [value: boolean];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

function toggle() {
    if (props.disabled) {
        return;
    }

    const next = !props.modelValue;
    emit('update:modelValue', next);
    emit('change', next);
}
</script>

<template>
    <label class="tao-switch" :class="{ 'tao-switch--disabled': disabled, 'tao-switch--on': modelValue, 'tao-switch--invalid': invalid }" :for="controlId">
        <input
            :id="controlId"
            class="tao-switch__input"
            type="checkbox"
            role="switch"
            :checked="modelValue"
            :disabled="disabled"
            :aria-checked="modelValue"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            @change="toggle"
        />
        <span class="tao-switch__track" aria-hidden="true">
            <span class="tao-switch__thumb"></span>
        </span>
        <span v-if="label" class="tao-switch__label">{{ label }}</span>
        <span v-else-if="$slots.default" class="tao-switch__label"><slot /></span>
    </label>
</template>

<style scoped>
.tao-switch {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text);
}

.tao-switch__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.tao-switch__track {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    width: 36px;
    height: 20px;
    padding: 2px;
    pointer-events: none;
    background: var(--tao-color-surface-sunken);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-full);
    transition: var(--tao-transition-base);
}

.tao-switch__thumb {
    width: 14px;
    height: 14px;
    background: var(--tao-color-text-muted);
    border-radius: var(--tao-radius-full);
    transform: translateX(0);
    transition: var(--tao-transition-base);
}

.tao-switch--on .tao-switch__track {
    background: var(--tao-color-accent);
    border-color: var(--tao-color-accent);
}

.tao-switch--on .tao-switch__thumb {
    background: var(--tao-color-on-accent);
    transform: translateX(16px);
}

.tao-switch__input:focus-visible + .tao-switch__track {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-switch__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
}

.tao-switch--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-switch--invalid .tao-switch__track {
    border-color: var(--tao-color-danger);
}
</style>
