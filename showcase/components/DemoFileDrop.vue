<script setup>
import { ref } from 'vue'
import { TaoFileDrop, confirm } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFileDrop' })

const filesInstant = ref([])
const filesConfirm = ref([])
async function requestClearConfirm() {
  const ok = await confirm()
    .title(tr('Delete the files?', 'Удалить файлы?'))
    .message(tr('The list of uploaded files will be cleared.', 'Список загруженных файлов будет очищен.'))
    .ok(tr('Delete', 'Удалить'))
    .danger()
  if (ok) {
    filesConfirm.value = []
  }
}
</script>

<template>
  <ShowcaseSection id="filedrop" :tables="propTables['filedrop']">
    <h2>TaoFileDrop</h2>
          <Tr>
            <template #en>
              <p>
                An upload zone (drag &amp; drop + click). The text inside is a slot; by default it follows the page language.
                The names of the chosen files are a list under the zone; the cross in a row writes to
                <code>v-model</code> right away. Clearing everything is <code>show-clear</code> and <code>clear-request</code>:
                the component does not touch the array itself. <code>multiple</code> appends files instead of replacing them.
                <code>:list="false"</code> hides the list.
              </p>
            </template>
            <template #ru>
              <p>
                Зона загрузки (drag &amp; drop + клик). Текст внутри — слот, по умолчанию по-русски.
                Имена выбранных файлов — список под зоной; крестик в строке сразу пишет в
                <code>v-model</code>. Стереть всё — <code>show-clear</code> и <code>clear-request</code>:
                компонент сам массив не трогает. <code>multiple</code> дописывает файлы, а не заменяет.
                <code>:list="false"</code> прячет список.
              </p>
            </template>
          </Tr>
    
          <h3>{{ tr('Instant clearing', 'Мгновенная очистка') }}</h3>
          <TaoFileDrop
            v-model="filesInstant"
            class="demo-wide"
            multiple
            show-clear
            @clear-request="filesInstant = []"
          />
    
          <h3>{{ tr('Clearing with a confirmation', 'Очистка через подтверждение') }}</h3>
          <TaoFileDrop
            v-model="filesConfirm"
            class="demo-wide"
            show-clear
            :list="false"
            @clear-request="requestClearConfirm"
          >
            {{ tr('Drop the waybill or choose it from disk', 'Перетащите накладную или выберите с диска') }}
          </TaoFileDrop>
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Files', 'Файлов') }}: {{ filesConfirm.length }}</p>
    
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
