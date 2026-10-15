<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoTextarea } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTextarea' })

const textareaValue = ref('')
const variantValue = ref('Строка текста')
const readonlyValue = ref('Только чтение: можно выделить и скопировать, нельзя править.')
const tagValue = ref('')
</script>

<template>
  <ShowcaseSection id="textarea" :tables="propTables['textarea']">
    <h2>TaoTextarea</h2>
          <p>Многострочное поле с авто-высотой. <code>maxlength</code> режет ввод, <code>count</code> показывает «введено / максимум».</p>
    
          <div class="demo-stack">
            <TaoFormField label="Комментарий" hint="Необязательно">
              <TaoTextarea v-model="textareaValue" placeholder="Печатайте..." :maxlength="140" count />
            </TaoFormField>
          </div>

          <h3>variant</h3>
          <p><code>bar</code> (по умолчанию) — полоса слева, <code>outline</code> — рамка как у TaoInput, <code>filled</code> — только заливка, <code>plain</code> — без рамки и заливки.</p>
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
            <TaoFormField label="no-space" hint="Пробел не вводится ни с клавиатуры, ни вставкой">
              <TaoTextarea v-model="tagValue" no-space :rows="1" placeholder="slug-bez-probelov" />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTextarea v-model="text" placeholder="Печатайте..." :maxlength="140" count /&gt;
&lt;TaoTextarea v-model="text" variant="outline" /&gt;
&lt;TaoTextarea v-model="text" readonly /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
