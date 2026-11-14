<script lang="ts" setup>
import { computed } from 'vue';
import { useControlAttrs } from '../controlAttrs';
import { normalizeHex, type ColorMode } from '../color';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import type { TaoPlacement } from '../floating';
import TaoColorPicker from './TaoColorPicker.vue';
import TaoPopover from './TaoPopover.vue';

defineOptions({ name: 'TaoColorInput', inheritAttrs: false });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

// Поле цвета: образец и hex на кнопке, по нажатию открывается палитра (TaoColorPicker) во всплывающем окне.
const props = withDefaults(
    defineProps<{
        /** Color as a hex string. / Цвет строкой hex. */
        modelValue: string;
        /** The opacity strip and `#rrggbbaa`. / Полоса прозрачности и `#rrggbbaa`. */
        alpha?: boolean;
        swatches?: readonly string[];
        /** Ways to enter the colour in the popover (HEX, RGB, HSL). / Способы ввода цвета в окне (HEX, RGB, HSL). */
        modes?: readonly ColorMode[];
        /** The current mode (`v-model:mode` remembers the choice). / Текущий способ ввода (`v-model:mode` запоминает выбор). */
        mode?: ColorMode;
        eyedropper?: boolean;
        disabled?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        error?: boolean;
        placement?: TaoPlacement;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        chooseLabel?: string;
        /** What the field says while the value is empty (an optional colour that is not set). / Что говорит поле, пока значение пустое (необязательный цвет не задан). */
        placeholder?: string;
        /** The colour can be taken away again: a Clear button under the palette, and Delete / Backspace on the field. Gives `''`. / Цвет можно убрать: кнопка «Очистить» под палитрой и Delete / Backspace на поле. Отдаёт `''`. */
        clearable?: boolean;
        /** Text of the clear button. / Текст кнопки очистки. */
        clearText?: string;
    }>(),
    { alpha: false, modes: () => ['hex', 'rgb', 'hsl'], eyedropper: true, disabled: false, error: false, placement: 'bottom-start', clearable: false },
);

const emit = defineEmits<{
    'update:modelValue': [hex: string];
    'update:mode': [mode: ColorMode];
    change: [hex: string];
}>();

const l10n = useLocaleText(props, 'colorPicker');
const shown = computed(() => normalizeHex(props.modelValue, props.alpha) ?? props.modelValue);
// «Background: #ff8800» when the app names the field, «Choose a colour: #ff8800» when it does not
// «Фон: #ff8800», если приложение назвало поле, иначе «Выбрать цвет: #ff8800»
// an empty value is a state, not a mistake: the field says it is not set, with a crossed-out swatch
// пустое значение — состояние, а не ошибка: поле говорит, что цвет не задан, а образец зачёркнут
const empty = computed(() => props.modelValue === '');
const text = computed(() => (empty.value ? l10n.value.placeholder : shown.value));
function clear() {
    emit('update:modelValue', '');
    emit('change', '');
}

function onKeydown(event: KeyboardEvent) {
    if ((event.key === 'Backspace' || event.key === 'Delete') && props.clearable && !empty.value && !props.disabled) {
        event.preventDefault();
        clear();
    }
}

const buttonLabel = (given: unknown) => `${typeof given === 'string' && given ? given : l10n.value.chooseLabel}: ${text.value}`;
</script>

<template>
    <TaoPopover v-bind="rootAttrs()" :placement="placement" :disabled="disabled" class="tao-color-input-root">
        <template #trigger="{ open }">
            <button
                v-bind="controlAttrs()"
                type="button"
                class="tao-color-input"
                :class="[sizeClass(size), { 'tao-color-input--open': open, 'tao-color-input--invalid': error }]"
                :disabled="disabled"
                :aria-label="buttonLabel($attrs['aria-label'])"
                aria-haspopup="dialog"
                :aria-expanded="open"
                @keydown="onKeydown"
            >
                <span class="tao-color-input__swatch" :class="{ 'tao-color-input__swatch--empty': empty }"><span :style="{ backgroundColor: shown }"></span></span>
                <span class="tao-color-input__text" :class="{ 'tao-color-input__text--empty': empty }">{{ text }}</span>
            </button>
        </template>

        <TaoColorPicker
            :model-value="modelValue"
            :alpha="alpha"
            :swatches="swatches"
            :modes="modes"
            :mode="mode"
            :eyedropper="eyedropper"
            :size="size"
            @update:model-value="emit('update:modelValue', $event)"
            @update:mode="emit('update:mode', $event)"
            @change="emit('change', $event)"
        />
        <button v-if="clearable" type="button" class="tao-color-input__clear" :disabled="empty" @click="clear">{{ l10n.clearText }}</button>
    </TaoPopover>
</template>

<style scoped>
.tao-color-input {
    display: inline-flex;
    align-items: center;
    gap: var(--tao-space-2);
    min-height: var(--tao-control-height);
    padding: 0 var(--tao-control-padding-x) 0 6px;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font: inherit;
    font-size: var(--tao-control-font-size);
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-color-input:hover:not(:disabled) {
    border-color: var(--tao-color-border-strong);
}

/* open is like focus: the accent / открытое как фокус: акцент */
.tao-color-input--open {
    border-color: var(--tao-color-accent);
}

.tao-color-input:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-color-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-color-input--invalid {
    border-color: var(--tao-color-danger);
}

.tao-color-input__swatch {
    flex: none;
    width: calc(var(--tao-control-height) - 12px);
    height: calc(var(--tao-control-height) - 12px);
    overflow: hidden;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    background: repeating-conic-gradient(var(--tao-color-surface-hover) 0% 25%, var(--tao-color-surface-sunken) 0% 50%) 50% / 8px 8px;
}

.tao-color-input__swatch > span {
    display: block;
    width: 100%;
    height: 100%;
}

.tao-color-input__text {
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
}

/* the clear row, as in Select: a divider and a full-width row at the foot of the panel; it is always there, and disabled while there is
   nothing to clear, so nobody has to guess that it exists. The negative margins take the padding of the panel back.
   строка очистки, как у Select: разделитель и строка на всю ширину внизу окна; она есть всегда, а пока очищать нечего — неактивна,
   чтобы не гадать, что она существует. Отрицательные отступы забирают padding окна обратно. */
.tao-color-input__clear {
    display: block;
    box-sizing: border-box;
    width: calc(100% + var(--tao-space-3) * 2);
    margin: var(--tao-space-3) calc(var(--tao-space-3) * -1) calc(var(--tao-space-3) * -1);
    padding: var(--tao-control-padding-y) var(--tao-control-padding-x);
    border: none;
    border-top: 1px solid var(--tao-color-border);
    background: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    text-align: start;
    cursor: pointer;
}

.tao-color-input__clear:hover:not(:disabled) {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-hover);
}

.tao-color-input__clear:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-color-input__clear:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* not set: a muted sentence, and a slash over the swatch / не задан: приглушённая фраза и косая черта поверх образца */
.tao-color-input__text--empty {
    color: var(--tao-color-text-muted);
    text-transform: none;
}

.tao-color-input__swatch--empty {
    background:
        linear-gradient(to top right, transparent calc(50% - 1px), var(--tao-color-text-muted) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)),
        var(--tao-color-input-bg);
}
</style>
