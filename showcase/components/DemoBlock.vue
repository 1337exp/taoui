<script setup>
import { TaoBlock } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoBlock' })
</script>

<template>
  <ShowcaseSection id="block" :tables="propTables['block']">
    <h2>TaoBlock</h2>
          <p>Контейнер с padding, radius и тенью. Не страница и не карточка.</p>
          <TaoBlock :padding="24" :radius="12">
            <p>Это контент внутри TaoBlock. Можно задавать padding, radius, shadow и hover эффекты.</p>
          </TaoBlock>
          <div class="code-block">
            <pre><code>&lt;TaoBlock :padding="24" :radius="12"&gt;
  &lt;p&gt;Контент&lt;/p&gt;
&lt;/TaoBlock&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
