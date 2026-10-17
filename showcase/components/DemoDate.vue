<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoDate, TaoDateRange } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
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
          <Tr>
            <template #en>
              <p>
                A single day, not a date-time. <code>v-model</code> is always <code>YYYY-MM-DD</code>,
                with no hours and no time zone. The popup works like Select's: Esc, a click outside, arrows move by days.
              </p>
            </template>
            <template #ru>
              <p>
                Один день, не дата-время. В <code>v-model</code> всегда <code>YYYY-MM-DD</code>,
                без часов и пояса. Попап как у Select: Esc, клик снаружи, стрелки по дням.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField :label="tr('Delivery day', 'День доставки')" :hint="tr('In the model: ', 'В модели: ') + (deliveryDate || 'null')">
              <TaoDate v-model="deliveryDate" min="2026-09-01" max="2026-09-30" />
            </TaoFormField>
    
            <TaoFormField :label="tr('Empty field', 'Пустое поле')" :hint="tr('Clear is at the bottom of the calendar', 'Очистить — внизу календаря')">
              <TaoDate v-model="emptyDate" :placeholder="tr('Pick a day', 'Выберите день')" />
            </TaoFormField>
          </div>
    
          <h3>{{ tr('States', 'Состояния') }}</h3>
          <Tr>
            <template #en>
              <p class="carousel-note">
                The red border is not a broken calendar but the <code>error</code> of <code>TaoFormField</code>, as with Select.
              </p>
            </template>
            <template #ru>
              <p class="carousel-note">
                Красная рамка — не поломка календаря, а <code>error</code> у <code>TaoFormField</code>, как у Select.
              </p>
            </template>
          </Tr>
          <div class="demo-stack">
            <TaoFormField :label="tr('No day given', 'Не указали день')" :error="tr('Enter a date', 'Укажите дату')">
              <TaoDate v-model="errorDate" />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoDate model-value="2026-09-02" disabled />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="{{ tr('Delivery day', 'День доставки') }}"&gt;
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
          <Tr>
            <template #en>
              <p>
                A period, not two separate Dates. <code>v-model</code> is <code>{ start, end }</code> or
                <code>null</code>, both dates <code>YYYY-MM-DD</code>. The first click is the start, the second is the end;
                if the end is before the start, they swap. A single day works: click the same date twice.
                An incomplete choice is not written to the model — Esc or a click outside rolls the draft back.
              </p>
            </template>
            <template #ru>
              <p>
                Период, не два отдельных Date. В <code>v-model</code> — <code>{ start, end }</code> или
                <code>null</code>, обе даты <code>YYYY-MM-DD</code>. Первый клик — начало, второй — конец;
                если конец раньше начала, меняются местами. Один день можно: кликните ту же дату дважды.
                Неполный выбор в модель не пишется — Esc или клик снаружи откатывает черновик.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField :label="tr('Trip dates', 'Даты поездки')" :hint="tr('In the model: ', 'В модели: ') + rangeModelHint(stayRange)">
              <TaoDateRange v-model="stayRange" min="2026-09-01" max="2026-09-30" />
            </TaoFormField>
    
            <TaoFormField :label="tr('Empty period', 'Пустой период')" :hint="tr('Today — a single day, Clear — null', 'Сегодня — один день, Очистить — null')">
              <TaoDateRange v-model="emptyRange" :placeholder="tr('Pick a period', 'Выберите период')" />
            </TaoFormField>
          </div>
    
          <h3>{{ tr('States', 'Состояния') }}</h3>
          <div class="demo-stack">
            <TaoFormField :label="tr('No period given', 'Не указали период')" :error="tr('Enter the dates', 'Укажите даты')">
              <TaoDateRange v-model="errorRange" />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoDateRange :model-value="{ start: '2026-09-02', end: '2026-09-10' }" disabled />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFormField label="{{ tr('Trip dates', 'Даты поездки') }}"&gt;
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
