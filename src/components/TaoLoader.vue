<script lang="ts" setup>
import { computed } from 'vue';
import { useLocaleText } from '../locale';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoLoader' });

interface Props {
    /** The look of the wait: `dots` (the four jumping dots), `ring` (a turning arc), `pulse` (a ripple), `diamonds` (four diamonds on two axes: a hollow one crosses to a filled one and takes it in, and a new filled one grows where it stood). / Вид ожидания. */
    variant?: 'dots' | 'ring' | 'pulse' | 'diamonds';
    /**
     * The size: a number is px, `'40px'` works, or `small` / `medium` / `large` (24 / 40 / 64 px).
     * Without it: 80 for `dots` (as it always was), 40 for the others.
     * Размер: число — px, `'40px'` тоже, либо `small` / `medium` / `large` (24 / 40 / 64 px). Без него: 80 у `dots`, 40 у остальных.
     */
    size?: number | string;
    /** A colour role of the theme (default: the accent). / Роль цвета темы (по умолчанию акцент). */
    tone?: TaoToneName;
    /** Any CSS colour; wins over `tone`. `currentColor` takes the text colour around it. / Любой CSS-цвет; главнее `tone`. */
    color?: string;
    inline?: boolean;
    /** What a screen reader says (default: the text of the locale). / Что скажет скринридер (по умолчанию текст локали). */
    label?: string;
    /** Only a picture: hidden from a screen reader (the wait is said elsewhere, a button says it by itself). / Только картинка: скрыт от скринридера. */
    decorative?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'dots',
    size: undefined,
    tone: undefined,
    color: undefined,
    inline: false,
    label: undefined,
    decorative: false,
});

const l10n = useLocaleText(props, 'loader');

const NAMED: Record<string, number> = { small: 24, medium: 40, large: 64 };

/** The side of the loader in px: every part of it is a share of this number. / Сторона лоадера в px: каждая его часть — доля этого числа. */
const pixels = computed(() => {
    const fallback = props.variant === 'dots' ? 80 : 40;
    const size = props.size;
    if (typeof size === 'number') {
        return size > 0 ? size : fallback;
    }
    if (size === undefined || size === '') {
        return fallback;
    }
    return NAMED[size] ?? (parseInt(size, 10) || fallback);
});

const rootStyle = computed(() => ({
    '--_s': `${pixels.value}px`,
    ...(props.color ? { '--_color': props.color } : {}),
}));
</script>

<template>
    <div
        class="tao-loader"
        :class="[toneClass(tone), `tao-loader--${variant}`, { 'tao-loader--inline': inline }]"
        :style="rootStyle"
        :role="decorative ? undefined : 'status'"
        :aria-hidden="decorative ? 'true' : undefined"
    >
        <div v-if="variant === 'dots'" class="tao-loader__ellipsis" aria-hidden="true">
            <div /><div /><div /><div />
        </div>
        <span v-else-if="variant === 'ring'" class="tao-loader__ring" aria-hidden="true" />
        <span v-else-if="variant === 'diamonds'" class="tao-loader__swap" aria-hidden="true">
            <span class="tao-loader__axis">
                <i class="tao-loader__swap-left" /><i class="tao-loader__swap-right" /><i class="tao-loader__swap-hollow" />
            </span>
            <span class="tao-loader__axis tao-loader__axis--cross">
                <i class="tao-loader__swap-left" /><i class="tao-loader__swap-right" /><i class="tao-loader__swap-hollow" />
            </span>
        </span>
        <span v-else class="tao-loader__pulse" aria-hidden="true" />
        <span v-if="!decorative" class="tao-sr-only">{{ l10n.label }}</span>
    </div>
</template>

<style scoped>
.tao-loader {
    /* the colour: a colour of your own, else the tone (the accent by default) / цвет: свой, иначе тон (по умолчанию акцент) */
    --_c: var(--_color, var(--tao-tone));
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.tao-loader--inline {
    display: inline-block;
    width: 30px;
}

/* ---------- dots: every length is a share of --_s ---------- */
.tao-loader__ellipsis {
    --_dot: calc(var(--_s) * 0.1625);
    display: block;
    position: relative;
    width: var(--_s);
    height: var(--_dot);
    margin-left: calc(var(--_dot) / -2);
}

.tao-loader__ellipsis div {
    position: absolute;
    top: 0;
    width: var(--_dot);
    height: var(--_dot);
    border-radius: var(--tao-radius-full);
    background: var(--_c);
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.tao-loader__ellipsis div:nth-child(1) {
    left: calc(var(--_s) * 0.1);
    animation: tao-loader-grow 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(2) {
    left: calc(var(--_s) * 0.1);
    animation: tao-loader-move 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(3) {
    left: calc(var(--_s) * 0.4);
    animation: tao-loader-move 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(4) {
    left: calc(var(--_s) * 0.7);
    animation: tao-loader-shrink 0.6s infinite;
}

@keyframes tao-loader-grow {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
}

@keyframes tao-loader-shrink {
    0% { transform: scale(1); }
    100% { transform: scale(0); }
}

@keyframes tao-loader-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(calc(var(--_s) * 0.3), 0); }
}

/* ---------- ring: an arc that turns ---------- */
.tao-loader__ring {
    display: block;
    box-sizing: border-box;
    width: var(--_s);
    height: var(--_s);
    border: max(2px, calc(var(--_s) * 0.1)) solid color-mix(in srgb, var(--_c) 18%, transparent);
    border-top-color: var(--_c);
    border-radius: var(--tao-radius-full);
    animation: tao-loader-spin 0.8s linear infinite;
}

@keyframes tao-loader-spin {
    to { transform: rotate(360deg); }
}

/* ---------- pulse: a ripple from a core ---------- */
.tao-loader__pulse {
    position: relative;
    display: block;
    width: var(--_s);
    height: var(--_s);
}

.tao-loader__pulse::before,
.tao-loader__pulse::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--tao-radius-full);
    background: var(--_c);
    opacity: 0;
    animation: tao-loader-ripple 1.4s cubic-bezier(0, 0.2, 0.4, 1) infinite;
}

.tao-loader__pulse::after {
    animation-delay: 0.7s;
}

@keyframes tao-loader-ripple {
    0% { transform: scale(0.1); opacity: 0.9; }
    100% { transform: scale(1); opacity: 0; }
}

/* ---------- diamonds: the hollow one crosses to the filled one and takes its place; a new filled one grows where it stood ---------- */
.tao-loader__swap {
    --_d: calc(var(--_s) * 0.2);
    --_go: calc(var(--_s) * 0.64);
    --_h: calc(var(--_s) * 0.34);
    position: relative;
    display: block;
    width: var(--_s);
    height: var(--_s);
}

/* two axes: the same pair, turned a quarter turn and a fifth of the cycle behind, so the two pass the middle one after the other / две оси: та же пара, повёрнутая на четверть оборота и отстающая на пятую часть цикла, поэтому в середине они проходят одна за другой */
.tao-loader__axis {
    position: absolute;
    top: calc((var(--_s) - var(--_h)) / 2);
    left: 0;
    width: var(--_s);
    height: var(--_h);
}

.tao-loader__axis--cross {
    transform: rotate(90deg);
}

.tao-loader__axis--cross i {
    /* a fifth of the cycle behind the first pair (the delay is negative: it starts that much ahead, a whole cycle minus a fifth) / на пятую часть цикла позади первой пары */
    animation-delay: -1.92s;
}

.tao-loader__swap i {
    position: absolute;
    top: calc((100% - var(--_d)) / 2);
    box-sizing: border-box;
    width: var(--_d);
    height: var(--_d);
    transform: rotate(45deg);
    animation-duration: 2.4s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}

.tao-loader__swap-left,
.tao-loader__swap-right {
    background: var(--_c);
}

.tao-loader__swap-left {
    left: calc(var(--_s) * 0.18 - var(--_d) / 2);
    animation-name: tao-loader-swap-left;
}

.tao-loader__swap-right {
    left: calc(var(--_s) * 0.82 - var(--_d) / 2);
    animation-name: tao-loader-swap-right;
}

/* the hollow one starts on the right and goes there and back; it is the one that is drawn last, so it is on top / пустой стартует справа и ходит туда-обратно */
.tao-loader__swap-hollow {
    left: calc(var(--_s) * 0.18 - var(--_d) / 2);
    border: max(1.5px, calc(var(--_s) * 0.03)) solid var(--_c);
    animation-name: tao-loader-swap-go;
}

/* one turn: the hollow one waits on the right while the left one grows; it crosses; it lands on the left one, which is taken in
   (shrinks inside the hollow one); only then the new filled one grows on the right, where the hollow one stood; and back
   один круг: пустой ждёт справа, пока слева растёт заполненный; переходит; садится на левый, и тот поглощается (сжимается внутри
   пустого); только потом справа, где стоял пустой, вырастает новый заполненный; и обратно */
@keyframes tao-loader-swap-go {
    0%,
    24% { transform: translateX(var(--_go)) rotate(45deg); }
    44%,
    74% { transform: translateX(0) rotate(45deg); }
    94%,
    100% { transform: translateX(var(--_go)) rotate(45deg); }
}

/* the filled one begins to shrink when the hollow one is half way to it, and is gone as it arrives; the new one starts to grow before the old one is quite gone; across the turn of the loop it is one growth (the first 0.93 of it before, the rest after) */
@keyframes tao-loader-swap-left {
    0% {
        transform: rotate(45deg) scale(0.93);
        animation-timing-function: linear;
    }
    4%,
    34% { transform: rotate(45deg) scale(1); }
    46%,
    90% {
        transform: rotate(45deg) scale(0);
        animation-timing-function: ease-out;
    }
    100% { transform: rotate(45deg) scale(0.93); }
}

@keyframes tao-loader-swap-right {
    0%,
    40% {
        transform: rotate(45deg) scale(0);
        animation-timing-function: ease-out;
    }
    54%,
    84% { transform: rotate(45deg) scale(1); }
    96%,
    100% { transform: rotate(45deg) scale(0); }
}

/* ---------- reduced motion: nothing travels or turns, the picture breathes ---------- */
@media (prefers-reduced-motion: reduce) {
    .tao-loader__ellipsis div {
        animation: tao-loader-breathe 1.6s ease-in-out infinite;
        transform: none;
    }

    .tao-loader__ellipsis div:nth-child(1) {
        left: calc(var(--_s) * 0.1);
    }

    .tao-loader__ellipsis div:nth-child(2) {
        left: calc(var(--_s) * 0.4);
        animation-delay: 0.2s;
    }

    .tao-loader__ellipsis div:nth-child(3) {
        left: calc(var(--_s) * 0.7);
        animation-delay: 0.4s;
    }

    .tao-loader__ellipsis div:nth-child(4) {
        display: none;
    }

    .tao-loader__ring {
        animation: tao-loader-breathe 1.6s ease-in-out infinite;
    }

    .tao-loader__pulse::before {
        transform: scale(0.6);
        animation: tao-loader-breathe 1.6s ease-in-out infinite;
    }

    .tao-loader__pulse::after {
        display: none;
    }

    /* the picture stands (filled on the left, hollow on the right) and breathes / картинка стоит и дышит */
    .tao-loader__swap i {
        animation: tao-loader-breathe 1.6s ease-in-out infinite;
    }

    .tao-loader__swap-hollow {
        transform: translateX(var(--_go)) rotate(45deg);
    }

    .tao-loader__swap-right {
        display: none;
    }
}

@keyframes tao-loader-breathe {
    0%,
    100% { opacity: 1; }
    50% { opacity: 0.35; }
}
</style>
