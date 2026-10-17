<script setup>
import { ref } from 'vue'
import { colorModel, TaoColorInput, TaoColorPicker } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoColor' })

const swatches = ['#ff5252', '#ff9800', '#ffd740', '#69f0ae', '#40c4ff', '#7c4dff', '#e040fb', '#ffffff', '#9e9e9e', '#000000']
const color = ref('#ff8800')
const mode = ref('rgb')
const withAlpha = ref('#40c4ff80')
const inline = ref('#7c4dff')

// Own storage: an object 0…255 and a linear array 0…1
const rgb = ref({ r: 255, g: 136, b: 0 })
const rgbHex = colorModel(rgb)
const linear = ref([1, 0.2, 0.05])
const linearHex = colorModel(linear, { format: 'array', range: 1, space: 'linear' })
</script>

<template>
  <ShowcaseSection id="color" :tables="propTables['color']">
    <h2>TaoColorPicker / TaoColorInput</h2>
    <Tr>
      <template #en><p>A palette: a saturation and brightness square, hue and opacity strips, a hex field, swatches, an eyedropper (where the browser supports <code>EyeDropper</code>). The value is a hex string (<code>#rrggbb</code>, and with <code>alpha</code> also <code>#rrggbbaa</code>). <code>TaoColorInput</code> is a field with a swatch; the palette opens in a popup. For your own storage (an object, an array, css, 0…255 or 0…1, linear colour) there is <code>colorModel</code>.</p></template>
      <template #ru><p>Палитра: квадрат насыщенности и яркости, полосы оттенка и прозрачности, поле hex, образцы, пипетка (где браузер умеет <code>EyeDropper</code>). Значение — строка hex (<code>#rrggbb</code>, а с <code>alpha</code> ещё <code>#rrggbbaa</code>). <code>TaoColorInput</code> — поле с образцом, палитра открывается во всплывающем окне. Для своего хранилища (объект, массив, css, 0…255 или 0…1, линейный цвет) есть <code>colorModel</code>.</p></template>
    </Tr>

    <h3>TaoColorInput</h3>
    <div class="demo-row">
      <TaoColorInput v-model="color" :swatches="swatches" />
      <TaoColorInput v-model="color" size="small" :swatches="swatches" />
      <TaoColorInput v-model="withAlpha" alpha :swatches="swatches" />
    </div>
    <p style="margin-top: 4px; font-size: 13px;">{{ color }} · {{ withAlpha }}</p>

    <h3>TaoColorPicker</h3>
    <TaoColorPicker v-model="inline" v-model:mode="mode" :swatches="swatches" />
    <p style="margin-top: 4px; font-size: 13px;">{{ tr('Input mode', 'Способ ввода') }}: {{ mode }} — {{ tr('a HEX / RGB / HSL switch, the choice is kept through v-model:mode', 'переключатель HEX / RGB / HSL, выбор запоминается через v-model:mode') }}</p>

    <h3>colorModel</h3>
    <div class="demo-row">
      <TaoColorInput v-model="rgbHex" size="small" />
      <TaoColorInput v-model="linearHex" size="small" />
    </div>
    <p style="margin-top: 4px; font-size: 13px;">{{ rgb }} · {{ linear }}</p>

    <div class="code-block">
      <pre><code>&lt;TaoColorInput v-model="color" :swatches="swatches" /&gt;
&lt;TaoColorInput v-model="color" alpha /&gt;
&lt;TaoColorPicker v-model="color" /&gt;

// {{ tr('own storage', 'свои хранилища') }}
const hex = colorModel(rgb)                                                       // { r, g, b } 0…255
const hex = colorModel(linear, { format: 'array', range: 1, space: 'linear' })    // [r, g, b] 0…1 {{ tr('linear', 'линейный') }}</code></pre>
    </div>
  </ShowcaseSection>
</template>
