<script lang="ts" setup>
import { computed } from 'vue';

defineOptions({ name: 'TaoGridItem' });

const props = withDefaults(
    defineProps<{
        /** Сколько колонок занять. Для bento (`cols`), не для каталога (`min`). */
        col?: number;
        row?: number;
    }>(),
    {
        col: 1,
        row: 1,
    },
);

const itemStyle = computed(() => ({
    '--tao-grid-col': String(Math.max(1, props.col)),
    '--tao-grid-row': String(Math.max(1, props.row)),
}));
</script>

<template>
    <div class="tao-grid-item" :style="itemStyle">
        <slot />
    </div>
</template>

<style scoped>
.tao-grid-item {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    grid-column: span var(--tao-grid-col, 1);
    grid-row: span var(--tao-grid-row, 1);
}

.tao-grid-item > * {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}

@container (max-width: 560px) {
    .tao-grid-item {
        grid-column: span 1;
        grid-row: span 1;
    }
}
</style>
