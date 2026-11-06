<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { listenFocusLoss } from '../focusLoss';
import { useField } from '../formField';
import { useLocaleText } from '../locale';
import { sizeClass } from '../size';
import {
    isMarkActive,
    moveThumb,
    nearestMark,
    nearestThumb,
    normalizeMarks,
    normalizeValue,
    normalizeZones,
    ratioOf,
    stepMark,
    valueAt,
    zoneAt,
    zoneGradient,
    type TaoSliderBaseProps,
    type TaoSliderMark,
    type TaoSliderValue,
} from '../slider';

// Общая основа TaoSlider и TaoRangeSlider: одна ручка или две, значение приходит как число или пара.
// Наружу отдаются обёртки с точными типами (число / пара), сама основа не экспортируется.
defineOptions({ name: 'TaoSliderBase' });

const props = withDefaults(defineProps<TaoSliderBaseProps & { modelValue: TaoSliderValue }>(), {
    min: 0,
    max: 100,
    step: 1,
    minGap: 0,
    showValue: false,
    marksSide: 'end',
    discrete: false,
    bubble: false,
    flat: false,
    vertical: false,
    disabled: false,
    error: false,
    variant: 'bar',
    wheel: 0,
    editable: false,
});

const emit = defineEmits<{
    'update:modelValue': [value: TaoSliderValue];
    change: [value: TaoSliderValue];
}>();

defineSlots<{
    /** Caption of a mark. / Подпись метки. */
    mark?(props: { mark: TaoSliderMark; active: boolean }): unknown;
    /** The bubble beside a thumb (with `bubble`): its text; `zone` is the zone the thumb stands in. / Плашка у ручки (с `bubble`): её текст; `zone` — зона, в которой стоит ручка. */
    bubble?(props: { value: number; zone: { from: number; to: number; color: string } | undefined }): unknown;
    'pre-value'?(): unknown;
    'post-value'?(): unknown;
}>();

const { field, controlId, invalid, describedBy } = useField(props);
const l10n = useLocaleText(props, 'slider');

const isRange = computed(() => Array.isArray(props.modelValue));
const values = computed(() => normalizeValue(props.modelValue, props.min, props.max));
const text = (v: number) => (props.format ? props.format(v) : String(v));

const markList = computed(() => normalizeMarks(props.marks, props.min, props.max, text));
const markValues = computed(() => markList.value.map((m) => m.value));
/** Есть ли у меток подписи: без них метки это только черты, и места под текст не нужно. */
const hasCaptions = computed(() => markList.value.some((m) => m.label));
/** Ступенчатая шкала: значения только на метках. Без меток ступенчатости нет. */
const stepped = computed(() => props.discrete && markValues.value.length > 0);

const percent = (v: number) => ratioOf(v, props.min, props.max) * 100;
const place = (v: number) => (props.vertical ? { bottom: `${percent(v)}%` } : { left: `${percent(v)}%` });

const fillStyle = computed(() => {
    const from = isRange.value ? percent(values.value[0]!) : 0;
    const to = percent(values.value[isRange.value ? 1 : 0]!);
    return props.vertical ? { bottom: `${from}%`, height: `${to - from}%` } : { left: `${from}%`, width: `${to - from}%` };
});

// Zones: the bar in colour. A dimmed layer holds all of them, a second one is clipped to the filled part, and each thumb wears
// the colour of the zone it stands in.
// Зоны: полоса цветом. Приглушённый слой держит все, второй обрезан до закрашенной части, а каждая ручка носит цвет своей зоны.
const zoneList = computed(() => normalizeZones(props.zones, props.min, props.max));
// the dot of a zone that is revealed shows once the fill has got there / точка раскрываемой зоны видна, когда заливка дошла
const zoneDots = computed(() => zoneList.value.filter((z) => z.dot && (!z.reveal || isMarkActive(z.to, values.value))).map((z) => z.to));
const zoneVars = computed(() =>
    zoneList.value.length
        ? {
              '--_zones': zoneGradient(zoneList.value, props.min, props.max, props.vertical),
              '--_zones-dim': zoneGradient(zoneList.value, props.min, props.max, props.vertical, true),
          }
        : undefined,
);
const zoneClip = computed(() => {
    const from = isRange.value ? percent(values.value[0]!) : 0;
    const to = percent(values.value[isRange.value ? 1 : 0]!);
    const radius = 'round var(--_zone-radius)';
    // inset(top right bottom left): along a vertical bar the share counts from the bottom
    return {
        clipPath: props.vertical ? `inset(${100 - to}% 0 ${from}% 0 ${radius})` : `inset(0 ${100 - to}% 0 ${from}% ${radius})`,
    };
});
// The bubble: the colour of the zone the thumb stands in (the accent without zones) and a label on it that reads.
// Плашка: цвет зоны, в которой стоит ручка (без зон акцент), и подпись на нём, которая читается.
const bubbleStyle = (v: number) => {
    const zone = zoneAt(v, zoneList.value);
    return { ...place(v), '--_bg': zone?.color ?? 'var(--tao-color-accent)', ...(zone ? (zone.on ? { '--_on': zone.on } : {}) : { '--_on': 'var(--tao-color-on-accent)' }) };
};
const bubbleAuto = (v: number) => {
    const zone = zoneAt(v, zoneList.value);
    return !!zone && !zone.on;
};

const thumbStyle = (v: number) => {
    const zone = zoneAt(v, zoneList.value);
    return zone ? { ...place(v), '--tao-slider-thumb-bg': zone.color } : place(v);
};

const barText = computed(() => values.value.map(text).join(' – '));

//--------------------------------------------------
// Запись значения

function write(next: number[], final = false) {
    const before = values.value;
    const value: TaoSliderValue = isRange.value ? [next[0]!, next[1]!] : next[0]!;
    const changed = next.some((v, i) => v !== before[i]);
    emit('update:modelValue', value);
    if (final && changed) emit('change', value);
}

/** Ставит ручку `index` в значение `target` (оно уже прижато к шагу или метке). */
function setThumb(index: number, target: number, final = false) {
    if (isRange.value) {
        write(moveThumb(values.value as [number, number], index as 0 | 1, target, props.min, props.max, props.minGap), final);
    } else {
        write([Math.min(Math.max(target, props.min), props.max)], final);
    }
}

/** Значение под указателем: по доле шкалы, прижатое к шагу или к ближайшей метке. */
function valueUnder(event: PointerEvent | MouseEvent): number {
    const el = railRef.value;
    if (!el) return props.min;
    const rect = el.getBoundingClientRect();
    const ratio = props.vertical
        ? rect.height
            ? 1 - (event.clientY - rect.top) / rect.height
            : 0
        : rect.width
          ? (event.clientX - rect.left) / rect.width
          : 0;
    const raw = valueAt(ratio, props.min, props.max, stepped.value ? 0 : props.step);
    return stepped.value ? nearestMark(raw, markValues.value) : raw;
}

//--------------------------------------------------
// Указатель

const railRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const activeThumb = ref(0);
/** Фокус пришёл от мыши: кольцо фокуса не показываем (оно для клавиатуры), хотя фокус на ручке стоит. */
const pointerFocus = ref(false);
let dragPointer = -1;
let dragStart: number[] = [];
/** Нажали ровно на точку, где сведены обе ручки диапазона: какую вытянуть, решит направление первого движения. */
let tieAt: number | null = null;

function releaseDragCapture() {
    const el = railRef.value;
    const id = dragPointer;
    if (!el || id === -1) return;
    if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(id)) return;
    try {
        el.releasePointerCapture(id);
    } catch {
        /* already released by the browser */
    }
}

function endDrag() {
    if (!isDragging.value) return;
    isDragging.value = false;
    releaseDragCapture();
    dragPointer = -1;
    tieAt = null;
    if (values.value.some((v, i) => v !== dragStart[i])) {
        emit('change', isRange.value ? [values.value[0]!, values.value[1]!] : values.value[0]!);
    }
}

function onPointerDown(event: PointerEvent) {
    if (props.disabled || event.button !== 0 || !railRef.value) return;

    const target = valueUnder(event);
    dragPointer = event.pointerId;
    dragStart = [...values.value];
    isDragging.value = true;
    activeThumb.value = nearestThumb(values.value, target, activeThumb.value);
    tieAt = isRange.value && values.value[0] === values.value[1] && target === values.value[0] ? target : null;
    pointerFocus.value = true;
    // preventDefault ниже гасит и фокус, поэтому берём его сами и первым делом: поле ввода, в котором печатали, теряет фокус
    // и записывает свой текст до того, как слайдер поменяет значение, а не после (иначе устаревший текст затёр бы его)
    railRef.value.querySelectorAll<HTMLElement>('.tao-slider__thumb')[activeThumb.value]?.focus({ preventScroll: true });
    setThumb(activeThumb.value, target);
    event.preventDefault();
    try {
        railRef.value.setPointerCapture(event.pointerId);
    } catch {
        /* untrusted events / capture already gone */
    }
}

function onPointerMove(event: PointerEvent) {
    if (!isDragging.value || event.pointerId !== dragPointer) return;
    const target = valueUnder(event);
    if (tieAt !== null) {
        if (target === tieAt) return; // ещё на точке: ручки не трогаем
        activeThumb.value = target > tieAt ? 1 : 0;
        tieAt = null;
    }
    setThumb(activeThumb.value, target);
}

function onPointerEnd(event: PointerEvent) {
    if (!isDragging.value) return;
    if (dragPointer !== -1 && event.pointerId !== dragPointer) return;
    endDrag();
}

//--------------------------------------------------
// Ввод значения (editable): поле поверх полосы, на месте цифры

const editorRef = ref<HTMLInputElement | null>(null);
/** Номер ручки, значение которой набирают; null: поле закрыто. */
const editing = ref<number | null>(null);
const draft = ref('');

// Десятичная запись: «0x10» или «1e500» значением не считаем, хотя Number() их разберёт.
const DECIMAL = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

function openEditor(index: number) {
    if (!props.editable || props.disabled) return;
    endDrag();
    activeThumb.value = index;
    draft.value = String(values.value[index]);
    editing.value = index;
    void nextTick(() => {
        editorRef.value?.focus();
        editorRef.value?.select();
    });
}

/** Закрывает поле и возвращает номер ручки, которую правили (null, если поле уже закрыто). */
function closeEditor(refocus: boolean): number | null {
    const index = editing.value;
    editing.value = null;
    if (refocus && index !== null) {
        void nextTick(() => railRef.value?.querySelectorAll<HTMLElement>('.tao-slider__thumb')[index]?.focus({ preventScroll: true }));
    }
    return index;
}

/**
 * Ставит набранное: прижато к шагу (или к метке при discrete) и к границам, как значение под указателем. Не число значение не
 * меняет. Уход из поля (blur) ставит тоже, как у TaoInputNumber; Esc отменяет.
 */
function commitEditor(refocus = false) {
    const index = closeEditor(refocus);
    if (index === null) return;
    const typed = draft.value.trim().replace(/\s/g, '').replace(',', '.');
    if (!DECIMAL.test(typed)) return;
    const parsed = Number(typed);
    if (!Number.isFinite(parsed)) return;
    const target = stepped.value
        ? nearestMark(parsed, markValues.value)
        : valueAt(ratioOf(parsed, props.min, props.max), props.min, props.max, props.step);
    setThumb(index, target, true);
}

function cancelEditor() {
    closeEditor(true);
}

/** Правый клик (на сенсоре долгое нажатие) и двойной клик по полосе: правим ближайшую к указателю ручку. */
function onEditGesture(event: MouseEvent) {
    if (!props.editable || props.disabled) return;
    event.preventDefault();
    openEditor(nearestThumb(values.value, valueUnder(event), activeThumb.value));
}

watch(
    () => props.disabled || !props.editable,
    (off) => {
        if (off) editing.value = null;
    },
);

//--------------------------------------------------
// Клавиатура и колёсико

function onKeydown(event: KeyboardEvent, index: number) {
    if (props.disabled) return;
    pointerFocus.value = false; // дальше слайдером управляют с клавиатуры: кольцо снова нужно
    activeThumb.value = index;
    const at = values.value[index]!;

    let next: number | null = null;
    const forward = event.key === 'ArrowRight' || event.key === 'ArrowUp';
    const backward = event.key === 'ArrowLeft' || event.key === 'ArrowDown';
    if (forward || backward) {
        const dir = forward ? 1 : -1;
        next = stepped.value ? stepMark(at, markValues.value, dir) : at + dir * props.step;
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
        const dir = event.key === 'PageUp' ? 1 : -1;
        next = stepped.value ? stepMark(at, markValues.value, dir) : at + dir * props.step * 10;
    } else if (event.key === 'Home') {
        next = props.min;
    } else if (event.key === 'End') {
        next = props.max;
    } else if (props.editable && (event.key === 'Enter' || event.key === 'F2')) {
        event.preventDefault();
        openEditor(index);
        return;
    }
    if (next === null) return;

    event.preventDefault();
    setThumb(index, stepped.value ? nearestMark(next, markValues.value) : valueAt(ratioOf(next, props.min, props.max), props.min, props.max, props.step), true);
}

function onWheel(event: WheelEvent) {
    if (props.disabled || props.wheel <= 0 || isRange.value) return;
    event.preventDefault();
    setThumb(0, values.value[0]! + (event.deltaY < 0 ? props.wheel : -props.wheel), true);
}

/** Клик по подписи метки: ближайшая ручка прыгает к ней. */
function onMarkClick(mark: TaoSliderMark) {
    if (props.disabled) return;
    activeThumb.value = nearestThumb(values.value, mark.value, activeThumb.value);
    setThumb(activeThumb.value, mark.value, true);
}

let stopFocusLoss: (() => void) | undefined;

onMounted(() => {
    stopFocusLoss = listenFocusLoss(endDrag);
});

onBeforeUnmount(() => {
    endDrag();
    stopFocusLoss?.();
});
</script>

<template>
    <div
        class="tao-slider"
        :class="[
            `tao-slider--${variant}`,
            sizeClass(size),
            {
                'tao-slider--vertical': vertical,
                'tao-slider--flat': flat,
                'tao-slider--pointer-focus': pointerFocus,
                'tao-slider--collapsed': isRange && values[0] === values[1],
                'tao-slider--zoned': zoneList.length > 0,
                'tao-slider--bubble': bubble,
                'tao-slider--bubble-always': bubble === 'always',
                'tao-slider--range': isRange,
                'tao-slider--has-marks': markList.length > 0,
                'tao-slider--marks-start': marksSide === 'start',
                'tao-slider--marks-bare': markList.length > 0 && !hasCaptions,
                'tao-slider--show-value': showValue,
                'tao-slider--disabled': disabled,
                'tao-slider--invalid': invalid,
            },
        ]"
        role="group"
        :aria-disabled="disabled || undefined"
        @wheel="onWheel"
    >
        <div
            ref="railRef"
            class="tao-slider__rail"
            :class="{ 'tao-slider__rail--dragging': isDragging }"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerEnd"
            @pointercancel="onPointerEnd"
            @lostpointercapture="endDrag"
            @contextmenu="onEditGesture"
            @dblclick="onEditGesture"
        >
            <div class="tao-slider__track"></div>
            <template v-if="zoneList.length">
                <div class="tao-slider__track tao-slider__zones tao-slider__zones--dim" :style="zoneVars"></div>
                <div class="tao-slider__track tao-slider__zones" :style="[zoneVars, zoneClip]"></div>
                <span v-for="at in zoneDots" :key="at" class="tao-slider__dot" :style="place(at)" aria-hidden="true"></span>
            </template>
            <div v-else class="tao-slider__fill" :style="fillStyle"></div>
            <template v-for="(v, i) in values" :key="i">
            <div
                :id="i === 0 ? controlId : undefined"
                class="tao-slider__thumb"
                :class="{ 'tao-slider__thumb--active': isDragging && activeThumb === i }"
                :style="thumbStyle(v)"
                role="slider"
                :tabindex="disabled ? -1 : 0"
                :aria-valuemin="min"
                :aria-valuemax="max"
                :aria-valuenow="v"
                :aria-valuetext="text(v)"
                :aria-label="ariaLabel"
                :aria-orientation="vertical ? 'vertical' : 'horizontal'"
                :aria-disabled="disabled || undefined"
                :aria-invalid="invalid || undefined"
                :aria-describedby="describedBy"
                :aria-keyshortcuts="editable ? 'Enter F2' : undefined"
                @keydown="onKeydown($event, i)"
                @blur="pointerFocus = false"
            ></div>
            <!-- the same text as aria-valuetext: a screen reader does not need it twice / тот же текст, что в aria-valuetext: скринридеру дважды не нужен -->
            <div v-if="bubble" class="tao-slider__bubble" :class="{ 'tao-slider__bubble--auto': bubbleAuto(v) }" :style="bubbleStyle(v)" aria-hidden="true">
                <slot name="bubble" :value="v" :zone="zoneAt(v, zoneList)">{{ text(v) }}</slot>
            </div>
            </template>

            <div v-if="showValue && editing === null" class="tao-slider__value">
                <slot name="pre-value" />{{ barText }}<slot name="post-value" />
            </div>

            <!-- editable: the value is typed here; the rail must not take these events for its own (a drag, a menu, a wheel) / editable: значение набирают здесь; рельс не должен принимать эти события за свои (перетаскивание, меню, колёсико) -->
            <input
                v-if="editing !== null"
                ref="editorRef"
                v-model="draft"
                class="tao-slider__editor"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                spellcheck="false"
                :aria-label="ariaLabel ?? l10n.editLabel"
                @keydown.enter.prevent="commitEditor(true)"
                @keydown.esc.prevent.stop="cancelEditor"
                @blur="commitEditor()"
                @pointerdown.stop
                @contextmenu.stop
                @dblclick.stop
                @wheel.stop
            />
        </div>

        <div v-if="markList.length > 0" class="tao-slider__marks">
            <button
                v-for="mark in markList"
                :key="mark.value"
                type="button"
                class="tao-slider__mark"
                :class="{
                    'tao-slider__mark--active': isMarkActive(mark.value, values),
                    'tao-slider__mark--start': mark.value === min,
                    'tao-slider__mark--end': mark.value === max && max > min,
                }"
                :style="place(mark.value)"
                :disabled="disabled"
                tabindex="-1"
                @click="onMarkClick(mark)"
            >
                <span class="tao-slider__tick"></span>
                <span v-if="mark.label" class="tao-slider__mark-label">
                    <slot name="mark" :mark="mark" :active="isMarkActive(mark.value, values)">{{ mark.label }}</slot>
                </span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.tao-slider {
    /* bar: 14 / 20 at medium / bar: 14 / 20 в medium */
    --tao-slider-hit: calc(var(--tao-indicator-size) - 4px);
    --tao-slider-track: var(--tao-slider-hit);
    --tao-slider-thumb: calc(var(--tao-indicator-size) + 2px);
    /* Длина вертикального слайдера. / Length of a vertical slider. */
    --tao-slider-length: 10rem;

    position: relative;
    width: 100%;
    user-select: none;
}

.tao-slider--show-value {
    --tao-slider-hit: calc(var(--tao-indicator-size) + 2px);
}

/* Тонкий трек, hit-area шире картинки — seek / громкость. 16 / 4 / 12 в medium. */
.tao-slider--thin {
    --tao-slider-hit: calc(var(--tao-indicator-size) - 2px);
    --tao-slider-track: 4px;
    --tao-slider-thumb: calc(var(--tao-indicator-size) - 6px);
}

.tao-slider--thin.tao-slider--show-value {
    --tao-slider-hit: calc(var(--tao-indicator-size) + 2px);
}

.tao-slider--disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.tao-slider__rail {
    position: relative;
    width: 100%;
    height: var(--tao-slider-hit);
    cursor: pointer;
    touch-action: none;
}

.tao-slider--disabled .tao-slider__rail {
    cursor: not-allowed;
}

/* one cursor, the pointing finger, over the rail, over the thumb and for the whole drag. Not grab / grabbing: Opera
   on Windows draws them as the four-way move arrows and an up arrow, and a hand that changes shape mid-drag flickers.
   The rail holds the pointer capture, so the class keeps the finger even where the pointer wanders
   один курсор, палец: над рельсом, над бегунком и на всё перетаскивание. Не grab / grabbing: Opera под Windows рисует
   их четырьмя стрелками и стрелкой вверх, а рука, меняющая форму посреди жеста, мелькает. Захват указателя у рельса,
   класс держит палец, куда бы указатель ни ушёл */
.tao-slider__rail--dragging,
.tao-slider__rail--dragging * {
    cursor: pointer;
}

.tao-slider__track,
.tao-slider__fill {
    position: absolute;
    top: 50%;
    left: 0;
    height: var(--tao-slider-track);
    border-radius: var(--tao-radius-sm);
    transform: translateY(-50%);
}

/* Свои цвета полосы, заливки и бегунка (палитра красит трек оттенков и прозрачности): --tao-slider-track-bg, --tao-slider-fill-bg, --tao-slider-thumb-bg */
.tao-slider__track {
    width: 100%;
    background: var(--tao-slider-track-bg, var(--tao-color-surface-sunken));
}

.tao-slider__fill {
    background: var(--tao-slider-fill-bg, var(--tao-color-accent));
}

/* zones: the layers lie on the track and take its geometry (vertical included); the bright one is clipped to the filled part */
.tao-slider__zones {
    --_zone-radius: var(--tao-radius-sm);
    background: var(--_zones);
}

.tao-slider--thin .tao-slider__zones {
    --_zone-radius: var(--tao-radius-full);
}

/* the bubble: beside the thumb, the colour of its zone; it comes with the pointer or the keyboard focus, or stays (`always`) */
.tao-slider__bubble {
    position: absolute;
    bottom: calc(50% + var(--tao-slider-thumb) / 2 + 12px);
    display: flex;
    align-items: center;
    gap: var(--tao-space-1);
    z-index: 1;
    padding: var(--tao-space-1) var(--tao-space-3);
    border-radius: var(--tao-radius-control);
    background: var(--_bg);
    color: var(--_on, var(--tao-color-on-accent));
    font-size: var(--tao-font-size-sm);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-50%);
    pointer-events: none;
    transition: opacity var(--tao-duration-hover) var(--tao-ease-base);
}

.tao-slider__bubble::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -4px;
    width: 8px;
    height: 8px;
    background: inherit;
    border-radius: 1px;
    transform: translateX(-50%) rotate(45deg);
}

/* a colour of your own the script could not read: the browser picks black or white by its lightness */
@supports (color: oklch(from red l c h)) {
    .tao-slider__bubble--auto {
        color: oklch(from var(--_bg) clamp(0, (0.65 - l) * 1000, 1) 0 0);
    }
}

.tao-slider:not(.tao-slider--disabled) .tao-slider__thumb:hover + .tao-slider__bubble,
.tao-slider__thumb:focus-visible + .tao-slider__bubble,
.tao-slider__thumb--active + .tao-slider__bubble,
.tao-slider--bubble-always .tao-slider__bubble {
    opacity: 1;
}

.tao-slider--vertical .tao-slider__bubble {
    bottom: auto;
    left: calc(50% + var(--tao-slider-thumb) / 2 + 12px);
    transform: translateY(50%);
}

.tao-slider--vertical .tao-slider__bubble::after {
    left: -4px;
    bottom: 50%;
    transform: translateY(50%) rotate(45deg);
}

@media (prefers-reduced-motion: reduce) {
    .tao-slider__bubble {
        transition: none;
    }
}

.tao-slider__zones--dim {
    background: var(--_zones-dim);
    opacity: 0.4;
}

/* the dot where a zone ends: a light bead on the bar, smaller than the track, the hit area is not touched */
.tao-slider__dot {
    position: absolute;
    top: 50%;
    width: calc(var(--tao-slider-track) * 0.45);
    height: calc(var(--tao-slider-track) * 0.45);
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-text-strong);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--tao-color-bg) 55%, transparent);
    transform: translate(-50%, -50%);
    pointer-events: none;
}

.tao-slider--vertical .tao-slider__dot {
    top: auto;
    left: 50%;
    transform: translate(-50%, 50%);
}

.tao-slider--invalid .tao-slider__track:not(.tao-slider__zones) {
    box-shadow: inset 0 0 0 1px var(--tao-color-danger);
}

.tao-slider--thin .tao-slider__track,
.tao-slider--thin .tao-slider__fill {
    border-radius: var(--tao-radius-full);
}

.tao-slider__thumb {
    /* the contact patch: a soft ring of the thumb's own colour around the dot, wider under the pointer and widest while
       dragging, as if a finger pressed it; a shadow, so the layout and the hit area stay the same
       пятно контакта: мягкое кольцо цвета бегунка вокруг точки, шире под указателем и шире всего при перетаскивании */
    --_tao-halo: 4px;
    position: absolute;
    top: 50%;
    width: var(--tao-slider-thumb);
    height: var(--tao-slider-thumb);
    background: var(--tao-slider-thumb-bg, var(--tao-color-accent));
    border: 2px solid var(--tao-color-surface-sunken);
    border-radius: var(--tao-radius-full);
    box-shadow: 0 0 0 var(--_tao-halo) color-mix(in srgb, var(--tao-slider-thumb-bg, var(--tao-color-accent)) 24%, transparent);
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: box-shadow var(--tao-duration-base) var(--tao-ease-base);
}

.tao-slider:not(.tao-slider--disabled) .tao-slider__thumb:hover {
    --_tao-halo: 6px;
}

.tao-slider__thumb:active,
.tao-slider__thumb--active {
    --_tao-halo: 8px;
}

.tao-slider__thumb:focus {
    outline: none;
}

/* flat: бегунков не видно, но они остаются в разметке для клавиатуры; фокус виден кольцом */
.tao-slider--flat .tao-slider__thumb {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
}

/*
 * flat и диапазон сведён в точку: заливки нет, и без бегунков не видно, где он. Показываем штрих: его видно и за него можно
 * схватить (потянув вправо вынется верхняя ручка, влево нижняя).
 */
.tao-slider--flat.tao-slider--collapsed .tao-slider__thumb {
    width: calc(var(--tao-slider-track) / 2);
    height: calc(var(--tao-slider-track) + 6px);
    border-radius: var(--tao-radius-sm);
    background-color: var(--tao-color-accent);
    border-color: transparent;
}

.tao-slider--vertical.tao-slider--marks-start {
    display: inline-flex;
    flex-direction: row;
}

.tao-slider--vertical.tao-slider--marks-start .tao-slider__marks {
    margin-bottom: 0;
    margin-right: calc(max(0px, var(--tao-slider-thumb) - var(--tao-slider-hit)) / 2 + 2px);
    margin-left: 0;
    padding-right: 0;
    padding-left: 2px;
}

.tao-slider--vertical.tao-slider--marks-start .tao-slider__mark {
    left: auto;
    right: 0;
    bottom: auto;
    flex-direction: row-reverse;
}

.tao-slider--vertical.tao-slider--flat.tao-slider--collapsed .tao-slider__thumb {
    width: calc(var(--tao-slider-track) + 6px);
    height: calc(var(--tao-slider-track) / 2);
}

.tao-slider:not(.tao-slider--pointer-focus) .tao-slider__thumb:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    /* outside the contact patch, so the focus ring is never lost in it / снаружи пятна контакта */
    outline-offset: calc(var(--_tao-halo) + 2px);
}

.tao-slider--disabled .tao-slider__thumb {
    --_tao-halo: 0px;
    cursor: not-allowed;
}

@media (prefers-reduced-motion: reduce) {
    .tao-slider__thumb {
        transition: none;
    }
}

.tao-slider__value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    font-size: var(--tao-control-font-size-secondary);
    font-weight: 900;
    letter-spacing: 0.05em;
    color: var(--tao-color-text-strong);
    text-shadow: -1px -1px 0 var(--tao-color-bg), 1px -1px 0 var(--tao-color-bg),
        -1px 1px 0 var(--tao-color-bg), 1px 1px 0 var(--tao-color-bg);
}

/* editable: the field the value is typed into stands where the value text stands, over the middle of the bar */
.tao-slider__editor {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    box-sizing: border-box;
    width: 6em;
    height: max(22px, calc(var(--tao-slider-hit) + 6px));
    padding: 0 var(--tao-space-2);
    border: 1px solid var(--tao-color-accent);
    border-radius: var(--tao-radius-sm);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--tao-color-accent) 24%, transparent);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    font-variant-numeric: tabular-nums;
    text-align: center;
    outline: none;
    transform: translate(-50%, -50%);
    cursor: text;
}

/* Метки: черта и подпись, подпись вне закрашенной части тускнеет */
.tao-slider__marks {
    position: relative;
    height: calc(var(--tao-control-font-size-secondary) * 1.5 + 8px);
    /* бегунок выступает за полосу: метки ниже его края, а не под ним */
    margin-top: calc(max(0px, var(--tao-slider-thumb) - var(--tao-slider-hit)) / 2 + 2px);
}

/* Метки без подписей: только черты, высота маленькая */
.tao-slider--marks-bare .tao-slider__marks {
    height: 6px;
}

.tao-slider__mark {
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 0;
    border: 0;
    background: none;
    color: var(--tao-color-text-muted);
    font: inherit;
    font-size: var(--tao-control-font-size-secondary);
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transform: translateX(-50%);
}

/* Крайние метки прижаты к краю шкалы, а не центрируются на нём: подпись не вылезает за пределы компонента, черта остаётся на месте */
.tao-slider__mark--start {
    align-items: flex-start;
    transform: none;
}

.tao-slider__mark--end {
    align-items: flex-end;
    transform: translateX(-100%);
}

.tao-slider__mark:disabled {
    cursor: not-allowed;
}

/* Метки с другой стороны: над горизонтальным слайдером (черта у полосы, подпись выше) и слева от вертикального */
.tao-slider--marks-start {
    display: flex;
    flex-direction: column;
}

.tao-slider--marks-start .tao-slider__marks {
    order: -1;
    margin-top: 0;
    margin-bottom: calc(max(0px, var(--tao-slider-thumb) - var(--tao-slider-hit)) / 2 + 2px);
}

.tao-slider--marks-start .tao-slider__mark {
    top: auto;
    bottom: 0;
    flex-direction: column-reverse;
}

.tao-slider__tick {
    width: 1px;
    height: 4px;
    background-color: currentColor;
}

.tao-slider__mark--active {
    color: var(--tao-color-text-strong);
}

.tao-slider__mark:hover:not(:disabled) {
    color: var(--tao-color-accent);
}

/* Вертикальный: полоса стоит, максимум сверху, метки справа */
.tao-slider--vertical {
    display: inline-flex;
    width: auto;
    height: var(--tao-slider-length);
}

.tao-slider--vertical .tao-slider__rail {
    width: var(--tao-slider-hit);
    height: 100%;
}

.tao-slider--vertical .tao-slider__track,
.tao-slider--vertical .tao-slider__fill {
    top: auto;
    left: 50%;
    width: var(--tao-slider-track);
    transform: translateX(-50%);
}

.tao-slider--vertical .tao-slider__track {
    top: 0;
    height: 100%;
}

.tao-slider--vertical .tao-slider__fill {
    top: auto;
}

.tao-slider--vertical .tao-slider__thumb {
    top: auto;
    left: 50%;
    transform: translate(-50%, 50%);
}

.tao-slider--vertical .tao-slider__value {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
}

.tao-slider--vertical .tao-slider__marks {
    width: auto;
    height: 100%;
    margin-top: 0;
    margin-left: calc(max(0px, var(--tao-slider-thumb) - var(--tao-slider-hit)) / 2 + 2px);
    padding-right: 2px;
    min-width: 1em;
}

.tao-slider--vertical .tao-slider__mark {
    top: auto;
    left: 0;
    flex-direction: row;
    gap: 4px;
    transform: translateY(50%);
}

.tao-slider--vertical .tao-slider__tick {
    width: 4px;
    height: 1px;
}

.tao-slider--vertical .tao-slider__mark--start {
    align-items: flex-end;
    transform: none;
}

.tao-slider--vertical .tao-slider__mark--end {
    align-items: flex-start;
    transform: translateY(100%);
}
</style>
