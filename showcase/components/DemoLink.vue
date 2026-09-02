<script setup>
import { TaoLink } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoLink' })
</script>

<template>
  <ShowcaseSection id="link" :tables="propTables['link']">
    <h2>TaoLink</h2>
          <p>Ссылка: &lt;NuxtLink&gt; в Nuxt, &lt;RouterLink&gt; при vue-router, иначе обычный &lt;a&gt; — без дополнительной настройки</p>
    
          <TaoLink to="https://github.com" as-new-tab>Открыть в новой вкладке →</TaoLink>
    
          <div class="code-block">
            <pre><code>&lt;TaoLink to="/profile"&gt;Профиль&lt;/TaoLink&gt;
&lt;TaoLink to="https://example.com" as-new-tab&gt;Внешняя ссылка&lt;/TaoLink&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
