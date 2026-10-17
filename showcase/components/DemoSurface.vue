<script setup>
import { computed, ref } from 'vue'
import { TaoBlock, TaoButton, TaoCard, TaoSegmented, TaoSegmentedOption, confirm, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSurface' })

const backdrop = ref('content')
const surfaces = computed(() => [
  { value: 'flat', note: tr('A fill. The default', 'Заливка. По умолчанию') },
  { value: 'grain', note: tr('Film grain', 'Плёночное зерно') },
  { value: 'glass', note: tr('Blurs whatever is behind', 'Размытие того, что позади') },
])
const modes = computed(() => [
  tr('Select', 'Выбор'),
  tr('Tap', 'Тап'),
  tr('Hold', 'Удержание'),
  tr('Swipe', 'Проведение'),
  tr('Ball', 'Мяч'),
  tr('Colossus', 'Колосс'),
])
const tools = computed(() => [tr('Sections', 'Секции'), tr('Series', 'Серия'), tr('Salvo', 'Залп')])

function showToast(surface) {
  toast()
    .success()
    .title(tr('Saved', 'Сохранено'))
    .message(tr('The level is written to disk', 'Уровень записан на диск'))
    .surface(surface)
}

function showConfirm(surface) {
  confirm(tr('Delete the section?', 'Удалить секцию?'), {
    message: tr('The notes inside will be deleted too.', 'Ноты внутри тоже удалятся.'),
    danger: true,
    surface,
  })
}
</script>

<template>
  <ShowcaseSection id="surface" :tables="propTables['surface']">
    <h2>{{ tr('Surfaces', 'Поверхности') }}</h2>
    <Tr>
      <template #en>
        <p>
          What a panel is “made of”. The <code>tao-surface-grain</code> / <code>-glass</code> class on any
          element (an in-game HUD, a landing section, a sidebar) or the <code>surface</code> prop of TaoCard / TaoBlock.
          The look is tuned with theme tokens once for the whole app.
        </p>
        <p class="carousel-note">
          Expressiveness comes first from structure: fewer borders, one bright spot (the active item), group captions, hotkeys
          as keys. Grain comes after. Glass is only for what lies over content:
          over a flat background it turns into a grey fill, and over an animation it is recalculated every frame.
        </p>
      </template>
      <template #ru>
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
      </template>
    </Tr>

    <TaoSegmented v-model="backdrop" size="small" :legend="tr('Under the panels', 'Под панелями')">
      <TaoSegmentedOption value="content" :label="tr('Content', 'Контент')" />
      <TaoSegmentedOption value="plain" :label="tr('Plain background', 'Ровный фон')" />
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
        <p class="surface-panel__group">{{ tr('Modes', 'Режимы') }}</p>
        <ul class="surface-list">
          <li v-for="(m, i) in modes" :key="m" :class="{ 'surface-list__item--active': i === 1 }" class="surface-list__item">
            <span>{{ m }}</span><kbd>{{ i + 1 }}</kbd>
          </li>
        </ul>
        <p class="surface-panel__group">{{ tr('Layout', 'Разметка') }}</p>
        <ul class="surface-list">
          <li v-for="(t, i) in tools" :key="t" class="surface-list__item">
            <span>{{ t }}</span><kbd>{{ i + 7 }}</kbd>
          </li>
        </ul>
        <p class="surface-panel__note">{{ s.note }}</p>
      </TaoBlock>
    </div>

    <h3>{{ tr('Toast and confirm', 'Toast и confirm') }}</h3>
    <Tr>
      <template #en>
        <p class="carousel-note">
          They pop up over the page, so they are glass by default. The tone tint is kept.
          To turn it off: <code>toast.defaults({ surface: 'flat' })</code>, <code>confirm.defaults({ surface: 'flat' })</code>
          or for a single one — <code>.surface('flat')</code>.
        </p>
      </template>
      <template #ru>
        <p class="carousel-note">
          Всплывают поверх страницы, поэтому стеклянные по умолчанию. Оттенок тона сохраняется.
          Выключить: <code>toast.defaults({ surface: 'flat' })</code>, <code>confirm.defaults({ surface: 'flat' })</code>
          или для одного — <code>.surface('flat')</code>.
        </p>
      </template>
    </Tr>
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

/* {{ tr('tune once for the whole app', 'настроить один раз на всё приложение') }} */
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
