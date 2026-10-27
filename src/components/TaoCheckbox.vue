<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoCheckbox' });

const props = withDefaults(
    defineProps<{
        /** Checked state without v-model. / Состояние без v-model. */
        checked?: boolean;
        modelValue?: boolean;
        label?: string;
        disabled?: boolean;
        /** Size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        error?: boolean;
        /** Частично выбран: черта вместо квадрата. Клик ставит checked — indeterminate снимает родитель. */
        indeterminate?: boolean;
        /** `square` inside or a `check` tick; without it the mark of ancestors (`.tao-mark-*`). / Квадрат или галочка; без него — как у предков. */
        mark?: 'square' | 'check';
    }>(),
    {
        checked: undefined,
        modelValue: undefined,
        label: '',
        disabled: false,
        error: false,
        indeterminate: false,
        mark: undefined,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    change: [value: boolean];
}>();

const { field, controlId, invalid, describedBy } = useField(props);

const isChecked = computed({
    get: () => {
        if (props.modelValue !== undefined) {
            return props.modelValue;
        }
        if (props.checked !== undefined) {
            return props.checked;
        }
        return false;
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
    <label class="tao-checkbox" :class="[sizeClass(size), mark && `tao-mark-${mark}`, { 'tao-checkbox--disabled': disabled }]" :for="controlId">
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
    flex-shrink: 0;
    width: var(--tao-indicator-size);
    height: var(--tao-indicator-size);
    pointer-events: none;
    background-color: var(--tao-color-surface-raised);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    transition: var(--tao-transition-base);
}

.tao-checkbox__box::after {
    content: '';
    display: block;
    box-sizing: border-box;
    /* the shape comes from the mark context (contexts/mark.css): a square or a tick / форма из контекста отметки */
    width: var(--_tao-mark-width);
    height: var(--_tao-mark-height);
    background-color: transparent;
    border: 0 solid var(--tao-color-on-accent);
    border-radius: var(--_tao-mark-radius);
    transform: scale(0);
    transition: var(--tao-transition-base);
}

.tao-checkbox__label {
    font-size: var(--tao-control-font-size-secondary);
    white-space: nowrap;
    color: var(--tao-color-text);
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
    background-color: var(--_tao-mark-fill);
    border-width: var(--_tao-mark-border);
    transform: var(--_tao-mark-transform);
}

.tao-checkbox__input:indeterminate + .tao-checkbox__box::after {
    width: calc(var(--tao-indicator-size) - 8px);
    height: 2px;
    border-width: 0;
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
