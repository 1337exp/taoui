<script setup>
import { ref } from 'vue'
import { TaoButton, TaoModal } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoModal' })

const isModalOpen = ref(false)
const fullscreen = ref(false)
const surface = ref('flat')
const long = ref(false)

function open(value, options = {}) {
  fullscreen.value = value
  surface.value = options.surface ?? 'flat'
  long.value = Boolean(options.long)
  isModalOpen.value = true
}
</script>

<template>
  <ShowcaseSection id="modal" :tables="propTables['modal']">
    <h2>TaoModal</h2>
          <p>{{ tr('A modal window: slots, click on the backdrop, Esc, a focus trap. It also closes with the cross.', 'Модальное окно: слоты, клик по фону, Esc, ловушка фокуса. Закрывается и по крестику.') }}</p>
          
          <div class="button-row">
            <TaoButton variant="primary" @click="open(false)">{{ tr('Open the modal', 'Открыть модальное окно') }}</TaoButton>
            <TaoButton variant="secondary" @click="open('narrow')">{{ tr('Full screen on a phone', 'Во весь экран на телефоне') }}</TaoButton>
            <TaoButton variant="secondary" @click="open(true)">{{ tr('Always full screen', 'Всегда во весь экран') }}</TaoButton>
            <TaoButton variant="secondary" @click="open(false, { surface: 'grain', long: true })">{{ tr('Grain, long text', 'Зерно, длинный текст') }}</TaoButton>
          </div>
          <p>{{ tr('The content scrolls, not the window: the header and the footer stay. surface="grain" or "glass" makes the panel of grain or glass; class and attributes go to the panel.', 'Прокручивается содержимое, а не окно: шапка и подвал на месте. surface="grain" или "glass" делает панель из зерна или стекла; класс и атрибуты уходят на панель.') }}</p>
    
          <TaoModal v-model="isModalOpen" :fullscreen="fullscreen" :surface="surface" :title="tr('Modal title', 'Заголовок модального окна')">
            <template v-if="long">
              <p v-for="n in 14" :key="n">{{ tr('A paragraph of a long note, to scroll under the footer.', 'Абзац длинной заметки, чтобы прокрутить его под подвалом.') }} {{ n }}</p>
            </template>
            <p>{{ tr('This is the content of the modal. You can put a form, text, images or any other components here.', 'Это содержимое модального окна. Здесь можно разместить форму, текст, изображения или любые другие компоненты.') }}</p>
            <p>{{ tr('It closes with Esc, the cross, the button below or a click outside the window.', 'Закрывается по Esc, по крестику, по кнопке внизу или по клику вне окна.') }}</p>
            
            <template #footer>
              <TaoButton variant="secondary" @click="isModalOpen = false">{{ tr('Cancel', 'Отмена') }}</TaoButton>
              <TaoButton variant="primary" @click="isModalOpen = false">{{ tr('Confirm', 'Подтвердить') }}</TaoButton>
            </template>
          </TaoModal>
    
          <div class="code-block">
            <pre><code>&lt;TaoModal v-model="isOpen" title="{{ tr('Title', 'Заголовок') }}"&gt;
  &lt;p&gt;{{ tr('Content', 'Содержимое') }}&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;TaoButton @click="isOpen = false"&gt;{{ tr('Close', 'Закрыть') }}&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoModal&gt;

&lt;TaoModal v-model="isOpen" fullscreen="narrow" title="Title"&gt;   &lt;!-- a page on a phone --&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
&lt;/TaoModal&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
