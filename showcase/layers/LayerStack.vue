<script setup>
import { computed, ref, watch } from 'vue'
import { TaoCopy, TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import A11yPanel from '../a11y/A11yPanel.vue'
import { LAYERS } from './layers.js'
import { lang, tr } from '../i18n.js'

defineOptions({ name: 'LayerStack' })

// The five layers as a list and the real file of the chosen one beside it. Several files in a layer: a choice between them.
// Пять слоёв списком и рядом настоящий файл выбранного. Файлов в слое несколько: выбор между ними.
const layerId = ref(LAYERS[0].id)
const fileName = ref(LAYERS[0].files[0].name)

const layer = computed(() => LAYERS.find((item) => item.id === layerId.value))
const file = computed(() => layer.value.files.find((item) => item.name === fileName.value) ?? layer.value.files[0])
// contexts/size · tone · surface: the folder once, then the short names
const label = (item) => item.files.map((f, i) => (i === 0 ? f.name : f.name.split('/').pop().replace(/\.css$/, ''))).join(' · ')
const text = (item) => (lang.value === 'ru' ? item.ru : item.en)

watch(layerId, () => {
  fileName.value = layer.value.files[0].name
})
</script>

<template>
  <A11yPanel icon="tao-settings" :title="tr('Order of the layers: primitives → semantics → themes → contexts → base', 'Порядок слоёв: примитивы → семантика → темы → контексты → база')">
    <template #hint>{{ tr('pick a layer: its real file and whether it is yours to touch', 'выберите слой: его настоящий файл и можно ли его трогать') }}</template>

    <div class="layer-stack">
      <ol class="layer-stack__list">
        <li v-for="(item, index) in LAYERS" :key="item.id">
          <button type="button" class="layer-stack__item" :class="{ 'layer-stack__item--on': item.id === layerId }" :aria-pressed="item.id === layerId" @click="layerId = item.id">
            <span class="layer-stack__no">0{{ index + 1 }}</span>
            <span class="layer-stack__body">
              <span class="layer-stack__name">{{ label(item) }}</span>
              <span class="layer-stack__role">{{ text(item).role }}</span>
            </span>
            <span class="layer-stack__hint" :class="`layer-stack__hint--${item.touch}`">{{ text(item).hint }}</span>
          </button>
        </li>
      </ol>

      <div class="layer-stack__doc">
        <TaoSegmented v-if="layer.files.length > 1" v-model="fileName" :legend="tr('File of the layer', 'Файл слоя')" size="small">
          <TaoSegmentedOption v-for="f in layer.files" :key="f.name" :value="f.name">{{ f.name.split('/').pop() }}</TaoSegmentedOption>
        </TaoSegmented>
        <div class="layer-stack__code">
          <div class="layer-stack__code-head">
            <span class="layer-stack__file">src/styles/{{ file.name }}</span>
            <TaoCopy :text="file.source" />
          </div>
          <pre tabindex="0" :aria-label="file.name"><code>{{ file.source }}</code></pre>
        </div>
        <p class="layer-stack__note">{{ text(layer).note }}</p>
      </div>
    </div>
  </A11yPanel>
</template>

<style scoped>
.layer-stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 16px;
}

@container (max-width: 760px) {
  .layer-stack {
    grid-template-columns: minmax(0, 1fr);
  }
}

.layer-stack__list {
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.layer-stack__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
  color: var(--tao-color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: var(--tao-transition-base);
}

.layer-stack__item:hover {
  border-color: var(--tao-color-border-strong);
}

.layer-stack__item--on {
  border-color: var(--tao-color-accent);
  background: var(--tao-color-accent-subtle);
}

.layer-stack__item:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: 2px;
}

.layer-stack__no {
  color: var(--tao-color-text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.layer-stack__body {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.layer-stack__name {
  color: var(--tao-color-text-strong);
  font-family: var(--tao-font-family-mono, monospace);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.layer-stack__role {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.layer-stack__hint {
  grid-column: 2;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.layer-stack__hint--yes {
  color: var(--tao-color-success-text);
}

.layer-stack__doc {
  display: grid;
  align-content: start;
  gap: 10px;
  min-width: 0;
}

.layer-stack__code {
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-md);
  background: var(--tao-color-bg);
  min-width: 0;
}

.layer-stack__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px 6px 14px;
  border-bottom: 1px solid var(--tao-color-border);
}

.layer-stack__file {
  color: var(--tao-color-text-muted);
  font-family: var(--tao-font-family-mono, monospace);
  font-size: 12px;
}

.layer-stack__code pre {
  max-height: 340px;
  margin: 0;
  padding: 12px 14px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  tab-size: 4;
}

.layer-stack__code pre:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: -2px;
}

.layer-stack__note {
  margin: 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}
</style>
