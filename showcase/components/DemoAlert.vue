<script setup>
import { ref } from 'vue'
import { TaoAlert } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAlert' })

const showAlert = ref(true)
</script>

<template>
  <ShowcaseSection id="alert" :tables="propTables['alert']">
    <h2>TaoAlert</h2>
          <p>Инлайн-баннер: ошибка формы, предупреждение на странице. Не тост — живёт в вёрстке.</p>
    
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px;">
            <TaoAlert tone="success" title="Сохранено">Профиль обновлён.</TaoAlert>
            <TaoAlert tone="error" title="Ошибка">Не удалось связаться с сервером.</TaoAlert>
            <TaoAlert v-if="showAlert" tone="warning" title="Черновик" closable @close="showAlert = false">
              Сохраните, прежде чем уйти.
            </TaoAlert>
            <TaoAlert tone="info">Можно вызвать и без заголовка.</TaoAlert>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoAlert tone="warning" title="Черновик" closable @close="hide"&gt;
  Сохраните, прежде чем уйти.
&lt;/TaoAlert&gt;

&lt;TaoAlert tone="warning" title="Draft" closable close-label="Dismiss" @close="hide"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
  Save before you leave.
&lt;/TaoAlert&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
