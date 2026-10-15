<script setup>
import { ref } from 'vue'
import { TaoTag, TaoAvatar } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTag' })

const tagPeople = ref([
  { name: 'Анна Козлова' },
  { name: 'Борис Волков' },
  { name: 'Кира' },
])
const tagFilters = ref(['Москва', 'Pro', 'Новые'])

function removeTagPerson(index) {
  tagPeople.value.splice(index, 1)
}

function removeTagFilter(index) {
  tagFilters.value.splice(index, 1)
}
</script>

<template>
  <ShowcaseSection id="tag" :tables="propTables['tag']">
    <h2>TaoTag</h2>
          <p>
            Тег / бейдж. <code>#prefix</code> — аватар или иконка слева, <code>closable</code> — крестик.
            <code>flat</code> снимает рамку, заливка остаётся. Крестик не всплывает наружу.
          </p>
    
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag>default</TaoTag>
            <TaoTag tone="neutral">neutral</TaoTag>
            <TaoTag tone="success">success</TaoTag>
            <TaoTag tone="danger">danger</TaoTag>
            <TaoTag tone="warning">warning</TaoTag>
            <TaoTag tone="info">info</TaoTag>
            <TaoTag clickable>кликабельный</TaoTag>
          </div>
    
          <h3>Flat</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag flat>default</TaoTag>
            <TaoTag tone="neutral" flat>neutral</TaoTag>
            <TaoTag tone="success" flat>success</TaoTag>
            <TaoTag tone="danger" flat>danger</TaoTag>
            <TaoTag tone="warning" flat>warning</TaoTag>
            <TaoTag tone="info" flat>info</TaoTag>
          </div>
    
          <h3>Закрытие и люди</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            <TaoTag
              v-for="(filter, index) in tagFilters"
              :key="filter"
              tone="neutral"
              closable
              @close="removeTagFilter(index)"
            >
              {{ filter }}
            </TaoTag>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag
              v-for="(person, index) in tagPeople"
              :key="person.name"
              tone="neutral"
              closable
              :close-label="`Убрать ${person.name}`"
              @close="removeTagPerson(index)"
            >
              <template #prefix>
                <TaoAvatar :name="person.name" size="small" />
              </template>
              {{ person.name }}
            </TaoTag>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTag tone="success"&gt;Активен&lt;/TaoTag&gt;
&lt;TaoTag tone="success" flat&gt;Активен&lt;/TaoTag&gt;

&lt;TaoTag tone="neutral" closable close-label="Remove" @close="remove"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
  Москва
&lt;/TaoTag&gt;

&lt;TaoTag tone="neutral" closable @close="remove"&gt;
  &lt;template #prefix&gt;
    &lt;TaoAvatar name="Анна Козлова" size="small" /&gt;
  &lt;/template&gt;
  Анна Козлова
&lt;/TaoTag&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
