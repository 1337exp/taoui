<script lang="ts" setup>
import { computed } from 'vue';
import { toCssLength, type TaoLength } from '../length';
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
    /** Corner radius of the content; the border outside it is that plus its width. Number — px, string — CSS. / Скругление содержимого; рамка снаружи — оно плюс её ширина. */
    radius?: TaoLength;
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
    '--tao-radius': toCssLength(props.radius),
}));
</script>

<template>
    <div
        class="tao-animated-border"
        :class="[toneClass(variant === 'tone' ? tone : undefined), { 'tao-animated-border--light': light }]"
        :style="style"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-animated-border {
    --tao-radius: var(--tao-radius-panel);

    background: var(--tao-color-surface-raised);
    position: relative;
    z-index: 0;
    border-radius: var(--tao-radius);
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
    border-radius: calc(var(--tao-radius) + var(--tao-animated-border-width));
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
    border-radius: calc(var(--tao-radius) + var(--tao-animated-border-width));
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
