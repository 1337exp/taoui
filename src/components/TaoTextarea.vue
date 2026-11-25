<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { nativeFieldAttrs, useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoTextarea', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoTextarea', { error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

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
        /** Spaces are not entered: neither typed nor pasted. / Пробелы не вводятся — ни с клавиатуры, ни вставкой. */
        noSpace?: boolean;
        rows?: number;
        /**
         * How tall the field grows with its text before it scrolls: a number is px, a string any CSS length (`50vh`,
         * `20rem`), `none` — no limit. Dragging the corner stops there too.
         * До какой высоты поле растёт с текстом, прежде чем прокручиваться: число — px, строка — любая длина CSS
         * (`50vh`, `20rem`), `none` — без предела. Растягивание за угол тоже останавливается на ней.
         */
        maxHeight?: number | string;
        resize?: boolean;
        /** Text alignment. / Выравнивание текста. */
        align?: 'start' | 'center' | 'end';
        /**
         * Enter leaves the field instead of a new line (Shift+Enter still breaks the line); `keydown` is emitted first.
         * Enter снимает фокус вместо переноса (Shift+Enter переносит); `keydown` уходит раньше.
         */
        blurOnEnter?: boolean;
        /** The id of the control, which the label of a `TaoFormField` points at. / id элемента: на него указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the value goes into `FormData` and a native submit. / Имя в форме: значение попадает в `FormData` и нативную отправку. */
        name?: string;
        /** The field must be filled in (native `required`). / Поле обязательно (нативный `required`). */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        /** The value can be looked at, selected and sent, not changed. / Значение можно смотреть, выделять и отправлять, но не менять. */
        readOnly?: boolean;
        invalid?: boolean;
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
        readOnly: false,
        noSpace: false,
        rows: 3,
        maxHeight: 500,
        resize: true,
        autofocus: false,
        align: 'start',
        blurOnEnter: false,
        invalid: false,
        count: false,
    },
);

const model = defineModel<string>({ default: '' });

const emit = defineEmits<{
    /** The edit is finished: the field lost the focus with a text that changed (the native `change`). / Правка закончена: поле потеряло фокус с изменённым текстом (нативный `change`). */
    commit: [value: string];
    focus: [event: FocusEvent];
    blur: [event: FocusEvent];
    keydown: [event: KeyboardEvent];
}>();

const { field, controlId, isInvalid } = useField(props);
const counterId = computed(() => `${controlId.value}-count`);
const alignClass = computed(() => (props.align === 'start' ? undefined : `tao-textarea--align-${props.align}`));
const variantClasses = computed(() => `tao-textarea--${props.variant}`);
const describedBy = computed(() => {
    const ids = [field?.describedBy.value, props.count ? counterId.value : undefined].filter(Boolean);
    return ids.length ? ids.join(' ') : undefined;
});

const currentLength = computed(() => String(model.value ?? '').length);
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

    model.value = value;
    autoResize();
}

function onChange(e: Event) {
    emit('commit', (e.target as HTMLTextAreaElement).value);
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

    // the height follows the text; max-height (from maxHeight) stops it, then the field scrolls. The borders are added:
    // scrollHeight has none, and a framed field would scroll by 2px
    // высота идёт за текстом; max-height (из maxHeight) её останавливает, дальше поле прокручивается. Рамки
    // добавляются: в scrollHeight их нет, и поле с рамкой прокручивалось бы на 2px
    textarea.style.height = 'auto';
    const borders = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
}

const maxHeightCss = computed(() => (typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight));

watch(
    () => model.value,
    () => {
        nextTick(autoResize);
    },
);

let resizeObserver: ResizeObserver | undefined;
let lastWidth = -1;
let frame = 0;

onMounted(() => {
    if (props.autofocus) {
        textareaRef.value?.focus();
    }
    nextTick(autoResize);

    // The height depends on the width too (wrapping): measure again when the width changes. Our own height write
    // changes only the height, so entries without a new width are ignored (no loop). No ResizeObserver (SSR, tests): skip.
    // Высота зависит и от ширины (перенос строк): меряем заново, когда меняется ширина. Наша запись высоты меняет
    // только высоту, поэтому записи без новой ширины игнорируются (без петли). Нет ResizeObserver (SSR, тесты): пропускаем.
    const textarea = textareaRef.value;
    if (textarea && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
            const width = entries[entries.length - 1]?.contentRect.width ?? textarea.offsetWidth;
            if (width === lastWidth) {
                return;
            }
            lastWidth = width;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(autoResize);
        });
        resizeObserver.observe(textarea);
    }
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    resizeObserver?.disconnect();
    resizeObserver = undefined;
});
</script>

<template>
    <div v-bind="rootAttrs()" class="tao-textarea-wrap" :class="sizeClass(size)">
        <textarea
            v-bind="{ ...controlAttrs(), ...nativeFieldAttrs(props) }"
            :id="controlId"
            ref="textareaRef"
            class="tao-textarea"
            :class="[
                variantClasses,
                alignClass,
                {
                    'tao-textarea--no-resize': !resize,
                    'tao-textarea--invalid': isInvalid,
                },
            ]"
            :placeholder="placeholder"
            :spellcheck="spellcheck"
            :autocomplete="autocomplete"
            :minlength="minlength"
            :maxlength="maxlength"
            :disabled="disabled"
            :readonly="readOnly || undefined"
            :rows="rows"
            :style="{ maxHeight: maxHeightCss }"
            :value="model"
            :aria-invalid="isInvalid || undefined"
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
