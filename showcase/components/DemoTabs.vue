<script setup>
import { ref } from 'vue'
import { TaoTabs } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTabs' })

const activeTab = ref('tab1')
const tabs = [
  { key: 'tab1', label: 'Вкладка 1' },
  { key: 'tab2', label: 'Вкладка 2' },
  { key: 'tab3', label: 'Вкладка 3', disabled: true },
]
const tabContents = {
  tab1: 'Содержимое первой вкладки. Здесь может быть любой контент.',
  tab2: 'Содержимое второй вкладки. Можно размещать текст, изображения, формы.',
  tab3: 'Эта вкладка отключена.',
}
</script>

<template>
  <ShowcaseSection id="tabs" :tables="propTables['tabs']">
    <h2>TaoTabs</h2>
          <p>Вкладки — примитив, не карточка страницы. Стрелки листают, Home/End — к краям.</p>
          
          <TaoTabs v-model="activeTab" :tabs="tabs">
            <template #default="{ activeTab }">
              <p>{{ tabContents[activeTab] }}</p>
            </template>
          </TaoTabs>
    
          <div class="code-block">
            <pre><code>&lt;TaoTabs v-model="activeTab" :tabs="tabs"&gt;
  &lt;template #default="{ activeTab }"&gt;
    &lt;p&gt;&#123;&#123; tabContents[activeTab] &#125;&#125;&lt;/p&gt;
  &lt;/template&gt;
&lt;/TaoTabs&gt;

&lt;script setup&gt;
const tabs = [
  { key: 'tab1', label: 'Вкладка 1' },
  { key: 'tab2', label: 'Вкладка 2' }
]
&lt;/script&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
