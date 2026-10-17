<script setup>
import { ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption, TaoFormField } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSegmented' })

const period = ref('month')
const layoutView = ref('list')
const inboxFilter = ref('all')
</script>

<template>
  <ShowcaseSection id="segmented" :tables="propTables['segmented']">
    <h2>TaoSegmented</h2>
          <Tr>
            <template #en>
              <p>
                A compact choice of 2–5 short options: a period, a mode, a list view.
                This is a form value, not navigation — for page sections there is <code>TaoTabs</code>.
                Long captions — <code>TaoRadioGroup</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Компактный выбор из 2–5 коротких вариантов: период, режим, вид списка.
                Это значение формы, не навигация — для секций страницы есть <code>TaoTabs</code>.
                Длинные подписи — <code>TaoRadioGroup</code>.
              </p>
            </template>
          </Tr>
    
          <h3>{{ tr('Period', 'Период') }}</h3>
          <div class="button-row">
            <TaoSegmented v-model="period" :legend="tr('Period', 'Период')">
              <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <h3>{{ tr('Sizes', 'Размеры') }}</h3>
          <div class="demo-stack">
            <TaoSegmented v-model="period" size="small">
              <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
            </TaoSegmented>
            <TaoSegmented v-model="period" size="medium">
              <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
            </TaoSegmented>
            <TaoSegmented v-model="period" size="large">
              <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <h3>{{ tr('Full width, a counter, icon only', 'На всю ширину, счётчик, только иконка') }}</h3>
          <div class="demo-stack">
            <TaoSegmented v-model="inboxFilter" block>
              <TaoSegmentedOption value="all" count="12">{{ tr('All', 'Все') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="unread" count="3">{{ tr('New', 'Новые') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="done" disabled>{{ tr('Done', 'Готово') }}</TaoSegmentedOption>
            </TaoSegmented>
    
            <TaoSegmented v-model="layoutView" :legend="tr('View', 'Вид')">
              <TaoSegmentedOption value="list" icon="☰" :aria-label="tr('List', 'Список')" />
              <TaoSegmentedOption value="grid" icon="▦" :aria-label="tr('Grid', 'Сетка')" />
            </TaoSegmented>
    
            <TaoFormField :label="tr('Sorting', 'Сортировка')" :hint="tr('Not tabs: the chosen value goes to the form', 'Не вкладки: выбранное значение уходит в форму')">
              <TaoSegmented v-model="period" block>
                <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
                <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
                <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
              </TaoSegmented>
            </TaoFormField>
    
            <TaoSegmented v-model="period" disabled>
              <TaoSegmentedOption value="week">{{ tr('Week', 'Неделя') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="month">{{ tr('Month', 'Месяц') }}</TaoSegmentedOption>
              <TaoSegmentedOption value="year">{{ tr('Year', 'Год') }}</TaoSegmentedOption>
            </TaoSegmented>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoSegmented v-model="period" legend="{{ tr('Period', 'Период') }}"&gt;
  &lt;TaoSegmentedOption value="week"&gt;{{ tr('Week', 'Неделя') }}&lt;/TaoSegmentedOption&gt;
  &lt;TaoSegmentedOption value="month"&gt;{{ tr('Month', 'Месяц') }}&lt;/TaoSegmentedOption&gt;
  &lt;TaoSegmentedOption value="year"&gt;{{ tr('Year', 'Год') }}&lt;/TaoSegmentedOption&gt;
&lt;/TaoSegmented&gt;

&lt;TaoSegmented v-model="inbox" block&gt;
  &lt;TaoSegmentedOption value="all" count="12"&gt;{{ tr('All', 'Все') }}&lt;/TaoSegmentedOption&gt;
  &lt;TaoSegmentedOption value="unread" count="3"&gt;{{ tr('New', 'Новые') }}&lt;/TaoSegmentedOption&gt;
&lt;/TaoSegmented&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
