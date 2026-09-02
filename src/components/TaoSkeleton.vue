<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoSkeleton' });

const props = withDefaults(
    defineProps<{
        variant?: 'text' | 'title' | 'circle' | 'rect';
        lines?: number;
        width?: string;
        height?: string;
    }>(),
    {
        variant: 'text',
        lines: 1,
        width: '',
        height: '',
    },
);

const count = computed(() => Math.max(1, props.lines));
</script>

<template>
    <div class="tao-skeleton-group" :aria-hidden="true">
        <span
            v-for="index in count"
            :key="index"
            class="tao-skeleton"
            :class="`tao-skeleton--${variant}`"
            :style="{ width: width || undefined, height: height || undefined }"
        />
    </div>
</template>

<style scoped>
.tao-skeleton-group {
    display: flex;
    flex-direction: column;
    gap: var(--tao-space-2);
    width: 100%;
}

.tao-skeleton {
    display: block;
    background: var(--tao-color-surface-sunken);
    border-radius: var(--tao-radius-control);
    animation: tao-skeleton-pulse 1.2s var(--tao-ease-base) infinite;
}

.tao-skeleton--text {
    height: 12px;
    width: 100%;
}

.tao-skeleton--text:last-child:not(:only-child) {
    width: 72%;
}

.tao-skeleton--title {
    height: 20px;
    width: 40%;
    border-radius: var(--tao-radius-control);
}

.tao-skeleton--circle {
    width: 40px;
    height: 40px;
    border-radius: var(--tao-radius-full);
}

.tao-skeleton--rect {
    width: 100%;
    height: 80px;
    border-radius: var(--tao-radius-panel);
}

@keyframes tao-skeleton-pulse {
    0%,
    100% {
        opacity: 0.55;
    }
    50% {
        opacity: 1;
    }
}
</style>
