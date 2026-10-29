<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'DemoBackgrounds' })

// Every background here is a role or a class the kit already has: no component, one line each, and the palette
// in the header recolours all of them.
// Каждый фон здесь — роль или класс, которые в наборе уже есть: без компонента, по строке на каждый, а палитра в шапке
// перекрашивает их все.
const tiles = [
  {
    id: 'solid',
    title: ['Plain', 'Однотонный'],
    note: ['The page, or a raised panel', 'Страница или приподнятая панель'],
    code: 'background: var(--tao-color-bg);\n/* or --tao-color-surface-raised */',
  },
  {
    id: 'grain',
    title: ['Grain', 'Шум'],
    note: ['Film grain over the fill; surface="grain" on TaoCard / TaoBlock', 'Плёночное зерно поверх заливки; surface="grain" у TaoCard / TaoBlock'],
    code: '<div class="tao-surface-grain">',
  },
  {
    id: 'glow',
    title: ['Glow', 'Пятна света'],
    note: ['The glow of the palette; on the whole page it is a fixed layer that does not scroll', 'Свечение палитры; на всю страницу — неподвижный слой, который не прокручивается'],
    code: '<body class="tao-atmosphere">\n/* a section: */\nbackground: var(--tao-bg-atmosphere), var(--tao-color-bg);',
  },
  {
    id: 'gradient',
    title: ['Gradient', 'Градиент'],
    note: ['The stops of the palette, for a hero or a stripe', 'Цвета палитры, для шапки-обложки или полосы'],
    code: 'background: var(--tao-gradient);',
  },
  {
    id: 'mixed',
    title: ['Glow and grain', 'Свет и шум'],
    note: ['Layers add up: grain on top, glow below', 'Слои складываются: сверху зерно, под ним свет'],
    code: 'background:\n  var(--tao-surface-grain-image) 0 0 / var(--tao-surface-grain-size),\n  var(--tao-bg-atmosphere),\n  var(--tao-color-bg);',
  },
]
</script>

<template>
  <ShowcaseSection id="backgrounds">
    <h2>{{ tr('Backgrounds', 'Фоны') }}</h2>
    <Tr>
      <template #en>
        <p>
          A background needs no component: each one here is a role or a class the kit already has, one line of CSS. Switch
          the palette or the mode in the header, and all of them follow.
        </p>
      </template>
      <template #ru>
        <p>
          Фону не нужен компонент: каждый здесь — роль или класс, которые в наборе уже есть, одна строка CSS. Переключите
          палитру или режим в шапке — все последуют.
        </p>
      </template>
    </Tr>

    <div class="bg-demo">
      <figure v-for="tile in tiles" :key="tile.id" class="bg-demo__tile">
        <div class="bg-demo__swatch" :class="[`bg-demo__swatch--${tile.id}`, { 'tao-surface-grain': tile.id === 'grain' }]">
          <span class="bg-demo__title">{{ tr(tile.title[0], tile.title[1]) }}</span>
        </div>
        <figcaption>
          <span class="bg-demo__note">{{ tr(tile.note[0], tile.note[1]) }}</span>
          <pre class="bg-demo__code"><code>{{ tile.code }}</code></pre>
        </figcaption>
      </figure>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.bg-demo {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.bg-demo__tile {
  display: grid;
  /* a long line of code scrolls inside its block, it must not widen the tile / длинная строка кода не расширяет плитку */
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  gap: 8px;
  min-width: 0;
  margin: 0;
}

.bg-demo__swatch {
  display: grid;
  place-items: end start;
  height: 140px;
  padding: 12px 14px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  overflow: hidden;
}

.bg-demo__swatch--solid {
  background: var(--tao-color-bg);
}

.bg-demo__swatch--grain {
  background-color: var(--tao-color-surface-raised);
}

.bg-demo__swatch--glow {
  background: var(--tao-bg-atmosphere), var(--tao-color-bg);
}

.bg-demo__swatch--gradient {
  background: var(--tao-gradient);
}

.bg-demo__swatch--mixed {
  background:
    var(--tao-surface-grain-image) 0 0 / var(--tao-surface-grain-size),
    var(--tao-bg-atmosphere),
    var(--tao-color-bg);
}

.bg-demo__title {
  color: var(--tao-color-text-strong);
  font-weight: 600;
}

/* the gradient is a set of bright stops: a plate keeps the caption readable on any of them
   градиент — набор ярких цветов: подложка сохраняет подпись читаемой на любом из них */
.bg-demo__swatch--gradient .bg-demo__title {
  padding: 2px 8px;
  border-radius: var(--tao-radius-sm);
  background: color-mix(in srgb, var(--tao-color-bg) 70%, transparent);
}

.bg-demo__note {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.bg-demo__code {
  margin: 0;
  padding: 8px 10px;
  overflow-x: auto;
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface-sunken);
  font-size: 12px;
  line-height: 1.45;
}
</style>
