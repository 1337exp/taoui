<script lang="ts" setup>
import { computed, inject, ref, useId, watch } from 'vue';
import { formFieldKey } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { warnDeprecated } from '../deprecate';
import { parsePinFormat, pinFromPaste, separatorAfter } from '../pinFormat';

defineOptions({ name: 'TaoPinCode' });

const props = withDefaults(
    defineProps<{
        /** Number of cells. Not needed with `format` (it is counted from the mask). / Число ячеек. С `format` не нужно (считается по маске). */
        length?: number;
        /**
         * Mask with visual separators: `#` is a cell, anything else is a separator (`#-##-##` is 0-00-00).
         * Separators are not part of the value. A paste in the same shape is split into cells, a paste as long as the code goes in as is.
         * Маска с визуальными разделителями: `#` это ячейка, остальное разделитель (`#-##-##` даёт 0-00-00).
         * Разделители не входят в значение. Вставка в том же виде раскладывается по ячейкам, вставка длиной с код идёт как есть.
         */
        format?: string;
        /** Cells show dots instead of characters. / Ячейки показывают точки вместо символов. */
        masked?: boolean;
        /** @deprecated Use `masked` — `hidden` is a native attribute. / Используйте `masked` — `hidden` это нативный атрибут. */
        hidden?: boolean;
        placeholder?: string;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        /** Cell size; without it — the size of ancestors. / Размер ячеек; без него — размер предков. */
        size?: TaoSize;
        modelValue?: string;
        numbersOnly?: boolean;
        /** `focus` — клик сбрасывает ячейку и все справа (неверный код, набор заново).
         *  `input` — цифра остаётся, пока не введут новую. */
        clearOn?: 'focus' | 'input';
    }>(),
    {
        masked: false,
        hidden: false,
        placeholder: '',
        disabled: false,
        error: false,
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
const invalid = computed(() => props.error || Boolean(field?.invalid.value));
const isMasked = computed(() => props.masked || props.hidden);
const describedBy = computed(() => field?.describedBy.value);

const layout = computed(() => (props.format === undefined ? null : parsePinFormat(props.format)));
/** How many cells there are: the mask wins over `length`. / Сколько ячеек: маска главнее `length`. */
const count = computed(() => layout.value?.cells ?? props.length ?? 0);

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
    return Array.from({ length: count.value }, (_, index) => acceptChar(raw[index] ?? ''));
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
    return numbers.value.length === count.value && numbers.value.every((cell) => cell !== '');
}

function applyChars(index: number, raw: string, pasted = false) {
    // Вставка целого кода (по формату или чистая) заполняет все ячейки с первой, где бы ни стоял курсор
    const whole = pasted ? pinFromPaste(raw, layout.value, count.value, acceptChar) : null;
    const chars = whole ?? [...raw].map((ch) => acceptChar(ch)).filter(Boolean);
    if (!chars.length) {
        return;
    }

    numbers.value = [...numbers.value];
    let cursor = whole ? 0 : index;
    for (const ch of chars) {
        if (cursor >= count.value) {
            break;
        }
        numbers.value[cursor] = ch;
        cursor += 1;
    }
    emitChange();

    if (isFilled()) {
        inputRefs.value[index]?.blur();
        emit('complete', serialize());
        return;
    }

    if (cursor < count.value) {
        focusCell(cursor);
    }
}

function mutation(v: string, index: number) {
    if (v.length > 1) {
        applyChars(index, v);
        return;
    }

    const next = acceptChar(v);

    if (props.numbersOnly && v && !next) {
        // Набрали разделитель из маски после заполненной группы: переходим в следующую ячейку
        if (layout.value && numbers.value[index] && v === separatorAfter(layout.value, index) && index + 1 < count.value) {
            const el = inputRefs.value[index];
            if (el) {
                el.value = numbers.value[index] ?? '';
            }
            focusCell(index + 1);
            return;
        }
        const el = inputRefs.value[index];
        if (el) {
            el.value = numbers.value[index] ?? '';
        }
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
    if (target < count.value) {
        focusCell(target);
    }
}

function onPaste(event: ClipboardEvent, index: number) {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!text) {
        return;
    }

    event.preventDefault();
    applyChars(index, text, true);
}

function onFocus(index: number) {
    if (props.clearOn === 'input') {
        const firstEmpty = firstEmptyIndex();
        if (firstEmpty < count.value && index > firstEmpty) {
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
    () => [props.modelValue, count.value, props.numbersOnly] as const,
    () => {
        const next = cellsFromModel(props.modelValue ?? '');
        if (next.join('') !== numbers.value.join('') || next.length !== numbers.value.length) {
            numbers.value = next;
        }
    },
    { immediate: true },
);

warnDeprecated('TaoPinCode', {
    hidden: 'use `masked`',
});
</script>

<template>
    <div
        class="tao-pin-code"
        :class="[sizeClass(size), { 'tao-pin-code--disabled': disabled }]"
        role="group"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedBy"
    >
        <template v-for="(num, index) of numbers" :key="index">
            <span v-if="layout?.before[index]" class="tao-pin-code__separator" aria-hidden="true">{{ layout.before[index] }}</span>
            <input
                :id="index === 0 ? controlId : undefined"
                :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
                class="tao-pin-code__value"
                :class="{
                    'tao-pin-code__value--active': activeNumber === index,
                    'tao-pin-code__value--invalid': invalid,
                }"
                :value="num"
                :placeholder="placeholder"
                :type="isMasked ? 'password' : 'text'"
                :disabled="disabled"
                :aria-invalid="invalid || undefined"
                :inputmode="numbersOnly ? 'numeric' : 'text'"
                :pattern="numbersOnly ? '[0-9]' : undefined"
                autocomplete="one-time-code"
                :maxlength="index === 0 ? count : 1"
                @input="onChange($event, index)"
                @paste="onPaste($event, index)"
                @keydown="onKeydown($event, index)"
                @focus="onFocus(index)"
                @blur="onBlur"
            />
        </template>
        <span v-if="layout?.after" class="tao-pin-code__separator" aria-hidden="true">{{ layout.after }}</span>
    </div>
</template>

<style scoped>
.tao-pin-code {
    display: inline-flex;
    align-items: center;
    user-select: none;
}

.tao-pin-code__separator {
    padding: 0 2px;
    color: var(--tao-color-text-muted);
    font-size: calc((var(--tao-control-height) + 20px) * 0.375);
    font-weight: 500;
    white-space: pre;
}

.tao-pin-code__value {
    /* 50 × 56, 21px at medium / 50 × 56, 21px в medium */
    --tao-pin-code-height: calc(var(--tao-control-height) + 20px);
    width: calc(var(--tao-pin-code-height) - 6px);
    height: var(--tao-pin-code-height);
    margin: 2px;
    border: 3px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-md);
    font-size: calc(var(--tao-pin-code-height) * 0.375);
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

.tao-pin-code--disabled {
    opacity: 0.6;
}

.tao-pin-code__value:disabled {
    cursor: not-allowed;
}
</style>
