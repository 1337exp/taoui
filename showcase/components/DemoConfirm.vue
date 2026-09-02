<script setup>
import { ref } from 'vue'
import { TaoButton, confirm } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoConfirm' })

const confirmResult = ref('')
async function fireConfirm(kind) {
  if (kind === 'danger') {
    const ok = await confirm()
      .title('Удалить файл?')
      .message('Это нельзя отменить.')
      .ok('Удалить')
      .danger()
    confirmResult.value = ok ? 'удалили' : 'отменили'
    return
  }

  const ok = await confirm('Сохранить изменения?').ok('Сохранить').cancel('Не сейчас')
  confirmResult.value = ok ? 'сохранили' : 'не сейчас'
}
</script>

<template>
  <ShowcaseSection id="confirm" :tables="propTables['confirm']">
    <h2>confirm()</h2>
          <p>Вопрос с оверлеем. Не тост: ждёт ответ, Esc и клик по фону = отмена, можно await.</p>
    
          <div class="button-row">
            <TaoButton variant="primary" @click="fireConfirm('save')">обычный</TaoButton>
            <TaoButton variant="danger" @click="fireConfirm('danger')">опасный</TaoButton>
          </div>
          <p v-if="confirmResult" style="margin-top: 8px; font-size: 13px;">Ответ: {{ confirmResult }}</p>
    
          <div class="code-block">
            <pre><code>if (await confirm().title('Удалить файл?').danger()) {
  remove()
}

confirm.defaults({ ok: 'OK', cancel: 'Cancel' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
