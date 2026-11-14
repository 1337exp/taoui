<script setup>
import { TaoKbd, TaoButton, TaoTooltip } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoKbd' })
</script>

<template>
  <ShowcaseSection id="kbd" :tables="propTables['kbd']">
    <h2>TaoKbd</h2>
    <Tr>
      <template #en>
        <p>
          A key: one look for every place that shows one. <code>cap</code> (default) is a key cap with a quiet fill of the
          text colour, so it fits any tone and theme; <code>plain</code> is muted text for a column of keys in a menu.
          <code>TaoButton</code> and <code>TaoTooltip</code> (<code>shortcut</code>), <code>TaoMenu</code> and
          <code>TaoCommandList</code> use it.
        </p>
      </template>
      <template #ru>
        <p>
          Клавиша: один вид для всех мест, где она показывается. <code>cap</code> (по умолчанию) — значок с тихой заливкой
          цветом текста, подходит любому тону и теме; <code>plain</code> — приглушённый текст для колонки клавиш в меню.
          Его используют <code>TaoButton</code> и <code>TaoTooltip</code> (<code>shortcut</code>), <code>TaoMenu</code> и
          <code>TaoCommandList</code>.
        </p>
      </template>
    </Tr>

    <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
      <TaoKbd>T</TaoKbd>
      <TaoKbd>Ctrl+K</TaoKbd>
      <TaoKbd>⌘</TaoKbd>
      <TaoKbd variant="plain">Ctrl+Z</TaoKbd>
      <TaoButton variant="secondary" shortcut="N">{{ tr('New', 'Новое') }}</TaoButton>
      <TaoButton tone="neutral" variant="ghost" shortcut="Ctrl+S">{{ tr('Save', 'Сохранить') }}</TaoButton>
      <TaoTooltip :content="tr('Command palette', 'Палитра команд')" shortcut="Ctrl+K">
        <TaoButton variant="secondary">{{ tr('A tooltip', 'Подсказка') }}</TaoButton>
      </TaoTooltip>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoKbd&gt;Ctrl+K&lt;/TaoKbd&gt;
&lt;TaoKbd variant="plain"&gt;Ctrl+Z&lt;/TaoKbd&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>
