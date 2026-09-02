<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoQuantity, toast } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoQuantity' })

const cartQty = ref(1)
const shelfQty = ref(1)
const stockQty = ref(3)
const quantityNote = ref('')

function onShelfDec(value) {
  if (value <= 1) {
    quantityNote.value = 'Минус на 1: родитель может убрать строку'
    toast().info().message('Убрать из корзины')
  }
}

function onStockInc(value) {
  if (value >= 5) {
    quantityNote.value = 'Сток кончился — плюс больше не двигает число'
  }
}
</script>

<template>
  <ShowcaseSection id="quantity" :tables="propTables['quantity']">
    <h2>TaoQuantity</h2>
          <p>
            Количество в магазине: кнопки по бокам, только целые штуки, не пустое поле.
            <code>allow-remove</code> — минус на минимуме остаётся живым и шлёт <code>dec</code> (убрать строку).
            Без него минус на 1 выключен. <code>force-max-limit</code> прижимает ввод к стоку.
          </p>
    
          <div class="demo-stack demo-stack--narrow">
            <TaoFormField label="В корзине" hint="Минус на 1 выключен — удаление отдельной кнопкой">
              <TaoQuantity v-model="cartQty" :max="12" :allow-remove="false" />
            </TaoFormField>
            <TaoFormField label="С витрины" hint="Минус на 1 шлёт dec — можно убрать карточку">
              <TaoQuantity v-model="shelfQty" :max="8" @dec="onShelfDec" />
            </TaoFormField>
            <TaoFormField label="Сток 5 шт." hint="Плюс стопорится на максимуме, лишнее в поле схлопывается">
              <TaoQuantity v-model="stockQty" :max="5" @inc="onStockInc" />
            </TaoFormField>
            <p v-if="quantityNote" style="margin: 0; color: var(--tao-color-text-muted); font-size: 13px;">{{ quantityNote }}</p>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoQuantity v-model="qty" :max="12" :allow-remove="false" /&gt;

&lt;TaoQuantity
  v-model="qty"
  :max="stock"
  increment-label="Increase"
  decrement-label="Decrease"
  remove-label="Remove"
  @dec="onDec"
&gt;
  &lt;template #decrement-icon&gt;&lt;TaoIcon name="minus" /&gt;&lt;/template&gt;
  &lt;template #increment-icon&gt;&lt;TaoIcon name="plus" /&gt;&lt;/template&gt;
&lt;/TaoQuantity&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
