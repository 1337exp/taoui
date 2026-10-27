<script setup>
import { computed, ref } from 'vue'
import { TaoChecklist, TaoFormField } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoChecklist' })

const todo = computed(() => [
  { value: 'tokens', label: tr('Token layers', 'Слои токенов') },
  { value: 'menus', label: tr('Menus on one engine', 'Меню на одном движке'), description: tr('Menubar, context menu, dropdown', 'Полоса, контекстное, выпадающее') },
  { value: 'tree', label: tr('A tree in the garden', 'Деревце в саду') },
  { value: 'publish', label: tr('Publish 5.0.0', 'Опубликовать 5.0.0') },
])
const done = ref(['tokens', 'menus', 'tree'])

const groceries = computed(() => [
  { value: 'milk', label: tr('Milk', 'Молоко') },
  { value: 'bread', label: tr('Bread', 'Хлеб') },
  { value: 'tea', label: tr('Green tea', 'Зелёный чай') },
  { value: 'salt', label: tr('Salt (we have it)', 'Соль (есть дома)'), disabled: true },
])
const bought = ref(['tea'])
const groceryError = computed(() => (bought.value.length ? '' : tr('Pick at least one', 'Выберите хотя бы одно')))
</script>

<template>
  <ShowcaseSection id="checklist" :tables="propTables['checklist']">
    <h2>TaoChecklist</h2>
    <Tr>
      <template #en>
        <p>
          A list of checkboxes with one model, the checked values. <code>strike</code> crosses the done items out (a look
          only: the checkbox still says checked), <code>select-all</code> adds a mixed «Select all», <code>counter</code>
          shows «3 of 5». In a <code>TaoFormField</code> the group takes the label and the error.
        </p>
      </template>
      <template #ru>
        <p>
          Список чекбоксов с одной моделью — отмеченными значениями. <code>strike</code> зачёркивает выполненное (только
          вид: состояние говорит чекбокс), <code>select-all</code> добавляет «Выбрать всё» с промежуточным состоянием,
          <code>counter</code> показывает «3 из 5». В <code>TaoFormField</code> группа берёт подпись и ошибку.
        </p>
      </template>
    </Tr>

    <div class="checklist-demo">
      <TaoChecklist v-model="done" :items="todo" :legend="tr('Before the release', 'До релиза')" strike counter />
      <TaoFormField :label="tr('Groceries', 'Покупки')" :error="groceryError">
        <TaoChecklist v-model="bought" :items="groceries" select-all counter />
      </TaoFormField>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoChecklist v-model="done" :items="todo" legend="Before the release" strike counter /&gt;

&lt;TaoFormField label="Groceries" :error="done.length ? '' : 'Pick at least one'"&gt;
  &lt;TaoChecklist v-model="bought" :items="groceries" select-all counter /&gt;
&lt;/TaoFormField&gt;

const todo = [
  { value: 'tokens', label: 'Token layers' },
  { value: 'menus', label: 'Menus', description: 'Menubar, context menu, dropdown' },
  { value: 'salt', label: 'Salt', disabled: true },
]</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.checklist-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 16px;
}
</style>
