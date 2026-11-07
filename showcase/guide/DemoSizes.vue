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

    <!-- a card per size, not a table: four columns of prose do not fit a phone / карточка на размер, а не таблица: четыре колонки текста не влезают на телефон -->
    <div class="sizes-cards">
      <article v-for="row in sizeGuide.sizes" :key="row.size" class="sizes-card">
        <h4 class="sizes-card__name">{{ row.size }}</h4>
        <div class="sizes-card__nums">{{ row.height }}px · {{ row.font }}px {{ tr('text', 'текст') }} · {{ row.padding }}px {{ tr('side', 'по бокам') }}</div>
        <div :class="'tao-size-' + row.size" class="sizes-card__live">
          <TaoInput model-value="Find…" aria-label="Find" />
          <TaoSegmented v-model="mode" :aria-label="tr('Mode', 'Режим')">
            <TaoSegmentedOption value="a">A</TaoSegmentedOption>
            <TaoSegmentedOption value="b">B</TaoSegmentedOption>
          </TaoSegmented>
          <TaoButton variant="secondary">{{ tr('Apply', 'Применить') }}</TaoButton>
        </div>
        <p class="sizes-card__label">{{ tr('Use it for', 'Для чего') }}</p>
        <p>
          <template v-for="(part, i) in rich(tr(row.use))" :key="i">
            <code v-if="i % 2">{{ part }}</code>
            <template v-else>{{ part }}</template>
          </template>
        </p>
        <p class="sizes-card__label">{{ tr('What it costs', 'Чего стоит') }}</p>
        <p>{{ tr(row.cost) }}</p>
      </article>
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

.sizes-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  gap: 16px;
  margin: 16px 0;
}

.sizes-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}

.sizes-card p {
  margin: 0 0 8px;
  font-size: 14px;
}

.sizes-card__name {
  margin: 0;
  font-size: 16px;
}

.sizes-card__nums {
  margin: 4px 0 12px;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

/* the live row wraps when there is no room, so it never pushes the page / живая строка переносится, когда тесно */
.sizes-card__live {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.sizes-card__live > :first-child {
  flex: 1 1 100px;
  min-width: 0;
}

.sizes-card__label {
  margin: 12px 0 4px !important;
  color: var(--tao-color-text-muted);
  font-size: 11px !important;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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
