<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoGrid' });

const props = withDefaults(
    defineProps<{
        /** Минимальная ширина плитки (auto-fill). Каталог. Игнорируется, если задан cols. */
        min?: string;
        /** Фиксированное число колонок (bento). 0 — режим min. */
        cols?: number;
        gap?: string;
    }>(),
    {
        min: '220px',
        cols: 0,
        gap: 'var(--tao-space-4)',
    },
);

const isFixed = computed(() => props.cols > 0);

const gridStyle = computed(() => ({
    '--tao-grid-min': props.min,
    '--tao-grid-cols': isFixed.value ? String(props.cols) : undefined,
    '--tao-grid-gap': props.gap,
}));
</script>

<template>
    <div
        class="tao-grid"
        :class="{ 'tao-grid--fixed': isFixed }"
        :style="gridStyle"
    >
        <slot />
    </div>
</template>

<style scoped>
.tao-grid {
    container-type: inline-size;
    display: grid;
    grid-template-columns: repeat(
        auto-fill,
        minmax(min(100%, var(--tao-grid-min, 220px)), 1fr)
    );
    gap: var(--tao-grid-gap, var(--tao-space-4));
}

.tao-grid--fixed {
    grid-template-columns: repeat(var(--tao-grid-cols), minmax(0, 1fr));
}

@container (max-width: 560px) {
    .tao-grid--fixed {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
