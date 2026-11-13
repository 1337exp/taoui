<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoDocTabs } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDocTabs' })

// the open documents of an imaginary editor; the app owns the list and what each close does
// открытые документы воображаемого редактора; список и то, что значит закрытие, решает приложение
const docs = ref([
  { value: 'boom', label: 'boom.fx', title: 'effects/boom.fx.json', dirty: true },
  { value: 'fire', label: 'fire.mat', title: 'materials/fire.mat.json' },
  { value: 'smoke', label: 'smoke.fx', title: 'effects/smoke.fx.json', preview: true },
  { value: 'sheet', label: 'sheet.flipbook', closable: false },
])
const active = ref('boom')
const log = ref('')

const items = computed(() => docs.value)

function close(value) {
  const index = docs.value.findIndex((d) => d.value === value)
  docs.value.splice(index, 1)
  if (active.value === value) active.value = docs.value[Math.min(index, docs.value.length - 1)]?.value ?? ''
  log.value = tr('closed: ', 'закрыта: ') + value
}

function pin(value) {
  const doc = docs.value.find((d) => d.value === value)
  if (doc) doc.preview = false
  log.value = tr('pinned: ', 'закреплена: ') + value
}

function reorder(from, to) {
  const [doc] = docs.value.splice(from, 1)
  docs.value.splice(to, 0, doc)
  log.value = tr(`moved from ${from} to ${to}`, `перенесена с ${from} на ${to}`)
}

let n = 0
function add() {
  n++
  docs.value.push({ value: `new${n}`, label: `new-${n}.fx`, dirty: n % 2 === 0 })
  active.value = `new${n}`
}
</script>

<template>
  <ShowcaseSection id="doc-tabs" :tables="propTables['doc-tabs']">
    <h2>TaoDocTabs</h2>
    <Tr>
      <template #en>
        <p>
          The tabs of open documents, as in an editor: a tab per document, a cross to close it, a dot while it has unsaved
          changes, a <b>preview</b> in italics that the next preview replaces (a double click on the tab pins it), and the tabs
          can be dragged into another order. It draws only the row: the document itself is the app's, and so is the list, so a
          close or a move is a request (<code>@close</code>, <code>@reorder</code>) that the app carries out.
        </p>
        <p>
          Keys: <kbd>←</kbd> <kbd>→</kbd> walk the tabs and open them (the ends join), <kbd>Home</kbd> <kbd>End</kbd>,
          <kbd>Delete</kbd> closes, <kbd>Enter</kbd> pins a preview, <kbd>Alt</kbd> + <kbd>←</kbd> <kbd>→</kbd> moves the tab
          itself, the menu key (or a right click) asks for the app's own menu. The middle button closes too. A tab with
          <code>closable: false</code> has no cross. Tabs that do not fit scroll sideways (the wheel does it, the active one is
          always brought into view). The cross is for the pointer only: a keyboard user closes with <kbd>Delete</kbd>.
        </p>
      </template>
      <template #ru>
        <p>
          Вкладки открытых документов, как в редакторе: вкладка на документ, крестик закрытия, точка, пока в документе есть
          несохранённое, <b>предпросмотр</b> курсивом, который следующий предпросмотр заменяет (двойной клик по вкладке его
          закрепляет), и вкладки можно перетаскивать, меняя порядок. Рисуется только ряд: сам документ и список принадлежат
          приложению, поэтому закрытие и перенос это просьбы (<code>@close</code>, <code>@reorder</code>), которые приложение
          выполняет.
        </p>
        <p>
          Клавиши: <kbd>←</kbd> <kbd>→</kbd> ходят по вкладкам и открывают их (концы замкнуты), <kbd>Home</kbd> <kbd>End</kbd>,
          <kbd>Delete</kbd> закрывает, <kbd>Enter</kbd> закрепляет предпросмотр, <kbd>Alt</kbd> + <kbd>←</kbd> <kbd>→</kbd>
          двигает саму вкладку, клавиша меню (или правый клик) просит собственное меню приложения. Закрывает и средняя
          кнопка. У вкладки с <code>closable: false</code> нет крестика. Что не влезло, прокручивается вбок (колесо тоже,
          активная вкладка всегда в поле зрения). Крестик нужен только указателю: с клавиатуры закрывают через <kbd>Delete</kbd>.
        </p>
      </template>
    </Tr>

    <TaoDocTabs v-model="active" :items="items" @close="close" @pin="pin" @reorder="reorder" />
    <div class="doctabs-row">
      <TaoButton variant="secondary" @click="add">{{ tr('Open a document', 'Открыть документ') }}</TaoButton>
      <span class="doctabs-note">{{ log || tr('nothing yet', 'пока ничего') }}</span>
    </div>

    <div class="code-block">
      <pre><code>&lt;script setup&gt;
const docs = ref([
  { value: 'boom', label: 'boom.fx', dirty: true },
  { value: 'smoke', label: 'smoke.fx', preview: true },   // italics, pinned by a double click
  { value: 'sheet', label: 'sheet', closable: false },
])
const active = ref('boom')
&lt;/script&gt;

&lt;TaoDocTabs
  v-model="active"
  :items="docs"
  @close="closeDocument"
  @pin="(id) =&gt; (docs.find((d) =&gt; d.value === id).preview = false)"
  @reorder="(from, to) =&gt; docs.splice(to, 0, ...docs.splice(from, 1))"
/&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.doctabs-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tao-space-3);
  margin: var(--tao-space-3) 0;
}

.doctabs-note {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}
</style>
