<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoTextarea } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTextarea' })

const textareaValue = ref('')
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
    
          <div class="code-block">
            <pre><code>&lt;TaoTextarea v-model="text" placeholder="Печатайте..." :maxlength="140" count /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
