<script setup>
import { TaoIcon, TaoThemeToggle } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoThemeToggle' })
</script>

<template>
  <ShowcaseSection id="theme-toggle" :tables="propTables['theme-toggle']">
    <h2>TaoThemeToggle</h2>
    <Tr>
      <template #en>
        <p>
          The light / dark switch as one icon button. The icon is the theme a click leads to (a sun while the page is dark),
          the <code>aria-label</code> says the same in words. By default it reads <code>data-tao-mode</code> of
          <code>&lt;html&gt;</code>, flips it on a click and follows it when somebody else changes it; a palette keeps its name.
          For your own storage use <code>v-model</code> with <code>:apply="false"</code>; your own glyph goes in the <code>#icon="{ mode, next }"</code> slot (the last button shows the current theme). Try it: it changes this page.
        </p>
      </template>
      <template #ru>
        <p>
          Переключатель светлой / тёмной темы одной кнопкой-иконкой. Иконка — тема, к которой ведёт клик (солнце, пока
          страница тёмная), <code>aria-label</code> говорит то же словами. По умолчанию читает <code>data-tao-mode</code>
          у <code>&lt;html&gt;</code>, по клику переворачивает его и следует за ним, если режим меняет кто-то другой;
          палитра сохраняет своё имя. Для своего хранилища — <code>v-model</code> с <code>:apply="false"</code>; свой значок — слот <code>#icon="{ mode, next }"</code> (в последней кнопке он показывает текущую тему).
          Попробуйте: он меняет эту страницу.
        </p>
      </template>
    </Tr>

    <div class="toggle-preview">
      <TaoThemeToggle size="small" />
      <TaoThemeToggle />
      <TaoThemeToggle size="large" />
      <TaoThemeToggle variant="secondary" />
      <TaoThemeToggle>
        <template #icon="{ mode }"><TaoIcon :name="mode === 'dark' ? 'tao-moon' : 'tao-sun'" /></template>
      </TaoThemeToggle>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoThemeToggle /&gt;

&lt;!-- your own storage --&gt;
&lt;TaoThemeToggle v-model="mode" :apply="false" /&gt;

&lt;!-- your own icon: mode is the current one, next is where a click leads --&gt;
&lt;TaoThemeToggle&gt;
  &lt;template #icon="{ mode, next }"&gt;&lt;MyIcon :name="mode" /&gt;&lt;/template&gt;
&lt;/TaoThemeToggle&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.toggle-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
}
</style>
