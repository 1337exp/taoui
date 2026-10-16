<script setup>
import { ref } from 'vue'
import { TaoBlock, TaoButton, TaoCard, TaoSegmented, TaoSegmentedOption, confirm, toast } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSurface' })

const backdrop = ref('content')
const surfaces = [
  { value: 'flat', note: 'Заливка. По умолчанию' },
  { value: 'grain', note: 'Плёночное зерно' },
  { value: 'glass', note: 'Размытие того, что позади' },
]
const modes = ['Выбор', 'Тап', 'Удержание', 'Проведение', 'Мяч', 'Колосс']
const tools = ['Секции', 'Серия', 'Залп']

function showToast(surface) {
  toast().success().title('Сохранено').message('Уровень записан на диск').surface(surface)
}

function showConfirm(surface) {
  confirm('Удалить секцию?', { message: 'Ноты внутри тоже удалятся.', danger: true, surface })
}
</script>

<template>
  <ShowcaseSection id="surface" :tables="propTables['surface']">
    <h2>Поверхности</h2>
    <p>
      Из чего «сделана» панель. Класс <code>tao-surface-grain</code> / <code>-glass</code> на любом
      элементе (HUD в игре, секция лендинга, сайдбар) или проп <code>surface</code> у TaoCard / TaoBlock.
      Вид настраивается токенами темы один раз на всё приложение.
    </p>
    <p class="carousel-note">
      Выразительность сначала даёт структура: меньше рамок, одно яркое пятно (активный пункт), подписи групп, хоткеи
      клавишами. Потом зерно. Стекло — только для того, что лежит поверх контента:
      над ровным фоном оно превращается в серую заливку, а над анимацией пересчитывается каждый кадр.
    </p>

    <TaoSegmented v-model="backdrop" size="small" legend="Под панелями">
      <TaoSegmentedOption value="content" label="Контент" />
      <TaoSegmentedOption value="plain" label="Ровный фон" />
    </TaoSegmented>

    <div class="surface-stage" :class="{ 'surface-stage--content': backdrop === 'content' }">
      <TaoBlock
        v-for="s in surfaces"
        :key="s.value"
        :surface="s.value"
        :padding="8"
        :shadow="false"
        class="surface-panel"
      >
        <p class="surface-panel__name">{{ s.value }}</p>
        <p class="surface-panel__group">Режимы</p>
        <ul class="surface-list">
          <li v-for="(m, i) in modes" :key="m" :class="{ 'surface-list__item--active': i === 1 }" class="surface-list__item">
            <span>{{ m }}</span><kbd>{{ i + 1 }}</kbd>
          </li>
        </ul>
        <p class="surface-panel__group">Разметка</p>
        <ul class="surface-list">
          <li v-for="(t, i) in tools" :key="t" class="surface-list__item">
            <span>{{ t }}</span><kbd>{{ i + 7 }}</kbd>
          </li>
        </ul>
        <p class="surface-panel__note">{{ s.note }}</p>
      </TaoBlock>
    </div>

    <h3>Toast и confirm</h3>
    <p class="carousel-note">
      Всплывают поверх страницы, поэтому стеклянные по умолчанию. Оттенок тона сохраняется.
      Выключить: <code>toast.defaults({ surface: 'flat' })</code>, <code>confirm.defaults({ surface: 'flat' })</code>
      или для одного — <code>.surface('flat')</code>.
    </p>
    <div class="demo-row" style="display: flex; flex-wrap: wrap; gap: 8px">
      <TaoButton variant="secondary" @click="showToast('glass')">Toast — glass</TaoButton>
      <TaoButton variant="secondary" @click="showToast('flat')">Toast — flat</TaoButton>
      <TaoButton variant="secondary" @click="showConfirm('glass')">Confirm — glass</TaoButton>
      <TaoButton variant="secondary" @click="showConfirm('flat')">Confirm — flat</TaoButton>
    </div>

    <h3>TaoCard</h3>
    <div class="surface-cards" :class="{ 'surface-stage--content': backdrop === 'content' }">
      <TaoCard v-for="s in surfaces" :key="s.value" :surface="s.value" :padding="16">
        <template #header><strong>{{ s.value }}</strong></template>
        <p style="margin: 0">{{ s.note }}</p>
      </TaoCard>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoCard surface="grain"&gt;…&lt;/TaoCard&gt;
&lt;aside class="tao-surface-glass"&gt;HUD&lt;/aside&gt;

/* tune once for the whole app / настроить один раз на всё приложение */
:root {
  --tao-glass-blur: 24px;
  --tao-surface-grain-image: url(my-grain.png);
}</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.surface-stage,
.surface-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 16px;
  margin-top: 12px;
  padding: 20px;
  border-radius: 12px;
  background: var(--tao-color-bg);
  border: 1px solid var(--tao-color-border);
}

/* Something to blur: colour blobs and a fake waveform / Что размывать: пятна цвета и «волна» */
.surface-stage--content {
  background:
    repeating-linear-gradient(90deg, rgb(150 140 200 / 0.35) 0 2px, transparent 2px 7px) center / 100% 46% no-repeat,
    radial-gradient(circle at 18% 30%, rgb(255 149 0 / 0.55), transparent 32%),
    radial-gradient(circle at 70% 75%, rgb(76 130 247 / 0.5), transparent 35%),
    radial-gradient(circle at 92% 15%, rgb(46 168 92 / 0.4), transparent 28%),
    var(--tao-color-bg);
}

.surface-panel__name {
  margin: 4px 8px 10px;
  font-weight: 700;
  color: var(--tao-color-text-strong);
}

.surface-panel__group {
  margin: 10px 8px 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--tao-color-text-muted);
}

.surface-panel__note {
  margin: 12px 8px 4px;
  font-size: 12px;
  color: var(--tao-color-text-muted);
}

.surface-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.surface-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: var(--tao-radius-control);
  font-size: 13px;
  color: var(--tao-color-text);
  cursor: pointer;
}

.surface-list__item:hover {
  background: var(--tao-color-surface-hover);
}

.surface-list__item--active,
.surface-list__item--active:hover {
  background: var(--tao-color-accent);
  color: var(--tao-color-on-accent);
}

.surface-list__item kbd {
  min-width: 18px;
  padding: 1px 4px;
  border: 1px solid var(--tao-color-border-strong);
  border-bottom-width: 2px;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 10px;
  line-height: 1.3;
  text-align: center;
  color: var(--tao-color-text-muted);
}

.surface-list__item--active kbd {
  border-color: color-mix(in srgb, var(--tao-color-on-accent) 35%, transparent);
  color: var(--tao-color-on-accent);
}
</style>
