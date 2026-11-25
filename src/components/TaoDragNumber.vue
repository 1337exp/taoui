<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { useControlAttrs } from '../controlAttrs';
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { listenFocusLoss } from '../focusLoss';
import { usePointerDrag, type PointerDragEnd } from '../primitives/usePointerDrag';
import { nativeFieldAttrs, useField } from '../formField';
import { sizeClass, type TaoSize } from '../size';
import { useLocaleText } from '../locale';
import { decimalsOf, normalizeNumber } from '../primitives/number';
import {
    DRAG_NUMBER_PAGE,
    DRAG_NUMBER_THRESHOLD,
    dragNumberAdvance,
    dragNumberRepeatDelay,
    dragNumberResolve,
    dragNumberSpeed,
    formatDragNumber,
    parseDragNumber,
} from '../dragNumber';
import { warnRemoved } from '../deprecate';

defineOptions({ name: 'TaoDragNumber', inheritAttrs: false });
// 5.x names the parent may still pass: said once in dev, since an untyped template shows no error / имена из 5.x, которые родитель мог оставить: один раз в dev, шаблон без типов ошибки не покажет
warnRemoved('TaoDragNumber', { error: 'use `invalid` for the red frame (`error` is only the text of `TaoFormField`)' });

// the attributes go to the control, the looks to the wrapper (see controlAttrs.ts)
// атрибуты — элементу управления, внешний вид — обёртке
const { rootAttrs, controlAttrs } = useControlAttrs();

const props = withDefaults(
    defineProps<{
        min?: number;
        max?: number;
        /** The step of ± and of the arrow keys; the default grain of the value. / Шаг ± и стрелок; зерно значения по умолчанию. */
        step?: number;
        /** Decimal places the value is rounded to; without it as many as the `step` has. / Знаков после запятой, до которых округляется значение; без него — сколько у `step`. */
        precision?: number;
        /** The caption on the left of the field («Width»). It names the control for a screen reader. / Подпись слева в поле («Ширина»). Она же называет контрол для скринридера. */
        label?: string;
        /** The unit after the number («m», «°», «%»); it is not part of the value. A typed `5 m` is read as 5. / Единица после числа («м», «°», «%»); не часть значения. Набранное `5 м` читается как 5. */
        unit?: string;
        /** The value change per pixel of a drag; without it a quarter of a step. / Изменение значения на пиксель протяжки; без него — четверть шага. */
        dragSpeed?: number;
        disabled?: boolean;
        /** The value is shown and can be selected and submitted, but not changed: no drag, no ±, no keys, no typing. / Значение видно, его можно выделить и отправить, но не изменить: ни протяжки, ни ±, ни клавиш, ни набора. */
        readOnly?: boolean;
        /** Red frame. The message goes to TaoFormField `error`. / Красная рамка. Текст ошибки — в `error` у TaoFormField. */
        /** The id of the control, which the label of a `TaoFormField` points at. / id элемента: на него указывает подпись `TaoFormField`. */
        id?: string;
        /** The name in a form: the value goes into `FormData` and a native submit. / Имя в форме: значение попадает в `FormData` и нативную отправку. */
        name?: string;
        /** The field must be filled in (native `required`). / Поле обязательно (нативный `required`). */
        required?: boolean;
        /** Takes the focus when it appears. / Берёт фокус, когда появляется. */
        autofocus?: boolean;
        invalid?: boolean;
        /** Control size, same scale as TaoButton; without it — the size of ancestors. / Размер, шкала как у TaoButton; без него — размер предков. */
        size?: TaoSize;
        /** The − and + buttons on the sides. / Кнопки − и + по бокам. */
        controls?: boolean;
        /**
         * A held − / + repeats its step (after a short pause, then faster); the whole run is one `@commit`, `Esc` puts the value back.
         * Зажатая − / + повторяет шаг (после короткой паузы, потом быстрее); вся серия — один `@commit`, `Esc` возвращает значение.
         */
        repeat?: boolean;
        /**
         * `outline` — a frame (default), `filled` — a fill and no frame, for a column of fields in a panel.
         * `outline` — рамка (по умолчанию), `filled` — заливка без рамки: для столбца полей в панели.
         */
        variant?: 'outline' | 'filled';
        /** Text of the number at rest (`1 200`, `5.00`); the field edits the plain number. / Текст числа в покое (`1 200`, `5.00`); поле правит простое число. */
        format?: (value: number) => string;
        incrementLabel?: string;
        decrementLabel?: string;
    }>(),
    {
        step: 1,
        disabled: false,
        invalid: false,
        controls: true,
        repeat: true,
        variant: 'outline',
    },
);

const model = defineModel<number>({ default: 0 });
const l10n = useLocaleText(props, 'dragNumber');

const emit = defineEmits<{
    /**
     * An action ended and changed the value: the end of a drag, ±, an arrow key, Enter or blur of a typed number. Once per
     * action (a drag emits update:modelValue on every move), so a form can save or push an undo step here.
     * Действие закончено и изменило значение: конец протяжки, ±, стрелка, Enter или blur набранного числа. Один раз на
     * действие (протяжка шлёт update:modelValue на каждом движении): здесь удобно сохранять или делать шаг отмены.
     */
    commit: [value: number];
    blur: [event: FocusEvent];
    focus: [event: FocusEvent];
}>();

const { controlId, isInvalid, describedBy, localId } = useField(props);
const labelId = `${localId}-label`;

const inputEl = ref<HTMLInputElement | null>(null);
const fieldEl = ref<HTMLElement | null>(null);
const focused = ref(false);
const dragging = ref(false);
const draft = ref('');

const digits = computed(() => props.precision ?? decimalsOf(props.step));
const limits = computed(() => ({ min: props.min, max: props.max, precision: digits.value }));
const plain = (value: number) => formatDragNumber(value, digits.value);
const shown = computed(() => (props.format ? props.format(model.value) : plain(model.value)));
// at rest the number is formatted; while it is typed the field holds the user's text; a drag shows the live number
// в покое число отформатировано; пока его набирают, в поле текст пользователя; протяжка показывает живое число
const text = computed(() => (focused.value && !dragging.value ? draft.value : shown.value));
const valueText = computed(() => (props.unit ? `${shown.value} ${props.unit}` : shown.value));
// read in the template, not cached (`useAttrs()` is not reactive)
// читается в шаблоне, без кэша (`useAttrs()` не реактивен)
const named = () => props.label && controlAttrs()['aria-label'] === undefined;

/** Writes a value; says whether it changed. / Записывает значение; говорит, изменилось ли оно. */
function apply(value: number) {
    const next = normalizeNumber(value, limits.value);
    const changed = next !== model.value;
    if (changed) {
        model.value = next;
    }
    return { next, changed };
}

/** What the user typed, if it is a number; otherwise the value the field has. / Что набрал пользователь, если это число; иначе значение поля. */
function typedValue() {
    return focused.value ? (parseDragNumber(draft.value, props.unit) ?? model.value) : model.value;
}

/** One step from what the field shows, no commit yet. / Один шаг от того, что показывает поле, пока без commit. */
function nudge(direction: 1 | -1, steps = 1) {
    const result = apply(typedValue() + direction * props.step * steps);
    draft.value = plain(result.next);
    if (focused.value) {
        void nextTick(() => inputEl.value?.select());
    }
    return result;
}

function bump(direction: 1 | -1, steps = 1) {
    if (props.disabled || props.readOnly) {
        return;
    }
    const { next, changed } = nudge(direction, steps);
    if (changed) {
        emit('commit', next);
    }
}

function commitDraft() {
    if (props.readOnly) {
        draft.value = plain(model.value);
        return;
    }
    const parsed = parseDragNumber(draft.value, props.unit);
    if (parsed === null) {
        draft.value = plain(model.value);
        return;
    }
    const { next, changed } = apply(parsed);
    draft.value = plain(next);
    if (changed) {
        emit('commit', next);
    }
}

function onInput(event: Event) {
    if (props.readOnly) {
        return;
    }
    draft.value = (event.target as HTMLInputElement).value;
}

function onFocus(event: FocusEvent) {
    focused.value = true;
    draft.value = plain(model.value);
    emit('focus', event);
    // the text switches from the formatted to the plain number: select it once that is drawn
    // текст меняется с отформатированного на простое число: выделяем, когда оно нарисовано
    void nextTick(() => inputEl.value?.select());
}

function onBlur(event: FocusEvent) {
    if (focused.value && !dragging.value) {
        commitDraft();
    }
    focused.value = false;
    emit('blur', event);
}

function onKeydown(event: KeyboardEvent) {
    if (props.readOnly) {
        return;
    }
    switch (event.key) {
        case 'Enter':
            commitDraft();
            void nextTick(() => inputEl.value?.select());
            break;
        case 'Escape':
            // give the typed text up and keep the value
            // отказаться от набранного, значение остаётся
            draft.value = plain(model.value);
            inputEl.value?.blur();
            break;
        case 'ArrowUp':
            event.preventDefault();
            bump(1);
            break;
        case 'ArrowDown':
            event.preventDefault();
            bump(-1);
            break;
        case 'PageUp':
            event.preventDefault();
            bump(1, DRAG_NUMBER_PAGE);
            break;
        case 'PageDown':
            event.preventDefault();
            bump(-1, DRAG_NUMBER_PAGE);
            break;
        case 'Home':
            if (props.min !== undefined && !event.shiftKey) {
                event.preventDefault();
                bump(-1, (typedValue() - props.min) / props.step);
            }
            break;
        case 'End':
            if (props.max !== undefined && !event.shiftKey) {
                event.preventDefault();
                bump(1, (props.max - typedValue()) / props.step);
            }
            break;
    }
}

// ---------- The drag: press, move sideways, release. Under the threshold it is a click and starts typing.
// ---------- Протяжка: нажать, повести вбок, отпустить. Меньше порога — это клик, и он начинает ввод.
interface Drag {
    startX: number;
    lastX: number;
    startValue: number;
    /** The running value before rounding. / Бегущее значение до округления. */
    raw: number;
    /** The value last written. / Последнее записанное значение. */
    last: number;
    moved: boolean;
}

let drag: Drag | null = null;

// The press, the moves and every way it ends (release, cancel, lost focus or capture, unmount, Escape) are the shared gesture; what each ending
// means for a number is decided in `finishDrag`.
// Нажатие, движения и любой конец (отпустили, отмена, потеря фокуса или захвата, размонтирование, Escape) — общий жест; что каждый конец
// значит для числа, решает `finishDrag`.
const gesture = usePointerDrag({
    target: () => fieldEl.value,
    onStart(event) {
        if (props.disabled || props.readOnly) {
            return false;
        }
        // inside the field that is being typed in the press places the caret / в набираемом поле нажатие ставит каретку
        if (focused.value && event.target === inputEl.value) {
            return false;
        }
        drag = {
            startX: event.clientX,
            lastX: event.clientX,
            startValue: model.value,
            raw: model.value,
            last: model.value,
            moved: false,
        };
    },
    onMove(event) {
        if (!drag) {
            return;
        }
        if (!drag.moved) {
            const travelled = event.clientX - drag.startX;
            if (Math.abs(travelled) < DRAG_NUMBER_THRESHOLD) {
                return;
            }
            // the value starts at the threshold, so a fast first move is not lost and there is no jump
            // значение стартует от порога: быстрое первое движение не пропадает, и рывка нет
            drag.moved = true;
            drag.lastX = drag.startX + Math.sign(travelled) * DRAG_NUMBER_THRESHOLD;
            dragging.value = true;
            window.addEventListener('keydown', onDragKey, true);
        }
        const dx = event.clientX - drag.lastX;
        drag.lastX = event.clientX;
        drag.raw = dragNumberAdvance(drag.raw, dx, {
            speed: dragNumberSpeed(props.step, props.dragSpeed),
            fine: event.shiftKey,
            min: props.min,
            max: props.max,
        });
        const next = dragNumberResolve(drag.raw, limits.value, props.step, event.ctrlKey || event.metaKey);
        if (next !== drag.last) {
            drag.last = next;
            model.value = next;
        }
    },
    onEnd: (reason) => finishDrag(reason),
});

/**
 * The drag is over. Released: a drag that moved keeps its value and commits it, a press that did not move is a click (type the number).
 * Lost (the window lost the focus, the capture was taken away, the browser cancelled): a drag that moved is kept and committed, a press that did
 * not move is not a click. Escape: the value goes back to where it began, nothing is committed. The field going away: nothing, nobody is left.
 * Протяжка кончилась. Отпустили: сдвинувшаяся протяжка оставляет значение и фиксирует его, нажатие без движения — клик (набираем число).
 * Потеряна (окно потеряло фокус, захват отобрали, браузер отменил): сдвинувшаяся оставляет и фиксирует, нажатие без движения — не клик.
 * Escape: значение возвращается, где началось, ничего не фиксируется. Поле исчезает: ничего, слушать некому.
 */
function finishDrag(reason: PointerDragEnd) {
    const done = drag;
    drag = null;
    dragging.value = false;
    window.removeEventListener('keydown', onDragKey, true);
    if (!done || reason === 'unmount') {
        return;
    }
    if (reason === 'abort') {
        if (done.moved && done.last !== done.startValue) {
            model.value = done.startValue;
        }
        return;
    }
    if (!done.moved) {
        if (reason !== 'up') {
            return;
        }
        // a click: type the number / клик: набираем число
        if (focused.value) {
            inputEl.value?.select();
        } else {
            inputEl.value?.focus();
        }
        return;
    }
    if (focused.value) {
        draft.value = plain(done.last);
    }
    if (done.last !== done.startValue) {
        emit('commit', done.last);
    }
}

// ---------- A held − / +: the first step at once, then, after a pause, the steps keep coming until the button is let go.
// ---------- Зажатая − / +: первый шаг сразу, потом, после паузы, шаги идут, пока кнопку не отпустят.
interface Hold {
    direction: 1 | -1;
    id: number;
    startValue: number;
    /** The value last written. / Последнее записанное значение. */
    last: number;
    /** Repeats done so far; it sets the pace. / Сделано повторов; от него зависит темп. */
    count: number;
    timer?: ReturnType<typeof setTimeout>;
}

let hold: Hold | null = null;
/** The click that follows a pointer press the hold already answered must not step again. / Клик после нажатия, на которое уже ответила серия, не должен делать ещё шаг. */
let suppressClick = false;

function scheduleRepeat() {
    if (hold) {
        hold.timer = setTimeout(repeatStep, dragNumberRepeatDelay(hold.count));
    }
}

function repeatStep() {
    if (!hold) {
        return;
    }
    if (props.disabled || props.readOnly) {
        stopHold();
        return;
    }
    const { next, changed } = nudge(hold.direction);
    if (!changed) {
        // a bound: nothing more to run into / граница: дальше идти некуда
        stopHold();
        return;
    }
    hold.last = next;
    hold.count++;
    scheduleRepeat();
}

function onButtonDown(direction: 1 | -1, event: PointerEvent) {
    if (!props.repeat || props.disabled || props.readOnly || event.button !== 0) {
        return;
    }
    stopHold();
    suppressClick = true;
    const startValue = model.value;
    const { next } = nudge(direction);
    hold = { direction, id: event.pointerId, startValue, last: next, count: 0 };
    try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
        // a synthetic or already finished pointer / искусственный или уже законченный указатель
    }
    window.addEventListener('keydown', onHoldKey, true);
    scheduleRepeat();
}

function onButtonClick(direction: 1 | -1) {
    // a click that comes from the keyboard or a screen reader has no press before it: it is one plain step
    // клик с клавиатуры или от скринридера без нажатия перед ним: один обычный шаг
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    bump(direction);
}

/**
 * The run is over. The value stays and is committed once, or, with `revert`, goes back to where the run began and nothing is committed.
 * Серия кончилась. Значение остаётся и фиксируется один раз, а с `revert` возвращается, где серия началась, и ничего не фиксируется.
 */
function stopHold(revert = false) {
    const done = hold;
    hold = null;
    if (!done) {
        return;
    }
    clearTimeout(done.timer);
    window.removeEventListener('keydown', onHoldKey, true);
    // the click of this press comes right after the pointerup, before a timer fires
    // клик этого нажатия идёт сразу за pointerup, раньше любого таймера
    setTimeout(() => {
        suppressClick = false;
    });
    if (revert) {
        if (done.last !== done.startValue) {
            model.value = done.startValue;
        }
        return;
    }
    if (done.last !== done.startValue) {
        emit('commit', done.last);
    }
}

function onHoldKey(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !hold) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    stopHold(true);
}

// Alt-Tab, a screenshot or a system dialog swallow the pointerup: without this the field would stay «pressed»
// Alt-Tab, скриншот или системный диалог глотают pointerup: без этого поле осталось бы «нажатым»
let stopFocusLoss: (() => void) | undefined;

onMounted(() => {
    // the drag has its own ending in the gesture; the held − / + is stopped here / у протяжки свой конец в жесте; зажатую − / + останавливаем здесь
    stopFocusLoss = listenFocusLoss(() => stopHold());
});

// Escape while dragging: the value goes back to where it was, nothing is committed
// Escape во время протяжки: значение возвращается, где было, ничего не фиксируется
function onDragKey(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !drag?.moved) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    gesture.end('abort');
}

onBeforeUnmount(() => {
    stopFocusLoss?.();
    // a field that goes away mid-run commits nothing: nobody is left to hear it
    // поле, исчезающее посреди серии, ничего не фиксирует: слушать некому
    if (hold) {
        clearTimeout(hold.timer);
        hold = null;
        window.removeEventListener('keydown', onHoldKey, true);
    }
});

const atMin = computed(() => props.min !== undefined && model.value <= props.min);
const atMax = computed(() => props.max !== undefined && model.value >= props.max);
</script>

<template>
    <div
        v-bind="rootAttrs()"
        class="tao-drag-number"
        :class="[
            sizeClass(size),
            {
                'tao-drag-number--filled': variant === 'filled',
                'tao-drag-number--invalid': isInvalid,
                'tao-drag-number--focused': focused,
                'tao-drag-number--dragging': dragging,
                'tao-drag-number--disabled': disabled,
                'tao-drag-number--bare': !label,
            },
        ]"
    >
        <button
            v-if="controls"
            type="button"
            class="tao-drag-number__btn tao-drag-number__btn--dec"
            :aria-label="l10n.decrementLabel"
            tabindex="-1"
            :disabled="disabled || readOnly || atMin"
            @pointerdown="onButtonDown(-1, $event)"
            @pointerup="stopHold()"
            @pointercancel="stopHold()"
            @lostpointercapture="stopHold()"
            @contextmenu.prevent
            @click="onButtonClick(-1)"
        >
            <span aria-hidden="true">
                <slot name="decrement-icon"><TaoIcon name="tao-minus" /></slot>
            </span>
        </button>
        <div
            ref="fieldEl"
            class="tao-drag-number__field"
            v-on="gesture.events"
        >
            <span v-if="label" :id="labelId" class="tao-drag-number__label">{{ label }}</span>
            <input
                v-bind="{ ...controlAttrs(), ...nativeFieldAttrs(props) }"
                :id="controlId"
                ref="inputEl"
                class="tao-drag-number__input"
                type="text"
                inputmode="decimal"
                :autocomplete="(controlAttrs().autocomplete as string | undefined) ?? 'off'"
                spellcheck="false"
                role="spinbutton"
                :value="text"
                :style="{ width: `${Math.max(text.length, 1) + 0.5}ch` }"
                :disabled="disabled"
                :aria-labelledby="named() ? labelId : undefined"
                :aria-invalid="isInvalid || undefined"
                :aria-describedby="describedBy"
                :aria-valuenow="model"
                :aria-valuemin="min"
                :aria-valuemax="max"
                :aria-valuetext="valueText"
                @input="onInput"
                @focus="onFocus"
                @blur="onBlur"
                @keydown="onKeydown"
            />
            <span v-if="unit" class="tao-drag-number__unit" aria-hidden="true">{{ unit }}</span>
        </div>
        <button
            v-if="controls"
            type="button"
            class="tao-drag-number__btn tao-drag-number__btn--inc"
            :aria-label="l10n.incrementLabel"
            tabindex="-1"
            :disabled="disabled || readOnly || atMax"
            @pointerdown="onButtonDown(1, $event)"
            @pointerup="stopHold()"
            @pointercancel="stopHold()"
            @lostpointercapture="stopHold()"
            @contextmenu.prevent
            @click="onButtonClick(1)"
        >
            <span aria-hidden="true">
                <slot name="increment-icon"><TaoIcon name="tao-plus" /></slot>
            </span>
        </button>
    </div>
</template>

<style scoped>
.tao-drag-number {
    display: flex;
    width: 100%;
    min-width: calc(var(--tao-control-height) * 4);
    border-radius: var(--tao-radius-control);
    isolation: isolate;
    transition: var(--tao-transition-base);
}

.tao-drag-number__btn,
.tao-drag-number__field {
    height: var(--tao-control-height);
    margin: 0;
    border: 1px solid var(--tao-color-border-strong);
    background: var(--tao-color-input-bg);
    color: var(--tao-color-input-text);
    font-family: inherit;
    transition: var(--tao-transition-base);
}

.tao-drag-number__btn {
    /* 36px at medium: a little narrower than the field is high, the middle stays the main thing */
    /* 36px в medium: чуть уже, чем высота поля, главным остаётся середина */
    flex: 0 0 calc(var(--tao-control-height) * 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 0;
    overflow: hidden;
    color: var(--tao-color-text-muted);
    /* the icon follows the height of the field, as in TaoInputNumber / иконка следует высоте поля, как у TaoInputNumber */
    font-size: max(8px, calc(var(--tao-control-height) * 0.34));
    line-height: 1;
    cursor: pointer;
    /* a held button is a gesture: no text selection, no double-tap zoom, no long-press menu */
    /* зажатая кнопка — жест: без выделения текста, без зума двойным тапом, без меню долгого нажатия */
    user-select: none;
    touch-action: manipulation;
}

/* the line between a button and the field is the border of the field / линию между кнопкой и полем даёт рамка поля */
.tao-drag-number__btn--dec {
    border-right: 0;
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-drag-number__btn--inc {
    border-left: 0;
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

/* the first and the last cell of a field without buttons keep the rounded outer corners */
/* без кнопок поле само держит скруглённые внешние углы */
.tao-drag-number__field:first-child {
    border-radius: var(--tao-radius-control) 0 0 var(--tao-radius-control);
}

.tao-drag-number__field:last-child {
    border-radius: 0 var(--tao-radius-control) var(--tao-radius-control) 0;
}

.tao-drag-number__field:first-child:last-child {
    border-radius: var(--tao-radius-control);
}

/* a 24-grid icon squeezed to a small size: a crisp 1.5px line, as in TaoInputNumber */
/* иконка сетки 24 в малом размере: чёткая линия 1.5px, как у TaoInputNumber */
.tao-drag-number__btn :deep(.tao-icon__svg) {
    shape-rendering: crispEdges;
}

.tao-drag-number__btn :deep(.tao-icon__svg *) {
    vector-effect: non-scaling-stroke;
    stroke-width: 1.5px;
}

.tao-drag-number__btn:hover:not(:disabled) {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-hover);
}

.tao-drag-number__btn:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-drag-number__btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
}

/* ---------- The field: caption, number, unit; the whole of it is a handle to drag ---------- */
/* ---------- Поле: подпись, число, единица; всё оно — ручка протяжки ---------- */
.tao-drag-number__field {
    position: relative;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    min-width: 0;
    padding: 0 var(--tao-space-3);
    font-size: var(--tao-control-font-size);
    cursor: ew-resize;
    user-select: none;
    /* a finger moving sideways drags the value, moving up and down still scrolls the page */
    /* палец вбок тянет значение, вверх и вниз — по-прежнему прокручивает страницу */
    touch-action: pan-y;
}

/* no caption: the number sits in the middle / без подписи число стоит по центру */
.tao-drag-number--bare .tao-drag-number__field {
    justify-content: center;
}

.tao-drag-number__label {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    color: var(--tao-color-text-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
}

.tao-drag-number__input {
    flex: 0 0 auto;
    min-width: 0;
    max-width: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
    cursor: inherit;
}

.tao-drag-number__input:focus {
    outline: none;
    cursor: text;
}

.tao-drag-number__unit {
    flex: 0 0 auto;
    color: var(--tao-color-text-muted);
}

/* ---------- filled: a fill and no frame; a thin line stays only between a button and the field ---------- */
/* ---------- filled: заливка без рамки; тонкая линия остаётся только между кнопкой и полем ---------- */
.tao-drag-number--filled .tao-drag-number__btn,
.tao-drag-number--filled .tao-drag-number__field {
    border-color: transparent;
    background: color-mix(in srgb, var(--tao-color-text) 7%, transparent);
}

.tao-drag-number--filled .tao-drag-number__field:where(:not(:first-child)) {
    border-left-color: var(--tao-color-border);
}

.tao-drag-number--filled .tao-drag-number__field:where(:not(:last-child)) {
    border-right-color: var(--tao-color-border);
}

.tao-drag-number--filled .tao-drag-number__btn:hover:not(:disabled),
.tao-drag-number--filled .tao-drag-number__field:hover {
    background: color-mix(in srgb, var(--tao-color-text) 12%, transparent);
}

.tao-drag-number__field:hover {
    background: var(--tao-color-hover);
}

/* ---------- States / Состояния ---------- */
.tao-drag-number--focused,
.tao-drag-number--dragging {
    box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.tao-drag-number--focused .tao-drag-number__btn,
.tao-drag-number--focused .tao-drag-number__field,
.tao-drag-number--dragging .tao-drag-number__btn,
.tao-drag-number--dragging .tao-drag-number__field {
    border-color: var(--tao-color-accent);
}

/* the field being dragged is tinted: the number is a live one */
/* протягиваемое поле подкрашено: число живое */
.tao-drag-number--dragging .tao-drag-number__field {
    background: var(--tao-color-accent-subtle-hover);
}

.tao-drag-number--focused .tao-drag-number__field {
    cursor: text;
}

.tao-drag-number--invalid .tao-drag-number__btn,
.tao-drag-number--invalid .tao-drag-number__field {
    border-color: var(--tao-color-danger);
}

.tao-drag-number--invalid.tao-drag-number--focused,
.tao-drag-number--invalid.tao-drag-number--dragging {
    box-shadow: 0 0 0 2px var(--tao-color-danger-subtle);
}

.tao-drag-number--disabled .tao-drag-number__field {
    cursor: not-allowed;
    color: var(--tao-color-input-disabled-text);
    background: var(--tao-color-input-disabled-bg);
}

.tao-drag-number--disabled .tao-drag-number__btn {
    background: var(--tao-color-input-disabled-bg);
}

.tao-drag-number--disabled .tao-drag-number__label,
.tao-drag-number--disabled .tao-drag-number__unit {
    color: inherit;
}
</style>
