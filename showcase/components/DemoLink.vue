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

          <h3>{{ tr('Underline', 'Подчёркивание') }}</h3>
          <p>
            {{ tr(
              'A link is underlined by default: in a line of text it must not rest on colour alone (in the light theme it is the text colour). A link that is clear from its place can say',
              'Ссылка подчёркнута по умолчанию: в строке текста она не должна держаться на одном цвете (в светлой теме она цвета текста). Ссылка, понятная по месту, может сказать',
            ) }}
            <code>underline="hover"</code> {{ tr('or', 'или') }} <code>underline="none"</code>:
          </p>
          <p>
            {{ tr('Text with', 'Текст со') }}
            <TaoLink to="#link">{{ tr('a link in a line', 'ссылкой в строке') }}</TaoLink>,
            <TaoLink to="#link" underline="hover">{{ tr('a link with the line on hover', 'ссылкой с линией при наведении') }}</TaoLink>
            {{ tr('and', 'и') }}
            <TaoLink to="#link" underline="none">{{ tr('a link without a line', 'ссылкой без линии') }}</TaoLink>.
          </p>

          <div class="code-block">
            <pre><code>&lt;TaoLink to="/profile"&gt;{{ tr('Profile', 'Профиль') }}&lt;/TaoLink&gt;
&lt;TaoLink to="https://example.com" new-tab&gt;{{ tr('External link', 'Внешняя ссылка') }}&lt;/TaoLink&gt;
&lt;TaoLink to="/docs" underline="hover"&gt;{{ tr('A menu entry', 'Пункт меню') }}&lt;/TaoLink&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
