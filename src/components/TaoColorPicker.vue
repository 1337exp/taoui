<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue';
import { hslToRgb, hsvaToRgba, normalizeHex, parseColor, rgbaToHsva, rgbToHsl, toHex, type ColorMode, type Hsva } from '../color';
import { useLocaleText } from '../locale';
import { sizeClass, type TaoSize } from '../size';
import TaoInput from './TaoInput.vue';
import TaoInputNumber from './TaoInputNumber.vue';
import TaoSegmented from './TaoSegmented.vue';
import TaoSegmentedOption from './TaoSegmentedOption.vue';
import TaoSlider from './TaoSlider.vue';

defineOptions({ name: 'TaoColorPicker' });


// Палитра: квадрат насыщенности и яркости, полосы оттенка и прозрачности, поле hex, образцы и пипетка.
// Говорит строкой hex (`#rrggbb`, с `alpha` ещё и `#rrggbbaa`); числа и линейный цвет: `colorModel` рядом.
const props = withDefaults(
    defineProps<{
        /** Color as a hex string; also accepts anything `parseColor` reads. / Цвет строкой hex; понимает и всё, что читает `parseColor`. */
        modelValue: string;
        /** The opacity strip and `#rrggbbaa`. / Полоса прозрачности и `#rrggbbaa`. */
        alpha?: boolean;
        /** Ready colors under the picker. / Готовые цвета под палитрой. */
        swatches?: readonly string[];
        /** Ways to enter the colour; one mode hides the switch. / Способы ввода цвета; один способ скрывает переключатель. */
        modes?: readonly ColorMode[];
        /** The current mode (`v-model:mode` remembers the choice). / Текущий способ ввода (`v-model:mode` запоминает выбор). */
        mode?: ColorMode;
        /** The eyedropper button (only where the browser has `EyeDropper`). / Кнопка пипетки (только где браузер умеет `EyeDropper`). */
        eyedropper?: boolean;
        disabled?: boolean;
        /** Without it the size of ancestors. / Без него — размер предков. */
        size?: TaoSize;
        // Тексты: по умолчанию из локали, проп главнее
        areaLabel?: string;
        hueLabel?: string;
        alphaLabel?: string;
        hexLabel?: string;
        modeLabel?: string;
        swatchesLabel?: string;
        eyedropperLabel?: string;
    }>(),
    { alpha: false, modes: () => ['hex', 'rgb', 'hsl'], eyedropper: true, disabled: false },
);

const emit = defineEmits<{
    'update:modelValue': [hex: string];
    'update:mode': [mode: ColorMode];
    /** The user finished a change: released the area or a strip, a key, the hex field, a swatch. / Пользователь закончил правку. */
    change: [hex: string];
}>();

const l10n = useLocaleText(props, 'colorPicker');

//--------------------------------------------------
// Состояние: HSV, а не hex, чтобы оттенок не терялся на сером и чёрном

const state = reactive<Hsva>({ h: 0, s: 0, v: 0, a: 1 });
const hex = computed(() => toHex(hsvaToRgba(state), props.alpha));

function load(value: string) {
    const c = parseColor(value);
    if (!c) return;
    const next = rgbaToHsva(c);
    // у серого и чёрного оттенка нет: остаётся прежний, иначе при перетаскивании к краю он прыгал бы на красный
    state.h = next.s === 0 || next.v === 0 ? state.h : next.h;
    state.s = next.s;
    state.v = next.v;
    state.a = props.alpha ? next.a : 1;
}
load(props.modelValue);

// Значение пришло снаружи (не наше эхо): подхватываем
watch(
    () => props.modelValue,
    (value) => {
        if (normalizeHex(value, props.alpha) !== hex.value) load(value);
    },
);
watch(
    () => props.alpha,
    () => load(props.modelValue),
);

//--------------------------------------------------
// Способ ввода: HEX, RGB, HSL

const currentMode = ref<ColorMode>(props.mode ?? props.modes[0] ?? 'hex');
watch(
    () => props.mode,
    (m) => {
        if (m) currentMode.value = m;
    },
);
// способ, которого нет в списке, не показываем: берём первый из разрешённых
const activeMode = computed<ColorMode>(() => (props.modes.includes(currentMode.value) ? currentMode.value : (props.modes[0] ?? 'hex')));

const modeValue = computed({
    get: () => activeMode.value,
    set: (m: ColorMode) => {
        currentMode.value = m;
        emit('update:mode', m);
    },
});

/** Целые RGB и HSL для полей: в HSL оттенок берётся из состояния (у серого пересчёт из RGB дал бы 0 и сбросил бы его). */
const rgbFields = computed(() => {
    const c = hsvaToRgba(state);
    return [Math.round(c.r), Math.round(c.g), Math.round(c.b)];
});
const hslFields = computed(() => {
    const [r, g, b] = rgbFields.value as [number, number, number];
    const { s, l } = rgbToHsl(r, g, b);
    return [Math.round(state.h) % 360, Math.round(s * 100), Math.round(l * 100)];
});
const alphaPercent = computed(() => Math.round(state.a * 100));

interface Channel {
    key: string;
    label: string;
    max: number;
    value: number;
    kind: 'rgb' | 'hsl' | 'alpha';
    index: number;
}

/** Числовые поля текущего способа ввода (для hex их нет). */
const channels = computed<Channel[]>(() => {
    const list: Channel[] = [];
    if (activeMode.value === 'rgb') {
        (['R', 'G', 'B'] as const).forEach((label, index) => list.push({ key: label, label, max: 255, value: rgbFields.value[index]!, kind: 'rgb', index }));
    } else if (activeMode.value === 'hsl') {
        const max = [360, 100, 100];
        (['H', 'S', 'L'] as const).forEach((label, index) => list.push({ key: label, label, max: max[index]!, value: hslFields.value[index]!, kind: 'hsl', index }));
    }
    if (activeMode.value !== 'hex' && props.alpha) list.push({ key: 'A', label: 'A', max: 100, value: alphaPercent.value, kind: 'alpha', index: 0 });
    return list;
});

/** Поле числа закончили править (blur, Enter): применяем и сообщаем о конце правки. */
function commitChannel(kind: 'rgb' | 'hsl' | 'alpha', index: number, value: number | null) {
    if (value === null || !Number.isFinite(value)) return;
    if (kind === 'alpha') {
        state.a = Math.min(100, Math.max(0, value)) / 100;
    } else if (kind === 'rgb') {
        const next = [...rgbFields.value];
        next[index] = Math.min(255, Math.max(0, Math.round(value)));
        load(toHex({ r: next[0]!, g: next[1]!, b: next[2]!, a: state.a }, true));
    } else {
        const next = [...hslFields.value];
        next[index] = value;
        const rgb = hslToRgb(((next[0]! % 360) + 360) % 360, next[1]! / 100, next[2]! / 100);
        load(toHex({ ...rgb, a: state.a }, true));
        state.h = ((next[0]! % 360) + 360) % 360; // оттенок, который ввели, остаётся и на сером
    }
    push(true);
}

const hexText = ref(hex.value);
const hexInvalid = ref(false);
watch(hex, (h) => {
    hexText.value = h;
    hexInvalid.value = false;
});

function push(final = false) {
    emit('update:modelValue', hex.value);
    if (final) emit('change', hex.value);
}

//--------------------------------------------------
// Квадрат насыщенности и яркости

const areaRef = ref<HTMLElement | null>(null);
let dragging = -1;

function fromPointer(e: PointerEvent) {
    const el = areaRef.value;
    if (!el) return;
    const r = el.getBoundingClientRect();
    state.s = r.width ? Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) : 0;
    state.v = r.height ? 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) : 0;
    push();
}

function onAreaDown(e: PointerEvent) {
    if (props.disabled || e.button !== 0) return;
    dragging = e.pointerId;
    fromPointer(e);
    e.preventDefault();
    areaRef.value?.focus({ preventScroll: true });
    try {
        areaRef.value?.setPointerCapture(e.pointerId);
    } catch {
        /* untrusted events / capture already gone */
    }
}

function onAreaMove(e: PointerEvent) {
    if (dragging === e.pointerId) fromPointer(e);
}

function onAreaUp(e: PointerEvent) {
    if (dragging !== e.pointerId) return;
    dragging = -1;
    emit('change', hex.value);
}

function onAreaKey(e: KeyboardEvent) {
    if (props.disabled) return;
    const k = e.shiftKey ? 0.1 : 0.01;
    const keys: Record<string, [number, number]> = { ArrowLeft: [-k, 0], ArrowRight: [k, 0], ArrowUp: [0, k], ArrowDown: [0, -k] };
    const d = keys[e.key];
    if (!d) return;
    e.preventDefault();
    state.s = Math.min(1, Math.max(0, Math.round((state.s + d[0]) * 1000) / 1000));
    state.v = Math.min(1, Math.max(0, Math.round((state.v + d[1]) * 1000) / 1000));
    push(true);
}

//--------------------------------------------------
// Полосы, поле hex, образцы, пипетка

const hueValue = computed({ get: () => state.h, set: (v: number) => ((state.h = v), push()) });
const alphaValue = computed({ get: () => state.a, set: (v: number) => ((state.a = v), push()) });

/** Оттенок как чистый цвет: фон квадрата и градиент полосы оттенка. */
const hueCss = computed(() => toHex(hsvaToRgba({ h: state.h, s: 1, v: 1, a: 1 })));
const solidCss = computed(() => toHex(hsvaToRgba({ ...state, a: 1 })));

function commitHex() {
    const next = normalizeHex(hexText.value, props.alpha);
    if (!next) {
        hexInvalid.value = true;
        return;
    }
    hexInvalid.value = false;
    load(next);
    hexText.value = hex.value;
    push(true);
}

function pick(color: string) {
    if (props.disabled) return;
    load(color);
    push(true);
}

const canEyedrop = computed(() => props.eyedropper && typeof window !== 'undefined' && 'EyeDropper' in window);

async function eyedrop() {
    try {
        const EyeDropperCtor = (window as unknown as { EyeDropper: new () => { open(): Promise<{ sRGBHex: string }> } }).EyeDropper;
        const { sRGBHex } = await new EyeDropperCtor().open();
        pick(sRGBHex);
    } catch {
        /* пользователь отменил выбор */
    }
}

const areaText = computed(() => `${Math.round(state.s * 100)}%, ${Math.round(state.v * 100)}%`);
</script>

<template>
    <div class="tao-color-picker" :class="[sizeClass(size), { 'tao-color-picker--disabled': disabled }]">
        <div
            ref="areaRef"
            class="tao-color-picker__area"
            :style="{ backgroundColor: hueCss }"
            role="slider"
            :tabindex="disabled ? -1 : 0"
            :aria-label="l10n.areaLabel"
            :aria-valuetext="areaText"
            :aria-valuenow="Math.round(state.s * 100)"
            aria-valuemin="0"
            aria-valuemax="100"
            @pointerdown="onAreaDown"
            @pointermove="onAreaMove"
            @pointerup="onAreaUp"
            @pointercancel="onAreaUp"
            @keydown="onAreaKey"
        >
            <span class="tao-color-picker__cursor" :style="{ left: `${state.s * 100}%`, top: `${(1 - state.v) * 100}%`, backgroundColor: solidCss }"></span>
        </div>

        <div class="tao-color-picker__strips">
            <TaoSlider
                v-model="hueValue"
                class="tao-color-picker__hue"
                variant="thin"
                :min="0"
                :max="360"
                :step="1"
                :disabled="disabled"
                :aria-label="l10n.hueLabel"
                @change="emit('change', hex)"
            />
            <TaoSlider
                v-if="alpha"
                v-model="alphaValue"
                class="tao-color-picker__alpha"
                variant="thin"
                :min="0"
                :max="1"
                :step="0.01"
                :disabled="disabled"
                :aria-label="l10n.alphaLabel"
                :style="{ '--tao-color-picker-solid': solidCss }"
                @change="emit('change', hex)"
            />
        </div>

        <TaoSegmented v-if="modes.length > 1" v-model="modeValue" class="tao-color-picker__modes" size="small" :aria-label="l10n.modeLabel" :disabled="disabled">
            <TaoSegmentedOption v-for="m in modes" :key="m" :value="m" :label="m.toUpperCase()" />
        </TaoSegmented>

        <div class="tao-color-picker__row">
            <span class="tao-color-picker__preview"><span :style="{ backgroundColor: hex }"></span></span>
            <!-- The label is the same as over the RGB / HSL channels, so the row has the same height in every mode. / Подпись как над каналами RGB / HSL: так высота строки одинакова во всех режимах. -->
            <label v-if="activeMode === 'hex'" class="tao-color-picker__channel tao-color-picker__hex">
                <span>HEX</span>
                <TaoInput
                    v-model="hexText"
                    size="small"
                    :error="hexInvalid"
                    :disabled="disabled"
                    :aria-label="l10n.hexLabel"
                    @blur="commitHex"
                    @keydown.enter="commitHex"
                />
            </label>
            <div v-else class="tao-color-picker__channels">
                <label v-for="c in channels" :key="c.key" class="tao-color-picker__channel">
                    <span>{{ c.label }}</span>
                    <TaoInputNumber
                        size="small"
                        :controls="false"
                        :min="0"
                        :max="c.max"
                        :step="1"
                        :model-value="c.value"
                        :disabled="disabled"
                        @commit="(v) => commitChannel(c.kind, c.index, v)"
                    />
                </label>
            </div>
            <button v-if="canEyedrop" type="button" class="tao-color-picker__eyedropper" :disabled="disabled" :aria-label="l10n.eyedropperLabel" :title="l10n.eyedropperLabel" @click="eyedrop">
                ✎
            </button>
        </div>

        <div v-if="swatches?.length" class="tao-color-picker__swatches" role="group" :aria-label="l10n.swatchesLabel">
            <button
                v-for="s in swatches"
                :key="s"
                type="button"
                class="tao-color-picker__swatch"
                :class="{ 'tao-color-picker__swatch--on': normalizeHex(s, alpha) === hex }"
                :style="{ backgroundColor: s }"
                :disabled="disabled"
                :aria-label="s"
                :title="s"
                @click="pick(s)"
            ></button>
        </div>
    </div>
</template>

<style scoped>
.tao-color-picker {
    --tao-color-picker-checker: repeating-conic-gradient(var(--tao-color-surface-hover) 0% 25%, var(--tao-color-surface-sunken) 0% 50%) 50% / 10px 10px;

    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    /* Fixed, not 100%: in a popover that shrinks to its content the inputs of the HEX / RGB / HSL modes would resize the window. / Фиксированная, не 100%: в окне по ширине содержимого поля режимов HEX / RGB / HSL меняли бы размер окна. */
    width: 280px;
    min-width: 200px;
    max-width: 100%;
}

.tao-color-picker--disabled {
    opacity: 0.6;
}

/* Квадрат: цвет оттенка, поверх белое слева направо и чёрное снизу вверх */
.tao-color-picker__area {
    position: relative;
    height: 140px;
    border-radius: var(--tao-radius-md);
    background-image: linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);
    cursor: crosshair;
    touch-action: none;
    user-select: none;
}

.tao-color-picker__area:focus {
    outline: none;
}

.tao-color-picker__area:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-color-picker__cursor {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgb(0 0 0 / 0.5), inset 0 0 0 1px rgb(0 0 0 / 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.tao-color-picker__strips {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
}

/* Полоса оттенка: радуга вместо трека, заливки нет, бегунок цвета оттенка */
.tao-color-picker__hue {
    --tao-slider-track-bg: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
    --tao-slider-fill-bg: transparent;
    --tao-slider-thumb-bg: #fff;
}

/* Полоса прозрачности: шашки под градиентом от прозрачного к цвету */
.tao-color-picker__alpha {
    --tao-slider-track-bg: linear-gradient(to right, transparent, var(--tao-color-picker-solid)), var(--tao-color-picker-checker);
    --tao-slider-fill-bg: transparent;
    --tao-slider-thumb-bg: #fff;
}

.tao-color-picker__row {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
}

.tao-color-picker__preview {
    flex: none;
    width: var(--tao-control-height);
    height: var(--tao-control-height);
    overflow: hidden;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: var(--tao-color-picker-checker);
}

.tao-color-picker__preview > span {
    display: block;
    width: 100%;
    height: 100%;
}

.tao-color-picker__hex {
    flex: 1;
    min-width: 0;
    font-variant-numeric: tabular-nums;
}

.tao-color-picker__hex :deep(input),
.tao-color-picker__channel :deep(input) {
    text-align: center;
}

.tao-color-picker__channels {
    display: flex;
    flex: 1;
    gap: 4px;
    min-width: 0;
}

.tao-color-picker__channel {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    color: var(--tao-color-text-muted);
    font-size: 10px;
    text-align: center;
}

.tao-color-picker__eyedropper {
    flex: none;
    width: var(--tao-control-height);
    height: var(--tao-control-height);
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-control);
    background: transparent;
    color: var(--tao-color-text);
    cursor: pointer;
}

.tao-color-picker__eyedropper:hover:not(:disabled) {
    border-color: var(--tao-color-accent);
    color: var(--tao-color-accent);
}

.tao-color-picker__swatches {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.tao-color-picker__swatch {
    width: 22px;
    height: 22px;
    padding: 0;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-sm);
    cursor: pointer;
}

.tao-color-picker__swatch:hover:not(:disabled) {
    transform: scale(1.12);
}

.tao-color-picker__swatch--on {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 1px;
}

.tao-color-picker__swatch:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}
</style>
