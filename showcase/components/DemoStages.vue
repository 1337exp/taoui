<script setup>
import { TaoStages } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoStages' })

const orderStages = [
  { key: 'pay', label: 'Оплата', status: 'ok' },
  { key: 'pack', label: 'Сборка', status: 'work' },
  { key: 'ship', label: 'Доставка', status: 'wait' },
  { key: 'done', label: 'Получено', status: 'wait' },
]
const importStages = [
  { key: 'file', label: 'Файл', status: 'ok' },
  { key: 'parse', label: 'Разбор', status: 'ok' },
  { key: 'match', label: 'Сопоставление', status: 'bad' },
  { key: 'save', label: 'Запись', status: 'wait' },
]
</script>

<template>
  <ShowcaseSection id="stages" :tables="propTables['stages']">
    <h2>TaoStages</h2>
          <p>
            Список независимых стадий, не степпер «ты на шаге 3».
            Статусы: <code>ok</code>, <code>work</code>, <code>wait</code>, <code>bad</code>.
          </p>
    
          <div style="display: flex; flex-wrap: wrap; gap: 40px;">
            <div>
              <h3>Заказ</h3>
              <TaoStages :items="orderStages" />
            </div>
            <div>
              <h3>Импорт</h3>
              <TaoStages :items="importStages" />
            </div>
          </div>
    
          <h3>В строку</h3>
          <TaoStages :items="orderStages" :vertical="false" />
    
          <div class="code-block">
            <pre><code>&lt;TaoStages :items="[
  { key: 'pay', label: 'Оплата', status: 'ok' },
  { key: 'pack', label: 'Сборка', status: 'work' },
  { key: 'ship', label: 'Доставка', status: 'wait' },
]" /&gt;

&lt;TaoStages
  :items="items"
  :status-labels="{ wait: 'pending', work: 'in progress', ok: 'done', bad: 'failed' }"
/&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
