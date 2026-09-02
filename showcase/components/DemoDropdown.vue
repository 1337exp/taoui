<script setup>
import { TaoDropdownMenu } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDropdown' })

const dropdownActions = [
  { id: 'edit', name: 'Редактировать' },
  { id: 'duplicate', name: 'Дублировать' },
  { id: 'delete', name: 'Удалить' },
]
</script>

<template>
  <ShowcaseSection id="dropdown" :tables="propTables['dropdown']">
    <h2>TaoDropdownMenu</h2>
          <p>Выпадающее меню с авто-позиционированием у края экрана</p>
    
          <TaoDropdownMenu :actions="dropdownActions" @selected="(id) => console.log('selected:', id)" />
    
          <div class="code-block">
            <pre><code>&lt;TaoDropdownMenu :actions="actions" @selected="onSelected" /&gt;

&lt;TaoDropdownMenu :actions="actions" menu-label="Menu"&gt;
  &lt;template #icon&gt;&lt;TaoIcon name="more" /&gt;&lt;/template&gt;
&lt;/TaoDropdownMenu&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
