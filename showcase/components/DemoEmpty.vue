<script setup>
import { TaoEmpty, TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoEmpty' })
</script>

<template>
  <ShowcaseSection id="empty" :tables="propTables['empty']">
    <h2>TaoEmpty</h2>
          <p>{{ tr('An empty list, no search results, no access — one ready-made block instead of hand-made markup.', 'Пустой список, нет поиска, нет прав — одна заготовка вместо самодельной вёрстки.') }}</p>
    
          <TaoEmpty :title="tr('Nothing found', 'Ничего не нашлось')">
            {{ tr('Change the filter or reset the search.', 'Измените фильтр или сбросьте поиск.') }}
            <template #action>
              <TaoButton size="small" variant="secondary">{{ tr('Reset', 'Сбросить') }}</TaoButton>
            </template>
          </TaoEmpty>
    
          <div class="code-block">
            <pre><code>&lt;TaoEmpty title="{{ tr('Nothing found', 'Ничего не нашлось') }}"&gt;
  {{ tr('Change the filter.', 'Измените фильтр.') }}
&lt;/TaoEmpty&gt;

&lt;TaoEmpty title="Nothing found"&gt;
  Change the filter or reset search.
&lt;/TaoEmpty&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
