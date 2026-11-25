<script setup>
// The frame of an editor, as in an IDE: a top bar with the menu, a left and a right rail of tools, a status bar at the bottom, tool windows
// that the rails open, and the workspace in the middle. Copy it as App.vue and give its parent the height of the window:
//   html, body, #app { height: 100%; margin: 0; }
// Рамка редактора, как в IDE: верхняя полоса с меню, левая и правая рейки инструментов, внизу строка состояния, окна инструментов, которые
// открывают рейки, и рабочая область посередине. Скопируйте её как App.vue и дайте родителю высоту окна (html, body, #app { height: 100%; margin: 0; }).
import { computed, ref } from 'vue'
import { TaoKbd, TaoMenubar, TaoTag, TaoThemeToggle, TaoWorkbench, createKitPrefs } from '@1337exp/taoui'

const prefs = createKitPrefs({ key: 'myeditor' })

// which tool is open on each side (null: none), and the sizes of the panels, px: keep them in storage if you want them back next time
const left = ref('files')
const right = ref(null)
const bottom = ref(null)
const leftSize = ref(260)
const rightSize = ref(260)
const bottomSize = ref(200)

const leftTools = [
  { id: 'files', label: 'Files', icon: 'tao-folder', shortcut: 'Alt+1' },
  { id: 'search', label: 'Search', icon: 'tao-search', shortcut: 'Alt+2' },
]
const rightTools = [{ id: 'inspector', label: 'Inspector', icon: 'tao-settings', shortcut: 'Alt+3' }]
const bottomTools = [
  { id: 'output', label: 'Output', icon: 'tao-monitor', shortcut: 'Alt+4' },
  { id: 'problems', label: 'Problems', icon: 'tao-alert-triangle', badge: 2, badgeLabel: '2 problems' },
]

const menu = computed(() => [
  { id: 'file', label: 'File', items: [{ id: 'new', label: 'New' }, { id: 'open', label: 'Open…' }] },
  { id: 'edit', label: 'Edit', items: [{ id: 'undo', label: 'Undo' }, { id: 'redo', label: 'Redo' }] },
  { id: 'view', label: 'View', items: [{ id: 'panels', label: 'Panels' }] },
])
const line = ref(12)
</script>

<template>
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
      <TaoMenubar :items="menu" flat />
    </template>
    <template #top-end>
      <TaoThemeToggle v-model="prefs.mode.value" system :apply="false" />
    </template>

    <template #bottom-start>
      <span>main</span>
    </template>
    <template #bottom-end>
      <TaoTag size="small">UTF-8</TaoTag>
      <TaoKbd>Ln {{ line }}</TaoKbd>
    </template>

    <template #left-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}: your tree, your search.</p>
    </template>
    <template #right-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}: the properties of the selection.</p>
    </template>
    <template #bottom-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}</p>
    </template>

    <p class="pane-text">The workspace: your editor, a scene or a canvas.</p>
  </TaoWorkbench>
</template>

<style scoped>
.pane-text {
  margin: 0;
  padding: var(--tao-space-4);
  color: var(--tao-color-text-muted);
}
</style>
