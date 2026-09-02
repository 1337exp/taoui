<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoInputNumber } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoInputNumber' })

const qty = ref(2)
const price = ref(1490)
</script>

<template>
  <ShowcaseSection id="input-number" :tables="propTables['input-number']">
    <h2>TaoInputNumber</h2>
          <p>Число, не текст: стрелки, кнопки ± справа, min/max/step. Пустое поле — <code>null</code>. Для корзины — <code>TaoQuantity</code>.</p>
    
          <div class="demo-stack demo-stack--narrow">
            <TaoFormField label="Количество" hint="Стрелки вверх/вниз тоже меняют шаг">
              <TaoInputNumber v-model="qty" :min="1" :max="99" />
            </TaoFormField>
            <TaoFormField label="Цена">
              <TaoInputNumber v-model="price" :min="0" :step="10" />
            </TaoFormField>
            <TaoFormField label="Без кнопок" hint="Только клавиатура и ввод">
              <TaoInputNumber v-model="price" :min="0" :step="10" :controls="false" />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="Количество"&gt;
  &lt;TaoInputNumber v-model="qty" :min="1" :max="99" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoInputNumber v-model="qty" increment-label="Increase" decrement-label="Decrease"&gt;
  &lt;template #increment-icon&gt;&lt;TaoIcon name="plus" /&gt;&lt;/template&gt;
  &lt;template #decrement-icon&gt;&lt;TaoIcon name="minus" /&gt;&lt;/template&gt;
&lt;/TaoInputNumber&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
