<script setup>
import { TaoDivider } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDivider' })
</script>

<template>
  <ShowcaseSection id="divider" :tables="propTables['divider']">
    <h2>TaoDivider</h2>
          <p>Разделитель: линия, линия с текстом, или пустой отступ</p>
    
          <p style="margin-bottom: 4px;">variant="line" (по умолчанию):</p>
          <TaoDivider variant="line" />
    
          <p style="margin-bottom: 4px;">variant="text":</p>
          <TaoDivider variant="text">или</TaoDivider>
    
          <div class="code-block">
            <pre><code>&lt;TaoDivider variant="line" /&gt;
&lt;TaoDivider variant="text"&gt;или&lt;/TaoDivider&gt;
&lt;TaoDivider variant="gap" size="small" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
