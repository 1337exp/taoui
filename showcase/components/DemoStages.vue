<script setup>
import { computed } from 'vue'
import { TaoStages } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoStages' })

const orderStages = computed(() => [
  { key: 'pay', label: tr('Payment', 'Оплата'), status: 'ok' },
  { key: 'pack', label: tr('Packing', 'Сборка'), status: 'work' },
  { key: 'ship', label: tr('Delivery', 'Доставка'), status: 'wait' },
  { key: 'done', label: tr('Received', 'Получено'), status: 'wait' },
])
const importStages = computed(() => [
  { key: 'file', label: tr('File', 'Файл'), status: 'ok' },
  { key: 'parse', label: tr('Parsing', 'Разбор'), status: 'ok' },
  { key: 'match', label: tr('Matching', 'Сопоставление'), status: 'bad' },
  { key: 'save', label: tr('Saving', 'Запись'), status: 'wait' },
])
</script>

<template>
  <ShowcaseSection id="stages" :tables="propTables['stages']">
    <h2>TaoStages</h2>
          <Tr>
            <template #en>
              <p>
                A list of independent stages, not a “you are on step 3” stepper.
                Statuses: <code>ok</code>, <code>work</code>, <code>wait</code>, <code>bad</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Список независимых стадий, не степпер «ты на шаге 3».
                Статусы: <code>ok</code>, <code>work</code>, <code>wait</code>, <code>bad</code>.
              </p>
            </template>
          </Tr>
    
          <div style="display: flex; flex-wrap: wrap; gap: 40px;">
            <div>
              <h3>{{ tr('Order', 'Заказ') }}</h3>
              <TaoStages :items="orderStages" />
            </div>
            <div>
              <h3>{{ tr('Import', 'Импорт') }}</h3>
              <TaoStages :items="importStages" />
            </div>
          </div>
    
          <h3>{{ tr('In a row', 'В строку') }}</h3>
          <TaoStages :items="orderStages" direction="row" />
    
          <div class="code-block">
            <pre><code>&lt;TaoStages :items="[
  { key: 'pay', label: '{{ tr('Payment', 'Оплата') }}', status: 'ok' },
  { key: 'pack', label: '{{ tr('Packing', 'Сборка') }}', status: 'work' },
  { key: 'ship', label: '{{ tr('Delivery', 'Доставка') }}', status: 'wait' },
]" /&gt;

&lt;TaoStages
  :items="items"
  :status-labels="{ wait: 'pending', work: 'in progress', ok: 'done', bad: 'failed' }"
/&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
