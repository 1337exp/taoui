<script setup>
import { TaoIcon, taoIconNames } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoIcon' })
</script>

<template>
  <ShowcaseSection id="icon" :tables="propTables['icon']">
    <h2>TaoIcon</h2>
          <Tr>
            <template #en><p>The built-in set is SVG on <code>currentColor</code>, so an icon takes the text colour and the font size (1em, or <code>size</code> in px). The names carry the reserved prefix <code>tao-</code>. Any other name is the class <code>icon-&lt;name&gt;</code> of your own icon font, or an icon you registered with <code>registerTaoIcons</code>.</p></template>
            <template #ru><p>Встроенный набор — SVG на <code>currentColor</code>: иконка берёт цвет и размер текста (1em или <code>size</code> в px). Имена с зарезервированной приставкой <code>tao-</code>. Любое другое имя — класс <code>icon-&lt;name&gt;</code> вашего шрифта или иконка, зарегистрированная через <code>registerTaoIcons</code>.</p></template>
          </Tr>

          <div class="icon-grid">
            <div v-for="name in taoIconNames" :key="name" class="icon-cell" :title="name">
              <TaoIcon :name="name" :size="24" />
              <code>{{ name }}</code>
            </div>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoIcon name="tao-check" /&gt;
&lt;TaoIcon name="tao-close" :size="20" /&gt;

// {{ tr('your own SVG', 'свой SVG') }}
registerTaoIcons({ rocket: { body: '&lt;path d="M12 3l4 8-4 10-4-10z"/&gt;' } })
&lt;TaoIcon name="rocket" /&gt;

// {{ tr('your own icon font: the class icon-my-glyph', 'свой шрифт: класс icon-my-glyph') }}
&lt;TaoIcon name="my-glyph" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin: 16px 0;
}

.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-control);
  color: var(--tao-color-text-strong);
}

.icon-cell code {
  font-size: 11px;
  color: var(--tao-color-text-muted);
}
</style>
