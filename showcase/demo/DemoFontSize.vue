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
          A field made of two parts: a <code>TaoCombobox</code> (pick from the list or type a number) and a pair of
          arrows beside it, as in an editor. The arrows walk a ring: from <b>Auto</b> «down» goes to 64 and on to 4, «up»
          goes the other way, 4 … 64, and from 64 «up» once more is <b>Auto</b> again. The list opens whole over a picked
          value. This is what the demo proves: a field the kit has no component for is a few lines on its public API.
          The file can be copied into a project.
        </p>
      </template>
      <template #ru>
        <p>
          Поле из двух деталей: <code>TaoCombobox</code> (выбрать из списка или набрать число) и пара стрелок рядом, как в
          редакторе. Стрелки ходят по кольцу: с <b>Auto</b> «вниз» уходит на 64 и дальше к 4, «вверх» идёт в другую сторону,
          4 … 64, а с 64 ещё одно «вверх» — снова <b>Auto</b>. Список открывается целиком поверх выбранного значения. Демо
          доказывает: поле, под которое в наборе нет компонента, — несколько строк на публичном API. Файл можно
          скопировать в проект.
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
