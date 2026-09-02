<script lang="ts" setup>
import { computed, inject, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';

defineOptions({ name: 'TaoPinCode' });

const props = withDefaults(
    defineProps<{
        length: number;
        hidden?: boolean;
        placeholder?: string;
        modelValue?: string;
        numbersOnly?: boolean;
        /** `focus` — клик сбрасывает ячейку и все справа (неверный код, набор заново).
         *  `input` — цифра остаётся, пока не введут новую. */
        clearOn?: 'focus' | 'input';
    }>(),
    {
        hidden: false,
        placeholder: '',
        modelValue: '',
        numbersOnly: false,
        clearOn: 'focus',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string];
    complete: [value: string];
    active: [el: HTMLInputElement | null, index: number];
    blur: [];
}>();

const field = inject(formFieldKey, null);
const localId = useId();
const controlId = computed(() => field?.id ?? localId);
const invalid = computed(() => Boolean(field?.invalid.value));
const describedBy = computed(() => field?.describedBy.value);

const numbers = ref<string[]>([]);
const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const activeNumber = ref(-1);

function acceptChar(ch: string): string {
    if (!ch) {
        return '';
    }
    if (props.numbersOnly && !/^[0-9]$/.test(ch)) {
        return '';
    }
    return ch;
}

function cellsFromModel(value: string): string[] {
    const raw = value ?? '';
    return Array.from({ length: props.length }, (_, index) => acceptChar(raw[index] ?? ''));
}

function serialize(): string {
    return numbers.value.join('');
}

function emitChange() {
    const next = serialize();
    if (next !== (props.modelValue ?? '')) {
        emit('update:modelValue', next);
        emit('change', next);
    }
}

function firstEmptyIndex(): number {
    const index = numbers.value.findIndex((cell) => !cell);
    return index === -1 ? numbers.value.length : index;
}

function focusCell(index: number) {
    inputRefs.value[index]?.focus();
}

function isFilled(): boolean {
    return numbers.value.length === props.length && numbers.value.every((cell) => cell !== '');
}

function mutation(v: string, index: number) {
    const char = v.length > 1 ? (v[v.length - 1] ?? '') : v;
    const next = acceptChar(char);

    if (props.numbersOnly && char && !next) {
        return;
    }

    numbers.value = [...numbers.value];
    numbers.value[index] = next;
    emitChange();

    if (!next) {
        return;
    }

    if (isFilled()) {
        inputRefs.value[index]?.blur();
        emit('complete', serialize());
        return;
    }

    const nextEmpty = numbers.value.findIndex((cell, cellIndex) => cellIndex > index && !cell);
    const target = nextEmpty !== -1 ? nextEmpty : index + 1;
    if (target < props.length) {
        focusCell(target);
    }
}

function onFocus(index: number) {
    if (props.clearOn === 'input') {
        const firstEmpty = firstEmptyIndex();
        if (firstEmpty < props.length && index > firstEmpty) {
            focusCell(firstEmpty);
            return;
        }

        activeNumber.value = index;
        emit('active', inputRefs.value[index] ?? null, index);
        requestAnimationFrame(() => inputRefs.value[index]?.select());
        return;
    }

    numbers.value = numbers.value.map((cell, cellIndex) => (cellIndex >= index ? '' : cell));
    activeNumber.value = index;
    emitChange();
    emit('active', inputRefs.value[index] ?? null, index);
}

function onChange(e: Event, index: number) {
    mutation((e.target as HTMLInputElement).value, index);
}

function onKeydown(event: KeyboardEvent, index: number) {
    if (event.key !== 'Backspace') {
        return;
    }

    if (numbers.value[index]) {
        return;
    }

    if (index > 0) {
        event.preventDefault();
        numbers.value = [...numbers.value];
        numbers.value[index - 1] = '';
        focusCell(index - 1);
        activeNumber.value = index - 1;
        emitChange();
    }
}

function onBlur() {
    requestAnimationFrame(() => {
        const active = document.activeElement;
        if (!inputRefs.value.includes(active as HTMLInputElement | null)) {
            activeNumber.value = -1;
            emit('blur');
        }
    });
}

watch(
    () => [props.modelValue, props.length, props.numbersOnly] as const,
    () => {
        const next = cellsFromModel(props.modelValue ?? '');
        if (next.join('') !== numbers.value.join('') || next.length !== numbers.value.length) {
            numbers.value = next;
        }
    },
    { immediate: true },
);
</script>

<template>
    <div
        class="tao-pin-code"
        role="group"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
    >
        <input
            v-for="(num, index) of numbers"
            :id="index === 0 ? controlId : undefined"
            :key="index"
            :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
            class="tao-pin-code__value"
            :class="{
                'tao-pin-code__value--active': activeNumber === index,
                'tao-pin-code__value--invalid': invalid,
            }"
            :value="num"
            :placeholder="placeholder"
            :type="hidden ? 'password' : 'text'"
            :inputmode="numbersOnly ? 'numeric' : 'text'"
            :pattern="numbersOnly ? '[0-9]' : undefined"
            autocomplete="one-time-code"
            maxlength="1"
            @input="onChange($event, index)"
            @keydown="onKeydown($event, index)"
            @focus="onFocus(index)"
            @blur="onBlur"
        />
    </div>
</template>

<style scoped>
.tao-pin-code {
    display: inline-flex;
    user-select: none;
}

.tao-pin-code__value {
    width: 50px;
    height: 56px;
    margin: 2px;
    border: 3px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-md);
    font-size: 21px;
    font-weight: 500;
    font-family: inherit;
    text-align: center;
    letter-spacing: 0;
    color: var(--tao-color-accent);
    background: var(--tao-color-input-bg);
    transition: var(--tao-transition-base);
    cursor: text;
    outline: none;
}

.tao-pin-code__value--active,
.tao-pin-code__value:focus {
    border-color: var(--tao-color-accent);
}

.tao-pin-code__value--invalid {
    border-color: var(--tao-color-danger);
}
</style>
