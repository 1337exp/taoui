<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoQuantity, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoQuantity' })

const cartQty = ref(1)
const shelfQty = ref(1)
const stockQty = ref(3)
const quantityNote = ref('')

const quantityNotes = {
  dec: () => tr('Minus at 1: the parent may remove the row', 'Минус на 1: родитель может убрать строку'),
  inc: () => tr('Out of stock — plus no longer moves the number', 'Сток кончился — плюс больше не двигает число'),
}

function onShelfDec(value) {
  if (value <= 1) {
    quantityNote.value = 'dec'
    toast().info().message(tr('Remove from the cart', 'Убрать из корзины'))
  }
}

function onStockInc(value) {
  if (value >= 5) {
    quantityNote.value = 'inc'
  }
}
</script>

<template>
  <ShowcaseSection id="quantity" :tables="propTables['quantity']">
    <h2>TaoQuantity</h2>
          <Tr>
            <template #en>
              <p>
                A shop quantity: buttons on the sides, whole items only, never an empty field.
                <code>allow-remove</code> — the minus at the minimum stays alive and fires <code>dec</code> (remove the row).
                Without it the minus at 1 is disabled. <code>force-max-limit</code> clamps the input to the stock.
              </p>
            </template>
            <template #ru>
              <p>
                Количество в магазине: кнопки по бокам, только целые штуки, не пустое поле.
                <code>allow-remove</code> — минус на минимуме остаётся живым и шлёт <code>dec</code> (убрать строку).
                Без него минус на 1 выключен. <code>force-max-limit</code> прижимает ввод к стоку.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack demo-stack--narrow">
            <TaoFormField :label="tr('In the cart', 'В корзине')" :hint="tr('Minus at 1 is disabled — removal is a separate button', 'Минус на 1 выключен — удаление отдельной кнопкой')">
              <TaoQuantity v-model="cartQty" :max="12" :allow-remove="false" />
            </TaoFormField>
            <TaoFormField :label="tr('From the shelf', 'С витрины')" :hint="tr('Minus at 1 fires dec — the card can be removed', 'Минус на 1 шлёт dec — можно убрать карточку')">
              <TaoQuantity v-model="shelfQty" :max="8" @dec="onShelfDec" />
            </TaoFormField>
            <TaoFormField :label="tr('Stock: 5 pcs', 'Сток 5 шт.')" :hint="tr('Plus stops at the maximum, anything extra in the field collapses', 'Плюс стопорится на максимуме, лишнее в поле схлопывается')">
              <TaoQuantity v-model="stockQty" :max="5" @inc="onStockInc" />
            </TaoFormField>
            <p v-if="quantityNote" style="margin: 0; color: var(--tao-color-text-muted); font-size: 13px;">{{ quantityNotes[quantityNote]() }}</p>
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
