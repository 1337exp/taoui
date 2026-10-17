<script setup>
import { ref } from 'vue'
import { TaoButton, TaoModal } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoModal' })

const isModalOpen = ref(false)
</script>

<template>
  <ShowcaseSection id="modal" :tables="propTables['modal']">
    <h2>TaoModal</h2>
          <p>{{ tr('A modal window: slots, click on the backdrop, Esc, a focus trap. It also closes with the cross.', 'Модальное окно: слоты, клик по фону, Esc, ловушка фокуса. Закрывается и по крестику.') }}</p>
          
          <TaoButton @click="isModalOpen = true" variant="primary">
            {{ tr('Open the modal', 'Открыть модальное окно') }}
          </TaoButton>
    
          <TaoModal v-model="isModalOpen" :title="tr('Modal title', 'Заголовок модального окна')">
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

&lt;TaoModal v-model="isOpen" title="Title" close-label="Close"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
&lt;/TaoModal&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
