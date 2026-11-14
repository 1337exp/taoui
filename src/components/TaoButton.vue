<script lang="ts" setup>
import { computed, useAttrs, useSlots } from 'vue';
import { devWarning } from '../deprecate';
import { sizeClass, type TaoSize } from '../size';
import { slotHasContent } from '../slots';
import { toneClass, type TaoToneName } from '../tone';
import TaoIcon from './TaoIcon.vue';
import TaoKbd from './TaoKbd.vue';
import TaoLoader from './TaoLoader.vue';

defineOptions({ name: 'TaoButton' });

interface Props {
    type?: 'button' | 'submit' | 'reset';
    /** Without it the button takes the size of its ancestors (medium by default). / Без него — размер предков (по умолчанию medium). */
    size?: TaoSize;
    variant?: 'primary' | 'secondary' | 'ghost' | 'text';
    /** Colour of the button, on any `variant`: `danger` / `success` / `warning` / `info` / `neutral`; without it the theme accent. / Цвет кнопки на любом `variant`; без него — акцент темы. */
    tone?: TaoToneName;
    disabled?: boolean;
    loading?: boolean;
    block?: boolean;
    /** Icon before the text: a name for TaoIcon (`tao-plus`, a registered or font icon). Without text the button is a square. / Иконка перед текстом: имя для TaoIcon. Без текста кнопка квадратная. */
    icon?: string;
    /** Icon after the text. / Иконка после текста. */
    iconEnd?: string;
    /** Minimum width (number = px). Same as the `--tao-button-min-width` variable. / Минимальная ширина (число = px). То же, что переменная `--tao-button-min-width`. */
    minWidth?: number | string;
    /**
     * A toggle button (Bold, Italic, a filter): `v-model:pressed`. With it the button says `aria-pressed` and shows its
     * state; without it the button is an ordinary one.
     * Кнопка-переключатель (Жирный, Курсив, фильтр): `v-model:pressed`. С ним кнопка говорит `aria-pressed` и показывает
     * своё состояние; без него — обычная кнопка.
     */
    pressed?: boolean;
    /**
     * The key that does the same, shown at the end of the button (`N`, `Ctrl+K`) and given as `aria-keyshortcuts`.
     * On an icon-only button it is not printed (there is no room in the square): it goes to the tooltip, `Bold (Ctrl+B)`.
     * It only shows the key: listening to it is the app's job.
     * Клавиша, которая делает то же, — в конце кнопки (`N`, `Ctrl+K`) и в `aria-keyshortcuts`. На кнопке только с иконкой
     * не печатается (в квадрате нет места): уходит в подсказку, `Жирный (Ctrl+B)`. Только показывает клавишу: слушать
     * её — дело приложения.
     */
    shortcut?: string;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'button',
    variant: 'primary',
    tone: undefined,
    disabled: false,
    loading: false,
    block: false,
    icon: '',
    iconEnd: '',
    minWidth: undefined,
    pressed: undefined,
    shortcut: undefined,
});

const minWidthStyle = computed(() =>
    props.minWidth === undefined
        ? undefined
        : { '--tao-button-min-width': typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth },
);

const emit = defineEmits<{
    click: [event: MouseEvent];
    'update:pressed': [value: boolean];
}>();

const slots = useSlots();
const attrs = useAttrs();
// no text, only an icon: a square of the control height, and it needs a name for screen readers
// The slot may be there and draw nothing (`<template v-if>`, an `<i v-if>`): that is no text either, so it is asked at render
// time what the slot draws, not whether it exists. / Слот может быть и ничего не рисовать: это тоже не текст.
const hasContent = () => slotHasContent(slots.default?.());
const isIconOnly = () => Boolean(props.icon || props.iconEnd) && !hasContent();
if (Boolean(props.icon || props.iconEnd) && !slots.default && !attrs['aria-label'] && !attrs['aria-labelledby'] && !attrs.title) {
    devWarning('button:icon-only', 'TaoButton: a button with only an icon needs aria-label (or aria-labelledby / title).');
}

// An icon-only button is a square: there is no room for the key printed in it, so the key goes to the native tooltip
// (`Bold (Ctrl+B)`) and stays in aria-keyshortcuts. A `title` of your own wins: attributes fall through over this one.
// Кнопка только с иконкой — квадрат: клавише внутри места нет, она уходит в нативную подсказку (`Жирный (Ctrl+B)`) и
// остаётся в aria-keyshortcuts. Свой `title` главнее: переданные атрибуты ложатся поверх этого.
function shortcutTitle(): string | undefined {
    if (!props.shortcut || !isIconOnly()) {
        return undefined;
    }
    const label = attrs['aria-label'];
    return typeof label === 'string' && label ? `${label} (${props.shortcut})` : props.shortcut;
}

function handleClick(event: MouseEvent) {
    if (!props.disabled && !props.loading) {
        emit('click', event);
        if (props.pressed !== undefined) {
            emit('update:pressed', !props.pressed);
        }
    }
}
</script>

<template>
    <button
        class="tao-button"
        :class="[
            sizeClass(size),
            toneClass(tone),
            `tao-button--${variant}`,
            {
                'tao-button--disabled': disabled,
                'tao-button--loading': loading,
                'tao-button--block': block,
                'tao-button--icon-only': isIconOnly(),
                'tao-button--toned': !!tone && tone !== 'accent',
                'tao-button--pressed': pressed === true,
            },
        ]"
        :style="minWidthStyle"
        :type="type"
        :aria-pressed="pressed === undefined ? undefined : pressed"
        :aria-keyshortcuts="shortcut || undefined"
        :title="shortcutTitle()"
        :aria-busy="loading || undefined"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <!-- the same ring as TaoLoader, in the text colour of the button; the button says it is busy by itself / то же кольцо, что у TaoLoader, цветом текста кнопки -->
        <TaoLoader v-if="loading" class="tao-button__loader" variant="ring" :size="16" color="currentColor" decorative />
        <TaoIcon v-if="icon" class="tao-button__icon" :name="icon" />
        <span v-if="hasContent()" class="tao-button__content"><slot /></span>
        <TaoIcon v-if="iconEnd" class="tao-button__icon" :name="iconEnd" />
        <!-- read once, as aria-keyshortcuts; not printed in an icon-only square (it is in the title) / читается один раз, как aria-keyshortcuts; в квадрате с одной иконкой не печатается (она в title) -->
        <TaoKbd v-if="shortcut && !isIconOnly()" class="tao-button__shortcut" aria-hidden="true">{{ shortcut }}</TaoKbd>
    </button>
</template>

<style scoped>
.tao-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-2);
    height: var(--tao-control-height);
    min-width: var(--tao-button-min-width, 0);
    padding: 0 var(--tao-button-padding-x);

    border: none;
    border-radius: var(--tao-radius-control);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--tao-control-font-size);
    font-weight: 500;
    transition: var(--tao-transition-base);
    position: relative;
    /* selecting the text around must not catch the button label / выделение текста вокруг не захватывает подпись кнопки */
    user-select: none;
}

.tao-button:active:not(.tao-button--text) {
    transform: translateY(1px);
}

.tao-button:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-button--primary {
    background-color: var(--tao-tone);
    color: var(--tao-tone-on);
    text-shadow: var(--tao-button-primary-text-shadow, none);
}

.tao-button--primary:hover:not(.tao-button--disabled) {
    background-color: var(--tao-tone-hover);
}

.tao-button--secondary {
    background-color: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    border: 1px solid var(--tao-color-border-strong);
}

.tao-button--secondary:hover:not(.tao-button--disabled) {
    background-color: var(--tao-color-hover);
    color: var(--tao-color-text-strong);
}

/* A toned secondary: the tone as text and frame, its tint under the pointer. / Secondary с тоном: цвет тона в тексте и рамке. */
.tao-button--secondary.tao-button--toned {
    color: var(--tao-tone-text);
    border-color: color-mix(in srgb, var(--tao-tone) 40%, transparent);
}

.tao-button--secondary.tao-button--toned:hover:not(.tao-button--disabled) {
    color: var(--tao-tone-text-hover);
    background-color: var(--tao-tone-subtle);
}

.tao-button--ghost,
.tao-button--text {
    background-color: transparent;
    color: var(--tao-tone-text);
}

.tao-button--ghost:hover:not(.tao-button--disabled),
.tao-button--text:hover:not(.tao-button--disabled) {
    color: var(--tao-tone-text-hover);
    background-color: var(--tao-tone-wash);
}

/* a pressed toggle: a wash of the tone's text colour behind that colour, on every variant but primary (already filled).
   Mixed from the text colour, not the subtle fill: the neutral subtle fill is too faint on a dark surface.
   нажатый переключатель: подложка из цвета текста тона под этим же цветом, на всех вариантах, кроме залитого primary.
   Смешиваем из цвета текста, а не из subtle: нейтральный subtle на тёмной поверхности почти не виден */
.tao-button--pressed:not(.tao-button--primary) {
    background-color: color-mix(in srgb, var(--tao-tone-text) 16%, transparent);
    color: var(--tao-tone-text);
}

.tao-button--pressed:not(.tao-button--primary):hover:not(.tao-button--disabled) {
    background-color: color-mix(in srgb, var(--tao-tone-text) 22%, transparent);
    color: var(--tao-tone-text);
}

.tao-button--text {
    height: auto;
    padding: 2px 4px;
}

.tao-button--disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.tao-button--block {
    width: 100%;
}

/* an icon-only button is a square of the control height / кнопка только с иконкой — квадрат высотой с контрол */
.tao-button--icon-only:not(.tao-button--text) {
    width: var(--tao-control-height);
    padding: 0;
}

.tao-button--loading .tao-button__content {
    opacity: 0;
}

.tao-button__loader {
    position: absolute;
}

/* the key at the end: in a wide button it goes to the far edge, the text stays at the start; its fill is the button's own
   text colour, so it fits any tone and variant; an even height on whole pixels keeps the letter centred
   клавиша в конце: в широкой кнопке уходит к дальнему краю, текст остаётся в начале; заливка из цвета текста кнопки,
   поэтому подходит к любому тону и варианту; чётная высота в целых пикселях держит букву по центру */
.tao-button__shortcut {
    min-width: round(up, calc(var(--tao-control-height) * 0.56), 2px);
    height: round(up, calc(var(--tao-control-height) * 0.56), 2px);
    margin-inline-start: auto;
    padding: 0.1em 0.4em 0; /* the letter a little lower: see TaoKbd */
    line-height: 1;
}

.tao-button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
