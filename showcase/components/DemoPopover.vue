<script setup>
import { ref } from 'vue'
import { TaoPopover, TaoButton, TaoCheckbox } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPopover' })

const popoverOpen = ref(false)
const popoverStock = ref(true)
</script>

<template>
  <ShowcaseSection id="popover" :tables="propTables['popover']">
    <h2>TaoPopover</h2>
          <p>
            Панель по клику: внутри любой контент. <code>v-model</code> — открытость.
            Esc и клик снаружи закрывают, у края экрана панель переворачивается.
            Это не Tooltip (там текст и hover) и не DropdownMenu (там список действий).
          </p>
    
          <TaoPopover v-model="popoverOpen">
            <template #trigger>
              <TaoButton variant="secondary">Фильтры</TaoButton>
            </template>
            <TaoCheckbox v-model="popoverStock" label="Только в наличии" />
            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
              <TaoButton size="small" @click="popoverOpen = false">Готово</TaoButton>
            </div>
          </TaoPopover>
          <p style="margin-top: 8px; font-size: 13px;">{{ popoverStock ? 'В наличии' : 'Все товары' }}</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoPopover v-model="open"&gt;
      &lt;template #trigger&gt;
        &lt;TaoButton variant="secondary"&gt;Фильтры&lt;/TaoButton&gt;
      &lt;/template&gt;
      &lt;TaoCheckbox v-model="inStock" label="Только в наличии" /&gt;
    &lt;/TaoPopover&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
