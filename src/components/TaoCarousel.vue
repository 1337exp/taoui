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
        /** How many slides fit in the viewport. 5 = product strip. 1 = one card. With `centered`: how many whole slides around the middle one. */
        perView?: number;
        /**
         * The current slide stands in the middle and is the biggest; the ones beside it shrink and the outer ones fade
         * (`peek` is how much of them shows at the edges). The arrows sit on the edges of the strip, move by one slide.
         * Текущий слайд стоит по центру и крупнее всех; соседние уменьшаются, дальние бледнеют (`peek` — сколько их видно
         * по краям). Стрелки лежат на краях ленты и листают по одному слайду.
         */
        centered?: boolean;
        controls?: boolean;
        /**
         * Time per slide in ms. 0 — off. The current indicator fills over this time and the slide changes when it is full.
         * Pauses on hover, keyboard focus, touch / drag and a hidden tab; off with reduced motion.
         * Время на слайд в мс. 0 — выключено. Текущий индикатор заливается за это время, по заполнении слайд меняется.
         */
        autoplay?: number;
        /**
         * Go round in a circle. With `centered` it is a seamless cycle: the empty places at the ends are taken by the slides
         * from the other end, so the slides are drawn 3 times (the extra copies are `inert` and `aria-hidden`; no ids, no refs in a slide).
         * Крутить по кругу. С `centered` — бесшовный цикл: пустоту по краям занимают слайды с другого конца, поэтому слайды
         * рисуются трижды (лишние копии `inert` и `aria-hidden`; id и ref в слайде не нужны).
         */
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
        centered: false,
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
/** The real slides (the copies of a cycle are not counted). / Настоящие слайды (копии цикла не считаются). */
const count = ref(0);
/** How many times the slides are drawn: 1, or an odd number in a centered loop (the middle set is the real one). / Сколько раз нарисованы слайды. */
const copies = ref(1);
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

const view = computed(() => Math.max(1, Math.round(props.perView)));
// centered: one slide is current, so a step is one slide however many are in view / по центру шаг — один слайд
const step = computed(() => (props.centered ? 1 : view.value));
const cyclic = computed(() => copies.value > 1);
/** Where the real set starts, in slides: the copies stand before and after it. / Где начинается настоящий набор, в слайдах. */
const base = computed(() => ((copies.value - 1) / 2) * count.value);
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
    '--tao-carousel-per-view': String(view.value),
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
    const first = el.children[0] as HTMLElement;
    let width = first.getBoundingClientRect().width;
    if (props.centered) {
        // the slide is drawn scaled by its distance from the middle: measure the layout width, not the drawn one
        // слайд нарисован в масштабе по расстоянию до центра: нужна ширина в раскладке, не нарисованная
        const scale = Number.parseFloat(getComputedStyle(first).scale);
        if (scale > 0) {
            width /= scale;
        }
    }
    return { width, gap, total: Math.round(el.children.length / copies.value) };
}

/** A cycle needs this many sets: on each side enough slides to fill the frame and a drag. / Сколько наборов нужно циклу. */
function wantedCopies(real: number) {
    if (!props.centered || !props.loop || real < 2) {
        return 1;
    }

    return 2 * Math.ceil((view.value + 1) / real) + 1;
}

/** The copies of a cycle are not for reading or focusing. / Копии цикла не для чтения и фокуса. */
function syncClones() {
    const el = track.value;
    if (!el) {
        return;
    }

    const real = count.value;
    const middle = (copies.value - 1) / 2;
    for (let i = 0; i < el.children.length; i++) {
        const slide = el.children[i] as HTMLElement;
        const copy = real > 0 ? Math.floor(i / real) : 0;
        if (copies.value > 1 && copy !== middle) {
            slide.setAttribute('aria-hidden', 'true');
            slide.setAttribute('inert', '');
            slide.setAttribute('data-tao-carousel-copy', '');
        } else if (slide.hasAttribute('data-tao-carousel-copy')) {
            slide.removeAttribute('aria-hidden');
            slide.removeAttribute('inert');
            slide.removeAttribute('data-tao-carousel-copy');
        }
    }
}

/**
 * A cycle rests in the middle set: after a move that ended in a copy, the strip jumps by whole sets, which looks the same.
 * Цикл стоит в среднем наборе: после движения, закончившегося в копии, лента прыгает на целые наборы — выглядит так же.
 */
function recenterCycle() {
    const el = track.value;
    if (!cyclic.value || !el || dragging.value || gliding.value) {
        return;
    }

    const { width, gap, total } = metrics();
    if (width <= 0 || total <= 0) {
        return;
    }

    const slot = Math.round(el.scrollLeft / (width + gap));
    const home = base.value + (((slot % total) + total) % total);
    if (home !== slot) {
        el.scrollLeft += (home - slot) * (width + gap);
        // The jump happens in `scrollend`, after this frame's scroll events: its own `scroll` comes a frame later, and that
        // frame would draw the slides in their new places with the old scale and fade. Write the distances now.
        // Прыжок идёт в `scrollend`, после scroll-событий этого кадра: свой `scroll` придёт кадром позже, и этот кадр
        // нарисовал бы слайды на новых местах со старым масштабом и бледностью (мерцание). Пишем расстояния сразу.
        updateFocus();
    }
}

/**
 * Centered: tells every slide how far it is from the middle (`--tao-carousel-d`, 0 … 2 slides); the CSS turns
 * that into a scale and a fade. Slide `i` stands in the middle at `scrollLeft = i * (width + gap)`, so the
 * distance is plain arithmetic, no measuring of the slides.
 * По центру: говорит каждому слайду, как далеко он от середины; CSS превращает это в масштаб и бледность.
 * Слайд `i` по центру при `scrollLeft = i * (width + gap)`, поэтому расстояние — арифметика, без замеров слайдов.
 */
function updateFocus() {
    const el = track.value;
    if (!props.centered || !el) {
        return;
    }

    const { width, gap } = metrics();
    if (width <= 0) {
        return;
    }

    const at = el.scrollLeft / (width + gap);
    // every drawn slide, the copies of a cycle too / все нарисованные слайды, и копии цикла
    for (let i = 0; i < el.children.length; i++) {
        const distance = Math.min(Math.abs(i - at), 2);
        (el.children[i] as HTMLElement).style.setProperty('--tao-carousel-d', distance.toFixed(3));
    }
}

function nearestIndex(scrollLeft?: number) {
    const { width, gap, total } = metrics();
    if (width <= 0 || total <= 0) {
        return 0;
    }

    const left = scrollLeft ?? track.value?.scrollLeft ?? 0;
    const slot = Math.round(left / (width + gap));
    if (cyclic.value) {
        return ((slot % total) + total) % total;
    }

    const last = Math.max(total - step.value, 0);
    return Math.min(Math.max(slot, 0), last);
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
    // the children are what the last render drew: `copies.value` sets of the real slides
    // дети — то, что нарисовал последний рендер: `copies.value` наборов настоящих слайдов
    count.value = Math.round((track.value?.children.length ?? 0) / copies.value);
    const wanted = wantedCopies(count.value);
    if (wanted !== copies.value) {
        copies.value = wanted;
        // the sets before the real one moved it: stand on the current slide again / набор перед настоящим сдвинул его
        nextTick(() => {
            goTo(index.value, true);
            updateFocus();
        });
    }
    syncClones();
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

    if (cyclic.value && total > 1) {
        // the nearest copy of the slide: forward from the last one is the first one, with no rewind
        // ближайшая копия слайда: вперёд от последнего — первый, без перемотки
        const slot = width + gap;
        const at = el.scrollLeft / slot;
        const home = ((next % total) + total) % total;
        let target = base.value + home;
        // an instant move (the start, a new width) stands in the real set; a smooth one takes the nearest copy
        // мгновенный ход (старт, новая ширина) — в настоящий набор; плавный — в ближайшую копию
        for (let copy = home; !instant && copy < total * copies.value; copy += total) {
            if (Math.abs(copy - at) < Math.abs(target - at)) {
                target = copy;
            }
        }

        el.scrollTo({ left: target * slot, behavior: prefersReducedMotion() || dragging.value || instant ? 'auto' : 'smooth' });
        setIndex(home);
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
    updateFocus();
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
    recenterCycle();
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
    recenterCycle();
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

// the slides change their width with the strip: keep the current one in the middle / слайды меняют ширину вместе с лентой
let resizeObserver: ResizeObserver | null = null;

function onTrackResize() {
    if (!props.centered || dragging.value || gliding.value) {
        return;
    }

    goTo(index.value, true);
    updateFocus();
}

onMounted(() => {
    refreshCount();
    mounted.value = true;
    reducedMotion.value = prefersReducedMotion();
    pageHidden.value = document.hidden;
    nextTick(() => {
        goTo(props.modelValue);
        updateFocus();
    });
    if (typeof ResizeObserver !== 'undefined' && track.value) {
        resizeObserver = new ResizeObserver(onTrackResize);
        resizeObserver.observe(track.value);
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('pagehide', onWindowBlur);
});

onUpdated(() => {
    refreshCount();
    updateFocus();
});

// the look and the number of sets change: stand on the current slide again / вид и число наборов меняются
watch(
    () => [props.centered, props.loop, props.perView] as const,
    () => {
        refreshCount();
        nextTick(() => {
            goTo(index.value, true);
            updateFocus();
        });
    },
);

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
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
        :class="{ 'tao-carousel--centered': centered }"
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
                    class="tao-carousel__nav tao-carousel__nav--prev"
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
                <template v-for="copy in copies" :key="copy">
                    <slot />
                </template>
            </div>

            <slot name="next" :disabled="atEnd" :go="goNext">
                <button
                    v-if="showControls"
                    type="button"
                    class="tao-carousel__nav tao-carousel__nav--next"
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

/*
 * centered: the current slide in the middle, the neighbours smaller, the outer ones faded.
 * The width of a slide leaves room for `peek` on both edges; two spacers let the first and the last stand in the middle.
 * `--tao-carousel-d` (0 … 2 slides from the middle) is written by the script on scroll; its steps can be restyled:
 * `--tao-carousel-scale-step` (scale lost per slide), `--tao-carousel-fade` (opacity lost between the 1st and 2nd slide),
 * `--tao-carousel-ring` (the ring around an arrow, the colour of what lies under the carousel).
 * По центру: текущий слайд посередине, соседние меньше, дальние бледнее. Ширина слайда оставляет место под `peek` с обеих
 * сторон; две распорки дают первому и последнему встать в середину. `--tao-carousel-d` пишет скрипт при прокрутке.
 */
.tao-carousel--centered {
    --_tao-carousel-nav: 40px;
    --_tao-carousel-slide: max(
        96px,
        calc(
            (100% - 2 * var(--tao-carousel-peek, 0px) - (var(--tao-carousel-per-view, 1) + 1) * var(--tao-space-3)) /
                var(--tao-carousel-per-view, 1)
        )
    );
    gap: var(--tao-space-4);
}

.tao-carousel--centered .tao-carousel__row {
    position: relative;
    /* the arrows hang half over the edge of the strip / стрелки наполовину свешиваются за край ленты */
    padding-inline: calc(var(--_tao-carousel-nav) / 2);
}

.tao-carousel--centered .tao-carousel__track::before,
.tao-carousel--centered .tao-carousel__track::after {
    content: '';
    flex: 0 0 auto;
    width: max(0px, calc((100% - var(--_tao-carousel-slide)) / 2 - var(--tao-space-3)));
}

.tao-carousel--centered .tao-carousel__track > :deep(*) {
    width: var(--_tao-carousel-slide);
    scroll-snap-align: center;
    scale: calc(1 - var(--tao-carousel-d, 0) * var(--tao-carousel-scale-step, 0.09));
    opacity: calc(1 - max(var(--tao-carousel-d, 0) - 1, 0) * var(--tao-carousel-fade, 0.55));
}

.tao-carousel--centered .tao-carousel__nav {
    position: absolute;
    top: 50%;
    z-index: 1;
    width: var(--_tao-carousel-nav);
    height: var(--_tao-carousel-nav);
    border: 3px solid var(--tao-carousel-ring, var(--tao-color-bg));
    background: var(--tao-color-accent);
    color: var(--tao-color-on-accent);
    transform: translateY(-50%);
}

.tao-carousel--centered .tao-carousel__nav:hover:not(:disabled) {
    background: var(--tao-color-accent-hover);
    color: var(--tao-color-on-accent);
}

.tao-carousel--centered .tao-carousel__nav--prev {
    inset-inline-start: 0;
}

.tao-carousel--centered .tao-carousel__nav--next {
    inset-inline-end: 0;
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
