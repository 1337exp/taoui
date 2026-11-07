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
  'demo-undo': { body: '<path d="M9 7L4.5 11.5 9 16M5 11.5h8.5a5 5 0 010 10H11"/>' },
  'demo-redo': { body: '<path d="M15 7l4.5 4.5L15 16M19 11.5h-8.5a5 5 0 000 10H13"/>' },
  'demo-strike': { body: '<path d="M4.5 12h15M16 7.5C15.4 5.9 13.9 5 12 5c-2.5 0-4 1.3-4 3M8 16.5c.6 1.6 2.2 2.5 4.2 2.5 2.5 0 4.3-1.4 4.3-3.3"/>' },
})

const bold = ref(true)
const italic = ref(false)
const underline = ref(false)
const strike = ref(false)
const align = ref('left')
const frameWidth = ref('520')

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

    <h3>{{ tr('One row: overflow', 'Одна строка: overflow') }}</h3>
    <Tr>
      <template #en>
        <p>
          With <code>overflow</code> the bar never wraps. The groups that do not fit go, the last one first, under a «⋮» button
          that opens them in a panel; a group with <code>pinned</code> stays. They are the same buttons, not copies: a toggle
          keeps its state. Change the width below, or drag the corner of the frame.
        </p>
      </template>
      <template #ru>
        <p>
          С <code>overflow</code> панель не переносится. Группы, которые не влезли, уходят (последняя первой) под кнопку «⋮», она
          открывает их в панели; группа с <code>pinned</code> остаётся. Это те же кнопки, а не копии: переключатель помнит своё
          состояние. Меняйте ширину ниже или тяните за угол рамки.
        </p>
      </template>
    </Tr>

    <div class="toolbar-demo">
      <TaoSegmented v-model="frameWidth" :aria-label="tr('Width of the frame', 'Ширина рамки')">
        <TaoSegmentedOption value="320">320</TaoSegmentedOption>
        <TaoSegmentedOption value="520">520</TaoSegmentedOption>
        <TaoSegmentedOption value="100%">{{ tr('Full', 'Вся') }}</TaoSegmentedOption>
      </TaoSegmented>
      <div class="toolbar-demo__frame" :style="{ width: frameWidth === '100%' ? '100%' : frameWidth + 'px' }">
        <TaoToolbar overflow :label="tr('Formatting, one row', 'Форматирование, одна строка')">
          <TaoToolbarGroup pinned :label="tr('History', 'История')">
            <TaoButton variant="ghost" tone="neutral" icon="demo-undo" :aria-label="tr('Undo', 'Отменить')" />
            <TaoButton variant="ghost" tone="neutral" icon="demo-redo" :aria-label="tr('Redo', 'Повторить')" />
          </TaoToolbarGroup>
          <TaoToolbarSeparator />
          <TaoToolbarGroup :label="tr('Text style', 'Начертание')">
            <TaoButton v-model:pressed="bold" variant="ghost" tone="neutral" icon="demo-bold" :aria-label="tr('Bold', 'Жирный')" />
            <TaoButton v-model:pressed="italic" variant="ghost" tone="neutral" icon="demo-italic" :aria-label="tr('Italic', 'Курсив')" />
            <TaoButton v-model:pressed="underline" variant="ghost" tone="neutral" icon="demo-underline" :aria-label="tr('Underline', 'Подчёркнутый')" />
            <TaoButton v-model:pressed="strike" variant="ghost" tone="neutral" icon="demo-strike" :aria-label="tr('Strikethrough', 'Зачёркнутый')" />
          </TaoToolbarGroup>
          <TaoToolbarSeparator />
          <TaoToolbarGroup :label="tr('Alignment', 'Выравнивание')">
            <TaoSegmented v-model="align" :aria-label="tr('Alignment', 'Выравнивание')">
              <TaoSegmentedOption value="left" icon="tao-align-left" :aria-label="tr('Left', 'Влево')" />
              <TaoSegmentedOption value="center" icon="tao-align-center" :aria-label="tr('Center', 'По центру')" />
              <TaoSegmentedOption value="right" icon="tao-align-right" :aria-label="tr('Right', 'Вправо')" />
            </TaoSegmented>
          </TaoToolbarGroup>
          <TaoToolbarSeparator />
          <TaoToolbarGroup :label="tr('Clear', 'Очистка')">
            <TaoButton variant="ghost" tone="neutral" @click="clear">{{ tr('Clear', 'Сбросить') }}</TaoButton>
          </TaoToolbarGroup>
        </TaoToolbar>
      </div>
      <p class="toolbar-demo__sample" :style="sample">
        {{ tr('The quick brown fox jumps over the lazy dog.', 'Съешь же ещё этих мягких французских булок, да выпей чаю.') }}
      </p>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoToolbar overflow label="Formatting"&gt;
  &lt;TaoToolbarGroup pinned label="History"&gt;…&lt;/TaoToolbarGroup&gt;   &lt;!-- never folded --&gt;
  &lt;TaoToolbarSeparator /&gt;                               &lt;!-- goes with the group after it --&gt;
  &lt;TaoToolbarGroup label="Text style"&gt;…&lt;/TaoToolbarGroup&gt;
  &lt;TaoToolbarSeparator /&gt;
  &lt;TaoToolbarGroup label="Clear"&gt;…&lt;/TaoToolbarGroup&gt;       &lt;!-- folded first --&gt;
&lt;/TaoToolbar&gt;

// a list anchored to a button that may have gone under «⋮»:
const anchor = await toolbar.value.reveal(buttonEl)   // opens the menu if needed, same element</code></pre>
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

/* a frame the width of which is the demo: it can also be dragged by its corner / рамка, ширина которой и есть демо; её можно тянуть за угол */
.toolbar-demo__frame {
  max-width: 100%;
  min-width: 200px;
  padding: 12px;
  overflow: hidden;
  resize: horizontal;
  border: 1px dashed var(--tao-color-border-strong);
  border-radius: var(--tao-radius-panel);
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
