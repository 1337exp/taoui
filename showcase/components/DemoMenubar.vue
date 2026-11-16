<script setup>
import { computed, ref } from 'vue'
import { TaoContextMenu, TaoMenu, TaoMenubar } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoMenubar' })

// a tiny editor: the menu state lives here, the menus only show it and report the picks
const grid = ref(true)
const snap = ref(false)
const tool = ref('move')
const log = ref([])

// a menu at a point of the screen: no anchor element, a point { x, y } in viewport coordinates
const pointOpen = ref(false)
const point = ref({ x: 0, y: 0 })
const pointItems = computed(() => [
  { id: 'note', label: tr('New note here', 'Новая заметка здесь') },
  { id: 'link', label: tr('Link to…', 'Связать с…'), items: [{ id: 'depends', label: tr('Depends on', 'Зависит от') }, { id: 'blocks', label: tr('Blocks', 'Блокирует') }] },
])
function openAt(event) {
  point.value = { x: event.clientX, y: event.clientY }
  pointOpen.value = true
}

const menubar = computed(() => [
  {
    id: 'file',
    label: tr('File', 'Файл'),
    items: [
      { id: 'new', label: tr('New', 'Создать'), shortcut: 'Ctrl+N' },
      { id: 'open', label: tr('Open…', 'Открыть…'), shortcut: 'Ctrl+O' },
      {
        id: 'recent',
        label: tr('Open recent', 'Недавние'),
        items: [
          { id: 'r1', label: 'level-01.json' },
          { id: 'r2', label: 'level-02.json' },
        ],
      },
      { type: 'separator' },
      { id: 'save', label: tr('Save', 'Сохранить'), shortcut: 'Ctrl+S' },
      { id: 'export', label: tr('Export', 'Экспорт'), disabled: true },
    ],
  },
  {
    id: 'edit',
    label: tr('Edit', 'Правка'),
    items: [
      { id: 'undo', label: tr('Undo', 'Отменить'), shortcut: 'Ctrl+Z' },
      { id: 'redo', label: tr('Redo', 'Повторить'), shortcut: 'Ctrl+Shift+Z' },
      { type: 'separator' },
      { id: 'cut', label: tr('Cut', 'Вырезать'), shortcut: 'Ctrl+X' },
      { id: 'copy', label: tr('Copy', 'Копировать'), shortcut: 'Ctrl+C' },
      { id: 'paste', label: tr('Paste', 'Вставить'), shortcut: 'Ctrl+V' },
    ],
  },
  {
    id: 'view',
    label: tr('View', 'Вид'),
    items: [
      { type: 'checkbox', id: 'grid', label: tr('Grid', 'Сетка'), checked: grid.value, shortcut: "Ctrl+'" },
      { type: 'checkbox', id: 'snap', label: tr('Snap', 'Привязка'), checked: snap.value },
      { type: 'separator' },
      { type: 'label', label: tr('Tool', 'Инструмент') },
      { type: 'radio', id: 'move', group: 'tool', label: tr('Move', 'Перемещение'), checked: tool.value === 'move', shortcut: 'V' },
      { type: 'radio', id: 'rotate', group: 'tool', label: tr('Rotate', 'Вращение'), checked: tool.value === 'rotate', shortcut: 'R' },
    ],
  },
  { id: 'help', label: tr('Help', 'Справка') },
])

const contextItems = computed(() => [
  { id: 'cut', label: tr('Cut', 'Вырезать'), shortcut: 'Ctrl+X' },
  { id: 'copy', label: tr('Copy', 'Копировать'), shortcut: 'Ctrl+C' },
  { id: 'paste', label: tr('Paste', 'Вставить'), shortcut: 'Ctrl+V' },
  { type: 'separator' },
  { id: 'arrange', label: tr('Arrange', 'Порядок'), items: [{ id: 'front', label: tr('Bring to front', 'На передний план') }, { id: 'back', label: tr('Send to back', 'На задний план') }] },
  { id: 'delete', label: tr('Delete', 'Удалить'), shortcut: 'Del' },
])

function onSelect(id) {
  if (id === 'grid') grid.value = !grid.value
  else if (id === 'snap') snap.value = !snap.value
  else if (id === 'move' || id === 'rotate') tool.value = id
  log.value = [id, ...log.value].slice(0, 4)
}
</script>

<template>
  <ShowcaseSection id="menubar" :tables="propTables['menubar']">
    <h2>TaoMenubar / TaoContextMenu</h2>
          <Tr>
            <template #en>
              <p>
                The menu bar of an editor and the menu on the right click, both on <code>TaoMenu</code>: submenus, checkboxes,
                radios, shortcuts to show. The bar is one tab stop: <kbd>←</kbd> <kbd>→</kbd> walk it, <kbd>↓</kbd> opens a menu,
                and with a menu open <kbd>←</kbd> <kbd>→</kbd> go on to the neighbour one, the pointer too. The menus only show the
                state and report the picks; the shortcuts are text, nothing listens to them here.
              </p>
            </template>
            <template #ru>
              <p>
                Полоса меню редактора и меню по правой кнопке, обе на <code>TaoMenu</code>: подменю, чекбоксы, радио, подписи
                сочетаний. Полоса — одна остановка Tab: <kbd>←</kbd> <kbd>→</kbd> ходят по ней, <kbd>↓</kbd> открывает меню, а при
                открытом меню <kbd>←</kbd> <kbd>→</kbd> переходят к соседнему, указатель тоже. Меню только показывают состояние и
                сообщают выбор; сочетания — это текст, здесь их никто не слушает.
              </p>
            </template>
          </Tr>

          <div class="menubar-demo">
            <TaoMenubar :items="menubar" @select="onSelect" />
            <TaoContextMenu :items="contextItems" @select="onSelect">
              <div class="menubar-demo__canvas" tabindex="0">
                <span>{{ tr('Right click here (or the Menu key)', 'Правый клик здесь (или клавиша Menu)') }}</span>
                <small>grid {{ grid }} · snap {{ snap }} · {{ tool }}</small>
                <small v-if="log.length">{{ tr('Picked:', 'Выбрано:') }} {{ log.join(' · ') }}</small>
              </div>
            </TaoContextMenu>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoMenubar :items="menu" @select="run" /&gt;

const menu = [
  { id: 'file', label: 'File', items: [
    { id: 'save', label: 'Save', shortcut: 'Ctrl+S' },
    { id: 'recent', label: 'Open recent', items: [{ id: 'r1', label: 'level-01.json' }] },
  ] },
  { id: 'view', label: 'View', items: [
    { type: 'checkbox', id: 'grid', label: 'Grid', checked: grid },
  ] },
  { id: 'help', label: 'Help' },   // no items: a plain action
]

&lt;TaoContextMenu :items="contextItems" @select="run"&gt;
  &lt;div class="canvas"&gt;…&lt;/div&gt;
&lt;/TaoContextMenu&gt;</code></pre>
          </div>

          <Tr>
            <template #en>
              <h3>A menu at a point</h3>
              <p>
                <code>TaoMenu</code> hangs from an element or from a point <code>{ x, y }</code> in viewport coordinates (optionally
                <code>width</code> and <code>height</code>): a drop point on a canvas, a menu of your own. By default the top-left
                corner is 4px under the point, so the click that opened it does not hit the first item; it flips and shifts at the
                edges like an anchored menu. A point follows nothing (the panel is fixed; <code>closeOnScroll</code> closes it on a
                scroll, as with an element), a new point moves the menu, and on close the focus goes back to what had it. A context
                menu in three lines — listen to <code>contextmenu</code>, prevent the default, open at <code>clientX</code> / <code>clientY</code>
                (<code>TaoContextMenu</code> above is exactly that). <code>TaoPopover</code> takes the same <code>anchor</code>.
              </p>
            </template>
            <template #ru>
              <h3>Меню в точке</h3>
              <p>
                <code>TaoMenu</code> крепится к элементу или к точке <code>{ x, y }</code> в координатах окна (при желании
                <code>width</code> и <code>height</code>): точка сброса на холсте, своё меню. По умолчанию левый верхний угол на 4px
                ниже точки, поэтому клик, открывший меню, не попадает в первый пункт; у краёв оно переворачивается и сдвигается, как
                меню с якорем. Точка ни за чем не следует (панель fixed; <code>closeOnScroll</code> закрывает её при прокрутке, как у
                элемента), новая точка двигает меню, при закрытии фокус возвращается тому, у кого он был. Контекстное меню в три
                строки — слушать <code>contextmenu</code>, отменить действие по умолчанию, открыть в <code>clientX</code> /
                <code>clientY</code> (<code>TaoContextMenu</code> выше делает ровно это). <code>TaoPopover</code> принимает тот же
                <code>anchor</code>.
              </p>
            </template>
          </Tr>
          <div class="menubar-demo__canvas" tabindex="0" @contextmenu.prevent="openAt" @click="openAt">
            <span>{{ tr('Click or right click anywhere here', 'Клик или правый клик где угодно здесь') }}</span>
          </div>
          <TaoMenu :items="pointItems" :open="pointOpen" :anchor="point" @close="pointOpen = false" @select="onSelect" />
          <div class="code-block">
            <pre><code>&lt;div @contextmenu.prevent="(e) =&gt; { point = { x: e.clientX, y: e.clientY }; open = true }"&gt;…&lt;/div&gt;
&lt;TaoMenu :items="items" :open="open" :anchor="point" @close="open = false" @select="run" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.menubar-demo {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.menubar-demo__canvas {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  min-height: 160px;
  border: 1px dashed var(--tao-color-border-strong);
  border-radius: var(--tao-radius-panel);
  color: var(--tao-color-text-muted);
  background: var(--tao-color-surface-sunken);
}

.menubar-demo__canvas:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: 2px;
}

.menubar-demo__canvas small {
  font-size: 12px;
}
</style>
