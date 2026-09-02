<script lang="ts" setup>
defineOptions({ name: 'TaoAnimatedBorder' });

interface Props {
    borderWidth?: number;
    speed?: number;
    /** Радиус размытия glow-эффекта позади рамки, px. Работает только при light. */
    glow?: number;
    /** Добавляет мягкое свечение вокруг рамки. По умолчанию выключено —
     * компонент остаётся именно рамкой (переливается только контур),
     * без "света", выходящего за её пределы. */
    light?: boolean;
}

withDefaults(defineProps<Props>(), {
    borderWidth: 3,
    speed: 6,
    glow: 16,
    light: false,
});
</script>

<template>
    <div
        class="tao-animated-border"
        :class="{ 'tao-animated-border--light': light }"
        :style="{
            '--tao-animated-border-width': `${borderWidth}px`,
            '--tao-animated-border-speed': `${speed}s`,
            '--tao-animated-border-glow': `${glow}px`,
        }"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-animated-border {
    background: var(--tao-color-surface-raised);
    position: relative;
    z-index: 0;
    border-radius: var(--tao-animated-border-width);
}

/* Размытая копия рамки позади — даёт эффект свечения (glow).
   Рендерится только при light: по умолчанию компонент — просто
   переливающийся контур, без сияния, выходящего за его пределы. */
.tao-animated-border--light::before {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--tao-animated-border-width));
    background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
    background-size: 300% 300%;
    border-radius: calc(2 * var(--tao-animated-border-width));
    filter: blur(var(--tao-animated-border-glow));
    opacity: 0.65;
    z-index: -2;
    animation: tao-animated-border-gradient var(--tao-animated-border-speed) ease alternate infinite;
}

/* Сама рамка: заливка на всю область, но CSS mask вырезает внутреннюю
   часть — остаётся только полоса шириной borderWidth по периметру,
   поэтому получается контур, а не закрашенный прямоугольник. */
.tao-animated-border::after {
    content: '';
    position: absolute;
    inset: calc(-1 * var(--tao-animated-border-width));
    background: linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82);
    background-size: 300% 300%;
    border-radius: calc(2 * var(--tao-animated-border-width));
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
