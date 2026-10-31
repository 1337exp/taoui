<script setup>
import { TaoButton, TaoToolbar, TaoToolbarGroup, TaoToolbarSeparator } from '@1337exp/taoui'
import A11yPanel from './A11yPanel.vue'
import { KEYS } from './keys.js'
import { PROMISES } from './pairs.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'KeyboardMap' })
</script>

<template>
  <A11yPanel icon="tao-settings" :title="tr('A field for the keyboard: a toolbar to try', 'Поле для клавиатуры: тулбар, чтобы попробовать')">
    <template #hint>{{ tr('the focus is always visible: the accent outline with a gap', 'фокус всегда виден: обводка цветом акцента с отступом') }}</template>

    <TaoToolbar :label="tr('Tools to try the keys on', 'Инструменты, чтобы пробовать клавиши')">
      <TaoToolbarGroup :label="tr('Edit', 'Правка')">
        <TaoButton variant="ghost" tone="neutral" icon="tao-copy" :aria-label="tr('Copy', 'Копировать')" />
        <TaoButton variant="ghost" tone="neutral" icon="tao-edit" :aria-label="tr('Edit', 'Править')" />
        <TaoButton variant="ghost" tone="neutral" icon="tao-trash" :aria-label="tr('Delete', 'Удалить')" />
      </TaoToolbarGroup>
      <TaoToolbarSeparator />
      <TaoToolbarGroup :label="tr('Plan', 'План')">
        <TaoButton variant="ghost" tone="neutral" icon="tao-calendar" :aria-label="tr('Calendar', 'Календарь')" />
        <TaoButton variant="ghost" tone="neutral" icon="tao-bell" :aria-label="tr('Remind', 'Напомнить')" />
      </TaoToolbarGroup>
    </TaoToolbar>

    <p class="keyboard-map__more">
      {{
        tr(
          'Plus aria-pressed on toggles, role="meter" on the meter, a focus trap in overlays, and focus that goes back to where it was when a layer closes.',
          'Плюс aria-pressed у переключателей, role="meter" у измерителя, focus trap в оверлеях и возврат фокуса туда, где он был, когда слой закрывается.',
        )
      }}
    </p>
  </A11yPanel>

  <A11yPanel icon="tao-settings" :title="tr('What the keys do', 'Что какие клавиши делают')">
    <template #hint>{{ tr('the patterns of WAI-ARIA that the kit follows', 'по образцам WAI-ARIA, которым следует набор') }}</template>

    <ul class="keyboard-map__keys">
      <li v-for="row in KEYS" :key="row.keys.join()" class="keyboard-map__card">
        <span class="keyboard-map__caps">
          <kbd v-for="key in row.keys" :key="key">{{ key }}</kbd>
        </span>
        <span class="keyboard-map__what">{{ tr(row.en, row.ru) }}</span>
      </li>
    </ul>
  </A11yPanel>

  <A11yPanel icon="tao-check-circle" :title="tr('What is promised in numbers, not in words', 'Что обещано числами, а не словами')">
    <template #hint>{{ tr('tests/palette.test.ts holds this: every palette, both modes, every fill', 'это держит tests/palette.test.ts: каждая палитра, оба режима, каждая заливка') }}</template>

    <ul class="keyboard-map__promises">
      <li v-for="promise in PROMISES" :key="promise.en" class="keyboard-map__promise">
        <strong>{{ promise.value }}</strong>
        <span>{{ tr(promise.en, promise.ru) }}</span>
      </li>
    </ul>
  </A11yPanel>
</template>

<style scoped>
.keyboard-map__more {
  margin: 14px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.keyboard-map__keys {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.keyboard-map__card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
  font-size: 13px;
  line-height: 1.45;
}

.keyboard-map__caps {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  gap: 4px;
  width: 92px;
}

.keyboard-map__caps kbd {
  display: inline-block;
  min-width: 24px;
  padding: 2px 6px;
  border: 1px solid var(--tao-color-border);
  border-bottom-width: 2px;
  border-radius: var(--tao-radius-sm);
  background: var(--tao-color-surface-raised);
  color: var(--tao-color-text-strong);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.keyboard-map__what {
  min-width: 0;
  color: var(--tao-color-text-muted);
}

.keyboard-map__promises {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
}

.keyboard-map__promise {
  display: grid;
  align-content: start;
  gap: 4px;
  padding: 14px 16px;
  border-right: 1px solid var(--tao-color-border);
  font-size: 13px;
}

.keyboard-map__promise:last-child {
  border-right: none;
}

.keyboard-map__promise strong {
  color: var(--tao-color-text-strong);
  font-size: 20px;
  font-variant-numeric: tabular-nums;
}

.keyboard-map__promise span {
  color: var(--tao-color-text-muted);
}
</style>
