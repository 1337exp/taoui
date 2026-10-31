<script setup>
import { computed } from 'vue'
import { TaoTag } from '@1337exp/taoui'

defineOptions({ name: 'RatioBadge' })

// A WCAG 2 ratio as a tag: green when it reaches what it must, red when it does not.
// Отношение WCAG 2 меткой: зелёная, если дотянуло до нужного, красная, если нет.
const props = defineProps({
  ratio: { type: Number, required: true },
  need: { type: Number, default: 0 },
})

const text = computed(() => `${props.ratio.toFixed(2)}:1`)
const tone = computed(() => (props.need ? (props.ratio >= props.need ? 'success' : 'danger') : 'neutral'))
</script>

<template>
  <TaoTag size="small" :tone="tone" class="ratio-badge">{{ text }}</TaoTag>
</template>

<style scoped>
.ratio-badge {
  font-variant-numeric: tabular-nums;
}
</style>
