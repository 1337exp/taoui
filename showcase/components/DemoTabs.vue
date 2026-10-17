<script setup>
import { computed, ref } from 'vue'
import { TaoTabs } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTabs' })

const activeTab = ref('tab1')
const tabs = computed(() => [
  { value: 'tab1', label: tr('Tab 1', 'Вкладка 1') },
  { value: 'tab2', label: tr('Tab 2', 'Вкладка 2') },
  { value: 'tab3', label: tr('Tab 3', 'Вкладка 3'), disabled: true },
])
const tabContents = computed(() => ({
  tab1: tr('The content of the first tab. Any content can go here.', 'Содержимое первой вкладки. Здесь может быть любой контент.'),
  tab2: tr('The content of the second tab. You can put text, images, forms.', 'Содержимое второй вкладки. Можно размещать текст, изображения, формы.'),
  tab3: tr('This tab is disabled.', 'Эта вкладка отключена.'),
}))
</script>

<template>
  <ShowcaseSection id="tabs" :tables="propTables['tabs']">
    <h2>TaoTabs</h2>
          <p>{{ tr('Tabs are a primitive, not a page card. Arrows move between them, Home/End jump to the edges.', 'Вкладки — примитив, не карточка страницы. Стрелки листают, Home/End — к краям.') }}</p>
          
          <TaoTabs v-model="activeTab" :items="tabs">
            <template #default="{ activeTab }">
              <p>{{ tabContents[activeTab] }}</p>
            </template>
          </TaoTabs>
    
          <div class="code-block">
            <pre><code>&lt;TaoTabs v-model="activeTab" :items="tabs"&gt;
  &lt;template #default="{ activeTab }"&gt;
    &lt;p&gt;&#123;&#123; tabContents[activeTab] &#125;&#125;&lt;/p&gt;
  &lt;/template&gt;
&lt;/TaoTabs&gt;

&lt;script setup&gt;
const tabs = [
  { value: 'tab1', label: '{{ tr('Tab 1', 'Вкладка 1') }}' },
  { value: 'tab2', label: '{{ tr('Tab 2', 'Вкладка 2') }}' }
]
&lt;/script&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
