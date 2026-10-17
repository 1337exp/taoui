<script setup>
import { ref } from 'vue'
import { TaoButton, confirm } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoConfirm' })

const confirmResult = ref('')
const confirmResultText = {
  deleted: () => tr('deleted', 'удалили'),
  cancelled: () => tr('cancelled', 'отменили'),
  saved: () => tr('saved', 'сохранили'),
  later: () => tr('not now', 'не сейчас'),
}
async function fireConfirm(kind) {
  if (kind === 'danger') {
    const ok = await confirm()
      .title(tr('Delete the file?', 'Удалить файл?'))
      .message(tr('This cannot be undone.', 'Это нельзя отменить.'))
      .ok(tr('Delete', 'Удалить'))
      .danger()
    confirmResult.value = ok ? 'deleted' : 'cancelled'
    return
  }

  const ok = await confirm(tr('Save the changes?', 'Сохранить изменения?'))
    .ok(tr('Save', 'Сохранить'))
    .cancel(tr('Not now', 'Не сейчас'))
  confirmResult.value = ok ? 'saved' : 'later'
}
</script>

<template>
  <ShowcaseSection id="confirm" :tables="propTables['confirm']">
    <h2>confirm()</h2>
          <p>{{ tr('A question with an overlay. Not a toast: it waits for an answer, Esc and a click on the backdrop = cancel, you can await it.', 'Вопрос с оверлеем. Не тост: ждёт ответ, Esc и клик по фону = отмена, можно await.') }}</p>
    
          <div class="button-row">
            <TaoButton variant="primary" @click="fireConfirm('save')">{{ tr('regular', 'обычный') }}</TaoButton>
            <TaoButton variant="danger" @click="fireConfirm('danger')">{{ tr('dangerous', 'опасный') }}</TaoButton>
          </div>
          <p v-if="confirmResult" style="margin-top: 8px; font-size: 13px;">{{ tr('Answer', 'Ответ') }}: {{ confirmResultText[confirmResult]() }}</p>
    
          <div class="code-block">
            <pre><code>if (await confirm().title('{{ tr('Delete the file?', 'Удалить файл?') }}').danger()) {
  remove()
}

confirm.defaults({ ok: 'OK', cancel: 'Cancel' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
