<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';

defineOptions({ name: 'TaoMarquee' });

// One line that never wraps. When it does not fit, it runs round and round with soft fading edges; when it fits, it
// stands still and does nothing. Only transform moves (compositing, no repaint). Every round starts with a short
// pause to read the beginning. It stops on hover, on focus (a keyboard can stop it: when it runs it is a tab stop) and
// on a tap (touch has no hover): moving content longer than 5 s must be stoppable (WCAG 2.2.2). With «reduce motion»
// it does not run at all, the line wraps like plain text. A screen reader reads it once: the moving copy is hidden.
// Одна строка без переносов. Не помещается — бежит по кругу с мягко гаснущими краями; помещается — стоит на месте.
// Двигается только transform. Каждый круг начинается с паузы. Останавливается при наведении, при фокусе (клавиатура
// может её остановить: когда строка бежит, она — остановка Tab) и по тапу: движение дольше 5 с должно останавливаться
// (WCAG 2.2.2). При «уменьшить движение» не бежит, а переносится. Скринридер читает текст один раз.
const props = withDefaults(
    defineProps<{
        /** The line; or put anything inline into the default slot. / Строка; или что угодно строчное в слот. */
        text?: string;
        /** Pixels per second. / Пикселей в секунду. */
        speed?: number;
        /** The gap between the end of the line and its next round, px. / Зазор между концом строки и следующим кругом. */
        gap?: number;
        /**
         * The width of the fading edges, px. The left fade lives in a padding outside the text, so at rest the line
         * starts where it would without the marquee; the parent needs that much room on the left (its padding), or the
         * running text shows past its edge. 0 is no left fade.
         * Ширина гаснущих краёв. Левое затухание лежит в отступе за пределами текста: в покое строка стоит на своём месте;
         * родителю нужно столько места слева (его padding), иначе бегущий текст покажется за его краем. 0 — без затухания.
         */
        fade?: number;
        pauseOnHover?: boolean;
        /** Stopped by the app. / Остановлена приложением. */
        paused?: boolean;
    }>(),
    {
        text: '',
        speed: 40,
        gap: 48,
        fade: 22,
        pauseOnHover: true,
        paused: false,
    },
);

defineSlots<{
    /** The content of the line (a link, an icon, words). / Содержимое строки. */
    default?(): unknown;
}>();

const slots = useSlots();
const box = ref<HTMLElement | null>(null);
const meter = ref<HTMLElement | null>(null);
const itemWidth = ref(0);
const boxWidth = ref(0);
const reduce = ref(false);
/** A tap stopped it (touch has no hover). / Остановлена тапом. */
const tapped = ref(false);
let observer: ResizeObserver | null = null;
let motionQuery: MediaQueryList | null = null;

const overflowing = computed(() => itemWidth.value > boxWidth.value + 1);
const running = computed(() => overflowing.value && !reduce.value);
const wrapping = computed(() => overflowing.value && reduce.value);
const stopped = computed(() => props.paused || tapped.value);

const trackStyle = computed(() => {
    const shift = itemWidth.value + props.gap;
    return {
        '--_shift': `${-shift}px`,
        '--_duration': `${(shift / Math.max(1, props.speed)).toFixed(2)}s`,
        '--_gap': `${props.gap}px`,
    };
});

function measure() {
    if (!box.value || !meter.value) {
        return;
    }
    // the natural width comes from a hidden copy that never wraps: the visible line in the wrap mode would measure
    // differently and the marquee would flip between the modes; the fade padding is not room for the text
    // естественная ширина — по скрытой копии без переносов; отступ затухания не место для текста
    const padding = parseFloat(getComputedStyle(box.value).paddingLeft || '0');
    boxWidth.value = box.value.clientWidth - padding;
    itemWidth.value = meter.value.getBoundingClientRect().width;
}

function onMotionChange() {
    reduce.value = Boolean(motionQuery?.matches);
}

function onPointerUp(event: PointerEvent) {
    // a finger stops and starts it; a mouse has hover for that / палец останавливает и запускает; у мыши есть наведение
    if (running.value && event.pointerType !== 'mouse') {
        tapped.value = !tapped.value;
    }
}

onMounted(() => {
    if (typeof window === 'undefined') {
        return;
    }
    motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    onMotionChange();
    motionQuery?.addEventListener?.('change', onMotionChange);
    measure();
    void document.fonts?.ready.then(measure);
    if (box.value && 'ResizeObserver' in window) {
        observer = new ResizeObserver(measure);
        observer.observe(box.value);
    }
});

watch(
    () => [props.text, props.gap] as const,
    () => nextTick(measure),
);

onBeforeUnmount(() => {
    observer?.disconnect();
    motionQuery?.removeEventListener?.('change', onMotionChange);
});

defineExpose({
    /** Measures again (after the content changed in a way the marquee cannot see). / Перемерить. */
    measure,
});

const hasSlot = computed(() => Boolean(slots.default));
</script>

<template>
    <span
        ref="box"
        class="tao-marquee"
        :class="{
            'tao-marquee--run': running,
            'tao-marquee--wrap': wrapping,
            'tao-marquee--stopped': stopped,
            'tao-marquee--hover-pause': pauseOnHover,
        }"
        :style="{ '--_fade': `${fade}px` }"
        :tabindex="running ? 0 : undefined"
        @pointerup="onPointerUp"
    >
        <!-- the hidden copy that measures the natural width / скрытая копия для замера -->
        <span ref="meter" class="tao-marquee__meter" aria-hidden="true" inert>
            <slot v-if="hasSlot" />
            <template v-else>{{ text }}</template>
        </span>
        <span class="tao-marquee__track" :style="trackStyle">
            <span class="tao-marquee__item">
                <slot v-if="hasSlot" />
                <template v-else>{{ text }}</template>
            </span>
            <!-- the second round: hidden from a screen reader and out of the tab order / второй круг: скрыт и без Tab -->
            <span v-if="running" class="tao-marquee__item" aria-hidden="true" inert>
                <slot v-if="hasSlot" />
                <template v-else>{{ text }}</template>
            </span>
        </span>
    </span>
</template>

<style scoped>
.tao-marquee {
    position: relative;
    display: block;
    overflow: hidden;
    /* the left fade lives in a padding before the text; the box is moved left by as much, so at rest the line stands
       where it would / левое затухание в отступе перед текстом; блок сдвинут влево на столько же */
    padding-left: var(--_fade);
    margin-left: calc(-1 * var(--_fade));
    /* room for ascenders and descenders / запас для выносных элементов букв */
    padding-block: 3px;
    margin-block: -3px;
    outline: none;
}

.tao-marquee:focus-visible {
    border-radius: var(--tao-radius-sm);
    box-shadow: inset 0 0 0 2px var(--tao-color-accent);
}

.tao-marquee__track {
    display: inline-flex;
    white-space: nowrap;
}

.tao-marquee__item {
    flex: none;
}

.tao-marquee__meter {
    position: absolute;
    left: 0;
    top: 0;
    visibility: hidden;
    white-space: nowrap;
    pointer-events: none;
}

.tao-marquee--wrap .tao-marquee__track {
    display: block;
    white-space: normal;
}

.tao-marquee--run {
    /* soft edges: the left one in the padding (empty at rest), the right one over the last 24px */
    -webkit-mask-image: linear-gradient(90deg, transparent 0, #000 var(--_fade), #000 calc(100% - 24px), transparent 100%);
    mask-image: linear-gradient(90deg, transparent 0, #000 var(--_fade), #000 calc(100% - 24px), transparent 100%);
}

.tao-marquee--run .tao-marquee__item + .tao-marquee__item {
    margin-left: var(--_gap);
}

@media (prefers-reduced-motion: no-preference) {
    .tao-marquee--run .tao-marquee__track {
        will-change: transform;
        animation: tao-marquee var(--_duration) linear infinite;
    }

    .tao-marquee--stopped .tao-marquee__track,
    .tao-marquee--run:focus-within .tao-marquee__track,
    .tao-marquee--hover-pause.tao-marquee--run:hover .tao-marquee__track {
        animation-play-state: paused;
    }
}

/* a pause at the start of every round: the first 12% the line stands, then runs one line plus the gap */
@keyframes tao-marquee {
    0%,
    12% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(var(--_shift));
    }
}
</style>
