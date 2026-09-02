<script setup>
import { ref } from 'vue'
import { TaoButton, TaoDrawer } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDrawer' })

const isDrawerOpen = ref(false)
</script>

<template>
  <ShowcaseSection id="drawer" :tables="propTables['drawer']">
    <h2>TaoDrawer</h2>
          <p>Боковая панель: фильтры, корзина, настройки. Esc и клик по фону закрывают, фокус не уезжает на страницу.</p>
    
          <TaoButton variant="secondary" @click="isDrawerOpen = true">Открыть справа</TaoButton>
          <TaoDrawer v-model="isDrawerOpen" title="Фильтры">
            <p>Здесь могут быть поля формы. На узком экране это удобнее модалки по центру.</p>
            <template #footer>
              <TaoButton variant="secondary" @click="isDrawerOpen = false">Сбросить</TaoButton>
              <TaoButton @click="isDrawerOpen = false">Применить</TaoButton>
            </template>
          </TaoDrawer>
    
          <div class="code-block">
            <pre><code>&lt;TaoDrawer v-model="open" title="Фильтры"&gt;
      ...
    &lt;/TaoDrawer&gt;
    
    &lt;TaoDrawer v-model="open" title="Filters" close-label="Close"&gt;
      &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
    &lt;/TaoDrawer&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
