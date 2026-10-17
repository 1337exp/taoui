<script setup>
import { ref } from 'vue'
import { TaoPinCode } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPinCode' })

const pinValue = ref('')
const pinValueNumeric = ref('')
const pinValueReplace = ref('')
const pinFormatted = ref('')
const pinPhone = ref('')
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
    
          <h3>Формат с разделителями</h3>
          <p>
            <code>format="#-##-##"</code>: <code>#</code> это ячейка, остальное разделитель. Разделители только рисуются, в значение они не попадают.
            Вставка «0-12-34» раскладывается по ячейкам; если формат не совпал, но длина равна коду («01234»), он вставляется как есть.
            С <code>numbers-only</code> набранный разделитель переходит в следующую группу.
          </p>
          <TaoPinCode v-model="pinFormatted" format="#-##-##" numbers-only />
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinFormatted }}</p>
          <TaoPinCode v-model="pinPhone" format="(###) ###" numbers-only size="small" style="margin-top: 8px;" />
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinPhone }}</p>

          <div class="code-block">
            <pre><code>&lt;TaoPinCode v-model="pin" :length="4" @complete="onDone" /&gt;

&lt;TaoPinCode v-model="pin" :length="4" numbers-only /&gt;

&lt;TaoPinCode v-model="pin" :length="4" clear-on="input" /&gt;

&lt;TaoPinCode v-model="pin" format="#-##-##" numbers-only /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
