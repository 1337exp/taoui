<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TaoCard, TaoDonut, TaoHeatmap, TaoMeter, TaoSlider, TaoSparkline, TaoTag, watchTaoChartTheme } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCharts' })

const visits = [12, 18, 15, 22, 19, 27, 24, 31, 29, 36, 33, 41]
const revenue = [40, 42, 41, 45, 44, 48, 47, 52, 55, 54, 58, 61]
const errors = [3, 2, 4, 3, null, null, 6, 9, 7, 12, 10, 14]

const disk = ref(70)
const battery = ref(35)

const traffic = computed(() => [
  { label: tr('Mobile', 'Телефоны'), value: 58 },
  { label: tr('Desktop', 'Компьютеры'), value: 31 },
  { label: tr('Tablet', 'Планшеты'), value: 8 },
  { label: tr('Other', 'Другое'), value: 3 },
])

// orders by weekday and hour: a lunch peak, an evening peak, a quiet night, a busier weekend
// заказы по дню недели и часу: пик в обед, пик вечером, тихая ночь, выходные плотнее
const hourly = [2, 1, 1, 0, 0, 1, 3, 6, 9, 11, 13, 17, 21, 19, 14, 12, 13, 16, 20, 23, 21, 15, 9, 5]
const dayFactor = [0.85, 0.9, 0.95, 1, 1.15, 1.3, 1.1]
const orders = dayFactor.map((f, d) => hourly.map((h, i) => Math.round(h * f * 100 + ((d * 7 + i * 13) % 11) * 9)))
const weekdays = computed(() => tr('Mon Tue Wed Thu Fri Sat Sun', 'Пн Вт Ср Чт Пт Сб Вс').split(' '))
const hours = computed(() =>
  Array.from({ length: 24 }, (_, i) => tr(`${i % 12 || 12} ${i < 12 ? 'am' : 'pm'}`, `${i}:00`)),
)

// the colours a chart library would get, read live: switch the theme or the palette and they follow
// цвета, которые получила бы библиотека графиков, вживую: смените тему или палитру — они последуют
const theme = ref(null)
let stop
onMounted(() => {
  stop = watchTaoChartTheme((t) => (theme.value = t))
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <ShowcaseSection id="charts" :tables="propTables['charts']">
    <h2>TaoSparkline / TaoMeter / TaoDonut / TaoHeatmap</h2>
    <Tr>
      <template #en>
        <p>
          Small charts for a line of text or the corner of a card: a trend, a measured value, a share of a whole. No axes,
          no tooltips, no zoom — for those take a chart library (Chart.js, ECharts, uPlot) and give it the theme colours
          with <code>taoChartTheme()</code>. The series colours are the roles <code>--tao-color-chart-1…6</code>: the first is
          the accent, so a palette recolours the charts too.
        </p>
      </template>
      <template #ru>
        <p>
          Маленькие графики для строки текста или угла карточки: тренд, измеренное значение, доля целого. Без осей, подсказок
          и зума — для этого берите библиотеку графиков (Chart.js, ECharts, uPlot) и отдайте ей цвета темы через
          <code>taoChartTheme()</code>. Цвета серий — роли <code>--tao-color-chart-1…6</code>: первый — акцент, поэтому палитра
          перекрашивает и графики.
        </p>
      </template>
    </Tr>

    <h3>TaoSparkline</h3>
    <div class="charts-demo__stats">
      <TaoCard :padding="16">
        <template #corner>
          <TaoTag tone="success" flat size="small"><span aria-hidden="true">▲</span> +12%</TaoTag>
        </template>
        <div class="charts-demo__stat">
          <span class="charts-demo__caption">{{ tr('Visits', 'Визиты') }}</span>
          <strong class="charts-demo__number">4 120</strong>
          <TaoSparkline :values="visits" area dot :label="tr('Visits, 12 weeks, growing', 'Визиты за 12 недель, рост')" />
        </div>
      </TaoCard>
      <TaoCard :padding="16">
        <template #corner>
          <TaoTag tone="success" flat size="small"><span aria-hidden="true">▲</span> +6%</TaoTag>
        </template>
        <div class="charts-demo__stat">
          <span class="charts-demo__caption">{{ tr('Revenue', 'Выручка') }}</span>
          <strong class="charts-demo__number">$61k</strong>
          <TaoSparkline :values="revenue" tone="success" dot :label="tr('Revenue, 12 weeks', 'Выручка за 12 недель')" />
        </div>
      </TaoCard>
      <TaoCard :padding="16">
        <template #corner>
          <TaoTag tone="danger" flat size="small"><span aria-hidden="true">▲</span> +40%</TaoTag>
        </template>
        <div class="charts-demo__stat">
          <span class="charts-demo__caption">{{ tr('Errors', 'Ошибки') }}</span>
          <strong class="charts-demo__number">14</strong>
          <TaoSparkline :values="errors" tone="danger" area dot :label="tr('Errors, 12 weeks, two weeks without data', 'Ошибки за 12 недель, две недели без данных')" />
        </div>
      </TaoCard>
    </div>
    <p class="charts-demo__inline">
      {{ tr('Inline, in the text:', 'Прямо в тексте:') }}
      <TaoSparkline :values="visits" :height="18" style="width: 80px" />
      {{ tr('up 3.4× in three months.', 'рост в 3,4 раза за три месяца.') }}
    </p>

    <h3>TaoMeter</h3>
    <div class="charts-demo__meters">
      <div>
        <TaoMeter
          :value="disk"
          :low="60"
          :high="90"
          :optimum="0"
          :label="tr('Disk', 'Диск')"
          :value-text="tr(`${Math.round(disk * 2.56)} of 256 GB`, `${Math.round(disk * 2.56)} из 256 ГБ`)"
        />
        <TaoSlider v-model="disk" size="small" :aria-label="tr('Disk used', 'Занято на диске')" />
      </div>
      <div>
        <TaoMeter :value="battery" :low="20" :high="50" :optimum="100" :label="tr('Battery', 'Батарея')" :value-text="`${battery}%`" />
        <TaoSlider v-model="battery" size="small" :aria-label="tr('Battery charge', 'Заряд батареи')" />
      </div>
      <TaoMeter :value="62" :label="tr('Profile complete', 'Профиль заполнен')" value-text="62%" />
    </div>

    <h3>TaoDonut</h3>
    <div class="charts-demo__donuts">
      <TaoDonut :segments="traffic" legend :label="tr('Traffic by device', 'Трафик по устройствам')">
        <span class="charts-demo__centre">58%<small>{{ tr('mobile', 'телефоны') }}</small></span>
      </TaoDonut>
      <TaoDonut :value="72" tone="success" :size="96" :thickness="10" :label="tr('Score', 'Оценка')">
        <strong>72</strong>
      </TaoDonut>
    </div>

    <h3>TaoHeatmap</h3>
    <TaoCard :padding="16" class="charts-demo__heatmap">
      <!-- the card puts its content into a body of its own: the gap goes on a wrapper here
           карточка кладёт содержимое в своё тело: зазор задаём обёртке здесь -->
      <div class="charts-demo__heatmap-body">
      <span class="charts-demo__caption">{{ tr('Orders by time', 'Заказы по времени') }}</span>
      <TaoHeatmap
        :values="orders"
        :rows="weekdays"
        :cols="hours"
        :steps="[200, 500, 1000, 1500, 2000]"
        :label="tr('Orders by weekday and hour', 'Заказы по дням недели и часам')"
      />
      </div>
    </TaoCard>

    <h3>{{ tr('For a chart library', 'Для библиотеки графиков') }}</h3>
    <div v-if="theme" class="charts-demo__swatches" aria-hidden="true">
      <span v-for="(c, i) in theme.colors" :key="i" class="charts-demo__swatch" :style="{ background: c }" :title="c">{{ i + 1 }}</span>
      <code>grid {{ theme.grid }}</code>
    </div>
    <div class="code-block">
      <pre><code>import { watchTaoChartTheme } from '@1337exp/taoui'

// Chart.js: the theme now and on every theme / palette change
const stop = watchTaoChartTheme((t) =&gt; {
  chart.data.datasets.forEach((d, i) =&gt; (d.borderColor = t.colors[i % t.colors.length]))
  chart.options.scales.x.grid.color = t.grid
  chart.options.scales.x.ticks.color = t.textMuted
  chart.options.plugins.legend.labels.color = t.text
  chart.update()
})

// ECharts
echart.setOption({ color: t.colors, textStyle: { color: t.text, fontFamily: t.fontFamily } })</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.charts-demo__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.charts-demo__stat {
  display: grid;
  gap: 4px;
}

.charts-demo__caption {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.charts-demo__number {
  color: var(--tao-color-text-strong);
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}

.charts-demo__inline {
  margin: 0 0 16px;
}

.charts-demo__meters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 24px;
  max-width: 720px;
  margin-bottom: 16px;
}

.charts-demo__meters > div {
  display: grid;
  gap: 4px;
}

.charts-demo__donuts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 32px;
  margin-bottom: 16px;
}

.charts-demo__centre {
  display: grid;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;
}

.charts-demo__centre small {
  color: var(--tao-color-text-muted);
  font-size: 11px;
  font-weight: 400;
}

.charts-demo__heatmap {
  max-width: 720px;
  margin-bottom: 16px;
}

.charts-demo__heatmap-body {
  display: grid;
  gap: 12px;
}

.charts-demo__swatches {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.charts-demo__swatch {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #fff;
  text-shadow: 0 0 3px rgb(0 0 0 / 0.6);
  font-size: 12px;
  font-weight: 600;
}
</style>
