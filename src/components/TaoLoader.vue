<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoLoader' });

interface Props {
    color?: string;
    size?: number | string;
    inline?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    color: 'var(--tao-color-accent)',
    size: 80,
    inline: false,
});

const normalizedSize = computed(() => {
    if (typeof props.size === 'number') {
        return `${props.size}px`;
    }
    return props.size;
});

const dotSizeNumber = computed(() => {
    const baseSize = typeof props.size === 'number' ? props.size : parseInt(props.size, 10) || 80;
    return baseSize * 0.1625;
});

const dotSize = computed(() => `${dotSizeNumber.value}px`);

const positions = computed(() => {
    const baseSize = typeof props.size === 'number' ? props.size : parseInt(props.size, 10) || 80;
    return {
        first: `${baseSize * 0.1}px`,
        third: `${baseSize * 0.4}px`,
        fourth: `${baseSize * 0.7}px`,
        animationDistance: `${baseSize * 0.3}px`,
    };
});
</script>

<template>
    <div class="tao-loader" :class="{ 'tao-loader--inline': props.inline }">
        <div
            class="tao-loader__ellipsis"
            :style="{ width: normalizedSize, height: dotSize, marginLeft: `-${dotSizeNumber / 2}px` }"
        >
            <div :style="{ background: props.color, width: dotSize, height: dotSize }" />
            <div :style="{ background: props.color, width: dotSize, height: dotSize }" />
            <div :style="{ background: props.color, width: dotSize, height: dotSize }" />
            <div :style="{ background: props.color, width: dotSize, height: dotSize }" />
        </div>
    </div>
</template>

<style scoped>
.tao-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.tao-loader--inline {
    display: inline-block;
    width: 30px;
}

.tao-loader__ellipsis {
    display: block;
    position: relative;
}

.tao-loader__ellipsis div {
    position: absolute;
    top: 0;
    border-radius: var(--tao-radius-full);
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.tao-loader__ellipsis div:nth-child(1) {
    left: v-bind('positions.first');
    animation: tao-loader-grow 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(2) {
    left: v-bind('positions.first');
    animation: tao-loader-move 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(3) {
    left: v-bind('positions.third');
    animation: tao-loader-move 0.6s infinite;
}

.tao-loader__ellipsis div:nth-child(4) {
    left: v-bind('positions.fourth');
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
    100% { transform: translate(v-bind('positions.animationDistance'), 0); }
}
</style>
