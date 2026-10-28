<script setup>
import { ref } from 'vue'
import { TaoPinCode } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPinCode' })

const pinValue = ref('')
const pinValueNumeric = ref('')
const pinValueReplace = ref('')
const pinFormatted = ref('')
const pinPhone = ref('')
const pinCompleteNote = ref('')

// the check is the app's: here 1234 is right, anything else is wrong; editing the code clears the status
const pinChecked = ref('')
const pinStatus = ref('idle')
function checkPin(value) {
  pinStatus.value = value === '1234' ? 'success' : 'error'
}
function editPin(value) {
  pinChecked.value = value
  pinStatus.value = 'idle'
}

function onPinComplete(value) {
  pinCompleteNote.value = tr('Done: ', 'Готово: ') + value
}
</script>

<template>
  <ShowcaseSection id="pincode" :tables="propTables['pincode']">
    <h2>TaoPinCode</h2>
          <Tr>
            <template #en>
              <p>
                By default a click clears the cell and all those to the right — a wrong code can be retyped from that spot.
                <code>clear-on="input"</code> keeps the digit until a new one is typed.
                The last cell drops the focus and fires <code>complete</code>.
              </p>
            </template>
            <template #ru>
              <p>
                По умолчанию клик стирает ячейку и все справа — неверный код можно набрать заново с этого места.
                <code>clear-on="input"</code> оставляет цифру, пока не введут новую.
                Последняя ячейка снимает фокус и шлёт <code>complete</code>.
              </p>
            </template>
          </Tr>
    
          <h3>{{ tr('Status: the check result', 'Статус: результат проверки') }}</h3>
          <p style="margin: 0 0 8px; font-size: 13px; color: var(--tao-color-text-muted);">
            {{ tr('Type 1234 — success, anything else — error. The app checks on complete and sets status; editing returns idle.', 'Наберите 1234 — успех, другое — ошибка. Приложение проверяет по complete и ставит status; правка возвращает idle.') }}
          </p>
          <TaoPinCode :model-value="pinChecked" :length="4" numbers-only :status="pinStatus" @update:model-value="editPin" @complete="checkPin" />

          <h3>{{ tr('Clear on focus', 'Стереть при фокусе') }}</h3>
          <TaoPinCode v-model="pinValue" :length="4" @complete="onPinComplete" />
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ pinValue }}</p>
          <p v-if="pinCompleteNote" style="margin-top: 4px; font-size: 13px; color: var(--tao-color-success);">{{ pinCompleteNote }}</p>
    
          <h3>{{ tr('Digits only', 'Только цифры') }}</h3>
          <TaoPinCode v-model="pinValueNumeric" :length="4" numbers-only />
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ pinValueNumeric }}</p>
    
          <h3>{{ tr('Clear on input', 'Стереть при вводе') }}</h3>
          <TaoPinCode v-model="pinValueReplace" :length="4" numbers-only clear-on="input" />
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ pinValueReplace }}</p>
    
          <h3>{{ tr('Format with separators', 'Формат с разделителями') }}</h3>
          <Tr>
            <template #en>
              <p>
                <code>format="#-##-##"</code>: <code>#</code> is a cell, everything else is a separator. Separators are only drawn, they do not get into the value.
                Pasting “0-12-34” is spread over the cells; if the format does not match but the length equals the code (“01234”), it is pasted as is.
                With <code>numbers-only</code> a typed separator moves on to the next group.
              </p>
            </template>
            <template #ru>
              <p>
                <code>format="#-##-##"</code>: <code>#</code> это ячейка, остальное разделитель. Разделители только рисуются, в значение они не попадают.
                Вставка «0-12-34» раскладывается по ячейкам; если формат не совпал, но длина равна коду («01234»), он вставляется как есть.
                С <code>numbers-only</code> набранный разделитель переходит в следующую группу.
              </p>
            </template>
          </Tr>
          <TaoPinCode v-model="pinFormatted" format="#-##-##" numbers-only />
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ pinFormatted }}</p>
          <TaoPinCode v-model="pinPhone" format="(###) ###" numbers-only size="small" style="margin-top: 8px;" />
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ pinPhone }}</p>

          <div class="code-block">
            <pre><code>&lt;TaoPinCode v-model="pin" :length="4" @complete="onDone" /&gt;

&lt;TaoPinCode v-model="pin" :length="4" numbers-only /&gt;

&lt;TaoPinCode v-model="pin" :length="4" clear-on="input" /&gt;

&lt;TaoPinCode v-model="pin" format="#-##-##" numbers-only /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
