<script setup>
import { computed } from 'vue'
import { TaoDropdownMenu } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDropdown' })

const dropdownActions = computed(() => [
  { id: 'edit', name: tr('Edit', 'Редактировать') },
  { id: 'duplicate', name: tr('Duplicate', 'Дублировать') },
  { id: 'delete', name: tr('Delete', 'Удалить') },
])
</script>

<template>
  <ShowcaseSection id="dropdown" :tables="propTables['dropdown']">
    <h2>TaoDropdownMenu</h2>
          <p>{{ tr('A dropdown menu that positions itself automatically near the screen edge', 'Выпадающее меню с авто-позиционированием у края экрана') }}</p>
    
          <TaoDropdownMenu :actions="dropdownActions" @select="(id) => console.log('selected:', id)" />
    
          <div class="code-block">
            <pre><code>&lt;TaoDropdownMenu :actions="actions" @select="onSelected" /&gt;

&lt;TaoDropdownMenu :actions="actions" menu-label="Menu"&gt;
  &lt;template #icon&gt;&lt;TaoIcon name="more" /&gt;&lt;/template&gt;
&lt;/TaoDropdownMenu&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
