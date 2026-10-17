<script setup>
import { TaoLink } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoLink' })
</script>

<template>
  <ShowcaseSection id="link" :tables="propTables['link']">
    <h2>TaoLink</h2>
          <p>{{ tr('A link: &lt;NuxtLink&gt; in Nuxt, &lt;RouterLink&gt; with vue-router, otherwise a plain &lt;a&gt; — no extra setup', 'Ссылка: &lt;NuxtLink&gt; в Nuxt, &lt;RouterLink&gt; при vue-router, иначе обычный &lt;a&gt; — без дополнительной настройки') }}</p>
    
          <TaoLink to="https://github.com" new-tab>{{ tr('Open in a new tab →', 'Открыть в новой вкладке →') }}</TaoLink>
    
          <div class="code-block">
            <pre><code>&lt;TaoLink to="/profile"&gt;{{ tr('Profile', 'Профиль') }}&lt;/TaoLink&gt;
&lt;TaoLink to="https://example.com" new-tab&gt;{{ tr('External link', 'Внешняя ссылка') }}&lt;/TaoLink&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
