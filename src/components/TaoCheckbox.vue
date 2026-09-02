<script lang="ts" setup>
import { computed, inject, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoCheckbox' });

const props = withDefaults(
    defineProps<{
        value?: boolean;
        modelValue?: boolean;
        label?: string;
        disabled?: boolean;
        error?: boolean;
        /** Частично выбран: черта вместо квадрата. Клик ставит checked — indeterminate снимает родитель. */
        indeterminate?: boolean;
    }>(),
    {
        value: undefined,
        modelValue: undefined,
        label: '',
        disabled: false,
        error: false,
        indeterminate: false,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    change: [value: boolean];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => props.error || Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const isChecked = computed({
    get: () => {
        if (props.modelValue !== undefined) {
            return props.modelValue;
        }
        return Boolean(props.value);
    },
    set: (next) => {
        emit('update:modelValue', next);
        emit('change', next);
    },
});

function onInputChange(event: Event) {
    if (props.disabled) {
        return;
    }
    const target = event.target as HTMLInputElement;
    isChecked.value = target.checked;
}

const inputRef = ref<HTMLInputElement | null>(null);

watch(
    [inputRef, isChecked, () => props.indeterminate],
    () => {
        const el = inputRef.value;
        if (!el) {
            return;
        }
        el.checked = isChecked.value;
        el.indeterminate = Boolean(props.indeterminate);
    },
    { flush: 'post' },
);
</script>

<template>
    <label class="tao-checkbox" :class="{ 'tao-checkbox--disabled': disabled }" :for="controlId">
        <slot name="pre" :text="label" />

        <input
            :id="controlId"
            ref="inputRef"
            class="tao-checkbox__input tao-sr-only"
            type="checkbox"
            :checked="isChecked"
            :disabled="disabled"
            :aria-checked="indeterminate ? 'mixed' : undefined"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            @change="onInputChange"
        />

        <span class="tao-checkbox__box"></span>
        <span v-if="label" class="tao-checkbox__label">{{ label }}</span>
        <span v-else class="tao-checkbox__label"><slot /></span>

        <slot name="post" :text="label" />
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

.tao-checkbox__box {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    pointer-events: none;
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

.tao-checkbox__input:checked + .tao-checkbox__box,
.tao-checkbox__input:indeterminate + .tao-checkbox__box {
    border-color: var(--tao-color-accent);
    background-color: var(--tao-color-accent);
}

.tao-checkbox__input:checked + .tao-checkbox__box::after {
    background-color: var(--tao-color-on-accent);
    transform: scale(1);
}

.tao-checkbox__input:indeterminate + .tao-checkbox__box::after {
    width: 10px;
    height: 2px;
    border-radius: 1px;
    background-color: var(--tao-color-on-accent);
    transform: scale(1);
}

.tao-checkbox__input:focus-visible + .tao-checkbox__box {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-checkbox__input[aria-invalid='true'] + .tao-checkbox__box {
    border-color: var(--tao-color-danger);
}
</style>
