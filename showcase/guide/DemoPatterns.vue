<script setup>
// The recommendations page of the Guide: the accent budget and the patterns of showcase/guide/patterns/meta.js. Each pattern
// shows a "do" and a "don't" next to each other, live (the Vue files are rendered), with the code under them (the same files).
// Страница рекомендаций Guide: бюджет акцента и шаблоны из showcase/guide/patterns/meta.js. Каждый шаблон показывает
// «так» и «не так» рядом, вживую (рисуются сами Vue-файлы), с кодом под ними (те же файлы).
import { TaoTag } from '@1337exp/taoui'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { accentBudget, patterns, templateOf } from './patterns/meta.js'

defineOptions({ name: 'DemoPatterns' })

const live = import.meta.glob('./patterns/*.vue', { eager: true, import: 'default' })
const raw = import.meta.glob('./patterns/*.vue', { eager: true, query: '?raw', import: 'default' })

const example = (id, kind) => ({
  comp: live[`./patterns/${id}.${kind}.vue`],
  code: templateOf(raw[`./patterns/${id}.${kind}.vue`]),
})

// `text` in backticks is code / `текст` в обратных кавычках — код
const rich = (text) => String(text).split('`')
</script>

<template>
  <ShowcaseSection id="patterns">
    <h2>{{ tr('Patterns', 'Шаблоны') }}</h2>
    <p>
      {{
        tr(
          'What to use when, and why. Each pattern is a situation, the rule, a do and a don\'t side by side, and the reason. Components are in the first book; here is how to put them together so a screen stays calm.',
          'Что брать, когда и почему. Каждый шаблон — ситуация, правило, «так» и «не так» рядом и причина. Компоненты — в первой книге; здесь — как собрать их так, чтобы экран оставался спокойным.',
        )
      }}
    </p>

    <h3>{{ tr(accentBudget.title) }}</h3>
    <p>
      <template v-for="(part, i) in rich(tr(accentBudget.lead))" :key="i">
        <code v-if="i % 2">{{ part }}</code>
        <template v-else>{{ part }}</template>
      </template>
    </p>
    <ol class="patterns-rules">
      <li v-for="(rule, r) in accentBudget.rules" :key="r">
        <template v-for="(part, i) in rich(tr(rule))" :key="i">
          <code v-if="i % 2">{{ part }}</code>
          <template v-else>{{ part }}</template>
        </template>
      </li>
    </ol>

    <article v-for="pattern in patterns" :key="pattern.id" :id="'pattern-' + pattern.id" class="pattern">
      <h3>{{ tr(pattern.title) }}</h3>
      <p class="pattern__when">{{ tr(pattern.when) }}</p>
      <p>
        <template v-for="(part, i) in rich(tr(pattern.rule))" :key="i">
          <code v-if="i % 2">{{ part }}</code>
          <template v-else>{{ part }}</template>
        </template>
      </p>

      <div class="pattern__pair">
        <figure v-for="kind in ['good', 'bad']" :key="kind" class="pattern__side">
          <figcaption>
            <TaoTag size="small" :tone="kind === 'good' ? 'success' : 'danger'">{{ kind === 'good' ? tr('Do', 'Так') : tr('Don\'t', 'Не так') }}</TaoTag>
            <span v-if="kind === 'bad'" class="pattern__wrong">
              <template v-for="(piece, i) in rich(tr(pattern.wrong))" :key="i">
                <code v-if="i % 2">{{ piece }}</code>
                <template v-else>{{ piece }}</template>
              </template>
            </span>
          </figcaption>
          <div class="pattern__live"><component :is="example(pattern.id, kind).comp" /></div>
          <div class="code-block"><pre><code>{{ example(pattern.id, kind).code }}</code></pre></div>
        </figure>
      </div>

      <p class="pattern__why">
        <strong>{{ tr('Why', 'Почему') }}.</strong> {{ tr(pattern.why) }}
      </p>
    </article>
  </ShowcaseSection>
</template>

<style scoped>
.patterns-rules {
  display: grid;
  gap: 8px;
  padding-inline-start: 22px;
}

.pattern {
  margin-top: 36px;
  padding-top: 20px;
  border-top: 1px solid var(--tao-color-border);
}

.pattern__when {
  color: var(--tao-color-text-muted);
}

/* the do and the don't side by side; one under the other where there is no room (a phone) / «так» и «не так» рядом; друг под другом, где тесно */
.pattern__pair {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 16px;
  margin: 16px 0;
}

.pattern__side {
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
  margin: 0;
}

.pattern__wrong {
  margin-inline-start: 8px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.pattern__live {
  display: grid;
  align-items: center;
  min-height: 84px;
  padding: 16px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
  overflow-x: auto;
}

.pattern__side .code-block {
  margin-top: 0;
}
</style>
