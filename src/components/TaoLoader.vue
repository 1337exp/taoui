<script lang="ts" setup>
import { computed } from 'vue';
import { useLocaleText } from '../locale';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoLoader' });

interface Props {
    /** The look of the wait: `dots` (the four jumping dots), `ring` (a turning arc), `pulse` (a ripple). / Вид ожидания. */
    variant?: 'dots' | 'ring' | 'pulse';
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
}

@keyframes tao-loader-breathe {
    0%,
    100% { opacity: 1; }
    50% { opacity: 0.35; }
}
</style>
