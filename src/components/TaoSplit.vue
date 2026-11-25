<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePointerDrag } from '../primitives/usePointerDrag';
import { clamp } from '../primitives/number';
import type { TaoSplitDirection, TaoSplitUnit } from '../split';

defineOptions({ name: 'TaoSplit' });

const props = withDefaults(
    defineProps<{
        direction?: TaoSplitDirection;
        unit?: TaoSplitUnit;
        min?: number;
        max?: number;
        minEnd?: number;
        resizable?: boolean;
        step?: number;
        /**
         * Closes one pane: it is not drawn, the other fills the box, and the divider goes with it (no separator, no line, no gutter). The size is
         * kept in `v-model`, so the pane opens as it was.
         * Закрывает одну панель: она не рисуется, вторая занимает весь блок, а разделитель уходит вместе с ней (ни separator, ни линии, ни
         * зазора). Размер остаётся в `v-model`, поэтому панель откроется такой, какой была.
         */
        collapsed?: 'start' | 'end' | false;
        /**
         * Which pane `v-model` measures. `start` (default): the start pane, the end one takes the rest. `end`: the END pane, kept as it is when the
         * box is resized (a tool panel on the right or at the bottom). `min`, `max` and `step` then bound the end pane, and `minEnd` is the least
         * the start pane may shrink to.
         * Какую панель меряет `v-model`. `start` (по умолчанию): начальную, конечная занимает остальное. `end`: КОНЕЧНУЮ, при изменении блока она
         * остаётся как есть (панель инструментов справа или снизу). `min`, `max` и `step` тогда ограничивают конечную панель, а `minEnd` — до чего
         * может сжаться начальная.
         */
        anchor?: 'start' | 'end';
    }>(),
    {
        direction: 'row',
        unit: '%',
        min: 0,
        minEnd: 0,
        resizable: true,
        collapsed: false,
        anchor: 'start',
    },
);

const model = defineModel<number>({ default: 50 });

const emit = defineEmits<{
    /** The user finished changing: drag released or key. / Пользователь закончил менять: отпустил ручку или нажал клавишу. */
    commit: [value: number];
}>();

const rootRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const startPx = ref(0);
const available = ref(0);
const size = ref(model.value);

const isRow = computed(() => props.direction === 'row');
const stepValue = computed(() => props.step ?? (props.unit === '%' ? 1 : 8));
const ariaOrientation = computed(() => (isRow.value ? 'vertical' : 'horizontal'));

let dragStartPx = 0;
let dragStartValue = 0;
let dragStartCoord = 0;
let savedBodyCursor = '';
let savedHtmlCursor = '';
let savedUserSelect = '';
let resizeObserver: ResizeObserver | null = null;

function axisSize(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return isRow.value ? rect.width : rect.height;
}

function measureAvailable() {
    if (!rootRef.value || !handleRef.value) {
        return 0;
    }
    return Math.max(0, axisSize(rootRef.value) - axisSize(handleRef.value));
}

function toPx(value: number, avail: number) {
    if (avail <= 0) {
        return 0;
    }
    return props.unit === '%' ? (value / 100) * avail : value;
}

function fromPx(px: number, avail: number) {
    if (props.unit === '%') {
        if (avail <= 0) {
            return 0;
        }
        return Math.round((px / avail) * 10000) / 100;
    }
    return Math.round(px);
}

function valuesEqual(a: number, b: number) {
    if (props.unit === '%') {
        return Math.abs(a - b) < 0.005;
    }
    return Math.round(a) === Math.round(b);
}

const anchorEnd = computed(() => props.anchor === 'end');

// The model is the size of the ANCHORED pane (the start one, or the end one with `anchor="end"`); the box is laid out by the start pane.
// Модель — размер ЗАКРЕПЛЁННОЙ панели (начальной или конечной при `anchor="end"`); блок раскладывается по начальной панели.
const anchoredOf = (startPxValue: number, avail: number) => (anchorEnd.value ? avail - startPxValue : startPxValue);
const startOf = (anchoredPx: number, avail: number) => (anchorEnd.value ? avail - anchoredPx : anchoredPx);

function clampStartPx(desiredStartPx: number, avail: number) {
    return startOf(clampAnchoredPx(anchoredOf(desiredStartPx, avail), avail), avail);
}

function clampAnchoredPx(desiredPx: number, avail: number) {
    if (avail <= 0) {
        return 0;
    }

    const minStartPx = toPx(props.min, avail);
    const minEndPx = toPx(props.minEnd, avail);
    const maxStartPx = props.max != null ? toPx(props.max, avail) : Infinity;

    if (minStartPx + minEndPx > avail) {
        return clamp(desiredPx, 0, avail);
    }

    const lo = minStartPx;
    const hi = Math.min(maxStartPx, avail - minEndPx);
    return clamp(desiredPx, lo, Math.max(lo, hi));
}

function commit(next: number) {
    if (valuesEqual(next, size.value)) {
        size.value = next;
        return;
    }
    size.value = next;
    model.value = next;
}

function applyLayout(emitIfChanged: boolean) {
    const avail = measureAvailable();
    available.value = avail;
    const clamped = clampStartPx(startOf(toPx(size.value, avail), avail), avail);
    startPx.value = clamped;
    const next = fromPx(anchoredOf(clamped, avail), avail);
    if (emitIfChanged) {
        commit(next);
    }
}

function isRtl() {
    return !!rootRef.value && getComputedStyle(rootRef.value).direction === 'rtl';
}

function applyDragCursor() {
    savedBodyCursor = document.body.style.cursor;
    savedHtmlCursor = document.documentElement.style.cursor;
    savedUserSelect = document.body.style.userSelect;
    // a matching pair of system arrows: col-resize / row-resize are drawn as two different shapes on Windows
    // согласованная пара системных стрелок: col-resize / row-resize в Windows нарисованы по-разному
    const cursor = isRow.value ? 'ew-resize' : 'ns-resize';
    document.body.style.cursor = cursor;
    document.documentElement.style.cursor = cursor;
    document.body.style.userSelect = 'none';
}

function restoreDragCursor() {
    document.body.style.cursor = savedBodyCursor;
    document.documentElement.style.cursor = savedHtmlCursor;
    document.body.style.userSelect = savedUserSelect;
}

function setStartFromDelta(delta: number) {
    const avail = measureAvailable();
    available.value = avail;
    const nextPx = clampStartPx(dragStartPx + delta, avail);
    startPx.value = nextPx;
    commit(fromPx(anchoredOf(nextPx, avail), avail));
}

// The drag: the press, the moves and every way it ends (release, cancel, lost focus or capture, unmount) are the shared gesture.
// Протяжка: нажатие, движения и любой её конец (отпустили, отмена, потеря фокуса или захвата, размонтирование) — общий жест.
const drag = usePointerDrag({
    target: () => handleRef.value,
    onStart(event) {
        if (!props.resizable) {
            return false;
        }
        dragStartPx = startPx.value;
        dragStartValue = size.value;
        dragStartCoord = isRow.value ? event.clientX : event.clientY;
        applyDragCursor();
    },
    onMove(event) {
        const coord = isRow.value ? event.clientX : event.clientY;
        let delta = coord - dragStartCoord;
        if (isRow.value && isRtl()) {
            delta = -delta;
        }
        setStartFromDelta(delta);
    },
    onEnd(reason) {
        restoreDragCursor();
        applyLayout(true);
        if (reason !== 'unmount' && !valuesEqual(size.value, dragStartValue)) {
            emit('commit', size.value);
        }
    },
});
const isDragging = drag.dragging;

function ariaMax() {
    const avail = available.value;
    if (avail <= 0) {
        return props.max ?? (props.unit === '%' ? 100 - props.minEnd : 0);
    }
    const maxByEnd = fromPx(Math.max(0, avail - toPx(props.minEnd, avail)), avail);
    if (props.max == null) {
        return maxByEnd;
    }
    return Math.min(props.max, maxByEnd);
}

const ariaValueMin = computed(() => props.min);
const ariaValueMax = computed(() => ariaMax());
const ariaValueNow = computed(() => size.value);
const ariaValueText = computed(() => (props.unit === '%' ? `${size.value}%` : `${Math.round(size.value)}px`));

function onKeydown(event: KeyboardEvent) {
    const before = size.value;
    moveByKey(event);
    if (!valuesEqual(before, size.value)) {
        emit('commit', size.value);
    }
}

function moveByKey(event: KeyboardEvent) {
    if (!props.resizable) {
        return;
    }

    const avail = measureAvailable();
    available.value = avail;

    if (event.key === 'Home') {
        event.preventDefault();
        const nextPx = clampStartPx(startOf(toPx(props.min, avail), avail), avail);
        startPx.value = nextPx;
        commit(fromPx(anchoredOf(nextPx, avail), avail));
        return;
    }

    if (event.key === 'End') {
        event.preventDefault();
        const nextPx = clampStartPx(startOf(toPx(ariaMax(), avail), avail), avail);
        startPx.value = nextPx;
        commit(fromPx(anchoredOf(nextPx, avail), avail));
        return;
    }

    const primary =
        (isRow.value && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) ||
        (!isRow.value && (event.key === 'ArrowUp' || event.key === 'ArrowDown'));
    const secondary =
        (isRow.value && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) ||
        (!isRow.value && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'));

    if (!primary && !secondary) {
        return;
    }

    event.preventDefault();
    let dir = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    if (isRow.value && isRtl() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        dir = -dir;
    }

    // the handle moves toward the end: the start pane grows, so an anchored END pane shrinks
    // ручка идёт к концу: начальная панель растёт, значит закреплённая КОНЕЧНАЯ сжимается
    const nextModel = size.value + (anchorEnd.value ? -dir : dir) * stepValue.value;
    const nextPx = clampStartPx(startOf(toPx(nextModel, avail), avail), avail);
    startPx.value = nextPx;
    commit(fromPx(anchoredOf(nextPx, avail), avail));
}

watch(
    () => model.value,
    value => {
        if (isDragging.value) {
            return;
        }
        if (!valuesEqual(value, size.value)) {
            size.value = value;
            applyLayout(false);
        }
    },
);

watch(
    () => [props.unit, props.direction, props.min, props.max, props.minEnd, props.resizable, props.anchor] as const,
    () => {
        if (!isDragging.value) {
            applyLayout(true);
        }
    },
);

onMounted(() => {
    applyLayout(false);
    resizeObserver = new ResizeObserver(() => {
        if (isDragging.value) {
            return;
        }
        applyLayout(true);
    });
    if (rootRef.value) {
        resizeObserver.observe(rootRef.value);
    }
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;
});
</script>

<template>
    <div
        ref="rootRef"
        class="tao-split"
        :class="[
            `tao-split--${direction}`,
            {
                'tao-split--fixed': !resizable,
                [`tao-split--collapsed-${collapsed}`]: Boolean(collapsed),
                'tao-split--dragging': isDragging,
            },
        ]"
        :style="{ '--tao-split-start': `${startPx}px` }"
    >
        <div class="tao-split__pane tao-split__pane--start">
            <slot name="start" />
        </div>
        <div
            ref="handleRef"
            class="tao-split__handle"
            role="separator"
            :aria-orientation="ariaOrientation"
            :aria-valuemin="ariaValueMin"
            :aria-valuemax="ariaValueMax"
            :aria-valuenow="ariaValueNow"
            :aria-valuetext="ariaValueText"
            :aria-disabled="resizable ? undefined : true"
            :tabindex="resizable ? 0 : -1"
            v-on="drag.events"
            @keydown="onKeydown"
            @dragstart.prevent
        />
        <div class="tao-split__pane tao-split__pane--end">
            <slot name="end" />
        </div>
        <div v-if="isDragging" class="tao-split__shield" />
    </div>
</template>

<style scoped>
.tao-split {
    --tao-split-gutter: 8px;
    --tao-split-line: 1px;
    --tao-split-start: 50%;

    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    /* clip, а не только hidden: hidden-контейнер браузер всё равно прокручивает, когда фокус уходит на элемент за его краем (например
       галочка в нижней панели), и панель «отламывалась». clip не прокручивается совсем; hidden остаётся запасным для старых браузеров. */
    overflow: hidden;
    overflow: clip;
}

.tao-split--row {
    flex-direction: row;
}

.tao-split--column {
    flex-direction: column;
}

.tao-split__pane {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    overflow: clip; /* см. комментарий у .tao-split */
}

.tao-split__pane--start {
    flex: 0 0 var(--tao-split-start);
}

.tao-split__pane--end {
    flex: 1 1 0%;
}

/* a closed pane: not drawn, the divider with it, the other one fills the box / закрытая панель: не рисуется, разделитель с ней, вторая занимает блок */
.tao-split--collapsed-start > .tao-split__pane--start,
.tao-split--collapsed-end > .tao-split__pane--end,
.tao-split--collapsed-start > .tao-split__handle,
.tao-split--collapsed-end > .tao-split__handle {
    display: none;
}

.tao-split--collapsed-start > .tao-split__pane--end,
.tao-split--collapsed-end > .tao-split__pane--start {
    flex: 1 1 0%;
}

.tao-split__pane > :deep(.tao-split) {
    width: 100%;
    height: 100%;
}

.tao-split__handle {
    position: relative;
    flex: 0 0 var(--tao-split-gutter);
    z-index: 1;
    touch-action: none;
    user-select: none;
    background: transparent;
}

.tao-split--row > .tao-split__handle {
    cursor: ew-resize;
}

.tao-split--column > .tao-split__handle {
    cursor: ns-resize;
}

.tao-split--fixed > .tao-split__handle {
    cursor: default;
}

.tao-split__handle::before {
    content: '';
    position: absolute;
    background: var(--tao-color-border);
    pointer-events: none;
}

.tao-split--row > .tao-split__handle::before {
    top: 0;
    bottom: 0;
    left: 50%;
    width: var(--tao-split-line);
    transform: translateX(-50%);
}

.tao-split--column > .tao-split__handle::before {
    right: 0;
    left: 0;
    top: 50%;
    height: var(--tao-split-line);
    transform: translateY(-50%);
}

.tao-split__handle:hover::before,
.tao-split__handle:focus-visible::before,
.tao-split--dragging > .tao-split__handle::before {
    background: var(--tao-color-accent);
}

.tao-split--fixed > .tao-split__handle:hover::before {
    background: var(--tao-color-border);
}

.tao-split__handle:focus {
    outline: none;
}

.tao-split__handle:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: -2px;
}

.tao-split__shield {
    position: absolute;
    inset: 0;
    z-index: 2;
}
</style>
