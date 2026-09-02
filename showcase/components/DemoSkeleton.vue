<script setup>
import { TaoSkeleton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSkeleton' })
</script>

<template>
  <ShowcaseSection id="skeleton" :tables="propTables['skeleton']">
    <h2>TaoSkeleton</h2>
          <p>Плейсхолдер, пока данные едут. Не путать с лоадером — это форма контента, а не спиннер.</p>
    
          <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
            <TaoSkeleton variant="title" />
            <TaoSkeleton :lines="3" />
            <div style="display: flex; gap: 12px; align-items: center;">
              <TaoSkeleton variant="circle" />
              <TaoSkeleton :lines="2" />
            </div>
            <TaoSkeleton variant="rect" height="72px" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoSkeleton variant="title" /&gt;
    &lt;TaoSkeleton :lines="3" /&gt;
    &lt;TaoSkeleton variant="circle" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
