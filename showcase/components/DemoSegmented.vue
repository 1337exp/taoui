<script setup>
import { ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption, TaoFormField } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSegmented' })

const period = ref('month')
const layoutView = ref('list')
const inboxFilter = ref('all')
</script>

<template>
  <ShowcaseSection id="segmented" :tables="propTables['segmented']">
    <h2>TaoSegmented</h2>
          <p>
            Компактный выбор из 2–5 коротких вариантов: период, режим, вид списка.
            Это значение формы, не навигация — для секций страницы есть <code>TaoTabs</code>.
            Длинные подписи — <code>TaoRadioGroup</code>.
          </p>
    
          <h3>Период</h3>
          <div class="button-row">
            <TaoSegmented v-model="period" legend="Период">
              <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
              <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
              <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <h3>Размеры</h3>
          <div class="demo-stack">
            <TaoSegmented v-model="period" size="small">
              <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
              <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
              <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
            </TaoSegmented>
            <TaoSegmented v-model="period" size="medium">
              <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
              <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
              <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
            </TaoSegmented>
            <TaoSegmented v-model="period" size="large">
              <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
              <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
              <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <h3>На всю ширину, счётчик, только иконка</h3>
          <div class="demo-stack">
            <TaoSegmented v-model="inboxFilter" block>
              <TaoSegmentedOption value="all" count="12">Все</TaoSegmentedOption>
              <TaoSegmentedOption value="unread" count="3">Новые</TaoSegmentedOption>
              <TaoSegmentedOption value="done" disabled>Готово</TaoSegmentedOption>
            </TaoSegmented>
    
            <TaoSegmented v-model="layoutView" legend="Вид">
              <TaoSegmentedOption value="list" icon="☰" aria-label="Список" />
              <TaoSegmentedOption value="grid" icon="▦" aria-label="Сетка" />
            </TaoSegmented>
    
            <TaoFormField label="Сортировка" hint="Не вкладки: выбранное значение уходит в форму">
              <TaoSegmented v-model="period" block>
                <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
                <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
                <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
              </TaoSegmented>
            </TaoFormField>
    
            <TaoSegmented v-model="period" disabled>
              <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
              <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
              <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoSegmented v-model="period" legend="Период"&gt;
      &lt;TaoSegmentedOption value="week"&gt;Неделя&lt;/TaoSegmentedOption&gt;
      &lt;TaoSegmentedOption value="month"&gt;Месяц&lt;/TaoSegmentedOption&gt;
      &lt;TaoSegmentedOption value="year"&gt;Год&lt;/TaoSegmentedOption&gt;
    &lt;/TaoSegmented&gt;
    
    &lt;TaoSegmented v-model="inbox" block&gt;
      &lt;TaoSegmentedOption value="all" count="12"&gt;Все&lt;/TaoSegmentedOption&gt;
      &lt;TaoSegmentedOption value="unread" count="3"&gt;Новые&lt;/TaoSegmentedOption&gt;
    &lt;/TaoSegmented&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
