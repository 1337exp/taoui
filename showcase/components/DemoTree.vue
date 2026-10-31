<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoIcon, TaoSegmented, TaoSegmentedOption, TaoSwitch, TaoTree } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTree' })

const nodes = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'App.vue' },
      { id: 'main', label: 'main.ts' },
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.vue' },
          { id: 'card', label: 'Card.vue' },
          { id: 'tree', label: 'Tree.vue' },
        ],
      },
    ],
  },
  { id: 'packages', label: 'node_modules', hasChildren: true },
  { id: 'public', label: 'public', children: [{ id: 'favicon', label: 'favicon.svg' }] },
  { id: 'readme', label: 'README.md' },
  { id: 'lock', label: 'package-lock.json', disabled: true },
]

// node_modules opens slowly, like a real folder over the network; every id stays unique in the whole tree (the path)
const packages = ['vue', 'vite', '@1337exp/taoui']
const load = (node) =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          node.id === 'packages'
            ? packages.map((name) => ({ id: `packages/${name}`, label: name, hasChildren: true }))
            : [
                { id: `${node.id}/package.json`, label: 'package.json' },
                { id: `${node.id}/dist`, label: 'dist', hasChildren: true },
              ],
        ),
      node.id === 'packages' ? 900 : 400,
    ),
  )

const expanded = ref(['src'])
const selected = ref('app')
const checked = ref(['button'])
const checkable = ref(true)
const selection = ref('single')
const log = ref('')

const isFolder = (node) => Boolean(node.children || node.hasChildren)
const picked = computed(() => (Array.isArray(selected.value) ? selected.value.join(', ') : selected.value ?? '—'))

function setSelection(value) {
  selection.value = value
  selected.value = value === 'multiple' ? [] : null
}
</script>

<template>
  <ShowcaseSection id="tree" :tables="propTables['tree']">
    <h2>TaoTree</h2>
    <Tr>
      <template #en>
        <p>
          Files or objects as a tree: expand, select, check with tri-state parents, load children lazily (open
          <code>node_modules</code>). One tab stop: <kbd>↑</kbd> <kbd>↓</kbd> walk the rows, <kbd>→</kbd> opens or goes in,
          <kbd>←</kbd> closes or goes to the parent, <kbd>*</kbd> opens the siblings, letters jump, <kbd>Space</kbd> checks.
          The rows use the control tokens, so the size and the density reach the tree.
        </p>
      </template>
      <template #ru>
        <p>
          Файлы или объекты деревом: раскрытие, выбор, чекбоксы с промежуточным состоянием родителя, ленивая подгрузка
          (откройте <code>node_modules</code>). Одна остановка Tab: <kbd>↑</kbd> <kbd>↓</kbd> по строкам, <kbd>→</kbd>
          раскрывает или входит, <kbd>←</kbd> сворачивает или идёт к родителю, <kbd>*</kbd> раскрывает соседей, буквы
          прыгают по подписям, <kbd>Space</kbd> отмечает. Строки на токенах контролов: размер и плотность доходят до дерева.
        </p>
      </template>
    </Tr>

    <div class="tree-demo__controls">
      <TaoSegmented :model-value="selection" size="small" @update:model-value="setSelection">
        <TaoSegmentedOption value="none" label="none" />
        <TaoSegmentedOption value="single" label="single" />
        <TaoSegmentedOption value="multiple" label="multiple" />
      </TaoSegmented>
      <TaoSwitch v-model="checkable" :label="tr('Checkboxes', 'Чекбоксы')" />
    </div>

    <div class="tree-demo">
      <TaoTree
        v-model:expanded="expanded"
        v-model:selected="selected"
        v-model:checked="checked"
        :nodes="nodes"
        :selection="selection"
        :checkable="checkable"
        :load="load"
        :aria-label="tr('Project files', 'Файлы проекта')"
      >
        <template #icon="{ node, expanded: open }">
          <TaoIcon :name="isFolder(node) ? 'tao-folder' : 'tao-file'" :class="{ 'tree-demo__open': open }" />
        </template>
        <template #actions="{ node }">
          <TaoButton size="small" variant="ghost" icon="tao-copy" :aria-label="tr('Copy the name', 'Скопировать имя')" @click="log = node.label" />
        </template>
      </TaoTree>
      <div class="tree-demo__state">
        <div><b>{{ tr('Selected', 'Выбрано') }}:</b> {{ picked }}</div>
        <div><b>{{ tr('Checked', 'Отмечено') }}:</b> {{ checked.join(', ') || '—' }}</div>
        <div><b>{{ tr('Expanded', 'Раскрыто') }}:</b> {{ expanded.join(', ') || '—' }}</div>
        <div v-if="log"><b>{{ tr('Action', 'Действие') }}:</b> {{ log }}</div>
      </div>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoTree
  v-model:expanded="expanded"
  v-model:selected="selected"
  v-model:checked="checked"
  :nodes="nodes"
  checkable
  :load="(node) =&gt; api.children(node.id)"
&gt;
  &lt;template #icon="{ node }"&gt;
    &lt;TaoIcon :name="node.children || node.hasChildren ? 'tao-folder' : 'tao-file'" /&gt;
  &lt;/template&gt;
&lt;/TaoTree&gt;

const nodes = [
  { id: 'src', label: 'src', children: [{ id: 'app', label: 'App.vue' }] },
  { id: 'deps', label: 'node_modules', hasChildren: true },   // loaded on open
]</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.tree-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tree-demo {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.tree-demo > :first-child {
  padding: 4px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}

.tree-demo__state {
  display: grid;
  align-content: start;
  gap: 6px;
  font-size: 13px;
  color: var(--tao-color-text-muted);
}

.tree-demo__open {
  color: var(--tao-color-accent-text);
}

@media (max-width: 600px) {
  .tree-demo {
    grid-template-columns: 1fr;
  }
}
</style>
