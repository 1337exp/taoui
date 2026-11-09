<script setup>
import { computed, ref } from 'vue'
import { TaoPresetInput, TaoTooltip } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPresetInput' })

// the font size of an editor: Auto, then the sizes; Auto is what an empty field means
// размер шрифта в редакторе: Авто, затем размеры; Авто — то, что значит пустое поле
const sizes = computed(() => [
  { value: 'auto', label: tr('Auto', 'Авто'), default: true },
  ...[4, 8, 10, 12, 14, 18, 24, 32, 48, 64].map((size) => ({ value: size, label: String(size) })),
])
const size = ref('auto')
const sizeLoop = ref(14)
const sizeOutline = ref(12)
const sizeSmall = ref(12)
const sizeLarge = ref(12)
const sample = computed(() => (size.value === 'auto' ? {} : { fontSize: `${size.value}px` }))

// a zoom: the labels carry the unit, only the presets are values / масштаб: подписи с единицей, значения — только заготовки
const zooms = [25, 50, 75, 100, 150, 200].map((zoom) => ({ value: zoom, label: `${zoom}%` }))
const zoom = ref(100)
</script>

<template>
  <ShowcaseSection id="preset-input" :tables="propTables['preset-input']">
    <h2>TaoPresetInput</h2>
    <Tr>
      <template #en>
        <p>
          A field with presets, as in an editor: an input, a block of two arrows beside it and a narrow pop-up with the
          values. The input and the arrows read as one piece, and the frame shows only while the field is edited. The
          pop-up is not a dropdown: it is centred under the input and the input keeps the focus, so typing a number and
          the keys work while it is open. <b>Tab</b> applies the text and goes on, it does not walk the list.
        </p>
        <p>
          The arrows walk the line in the order of <code>options</code>: «up» is the next one, «down» the previous one.
          The option with <code>default</code> is what an empty field means («Auto»): the pop-up shows it first, and the
          arrows reach it after the last one, where the line ends. With <code>loop</code> the line is a ring. A whole
          number typed by hand is a value too (<code>custom</code>, between <code>min</code> and <code>max</code>), and the
          arrows then go to the nearest preset. Keys: <kbd>↑</kbd> <kbd>↓</kbd> step, <kbd>Home</kbd> <kbd>End</kbd> go to
          the ends, <kbd>Enter</kbd> applies, <kbd>Esc</kbd> throws the text away.
        </p>
      </template>
      <template #ru>
        <p>
          Поле с заготовками, как в редакторе: поле ввода, рядом блок из двух стрелок и узкое окно со значениями. Поле и
          стрелки читаются как одно целое, а рамка видна только пока поле правят. Окно — не выпадающий список: оно по центру
          под полем, а фокус остаётся в поле, поэтому набор числа и клавиши работают при открытом окне. <b>Tab</b>
          применяет текст и идёт дальше, по списку он не ходит.
        </p>
        <p>
          Стрелки ходят по линии в порядке <code>options</code>: «вверх» — следующее, «вниз» — предыдущее. Пункт с
          <code>default</code> — то, что значит пустое поле («Авто»): окно показывает его первым, а стрелки доходят до него
          после последнего, и там линия кончается. С <code>loop</code> линия — кольцо. Целое число, набранное руками, тоже
          значение (<code>custom</code>, между <code>min</code> и <code>max</code>), а стрелки идут тогда к ближайшей
          заготовке. Клавиши: <kbd>↑</kbd> <kbd>↓</kbd> шагают, <kbd>Home</kbd> <kbd>End</kbd> — на концы, <kbd>Enter</kbd>
          применяет, <kbd>Esc</kbd> выбрасывает текст.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('Font size', 'Размер шрифта') }}</h3>
    <div class="preset-row">
      <TaoTooltip :content="tr('Font size', 'Размер шрифта')">
        <TaoPresetInput v-model="size" :options="sizes" :aria-label="tr('Font size', 'Размер шрифта')" />
      </TaoTooltip>
      <span class="preset-note">{{ tr('a line: Auto and 4 are the ends', 'линия: Авто и 4 — концы') }}</span>
    </div>
    <p class="preset-sample" :style="sample">{{ tr('The quick brown fox jumps over the lazy dog.', 'Съешь же ещё этих мягких французских булок.') }}</p>

    <h3>loop</h3>
    <div class="preset-row">
      <TaoPresetInput v-model="sizeLoop" :options="sizes" loop :aria-label="tr('Font size', 'Размер шрифта')" />
      <span class="preset-note">{{ tr('a ring: the arrows go on past the ends', 'кольцо: стрелки идут дальше концов') }}</span>
    </div>

    <h3>{{ tr('Only the presets: a zoom', 'Только заготовки: масштаб') }}</h3>
    <div class="preset-row">
      <TaoPresetInput v-model="zoom" :options="zooms" :custom="false" :aria-label="tr('Zoom', 'Масштаб')" style="--tao-preset-input-width: 5.5rem" />
      <span class="preset-note">{{ tr('custom off: a typed number that is not a preset goes back', 'custom выключен: набранное число вне заготовок возвращается') }}</span>
    </div>

    <h3>{{ tr('Variants and sizes', 'Виды и размеры') }}</h3>
    <div class="preset-row">
      <TaoPresetInput v-model="sizeOutline" :options="sizes" variant="outline" :aria-label="tr('Font size', 'Размер шрифта')" />
      <TaoPresetInput v-model="sizeSmall" :options="sizes" size="small" :aria-label="tr('Font size', 'Размер шрифта')" />
      <TaoPresetInput v-model="sizeLarge" :options="sizes" size="large" :aria-label="tr('Font size', 'Размер шрифта')" />
      <TaoPresetInput :model-value="12" :options="sizes" disabled :aria-label="tr('Font size', 'Размер шрифта')" />
    </div>

    <div class="code-block">
      <pre><code>&lt;script setup&gt;
const sizes = [
  { value: 'auto', label: 'Auto', default: true },   // the empty field, shown first, the end of the arrows
  ...[4, 8, 10, 12, 14, 18, 24, 32, 48, 64].map((s) =&gt; ({ value: s, label: String(s) })),
]
const size = ref('auto')
&lt;/script&gt;

&lt;TaoTooltip content="Font size"&gt;
  &lt;TaoPresetInput v-model="size" :options="sizes" aria-label="Font size" /&gt;
&lt;/TaoTooltip&gt;

&lt;!-- the arrows go round --&gt;
&lt;TaoPresetInput v-model="size" :options="sizes" loop aria-label="Font size" /&gt;

&lt;!-- only the presets are values; the width of the input is a CSS variable --&gt;
&lt;TaoPresetInput v-model="zoom" :options="zooms" :custom="false" style="--tao-preset-input-width: 5.5rem" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.preset-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tao-space-3);
  margin: var(--tao-space-2) 0;
}

.preset-note {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}

.preset-sample {
  margin: var(--tao-space-2) 0 0;
  overflow-wrap: anywhere;
}
</style>
