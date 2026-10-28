<script setup>
import { computed, ref } from 'vue'
import { TaoFormField, TaoSelect, TaoSwitch, TaoRadioGroup, TaoRadio } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSelect' })

const city = ref('')
const cityError = ref('')
const cities = computed(() => [
  { value: 'msk', label: tr('Moscow', 'Москва') },
  { value: 'spb', label: tr('Saint Petersburg', 'Санкт-Петербург') },
  { value: 'kzn', label: tr('Kazan', 'Казань'), disabled: true },
  { value: 'nsk', label: tr('Novosibirsk', 'Новосибирск') },
])
const step = ref(4)

// a switch that saves on the server: loading while the request is on its way
const sync = ref(false)
const syncing = ref(false)
function toggleSync(value) {
  syncing.value = true
  setTimeout(() => {
    sync.value = value
    syncing.value = false
  }, 1200)
}
const steps = [1, 2, 3, 4, 6, 8, 12, 16].map((n) => ({ value: n, label: `1/${n}` }))
const sizeSmall = ref('msk')
const sizeMedium = ref('msk')
const sizeLarge = ref('msk')
const customClear = ref('spb')
const notifyEmail = ref(true)
const plan = ref('pro')
</script>

<template>
  <ShowcaseSection id="select" :tables="propTables['select']">
    <h2>TaoSwitch / TaoRadio / TaoSelect</h2>
          <Tr>
            <template #en><p>Form controls. Label, hint and error go through TaoFormField. Select resets to <code>null</code> with the “Clear” button or Delete.</p></template>
            <template #ru><p>Форменные контролы. Label, hint и error — через TaoFormField. Select сбрасывается в <code>null</code> кнопкой «Очистить» или Delete.</p></template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField :label="tr('City', 'Город')" :hint="tr('Kazan is not available yet', 'Казань пока недоступна')">
              <TaoSelect v-model="city" :options="cities" :placeholder="tr('Choose a city', 'Выберите город')" />
            </TaoFormField>
    
            <TaoFormField :label="tr('Sizes (small, medium, large)', 'Размеры (small, medium, large)')">
              <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
                <TaoSelect v-model="sizeSmall" :options="cities" size="small" />
                <TaoSelect v-model="sizeMedium" :options="cities" />
                <TaoSelect v-model="sizeLarge" :options="cities" size="large" />
              </div>
            </TaoFormField>

            <TaoFormField :label="tr('Not clearable', 'Без сброса')" :hint="tr('clearable=false: no clear row, Delete does nothing', 'clearable=false: нет строки сброса, Delete не работает')">
              <TaoSelect v-model="step" :options="steps" size="small" :clearable="false" />
            </TaoFormField>

            <TaoFormField :label="tr('Custom clear row', 'Своя строка сброса')" hint="#clear slot">
              <TaoSelect v-model="customClear" :options="cities">
                <template #clear>✕ {{ tr('Reset', 'Сбросить') }}</template>
              </TaoSelect>
            </TaoFormField>

            <TaoFormField :label="tr('With an error', 'С ошибкой')" :error="tr('Choose a city', 'Выберите город')">
              <TaoSelect v-model="cityError" :options="cities" />
            </TaoFormField>
    
            <TaoFormField
              :label="tr('Notifications', 'Уведомления')"
              :hint="tr('Emails', 'Письма на почту')"
              :error="notifyEmail ? undefined : tr('Turn on so you do not miss updates', 'Включите, чтобы не пропустить обновления')"
            >
              <TaoSwitch v-model="notifyEmail" />
            </TaoFormField>
            <TaoSwitch :model-value="true" label="Disabled" disabled />
            <TaoSwitch
              :model-value="sync"
              :loading="syncing"
              :label="syncing ? tr('Saving…', 'Сохраняем…') : tr('Cloud sync (saves for 1.2 s)', 'Синхронизация (сохраняется 1,2 с)')"
              @update:model-value="toggleSync"
            />
    
            <TaoFormField :label="tr('Plan', 'Тариф')" :hint="tr('Team is not available yet', 'Team пока недоступен')">
              <TaoRadioGroup v-model="plan">
                <TaoRadio value="free" label="Free" />
                <TaoRadio value="pro" label="Pro" />
                <TaoRadio value="team" label="Team" disabled />
              </TaoRadioGroup>
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="{{ tr('City', 'Город') }}" hint="{{ tr('Optional', 'Необязательно') }}"&gt;
  &lt;TaoSelect v-model="city" :options="cities" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoSelect v-model="city" :options="cities" placeholder="Select a city" clear-text="Clear"&gt;
  &lt;template #chevron&gt;&lt;TaoIcon name="chevron-down" /&gt;&lt;/template&gt;
&lt;/TaoSelect&gt;

&lt;TaoSelect v-model="step" :options="steps" size="small" :clearable="false" /&gt;

&lt;TaoSelect v-model="city" :options="cities"&gt;
  &lt;template #clear&gt;✕ {{ tr('Reset', 'Сбросить') }}&lt;/template&gt;
&lt;/TaoSelect&gt;

&lt;TaoFormField label="{{ tr('Notifications', 'Уведомления') }}" hint="{{ tr('Emails', 'Письма на почту') }}"&gt;
  &lt;TaoSwitch v-model="on" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoFormField label="{{ tr('Plan', 'Тариф') }}"&gt;
  &lt;TaoRadioGroup v-model="plan"&gt;
    &lt;TaoRadio value="free" label="Free" /&gt;
    &lt;TaoRadio value="pro" label="Pro" /&gt;
  &lt;/TaoRadioGroup&gt;
&lt;/TaoFormField&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
