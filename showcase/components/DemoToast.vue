<script setup>
import { TaoButton, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoToast' })

function fireToast(kind) {
  if (kind === 'success') {
    toast().success().message(tr('Saved', 'Сохранено'))
    return
  }
  if (kind === 'error') {
    toast().danger().title(tr('Network', 'Сеть')).message(tr('No connection', 'Нет соединения'))
    return
  }
  if (kind === 'warning') {
    toast().warning().short().message(tr('The draft was not sent', 'Черновик не отправлен'))
    return
  }
  if (kind === 'info') {
    toast.info(tr('The short form works too', 'Можно вызвать и короткой формой'))
    return
  }
  if (kind === 'action') {
    toast()
      .show()
      .title(tr('File uploaded', 'Файл загружен'))
      .message(tr('Open in a new tab?', 'Открыть в новой вкладке?'))
      .action(tr('Got it', 'Понятно'), () => {})
    return
  }
  if (kind === 'undo') {
    // a snackbar: what was just done, at the bottom, with one way back / snackbar: что сделано, внизу, с одним шагом назад
    toast()
      .byBottomCenter()
      .show()
      .message(tr('Note deleted', 'Заметка удалена'))
      .action(tr('Undo', 'Отменить'), () => toast().byBottomCenter().show().short().message(tr('Note restored', 'Заметка восстановлена')))
    return
  }
  toast().byBottomRight().success().message(tr('Bottom right', 'Справа снизу'))
}

// a pretend save: 1.5 s of work, then done or failed / мнимое сохранение: 1,5 с работы, потом готово или ошибка
const work = (fail) => new Promise((resolve, reject) => setTimeout(() => (fail ? reject(new Error(tr('offline', 'нет сети'))) : resolve(3)), 1500))

function fireLoading(fail) {
  toast.promise(work(fail), {
    loading: tr('Saving…', 'Сохраняю…'),
    success: (n) => tr(`Saved ${n} notes`, `Сохранено заметок: ${n}`),
    error: (e) => tr(`Not saved: ${e.message}`, `Не сохранено: ${e.message}`),
  }).catch(() => {})
}
</script>

<template>
  <ShowcaseSection id="toast" :tables="propTables['toast']">
    <h2>toast()</h2>
          <p>{{ tr('Fluent notifications: the chain runs in a single tick, setTimeout(0) sends the display.', 'Fluent-уведомления: цепочка в одном тике, setTimeout(0) отправляет показ.') }}</p>

          <div class="button-row">
            <TaoButton variant="primary" @click="fireToast('success')">success</TaoButton>
            <TaoButton tone="danger" @click="fireToast('error')">danger</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('warning')">warning</TaoButton>
            <TaoButton variant="ghost" @click="fireToast('info')">info</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('action')">{{ tr('with a button', 'с кнопкой') }}</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('corner')">bottomRight</TaoButton>
            <TaoButton variant="secondary" tone="neutral" icon="tao-trash" @click="fireToast('undo')">{{ tr('Delete a note (undo)', 'Удалить заметку (с отменой)') }}</TaoButton>
          </div>

          <h3>{{ tr('Work in progress', 'Идёт работа') }}</h3>
          <p>{{ tr('A spinner while it runs, then the result in the same place: toast.promise, or loading() and a toast with the same id and replace().', 'Кольцо, пока идёт работа, потом результат на том же месте: toast.promise или loading() и тост с тем же id и replace().') }}</p>
          <div class="button-row">
            <TaoButton variant="secondary" @click="fireLoading(false)">{{ tr('Save', 'Сохранить') }}</TaoButton>
            <TaoButton variant="secondary" tone="danger" @click="fireLoading(true)">{{ tr('Save offline', 'Сохранить без сети') }}</TaoButton>
          </div>

          <div class="code-block">
            <pre><code>toast().success().message('{{ tr('Saved', 'Сохранено') }}')
toast().danger().title('{{ tr('Network', 'Сеть') }}').message('{{ tr('No connection', 'Нет соединения') }}')
toast.success('{{ tr('Saved', 'Сохранено') }}')

// {{ tr('a snackbar: at the bottom, with a way back', 'snackbar: внизу, с шагом назад') }}
toast().byBottomCenter().show().message('{{ tr('Note deleted', 'Заметка удалена') }}').action('{{ tr('Undo', 'Отменить') }}', undo)

toast.promise(save(), {
  loading: '{{ tr('Saving…', 'Сохраняю…') }}',
  success: (n) => `{{ tr('Saved ${n} notes', 'Сохранено заметок: ${n}') }}`,
  error: (e) => `{{ tr('Not saved: ${e.message}', 'Не сохранено: ${e.message}') }}`,
})

// {{ tr('by hand', 'вручную') }}
toast().loading().id('sync').message('{{ tr('Syncing…', 'Синхронизирую…') }}')
toast().success().id('sync').replace().message('{{ tr('Synced', 'Синхронизировано') }}')

toast.defaults({ closeLabel: 'Dismiss notification' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
