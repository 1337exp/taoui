<script setup>
import { TaoButton, toast } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoToast' })

function fireToast(kind) {
  if (kind === 'success') {
    toast().success().message('Сохранено')
    return
  }
  if (kind === 'error') {
    toast().error().title('Сеть').message('Нет соединения')
    return
  }
  if (kind === 'warning') {
    toast().warning().short().message('Черновик не отправлен')
    return
  }
  if (kind === 'info') {
    toast.info('Можно вызвать и короткой формой')
    return
  }
  if (kind === 'action') {
    toast()
      .show()
      .title('Файл загружен')
      .message('Открыть в новой вкладке?')
      .action('Понятно', () => {})
    return
  }
  toast().byBottomRight().success().message('Справа снизу')
}
</script>

<template>
  <ShowcaseSection id="toast" :tables="propTables['toast']">
    <h2>toast()</h2>
          <p>Fluent-уведомления: цепочка в одном тике, setTimeout(0) отправляет показ.</p>
    
          <div class="button-row">
            <TaoButton variant="primary" @click="fireToast('success')">success</TaoButton>
            <TaoButton variant="danger" @click="fireToast('error')">error</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('warning')">warning</TaoButton>
            <TaoButton variant="ghost" @click="fireToast('info')">info</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('action')">с кнопкой</TaoButton>
            <TaoButton variant="secondary" @click="fireToast('corner')">bottomRight</TaoButton>
          </div>
    
          <div class="code-block">
            <pre><code>toast().success().message('Сохранено')
    toast().error().title('Сеть').message('Нет соединения')
    toast.success('Сохранено')
    
    toast.defaults({ closeLabel: 'Dismiss notification' })</code></pre>
          </div>
  </ShowcaseSection>
</template>
