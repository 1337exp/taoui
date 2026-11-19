<script setup>
// The starters page of the Guide: each starter of showcase/guide/starters/meta.js rendered live in a frame whose width you
// pick (the starter lays itself out by its own width, as an app does by the window), the decisions it makes and why, and
// the whole file to copy.
// Страница каркасов Guide: каждый каркас из showcase/guide/starters/meta.js вживую во фрейме выбранной ширины (каркас
// раскладывается по своей ширине, как приложение по окну), его решения с причинами и файл целиком, чтобы скопировать.
import { reactive } from 'vue'
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { starters } from './starters/meta.js'

defineOptions({ name: 'DemoStarters' })

const live = import.meta.glob('./starters/*.vue', { eager: true, import: 'default' })
const raw = import.meta.glob('./starters/*.vue', { eager: true, query: '?raw', import: 'default' })

const widths = [
  { value: '375px', en: 'Phone', ru: 'Телефон' },
  { value: '720px', en: 'Tablet', ru: 'Планшет' },
  { value: '100%', en: 'Wide', ru: 'Широкий' },
]
const width = reactive(Object.fromEntries(starters.map((s) => [s.id, '100%'])))

// `text` in backticks is code / `текст` в обратных кавычках — код
const rich = (text) => String(text).split('`')
const code = (id) => String(raw[`./starters/${id}.vue`]).replace(/\r\n/g, '\n').trim()
</script>

<template>
  <ShowcaseSection id="starters">
    <h2>{{ tr('Starters', 'Каркасы') }}</h2>
    <p>
      {{
        tr(
          'Whole screens to start a project from. Each one is a single file you copy as is, live below at the width you pick, with the decisions it makes and why: so a new project starts from the shape that worked, and nobody has to guess why it is built this way. A starter uses the public API only; where it could not, the kit got the missing piece first.',
          'Целые экраны, с которых начинают проект. Каждый — один файл, который копируют как есть, ниже вживую на выбранной ширине, с решениями и причинами: новый проект начинается с формы, которая уже сработала, и никому не нужно гадать, почему здесь так. Каркас берёт только публичный API; где не получалось, недостающее сначала получил набор.',
        )
      }}
    </p>

    <article v-for="starter in starters" :key="starter.id" :id="'starter-' + starter.id" class="starter">
      <h3>{{ tr(starter.title) }}</h3>
      <p class="starter__when">{{ tr(starter.when) }}</p>

      <TaoSegmented v-model="width[starter.id]" size="small" :aria-label="tr('Frame width', 'Ширина фрейма')">
        <TaoSegmentedOption v-for="w in widths" :key="w.value" :value="w.value">{{ tr(w.en, w.ru) }}</TaoSegmentedOption>
      </TaoSegmented>
      <!-- showcase-free: the headings and paragraphs of the page chrome do not reach the app inside -->
      <div class="starter__frame showcase-free" :style="{ width: width[starter.id] }">
        <component :is="live[`./starters/${starter.id}.vue`]" />
      </div>

      <h4>{{ tr('Why it is built this way', 'Почему так') }}</h4>
      <ol class="starter__decisions">
        <li v-for="(decision, d) in starter.decisions" :key="d">
          <template v-for="(part, i) in rich(tr(decision))" :key="i">
            <code v-if="i % 2">{{ part }}</code>
            <template v-else>{{ part }}</template>
          </template>
        </li>
      </ol>

      <h4>{{ tr('The file', 'Файл') }}</h4>
      <p>
        <template v-for="(part, i) in rich(tr(starter.file))" :key="i">
          <code v-if="i % 2">{{ part }}</code>
          <template v-else>{{ part }}</template>
        </template>
      </p>
      <div class="code-block"><pre><code>{{ code(starter.id) }}</code></pre></div>
    </article>
  </ShowcaseSection>
</template>

<style scoped>
.starter {
  margin-top: 28px;
}

.starter__when {
  color: var(--tao-color-text-muted);
}

/* the window of the app: a fixed height, as a screen has; the width is picked above or dragged at the right edge
   окно приложения: постоянная высота, как у экрана; ширина выбирается выше или тянется за правый край */
.starter__frame {
  box-sizing: border-box;
  max-width: 100%;
  min-width: 300px;
  height: 520px;
  margin-top: 12px;
  overflow: hidden;
  resize: horizontal;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-bg);
}

.starter__decisions {
  display: grid;
  gap: 8px;
  padding-inline-start: 22px;
}
</style>
