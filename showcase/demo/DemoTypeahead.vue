<script setup>
import { ref } from 'vue'
import { TaoFormField } from '@tao/ui'
import TypeaheadPlayground from './TypeaheadPlayground.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTypeahead' })

const typeaheadPerson = ref(null)
</script>

<template>
  <ShowcaseSection id="typeahead" :tables="propTables['typeahead']">
    <h2>Typeahead (демо, не в пакете)</h2>
          <p>
            Черновик только для showcase: печатаете — после паузы уходит «запрос», предыдущий
            отменяется, список под полем рисует ответ. Fetch, debounce и abort здесь нарочно,
            в kit так класть не надо. Файл можно скопировать в проект; в kit это не едет.
          </p>
    
          <div class="demo-stack">
            <TaoFormField
              label="Человек"
              :hint="typeaheadPerson ? `${typeaheadPerson.name} · ${typeaheadPerson.city}` : 'Наберите «ан», «ива» или «моск». Быстрый ввод отменяет старый запрос'"
            >
              <TypeaheadPlayground v-model="typeaheadPerson">
                <template #empty>Никого нет. Попробуйте «ан» или «моск».</template>
              </TypeaheadPlayground>
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TypeaheadPlayground v-model="person"&gt;
  &lt;template #empty&gt;Никого нет. Попробуйте «ан» или «моск».&lt;/template&gt;
&lt;/TypeaheadPlayground&gt;

&lt;TypeaheadPlayground v-model="person"&gt;
  &lt;template #item="{ hit }"&gt;
    &lt;span&gt;&#123;&#123; hit.name &#125;&#125;&lt;/span&gt;
    &lt;span&gt;&#123;&#123; hit.city &#125;&#125; · &#123;&#123; hit.role &#125;&#125;&lt;/span&gt;
  &lt;/template&gt;
&lt;/TypeaheadPlayground&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
