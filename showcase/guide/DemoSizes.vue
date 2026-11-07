<script setup>
// Choosing a size: the Guide page for the question "why is this small, and when should it be". The data is
// showcase/guide/patterns/meta.js (sizeGuide), the same that skills/taoui/references/patterns.md is written from. Each size
// is shown live, as a button of that size, so the page is its own ruler.
// Выбор размера: страница Guide на вопрос «почему тут маленькое и когда так надо». Данные — sizeGuide в meta.js, из них же
// пишется patterns.md. Каждый размер показан вживую кнопкой этого размера: страница — сама себе линейка.
import { TaoButton, TaoInput, TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import { ref } from 'vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { sizeGuide } from './patterns/meta.js'

defineOptions({ name: 'DemoSizes' })

const mode = ref('a')
// `text` in backticks is code / `текст` в обратных кавычках — код
const rich = (text) => String(text).split('`')
</script>

<template>
  <ShowcaseSection id="size-choice">
    <h2>{{ tr(sizeGuide.title) }}</h2>
    <p>
      <template v-for="(part, i) in rich(tr(sizeGuide.lead))" :key="i">
        <code v-if="i % 2">{{ part }}</code>
        <template v-else>{{ part }}</template>
      </template>
    </p>

    <div class="sizes-table-wrap">
      <table class="sizes-table">
        <thead>
          <tr>
            <th>{{ tr('Size', 'Размер') }}</th>
            <th>{{ tr('Live', 'Вживую') }}</th>
            <th>{{ tr('Use it for', 'Для чего') }}</th>
            <th>{{ tr('What it costs', 'Чего стоит') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sizeGuide.sizes" :key="row.size">
            <td>
              <strong>{{ row.size }}</strong>
              <div class="sizes-table__nums">{{ row.height }}px · {{ row.font }}px {{ tr('text', 'текст') }} · {{ row.padding }}px {{ tr('side', 'по бокам') }}</div>
            </td>
            <td>
              <div :class="'tao-size-' + row.size" class="sizes-table__live">
                <TaoInput model-value="Find…" aria-label="Find" />
                <TaoSegmented v-model="mode" :aria-label="tr('Mode', 'Режим')">
                  <TaoSegmentedOption value="a">A</TaoSegmentedOption>
                  <TaoSegmentedOption value="b">B</TaoSegmentedOption>
                </TaoSegmented>
                <TaoButton variant="secondary">{{ tr('Apply', 'Применить') }}</TaoButton>
              </div>
            </td>
            <td>
              <template v-for="(part, i) in rich(tr(row.use))" :key="i">
                <code v-if="i % 2">{{ part }}</code>
                <template v-else>{{ part }}</template>
              </template>
            </td>
            <td>{{ tr(row.cost) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>{{ tr('Density: on top of the size', 'Плотность: поверх размера') }}</h3>
    <p>
      {{
        tr(
          'The second axis changes the height and the padding of every size, not the font. A class on a container, or on <html>.',
          'Вторая ось меняет высоту и отступы любого размера, шрифт не трогает. Класс на контейнере или на <html>.',
        )
      }}
    </p>
    <div class="sizes-table-wrap">
      <table class="sizes-table sizes-table--density">
        <thead>
          <tr>
            <th>{{ tr('Density', 'Плотность') }}</th>
            <th>small</th>
            <th>medium</th>
            <th>large</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in sizeGuide.density" :key="row.name">
            <td><code>tao-density-{{ row.name }}</code></td>
            <td v-for="(h, i) in row.heights" :key="i">{{ h }}px</td>
            <td>{{ tr(row.note) }}</td>
          </tr>
          <tr>
            <td><code>tao-density-auto</code></td>
            <td colspan="3">{{ tr('comfortable under a finger (pointer: coarse), default with a mouse', 'comfortable под пальцем (pointer: coarse), обычная с мышью') }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>{{ tr('How to decide', 'Как решать') }}</h3>
    <ol class="patterns-rules">
      <li v-for="(rule, r) in sizeGuide.rules" :key="r">
        <template v-for="(part, i) in rich(tr(rule))" :key="i">
          <code v-if="i % 2">{{ part }}</code>
          <template v-else>{{ part }}</template>
        </template>
      </li>
    </ol>
  </ShowcaseSection>
</template>

<style scoped>
.sizes-table-wrap {
  overflow-x: auto;
  margin: 16px 0;
}

.sizes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sizes-table th,
.sizes-table td {
  padding: 12px;
  border-bottom: 1px solid var(--tao-color-border);
  text-align: start;
  vertical-align: top;
}

.sizes-table th {
  color: var(--tao-color-text-muted);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sizes-table__nums {
  margin-top: 4px;
  color: var(--tao-color-text-muted);
  font-size: 12px;
  white-space: nowrap;
}

/* the live row is as wide as its widest size, so the three rows read as a ruler / живая строка по ширине самого крупного */
.sizes-table__live {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 340px;
}

.sizes-table__live > :first-child {
  flex: 1 1 90px;
  min-width: 0;
}

.sizes-table--density td:not(:first-child) {
  font-variant-numeric: tabular-nums;
}

.patterns-rules {
  display: grid;
  gap: 8px;
  padding-inline-start: 22px;
}
</style>
