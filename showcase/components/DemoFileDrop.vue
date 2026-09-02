<script setup>
import { ref } from 'vue'
import { TaoFileDrop, confirm } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFileDrop' })

const filesInstant = ref([])
const filesConfirm = ref([])
async function requestClearConfirm() {
  const ok = await confirm()
    .title('Удалить файлы?')
    .message('Список загруженных файлов будет очищен.')
    .ok('Удалить')
    .danger()
  if (ok) {
    filesConfirm.value = []
  }
}
</script>

<template>
  <ShowcaseSection id="filedrop" :tables="propTables['filedrop']">
    <h2>TaoFileDrop</h2>
          <p>
            Зона загрузки (drag &amp; drop + клик). Текст внутри — слот, по умолчанию по-русски.
            Имена выбранных файлов — список под зоной; крестик в строке сразу пишет в
            <code>v-model</code>. Стереть всё — <code>show-clear</code> и <code>clear-request</code>:
            компонент сам массив не трогает. <code>multiple</code> дописывает файлы, а не заменяет.
            <code>:list="false"</code> прячет список.
          </p>
    
          <h3>Мгновенная очистка</h3>
          <TaoFileDrop
            v-model="filesInstant"
            class="demo-wide"
            multiple
            show-clear
            @clear-request="filesInstant = []"
          />
    
          <h3>Очистка через подтверждение</h3>
          <TaoFileDrop
            v-model="filesConfirm"
            class="demo-wide"
            show-clear
            :list="false"
            @clear-request="requestClearConfirm"
          >
            Перетащите накладную или выберите с диска
          </TaoFileDrop>
          <p style="margin-top: 4px; font-size: 13px;">Файлов: {{ filesConfirm.length }}</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoFileDrop v-model="files" multiple show-clear @clear-request="files = []" /&gt;
    
    &lt;TaoFileDrop
      v-model="files"
      show-clear
      clear-label="Clear files"
      remove-label="Remove “{name}”"
      @clear-request="onClear"
    &gt;
      Drop a file here or click to browse
      &lt;template #clear-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
      &lt;template #remove-icon&gt;&lt;TaoIcon name="trash" /&gt;&lt;/template&gt;
    &lt;/TaoFileDrop&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
