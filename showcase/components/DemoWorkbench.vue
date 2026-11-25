<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoKbd, TaoMenubar, TaoTag, TaoThemeToggle, TaoWorkbench } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoWorkbench' })

const left = ref('files')
const right = ref(null)
const bottom = ref(null)
const leftSize = ref(240)
const rightSize = ref(240)
const bottomSize = ref(180)

const leftTools = computed(() => [
  { id: 'files', label: tr('Files', 'Файлы'), icon: 'tao-folder', shortcut: 'Alt+1' },
  { id: 'search', label: tr('Search', 'Поиск'), icon: 'tao-search', shortcut: 'Alt+2' },
])
const rightTools = computed(() => [
  { id: 'inspector', label: tr('Inspector', 'Инспектор'), icon: 'tao-settings', shortcut: 'Alt+3' },
  { id: 'notes', label: tr('Notes', 'Заметки'), icon: 'tao-file', badge: true, badgeLabel: tr('unsaved', 'не сохранено') },
])
const bottomTools = computed(() => [
  { id: 'terminal', label: tr('Terminal', 'Терминал'), icon: 'tao-monitor', shortcut: 'Alt+4' },
  { id: 'problems', label: tr('Problems', 'Проблемы'), icon: 'tao-alert-triangle', badge: 2, badgeLabel: tr('2 problems', '2 проблемы') },
])

const menu = computed(() => [
  { id: 'file', label: tr('File', 'Файл'), items: [{ id: 'new', label: tr('New', 'Создать') }] },
  { id: 'edit', label: tr('Edit', 'Правка'), items: [{ id: 'undo', label: tr('Undo', 'Отменить') }] },
  { id: 'view', label: tr('View', 'Вид'), items: [{ id: 'panels', label: tr('Panels', 'Панели') }] },
])
</script>

<template>
  <ShowcaseSection id="workbench" :tables="propTables['workbench']">
    <h2>TaoWorkbench</h2>
    <Tr>
      <template #en>
        <p>
          The frame of an editor, as in an IDE: a top bar, a left and a right rail, a status bar at the bottom, tool windows that the rails open, and the
          workspace in the middle. Every bar has a <code>start</code> and an <code>end</code> (the slots <code>top-start</code>, <code>top-end</code>,
          <code>left-start</code>…); a rail also carries its <em>tools</em>: buttons with a hint that open a panel. The panels and the workspace are darker
          blocks over a soft glow in the top left corner, divided by <code>TaoSplit</code>, so each can be resized; <kbd>F6</kbd> goes round the regions.
          Give the parent the height of the window.
        </p>
      </template>
      <template #ru>
        <p>
          Рамка редактора, как в IDE: верхняя полоса, левая и правая рейки, внизу строка состояния, окна инструментов, которые открывают рейки, и рабочая
          область посередине. У каждой полосы есть <code>start</code> и <code>end</code> (слоты <code>top-start</code>, <code>top-end</code>,
          <code>left-start</code>…); рейка ещё несёт свои <em>инструменты</em>: кнопки с подсказкой, открывающие панель. Панели и рабочая область — более
          тёмные блоки над мягким свечением в левом верхнем углу, их делит <code>TaoSplit</code>, поэтому у каждой можно менять размер; <kbd>F6</kbd>
          ходит по областям. Дайте родителю высоту окна.
        </p>
      </template>
    </Tr>

    <div class="demo-workbench-box">
      <TaoWorkbench
        v-model:left="left"
        v-model:right="right"
        v-model:bottom="bottom"
        v-model:left-size="leftSize"
        v-model:right-size="rightSize"
        v-model:bottom-size="bottomSize"
        :left-tools="leftTools"
        :right-tools="rightTools"
        :bottom-tools="bottomTools"
      >
        <template #top-start>
          <TaoMenubar :items="menu" bordered />
        </template>
        <template #top-end>
          <TaoThemeToggle />
        </template>
        <template #left-end>
          <TaoButton variant="ghost" tone="neutral" icon="tao-settings" :aria-label="tr('Settings', 'Настройки')" />
        </template>
        <template #bottom-start>
          <span>main</span>
        </template>
        <template #bottom-end>
          <TaoTag size="small">UTF-8</TaoTag>
          <TaoKbd>Ln 12, Col 4</TaoKbd>
        </template>

        <template #left-panel="{ tool }">
          <p class="demo-workbench-text">{{ tool.label }}: {{ tr('a tree of files goes here', 'здесь дерево файлов') }}</p>
        </template>
        <template #right-panel="{ tool }">
          <p class="demo-workbench-text">{{ tool.label }}: {{ tr('the properties of the selection', 'свойства выделенного') }}</p>
        </template>
        <template #bottom-panel="{ tool }">
          <p class="demo-workbench-text">{{ tool.label }}</p>
        </template>

        <div class="demo-workbench-text">
          <strong>{{ tr('The workspace', 'Рабочая область') }}</strong> — {{ tr('your editor, a scene or a canvas', 'ваш редактор, сцена или холст') }}.
        </div>
      </TaoWorkbench>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoWorkbench v-model:left="left" v-model:right="right" v-model:bottom="bottom"
  :left-tools="[{ id: 'files', label: 'Files', icon: 'tao-folder', shortcut: 'Alt+1' }]"
  :right-tools="[…]" :bottom-tools="[…]"&gt;
  &lt;template #top-start&gt;&lt;TaoMenubar :items="menu" /&gt;&lt;/template&gt;
  &lt;template #top-end&gt;&lt;TaoThemeToggle /&gt;&lt;/template&gt;
  &lt;template #bottom-end&gt;UTF-8 · Ln 12&lt;/template&gt;
  &lt;template #left-panel="{ tool }"&gt;&lt;FileTree /&gt;&lt;/template&gt;
  &lt;Editor /&gt;
&lt;/TaoWorkbench&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-workbench-box {
  position: relative;
  height: 460px;
  overflow: hidden;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-lg);
}

.demo-workbench-text {
  margin: 0;
  padding: var(--tao-space-4);
  color: var(--tao-color-text-muted);
}
</style>
