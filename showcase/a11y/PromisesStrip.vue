<script setup>
import A11yPanel from './A11yPanel.vue'
import { PROMISES } from './pairs.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'PromisesStrip' })
</script>

<template>
  <A11yPanel icon="tao-check-circle" :title="tr('What is promised in numbers, not in words', 'Что обещано числами, а не словами')">
    <template #hint>{{ tr('tests/palette.test.ts holds this: every palette, both modes, every fill', 'это держит tests/palette.test.ts: каждая палитра, оба режима, каждая заливка') }}</template>

    <ul class="promises-strip__list">
      <li v-for="promise in PROMISES" :key="promise.en" class="promises-strip__item">
        <strong>{{ promise.value }}</strong>
        <span>{{ tr(promise.en, promise.ru) }}</span>
      </li>
    </ul>
  </A11yPanel>
</template>

<style scoped>
.promises-strip__list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
}

.promises-strip__item {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 14px 16px;
  border-right: 1px solid var(--tao-color-border);
  font-size: 13px;
}

.promises-strip__item:last-child {
  border-right: none;
}

.promises-strip__item strong {
  color: var(--tao-color-text-strong);
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}

.promises-strip__item span {
  color: var(--tao-color-text-muted);
}
</style>
