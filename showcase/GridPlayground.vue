<script setup>
import { computed } from 'vue'

defineOptions({ name: 'GridPlayground' })

/**
 * Не часть библиотеки: черновик сетки карточек только для showcase.
 * CSS Grid, без JS-колонок и без masonry-упаковки.
 * min — ширина плитки (auto-fill). cols — фиксированное число колонок.
 */
const props = defineProps({
  min: { type: String, default: '220px' },
  cols: { type: Number, default: 0 },
  gap: { type: String, default: 'var(--tao-space-4)' },
})

const style = computed(() => ({
  '--showcase-grid-min': props.min,
  '--showcase-grid-cols': props.cols || undefined,
  '--showcase-grid-gap': props.gap,
}))
</script>

<template>
  <div
    class="showcase-grid"
    :class="{ 'showcase-grid--fixed': cols > 0 }"
    :style="style"
  >
    <slot />
  </div>
</template>

<style scoped>
.showcase-grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(100%, var(--showcase-grid-min, 220px)), 1fr)
  );
  gap: var(--showcase-grid-gap, var(--tao-space-4));
}

.showcase-grid--fixed {
  grid-template-columns: repeat(var(--showcase-grid-cols), minmax(0, 1fr));
}

@container (max-width: 560px) {
  .showcase-grid--fixed {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
