<script setup>
import { TaoFlex, TaoSpace, TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFlex' })
</script>

<template>
  <ShowcaseSection id="flex" :tables="propTables['flex']">
    <h2>TaoFlex / TaoSpace</h2>
          <p>{{ tr('A wrapper over flexbox and an automatic layout of children with an even gap', 'Обёртка над flexbox и авто-расстановка дочерних элементов с равномерным gap') }}</p>
    
          <h3>TaoFlex</h3>
          <TaoFlex justify="space-between" style="background: var(--tao-color-surface-sunken); padding: 12px; border-radius: 6px;">
            <span>{{ tr('Left', 'Слева') }}</span>
            <span>{{ tr('Centre', 'По центру') }}</span>
            <span>{{ tr('Right', 'Справа') }}</span>
          </TaoFlex>
    
          <h3>TaoSpace</h3>
          <TaoSpace>
            <TaoButton size="small" variant="secondary">{{ tr('One', 'Один') }}</TaoButton>
            <TaoButton size="small" variant="secondary">{{ tr('Two', 'Два') }}</TaoButton>
            <TaoButton size="small" variant="secondary">{{ tr('Three', 'Три') }}</TaoButton>
          </TaoSpace>
    
          <div class="code-block">
            <pre><code>&lt;TaoFlex justify="space-between"&gt;
  &lt;span&gt;{{ tr('Left', 'Слева') }}&lt;/span&gt;
  &lt;span&gt;{{ tr('Right', 'Справа') }}&lt;/span&gt;
&lt;/TaoFlex&gt;

&lt;TaoSpace&gt;
  &lt;TaoButton&gt;{{ tr('One', 'Один') }}&lt;/TaoButton&gt;
  &lt;TaoButton&gt;{{ tr('Two', 'Два') }}&lt;/TaoButton&gt;
&lt;/TaoSpace&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
