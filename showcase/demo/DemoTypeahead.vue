<script setup>
import { ref } from 'vue'
import { TaoFormField } from '@1337exp/taoui'
import TypeaheadPlayground from './TypeaheadPlayground.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from '../components/Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTypeahead' })

const typeaheadPerson = ref(null)
</script>

<template>
  <ShowcaseSection id="typeahead" :tables="propTables['typeahead']">
    <h2>Typeahead ({{ tr('demo, not in the package', 'демо, не в пакете') }})</h2>
          <Tr>
            <template #en>
              <p>
                A draft for the showcase only: you type — after a pause a “request” goes out, the previous one
                is cancelled, and the list under the field draws the response. Fetch, debounce and abort are here on purpose,
                the kit should not hold them. The file can be copied into a project; it does not ship with the kit.
              </p>
            </template>
            <template #ru>
              <p>
                Черновик только для showcase: печатаете — после паузы уходит «запрос», предыдущий
                отменяется, список под полем рисует ответ. Fetch, debounce и abort здесь нарочно,
                в kit так класть не надо. Файл можно скопировать в проект; в kit это не едет.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField
              :label="tr('Person', 'Человек')"
              :hint="typeaheadPerson ? `${typeaheadPerson.name} · ${typeaheadPerson.city}` : tr('Type “an”, “iva” or “mosc”. Fast typing cancels the old request', 'Наберите «ан», «ива» или «моск». Быстрый ввод отменяет старый запрос')"
            >
              <TypeaheadPlayground v-model="typeaheadPerson">
                <template #empty>{{ tr('Nobody here. Try “an” or “mosc”.', 'Никого нет. Попробуйте «ан» или «моск».') }}</template>
              </TypeaheadPlayground>
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TypeaheadPlayground v-model="person"&gt;
  &lt;template #empty&gt;{{ tr('Nobody here. Try “an” or “mosc”.', 'Никого нет. Попробуйте «ан» или «моск».') }}&lt;/template&gt;
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
