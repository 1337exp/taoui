<script setup>
import { computed, ref } from 'vue'
import { TaoCheckbox, TaoFormField } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCheckbox' })

const checkedA = ref(false)
const checkedB = ref(true)
const fruitChecks = ref([
  { id: 'apples', checked: true },
  { id: 'pears', checked: false },
  { id: 'plums', checked: true },
])
const fruitLabels = computed(() => ({
  apples: tr('Apples', 'Яблоки'),
  pears: tr('Pears', 'Груши'),
  plums: tr('Plums', 'Сливы'),
}))
const allFruitsChecked = computed({
  get: () => fruitChecks.value.every((item) => item.checked),
  set: (next) => {
    fruitChecks.value.forEach((item) => {
      item.checked = next
    })
  },
})
const fruitsMixed = computed(
  () => fruitChecks.value.some((item) => item.checked) && !allFruitsChecked.value,
)
</script>

<template>
  <ShowcaseSection id="checkbox" :tables="propTables['checkbox']">
    <h2>TaoCheckbox</h2>
          <Tr>
            <template #en><p>A checkbox with v-model. Hint and error go through TaoFormField. <code>indeterminate</code> — partially selected: a dash, a click sets the tick, the parent works out the mixed state.</p></template>
            <template #ru><p>Чекбокс с v-model. Hint и error — через TaoFormField. <code>indeterminate</code> — частично выбран: черта, клик ставит галочку, смешанное считает родитель.</p></template>
          </Tr>
    
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
            <div style="display: flex; gap: 20px;">
              <TaoCheckbox v-model="checkedA" :label="tr('Unchecked', 'Не отмечен')" />
              <TaoCheckbox v-model="checkedB" :label="tr('Checked', 'Отмечен')" />
              <TaoCheckbox :model-value="false" label="Disabled" disabled />
            </div>
            <TaoFormField :error="tr('Consent is required', 'Нужно согласие')">
              <TaoCheckbox v-model="checkedA" :label="tr('I accept the terms', 'Принимаю условия')" />
            </TaoFormField>
    
            <h3>{{ tr('Indeterminate', 'Неопределённый') }}</h3>
            <TaoCheckbox v-model="allFruitsChecked" :indeterminate="fruitsMixed" :label="tr('All fruits', 'Все фрукты')" />
            <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 24px;">
              <TaoCheckbox
                v-for="item in fruitChecks"
                :key="item.id"
                v-model="item.checked"
                :label="fruitLabels[item.id]"
              />
            </div>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCheckbox v-model="checked" label="{{ tr('I agree to the terms', 'Согласен с условиями') }}" /&gt;
&lt;TaoCheckbox v-model="all" :indeterminate="some" label="{{ tr('All', 'Все') }}" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
