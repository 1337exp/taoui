<script lang="ts" setup>
import TaoIcon from './TaoIcon.vue';
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue';
import { glideDuration, glideTarget as snapTarget } from '../carousel';
import { useLocaleText } from '../locale';

defineOptions({ name: 'TaoCarousel' });

const props = withDefaults(
    defineProps<{
        modelValue?: number;
        peek?: number;
        /** How many slides fit in the viewport. 5 = product strip. 1 = one card. */
        perView?: number;
        controls?: boolean;
        /**
         * Time per slide in ms. 0 — off. The current indicator fills over this time and the slide changes when it is full.
         * Pauses on hover, keyboard focus, touch / drag and a hidden tab; off with reduced motion.
         * Время на слайд в мс. 0 — выключено. Текущий индикатор заливается за это время, по заполнении слайд меняется.
         */
        autoplay?: number;
        loop?: boolean;
        /**
         * Under the track, one mark per snap: `dots` (the current one stretches into a pill), `bars` (equal bars),
         * `progress` (one bar: the fill of the current slide, or the position when there is no autoplay).
         * Под лентой, по метке на каждую позицию: `dots`, `bars` (полоски), `progress` (одна полоска).
         */
        indicator?: 'dots' | 'bars' | 'progress';
        /** With autoplay: a button that stops and resumes it (autoplay that moves for more than 5 s must be stoppable). / С autoplay: кнопка остановки и запуска. */
        pausable?: boolean;
        pauseLabel?: string;
        playLabel?: string;
        ariaLabel?: string;
        prevLabel?: string;
        nextLabel?: string;
        dotsLabel?: string;
        /** `{n}` и `{count}` — текущий слайд и всего. */
        slideLabel?: string;
    }>(),
    {
        modelValue: 0,
        peek: 0,
        perView: 1,
        controls: true,
        autoplay: 0,
        loop: false,
        indicator: undefined,
        pausable: true,
    },
);
const l10n = useLocaleText(props, 'carousel');

const emit = defineEmits<{
    'update:modelValue': [value: number];
    change: [value: number];
}>();

defineSlots<{
    default(): unknown;
    prev(props: { disabled: boolean; go: () => void }): unknown;
    next(props: { disabled: boolean; go: () => void }): unknown;
    'prev-icon'(): unknown;
    'next-icon'(): unknown;
    dots(props: { index: number; count: number; go: (next: number) => void }): unknown;
    dot(props: { active: boolean; index: number; go: () => void }): unknown;
}>();

const track = ref<HTMLElement | null>(null);
const index = ref(props.modelValue);
const count = ref(0);
const dragging = ref(false);
/** Momentum after a mouse drag: scroll-snap stays off until the glide lands on a slide. / Инерция после перетаскивания мышью. */
const gliding = ref(false);
const hoverPaused = ref(false);
const focusPaused = ref(false);
/** The user pressed the pause button. / Нажата кнопка паузы. */
const userPaused = ref(false);
const pageHidden = ref(false);
const mounted = ref(false);
const reducedMotion = ref(false);
/** Restarts the fill: a new key for every slide. / Перезапускает заливку: новый ключ на каждый слайд. */
const fillEpoch = ref(0);

let dragStartX = 0;
let dragStartScroll = 0;
let dragMoved = 0;
let dragPointer = -1;
let scrollFrame = 0;
let glideFrame = 0;
let settleTimer = 0;
/** Recent pointer positions for the release speed. / Последние позиции указателя — для скорости при отпускании. */
let samples: { x: number; t: number }[] = [];
let focusFrame = 0;

const step = computed(() => Math.max(1, Math.round(props.perView)));
const lastIndex = computed(() => Math.max(count.value - step.value, 0));
const atStart = computed(() => !props.loop && index.value <= 0);
const atEnd = computed(() => !props.loop && index.value >= lastIndex.value);
const snapCount = computed(() => (count.value <= 0 ? 0 : lastIndex.value + 1));
const showControls = computed(() => props.controls && count.value > step.value);
const showIndicator = computed(() => Boolean(props.indicator) && snapCount.value > 1);
// the fill exists while there is somewhere to go (after mount: the server cannot know about reduced motion)
const armed = computed(
    () =>
        mounted.value &&
        props.autoplay > 0 &&
        !reducedMotion.value &&
        count.value > step.value &&
        (props.loop || index.value < lastIndex.value),
);
const paused = computed(
    () => hoverPaused.value || focusPaused.value || dragging.value || gliding.value || userPaused.value || pageHidden.value,
);
const showToggle = computed(() => props.pausable && mounted.value && props.autoplay > 0 && !reducedMotion.value && count.value > step.value);
// the built-in indicator draws the fill; without one a hidden timer element keeps the time
const fillVisible = computed(() => showIndicator.value);
const fillStyle = computed(() => ({ animationDuration: `${props.autoplay}ms` }));
const progressRatio = computed(() => (snapCount.value > 0 ? (index.value + 1) / snapCount.value : 0));

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
    const last = Math.max(total - step.value, 0);
    return Math.min(Math.max(Math.round(left / (width + gap)), 0), last);
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

function goTo(next: number, instant = false) {
    cancelGlide();
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
        behavior: prefersReducedMotion() || dragging.value || wrapping || instant ? 'auto' : 'smooth',
    });
    setIndex(page);
}

/** The fill animation ended: time for the next slide. / Заливка закончилась: пора на следующий слайд. */
function onFillEnd() {
    if (armed.value && !paused.value) {
        goTo(index.value + step.value);
    }
}

function onMouseEnter() {
    hoverPaused.value = true;
}

function onMouseLeave() {
    hoverPaused.value = false;
}

function hasKeyboardFocus(root: HTMLElement) {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !root.contains(active)) {
        return false;
    }

    try {
        return active.matches(':focus-visible');
    } catch {
        return true;
    }
}

function scheduleFocusPause(event: FocusEvent) {
    const root = event.currentTarget as HTMLElement;
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(() => {
        if (!track.value) {
            return;
        }

        focusPaused.value = hasKeyboardFocus(root);
    });
}

function onScroll() {
    if (dragging.value || gliding.value) {
        return;
    }

    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => setIndex(nearestIndex()));

    // No scrollend (older Safari): treat a short pause as the end. / Нет scrollend — конец по короткой паузе.
    if (!supportsScrollEnd()) {
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(settle, 150);
    }
}

function supportsScrollEnd() {
    return typeof window !== 'undefined' && 'onscrollend' in window;
}

/**
 * Wheel / trackpad scroll freely (no CSS snap on fine pointers) and only when it has fully stopped
 * the strip eases onto the nearest whole slide. Touch keeps native snap, see CSS.
 * Колёсико и тачпад крутят свободно (на мыши CSS-snap выключен), и только после полной остановки
 * полоса мягко доезжает до ближайшей целой карточки. На таче — родной snap, см. CSS.
 */
function settle() {
    window.clearTimeout(settleTimer);
    const el = track.value;
    if (!el || dragging.value || gliding.value || getComputedStyle(el).scrollSnapType !== 'none') {
        return;
    }

    const max = el.scrollWidth - el.clientWidth;
    // The very end may sit between snap points — leave it there. / Самый конец может быть между точками — оставляем.
    if (el.scrollLeft >= max - 1) {
        return;
    }

    const target = glideTarget(el.scrollLeft, 0);
    if (Math.abs(target - el.scrollLeft) >= 1) {
        glideTo(target, 0);
    }
}

/** New wheel / touch input takes over from a settling glide. / Новый ввод колёсиком или пальцем перебивает доводку. */
function onUserScrollInput() {
    if (!dragging.value) {
        cancelGlide();
    }
}

function recordSample(x: number) {
    const t = performance.now();
    samples.push({ x, t });
    while (samples.length > 2 && t - samples[0]!.t > 100) {
        samples.shift();
    }
}

/** Scroll speed at release, px/ms; 0 if the pointer stood still before letting go. / Скорость прокрутки при отпускании. */
function releaseVelocity() {
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (!first || !last || last.t === first.t || performance.now() - last.t > 80) {
        return 0;
    }
    // pointer moves right → content scrolls left / указатель вправо → прокрутка влево
    return -(last.x - first.x) / (last.t - first.t);
}

function cancelGlide() {
    if (!glideFrame) {
        return;
    }
    cancelAnimationFrame(glideFrame);
    glideFrame = 0;
    gliding.value = false;
}

/** Where momentum would stop, rounded to a whole slide. / Где остановит инерция, с точностью до целого слайда. */
function glideTarget(from: number, velocity: number) {
    const el = track.value;
    const { width, gap } = metrics();
    if (!el || width <= 0) {
        return from;
    }

    return snapTarget(from, velocity, width + gap, el.scrollWidth - el.clientWidth);
}

function finishGlide() {
    glideFrame = 0;
    gliding.value = false;
    setIndex(nearestIndex());
}

/**
 * Ease-out from the current position to `target`. Its starting speed matches the release speed,
 * so the strip keeps moving the way it was thrown and settles on a slide.
 * Плавно к `target`; начальная скорость равна скорости броска — полоса не дёргается и встаёт на слайд.
 */
function glideTo(target: number, velocity: number) {
    const el = track.value;
    if (!el) {
        return;
    }

    cancelGlide();
    const from = el.scrollLeft;
    const distance = target - from;
    setIndex(nearestIndex(target));

    if (Math.abs(distance) < 1 || prefersReducedMotion()) {
        el.scrollLeft = target;
        return;
    }

    const duration = glideDuration(distance, velocity);
    const start = performance.now();
    gliding.value = true;

    const frame = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        el.scrollLeft = from + distance * (1 - (1 - t) ** 3);
        if (t < 1) {
            glideFrame = requestAnimationFrame(frame);
            return;
        }
        finishGlide();
    };
    glideFrame = requestAnimationFrame(frame);
}

function releaseDragCapture() {
    const el = track.value;
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

function endDrag(keepClickGuard = false) {
    if (!dragging.value) {
        return;
    }

    dragging.value = false;
    releaseDragCapture();
    dragPointer = -1;
    if (!keepClickGuard) {
        dragMoved = 0;
    }

    const el = track.value;
    const velocity = releaseVelocity();
    samples = [];
    if (el) {
        glideTo(glideTarget(el.scrollLeft, velocity), velocity);
        return;
    }
}

function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !track.value) {
        return;
    }

    // grabbing a moving strip stops it where it is / схватить летящую полосу — остановить её на месте
    cancelGlide();
    dragPointer = event.pointerId;
    dragStartX = event.clientX;
    dragStartScroll = track.value.scrollLeft;
    dragMoved = 0;
    samples = [];
    recordSample(event.clientX);
    dragging.value = true;
    try {
        track.value.setPointerCapture(event.pointerId);
    } catch {
        /* untrusted events / capture already gone */
    }
}

function onPointerMove(event: PointerEvent) {
    if (!dragging.value || event.pointerId !== dragPointer || !track.value) {
        return;
    }

    const dx = event.clientX - dragStartX;
    dragMoved = Math.max(dragMoved, Math.abs(dx));
    recordSample(event.clientX);
    track.value.scrollLeft = dragStartScroll - dx;
}

function onPointerEnd(event: PointerEvent) {
    if (!dragging.value) {
        return;
    }
    if (dragPointer !== -1 && event.pointerId !== dragPointer) {
        return;
    }

    endDrag(true);
}

function onLostPointerCapture() {
    endDrag();
}

function onWindowBlur() {
    endDrag();
    hoverPaused.value = false;
}

function onVisibilityChange() {
    pageHidden.value = document.hidden;
    if (document.hidden) {
        endDrag();
        hoverPaused.value = false;
    }
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

// any change of slide (by hand, by a key, by the fill) starts the fill again
watch(
    () => [index.value, props.autoplay] as const,
    () => {
        fillEpoch.value += 1;
    },
);

onMounted(() => {
    refreshCount();
    mounted.value = true;
    reducedMotion.value = prefersReducedMotion();
    pageHidden.value = document.hidden;
    nextTick(() => {
        goTo(props.modelValue);
    });
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('pagehide', onWindowBlur);
});

onUpdated(refreshCount);

onBeforeUnmount(() => {
    endDrag();
    cancelGlide();
    window.clearTimeout(settleTimer);
    cancelAnimationFrame(scrollFrame);
    cancelAnimationFrame(focusFrame);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('blur', onWindowBlur);
    window.removeEventListener('pagehide', onWindowBlur);
});
</script>

<template>
    <div
        class="tao-carousel"
        :style="trackStyle"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @focusin="scheduleFocusPause"
        @focusout="scheduleFocusPause"
    >
        <div class="tao-carousel__row">
            <slot name="prev" :disabled="atStart" :go="goPrev">
                <button
                    v-if="showControls"
                    type="button"
                    class="tao-carousel__nav"
                    :aria-label="l10n.prevLabel"
                    :disabled="atStart"
                    @click="goPrev"
                >
                    <span aria-hidden="true">
                        <slot name="prev-icon">
                            <TaoIcon name="tao-chevron-left" :size="16" />
                        </slot>
                    </span>
                </button>
            </slot>

            <div
                ref="track"
                class="tao-carousel__track"
                :class="{ 'tao-carousel__track--dragging': dragging, 'tao-carousel__track--gliding': gliding }"
                role="region"
                :aria-label="l10n.ariaLabel"
                tabindex="0"
                @scroll="onScroll"
                @scrollend="settle"
                @wheel.passive="onUserScrollInput"
                @touchstart.passive="onUserScrollInput"
                @keydown="onKeydown"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerEnd"
                @pointercancel="onPointerEnd"
                @lostpointercapture="onLostPointerCapture"
                @click.capture="onClickCapture"
            >
                <slot />
            </div>

            <slot name="next" :disabled="atEnd" :go="goNext">
                <button
                    v-if="showControls"
                    type="button"
                    class="tao-carousel__nav"
                    :aria-label="l10n.nextLabel"
                    :disabled="atEnd"
                    @click="goNext"
                >
                    <span aria-hidden="true">
                        <slot name="next-icon">
                            <TaoIcon name="tao-chevron-right" :size="16" />
                        </slot>
                    </span>
                </button>
            </slot>
        </div>

        <div v-if="showIndicator || showToggle || armed" class="tao-carousel__footer">
            <slot name="dots" :index="index" :count="snapCount" :go="goTo">
                <div v-if="showIndicator" class="tao-carousel__indicator" :class="`tao-carousel__indicator--${indicator}`" role="group" :aria-label="l10n.dotsLabel">
                    <div v-if="indicator === 'progress'" class="tao-carousel__bar">
                        <span
                            v-if="armed"
                            :key="fillEpoch"
                            class="tao-carousel__fill"
                            :class="{ 'tao-carousel__fill--paused': paused }"
                            :style="fillStyle"
                            @animationend="onFillEnd"
                        />
                        <span v-else class="tao-carousel__position" :style="{ transform: `scaleX(${progressRatio})` }" />
                    </div>
                    <template v-else>
                        <button
                            v-for="n in snapCount"
                            :key="n"
                            type="button"
                            class="tao-carousel__dot"
                            :class="{ 'tao-carousel__dot--active': n - 1 === index }"
                            :aria-label="l10n.slideLabel.replace('{n}', String(n)).replace('{count}', String(snapCount))"
                            :aria-current="n - 1 === index ? 'true' : undefined"
                            @click="goTo(n - 1)"
                        >
                            <slot name="dot" :active="n - 1 === index" :index="n - 1" :go="() => goTo(n - 1)">
                                <span class="tao-carousel__pip" :class="{ 'tao-carousel__pip--filling': n - 1 === index && armed }">
                                    <span
                                        v-if="n - 1 === index && armed"
                                        :key="fillEpoch"
                                        class="tao-carousel__fill"
                                        :class="{ 'tao-carousel__fill--paused': paused }"
                                        :style="fillStyle"
                                        @animationend="onFillEnd"
                                    />
                                </span>
                            </slot>
                        </button>
                    </template>
                </div>
            </slot>

            <button
                v-if="showToggle"
                type="button"
                class="tao-carousel__toggle"
                :aria-label="userPaused ? l10n.playLabel : l10n.pauseLabel"
                :aria-pressed="userPaused"
                @click="userPaused = !userPaused"
            >
                <TaoIcon :name="userPaused ? 'tao-play' : 'tao-pause'" :size="12" />
            </button>

            <!-- no built-in indicator to fill (none, or your own `dots` slot): an invisible one keeps the time -->
            <span v-if="armed && (!fillVisible || $slots.dots)" class="tao-carousel__timer" aria-hidden="true">
                <span
                    :key="fillEpoch"
                    class="tao-carousel__fill"
                    :class="{ 'tao-carousel__fill--paused': paused }"
                    :style="fillStyle"
                    @animationend="onFillEnd"
                />
            </span>
        </div>
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
    /* Mouse / trackpad: free scroll, JS eases onto a slide after it stops (settle). / Мышь, тачпад: свободно, доводит JS. */
    scroll-snap-type: none;
    scroll-padding-inline: 0;
    scrollbar-width: none;
    user-select: none;
    touch-action: pan-x;
    cursor: grab;
}

/* Touch: native snap is smooth under the finger and lands flings on a slide. / Тач: родной snap плавный и сам доводит бросок. */
@media (pointer: coarse) {
    .tao-carousel__track {
        scroll-snap-type: x mandatory;
    }
}

.tao-carousel__track::-webkit-scrollbar {
    display: none;
}

.tao-carousel__track--dragging {
    scroll-snap-type: none;
    cursor: grabbing;
}

/* Momentum drives scrollLeft itself and lands on a slide; snap would fight it. / Инерция сама ведёт scrollLeft до слайда — snap бы мешал. */
.tao-carousel__track--gliding {
    scroll-snap-type: none;
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

.tao-carousel__nav .tao-icon {
    display: block;
}

.tao-carousel__nav:hover:not(:disabled) {
    background: var(--tao-color-hover);
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

.tao-carousel__footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--tao-space-2);
}

.tao-carousel__indicator {
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
    position: relative;
    display: block;
    width: 6px;
    height: 6px;
    overflow: hidden;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-border-strong);
    transition: width var(--tao-duration-base) var(--tao-ease-base), background var(--tao-duration-base) var(--tao-ease-base);
}

.tao-carousel__dot--active .tao-carousel__pip {
    width: 18px;
    background: var(--tao-color-accent);
}

/* with autoplay the current mark is the empty track and the fill runs over it */
.tao-carousel__dot--active .tao-carousel__pip--filling {
    background: var(--tao-color-border-strong);
}

.tao-carousel__dot:hover:not(.tao-carousel__dot--active) .tao-carousel__pip {
    background: var(--tao-color-text-muted);
}

.tao-carousel__dot:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
    border-radius: var(--tao-radius-full);
}

/* bars: equal wide marks */
.tao-carousel__indicator--bars {
    gap: var(--tao-space-1);
}

.tao-carousel__indicator--bars .tao-carousel__dot {
    width: 32px;
    height: 20px;
}

.tao-carousel__indicator--bars .tao-carousel__pip,
.tao-carousel__indicator--bars .tao-carousel__dot--active .tao-carousel__pip {
    width: 100%;
    height: 4px;
}

.tao-carousel__indicator--bars .tao-carousel__dot:hover:not(.tao-carousel__dot--active) .tao-carousel__pip {
    background: var(--tao-color-text-muted);
}

/* progress: one bar */
.tao-carousel__indicator--progress {
    flex: 1 1 auto;
}

.tao-carousel__bar {
    position: relative;
    width: 100%;
    height: 4px;
    overflow: hidden;
    border-radius: var(--tao-radius-full);
    background: var(--tao-color-border-strong);
}

.tao-carousel__position {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--tao-color-accent);
    transform-origin: left;
    transition: transform var(--tao-duration-slow) var(--tao-ease-base);
}

/* The fill is the only clock of autoplay: it runs for the interval, and its end moves to the next slide.
   Заливка — единственные часы autoplay: идёт весь интервал, по её окончании — следующий слайд. */
.tao-carousel__fill {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: var(--tao-color-accent);
    transform-origin: left;
    transform: scaleX(0);
    animation-name: tao-carousel-fill;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

.tao-carousel__fill--paused {
    animation-play-state: paused;
}

@keyframes tao-carousel-fill {
    to {
        transform: scaleX(1);
    }
}

.tao-carousel__timer {
    position: relative;
    display: block;
    width: 0;
    height: 0;
    overflow: hidden;
}

.tao-carousel__toggle {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: var(--tao-radius-full);
    background: transparent;
    color: var(--tao-color-text-muted);
    cursor: pointer;
    transition: var(--tao-transition-base);
}

.tao-carousel__toggle:hover {
    color: var(--tao-color-text-strong);
    background: var(--tao-color-hover);
}

.tao-carousel__toggle:focus-visible {
    outline: 2px solid var(--tao-color-accent);
    outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
    .tao-carousel__track {
        scroll-behavior: auto;
    }

    .tao-carousel__pip,
    .tao-carousel__position {
        transition: none;
    }
}
</style>
