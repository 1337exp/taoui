<script lang="ts" setup>
import { computed, provide, useId } from 'vue';
import { formFieldKey } from '../formField';
import { sizeClass, type TaoSize } from '../size';

defineOptions({ name: 'TaoProp' });

// A property of a thing, the row of an inspector: the caption on the left, the control on the right, a hint or an error under the
// control. It wires the label to the control as `TaoFormField` does (`id`, `aria-describedby`, `aria-invalid`), so the same fields
// work in it; `TaoFormField` is the vertical form, this is the dense one.
// Свойство вещи, строка инспектора: подпись слева, контрол справа, подсказка или ошибка под контролом. Подпись связывается с
// контролом так же, как у `TaoFormField` (`id`, `aria-describedby`, `aria-invalid`), поэтому те же поля работают в ней;
// `TaoFormField` — вертикальная форма, это — плотная.
const props = defineProps<{
    /** The caption. It names the control for a screen reader. / Подпись. Она же называет контрол для скринридера. */
    label: string;
    /** A quiet line under the control. / Тихая строка под контролом. */
    hint?: string;
    /** The message; with it the control is `invalid`. / Сообщение; с ним контрол `invalid`. */
    error?: string;
    /** Size of the control inside. / Размер контрола внутри. */
    size?: TaoSize;
    /** The width of the caption column: a number is px, a string any CSS length. Default `7.5rem`, or the variable `--tao-prop-label-width`. / Ширина колонки подписи: число — px, строка — любая длина CSS. */
    labelWidth?: number | string;
}>();

defineSlots<{
    /** The control (or several: a row of `x y w h`). / Контрол (или несколько: ряд `x y w h`). */
    default(): unknown;
    /** The caption itself, instead of `label` (an icon, a mark). The name for a screen reader is still `label`. / Сама подпись вместо `label`. */
    caption?(): unknown;
}>();

const id = useId();
const hintId = `${id}-hint`;
const errorId = `${id}-error`;
const labelId = `${id}-label`;
const invalid = computed(() => Boolean(props.error));
const describedBy = computed(() => (props.error ? errorId : props.hint ? hintId : undefined));

provide(formFieldKey, { id, invalid, describedBy, labelId: computed(() => labelId) });

const style = computed(() =>
    props.labelWidth === undefined ? undefined : { '--_label-width': typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth },
);

function onLabelClick() {
    const target = document.getElementById(id);
    if (target instanceof HTMLInputElement || target instanceof HTMLButtonElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) {
        return;
    }
    document
        .getElementById(labelId)
        ?.parentElement?.querySelector<HTMLElement>('input:not([disabled]), button:not([disabled]), textarea:not([disabled]), select:not([disabled])')
        ?.focus();
}
</script>

<template>
    <div class="tao-prop" :class="[sizeClass(size), { 'tao-prop--invalid': invalid }]" :style="style">
        <label :id="labelId" class="tao-prop__label" :for="id" :title="label" @click="onLabelClick">
            <slot name="caption">{{ label }}</slot>
        </label>
        <div class="tao-prop__control"><slot /></div>
        <p v-if="error" :id="errorId" class="tao-prop__note tao-prop__note--error">{{ error }}</p>
        <p v-else-if="hint" :id="hintId" class="tao-prop__note">{{ hint }}</p>
    </div>
</template>

<style scoped>
.tao-prop {
    display: grid;
    grid-template-columns: var(--_label-width, var(--tao-prop-label-width, 7.5rem)) minmax(0, 1fr);
    align-items: center;
    column-gap: var(--tao-space-3);
    row-gap: var(--tao-space-1);
    width: 100%;
    min-height: var(--tao-control-height);
}

/* a long caption is cut, not wrapped: the rows of an inspector keep one height, the whole text is the title */
/* длинная подпись обрезается, а не переносится: у строк инспектора одна высота, весь текст — в title */
.tao-prop__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--tao-font-size-sm);
    color: var(--tao-color-text-muted);
    font-weight: 500;
}

.tao-prop__control {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    min-width: 0;
}

.tao-prop__control > :deep(*) {
    min-width: 0;
}

.tao-prop__note {
    grid-column: 2;
    margin: 0;
    font-size: var(--tao-font-size-xs);
    color: var(--tao-color-text-muted);
}

.tao-prop__note--error {
    color: var(--tao-color-danger-text);
}
</style>
