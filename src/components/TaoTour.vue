<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import TaoButton from './TaoButton.vue';
import { useFloating, type TaoPlacement } from '../floating';
import { getFocusable, trapTab } from '../focusTrap';
import { useLayer } from '../layers';
import { formatText, useLocaleText } from '../locale';
import { holeClipPath, isInView, resolveTourTarget, spotlightRect, type TaoTourStep, type TourRect } from '../tour';

defineOptions({ name: 'TaoTour' });

interface Props {
    /** The step on screen; `null` closes the tour. / Шаг на экране; `null` закрывает тур. */
    step?: TaoTourStep | null;
    /** The place of the step in the tour, from 0. / Место шага в туре, с 0. */
    index?: number;
    /** How many steps there are. / Сколько всего шагов. */
    count?: number;
    /** No Back button. By default the first step (`index` 0). / Без кнопки «Назад». По умолчанию — первый шаг. */
    first?: boolean;
    /** The button says Done instead of Next. By default the last step. / Кнопка говорит «Готово» вместо «Далее». По умолчанию — последний шаг. */
    last?: boolean;
    /** Where the card stands against the target when the step does not say. / Где карточка относительно цели, если шаг не говорит. */
    placement?: TaoPlacement;
    /** Space between the target and the edge of the lit window, px. / Отступ от цели до края освещённого окна, px. */
    padding?: number;
    /** The target can be clicked (a "press here" step); the rest of the page stays shut. / Цель можно нажимать (шаг «нажмите здесь»); остальная страница закрыта. */
    interactive?: boolean;
    nextLabel?: string;
    prevLabel?: string;
    skipLabel?: string;
    doneLabel?: string;
    /** `{n}` of `{count}`. / `{n}` из `{count}`. */
    progressLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
    step: null,
    index: 0,
    count: 0,
    first: undefined,
    last: undefined,
    placement: 'bottom',
    padding: 6,
    interactive: false,
    nextLabel: undefined,
    prevLabel: undefined,
    skipLabel: undefined,
    doneLabel: undefined,
    progressLabel: undefined,
});

const emit = defineEmits<{
    next: [];
    prev: [];
    skip: [];
}>();

const l10n = useLocaleText(props, 'tour');
const open = computed(() => props.step !== null);
const isFirst = computed(() => props.first ?? props.index <= 0);
const isLast = computed(() => props.last ?? props.index >= props.count - 1);

const cardRef = ref<HTMLElement | null>(null);
const targetEl = ref<HTMLElement | null>(null);
const rect = ref<TourRect | null>(null);
const titleId = useId();
const textId = useId();

// the Escape of the top layer; focus goes back where it was when the tour ends
// Escape верхнего слоя; когда тур закончился, фокус возвращается туда, где он был
useLayer(open, { onEscape: () => emit('skip'), restoreFocus: true });

const floating = useFloating(targetEl, cardRef, () => open.value && targetEl.value !== null, {
    placement: () => props.step?.placement ?? props.placement,
    gap: 8 + props.padding,
    fixed: true,
});

const hole = computed(() => (rect.value ? spotlightRect(rect.value, props.padding) : null));
const viewport = ref({ width: 0, height: 0 });
const hasTarget = computed(() => targetEl.value !== null && hole.value !== null);

const holeStyle = computed(() => {
    const h = hole.value;
    return h ? { top: `${h.top}px`, left: `${h.left}px`, width: `${h.width}px`, height: `${h.height}px` } : {};
});

// the blocker shuts the page; with `interactive` it has a hole where the target is
// щит закрывает страницу; при `interactive` в нём дыра там, где цель
const blockerStyle = computed(() => {
    if (!props.interactive || !hole.value) {
        return {};
    }
    return { clipPath: holeClipPath(hole.value, viewport.value, 8) };
});

const cardStyle = computed(() => (hasTarget.value ? floating.style.value : {}));
const arrowStyle = computed(() => {
    const el = cardRef.value;
    if (!hasTarget.value || !el) {
        return {};
    }
    const pad = 14;
    const { x, y } = floating.anchorOffset.value;
    if (floating.side.value === 'top' || floating.side.value === 'bottom') {
        return { left: `${Math.min(el.offsetWidth - pad, Math.max(pad, x))}px` };
    }
    return { top: `${Math.min(el.offsetHeight - pad, Math.max(pad, y))}px` };
});

const progress = computed(() => formatText(l10n.value.progressLabel, { n: props.index + 1, count: props.count }));
const dots = computed(() => Array.from({ length: Math.max(0, props.count) }, (_, i) => i));

function measure() {
    const el = targetEl.value;
    viewport.value = { width: window.innerWidth, height: window.innerHeight };
    if (!el || !el.isConnected) {
        rect.value = null;
        return;
    }
    const r = el.getBoundingClientRect();
    rect.value = { top: r.top, left: r.left, width: r.width, height: r.height };
}

let frame = 0;
function onViewportChange() {
    if (frame) {
        return;
    }
    frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
        floating.update();
    });
}

let resizeObserver: ResizeObserver | null = null;

function stopWatching() {
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('resize', onViewportChange);
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
    }
}

async function focusCard() {
    await nextTick();
    const card = cardRef.value;
    if (!card) {
        return;
    }
    // the card itself, so a screen reader reads the title and the text, and Tab starts from it
    // сама карточка: скринридер читает заголовок и текст, а Tab начинает с неё
    card.focus({ preventScroll: true });
}

async function showStep() {
    stopWatching();
    const step = props.step;
    if (!step) {
        targetEl.value = null;
        rect.value = null;
        return;
    }
    const el = resolveTourTarget(step.target);
    targetEl.value = el;
    if (el) {
        const r = el.getBoundingClientRect();
        const inView = isInView(r, { width: window.innerWidth, height: window.innerHeight }, 8);
        if (!inView) {
            const calm = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
            el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: calm ? 'auto' : 'smooth' });
        }
        window.addEventListener('scroll', onViewportChange, true);
        window.addEventListener('resize', onViewportChange);
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(onViewportChange);
            resizeObserver.observe(el);
        }
    }
    measure();
    await nextTick();
    floating.update();
    focusCard();
}

watch(() => props.step, showStep, { immediate: true, flush: 'post' });
onBeforeUnmount(stopWatching);

function onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
        event.preventDefault();
        emit('next');
    } else if (event.key === 'ArrowLeft' && !isFirst.value) {
        event.preventDefault();
        emit('prev');
    } else if (!props.interactive && cardRef.value) {
        trapTab(event, cardRef.value);
    }
}

// the focus stays in the card, also after a click on the shut page / фокус остаётся в карточке и после клика по закрытой странице
function onBlockerPointerDown(event: PointerEvent) {
    event.preventDefault();
    const card = cardRef.value;
    (card && getFocusable(card)[0] ? getFocusable(card).at(-1) : card)?.focus({ preventScroll: true });
}
</script>

<template>
    <Teleport to="body">
        <div v-if="step" class="tao-tour">
            <div class="tao-tour__blocker" :style="blockerStyle" @pointerdown="onBlockerPointerDown"></div>
            <div v-if="hasTarget" class="tao-tour__hole" :style="holeStyle" aria-hidden="true"></div>
            <div v-else class="tao-tour__dim" aria-hidden="true"></div>
            <div
                ref="cardRef"
                class="tao-tour__card"
                :class="[hasTarget ? `tao-tour__card--${floating.side.value}` : 'tao-tour__card--centered', { 'tao-tour__card--placed': !hasTarget || floating.placed.value }]"
                role="dialog"
                :aria-labelledby="step.title ? titleId : undefined"
                :aria-describedby="step.text ? textId : undefined"
                tabindex="-1"
                :style="cardStyle"
                @keydown="onKeydown"
            >
                <span v-if="hasTarget" class="tao-tour__arrow" :style="arrowStyle" aria-hidden="true"></span>
                <slot :step="step" :index="index" :count="count">
                    <p v-if="step.title" :id="titleId" class="tao-tour__title">{{ step.title }}</p>
                    <p v-if="step.text" :id="textId" class="tao-tour__text">{{ step.text }}</p>
                </slot>
                <div class="tao-tour__footer">
                    <span v-if="count > 1" class="tao-tour__progress">
                        <span class="tao-tour__dots" aria-hidden="true">
                            <i v-for="i in dots" :key="i" :class="{ 'tao-tour__dot--on': i === index }"></i>
                        </span>
                        <span class="tao-tour__progress-text">{{ progress }}</span>
                    </span>
                    <span class="tao-tour__actions">
                        <TaoButton v-if="!isLast" size="small" variant="text" @click="emit('skip')">{{ l10n.skipLabel }}</TaoButton>
                        <TaoButton v-if="!isFirst" size="small" variant="secondary" @click="emit('prev')">{{ l10n.prevLabel }}</TaoButton>
                        <TaoButton size="small" @click="emit('next')">{{ isLast ? l10n.doneLabel : l10n.nextLabel }}</TaoButton>
                    </span>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style>
.tao-tour {
    position: fixed;
    inset: 0;
    z-index: var(--tao-z-popup);
    /* only the blocker and the card take the pointer: the hole of an interactive step must reach the page */
    /* указатель берут только щит и карточка: дыра интерактивного шага должна доходить до страницы */
    pointer-events: none;
}

.tao-tour__blocker {
    position: fixed;
    inset: 0;
    pointer-events: auto;
}

/* the dim is the shadow of the lit window: it can glide from one target to the next / затемнение — тень освещённого окна: оно может плыть от цели к цели */
.tao-tour__hole {
    position: fixed;
    border-radius: var(--tao-radius-control);
    box-shadow: 0 0 0 100vmax var(--tao-color-overlay);
    pointer-events: none;
    transition:
        top var(--tao-duration-base) var(--tao-ease-base),
        left var(--tao-duration-base) var(--tao-ease-base),
        width var(--tao-duration-base) var(--tao-ease-base),
        height var(--tao-duration-base) var(--tao-ease-base);
}

.tao-tour__dim {
    position: fixed;
    inset: 0;
    background: var(--tao-color-overlay);
    pointer-events: none;
}

.tao-tour__card {
    position: fixed;
    z-index: 1;
    box-sizing: border-box;
    width: max-content;
    max-width: min(320px, calc(100vw - 16px));
    padding: var(--tao-space-4);
    background: var(--tao-color-surface-raised);
    color: var(--tao-color-text-strong);
    font-family: var(--tao-font-family);
    font-size: var(--tao-font-size-sm);
    line-height: 1.4;
    border-radius: var(--tao-radius-panel);
    box-shadow: var(--tao-shadow-lg);
    outline: none;
    visibility: hidden;
    pointer-events: auto;
}

.tao-tour__card--placed {
    visibility: visible;
}

.tao-tour__card--centered {
    inset: 0;
    width: min(360px, calc(100vw - 16px));
    height: fit-content;
    margin: auto;
}

.tao-tour__arrow {
    position: absolute;
    width: 10px;
    height: 10px;
    background: var(--tao-color-surface-raised);
}

.tao-tour__card--top .tao-tour__arrow {
    top: calc(100% - 5px);
    transform: translateX(-50%) rotate(45deg);
}

.tao-tour__card--bottom .tao-tour__arrow {
    bottom: calc(100% - 5px);
    transform: translateX(-50%) rotate(45deg);
}

.tao-tour__card--left .tao-tour__arrow {
    left: calc(100% - 5px);
    transform: translateY(-50%) rotate(45deg);
}

.tao-tour__card--right .tao-tour__arrow {
    right: calc(100% - 5px);
    transform: translateY(-50%) rotate(45deg);
}

.tao-tour__title {
    margin: 0 0 var(--tao-space-2);
    font-size: var(--tao-font-size-md);
    font-weight: 600;
}

.tao-tour__text {
    margin: 0;
    color: var(--tao-color-text);
}

.tao-tour__footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--tao-space-3);
    margin-top: var(--tao-space-4);
}

.tao-tour__progress {
    display: inline-flex;
    flex-direction: column;
    gap: var(--tao-space-1);
    color: var(--tao-color-text-muted);
    font-size: var(--tao-font-size-xs);
}

.tao-tour__dots {
    display: inline-flex;
    gap: var(--tao-space-1);
}

.tao-tour__dots i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.35;
}

.tao-tour__dots .tao-tour__dot--on {
    background: var(--tao-color-accent);
    opacity: 1;
}

.tao-tour__actions {
    display: inline-flex;
    gap: var(--tao-space-2);
    margin-inline-start: auto;
}

@media (prefers-reduced-motion: reduce) {
    .tao-tour__hole {
        transition: none;
    }
}
</style>
