<script setup>
import { ref } from 'vue'
import { TaoAlert } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAlert' })

const showAlert = ref(true)
</script>

<template>
  <ShowcaseSection id="alert" :tables="propTables['alert']">
    <h2>TaoAlert</h2>
          <p>{{ tr('An inline banner: a form error, a warning on the page. Not a toast — it lives in the layout.', 'Инлайн-баннер: ошибка формы, предупреждение на странице. Не тост — живёт в вёрстке.') }}</p>

          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px;">
            <TaoAlert tone="success" :title="tr('Saved', 'Сохранено')">{{ tr('Profile updated.', 'Профиль обновлён.') }}</TaoAlert>
            <TaoAlert tone="error" :title="tr('Error', 'Ошибка')">{{ tr('Could not reach the server.', 'Не удалось связаться с сервером.') }}</TaoAlert>
            <TaoAlert v-if="showAlert" tone="warning" :title="tr('Draft', 'Черновик')" closable @close="showAlert = false">
              {{ tr('Save before you leave.', 'Сохраните, прежде чем уйти.') }}
            </TaoAlert>
            <TaoAlert tone="info">{{ tr('It works without a title too.', 'Можно вызвать и без заголовка.') }}</TaoAlert>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoAlert tone="warning" title="{{ tr('Draft', 'Черновик') }}" closable @close="hide"&gt;
  {{ tr('Save before you leave.', 'Сохраните, прежде чем уйти.') }}
&lt;/TaoAlert&gt;

&lt;TaoAlert tone="warning" title="Draft" closable close-label="Dismiss" @close="hide"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
  Save before you leave.
&lt;/TaoAlert&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
