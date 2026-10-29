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
    }>(),
    { alpha: false, modes: () => ['hex', 'rgb', 'hsl'], eyedropper: true, disabled: false, error: false, placement: 'bottom-start' },
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
const buttonLabel = (given: unknown) => `${typeof given === 'string' && given ? given : l10n.value.chooseLabel}: ${shown.value}`;
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
            >
                <span class="tao-color-input__swatch"><span :style="{ backgroundColor: shown }"></span></span>
                <span class="tao-color-input__text">{{ shown }}</span>
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

.tao-color-input:hover:not(:disabled),
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
</style>
