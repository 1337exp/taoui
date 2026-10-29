<script setup>
import { ref } from 'vue'
import { TaoPagination } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoPagination' })

const pagerPage = ref(12)
const bigPage = ref(1)
const sizedPage = ref(3)
const pageSize = ref(20)
</script>

<template>
  <ShowcaseSection id="pagination" :tables="propTables['pagination']">
    <h2>TaoPagination</h2>
          <Tr>
            <template #en>
              <p>
                Pages with an ellipsis, a “from–to of N” counter. The current page goes through <code>v-model:page</code>.
                A click on “…” jumps by <code>jump</code> pages (5 by default) — as in Ant, only without the “-3 / +5” captions.
                <code>:jump="0"</code> keeps the ellipsis decorative.
              </p>
            </template>
            <template #ru>
              <p>
                Страницы с многоточием, счётчик «с–по из N». Текущая страница — через <code>v-model:page</code>.
                Клик по «…» прыгает на <code>jump</code> страниц (по умолчанию 5) — как в Ant, только без подписей «-3 / +5».
                <code>:jump="0"</code> оставляет многоточие декоративным.
              </p>
            </template>
          </Tr>
    
          <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" />
          <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" :jump="3" size="small" style="margin-top: 12px;" />
          <TaoPagination v-model:page="bigPage" :total="3400" :page-size="10" :page-input="20" style="margin-top: 12px;" />
          <TaoPagination v-model:page="sizedPage" v-model:page-size="pageSize" :total="500" :page-sizes="[10, 20, 50, 100]" style="margin-top: 12px;" />
    
          <div class="code-block">
            <pre><code>&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" /&gt;
&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" :jump="3" /&gt;
&lt;!-- 340 pages: a field to type one in (from 20 pages on) --&gt;
&lt;TaoPagination v-model:page="page" :total="3400" :page-size="10" :page-input="20" /&gt;
&lt;TaoPagination v-model:page="page" v-model:page-size="size" :total="500" :page-sizes="[10, 20, 50, 100]" /&gt;

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
