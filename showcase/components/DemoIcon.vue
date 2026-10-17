<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoIcon' })
</script>

<template>
  <ShowcaseSection id="icon" :tables="propTables['icon']">
    <h2>TaoIcon</h2>
          <Tr>
            <template #en><p>A wrapper for an icon font — renders the class <code>icon-&lt;name&gt;</code>; the font itself has to be added in your project (see the README)</p></template>
            <template #ru><p>Обёртка для icon-шрифта — рендерит класс <code>icon-&lt;name&gt;</code>, сам шрифт нужно подключить в проекте (см. README)</p></template>
          </Tr>
    
          <div class="code-block">
            <pre><code>&lt;TaoIcon name="arrow-up" :size="20" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
