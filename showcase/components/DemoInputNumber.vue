<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoInputNumber } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoInputNumber' })

const qty = ref(2)
const price = ref(1490)
const commits = ref([])
const onCommit = (v) => commits.value.unshift(v)
</script>

<template>
  <ShowcaseSection id="input-number" :tables="propTables['input-number']">
    <h2>TaoInputNumber</h2>
          <Tr>
            <template #en><p>A number, not text: arrows, ± buttons on the right, min/max/step. An empty field is <code>null</code>. For a cart — <code>TaoQuantity</code>.</p></template>
            <template #ru><p>Число, не текст: стрелки, кнопки ± справа, min/max/step. Пустое поле — <code>null</code>. Для корзины — <code>TaoQuantity</code>.</p></template>
          </Tr>
    
          <div class="demo-stack demo-stack--narrow">
            <TaoFormField :label="tr('Quantity', 'Количество')" :hint="tr('The up/down arrows change the step too', 'Стрелки вверх/вниз тоже меняют шаг')">
              <TaoInputNumber v-model="qty" :min="1" :max="99" />
            </TaoFormField>
            <TaoFormField :label="tr('Price', 'Цена')">
              <TaoInputNumber v-model="price" :min="0" :step="10" />
            </TaoFormField>
            <TaoFormField label="@commit" :hint="tr('Fires on blur, Enter, ±, arrows. ', 'На blur, Enter, ±, стрелки. ') + tr('Last: ', 'Последние: ') + (commits.slice(0, 5).join(', ') || '—')">
              <TaoInputNumber v-model="qty" :min="1" :max="99" @commit="onCommit" />
            </TaoFormField>
            <TaoFormField :label="tr('No buttons', 'Без кнопок')" :hint="tr('Keyboard and typing only', 'Только клавиатура и ввод')">
              <TaoInputNumber v-model="price" :min="0" :step="10" :controls="false" />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="{{ tr('Quantity', 'Количество') }}"&gt;
  &lt;TaoInputNumber v-model="qty" :min="1" :max="99" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoInputNumber v-model="qty" @commit="saveStep" /&gt;

&lt;TaoInputNumber v-model="qty" increment-label="Increase" decrement-label="Decrease"&gt;
  &lt;template #increment-icon&gt;&lt;TaoIcon name="plus" /&gt;&lt;/template&gt;
  &lt;template #decrement-icon&gt;&lt;TaoIcon name="minus" /&gt;&lt;/template&gt;
&lt;/TaoInputNumber&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
