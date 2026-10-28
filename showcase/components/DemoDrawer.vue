<script setup>
import { ref } from 'vue'
import { TaoButton, TaoDrawer } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDrawer' })

const isDrawerOpen = ref(false)
const side = ref('right')

function open(value) {
  side.value = value
  isDrawerOpen.value = true
}
</script>

<template>
  <ShowcaseSection id="drawer" :tables="propTables['drawer']">
    <h2>TaoDrawer</h2>
          <p>{{ tr('A side panel: filters, a cart, settings. Esc and a click on the backdrop close it, the focus does not escape to the page.', 'Боковая панель: фильтры, корзина, настройки. Esc и клик по фону закрывают, фокус не уезжает на страницу.') }}</p>
    
          <div class="button-row">
            <TaoButton variant="secondary" @click="open('right')">{{ tr('Open on the right', 'Открыть справа') }}</TaoButton>
            <TaoButton variant="secondary" @click="open('bottom')">{{ tr('Open a bottom sheet', 'Открыть нижний лист') }}</TaoButton>
          </div>
          <TaoDrawer v-model="isDrawerOpen" :side="side" :title="tr('Filters', 'Фильтры')">
            <p>{{ tr('Form fields can go here. On a narrow screen this is handier than a centred modal.', 'Здесь могут быть поля формы. На узком экране это удобнее модалки по центру.') }}</p>
            <template #footer>
              <TaoButton variant="secondary" @click="isDrawerOpen = false">{{ tr('Reset', 'Сбросить') }}</TaoButton>
              <TaoButton @click="isDrawerOpen = false">{{ tr('Apply', 'Применить') }}</TaoButton>
            </template>
          </TaoDrawer>
    
          <div class="code-block">
            <pre><code>&lt;TaoDrawer v-model="open" title="{{ tr('Filters', 'Фильтры') }}"&gt;
  ...
&lt;/TaoDrawer&gt;

&lt;TaoDrawer v-model="open" side="bottom" title="Filters"&gt;   &lt;!-- a sheet from the bottom --&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
&lt;/TaoDrawer&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
