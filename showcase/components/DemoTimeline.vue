<script setup>
import { computed, ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption, TaoTimeline } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTimeline' })

const order = computed(() => [
  { id: 'paid', title: tr('Paid', 'Оплачен'), time: tr('12 May, 14:03', '12 мая, 14:03'), datetime: '2026-05-12T14:03', icon: 'tao-check' },
  { id: 'packed', title: tr('Packed', 'Собран'), time: tr('12 May, 18:40', '12 мая, 18:40'), datetime: '2026-05-12T18:40', description: tr('Two boxes, 3.2 kg', 'Две коробки, 3,2 кг'), icon: 'tao-copy' },
  { id: 'sent', title: tr('Sent', 'Отправлен'), time: tr('13 May, 09:15', '13 мая, 09:15'), datetime: '2026-05-13T09:15', icon: 'tao-arrow-up' },
  { id: 'delivered', title: tr('Delivered', 'Доставлен'), description: tr('Expected on 15 May', 'Ожидается 15 мая'), icon: 'tao-circle' },
])
const step = ref('sent')
const align = ref('start')

const releases = computed(() => [
  { id: '5', title: '5.0.0', time: tr('today', 'сегодня'), tone: 'success', description: tr('Palettes, menus, TaoNav, TaoTree', 'Палитры, меню, TaoNav, TaoTree') },
  { id: '4.1', title: '4.0.1', time: tr('a month ago', 'месяц назад'), tone: 'info', description: tr('A fix in the slider', 'Исправление в слайдере') },
  { id: '4', title: '4.0.0', time: tr('in spring', 'весной'), tone: 'warning', description: tr('Breaking: tokens renamed', 'Ломающее: токены переименованы') },
  { id: '3', title: '3.3.1', time: tr('last year', 'в прошлом году'), tone: 'neutral' },
])
</script>

<template>
  <ShowcaseSection id="timeline" :tables="propTables['timeline']">
    <h2>TaoTimeline</h2>
    <Tr>
      <template #en>
        <p>
          A vertical feed of events: an order's steps, releases, an activity log. With <code>active</code> the line is
          filled up to the current event and the next ones wait (a progress); without it the feed is a log of the past.
          <code>tone</code> colours a marker, <code>icon</code> goes inside it, <code>#marker</code> replaces it.
          <code>align="alternate"</code> puts the events on both sides and folds into one side on a narrow width.
        </p>
      </template>
      <template #ru>
        <p>
          Вертикальная лента событий: шаги заказа, релизы, журнал. С <code>active</code> линия залита до текущего события,
          а следующие ждут (прогресс); без него лента — журнал прошедшего. <code>tone</code> красит маркер,
          <code>icon</code> кладёт в него иконку, <code>#marker</code> заменяет его. <code>align="alternate"</code>
          раскладывает события по обе стороны и на узкой ширине складывается в одну.
        </p>
      </template>
    </Tr>

    <div class="timeline-demo__controls">
      <TaoSegmented v-model="step" size="small">
        <TaoSegmentedOption v-for="item in order" :key="item.id" :value="item.id" :label="item.title" />
      </TaoSegmented>
      <TaoSegmented v-model="align" size="small">
        <TaoSegmentedOption value="start" label="start" />
        <TaoSegmentedOption value="alternate" label="alternate" />
      </TaoSegmented>
    </div>

    <div class="timeline-demo">
      <TaoTimeline :items="order" :active="step" :align="align" />
      <TaoTimeline :items="releases" size="small" />
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoTimeline :items="steps" active="sent" /&gt;

const steps = [
  { id: 'paid', title: 'Paid', time: '12 May, 14:03', datetime: '2026-05-12T14:03', icon: 'tao-check' },
  { id: 'packed', title: 'Packed', description: 'Two boxes, 3.2 kg' },
  { id: 'sent', title: 'Sent' },
  { id: 'delivered', title: 'Delivered' },
]

&lt;!-- a log of the past: no active, a tone per event --&gt;
&lt;TaoTimeline :items="releases" /&gt;   // { id, title, time, tone: 'success' }</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.timeline-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.timeline-demo {
  /* one under the other: alternate needs 480px of its own width */
  display: grid;
  gap: 32px;
  margin-bottom: 16px;
}
</style>
