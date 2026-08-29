<script lang="ts" setup>
import { ref, watch } from 'vue';

interface Props {
    length: number;
    hidden?: boolean;
    placeholder?: string;
    modelValue: string;
    /** Разрешать вводить только цифры 0-9, всё остальное отбрасывается на лету */
    numbersOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    hidden: false,
    placeholder: '',
    numbersOnly: false,
});

const emit = defineEmits(['update:modelValue', 'change', 'active', 'blur']);

let lastPinCode = NaN;

const numbers = ref<string[]>([]);
const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const activeNumber = ref(-1);

function emitChange() {
    const s = numbers.value.map((e) => (e ? e : '0')).join('');
    const curPinCode = parseFloat(s);

    if (lastPinCode !== curPinCode) {
        lastPinCode = curPinCode;
        emit('change', curPinCode);
    }

    emit('update:modelValue', s);
}

function emitBlur() {
    activeNumber.value = -1;
    emit('blur');
}

function init() {
    numbers.value = [...Array(props.length)].map(() => '');
    inputRefs.value = [];
    activeNumber.value = -1;
}

function mutation(v: string, index: number) {
    numbers.value = [...numbers.value];

    if (v.length > 1) {
        v = v[v.length - 1] ?? '';
    }

    if (props.numbersOnly && v && !/^[0-9]$/.test(v)) {
        // символ не цифра — не принимаем, оставляем поле как было
        numbers.value[index] = numbers.value[index] ?? '';
        return;
    }

    numbers.value[index] = v;

    const getNextIdx = () => {
        if (numbers.value.length >= index + 1) {
            return numbers.value.findIndex((e) => e === '');
        }
        return index + 1;
    };

    const nextIndex = getNextIdx();

    if (nextIndex !== -1 && !numbers.value[nextIndex]) {
        const el = inputRefs.value[nextIndex];
        if (el) {
            el.focus();
        } else {
            inputRefs.value[index]?.blur();
            emitBlur();
        }
    } else {
        inputRefs.value[index]?.blur();
        emitBlur();
    }

    emitChange();
}

function onFocus(index: number) {
    numbers.value = [...numbers.value];
    numbers.value[index] = '';

    activeNumber.value = index;

    emitChange();
    emit('active', inputRefs.value[index], index);
}

function onChange(e: Event, index: number) {
    const v = (e.target as HTMLInputElement).value;
    mutation(v, index);
}

function onKeydown(event: KeyboardEvent, index: number) {
    if (event.key !== 'Backspace') {
        return;
    }

    // Если в текущем поле уже пусто — Backspace не с чего стирать здесь,
    // поэтому переходим на предыдущее поле и стираем его тоже. Так
    // backspace ведёт себя как в большинстве нативных pin-code вводов
    // (SMS-коды и т.п.): удерживая клавишу, можно стереть весь код.
    if (!numbers.value[index] && index > 0) {
        event.preventDefault();

        numbers.value = [...numbers.value];
        numbers.value[index - 1] = '';

        const prevEl = inputRefs.value[index - 1];
        prevEl?.focus();
        activeNumber.value = index - 1;

        emitChange();
    }
}

watch(() => props.modelValue, (v: string) => {
    if (!v.length) {
        init();
        emitChange();
    }
});

init();
</script>

<template>
    <div class="tao-pin-code">
        <input
            v-for="(num, index) of numbers"
            :key="index"
            :ref="(el) => (inputRefs[index] = el as HTMLInputElement)"
            class="tao-pin-code__value"
            :class="{ 'tao-pin-code__value--active': activeNumber === index }"
            :value="num"
            :placeholder="placeholder"
            :type="hidden ? 'password' : 'text'"
            :inputmode="numbersOnly ? 'numeric' : 'text'"
            :pattern="numbersOnly ? '[0-9]' : undefined"
            maxlength="1"
            @input="onChange($event, index)"
            @keydown="onKeydown($event, index)"
            @focus="onFocus(index)"
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

.tao-pin-code__value--active {
    border-color: var(--tao-color-accent);
}
</style>
