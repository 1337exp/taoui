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
    toast().error().title(tr('Network', 'Сеть')).message(tr('No connection', 'Нет соединения'))
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
  toast().byBottomRight().success().message(tr('Bottom right', 'Справа снизу'))
}
</script>

<template>
  <ShowcaseSection id="toast" :tables="propTables['toast']">
    <h2>toast()</h2>
          <p>{{ tr('Fluent notifications: the chain runs in a single tick, setTimeout(0) sends the display.', 'Fluent-уведомления: цепочка в одном тике, setTimeout(0) отправляет показ.') }}</p>
    
          <div class="button-row">
            <TaoButton variant="primary" @click="fireToast('success')">success</TaoButton>
            <TaoButton variant="danger" @click="fireToast('error')">error</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('warning')">warning</TaoButton>
            <TaoButton variant="ghost" @click="fireToast('info')">info</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('action')">{{ tr('with a button', 'с кнопкой') }}</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('corner')">bottomRight</TaoButton>
          </div>
    
          <div class="code-block">
            <pre><code>toast().success().message('{{ tr('Saved', 'Сохранено') }}')
toast().error().title('{{ tr('Network', 'Сеть') }}').message('{{ tr('No connection', 'Нет соединения') }}')
toast.success('{{ tr('Saved', 'Сохранено') }}')

toast.defaults({ closeLabel: 'Dismiss notification' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
