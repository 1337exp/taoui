<script lang="ts" setup>
import { computed, inject, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoInputNumber' });

const props = withDefaults(
    defineProps<{
        modelValue?: number | null;
        min?: number;
        max?: number;
        step?: number;
        precision?: number;
        disabled?: boolean;
        placeholder?: string;
        controls?: boolean;
        incrementLabel?: string;
        decrementLabel?: string;
    }>(),
    {
        modelValue: null,
        step: 1,
        disabled: false,
        placeholder: '',
        controls: true,
        incrementLabel: 'Увеличить',
        decrementLabel: 'Уменьшить',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number | null];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const focused = ref(false);
const draft = ref(toDraft(props.modelValue));

watch(
    () => props.modelValue,
    (value) => {
        if (!focused.value) {
            draft.value = toDraft(value);
        }
    },
);

function decimalsOf(value: number) {
    const text = String(value);
    const dot = text.indexOf('.');
    return dot === -1 ? 0 : text.length - dot - 1;
}

function roundTo(value: number) {
    const digits = props.precision ?? decimalsOf(props.step);
    if (digits <= 0) {
        return Math.round(value);
    }
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

function clamp(value: number) {
    let next = roundTo(value);
    if (props.min !== undefined && next < props.min) {
        next = props.min;
    }
    if (props.max !== undefined && next > props.max) {
        next = props.max;
    }
    return roundTo(next);
}

function toDraft(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '';
    }
    return String(value);
}

function parseDraft(text: string): number | null | 'incomplete' {
    const trimmed = text.trim().replace(',', '.');
    if (trimmed === '') {
        return null;
    }
    if (trimmed === '-' || trimmed === '.' || trimmed === '-.') {
        return 'incomplete';
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
        return 'incomplete';
    }
    return parsed;
}

function isAllowed(text: string) {
    return /^-?\d*([.,]\d*)?$/.test(text);
}

function commit(value: number | null) {
    const next = value === null ? null : clamp(value);
    emit('update:modelValue', next);
    if (!focused.value) {
        draft.value = toDraft(next);
    }
}

function bump(direction: 1 | -1) {
    if (props.disabled) {
        return;
    }
    const base = props.modelValue ?? 0;
    commit(base + direction * props.step);
}

function onInput(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    if (!isAllowed(text)) {
        return;
    }
    draft.value = text;
    const parsed = parseDraft(text);
    if (parsed !== 'incomplete') {
        emit('update:modelValue', parsed === null ? null : clamp(parsed));
    }
}

function onFocus(event: FocusEvent) {
    focused.value = true;
    emit('focus', event);
}

function onBlur(event: FocusEvent) {
    focused.value = false;
    const parsed = parseDraft(draft.value);
    commit(parsed === 'incomplete' ? null : parsed);
    emit('blur', event);
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        bump(1);
        return;
    }
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        bump(-1);
    }
}

const atMin = computed(() => props.min !== undefined && (props.modelValue ?? 0) <= props.min);
const atMax = computed(() => props.max !== undefined && (props.modelValue ?? 0) >= props.max);
</script>

<template>
    <div class="tao-input-number" :class="{ 'tao-input-number--invalid': invalid, 'tao-input-number--controls': controls }">
        <input
            :id="controlId"
            class="tao-input-number__input"
            type="text"
            inputmode="decimal"
            role="spinbutton"
            :value="draft"
            :placeholder="placeholder"
            :disabled="disabled"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            :aria-valuenow="modelValue ?? undefined"
            :aria-valuemin="min"
            :aria-valuemax="max"
            autocomplete="off"
            @input="onInput"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
        />
        <div v-if="controls" class="tao-input-number__steppers">
            <button
                type="button"
                class="tao-input-number__step"
                :aria-label="incrementLabel"
                tabindex="-1"
                :disabled="disabled || atMax"
                @click="bump(1)"
            >
                +
            </button>
            <button
                type="button"
                class="tao-input-number__step"
                :aria-label="decrementLabel"
                tabindex="-1"
                :disabled="disabled || atMin"
                @click="bump(-1)"
            >
                −
            </button>
        </div>
    </div>
</template>

<style scoped>
.tao-input-number {
    position: relative;
    display: flex;
    width: 100%;
}

.tao-input-number__input {
    width: 100%;
    padding: var(--tao-space-2) var(--tao-space-3);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-size: var(--tao-font-size-md);
    font-family: inherit;
    font-variant-numeric: tabular-nums;
    transition: var(--tao-transition-base);
}

.tao-input-number--controls .tao-input-number__input {
    padding-right: 34px;
}

.tao-input-number__input::placeholder {
    color: var(--tao-color-input-placeholder);
}

.tao-input-number__input:focus {
    outline: none;
    border-color: var(--tao-color-accent);
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-input-number__input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    color: var(--tao-color-input-disabled-text);
    background: var(--tao-color-input-disabled-bg);
}

.tao-input-number--invalid .tao-input-number__input {
    border-color: var(--tao-color-danger);
}

.tao-input-number--invalid .tao-input-number__input:focus {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-input-number__steppers {
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    display: flex;
    flex-direction: column;
    width: 28px;
    border-left: 1px solid var(--tao-color-border);
}

.tao-input-number__step {
    flex: 1;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--tao-color-text-muted);
    font: inherit;
    line-height: 1;
    cursor: pointer;
}

.tao-input-number__step + .tao-input-number__step {
    border-top: 1px solid var(--tao-color-border);
}

.tao-input-number__step:hover:not(:disabled) {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-surface-hover);
}

.tao-input-number__step:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-input-number__step:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}
</style>
