<script setup>
import { provideTaoLocale } from '@1337exp/taoui'

defineOptions({ name: 'LocaleBox' })

// Gives everything inside it a language of its own, without touching the language of the page.
// Даёт всему внутри свой язык, не трогая язык страницы.
const props = defineProps({
  locale: { type: Object, required: true },
  title: { type: String, required: true },
  code: { type: String, default: '' },
})

provideTaoLocale(props.locale)
</script>

<template>
  <div class="locale-box">
    <div class="locale-box__head">
      <strong>{{ title }}</strong>
      <code v-if="code">{{ code }}</code>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.locale-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}

.locale-box__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.locale-box__head code {
  color: var(--tao-color-text-muted);
  font-size: 12px;
}
</style>
