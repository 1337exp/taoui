<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue';
import { slotHas } from '../slots';

defineOptions({ name: 'TaoMarquee' });

// One line that never wraps. When it does not fit, it runs round and round with soft fading edges; when it fits, it
// stands still and does nothing. Only transform moves (compositing, no repaint). Every round starts with a short
// pause to read the beginning (with `fill` a short line is repeated and runs too, as a ticker). It stops on hover, on focus (a keyboard can stop it: when it runs it is a tab stop) and
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
        /**
         * Stops under the pointer, and a tap stops and starts it. Turn it off when the line is a background (a design
         * feature): a cursor or a finger passing by does not stop it, and its text cannot be selected (a line that runs
         * away from a selection is no text to copy). Focus still stops it, and it is still a tab stop while it runs.
         * Останавливается под курсором, а тап останавливает и запускает. Выключите, когда строка — фон (приём дизайна):
         * мимо идущий курсор или палец её не останавливает, а текст не выделяется (убегающую строку не скопировать).
         * Фокус всё равно останавливает, и пока строка бежит, она остаётся остановкой Tab.
         */
        pauseOnHover?: boolean;
        /**
         * A pause at the start of every round, to read the beginning. Off, the line runs round without a stop, like a
         * looped picture. Without it set, a decorative line has no pause and an ordinary one has.
         * Пауза в начале каждого круга, чтобы прочитать начало. Выключенная — строка бежит по кругу без остановок, как
         * зацикленная картинка. Если не задана: у декоративной строки паузы нет, у обычной есть.
         */
        roundPause?: boolean;
        /**
         * A line that is only decoration (a background, a design feature) and carries no meaning: a ghost. Hidden from a
         * screen reader, not a tab stop, nothing under a cursor or a finger reacts, the text cannot be selected, and it
         * runs round without a pause. Only for text nobody needs to read: the stop that WCAG 2.2.2 asks of moving content
         * does not apply to pure decoration. With «reduce motion» it stands still and is clipped, it does not wrap.
         * Строка-декор (фон, приём дизайна) без смысла: призрак. Скрыта от скринридера, не остановка Tab, курсор и палец
         * для неё пустое место, текст не выделяется, бежит по кругу без пауз. Только для текста, который никому не нужно
         * читать: остановка, которую WCAG 2.2.2 требует от движения, чистому декору не нужна. При «уменьшить движение» стоит
         * и обрезана, не переносится.
         */
        decorative?: boolean;
        /** Stopped by the app. / Остановлена приложением. */
        paused?: boolean;
        /**
         * Run also when the line fits: it is repeated, with `gap` between the copies, until the copies cover the whole
         * width, so the strip never has a hole (a ticker of quotes, a row of logos). Without it a line that fits stands still.
         * Бежать и тогда, когда строка помещается: она повторяется, с `gap` между копиями, пока копии не закроют всю ширину,
         * и в ленте не бывает дыры (биржевая лента, ряд логотипов). Без него помещающаяся строка стоит на месте.
         */
        fill?: boolean;
        /** Run to the right instead of to the left. / Бежать вправо, а не влево. */
        reverse?: boolean;
    }>(),
    {
        text: '',
        speed: 40,
        gap: 48,
        fade: 22,
        pauseOnHover: true,
        roundPause: undefined,
        decorative: false,
        paused: false,
        fill: false,
        reverse: false,
    },
);

defineSlots<{
    /** The content of the line (a link, an icon, words). / Содержимое строки. */
    default?(): unknown;
}>();

const slots = useSlots();
// a slot counts when it draws something, not when it merely exists (see src/slots.ts)
const has = (name: string) => slotHas(slots, name);
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
// with `fill` a line that fits runs too, but an empty one has nothing to repeat / с `fill` бежит и помещающаяся, но пустой нечего повторять
const running = computed(() => (overflowing.value || (props.fill && itemWidth.value > 0)) && !reduce.value);
const wrapping = computed(() => overflowing.value && reduce.value && !props.decorative);
const restAtStart = computed(() => props.roundPause ?? !props.decorative);
const stopped = computed(() => props.paused || tapped.value);

/**
 * How many copies the track holds: a line wider than the box needs two (the second one comes in as the first goes out); a
 * short line under `fill` needs enough of them to cover the box and one more, since the track moves by one round.
 * Сколько копий в ленте: строке шире блока хватает двух; короткой при `fill` нужно столько, чтобы закрыть блок, и ещё одна,
 * потому что лента сдвигается на один круг.
 */
const copies = computed(() => {
    if (!running.value) return 1;
    if (overflowing.value) return 2;
    return Math.min(100, Math.ceil(boxWidth.value / (itemWidth.value + props.gap)) + 1);
});

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
    if (!props.decorative && props.pauseOnHover && running.value && event.pointerType !== 'mouse') {
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
        // the hidden copy has the natural width of the content, so a change of the content (a new price, a font that came,
        // an image) is seen here, and nobody has to call `measure()`
        // скрытая копия имеет естественную ширину содержимого, поэтому изменение содержимого (новая цена, пришедший шрифт,
        // картинка) видно здесь, и вызывать `measure()` никому не нужно
        if (meter.value) observer.observe(meter.value);
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

const hasSlot = computed(() => has('default'));
</script>

<template>
    <span
        ref="box"
        class="tao-marquee"
        :class="{
            'tao-marquee--run': running,
            'tao-marquee--wrap': wrapping,
            'tao-marquee--stopped': stopped,
            'tao-marquee--hover-pause': pauseOnHover && !decorative,
            'tao-marquee--seamless': !restAtStart,
            'tao-marquee--ghost': decorative,
            'tao-marquee--reverse': reverse,
        }"
        :style="{ '--_fade': `${fade}px` }"
        :tabindex="running && !decorative ? 0 : undefined"
        :aria-hidden="decorative ? 'true' : undefined"
        :inert="decorative || undefined"
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
            <!-- the next rounds: hidden from a screen reader and out of the tab order / следующие круги: скрыты и без Tab -->
            <span v-for="n in copies - 1" :key="n" class="tao-marquee__item" aria-hidden="true" inert>
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

/* a background line: nothing to select in text that runs away / строка-фон: в убегающем тексте нечего выделять */
.tao-marquee--run:not(.tao-marquee--hover-pause) {
    user-select: none;
}

/* a ghost: nothing to point at, select or reach / призрак: ни навести, ни выделить, ни дойти */
.tao-marquee--ghost {
    pointer-events: none;
    user-select: none;
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

    .tao-marquee--run.tao-marquee--seamless .tao-marquee__track {
        animation-name: tao-marquee-seamless;
    }

    /* the other way: the same round backwards, the pause at the start of a round moves with it / в другую сторону: тот же круг назад */
    .tao-marquee--run.tao-marquee--reverse .tao-marquee__track {
        animation-direction: reverse;
    }

    .tao-marquee--stopped .tao-marquee__track,
    .tao-marquee--run:focus-within .tao-marquee__track,
    .tao-marquee--hover-pause.tao-marquee--run:hover .tao-marquee__track {
        animation-play-state: paused;
    }
}

/* no pause: the round is one line plus the gap, so the loop has no seam / без паузы: круг — строка плюс зазор, шва нет */
@keyframes tao-marquee-seamless {
    from {
        transform: translateX(0);
    }
    to {
        transform: translateX(var(--_shift));
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
