<script setup>
import { computed } from 'vue'
import { TaoBreadcrumb } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoBreadcrumb' })

const breadcrumbItems = computed(() => [
  { label: tr('Home', 'Главная'), to: '/' },
  { label: tr('Users', 'Пользователи'), to: '/users' },
  { label: tr('Profile', 'Профиль') },
])

function preventShowcaseNav(event) {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault()
  }
}
</script>

<template>
  <ShowcaseSection id="breadcrumb" :tables="propTables['breadcrumb']">
    <h2>TaoBreadcrumb</h2>
          <Tr>
            <template #en>
              <p>
                <code>to</code> — the page path. In an app with a router, “Users” opens <code>/users</code>.
                The last item has no link: you are already there. Here a click does not leave the page, so the demo is not broken.
              </p>
            </template>
            <template #ru>
              <p>
                <code>to</code> — путь страницы. В приложении с роутером «Пользователи» откроет <code>/users</code>.
                Последний пункт без ссылки: вы уже там. Здесь клик не уводит со страницы, чтобы не сломать демо.
              </p>
            </template>
          </Tr>

          <div @click.capture="preventShowcaseNav">
            <TaoBreadcrumb :items="breadcrumbItems" />
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoBreadcrumb :items="[
  { label: '{{ tr('Home', 'Главная') }}', to: '/' },
  { label: '{{ tr('Users', 'Пользователи') }}', to: '/users' },
  { label: '{{ tr('Profile', 'Профиль') }}' },
]" /&gt;

&lt;TaoBreadcrumb aria-label="Breadcrumb" :items="items" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
