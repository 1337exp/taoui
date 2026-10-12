<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoSelect, TaoSwitch, TaoRadioGroup, TaoRadio } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSelect' })

const city = ref('')
const cityError = ref('')
const cities = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'nsk', label: 'Новосибирск' },
]
const step = ref(4)
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
          <p>Форменные контролы. Label, hint и error — через TaoFormField. Select сбрасывается в <code>null</code> кнопкой «Очистить» или Delete.</p>
    
          <div class="demo-stack">
            <TaoFormField label="Город" hint="Казань пока недоступна">
              <TaoSelect v-model="city" :options="cities" placeholder="Выберите город" />
            </TaoFormField>
    
            <TaoFormField label="Sizes / Размеры (small, medium, large)">
              <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
                <TaoSelect v-model="sizeSmall" :options="cities" size="small" />
                <TaoSelect v-model="sizeMedium" :options="cities" />
                <TaoSelect v-model="sizeLarge" :options="cities" size="large" />
              </div>
            </TaoFormField>

            <TaoFormField label="Not clearable / Без сброса" hint="clearable=false: no clear row, Delete does nothing / нет строки сброса, Delete не работает">
              <TaoSelect v-model="step" :options="steps" size="small" :clearable="false" />
            </TaoFormField>

            <TaoFormField label="Custom clear row / Своя строка сброса" hint="#clear slot">
              <TaoSelect v-model="customClear" :options="cities">
                <template #clear>✕ Reset / Сбросить</template>
              </TaoSelect>
            </TaoFormField>

            <TaoFormField label="С ошибкой" error="Выберите город">
              <TaoSelect v-model="cityError" :options="cities" />
            </TaoFormField>
    
            <TaoFormField
              label="Уведомления"
              hint="Письма на почту"
              :error="notifyEmail ? undefined : 'Включите, чтобы не пропустить обновления'"
            >
              <TaoSwitch v-model="notifyEmail" />
            </TaoFormField>
            <TaoSwitch :model-value="true" label="Disabled" disabled />
    
            <TaoFormField label="Тариф" hint="Team пока недоступен">
              <TaoRadioGroup v-model="plan">
                <TaoRadio value="free" label="Free" />
                <TaoRadio value="pro" label="Pro" />
                <TaoRadio value="team" label="Team" disabled />
              </TaoRadioGroup>
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="Город" hint="Необязательно"&gt;
  &lt;TaoSelect v-model="city" :options="cities" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoSelect v-model="city" :options="cities" placeholder="Select a city" clear-text="Clear"&gt;
  &lt;template #chevron&gt;&lt;TaoIcon name="chevron-down" /&gt;&lt;/template&gt;
&lt;/TaoSelect&gt;

&lt;TaoSelect v-model="step" :options="steps" size="small" :clearable="false" /&gt;

&lt;TaoSelect v-model="city" :options="cities"&gt;
  &lt;template #clear&gt;✕ Reset&lt;/template&gt;
&lt;/TaoSelect&gt;

&lt;TaoFormField label="Уведомления" hint="Письма на почту"&gt;
  &lt;TaoSwitch v-model="on" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoFormField label="Тариф"&gt;
  &lt;TaoRadioGroup v-model="plan"&gt;
    &lt;TaoRadio value="free" label="Free" /&gt;
    &lt;TaoRadio value="pro" label="Pro" /&gt;
  &lt;/TaoRadioGroup&gt;
&lt;/TaoFormField&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
