<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoColorInput, TaoCopy, TaoInput, TaoSlider, TaoTag } from '@1337exp/taoui'
import A11yPanel from '../a11y/A11yPanel.vue'
import RatioBadge from '../a11y/RatioBadge.vue'
import { themeCss, themeRatings, themeVars } from './theme.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'OwnTheme' })

// An own theme by hand: the accent, the page and the corners. The preview wears the roles, the code is the file that would
// say them, the badges are the same promises the palettes keep.
// Своя тема руками: акцент, страница и углы. Превью носит роли, код — файл, который бы их сказал, значки — те же обещания,
// что держат палитры.
const accent = ref('#8f73ff')
const page = ref('#12141f')
const radius = ref(14)

const values = computed(() => ({ accent: accent.value, bg: page.value, radius: radius.value }))
const style = computed(() => themeVars(values.value))
const css = computed(() => themeCss(values.value))
const ratings = computed(() => themeRatings(values.value))
</script>

<template>
  <A11yPanel icon="tao-edit" :title="tr('An own theme by hand: three roles, one file', 'Своя тема руками: три роли, один файл')">
    <template #hint>{{ tr('the roles made from the accent are declared again next to it; the page below is not touched', 'роли, собранные из акцента, объявлены заново рядом с ним; страница ниже не меняется') }}</template>

    <div class="own-theme">
      <div class="own-theme__controls">
        <div class="own-theme__field">
          <span>{{ tr('Accent', 'Акцент') }}</span>
          <TaoColorInput v-model="accent" :aria-label="tr('Accent', 'Акцент')" />
        </div>
        <div class="own-theme__field">
          <span>{{ tr('Page', 'Страница') }}</span>
          <TaoColorInput v-model="page" :aria-label="tr('Page', 'Страница')" />
        </div>
        <div class="own-theme__field">
          <span>{{ tr('Corners', 'Углы') }}: {{ radius }}px</span>
          <TaoSlider v-model="radius" :min="0" :max="28" :aria-label="tr('Corners', 'Углы')" />
        </div>

        <ul class="own-theme__ratings">
          <li v-for="row in ratings" :key="row.id">
            <span>{{ tr(row.en, row.ru) }}</span>
            <RatioBadge :ratio="row.ratio" :need="row.need" />
          </li>
        </ul>
      </div>

      <div class="own-theme__preview" :style="style">
        <TaoInput :model-value="tr('Looks like this', 'Выглядит так')" :aria-label="tr('Sample field', 'Пример поля')" />
        <div class="own-theme__row">
          <TaoButton>{{ tr('Primary', 'Главная') }}</TaoButton>
          <TaoButton variant="secondary">{{ tr('Secondary', 'Вторая') }}</TaoButton>
          <TaoTag tone="accent">{{ tr('Tag', 'Метка') }}</TaoTag>
        </div>
        <p class="own-theme__text">{{ tr('Text on the page, and', 'Текст на странице, а') }} <a href="#layers" @click.prevent>{{ tr('a link in the accent', 'ссылка акцентом') }}</a>.</p>
      </div>

      <div class="own-theme__code">
        <div class="own-theme__code-head">
          <span>my-theme.css</span>
          <TaoCopy :text="css" />
        </div>
        <pre tabindex="0" aria-label="my-theme.css"><code>{{ css }}</code></pre>
        <p class="own-theme__note">{{ tr('Then: <html data-tao-theme="mine">. The same stops can become a whole palette with applyTaoPalette: see the lab above.', 'Затем: <html data-tao-theme="mine">. Из тех же цветов можно собрать целую палитру через applyTaoPalette: см. лабораторию выше.') }}</p>
      </div>
    </div>
  </A11yPanel>
</template>

<style scoped>
.own-theme {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.own-theme__code {
  grid-column: 1 / -1;
}

@container (max-width: 760px) {
  .own-theme {
    grid-template-columns: minmax(0, 1fr);
  }
}

.own-theme__controls {
  display: grid;
  align-content: start;
  gap: 12px;
}

.own-theme__field {
  display: grid;
  gap: 6px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

/* a colour field is as wide as its swatch and code: in a grid it would be stretched to the cell, and so would the click
   (the field is a div, not a label: a label would pass a click on the empty space to the swatch)
   поле цвета по ширине равно образцу и коду: в сетке его растянуло бы на ячейку, а с ним и клик */
.own-theme__field :deep(.tao-color-input-root) {
  justify-self: start;
  max-width: 100%;
}

.own-theme__ratings {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}

.own-theme__ratings li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* the preview is a page of its own: the roles are given inline, so every component inside reads them */
.own-theme__preview {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-bg);
  color: var(--tao-color-text);
}

.own-theme__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.own-theme__text {
  margin: 0;
  font-size: 14px;
}

.own-theme__text a {
  color: var(--tao-color-accent-text);
}

.own-theme__code {
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
  min-width: 0;
}

.own-theme__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 6px 14px;
  border-bottom: 1px solid var(--tao-color-border);
  color: var(--tao-color-text-muted);
  font-family: var(--tao-font-family-mono);
  font-size: 12px;
}

.own-theme__code pre {
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
}

.own-theme__code pre:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: -2px;
}

.own-theme__note {
  margin: 0;
  padding: 0 14px 12px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}
</style>
