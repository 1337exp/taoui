<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { listenFocusLoss } from '../focusLoss';
import type { TaoSplitDirection, TaoSplitUnit } from '../split';

defineOptions({ name: 'TaoSplit' });

const props = withDefaults(
    defineProps<{
        modelValue?: number;
        direction?: TaoSplitDirection;
        unit?: TaoSplitUnit;
        min?: number;
        max?: number;
        minEnd?: number;
        resizable?: boolean;
        step?: number;
    }>(),
    {
        modelValue: 50,
        direction: 'row',
        unit: '%',
        min: 0,
        minEnd: 0,
        resizable: true,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number];
}>();

const rootRef = ref<HTMLElement | null>(null);
const handleRef = ref<HTMLElement | null>(null);
const startPx = ref(0);
const available = ref(0);
const isDragging = ref(false);

const size = ref(props.modelValue);

const isRow = computed(() => props.direction === 'row');
const stepValue = computed(() => props.step ?? (props.unit === '%' ? 1 : 8));
const ariaOrientation = computed(() => (isRow.value ? 'vertical' : 'horizontal'));

let dragPointer = -1;
let dragStartPx = 0;
let dragStartCoord = 0;
let savedBodyCursor = '';
let savedHtmlCursor = '';
let savedUserSelect = '';
let resizeObserver: ResizeObserver | null = null;
let stopFocusLoss: (() => void) | undefined;

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

function clampStartPx(desiredPx: number, avail: number) {
    if (avail <= 0) {
        return 0;
    }

    const minStartPx = toPx(props.min, avail);
    const minEndPx = toPx(props.minEnd, avail);
    const maxStartPx = props.max != null ? toPx(props.max, avail) : Infinity;

    if (minStartPx + minEndPx > avail) {
        return Math.min(Math.max(desiredPx, 0), avail);
    }

    const lo = minStartPx;
    const hi = Math.min(maxStartPx, avail - minEndPx);
    return Math.min(Math.max(desiredPx, lo), Math.max(lo, hi));
}

function commit(next: number) {
    if (valuesEqual(next, size.value)) {
        size.value = next;
        return;
    }
    size.value = next;
    emit('update:modelValue', next);
}

function applyLayout(emitIfChanged: boolean) {
    const avail = measureAvailable();
    available.value = avail;
    const clamped = clampStartPx(toPx(size.value, avail), avail);
    startPx.value = clamped;
    const next = fromPx(clamped, avail);
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
    const cursor = isRow.value ? 'col-resize' : 'row-resize';
    document.body.style.cursor = cursor;
    document.documentElement.style.cursor = cursor;
    document.body.style.userSelect = 'none';
}

function restoreDragCursor() {
    document.body.style.cursor = savedBodyCursor;
    document.documentElement.style.cursor = savedHtmlCursor;
    document.body.style.userSelect = savedUserSelect;
}

function releaseDragCapture() {
    const el = handleRef.value;
    const id = dragPointer;
    if (!el || id === -1) {
        return;
    }
    if (typeof el.hasPointerCapture === 'function' && !el.hasPointerCapture(id)) {
        return;
    }
    try {
        el.releasePointerCapture(id);
    } catch {
        /* already released by the browser */
    }
}

function endDrag() {
    if (!isDragging.value) {
        return;
    }
    isDragging.value = false;
    releaseDragCapture();
    dragPointer = -1;
    restoreDragCursor();
    applyLayout(true);
}

function setStartFromDelta(delta: number) {
    const avail = measureAvailable();
    available.value = avail;
    const nextPx = clampStartPx(dragStartPx + delta, avail);
    startPx.value = nextPx;
    commit(fromPx(nextPx, avail));
}

function onPointerDown(event: PointerEvent) {
    if (!props.resizable || event.button !== 0 || !handleRef.value) {
        return;
    }

    dragPointer = event.pointerId;
    isDragging.value = true;
    dragStartPx = startPx.value;
    dragStartCoord = isRow.value ? event.clientX : event.clientY;
    applyDragCursor();
    event.preventDefault();
    try {
        handleRef.value.setPointerCapture(event.pointerId);
    } catch {
        /* untrusted events / capture already gone */
    }
}

function onPointerMove(event: PointerEvent) {
    if (!isDragging.value || event.pointerId !== dragPointer) {
        return;
    }
    const coord = isRow.value ? event.clientX : event.clientY;
    let delta = coord - dragStartCoord;
    if (isRow.value && isRtl()) {
        delta = -delta;
    }
    setStartFromDelta(delta);
}

function onPointerEnd(event: PointerEvent) {
    if (!isDragging.value) {
        return;
    }
    if (dragPointer !== -1 && event.pointerId !== dragPointer) {
        return;
    }
    endDrag();
}

function onLostPointerCapture() {
    endDrag();
}

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
    if (!props.resizable) {
        return;
    }

    const avail = measureAvailable();
    available.value = avail;

    if (event.key === 'Home') {
        event.preventDefault();
        const nextPx = clampStartPx(toPx(props.min, avail), avail);
        startPx.value = nextPx;
        commit(fromPx(nextPx, avail));
        return;
    }

    if (event.key === 'End') {
        event.preventDefault();
        const nextPx = clampStartPx(toPx(ariaMax(), avail), avail);
        startPx.value = nextPx;
        commit(fromPx(nextPx, avail));
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

    const nextModel = size.value + dir * stepValue.value;
    const nextPx = clampStartPx(toPx(nextModel, avail), avail);
    startPx.value = nextPx;
    commit(fromPx(nextPx, avail));
}

watch(
    () => props.modelValue,
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
    () => [props.unit, props.direction, props.min, props.max, props.minEnd, props.resizable] as const,
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
    stopFocusLoss = listenFocusLoss(endDrag);
});

onBeforeUnmount(() => {
    endDrag();
    resizeObserver?.disconnect();
    resizeObserver = null;
    stopFocusLoss?.();
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
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerEnd"
            @pointercancel="onPointerEnd"
            @lostpointercapture="onLostPointerCapture"
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
    overflow: hidden;
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
}

.tao-split__pane--start {
    flex: 0 0 var(--tao-split-start);
}

.tao-split__pane--end {
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
    cursor: col-resize;
}

.tao-split--column > .tao-split__handle {
    cursor: row-resize;
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
