<script setup>
import { ref } from 'vue'
import { TaoPinCode } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPinCode' })

const pinValue = ref('')
const pinValueNumeric = ref('')
const pinValueReplace = ref('')
const pinCompleteNote = ref('')

function onPinComplete(value) {
  pinCompleteNote.value = 'Готово: ' + value
}
</script>

<template>
  <ShowcaseSection id="pincode" :tables="propTables['pincode']">
    <h2>TaoPinCode</h2>
          <p>
            По умолчанию клик стирает ячейку и все справа — неверный код можно набрать заново с этого места.
            <code>clear-on="input"</code> оставляет цифру, пока не введут новую.
            Последняя ячейка снимает фокус и шлёт <code>complete</code>.
          </p>
    
          <h3>Стереть при фокусе</h3>
          <TaoPinCode v-model="pinValue" :length="4" @complete="onPinComplete" />
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValue }}</p>
          <p v-if="pinCompleteNote" style="margin-top: 4px; font-size: 13px; color: var(--tao-color-success);">{{ pinCompleteNote }}</p>
    
          <h3>Только цифры</h3>
          <TaoPinCode v-model="pinValueNumeric" :length="4" numbers-only />
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValueNumeric }}</p>
    
          <h3>Стереть при вводе</h3>
          <TaoPinCode v-model="pinValueReplace" :length="4" numbers-only clear-on="input" />
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValueReplace }}</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoPinCode v-model="pin" :length="4" @complete="onDone" /&gt;

&lt;TaoPinCode v-model="pin" :length="4" numbers-only /&gt;

&lt;TaoPinCode v-model="pin" :length="4" clear-on="input" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
