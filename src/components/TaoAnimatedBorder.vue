<script lang="ts" setup>
import { computed } from 'vue';
import { radiusVars, squaredCorners, type TaoRadius, type TaoSquare } from '../radius';
import { toneClass, type TaoToneName } from '../tone';

defineOptions({ name: 'TaoAnimatedBorder' });

interface Props {
    /**
     * What the border runs through: `rainbow` (the default) or the colours of a tone (`tone`, the accent without it).
     * Из чего состоит рамка: `rainbow` (по умолчанию) или цвета тона (`tone`, без него — акцент).
     */
    variant?: 'rainbow' | 'tone';
    tone?: TaoToneName;
    /** Your own colours, any CSS colour; they win over `variant`. / Свои цвета, любые CSS-цвета; главнее `variant`. */
    colors?: string[];
    borderWidth?: number;
    speed?: number;
    /** Радиус размытия glow-эффекта позади рамки, px. Работает только при light. */
    glow?: number;
    /** Добавляет мягкое свечение вокруг рамки. По умолчанию выключено —
     * компонент остаётся именно рамкой (переливается только контур),
     * без "света", выходящего за её пределы. */
    light?: boolean;
    /**
     * Corner radius of the content; the border outside it is that plus its width. Number — px, string — CSS: all corners; an array
     * (or a string) of 1 to 4 lengths gives them one by one, in the order of CSS `border-radius`.
     * Скругление содержимого; рамка снаружи — оно плюс её ширина. Число — px, строка — CSS: все углы; массив (или строка) из 1–4
     * длин задаёт их по отдельности в порядке CSS `border-radius`.
     */
    radius?: TaoRadius;
    /**
     * Sharp corners with the radius kept as it is: a side (`top`, `bottom`, `left`, `right`), a corner (`top-left` …), several as an
     * array or a string with spaces. The border outside a sharp corner is sharp too.
     * Прямые углы при радиусе как есть: сторона, угол, несколько массивом или строкой через пробел. Рамка снаружи прямого угла тоже прямая.
     */
    square?: TaoSquare;
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'rainbow',
    tone: undefined,
    colors: undefined,
    borderWidth: 3,
    speed: 6,
    glow: 16,
    light: false,
    radius: undefined,
    square: undefined,
});

const gradient = computed(() => {
    if (props.colors?.length) {
        // a one-colour list still needs two stops for a gradient
        const list = props.colors.length === 1 ? [props.colors[0], props.colors[0]] : props.colors;
        return `linear-gradient(60deg, ${list.join(', ')})`;
    }
    if (props.variant === 'tone') {
        const light = 'color-mix(in srgb, var(--tao-tone) 45%, white)';
        return `linear-gradient(60deg, var(--tao-tone), ${light}, var(--tao-tone-hover), ${light}, var(--tao-tone))`;
    }
    return 'linear-gradient(60deg, var(--tao-gradient-rainbow))';
});

const style = computed(() => ({
    '--tao-animated-border-width': `${props.borderWidth}px`,
    '--tao-animated-border-speed': `${props.speed}s`,
    '--tao-animated-border-glow': `${props.glow}px`,
    '--tao-animated-border-gradient': gradient.value,
    ...radiusVars(props.radius, props.square),
}));
const hasSquare = computed(() => squaredCorners(props.square).length > 0);
</script>

<template>
    <div
        class="tao-animated-border"
        :class="[toneClass(variant === 'tone' ? tone : undefined), { 'tao-animated-border--light': light, 'tao-animated-border--corners': hasSquare }]"
        :style="style"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-animated-border {
    --tao-radius: var(--tao-radius-panel);
    /* the corners, which `radius` as an array sets one by one; the border outside takes each plus its width */
    /* углы, которые `radius` массивом задаёт по отдельности; рамка снаружи берёт каждый плюс свою ширину */
    --tao-radius-tl: var(--tao-radius);
    --tao-radius-tr: var(--tao-radius);
    --tao-radius-br: var(--tao-radius);
    --tao-radius-bl: var(--tao-radius);
    /* concentric: the corner plus the width, but a sharp corner stays sharp outside too: min(width, corner × 1000) is the whole width
       for any visible corner and 0 for a sharp one (min() is old enough for the supported browsers; sign() is not)
       концентрично: угол плюс ширина, но прямой угол остаётся прямым и снаружи: min(ширина, угол × 1000) — вся ширина для любого
       видимого угла и 0 для прямого (min() достаточно старая для поддерживаемых браузеров, sign() — нет) */
    --_tao-outer-radius:
        calc(var(--tao-radius-tl) + min(var(--tao-animated-border-width), var(--tao-radius-tl) * 1000))
        calc(var(--tao-radius-tr) + min(var(--tao-animated-border-width), var(--tao-radius-tr) * 1000))
        calc(var(--tao-radius-br) + min(var(--tao-animated-border-width), var(--tao-radius-br) * 1000))
        calc(var(--tao-radius-bl) + min(var(--tao-animated-border-width), var(--tao-radius-bl) * 1000));

    background: var(--tao-color-surface-raised);
    position: relative;
    z-index: 0;
    border-radius: var(--tao-radius);
}

/* `square`: the outline is built from the four corners, the squared ones are 0px (see .tao-panel--corners) */
/* `square`: контур собирается из четырёх углов, прямые — 0px (см. .tao-panel--corners) */
.tao-animated-border--corners {
    border-radius: var(--tao-radius-tl) var(--tao-radius-tr) var(--tao-radius-br) var(--tao-radius-bl);
}

/* Размытая копия рамки позади — даёт эффект свечения (glow).
   Рендерится только при light: по умолчанию компонент — просто
   переливающийся контур, без сияния, выходящего за его пределы. */
.tao-animated-border--light::before {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--tao-animated-border-width));
    background: var(--tao-animated-border-gradient);
    background-size: 300% 300%;
    border-radius: var(--_tao-outer-radius);
    filter: blur(var(--tao-animated-border-glow));
    opacity: 0.65;
    z-index: -2;
    animation: tao-animated-border-gradient var(--tao-animated-border-speed) ease alternate infinite;
}

/* Сама рамка: заливка на всю область, но CSS mask вырезает внутреннюю
   часть — остаётся только полоса шириной borderWidth по периметру,
   поэтому получается контур, а не закрашенный прямоугольник.
   Внешний радиус = внутренний радиус + ширина рамки: углы концентричны. */
.tao-animated-border::after {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--tao-animated-border-width));
    background: var(--tao-animated-border-gradient);
    background-size: 300% 300%;
    border-radius: var(--_tao-outer-radius);
    padding: var(--tao-animated-border-width);
    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
    mask-composite: exclude;
    z-index: -1;
    animation: tao-animated-border-gradient var(--tao-animated-border-speed) ease alternate infinite;
}

/* a still gradient for those who asked the system for less motion / статичный градиент для тех, кто просил меньше движения */
@media (prefers-reduced-motion: reduce) {
    .tao-animated-border::before,
    .tao-animated-border::after {
        animation: none;
    }
}

@keyframes tao-animated-border-gradient {
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
}
</style>
