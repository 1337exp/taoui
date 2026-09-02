<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue';

defineOptions({ name: 'TaoCarousel' });

const props = withDefaults(
    defineProps<{
        modelValue?: number;
        peek?: number;
        /** How many slides fit in the viewport. 5 = product strip. 1 = one card. */
        perView?: number;
        controls?: boolean;
        /** Interval in ms. 0 — off. Pauses on hover, focus, drag, and reduced motion. */
        autoplay?: number;
        loop?: boolean;
        /** Pips under the track: one per snap. Inactive are dots, the current one stretches into a pill. */
        dots?: boolean;
        ariaLabel?: string;
    }>(),
    {
        modelValue: 0,
        peek: 0,
        perView: 1,
        controls: true,
        autoplay: 0,
        loop: false,
        dots: false,
        ariaLabel: 'Лента',
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number];
}>();

defineSlots<{
    default(): unknown;
    prev(props: { disabled: boolean; go: () => void }): unknown;
    next(props: { disabled: boolean; go: () => void }): unknown;
    dots(props: { index: number; count: number; go: (next: number) => void }): unknown;
    dot(props: { active: boolean; index: number; go: () => void }): unknown;
}>();

const track = ref<HTMLElement | null>(null);
const index = ref(props.modelValue);
const count = ref(0);
const dragging = ref(false);
const hoverPaused = ref(false);
const focusPaused = ref(false);

let dragStartX = 0;
let dragStartScroll = 0;
let dragMoved = 0;
let dragPointer = -1;
let scrollFrame = 0;
let autoplayTimer = 0;

const step = computed(() => Math.max(1, Math.round(props.perView)));
const lastIndex = computed(() => Math.max(count.value - step.value, 0));
const atStart = computed(() => !props.loop && index.value <= 0);
const atEnd = computed(() => !props.loop && index.value >= lastIndex.value);
const snapCount = computed(() => (count.value <= 0 ? 0 : lastIndex.value + 1));
const showControls = computed(() => props.controls && count.value > step.value);
const showDots = computed(() => props.dots && snapCount.value > 1);

const trackStyle = computed(() => ({
    '--tao-carousel-peek': `${Math.max(props.peek, 0)}px`,
    '--tao-carousel-per-view': String(step.value),
}));

function prefersReducedMotion() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function metrics() {
    const el = track.value;
    if (!el || el.children.length === 0) {
        return { width: 0, gap: 0, total: 0 };
    }

    const styles = getComputedStyle(el);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0;
    const width = (el.children[0] as HTMLElement).getBoundingClientRect().width;
    return { width, gap, total: el.children.length };
}

function nearestIndex(scrollLeft?: number) {
    const { width, gap, total } = metrics();
    if (width <= 0 || total <= 0) {
        return 0;
    }

    const left = scrollLeft ?? track.value?.scrollLeft ?? 0;
    return Math.min(Math.max(Math.round(left / (width + gap)), 0), total - 1);
}

function setIndex(next: number) {
    if (next === index.value) {
        return;
    }

    index.value = next;
    emit('update:modelValue', next);
    emit('change', next);
}

function refreshCount() {
    count.value = track.value?.children.length ?? 0;
}

function goPrev() {
    goTo(index.value - step.value);
}

function goNext() {
    goTo(index.value + step.value);
}

function goTo(next: number) {
    const el = track.value;
    const { width, gap, total } = metrics();
    if (!el || width <= 0 || total <= 0) {
        return;
    }

    const last = Math.max(total - step.value, 0);
    let page = next;
    let wrapping = false;
    if (props.loop && total > step.value) {
        if (page > last) {
            page = 0;
            wrapping = true;
        } else if (page < 0) {
            page = last;
            wrapping = true;
        }
    } else {
        page = Math.min(Math.max(next, 0), last);
    }

    el.scrollTo({
        left: page * (width + gap),
        behavior: prefersReducedMotion() || dragging.value || wrapping ? 'auto' : 'smooth',
    });
    setIndex(page);
}

function stopAutoplay() {
    window.clearInterval(autoplayTimer);
    autoplayTimer = 0;
}

function canAutoplay() {
    return (
        props.autoplay > 0 &&
        count.value > step.value &&
        !hoverPaused.value &&
        !focusPaused.value &&
        !dragging.value &&
        typeof document !== 'undefined' &&
        !document.hidden &&
        !prefersReducedMotion()
    );
}

function tickAutoplay() {
    if (!canAutoplay()) {
        return;
    }

    if (!props.loop && index.value >= lastIndex.value) {
        stopAutoplay();
        return;
    }

    goTo(index.value + step.value);
}

function syncAutoplay() {
    stopAutoplay();
    if (!canAutoplay()) {
        return;
    }

    autoplayTimer = window.setInterval(tickAutoplay, props.autoplay);
}

function onMouseEnter() {
    hoverPaused.value = true;
    stopAutoplay();
}

function onMouseLeave() {
    hoverPaused.value = false;
    syncAutoplay();
}

function onFocusIn() {
    focusPaused.value = true;
    stopAutoplay();
}

function onFocusOut(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && root.contains(next)) {
        return;
    }

    focusPaused.value = false;
    syncAutoplay();
}

function onScroll() {
    if (dragging.value) {
        return;
    }

    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => {
        setIndex(nearestIndex());
    });
}

function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !track.value) {
        return;
    }

    dragPointer = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = track.value.scrollLeft;
    dragMoved = 0;
    dragging.value = true;
    track.value.setPointerCapture(event.pointerId);
}

function onPointerMove(event: PointerEvent) {
    if (!dragging.value || event.pointerId !== dragPointer || !track.value) {
        return;
    }

    const dx = event.clientX - dragStartX;
    dragMoved = Math.abs(dx);
    track.value.scrollLeft = dragStartScroll - dx;
}

function onPointerUp(event: PointerEvent) {
    if (!dragging.value || event.pointerId !== dragPointer) {
        return;
    }

    dragging.value = false;
    dragPointer = -1;
    goTo(nearestIndex());
    syncAutoplay();
}

function onClickCapture(event: MouseEvent) {
    if (dragMoved > 6) {
        event.preventDefault();
        event.stopPropagation();
        dragMoved = 0;
    }
}

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
        return;
    }

    if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
    }
}

watch(
    () => props.modelValue,
    (value) => {
        if (value !== index.value) {
            goTo(value);
        }
    },
);

watch(
    () => [props.autoplay, props.loop, count.value, dragging.value] as const,
    () => syncAutoplay(),
);

onMounted(() => {
    refreshCount();
    nextTick(() => {
        goTo(props.modelValue);
        syncAutoplay();
    });
    document.addEventListener('visibilitychange', syncAutoplay);
});

onUpdated(refreshCount);

onBeforeUnmount(() => {
    cancelAnimationFrame(scrollFrame);
    stopAutoplay();
    document.removeEventListener('visibilitychange', syncAutoplay);
});
</script>

<template>
    <div
        class="tao-carousel"
        :style="trackStyle"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @focusin="onFocusIn"
        @focusout="onFocusOut"
    >
        <div class="tao-carousel__row">
            <slot name="prev" :disabled="atStart" :go="goPrev">
                <button
                    v-if="showControls"
                    type="button"
                    class="tao-carousel__nav"
                    aria-label="Назад"
                    :disabled="atStart"
                    @click="goPrev"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M14.5 5 8 12l6.5 7"
                        />
                    </svg>
                </button>
            </slot>

            <div
                ref="track"
                class="tao-carousel__track"
                :class="{ 'tao-carousel__track--dragging': dragging }"
                role="region"
                :aria-label="ariaLabel"
                tabindex="0"
                @scroll="onScroll"
                @keydown="onKeydown"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
                @click.capture="onClickCapture"
            >
                <slot />
            </div>

            <slot name="next" :disabled="atEnd" :go="goNext">
                <button
                    v-if="showControls"
                    type="button"
                    class="tao-carousel__nav"
                    aria-label="Вперёд"
                    :disabled="atEnd"
                    @click="goNext"
                >
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
                        <path
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.5 5 16 12l-6.5 7"
                        />
                    </svg>
                </button>
            </slot>
        </div>

        <slot name="dots" :index="index" :count="snapCount" :go="goTo">
            <div v-if="showDots" class="tao-carousel__dots" role="group" aria-label="Слайды">
                <button
                    v-for="n in snapCount"
                    :key="n"
                    type="button"
                    class="tao-carousel__dot"
                    :class="{ 'tao-carousel__dot--active': n - 1 === index }"
                    :aria-label="`Слайд ${n} из ${snapCount}`"
                    :aria-current="n - 1 === index ? 'true' : undefined"
                    @click="goTo(n - 1)"
                >
                    <slot name="dot" :active="n - 1 === index" :index="n - 1" :go="() => goTo(n - 1)">
                        <span class="tao-carousel__pip" />
                    </slot>
                </button>
            </div>
        </slot>
    </div>
</template>

<style scoped>
.tao-carousel {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    width: 100%;
}

.tao-carousel__row {
    display: flex;
    align-items: center;
    gap: var(--tao-space-2);
    width: 100%;
}

.tao-carousel__track {
    display: flex;
    flex: 1 1 auto;
    gap: var(--tao-space-3);
    min-width: 0;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: 0;
    scrollbar-width: none;
    user-select: none;
    touch-action: pan-x;
    cursor: grab;
}

.tao-carousel__track::-webkit-scrollbar {
    display: none;
}

.tao-carousel__track--dragging {
    scroll-snap-type: none;
    cursor: grabbing;
}

.tao-carousel__track:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-carousel__track > :deep(*) {
    box-sizing: border-box;
    flex: 0 0 auto;
    width: max(
        96px,
        calc(
            (100% - var(--tao-carousel-peek, 0px) - (var(--tao-carousel-per-view, 1) - 1) * var(--tao-space-3)) /
                var(--tao-carousel-per-view, 1)
        )
    );
    min-width: 0;
    scroll-snap-align: start;
}

.tao-carousel__nav {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    margin: 0;
    padding: 0;
    border: 1px solid var(--tao-color-border-strong);
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-surface-sunken);
    color: var(--tao-color-text);
    font: inherit;
    font-size: 0;
    line-height: 0;
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-carousel__nav svg {
    display: block;
}

.tao-carousel__nav:hover:not(:disabled) {
    background: var(--tao-color-surface-hover);
    color: var(--tao-color-text-strong);
}

.tao-carousel__nav:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

.tao-carousel__nav:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.tao-carousel__dots {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px;
}

.tao-carousel__dot {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.tao-carousel__pip {
    display: block;
    width: 6px;
    height: 6px;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-border-strong);
    transition: width var(--tao-duration-base) var(--tao-ease-base), background var(--tao-duration-base) var(--tao-ease-base);
}

.tao-carousel__dot--active .tao-carousel__pip {
    width: 18px;
    background: var(--tao-color-accent);
}

.tao-carousel__dot:hover:not(.tao-carousel__dot--active) .tao-carousel__pip {
    background: var(--tao-color-text-muted);
}

.tao-carousel__dot:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-full);
}

@media (prefers-reduced-motion: reduce) {
    .tao-carousel__track {
        scroll-behavior: auto;
    }

    .tao-carousel__pip {
        transition: none;
    }
}
</style>
