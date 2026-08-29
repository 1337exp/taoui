<script lang="ts" setup>
interface Props {
    modelValue: string | number;
    type?: 'text' | 'password' | 'email' | 'number' | 'tel';
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    errorMessage?: string;
    label?: string;
}

withDefaults(defineProps<Props>(), {
    type: 'text',
    placeholder: '',
    disabled: false,
    error: false,
    errorMessage: '',
    label: '',
});

const emit = defineEmits(['update:modelValue', 'blur', 'focus']);

function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', target.value);
}

function handleBlur(event: FocusEvent) {
    emit('blur', event);
}

function handleFocus(event: FocusEvent) {
    emit('focus', event);
}
</script>

<template>
    <div class="tao-input-wrapper">
        <label v-if="label" class="tao-input__label">{{ label }}</label>
        <input
            class="tao-input"
            :class="{ 'tao-input--error': error }"
            :type="type"
            :value="modelValue"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="handleInput"
            @blur="handleBlur"
            @focus="handleFocus"
        />
        <span v-if="error && errorMessage" class="tao-input__error">{{ errorMessage }}</span>
    </div>
</template>

<style scoped>
.tao-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    width: 100%;
}

.tao-input__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
    font-weight: 500;
}

.tao-input {
    padding: var(--tao-space-2) var(--tao-space-3);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-size: var(--tao-font-size-md);
    font-family: inherit;
    transition: var(--tao-transition-base);
}

.tao-input::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-input:focus {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    color: var(--tao-color-input-disabled-text);
    background: var(--tao-color-input-disabled-bg);
}

.tao-input--error {
    border-color: var(--tao-color-danger);
}

.tao-input--error:focus {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-input__error {
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-danger);
}
</style>
