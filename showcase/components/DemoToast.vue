<script setup>
import { TaoButton, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoToast' })

function fireToast(kind) {
  if (kind === 'success') {
    toast.success(tr('Saved', 'Сохранено'))
    return
  }
  if (kind === 'error') {
    toast.danger(tr('No connection', 'Нет соединения'), { title: tr('Network', 'Сеть') })
    return
  }
  if (kind === 'warning') {
    toast.warning(tr('The draft was not sent', 'Черновик не отправлен'), { timeout: 1000 })
    return
  }
  if (kind === 'info') {
    toast.info(tr('The short form works too', 'Можно вызвать и короткой формой'))
    return
  }
  if (kind === 'action') {
    toast.show(tr('Open in a new tab?', 'Открыть в новой вкладке?'), {
      title: tr('File uploaded', 'Файл загружен'),
      actions: [{ label: tr('Got it', 'Понятно'), onClick: () => {} }],
    })
    return
  }
  if (kind === 'undo') {
    // a snackbar: what was just done, at the bottom, with one way back / snackbar: что сделано, внизу, с одним шагом назад
    toast.show(tr('Note deleted', 'Заметка удалена'), {
      position: 'bottomCenter',
      actions: [
        {
          label: tr('Undo', 'Отменить'),
          onClick: () => toast.show(tr('Note restored', 'Заметка восстановлена'), { position: 'bottomCenter', timeout: 1000 }),
        },
      ],
    })
    return
  }
  toast.success(tr('Bottom right', 'Справа снизу'), { position: 'bottomRight' })
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
          <p>{{ tr('Notifications from one object: it shows at once and gives back a handle (id, dismiss).', 'Уведомления одним объектом: показ сразу, в ответ ручка (id, dismiss).') }}</p>

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
            <pre><code>toast({ type: 'success', message: '{{ tr('Saved', 'Сохранено') }}' })
toast.danger('{{ tr('No connection', 'Нет соединения') }}', { title: '{{ tr('Network', 'Сеть') }}' })
toast.success('{{ tr('Saved', 'Сохранено') }}')

// {{ tr('a snackbar: at the bottom, with a way back', 'snackbar: внизу, с шагом назад') }}
toast.show('{{ tr('Note deleted', 'Заметка удалена') }}', {
  position: 'bottomCenter',
  actions: [{ label: '{{ tr('Undo', 'Отменить') }}', onClick: undo }],
})

toast.promise(save(), {
  loading: '{{ tr('Saving…', 'Сохраняю…') }}',
  success: (n) => `{{ tr('Saved ${n} notes', 'Сохранено заметок: ${n}') }}`,
  error: (e) => `{{ tr('Not saved: ${e.message}', 'Не сохранено: ${e.message}') }}`,
})

// {{ tr('by hand', 'вручную') }}
const sync = toast({ id: 'sync', loading: true, message: '{{ tr('Syncing…', 'Синхронизирую…') }}' })
toast.success('{{ tr('Synced', 'Синхронизировано') }}', { id: 'sync', replace: true })
sync.dismiss() // {{ tr('closes it by hand', 'закрыть вручную') }}

toast.defaults({ closeLabel: 'Dismiss notification' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
