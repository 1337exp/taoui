<script setup>
import { computed, ref } from 'vue'
import { TaoCheckbox, TaoFormField } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCheckbox' })

const checkedA = ref(false)
const checkedB = ref(true)
const fruitChecks = ref([
  { label: 'Яблоки', checked: true },
  { label: 'Груши', checked: false },
  { label: 'Сливы', checked: true },
])
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
          <p>Чекбокс с v-model. Hint и error — через TaoFormField. <code>indeterminate</code> — частично выбран: черта, клик ставит галочку, смешанное считает родитель.</p>
    
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
            <div style="display: flex; gap: 20px;">
              <TaoCheckbox v-model="checkedA" label="Не отмечен" />
              <TaoCheckbox v-model="checkedB" label="Отмечен" />
              <TaoCheckbox :model-value="false" label="Disabled" disabled />
            </div>
            <TaoFormField error="Нужно согласие">
              <TaoCheckbox v-model="checkedA" label="Принимаю условия" />
            </TaoFormField>
    
            <h3>Неопределённый</h3>
            <TaoCheckbox v-model="allFruitsChecked" :indeterminate="fruitsMixed" label="Все фрукты" />
            <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 24px;">
              <TaoCheckbox
                v-for="item in fruitChecks"
                :key="item.label"
                v-model="item.checked"
                :label="item.label"
              />
            </div>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCheckbox v-model="checked" label="Согласен с условиями" /&gt;
&lt;TaoCheckbox v-model="all" :indeterminate="some" label="Все" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
