<script setup>
import { TaoIcon } from '@1337exp/taoui'

defineOptions({ name: 'A11yPanel' })

// A framed block of the section: a title with an icon and a hint on the right.
// Блок раздела в рамке: заголовок со значком и подсказка справа.
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: 'tao-info' },
})
</script>

<template>
  <div class="a11y-panel">
    <header class="a11y-panel__head">
      <h3 class="a11y-panel__title"><TaoIcon :name="icon" /> {{ title }}</h3>
      <p v-if="$slots.hint" class="a11y-panel__hint"><slot name="hint" /></p>
    </header>
    <slot />
  </div>
</template>

<style scoped>
.a11y-panel {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface-raised);
  /* the blocks inside lay out by the width of this panel, not of the window: the sidebar takes a part of it */
  container-type: inline-size;
}

.a11y-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-bottom: 16px;
}

.a11y-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 15px;
  color: var(--tao-color-text-strong);
}

.a11y-panel__title :deep(.tao-icon) {
  color: var(--tao-color-accent-text);
}

.a11y-panel__hint {
  margin: 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}
</style>
