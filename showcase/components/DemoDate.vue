<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoDate, TaoDateRange } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDate' })

const deliveryDate = ref('2026-09-02')
const emptyDate = ref(null)
const errorDate = ref(null)
const stayRange = ref({ start: '2026-09-02', end: '2026-09-10' })
const emptyRange = ref(null)
const errorRange = ref(null)

function rangeModelHint(value) {
  return value ? `${value.start} … ${value.end}` : 'null'
}
</script>

<template>
  <ShowcaseSection id="date" :tables="propTables['date']">
    <h2>TaoDate</h2>
          <p>
            Один день, не дата-время. В <code>v-model</code> всегда <code>YYYY-MM-DD</code>,
            без часов и пояса. Попап как у Select: Esc, клик снаружи, стрелки по дням.
          </p>
    
          <div class="demo-stack">
            <TaoFormField label="День доставки" :hint="'В модели: ' + (deliveryDate || 'null')">
              <TaoDate v-model="deliveryDate" min="2026-09-01" max="2026-09-30" />
            </TaoFormField>
    
            <TaoFormField label="Пустое поле" hint="Очистить — внизу календаря">
              <TaoDate v-model="emptyDate" placeholder="Выберите день" />
            </TaoFormField>
          </div>
    
          <h3>Состояния</h3>
          <p class="carousel-note">
            Красная рамка — не поломка календаря, а <code>error</code> у <code>TaoFormField</code>, как у Select.
          </p>
          <div class="demo-stack">
            <TaoFormField label="Не указали день" error="Укажите дату">
              <TaoDate v-model="errorDate" />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoDate model-value="2026-09-02" disabled />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="День доставки"&gt;
  &lt;TaoDate v-model="day" min="2026-09-01" max="2026-09-30" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoDate
  v-model="day"
  locale="en-US"
  placeholder="Date"
  today-text="Today"
  clear-text="Clear"
&gt;
  &lt;template #icon&gt;&lt;TaoIcon name="calendar" /&gt;&lt;/template&gt;
  &lt;template #prev-icon&gt;&lt;TaoIcon name="arrow-left" /&gt;&lt;/template&gt;
  &lt;template #next-icon&gt;&lt;TaoIcon name="arrow-right" /&gt;&lt;/template&gt;
&lt;/TaoDate&gt;</code></pre>
          </div>
    
          <h2>TaoDateRange</h2>
          <p>
            Период, не два отдельных Date. В <code>v-model</code> — <code>{ start, end }</code> или
            <code>null</code>, обе даты <code>YYYY-MM-DD</code>. Первый клик — начало, второй — конец;
            если конец раньше начала, меняются местами. Один день можно: кликните ту же дату дважды.
            Неполный выбор в модель не пишется — Esc или клик снаружи откатывает черновик.
          </p>
    
          <div class="demo-stack">
            <TaoFormField label="Даты поездки" :hint="'В модели: ' + rangeModelHint(stayRange)">
              <TaoDateRange v-model="stayRange" min="2026-09-01" max="2026-09-30" />
            </TaoFormField>
    
            <TaoFormField label="Пустой период" hint="Сегодня — один день, Очистить — null">
              <TaoDateRange v-model="emptyRange" placeholder="Выберите период" />
            </TaoFormField>
          </div>
    
          <h3>Состояния</h3>
          <div class="demo-stack">
            <TaoFormField label="Не указали период" error="Укажите даты">
              <TaoDateRange v-model="errorRange" />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoDateRange :model-value="{ start: '2026-09-02', end: '2026-09-10' }" disabled />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="Даты поездки"&gt;
  &lt;TaoDateRange v-model="stay" min="2026-09-01" max="2026-09-30" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoDateRange
  v-model="stay"
  locale="en-US"
  placeholder="Range"
  today-text="Today"
  clear-text="Clear"
&gt;
  &lt;template #icon&gt;&lt;TaoIcon name="calendar" /&gt;&lt;/template&gt;
  &lt;template #prev-icon&gt;&lt;TaoIcon name="arrow-left" /&gt;&lt;/template&gt;
  &lt;template #next-icon&gt;&lt;TaoIcon name="arrow-right" /&gt;&lt;/template&gt;
&lt;/TaoDateRange&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
