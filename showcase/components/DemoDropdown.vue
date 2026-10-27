<script setup>
import { computed, ref } from 'vue'
import { TaoDropdownMenu } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDropdown' })

const dropdownItems = computed(() => [
  { id: 'edit', label: tr('Edit', 'Редактировать') },
  { id: 'duplicate', label: tr('Duplicate', 'Дублировать') },
  { id: 'delete', label: tr('Delete', 'Удалить') },
])

// a menu of an editor: shortcuts, a submenu, checkboxes and radios
const grid = ref(true)
const snap = ref(false)
const mode = ref('move')
const editorItems = computed(() => [
  { id: 'new', label: tr('New', 'Создать'), shortcut: 'Ctrl+N' },
  { id: 'save', label: tr('Save', 'Сохранить'), shortcut: 'Ctrl+S' },
  {
    id: 'recent',
    label: tr('Open recent', 'Недавние'),
    items: [
      { id: 'r1', label: 'level-01.json' },
      { id: 'r2', label: 'level-02.json' },
      { type: 'separator' },
      { id: 'clear', label: tr('Clear the list', 'Очистить список') },
    ],
  },
  { type: 'separator' },
  { type: 'label', label: tr('View', 'Вид') },
  { type: 'checkbox', id: 'grid', label: tr('Grid', 'Сетка'), checked: grid.value },
  { type: 'checkbox', id: 'snap', label: tr('Snap', 'Привязка'), checked: snap.value, shortcut: 'Shift+S' },
  { type: 'separator' },
  { type: 'radio', id: 'move', group: 'mode', label: tr('Move', 'Перемещение'), checked: mode.value === 'move' },
  { type: 'radio', id: 'rotate', group: 'mode', label: tr('Rotate', 'Вращение'), checked: mode.value === 'rotate' },
  { id: 'quit', label: tr('Quit', 'Выход'), disabled: true },
])
const lastPicked = ref('')

function onEditorSelect(id) {
  lastPicked.value = id
  if (id === 'grid') grid.value = !grid.value
  else if (id === 'snap') snap.value = !snap.value
  else if (id === 'move' || id === 'rotate') mode.value = id
}
</script>

<template>
  <ShowcaseSection id="dropdown" :tables="propTables['dropdown']">
    <h2>TaoDropdownMenu</h2>
          <p>{{ tr('A dropdown menu that positions itself automatically near the screen edge', 'Выпадающее меню с авто-позиционированием у края экрана') }}</p>
    
          <TaoDropdownMenu :items="dropdownItems" @select="(id) => console.log('selected:', id)" />

          <h3>{{ tr('Submenus, checkboxes, radios, shortcuts', 'Подменю, чекбоксы, радио, сочетания') }}</h3>
          <p>
            {{ tr('Arrows move, right opens a submenu, left or Esc closes it, a letter jumps to an item, Home / End, Enter picks. Disabled items are skipped.', 'Стрелки ходят, вправо открывает подменю, влево или Esc закрывает, буква прыгает к пункту, Home / End, Enter выбирает. Недоступные пропускаются.') }}
          </p>
          <div style="display: flex; align-items: center; gap: 12px;">
            <TaoDropdownMenu :items="editorItems" placement="bottom-start" @select="onEditorSelect">
              <template #button>{{ tr('File', 'Файл') }}</template>
            </TaoDropdownMenu>
            <span>{{ tr('Picked:', 'Выбрано:') }} <code>{{ lastPicked || '-' }}</code> · grid {{ grid }} · snap {{ snap }} · {{ mode }}</span>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoDropdownMenu :items="items" @select="onSelect" /&gt;

const items = [
  { id: 'save', label: 'Save', shortcut: 'Ctrl+S' },
  { id: 'recent', label: 'Open recent', items: [{ id: 'r1', label: 'level-01.json' }] },
  { type: 'separator' },
  { type: 'checkbox', id: 'grid', label: 'Grid', checked: true },
  { type: 'radio', id: 'move', group: 'mode', label: 'Move', checked: true },
]</code></pre>
          </div>
  </ShowcaseSection>
</template>
