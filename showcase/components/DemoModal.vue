<script setup>
import { ref } from 'vue'
import { TaoButton, TaoModal } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoModal' })

const isModalOpen = ref(false)
</script>

<template>
  <ShowcaseSection id="modal" :tables="propTables['modal']">
    <h2>TaoModal</h2>
          <p>Модальное окно: слоты, клик по фону, Esc, ловушка фокуса. Закрывается и по крестику.</p>
          
          <TaoButton @click="isModalOpen = true" variant="primary">
            Открыть модальное окно
          </TaoButton>
    
          <TaoModal v-model="isModalOpen" title="Заголовок модального окна">
            <p>Это содержимое модального окна. Здесь можно разместить форму, текст, изображения или любые другие компоненты.</p>
            <p>Закрывается по Esc, по крестику, по кнопке внизу или по клику вне окна.</p>
            
            <template #footer>
              <TaoButton variant="secondary" @click="isModalOpen = false">Отмена</TaoButton>
              <TaoButton variant="primary" @click="isModalOpen = false">Подтвердить</TaoButton>
            </template>
          </TaoModal>
    
          <div class="code-block">
            <pre><code>&lt;TaoModal v-model="isOpen" title="Заголовок"&gt;
  &lt;p&gt;Содержимое&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;TaoButton @click="isOpen = false"&gt;Закрыть&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoModal&gt;

&lt;TaoModal v-model="isOpen" title="Title" close-label="Close"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
&lt;/TaoModal&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
