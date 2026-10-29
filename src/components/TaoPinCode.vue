<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useField } from '../formField';
import { useLocaleText, formatText } from '../locale';
import { localeEn } from '../locale/en';
import { sizeClass, type TaoSize } from '../size';
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
        /**
         * The result of the check, set by the app: `error` shakes the cells and paints them red, `success` runs a soft
         * glow over them and paints them green; a screen reader hears it too. Set `idle` again when the user edits.
         * Результат проверки, его ставит приложение: `error` встряхивает ячейки и красит красным, `success` проводит по
         * ним мягкое свечение и красит зелёным; скринридер тоже слышит. Верните `idle`, когда пользователь правит код.
         */
        status?: 'idle' | 'success' | 'error';
        successText?: string;
        errorText?: string;
    }>(),
    {
        masked: false,
        placeholder: '',
        disabled: false,
        error: false,
        modelValue: '',
        numbersOnly: false,
        clearOn: 'focus',
        status: 'idle',
        successText: undefined,
        errorText: undefined,
    },
);
const l10n = useLocaleText(props, 'pinCode');

const emit = defineEmits<{
    'update:modelValue': [value: string];
    change: [value: string];
    complete: [value: string];
    active: [el: HTMLInputElement | null, index: number];
    blur: [];
}>();

const { field, controlId, invalid: fieldInvalid, describedBy } = useField(props);
const invalid = computed(() => fieldInvalid.value || props.status === 'error');

// The animation runs on every change of the status (and on play()): the class goes off for a frame and on again.
// Анимация на каждую смену статуса (и на play()): класс снимается на кадр и ставится снова.
const playing = ref<'success' | 'error' | null>(null);

function play() {
    if (props.status === 'idle') {
        return;
    }
    playing.value = null;
    void nextTick(() => {
        requestAnimationFrame(() => {
            playing.value = props.status === 'idle' ? null : props.status;
        });
    });
}

watch(
    () => props.status,
    (status) => (status === 'idle' ? (playing.value = null) : play()),
);

defineExpose({
    /** Plays the status animation again (a second wrong code). / Проигрывает анимацию статуса ещё раз. */
    play,
});
const isMasked = computed(() => props.masked);

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
</script>

<template>
    <div
        class="tao-pin-code"
        :class="[
            sizeClass(size),
            {
                'tao-pin-code--disabled': disabled,
                'tao-pin-code--success': status === 'success',
                'tao-pin-code--shake': playing === 'error',
                'tao-pin-code--glow': playing === 'success',
            },
        ]"
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
                :style="{ '--_i': index }"
                :value="num"
                :placeholder="placeholder"
                :type="isMasked ? 'password' : 'text'"
                :disabled="disabled"
                :aria-invalid="invalid || undefined"
                :inputmode="numbersOnly ? 'numeric' : 'text'"
                :pattern="numbersOnly ? '[0-9]' : undefined"
                autocomplete="one-time-code"
                :aria-label="formatText(l10n.cellLabel ?? localeEn.pinCode.cellLabel!, { n: index + 1, count: numbers.length })"
                :maxlength="index === 0 ? count : 1"
                @input="onChange($event, index)"
                @paste="onPaste($event, index)"
                @keydown="onKeydown($event, index)"
                @focus="onFocus(index)"
                @blur="onBlur"
            />
        </template>
        <span v-if="layout?.after" class="tao-pin-code__separator" aria-hidden="true">{{ layout.after }}</span>
        <!-- the result in words, not only in colour / результат словами, а не только цветом -->
        <span class="tao-sr-only" role="status">{{ status === 'success' ? l10n.successText : status === 'error' ? l10n.errorText : '' }}</span>
    </div>
</template>

<style scoped>
.tao-pin-code {
    /* holds its hidden status: an absolute one with no positioned parent lands against the page and stretches a
       scrolling container's document / держит скрытый статус: без позиционированного родителя оно встаёт от страницы
       и растягивает документ прокручиваемого контейнера */
    position: relative;
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

.tao-pin-code--success .tao-pin-code__value {
    border-color: var(--tao-color-success);
    color: var(--tao-color-success-text);
}

/* error: the whole group shakes once / ошибка: вся группа вздрагивает один раз */
.tao-pin-code--shake {
    animation: tao-pin-shake 420ms var(--tao-ease-base);
}

@keyframes tao-pin-shake {
    0%,
    100% {
        transform: translateX(0);
    }
    20% {
        transform: translateX(-7px);
    }
    40% {
        transform: translateX(6px);
    }
    60% {
        transform: translateX(-4px);
    }
    80% {
        transform: translateX(2px);
    }
}

/* success: a soft glow runs over the cells from the left / успех: мягкое свечение бежит по ячейкам слева */
.tao-pin-code--glow .tao-pin-code__value {
    animation: tao-pin-glow 700ms var(--tao-ease-base) calc(var(--_i) * 60ms) both;
}

@keyframes tao-pin-glow {
    0% {
        box-shadow: 0 0 0 0 color-mix(in srgb, var(--tao-color-success) 55%, transparent);
        transform: scale(1);
    }
    35% {
        transform: scale(1.06);
    }
    100% {
        box-shadow: 0 0 0 10px color-mix(in srgb, var(--tao-color-success) 0%, transparent);
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .tao-pin-code--shake,
    .tao-pin-code--glow .tao-pin-code__value {
        animation: none;
    }
}

.tao-pin-code--disabled {
    opacity: 0.6;
}

.tao-pin-code__value:disabled {
    cursor: not-allowed;
}
</style>
