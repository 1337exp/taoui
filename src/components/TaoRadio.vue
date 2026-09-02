<script lang="ts" setup>
import { computed, inject, useId } from 'vue';
import { radioGroupKey, type TaoRadioValue } from '../radio';

defineOptions({ name: 'TaoRadio' });

const props = withDefaults(
    defineProps<{
        value: TaoRadioValue;
        modelValue?: TaoRadioValue;
        name?: string;
        label?: string;
        disabled?: boolean;
    }>(),
    {
        label: '',
        disabled: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: TaoRadioValue];
    change: [value: TaoRadioValue];
}>();

const group = inject(radioGroupKey, null);
const localId = useId();

const isDisabled = computed(() => props.disabled || Boolean(group?.disabled.value));
const inputName = computed(() => group?.name.value ?? props.name);
const isChecked = computed(() => {
    const current = group ? group.model.value : props.modelValue;
    return current === props.value;
});

function onChange() {
    if (isDisabled.value) {
        return;
    }

    if (group) {
        group.setValue(props.value);
        return;
    }

    emit('update:modelValue', props.value);
    emit('change', props.value);
}
</script>

<template>
    <label class="tao-radio" :class="{ 'tao-radio--disabled': isDisabled }" :for="localId">
        <input
            :id="localId"
            class="tao-radio__input"
            type="radio"
            :name="inputName"
            :value="String(value)"
            :checked="isChecked"
            :disabled="isDisabled"
            @change="onChange"
        />
        <span class="tao-radio__dot" aria-hidden="true"></span>
        <span v-if="label" class="tao-radio__label">{{ label }}</span>
        <span v-else class="tao-radio__label"><slot /></span>
    </label>
</template>

<style scoped>
.tao-radio {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    cursor: pointer;
    user-select: none;
    color: var(--tao-color-text);
}

.tao-radio__input {
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

.tao-radio__dot {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    pointer-events: none;
    background: var(--tao-color-surface-raised);
    border: 2px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-full);
    transition: var(--tao-transition-base);
}

.tao-radio__dot::after {
    content: '';
    width: 8px;
    height: 8px;
    background: transparent;
    border-radius: var(--tao-radius-full);
    transform: scale(0);
    transition: var(--tao-transition-base);
}

.tao-radio__input:checked + .tao-radio__dot {
    border-color: var(--tao-color-accent);
}

.tao-radio__input:checked + .tao-radio__dot::after {
    background: var(--tao-color-accent);
    transform: scale(1);
}

.tao-radio__input:focus-visible + .tao-radio__dot {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-radio__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
}

.tao-radio--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
