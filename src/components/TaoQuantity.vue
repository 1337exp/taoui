<script lang="ts" setup>
import { computed, inject, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';
import type { TaoQuantityChangeSource } from '../quantity';

defineOptions({ name: 'TaoQuantity' });

const props = withDefaults(
    defineProps<{
        modelValue?: number;
        min?: number;
        max?: number;
        disabled?: boolean;
        /** Minus stays enabled at min and still emits `dec` — parent can remove the line. */
        allowRemove?: boolean;
        /** Clamp to max on blur and when the incoming value is above stock. */
        forceMaxLimit?: boolean;
    }>(),
    {
        modelValue: 1,
        min: 1,
        disabled: false,
        allowRemove: true,
        forceMaxLimit: true,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number, source: TaoQuantityChangeSource];
    dec: [value: number];
    inc: [value: number];
    blur: [value: number];
    focus: [event: FocusEvent];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const focused = ref(false);
const draft = ref(String(props.modelValue));

const ceiling = computed(() => (props.max === undefined ? Number.POSITIVE_INFINITY : props.max));

function toInt(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.trunc(value);
    }
    const parsed = parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? parsed : props.min;
}

function clampQty(value: number) {
    let next = Math.max(value, props.min);
    if (props.forceMaxLimit && props.max !== undefined) {
        next = Math.min(next, props.max);
    }
    return next;
}

function commit(value: number, source: TaoQuantityChangeSource) {
    const next = clampQty(value);
    if (next !== props.modelValue) {
        emit('update:modelValue', next);
        emit('change', next, source);
    }
    draft.value = String(next);
    return next;
}

watch(
    () => [props.modelValue, props.min, props.max, props.forceMaxLimit] as const,
    () => {
        const next = clampQty(toInt(props.modelValue));
        if (next !== props.modelValue) {
            emit('update:modelValue', next);
            emit('change', next, 'input');
        }
        if (!focused.value) {
            draft.value = String(next);
        }
    },
    { immediate: true },
);

function onDec() {
    if (props.disabled) {
        return;
    }
    let next = props.modelValue;
    if (props.modelValue > props.min) {
        next = props.modelValue > ceiling.value ? ceiling.value : clampQty(props.modelValue - 1);
        commit(next, 'dec');
    }
    emit('dec', next);
}

function onInc() {
    if (props.disabled) {
        return;
    }
    let next = props.modelValue;
    if (props.modelValue < ceiling.value) {
        next = clampQty(props.modelValue + 1);
        commit(next, 'inc');
    }
    emit('inc', next);
}

function onInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    if (!/^\d*$/.test(text)) {
        return;
    }
    draft.value = text;
    if (text === '') {
        return;
    }
    commit(toInt(text), 'input');
}

function onFocus(event: FocusEvent) {
    focused.value = true;
    emit('focus', event);
}

function onBlur() {
    focused.value = false;
    const next = commit(draft.value === '' ? props.min : toInt(draft.value), 'input');
    draft.value = String(next);
    emit('blur', next);
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        onInc();
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        onDec();
    }
}

const atMin = computed(() => props.modelValue <= props.min);
const atMax = computed(() => props.modelValue >= ceiling.value);
const minusDisabled = computed(() => props.disabled || (!props.allowRemove && atMin.value));
const plusDisabled = computed(() => props.disabled || atMax.value);
const minusLabel = computed(() => (atMin.value && props.allowRemove ? 'Убрать' : 'Уменьшить'));
</script>

<template>
    <div
        class="tao-quantity"
        :class="{
            'tao-quantity--invalid': invalid,
            'tao-quantity--focused': focused,
            'tao-quantity--disabled': disabled,
        }"
    >
        <button
            type="button"
            class="tao-quantity__btn tao-quantity__btn--dec"
            :aria-label="minusLabel"
            :disabled="minusDisabled"
            @click="onDec"
        >
            −
        </button>
        <input
            :id="controlId"
            class="tao-quantity__input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="off"
            role="spinbutton"
            :value="draft"
            :disabled="disabled"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            :aria-valuenow="modelValue"
            :aria-valuemin="min"
            :aria-valuemax="max"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
        />
        <button
            type="button"
            class="tao-quantity__btn tao-quantity__btn--inc"
            aria-label="Увеличить"
            :disabled="plusDisabled"
            @click="onInc"
        >
            +
        </button>
    </div>
</template>

<style scoped>
.tao-quantity {
    display: inline-flex;
    width: 100%;
    min-width: 148px;
    isolation: isolate;
}

.tao-quantity__btn,
.tao-quantity__input {
    height: 36px;
    margin: 0;
    border: 1px solid var(--tao-color-border-strong);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-family: inherit;
    transition: var(--tao-transition-base);
}

.tao-quantity__btn {
    flex: 0 0 50px;
    width: 50px;
    padding: 0;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-md);
    font-weight: 800;
    line-height: 1;
    cursor: pointer;
}

.tao-quantity__btn--dec {
    border-right: 0;
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-quantity__btn--inc {
    border-left: 0;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

.tao-quantity__btn:hover:not(:disabled) {
    z-index: 1;
    color: var(--tao-color-accent);
    border-color: var(--tao-color-accent);
}

.tao-quantity__btn:focus-visible {
    z-index: 2;
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-quantity__btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

.tao-quantity__input {
    z-index: 0;
    flex: 1 1 auto;
    min-width: 30px;
    padding: 0 var(--tao-space-2);
    border-right: 0;
    border-left: 0;
    text-align: center;
    font-size: var(--tao-font-size-md);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
}

.tao-quantity__input:focus {
    outline: none;
}

.tao-quantity--focused .tao-quantity__btn,
.tao-quantity--focused .tao-quantity__input {
    border-color: var(--tao-color-accent);
}

.tao-quantity--focused {
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
    border-radius: var(--tao-radius-control);
}

.tao-quantity__input:disabled {
    color: var(--tao-color-input-disabled-text);
    background: var(--tao-color-input-disabled-bg);
}

.tao-quantity--disabled .tao-quantity__btn {
    background: var(--tao-color-input-disabled-bg);
}

.tao-quantity--invalid .tao-quantity__btn,
.tao-quantity--invalid .tao-quantity__input {
    border-color: var(--tao-color-danger);
}

.tao-quantity--invalid.tao-quantity--focused {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}
</style>
