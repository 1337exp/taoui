<script setup>
import { ref } from 'vue'
import { TaoPagination } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPagination' })

const pagerPage = ref(12)
</script>

<template>
  <ShowcaseSection id="pagination" :tables="propTables['pagination']">
    <h2>TaoPagination</h2>
          <p>
            Страницы с многоточием, счётчик «с–по из N». Текущая страница — через <code>v-model:page</code>.
            Клик по «…» прыгает на <code>jump</code> страниц (по умолчанию 5) — как в Ant, только без подписей «-3 / +5».
            <code>:jump="0"</code> оставляет многоточие декоративным.
          </p>
    
          <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" />
          <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" :jump="3" size="small" style="margin-top: 12px;" />
    
          <div class="code-block">
            <pre><code>&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" /&gt;
    &lt;TaoPagination v-model:page="page" :total="500" :page-size="10" :jump="3" /&gt;
    
    &lt;TaoPagination
      v-model:page="page"
      :total="500"
      :page-size="10"
      prev-label="Previous"
      next-label="Next"
      page-label="Page {page}"
    &gt;
      &lt;template #total="{ from, to, total }"&gt;&#123;&#123; from &#125;&#125;–&#123;&#123; to &#125;&#125; of &#123;&#123; total &#125;&#125;&lt;/template&gt;
      &lt;template #prev-icon&gt;&lt;TaoIcon name="arrow-left" /&gt;&lt;/template&gt;
      &lt;template #next-icon&gt;&lt;TaoIcon name="arrow-right" /&gt;&lt;/template&gt;
    &lt;/TaoPagination&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
