<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { useControlAttrs } from '../controlAttrs';
import { computed, ref, watch } from 'vue';
import { useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import type { TaoQuantityChangeSource } from '../quantity';
import { useLocaleText } from '../locale';

defineOptions({ name: 'TaoQuantity', inheritAttrs: false });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        modelValue?: number;
        min?: number;
        max?: number;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** Minus stays enabled at min and still emits `dec` — parent can remove the line. */
        allowRemove?: boolean;
        /** Clamp to max on blur and when the incoming value is above stock. */
        forceMaxLimit?: boolean;
        decrementLabel?: string;
        removeLabel?: string;
        incrementLabel?: string;
    }>(),
    {
        modelValue: 1,
        min: 1,
        disabled: false,
        error: false,
        allowRemove: true,
        forceMaxLimit: true,
    },
);
const l10n = useLocaleText(props, 'quantity');

const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number, source: TaoQuantityChangeSource];
    dec: [value: number];
    inc: [value: number];
    blur: [value: number];
    focus: [event: FocusEvent];
}>();

const { field, controlId, invalid, describedBy } = useField(props);

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
const minusLabel = computed(() => (atMin.value && props.allowRemove ? l10n.value.removeLabel : l10n.value.decrementLabel));
</script>

<template>
    <div
        v-bind="rootAttrs()"
        class="tao-quantity"
        :class="[
            sizeClass(size),
            {
                'tao-quantity--invalid': invalid,
                'tao-quantity--focused': focused,
                'tao-quantity--disabled': disabled,
            },
        ]"
    >
        <button
            type="button"
            class="tao-quantity__btn tao-quantity__btn--dec"
            :aria-label="minusLabel"
            :disabled="minusDisabled"
            @click="onDec"
        >
            <span aria-hidden="true">
                <slot name="decrement-icon"><TaoIcon name="tao-minus" /></slot>
            </span>
        </button>
        <input
            v-bind="controlAttrs()"
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
            :aria-label="l10n.incrementLabel"
            :disabled="plusDisabled"
            @click="onInc"
        >
            <span aria-hidden="true">
                <slot name="increment-icon"><TaoIcon name="tao-plus" /></slot>
            </span>
        </button>
    </div>
</template>

<style scoped>
.tao-quantity {
    display: inline-flex;
    width: 100%;
    /* 148px at medium / 148px в medium */
    min-width: calc(var(--tao-control-height) * 4 + 4px);
    isolation: isolate;
}

.tao-quantity__btn,
.tao-quantity__input {
    height: var(--tao-control-height);
    margin: 0;
    border: 1px solid var(--tao-color-border-strong);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-family: inherit;
    transition: var(--tao-transition-base);
}

.tao-quantity__btn {
    /* 50px at medium / 50px в medium */
    --tao-quantity-btn: calc(var(--tao-control-height) + var(--tao-space-3) + 2px);
    flex: 0 0 var(--tao-quantity-btn);
    width: var(--tao-quantity-btn);
    padding: 0;
    color: var(--tao-color-text-muted);
    font-size: var(--tao-control-font-size);
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
    font-size: var(--tao-control-font-size);
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
