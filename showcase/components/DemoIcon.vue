<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoIcon' })
</script>

<template>
  <ShowcaseSection id="icon" :tables="propTables['icon']">
    <h2>TaoIcon</h2>
          <p>Обёртка для icon-шрифта — рендерит класс <code>icon-&lt;name&gt;</code>, сам шрифт нужно подключить в проекте (см. README)</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoIcon name="arrow-up" :size="20" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
