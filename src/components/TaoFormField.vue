<script lang="ts" setup>
import { computed, provide, useId } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoFormField' });

const props = defineProps<{
    label?: string;
    hint?: string;
    error?: string;
}>();

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const labelId = `${id}-label`;
const invalid = computed(() => Boolean(props.error));
const describedBy = computed(() => {
    if (props.error) {
        return errorId;
    }

    if (props.hint) {
        return hintId;
    }

    return undefined;
});

provide(formFieldKey, {
    id,
    invalid,
    describedBy,
});

function onLabelClick() {
    const target = document.getElementById(id);
    if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
    ) {
        return;
    }

    const scope = target ?? document.getElementById(labelId)?.parentElement;
    scope
        ?.querySelector<HTMLElement>(
            'input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled])',
        )
        ?.focus();
}
</script>

<template>
    <div class="tao-form-field" :class="{ 'tao-form-field--invalid': invalid }">
        <label v-if="label" :id="labelId" class="tao-form-field__label" :for="id" @click="onLabelClick">{{ label }}</label>
        <slot />
        <p v-if="error" :id="errorId" class="tao-form-field__error">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="tao-form-field__hint">{{ hint }}</p>
    </div>
</template>

<style scoped>
.tao-form-field {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    width: 100%;
}

.tao-form-field__label {
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text);
    font-weight: 500;
}

.tao-form-field__hint {
    margin: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text-muted);
}

.tao-form-field__error {
    margin: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-danger);
}
</style>
