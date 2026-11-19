<script setup>
// A page of the Guide for one starter of showcase/guide/starters/meta.js (`id`; each starter is its own entry of the menu,
// see books/guide.sections.js): rendered live in a frame whose width you pick (the starter lays itself out by its own
// width, as an app does by the window), the decisions it makes and why, and the whole file to copy.
// Страница Guide для одного каркаса из showcase/guide/starters/meta.js (`id`; у каждого каркаса свой пункт меню): вживую
// во фрейме выбранной ширины, его решения с причинами и файл целиком, чтобы скопировать.
import { computed, ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { starters } from './starters/meta.js'

defineOptions({ name: 'DemoStarters' })

const props = defineProps({ id: { type: String, required: true } })
const starter = computed(() => starters.find((s) => s.id === props.id))

const live = import.meta.glob('./starters/*.vue', { eager: true, import: 'default' })
const raw = import.meta.glob('./starters/*.vue', { eager: true, query: '?raw', import: 'default' })

const widths = [
  { value: '375px', en: 'Phone', ru: 'Телефон' },
  { value: '720px', en: 'Tablet', ru: 'Планшет' },
  { value: '100%', en: 'Wide', ru: 'Широкий' },
]
const width = ref('100%')

// `text` in backticks is code / `текст` в обратных кавычках — код
const rich = (text) => String(text).split('`')
const code = (id) => String(raw[`./starters/${id}.vue`]).replace(/\r\n/g, '\n').trim()
</script>

<template>
  <ShowcaseSection :id="'starter-' + id">
    <h2>{{ tr(starter.title) }}</h2>
    <p class="starter__when">{{ tr(starter.when) }}</p>
    <p class="starter__what">
      {{
        tr(
          'A starter is a whole screen to begin a project from: one file you copy as is, live below at the width you pick, with the decisions it makes and why. It uses the public API only; where it could not, the kit got the missing piece first.',
          'Каркас — целый экран, с которого начинают проект: один файл, который копируют как есть, ниже вживую на выбранной ширине, с решениями и причинами. Он берёт только публичный API; где не получалось, недостающее сначала получил набор.',
        )
      }}
    </p>

    <article class="starter">
      <TaoSegmented v-model="width" size="small" :aria-label="tr('Frame width', 'Ширина фрейма')">
        <TaoSegmentedOption v-for="w in widths" :key="w.value" :value="w.value">{{ tr(w.en, w.ru) }}</TaoSegmentedOption>
      </TaoSegmented>
      <!-- showcase-free: the headings and paragraphs of the page chrome do not reach the app inside -->
      <div class="starter__frame showcase-free" :style="{ width }">
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
  margin-top: 20px;
}

.starter__what {
  font-size: 13px;
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
