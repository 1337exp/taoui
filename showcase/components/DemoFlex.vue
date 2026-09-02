<script setup>
import { TaoFlex, TaoSpace, TaoButton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFlex' })
</script>

<template>
  <ShowcaseSection id="flex" :tables="propTables['flex']">
    <h2>TaoFlex / TaoSpace</h2>
          <p>Обёртка над flexbox и авто-расстановка дочерних элементов с равномерным gap</p>
    
          <h3>TaoFlex</h3>
          <TaoFlex justify="space-between" style="background: var(--tao-color-surface-sunken); padding: 12px; border-radius: 6px;">
            <span>Слева</span>
            <span>По центру</span>
            <span>Справа</span>
          </TaoFlex>
    
          <h3>TaoSpace</h3>
          <TaoSpace>
            <TaoButton size="small" variant="secondary">Один</TaoButton>
            <TaoButton size="small" variant="secondary">Два</TaoButton>
            <TaoButton size="small" variant="secondary">Три</TaoButton>
          </TaoSpace>
    
          <div class="code-block">
            <pre><code>&lt;TaoFlex justify="space-between"&gt;
  &lt;span&gt;Слева&lt;/span&gt;
  &lt;span&gt;Справа&lt;/span&gt;
&lt;/TaoFlex&gt;

&lt;TaoSpace&gt;
  &lt;TaoButton&gt;Один&lt;/TaoButton&gt;
  &lt;TaoButton&gt;Два&lt;/TaoButton&gt;
&lt;/TaoSpace&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
