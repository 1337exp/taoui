<script setup>
import { computed, ref } from 'vue'
import { TaoFormField, TaoTextarea } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTextarea' })

const textareaValue = ref('')
// the sample texts follow the page language until the visitor types their own
const variantDraft = ref(null)
const variantValue = computed({
  get: () => variantDraft.value ?? tr('A line of text', 'Строка текста'),
  set: (value) => {
    variantDraft.value = value
  },
})
const readonlyValue = computed(() =>
  tr('Read-only: you can select and copy it, but not edit it.', 'Только чтение: можно выделить и скопировать, нельзя править.'),
)
const tagValue = ref('')
</script>

<template>
  <ShowcaseSection id="textarea" :tables="propTables['textarea']">
    <h2>TaoTextarea</h2>
          <Tr>
            <template #en><p>A multi-line field with auto height. <code>maxlength</code> cuts the input, <code>count</code> shows “typed / maximum”.</p></template>
            <template #ru><p>Многострочное поле с авто-высотой. <code>maxlength</code> режет ввод, <code>count</code> показывает «введено / максимум».</p></template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField :label="tr('Comment', 'Комментарий')" :hint="tr('Optional', 'Необязательно')">
              <TaoTextarea v-model="textareaValue" :placeholder="tr('Type here...', 'Печатайте...')" :maxlength="140" count />
            </TaoFormField>
          </div>

          <h3>variant</h3>
          <Tr>
            <template #en><p><code>bar</code> (the default) — a stripe on the left, <code>outline</code> — a frame like TaoInput's, <code>filled</code> — a fill only, <code>plain</code> — no frame and no fill.</p></template>
            <template #ru><p><code>bar</code> (по умолчанию) — полоса слева, <code>outline</code> — рамка как у TaoInput, <code>filled</code> — только заливка, <code>plain</code> — без рамки и заливки.</p></template>
          </Tr>
          <div class="demo-stack">
            <TaoFormField v-for="v in ['bar', 'outline', 'filled', 'plain']" :key="v" :label="v">
              <TaoTextarea v-model="variantValue" :variant="v" :rows="2" />
            </TaoFormField>
          </div>

          <h3>readonly / no-space</h3>
          <div class="demo-stack">
            <TaoFormField label="readonly">
              <TaoTextarea v-model="readonlyValue" readonly :rows="2" />
            </TaoFormField>
            <TaoFormField label="no-space" :hint="tr('A space cannot be typed or pasted', 'Пробел не вводится ни с клавиатуры, ни вставкой')">
              <TaoTextarea v-model="tagValue" no-space :rows="1" :placeholder="tr('slug-without-spaces', 'slug-bez-probelov')" />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTextarea v-model="text" placeholder="{{ tr('Type here...', 'Печатайте...') }}" :maxlength="140" count /&gt;
&lt;TaoTextarea v-model="text" variant="outline" /&gt;
&lt;TaoTextarea v-model="text" readonly /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
