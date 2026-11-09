<script setup>
import { computed, ref } from 'vue'
import FontSizeField from './FontSizeField.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import Tr from '../components/Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFontSize' })

const size = ref('auto')
// Auto is what the page would use without a choice / Auto — то, что страница взяла бы без выбора
const sampleStyle = computed(() => (size.value === 'auto' ? {} : { fontSize: `${size.value}px` }))
</script>

<template>
  <ShowcaseSection id="font-size" :tables="propTables['font-size']">
    <h2>{{ tr('Font size field', 'Поле размера шрифта') }} ({{ tr('demo, not in the package', 'демо, не в пакете') }})</h2>
    <Tr>
      <template #en>
        <p>
          A field made of three parts, as in an editor: a compact <code>TaoInput</code>, a block of two arrows beside it and
          a small pop-up with the sizes. The pop-up is not a dropdown: it is narrow, centred under the input, and the input
          keeps the focus, so typing a number (Enter) and the arrow keys work while it is open. The arrows walk a ring:
          from <b>Auto</b> «down» goes to 64 and on to 4, «up» goes the other way, 4 … 64, and from 64 «up» once more is
          <b>Auto</b> again. This is what the demo proves: a field the kit has no component for is one file on its public
          API. The file can be copied into a project.
        </p>
      </template>
      <template #ru>
        <p>
          Поле из трёх деталей, как в редакторе: компактный <code>TaoInput</code>, блок из двух стрелок рядом и маленькое
          всплывающее окно с размерами. Окно — не выпадающий список: оно узкое, по центру под полем, а фокус остаётся в поле,
          поэтому набор числа (Enter) и стрелки на клавиатуре работают при открытом окне. Стрелки ходят по кольцу: с
          <b>Auto</b> «вниз» уходит на 64 и дальше к 4, «вверх» идёт в другую сторону, 4 … 64, а с 64 ещё одно «вверх» —
          снова <b>Auto</b>. Демо доказывает: поле, под которое в наборе нет компонента, — один файл на публичном API.
          Файл можно скопировать в проект.
        </p>
      </template>
    </Tr>

    <div class="demo-stack">
      <FontSizeField v-model="size" />
      <p class="font-size-sample" :style="sampleStyle">
        {{ tr('The quick brown fox jumps over the lazy dog.', 'Съешь же ещё этих мягких французских булок.') }}
      </p>
    </div>

    <div class="code-block">
      <pre><code>&lt;FontSizeField v-model="size" /&gt;   &lt;!-- 'auto' or a number --&gt;

&lt;FontSizeField v-model="size" :sizes="[8, 12, 16, 24]" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-stack {
  display: grid;
  gap: var(--tao-space-3);
  justify-items: start;
}

.font-size-sample {
  margin: 0;
  color: var(--tao-color-text);
  overflow-wrap: anywhere;
}
</style>
