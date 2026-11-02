<script setup>
import { ref } from 'vue'
import { TaoAlert } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAlert' })

const showAlert = ref(true)
const logFolded = ref(true)
</script>

<template>
  <ShowcaseSection id="alert" :tables="propTables['alert']">
    <h2>TaoAlert</h2>
          <p>{{ tr('An inline banner: a form error, a warning on the page. Not a toast — it lives in the layout.', 'Инлайн-баннер: ошибка формы, предупреждение на странице. Не тост — живёт в вёрстке.') }}</p>

          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px;">
            <TaoAlert tone="success" :title="tr('Saved', 'Сохранено')">{{ tr('Profile updated.', 'Профиль обновлён.') }}</TaoAlert>
            <TaoAlert tone="danger" :title="tr('Error', 'Ошибка')">{{ tr('Could not reach the server.', 'Не удалось связаться с сервером.') }}</TaoAlert>
            <TaoAlert v-if="showAlert" tone="warning" :title="tr('Draft', 'Черновик')" closable @close="showAlert = false">
              {{ tr('Save before you leave.', 'Сохраните, прежде чем уйти.') }}
            </TaoAlert>
            <TaoAlert tone="info">{{ tr('It works without a title too.', 'Можно вызвать и без заголовка.') }}</TaoAlert>
          </div>

          <h3>{{ tr('Collapsible', 'Сворачиваемый') }}</h3>
          <p>{{ tr('The title becomes the toggle, the tone stays. Folded text stays on the page: Ctrl+F finds it and opens the alert. For an error it is kinder to start open.', 'Заголовок становится переключателем, тон остаётся. Свёрнутый текст остаётся на странице: Ctrl+F его находит и раскрывает алерт. Ошибку лучше показывать развёрнутой.') }}</p>
          <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px;">
            <TaoAlert v-model:collapsed="logFolded" collapsible tone="neutral" :title="tr('Build log: 3 warnings', 'Журнал сборки: 3 предупреждения')">
              {{ tr('chunk vendor.js is over 500 kB; the icon font is not preloaded; one image has no alt text.', 'чанк vendor.js больше 500 кБ; шрифт иконок не загружен заранее; у одной картинки нет alt.') }}
            </TaoAlert>
            <TaoAlert collapsible tone="danger" :title="tr('Payment failed', 'Оплата не прошла')">
              {{ tr('The bank declined the card. Try another card or call the bank.', 'Банк отклонил карту. Попробуйте другую карту или позвоните в банк.') }}
            </TaoAlert>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoAlert tone="warning" title="{{ tr('Draft', 'Черновик') }}" closable @close="hide"&gt;
  {{ tr('Save before you leave.', 'Сохраните, прежде чем уйти.') }}
&lt;/TaoAlert&gt;

&lt;!-- folds under its title; v-model:collapsed="true" starts folded --&gt;
&lt;TaoAlert v-model:collapsed="folded" collapsible tone="neutral" title="Build log: 3 warnings"&gt;
  chunk vendor.js is over 500 kB…
&lt;/TaoAlert&gt;

&lt;TaoAlert tone="warning" title="Draft" closable close-label="Dismiss" @close="hide"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
  Save before you leave.
&lt;/TaoAlert&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
