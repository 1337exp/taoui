<script setup>
import { TaoTooltip, TaoButton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTooltip' })
</script>

<template>
  <ShowcaseSection id="tooltip" :tables="propTables['tooltip']">
    <h2>TaoTooltip</h2>
          <p>
            Подсказка при наведении и фокусе. Сторона — <code>top</code> / <code>bottom</code> /
            <code>left</code> / <code>right</code>. Если не влезает, переворачивается и прижимается к краю экрана.
          </p>
          
          <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
            <TaoTooltip content="Подсказка сверху" position="top">
              <TaoButton variant="secondary">Top</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip content="Подсказка снизу" position="bottom">
              <TaoButton variant="secondary">Bottom</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip content="Подсказка слева" position="left">
              <TaoButton variant="secondary">Left</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip content="Подсказка справа" position="right">
              <TaoButton variant="secondary">Right</TaoButton>
            </TaoTooltip>
          </div>
    
          <div style="display: flex; justify-content: space-between; margin-top: 16px;">
            <TaoTooltip content="Слева некуда — откроется справа" position="left">
              <TaoButton variant="secondary" size="small">У левого края</TaoButton>
            </TaoTooltip>
            <TaoTooltip content="Справа некуда — откроется слева" position="right">
              <TaoButton variant="secondary" size="small">У правого края</TaoButton>
            </TaoTooltip>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTooltip content="Текст подсказки" position="top"&gt;
  &lt;TaoButton&gt;Наведи на меня&lt;/TaoButton&gt;
&lt;/TaoTooltip&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
