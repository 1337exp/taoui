<script setup>
import { TaoBlock } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoBlock' })
</script>

<template>
  <ShowcaseSection id="block" :tables="propTables['block']">
    <h2>TaoBlock</h2>
          <p>{{ tr('A container with padding, radius and a shadow. Not a page and not a card.', 'Контейнер с padding, radius и тенью. Не страница и не карточка.') }}</p>
          <TaoBlock :padding="24" :radius="12">
            <p>{{ tr('This is content inside TaoBlock. You can set padding, radius, shadow and hover effects.', 'Это контент внутри TaoBlock. Можно задавать padding, radius, shadow и hover эффекты.') }}</p>
          </TaoBlock>
          <div class="code-block">
            <pre><code>&lt;TaoBlock :padding="24" :radius="12"&gt;
  &lt;p&gt;{{ tr('Content', 'Контент') }}&lt;/p&gt;
&lt;/TaoBlock&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
