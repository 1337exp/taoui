<script setup>
import { TaoTooltip, TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTooltip' })
</script>

<template>
  <ShowcaseSection id="tooltip" :tables="propTables['tooltip']">
    <h2>TaoTooltip</h2>
          <Tr>
            <template #en>
              <p>
                A hint on hover and focus. The side is <code>top</code> / <code>bottom</code> /
                <code>left</code> / <code>right</code>. If it does not fit, it flips and sticks to the screen edge.
              </p>
            </template>
            <template #ru>
              <p>
                Подсказка при наведении и фокусе. Сторона — <code>top</code> / <code>bottom</code> /
                <code>left</code> / <code>right</code>. Если не влезает, переворачивается и прижимается к краю экрана.
              </p>
            </template>
          </Tr>
          
          <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
            <TaoTooltip :content="tr('A hint on top', 'Подсказка сверху')" position="top">
              <TaoButton variant="secondary">Top</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint below', 'Подсказка снизу')" position="bottom">
              <TaoButton variant="secondary">Bottom</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint on the left', 'Подсказка слева')" position="left">
              <TaoButton variant="secondary">Left</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint on the right', 'Подсказка справа')" position="right">
              <TaoButton variant="secondary">Right</TaoButton>
            </TaoTooltip>
          </div>
    
          <div style="display: flex; justify-content: space-between; margin-top: 16px;">
            <TaoTooltip :content="tr('No room on the left — it opens on the right', 'Слева некуда — откроется справа')" position="left">
              <TaoButton variant="secondary" size="small">{{ tr('At the left edge', 'У левого края') }}</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('No room on the right — it opens on the left', 'Справа некуда — откроется слева')" position="right">
              <TaoButton variant="secondary" size="small">{{ tr('At the right edge', 'У правого края') }}</TaoButton>
            </TaoTooltip>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTooltip content="{{ tr('Hint text', 'Текст подсказки') }}" position="top"&gt;
  &lt;TaoButton&gt;{{ tr('Hover me', 'Наведи на меня') }}&lt;/TaoButton&gt;
&lt;/TaoTooltip&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
