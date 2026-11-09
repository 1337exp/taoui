<script setup>
import { ref } from 'vue'
import { TaoIcon, TaoThemeToggle } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoThemeToggle' })

// three states side by side, each on its own (apply off: they do not touch this page)
// три состояния рядом, каждое само по себе (apply выключен: страницу не трогают)
const states = ref(['system', 'light', 'dark'])
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
          With <code>system</code> there is a third state, «follow the system»: the click goes system → light → dark, the icon
          is the state it is in (the monitor is the system), and <code>v-model</code> then also holds <code>'system'</code>.
        </p>
      </template>
      <template #ru>
        <p>
          Переключатель светлой / тёмной темы одной кнопкой-иконкой. Иконка — тема, к которой ведёт клик (солнце, пока
          страница тёмная), <code>aria-label</code> говорит то же словами. По умолчанию читает <code>data-tao-mode</code>
          у <code>&lt;html&gt;</code>, по клику переворачивает его и следует за ним, если режим меняет кто-то другой;
          палитра сохраняет своё имя. Для своего хранилища — <code>v-model</code> с <code>:apply="false"</code>; свой значок — слот <code>#icon="{ mode, next }"</code> (в последней кнопке он показывает текущую тему).
          Попробуйте: он меняет эту страницу. С <code>system</code> появляется третье состояние «как в системе»: клик идёт
          системная → светлая → тёмная, иконка показывает текущее состояние (монитор — системная), а <code>v-model</code> держит ещё и <code>'system'</code>.
        </p>
      </template>
    </Tr>

    <div class="toggle-preview">
      <TaoThemeToggle size="small" />
      <TaoThemeToggle />
      <TaoThemeToggle size="large" />
      <TaoThemeToggle variant="secondary" />
      <TaoThemeToggle system />
      <TaoThemeToggle v-for="(state, i) in states" :key="i" v-model="states[i]" system :apply="false" />
      <TaoThemeToggle>
        <template #icon="{ mode }"><TaoIcon :name="mode === 'dark' ? 'tao-moon' : 'tao-sun'" /></template>
      </TaoThemeToggle>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoThemeToggle /&gt;

&lt;!-- a third state: follow the system (system → light → dark) --&gt;
&lt;TaoThemeToggle system /&gt;

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
