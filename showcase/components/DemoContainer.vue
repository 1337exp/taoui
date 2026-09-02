<script setup>
import { TaoContainer } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoContainer' })
</script>

<template>
  <ShowcaseSection id="container" :tables="propTables['container']">
    <h2>TaoContainer</h2>
          <p>Ограничение ширины контента с авто-центровкой (wide / slim / ultra-slim)</p>
    
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <TaoContainer size="ultra-slim" style="background: var(--tao-color-surface-sunken); padding: 8px; border-radius: 6px;">
              ultra-slim (max-width: 400px)
            </TaoContainer>
            <TaoContainer size="slim" style="background: var(--tao-color-surface-sunken); padding: 8px; border-radius: 6px;">
              slim (max-width: 500px)
            </TaoContainer>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoContainer size="slim"&gt;
  Контент ограниченной ширины
&lt;/TaoContainer&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
