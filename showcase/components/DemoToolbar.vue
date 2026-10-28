<script setup>
import { computed, ref } from 'vue'
import {
  TaoButton,
  TaoSegmented,
  TaoSegmentedOption,
  TaoToolbar,
  TaoToolbarGroup,
  TaoToolbarSeparator,
  registerTaoIcons,
} from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoToolbar' })

// the text-style glyphs are the app's own icons: the kit only ships the alignment ones
// значки начертаний — свои иконки приложения: в наборе есть только выравнивание
registerTaoIcons({
  'demo-bold': { body: '<path d="M7.5 5h5.5a3.5 3.5 0 010 7H7.5zM7.5 12h6.5a3.5 3.5 0 010 7H7.5z"/>' },
  'demo-italic': { body: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>' },
  'demo-underline': { body: '<path d="M7 4.5v6.5a5 5 0 0010 0V4.5M5 20h14"/>' },
  'demo-strike': { body: '<path d="M4.5 12h15M16 7.5C15.4 5.9 13.9 5 12 5c-2.5 0-4 1.3-4 3M8 16.5c.6 1.6 2.2 2.5 4.2 2.5 2.5 0 4.3-1.4 4.3-3.3"/>' },
})

const bold = ref(true)
const italic = ref(false)
const underline = ref(false)
const strike = ref(false)
const align = ref('left')

function clear() {
  bold.value = italic.value = underline.value = strike.value = false
  align.value = 'left'
}

const sample = computed(() => ({
  fontWeight: bold.value ? 700 : 400,
  fontStyle: italic.value ? 'italic' : 'normal',
  textDecoration: [underline.value && 'underline', strike.value && 'line-through'].filter(Boolean).join(' ') || 'none',
  textAlign: align.value,
}))
</script>

<template>
  <ShowcaseSection id="toolbar" :tables="propTables['toolbar']">
    <h2>TaoToolbar</h2>
    <Tr>
      <template #en>
        <p>
          A bar of tools for what is on the screen right now: text style, alignment, a few actions. It is one
          <kbd>Tab</kbd> stop: <kbd>←</kbd> <kbd>→</kbd> walk it, <kbd>Home</kbd> / <kbd>End</kbd> go to the ends, and inside
          the alignment the arrows pick the option until its edge. A thin line splits the groups — the eye takes in a set
          of related tools at once instead of reading one long row. The toggles are <code>TaoButton</code> with
          <code>v-model:pressed</code>: they say <code>aria-pressed</code>.
        </p>
      </template>
      <template #ru>
        <p>
          Полоса инструментов для того, что сейчас на экране: начертание, выравнивание, пара действий. Это одна остановка
          <kbd>Tab</kbd>: <kbd>←</kbd> <kbd>→</kbd> ходят по ней, <kbd>Home</kbd> / <kbd>End</kbd> — к краям, а внутри
          выравнивания стрелки выбирают вариант до его края. Тонкая черта делит группы — глаз схватывает набор связанных
          инструментов сразу, а не читает длинный ряд. Переключатели — <code>TaoButton</code> с <code>v-model:pressed</code>:
          они говорят <code>aria-pressed</code>.
        </p>
      </template>
    </Tr>

    <div class="toolbar-demo">
      <TaoToolbar :label="tr('Formatting', 'Форматирование')">
        <TaoToolbarGroup :label="tr('Text style', 'Начертание')">
          <TaoButton v-model:pressed="bold" variant="ghost" tone="neutral" icon="demo-bold" :aria-label="tr('Bold', 'Жирный')" />
          <TaoButton v-model:pressed="italic" variant="ghost" tone="neutral" icon="demo-italic" :aria-label="tr('Italic', 'Курсив')" />
          <TaoButton v-model:pressed="underline" variant="ghost" tone="neutral" icon="demo-underline" :aria-label="tr('Underline', 'Подчёркнутый')" />
          <TaoButton v-model:pressed="strike" variant="ghost" tone="neutral" icon="demo-strike" :aria-label="tr('Strikethrough', 'Зачёркнутый')" />
        </TaoToolbarGroup>
        <TaoToolbarSeparator />
        <TaoSegmented v-model="align" :aria-label="tr('Alignment', 'Выравнивание')">
          <TaoSegmentedOption value="left" icon="tao-align-left" :aria-label="tr('Left', 'Влево')" />
          <TaoSegmentedOption value="center" icon="tao-align-center" :aria-label="tr('Center', 'По центру')" />
          <TaoSegmentedOption value="right" icon="tao-align-right" :aria-label="tr('Right', 'Вправо')" />
        </TaoSegmented>
        <TaoToolbarSeparator />
        <TaoButton variant="ghost" tone="neutral" @click="clear">{{ tr('Clear', 'Сбросить') }}</TaoButton>
      </TaoToolbar>

      <p class="toolbar-demo__sample" :style="sample">
        {{ tr('The quick brown fox jumps over the lazy dog.', 'Съешь же ещё этих мягких французских булок, да выпей чаю.') }}
      </p>

      <TaoToolbar :label="tr('Formatting, small', 'Форматирование, маленькая')" size="small">
        <TaoToolbarGroup inset :label="tr('Text style', 'Начертание')">
          <TaoButton v-model:pressed="bold" variant="ghost" tone="neutral" icon="demo-bold" :aria-label="tr('Bold', 'Жирный')" />
          <TaoButton v-model:pressed="italic" variant="ghost" tone="neutral" icon="demo-italic" :aria-label="tr('Italic', 'Курсив')" />
          <TaoButton v-model:pressed="underline" variant="ghost" tone="neutral" icon="demo-underline" :aria-label="tr('Underline', 'Подчёркнутый')" />
        </TaoToolbarGroup>
        <TaoToolbarSeparator />
        <TaoButton variant="ghost" tone="neutral" icon="tao-copy" :aria-label="tr('Copy', 'Копировать')" />
        <TaoButton variant="ghost" tone="neutral" icon="tao-more-horizontal" :aria-label="tr('More', 'Ещё')" />
      </TaoToolbar>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoToolbar label="Formatting"&gt;
  &lt;TaoToolbarGroup label="Text style"&gt;
    &lt;TaoButton v-model:pressed="bold" variant="ghost" tone="neutral" icon="bold" aria-label="Bold" /&gt;
    &lt;TaoButton v-model:pressed="italic" variant="ghost" tone="neutral" icon="italic" aria-label="Italic" /&gt;
  &lt;/TaoToolbarGroup&gt;
  &lt;TaoToolbarSeparator /&gt;
  &lt;TaoSegmented v-model="align" aria-label="Alignment"&gt;
    &lt;TaoSegmentedOption value="left" icon="tao-align-left" aria-label="Left" /&gt;
    …
  &lt;/TaoSegmented&gt;
&lt;/TaoToolbar&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.toolbar-demo {
  display: grid;
  justify-items: start;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-demo__sample {
  width: 100%;
  max-width: 560px;
  margin: 0;
  padding: 12px 16px;
  border: 1px dashed var(--tao-color-border-strong);
  border-radius: var(--tao-radius-panel);
  color: var(--tao-color-text);
  background: var(--tao-color-surface-sunken);
}
</style>
