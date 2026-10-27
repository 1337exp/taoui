<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoTextarea' });

type TaoTextareaVariant = 'bar' | 'outline' | 'filled' | 'plain';

const props = withDefaults(
    defineProps<{
        placeholder?: string;
        spellcheck?: boolean;
        autocomplete?: string;
        minlength?: number;
        maxlength?: number;
        disabled?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /**
         * `bar` — accent bar on the left, `outline` — frame like TaoInput, `filled` — fill only, `plain` — no frame, no fill.
         * `bar` — полоса слева, `outline` — рамка как у TaoInput, `filled` — только заливка, `plain` — без рамки и заливки.
         */
        variant?: TaoTextareaVariant;
        /** Text can be read and selected, not edited. / Текст читается и выделяется, но не правится. */
        readonly?: boolean;
        /** Spaces are not entered: neither typed nor pasted. / Пробелы не вводятся — ни с клавиатуры, ни вставкой. */
        noSpace?: boolean;
        rows?: number;
        resize?: boolean;
        modelValue?: string;
        /** Focus on mount. / Фокус при монтировании. */
        autofocus?: boolean;
        /** Text alignment. / Выравнивание текста. */
        align?: 'start' | 'center' | 'end';
        /**
         * Enter leaves the field instead of a new line (Shift+Enter still breaks the line); `keydown` is emitted first.
         * Enter снимает фокус вместо переноса (Shift+Enter переносит); `keydown` уходит раньше.
         */
        blurOnEnter?: boolean;
        error?: boolean;
        id?: string;
        /** Показать «введено / максимум» под полем. Имеет смысл вместе с `maxlength`. */
        count?: boolean;
    }>(),
    {
        placeholder: '',
        variant: 'bar',
        spellcheck: true,
        autocomplete: '',
        minlength: 0,
        maxlength: undefined,
        disabled: false,
        readonly: false,
        noSpace: false,
        rows: 3,
        resize: true,
        modelValue: '',
        autofocus: false,
        align: 'start',
        blurOnEnter: false,
        error: false,
        count: false,
    },
);

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur', 'keydown']);

const { field, controlId, invalid } = useField(props);
const counterId = computed(() => `${controlId.value}-count`);
const alignClass = computed(() => (props.align === 'start' ? undefined : `tao-textarea--align-${props.align}`));
const variantClasses = computed(() => `tao-textarea--${props.variant}`);
const describedBy = computed(() => {
    const ids = [field?.describedBy.value, props.count ? counterId.value : undefined].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});

const currentLength = computed(() => String(props.modelValue ?? '').length);
const countLabel = computed(() => {
    if (props.maxlength != null && props.maxlength > 0) {
        return `${currentLength.value} / ${props.maxlength}`;
    }
    return String(currentLength.value);
});
const atLimit = computed(
    () => props.maxlength != null && props.maxlength > 0 && currentLength.value >= props.maxlength,
);

const textareaRef = ref<HTMLTextAreaElement | null>(null);

function onInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    let value = target.value;

    // Keydown stops typed spaces; paste and autocorrect get here. / Keydown ловит набор, вставка доходит сюда.
    if (props.noSpace && value.includes(' ')) {
        const caret = target.selectionStart ?? value.length;
        const nextCaret = value.slice(0, caret).replace(/ /g, '').length;
        value = value.replace(/ /g, '');
        target.value = value;
        target.setSelectionRange(nextCaret, nextCaret);
    }

    emit('update:modelValue', value);
    autoResize();
}

function onChange(e: Event) {
    emit('change', (e.target as HTMLTextAreaElement).value);
}

function onFocus(e: FocusEvent) {
    emit('focus', e);
}

function onBlur(e: FocusEvent) {
    emit('blur', e);
}

function onKeydown(event: KeyboardEvent) {
    emit('keydown', event);

    if (props.blurOnEnter && event.key === 'Enter' && !event.shiftKey) {
        textareaRef.value?.blur();
        event.preventDefault();
        return;
    }

    if (props.noSpace && event.key === ' ') {
        event.preventDefault();
    }
}

function autoResize() {
    const textarea = textareaRef.value;
    if (!textarea) {
        return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 500)}px`;
}

watch(
    () => props.modelValue,
    () => {
        nextTick(autoResize);
    },
);

onMounted(() => {
    if (props.autofocus) {
        textareaRef.value?.focus();
    }
    nextTick(autoResize);
});
</script>

<template>
    <div class="tao-textarea-wrap" :class="sizeClass(size)">
        <textarea
            :id="controlId"
            ref="textareaRef"
            class="tao-textarea"
            :class="[
                variantClasses,
                alignClass,
                {
                    'tao-textarea--no-resize': !resize,
                    'tao-textarea--invalid': invalid,
                },
            ]"
            :placeholder="placeholder"
            :spellcheck="spellcheck"
            :autocomplete="autocomplete"
            :minlength="minlength"
            :maxlength="maxlength"
            :disabled="disabled"
            :readonly="readonly"
            :rows="rows"
            :value="modelValue"
            :aria-invalid="invalid || undefined"
            :aria-describedby="describedBy"
            draggable="false"
            @input="onInput"
            @change="onChange"
            @focus="onFocus"
            @blur="onBlur"
            @keydown="onKeydown"
        ></textarea>
        <span
            v-if="count"
            :id="counterId"
            class="tao-textarea__count"
            :class="{ 'tao-textarea__count--limit': atLimit }"
        >{{ countLabel }}</span>
    </div>
</template>

<style scoped>
.tao-textarea-wrap {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    width: 100%;
}

.tao-textarea {
    width: 100%;
    min-height: var(--tao-control-height);
    height: auto;
    padding: var(--tao-control-padding-y);
    font-size: var(--tao-control-font-size-secondary);
    font-family: var(--tao-font-family);
    letter-spacing: 0.01rem;
    line-height: 1.4;
    border: none;
    border-radius: var(--tao-radius-sm);
    background-color: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    outline: none;
    resize: vertical;
    transition: var(--tao-transition-base);
}

.tao-textarea::placeholder {
    color: var(--tao-color-input-placeholder);
}

/* ---------- Variants / Варианты (before states, so state colors win / до состояний, чтобы цвета состояний побеждали) */
.tao-textarea--bar {
    border-left: 4px solid var(--tao-color-border-strong);
}

/* Same frame, text and padding as TaoInput / Та же рамка, текст и отступы, что у TaoInput */
.tao-textarea--outline {
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    font-size: var(--tao-control-font-size);
}

.tao-textarea--plain {
    background-color: transparent;
}

/* ---------- States / Состояния */
.tao-textarea:focus {
    border-color: var(--tao-color-accent);
}

.tao-textarea--outline:focus {
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-textarea--invalid {
    border-color: var(--tao-color-danger);
}

.tao-textarea--outline.tao-textarea--invalid:focus {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-textarea[readonly] {
    cursor: default;
}

.tao-textarea--align-center {
    text-align: center;
}

.tao-textarea--align-end {
    text-align: end;
}

.tao-textarea--no-resize {
    resize: none;
}

.tao-textarea__count {
    align-self: flex-end;
    font-size: var(--tao-font-size-xs);
    line-height: 1;
    color: var(--tao-color-text-muted);
    font-variant-numeric: tabular-nums;
    user-select: none;
}

.tao-textarea__count--limit {
    color: var(--tao-color-danger-text);
}
</style>
