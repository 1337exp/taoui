<script setup>
import { TaoLoader } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoLoader' })
</script>

<template>
  <ShowcaseSection id="loader" :tables="propTables['loader']">
    <h2>TaoLoader</h2>
          <p>{{ tr('An animated loader', 'Анимированный лоадер') }}</p>
    
          <div style="display: flex; gap: 24px; align-items: center;">
            <TaoLoader :size="40" />
            <TaoLoader :size="24" inline />
            <TaoLoader :size="40" color="var(--tao-color-danger)" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoLoader :size="40" /&gt;
&lt;TaoLoader :size="24" inline /&gt;
&lt;TaoLoader :size="40" color="var(--tao-color-danger)" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
