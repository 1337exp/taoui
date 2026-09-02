<script setup>
import { TaoBreadcrumb } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoBreadcrumb' })

const breadcrumbItems = [
  { label: 'Главная', to: '/' },
  { label: 'Пользователи', to: '/users' },
  { label: 'Профиль' },
]

function preventShowcaseNav(event) {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault()
  }
}
</script>

<template>
  <ShowcaseSection id="breadcrumb" :tables="propTables['breadcrumb']">
    <h2>TaoBreadcrumb</h2>
          <p>
            <code>to</code> — путь страницы. В приложении с роутером «Пользователи» откроет <code>/users</code>.
            Последний пункт без ссылки: вы уже там. Здесь клик не уводит со страницы, чтобы не сломать демо.
          </p>
    
          <div @click.capture="preventShowcaseNav">
            <TaoBreadcrumb :items="breadcrumbItems" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoBreadcrumb :items="[
      { label: 'Главная', to: '/' },
      { label: 'Пользователи', to: '/users' },
      { label: 'Профиль' },
    ]" /&gt;
    
    &lt;TaoBreadcrumb aria-label="Breadcrumb" :items="items" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
