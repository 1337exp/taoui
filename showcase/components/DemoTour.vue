<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoCard, TaoSwitch, TaoTour } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTour' })

const steps = computed(() => [
  { id: 'welcome', title: tr('A quick look', 'Быстрый обзор'), text: tr('Three things to know on this page. Arrows or the buttons move on, Esc leaves.', 'Три вещи, которые стоит знать на этой странице. Стрелки или кнопки ведут дальше, Esc выходит.') },
  { id: 'primary', target: '#tour-primary', placement: 'bottom', title: tr('The main action', 'Главное действие'), text: tr('The accent button is what the page is for.', 'Акцентная кнопка — то, ради чего страница.') },
  { id: 'card', target: '#tour-card', placement: 'right', title: tr('A card', 'Карточка'), text: tr('The card stays lit while the rest of the page rests.', 'Карточка остаётся освещённой, пока остальная страница отдыхает.') },
  { id: 'switch', target: '#tour-switch', placement: 'top', title: tr('Try it', 'Попробуйте'), text: tr('This step is interactive: the switch really works while the tour runs.', 'Этот шаг интерактивный: переключатель по-настоящему работает, пока идёт тур.') },
])

const index = ref(-1)
const step = computed(() => steps.value[index.value] ?? null)
const interactive = computed(() => step.value?.id === 'switch')
const on = ref(false)

function start() {
  index.value = 0
}
function next() {
  index.value = index.value + 1 >= steps.value.length ? -1 : index.value + 1
}
function prev() {
  index.value = Math.max(0, index.value - 1)
}
function skip() {
  index.value = -1
}
</script>

<template>
  <ShowcaseSection id="tour" :tables="propTables['tour']">
    <h2>TaoTour</h2>
    <Tr>
      <template #en>
        <p>
          A guided tour: the page goes dim, the target stays lit, a card with an arrow says what it is. It only draws:
          the steps and where you are come from you (below) or from TaoUX <code>tour</code>, which jumps over steps whose
          target is gone and remembers that the tour was seen. A step without a <code>target</code> is a card in the
          middle. <code>interactive</code> lets the user press the target itself.
        </p>
      </template>
      <template #ru>
        <p>
          Тур по странице: страница затемняется, цель остаётся освещённой, карточка со стрелкой говорит, что это. Он только
          рисует: шаги и где вы сейчас приходят от вас (ниже) или из TaoUX <code>tour</code>, который перепрыгивает шаги,
          у которых пропала цель, и помнит, что тур уже видели. Шаг без <code>target</code> — карточка посередине.
          <code>interactive</code> даёт нажать на саму цель.
        </p>
      </template>
    </Tr>

    <div class="tour-stage">
      <TaoButton id="tour-primary" @click="start">{{ tr('Start the tour', 'Начать тур') }}</TaoButton>
      <TaoCard id="tour-card" class="tour-stage__card" :title="tr('A card', 'Карточка')">
        {{ tr('Some content that the tour can point at.', 'Немного содержимого, на которое может указать тур.') }}
      </TaoCard>
      <span id="tour-switch"><TaoSwitch v-model="on" :label="tr('A real switch', 'Настоящий переключатель')" /></span>
    </div>

    <TaoTour
      :step="step"
      :index="index"
      :count="steps.length"
      :interactive="interactive"
      @next="next"
      @prev="prev"
      @skip="skip"
    />

    <div class="code-block">
      <pre><code>&lt;TaoTour :step="step" :index="index" :count="steps.length"
         @next="next" @prev="prev" @skip="skip" /&gt;

const steps = [
  { id: 'hi', title: 'Welcome' },                       // no target: a card in the middle
  { id: 'save', target: '#save', text: 'Saves it', placement: 'bottom' },
  { id: 'menu', target: () =&gt; menuEl.value, text: '…' },
]

// with TaoUX: const { step, position, total, first, last, next, prev, skip, start } = useTour({ steps })
// and pass :index="position" :count="total": they do not count the steps that are jumped over</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.tour-stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  margin-top: 12px;
  padding: 24px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
}

.tour-stage__card {
  width: 220px;
}
</style>
