<script setup>
import { TaoEmpty, TaoButton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoEmpty' })
</script>

<template>
  <ShowcaseSection id="empty" :tables="propTables['empty']">
    <h2>TaoEmpty</h2>
          <p>Пустой список, нет поиска, нет прав — одна заготовка вместо самодельной вёрстки.</p>
    
          <TaoEmpty title="Ничего не нашлось">
            Измените фильтр или сбросьте поиск.
            <template #action>
              <TaoButton size="small" variant="secondary">Сбросить</TaoButton>
            </template>
          </TaoEmpty>
    
          <div class="code-block">
            <pre><code>&lt;TaoEmpty title="Ничего не нашлось"&gt;
      Измените фильтр.
    &lt;/TaoEmpty&gt;
    
    &lt;TaoEmpty title="Nothing found"&gt;
      Change the filter or reset search.
    &lt;/TaoEmpty&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
