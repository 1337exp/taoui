<script setup>
import { ref } from 'vue'
import { TaoPopover, TaoButton, TaoCheckbox } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPopover' })

const popoverOpen = ref(false)
const popoverStock = ref(true)
</script>

<template>
  <ShowcaseSection id="popover" :tables="propTables['popover']">
    <h2>TaoPopover</h2>
          <Tr>
            <template #en>
              <p>
                A panel on click: any content inside. <code>v-model</code> is the open state.
                Esc and a click outside close it, near the screen edge the panel flips.
                This is not a Tooltip (that is text and hover) and not a DropdownMenu (that is a list of actions).
              </p>
            </template>
            <template #ru>
              <p>
                Панель по клику: внутри любой контент. <code>v-model</code> — открытость.
                Esc и клик снаружи закрывают, у края экрана панель переворачивается.
                Это не Tooltip (там текст и hover) и не DropdownMenu (там список действий).
              </p>
            </template>
          </Tr>
    
          <TaoPopover v-model="popoverOpen">
            <template #trigger>
              <TaoButton variant="secondary">{{ tr('Filters', 'Фильтры') }}</TaoButton>
            </template>
            <TaoCheckbox v-model="popoverStock" :label="tr('In stock only', 'Только в наличии')" />
            <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
              <TaoButton size="small" @click="popoverOpen = false">{{ tr('Done', 'Готово') }}</TaoButton>
            </div>
          </TaoPopover>
          <p style="margin-top: 8px; font-size: 13px;">{{ popoverStock ? tr('In stock', 'В наличии') : tr('All products', 'Все товары') }}</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoPopover v-model="open"&gt;
  &lt;template #trigger&gt;
    &lt;TaoButton variant="secondary"&gt;{{ tr('Filters', 'Фильтры') }}&lt;/TaoButton&gt;
  &lt;/template&gt;
  &lt;TaoCheckbox v-model="inStock" label="{{ tr('In stock only', 'Только в наличии') }}" /&gt;
&lt;/TaoPopover&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
