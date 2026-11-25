<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { useControlAttrs } from '../controlAttrs';
import { computed, ref, watch } from 'vue';
import { nativeFieldAttrs, useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { useLocaleText } from '../locale';
import { clamp } from '../primitives/number';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoQuantity', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoQuantity', { onDec: 'use `@remove` (the minus at the minimum) or `@commit`', onInc: 'use `@commit` or `@update:modelValue`', error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        min?: number;
        max?: number;
        disabled?: boolean;
        /** The value is shown and can be selected and submitted, but not changed: ± and the arrow keys do nothing. / Значение видно, его можно выделить и отправить, но не изменить: ± и стрелки ничего не делают. */
        readOnly?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        /** The id of the control, which the label of a `TaoFormField` points at. / id элемента: на него указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the value goes into `FormData` and a native submit. / Имя в форме: значение попадает в `FormData` и нативную отправку. */
        name?: string;
        /** The field must be filled in (native `required`). / Поле обязательно (нативный `required`). */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        invalid?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** Minus stays enabled at min and emits `remove` — the parent can remove the line. */
        allowRemove?: boolean;
        /** Clamp to max on blur and when the incoming value is above stock. */
        forceMaxLimit?: boolean;
        decrementLabel?: string;
        removeLabel?: string;
        incrementLabel?: string;
    }>(),
    {
        min: 1,
        disabled: false,
        invalid: false,
        allowRemove: true,
        forceMaxLimit: true,
    },
);

const model = defineModel<number>({ default: 1 });
const l10n = useLocaleText(props, 'quantity');

const emit = defineEmits<{
    /** An edit is finished: a button, or leaving the field after typing. / Правка закончена: кнопка или уход из поля после набора. */
    commit: [value: number];
    /** The minus button was pressed at the minimum, with `allowRemove`: the app takes the item away. / Минус нажат на минимуме при `allowRemove`: приложение убирает позицию. */
    remove: [];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
}>();

const { field, controlId, isInvalid, describedBy } = useField(props);

const focused = ref(false);
const draft = ref(String(model.value));

const ceiling = computed(() => (props.max === undefined ? Number.POSITIVE_INFINITY : props.max));

function toInt(value: unknown) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.trunc(value);
    }
    const parsed = parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? parsed : props.min;
}

function clampQty(value: number) {
    return clamp(value, props.min, props.forceMaxLimit ? props.max : undefined);
}

function apply(value: number) {
    const next = clampQty(value);
    if (next !== model.value) {
        model.value = next;
    }
    draft.value = String(next);
    return next;
}

watch(
    () => [model.value, props.min, props.max, props.forceMaxLimit] as const,
    () => {
        const next = clampQty(toInt(model.value));
        if (next !== model.value) {
            model.value = next;
        }
        if (!focused.value) {
            draft.value = String(next);
        }
    },
    { immediate: true },
);

function onDec() {
    if (props.disabled || props.readOnly) {
        return;
    }
    if (model.value > props.min) {
        const next = apply(model.value > ceiling.value ? ceiling.value : clampQty(model.value - 1));
        emit('commit', next);
    } else if (props.allowRemove) {
        emit('remove');
    }
}

function onInc() {
    if (props.disabled || props.readOnly) {
        return;
    }
    if (model.value < ceiling.value) {
        const next = apply(clampQty(model.value + 1));
        emit('commit', next);
    }
}

function onInput(event: Event) {
    if (props.readOnly) {
        return;
    }
    const text = (event.target as HTMLInputElement).value;
    if (!/^\d*$/.test(text)) {
        return;
    }
    draft.value = text;
    if (text === '') {
        return;
    }
    apply(toInt(text));
}

/** The value the field had when it took the focus: a blur commits only a change. / Значение при входе в поле: уход фиксирует только изменение. */
let atFocus = model.value;

function onFocus(event: FocusEvent) {
    focused.value = true;
    atFocus = model.value;
    emit('focus', event);
}

function onBlur(event: FocusEvent) {
    focused.value = false;
    if (props.readOnly) {
        emit('blur', event);
        return;
    }
    const next = apply(draft.value === '' ? props.min : toInt(draft.value));
    draft.value = String(next);
    if (next !== atFocus) {
        emit('commit', next);
    }
    emit('blur', event);
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

const atMin = computed(() => model.value <= props.min);
const atMax = computed(() => model.value >= ceiling.value);
const minusDisabled = computed(() => props.disabled || props.readOnly || (!props.allowRemove && atMin.value));
const plusDisabled = computed(() => props.disabled || props.readOnly || atMax.value);
const minusLabel = computed(() => (atMin.value && props.allowRemove ? l10n.value.removeLabel : l10n.value.decrementLabel));
</script>

<template>
    <div
        v-bind="rootAttrs()"
        class="tao-quantity"
        :class="[
            sizeClass(size),
            {
                'tao-quantity--invalid': isInvalid,
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
            v-bind="{ ...controlAttrs(), ...nativeFieldAttrs(props) }"
            :id="controlId"
            class="tao-quantity__input"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :autocomplete="(controlAttrs().autocomplete as string | undefined) ?? 'off'"
            role="spinbutton"
            :value="draft"
            :disabled="disabled"
            :aria-invalid="isInvalid || undefined"
            :aria-describedby="describedBy"
            :aria-valuenow="model"
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
    color: var(--tao-color-text-strong);
    border-color: var(--tao-color-border-strong);
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
