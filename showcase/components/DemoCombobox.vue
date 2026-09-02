<script setup>
import { ref } from 'vue'
import { TaoFormField, TaoCombobox } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCombobox' })

const comboCity = ref(null)
const comboTag = ref(null)
const comboFree = ref(null)
const comboCities = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'ekb', label: 'Екатеринбург' },
  { value: 'nn', label: 'Нижний Новгород' },
  { value: 'sam', label: 'Самара' },
  { value: 'oms', label: 'Омск' },
  { value: 'chel', label: 'Челябинск' },
  { value: 'rnd', label: 'Ростов-на-Дону' },
  { value: 'ufa', label: 'Уфа' },
  { value: 'krsk', label: 'Красноярск' },
  { value: 'vrn', label: 'Воронеж' },
  { value: 'perm', label: 'Пермь' },
  { value: 'vlg', label: 'Волгоград' },
]
const comboFreeOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'ts', label: 'TypeScript' },
]
const comboTags = ref([
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'ts', label: 'TypeScript' },
])
function onComboTagCreate(text) {
  const exists = comboTags.value.some(
    (tag) => tag.value === text || tag.label.toLowerCase() === String(text).toLowerCase(),
  )
  if (!exists) {
    comboTags.value.push({ value: text, label: text })
  }
}
</script>

<template>
  <ShowcaseSection id="combobox" :tables="propTables['combobox']">
    <h2>TaoCombobox</h2>
          <p>
            Select с полем: печатаете — список фильтруется. По умолчанию только из списка:
            не нашли — ввод откатывается. Пустой список, «Очистить» и «Добавить» — слоты
            <code>#empty</code> / <code>#clear</code> / <code>#create</code> (или пропы
            <code>empty-text</code> / <code>clear-text</code>). <code>allow-create</code>
            оставляет свой текст в
            <code>v-model</code>; список Combobox сам не трогает. Чтобы новое появилось в
            <code>options</code>, слушайте <code>@create</code>. Esc и клик снаружи закрывают.
          </p>
    
          <div class="demo-stack">
            <TaoFormField
              label="Город"
              :hint="comboCity ? `В модели: ${comboCity}` : 'Только из списка. Начните с «мо» или «сан»'"
            >
              <TaoCombobox v-model="comboCity" :options="comboCities" placeholder="Начните вводить город" />
            </TaoFormField>
    
            <TaoFormField
              label="Свой запрос"
              :hint="comboFree ? `В модели: ${comboFree}` : 'Список не меняется. «Vite» уйдёт только в переменную'"
            >
              <TaoCombobox
                v-model="comboFree"
                :options="comboFreeOptions"
                allow-create
                placeholder="Vue, Nuxt или свой"
              />
            </TaoFormField>
    
            <TaoFormField
              label="Тег в список"
              :hint="comboTag ? `В модели: ${comboTag}` : '«Vite» попадёт и в модель, и в options через @create'"
            >
              <TaoCombobox
                v-model="comboTag"
                :options="comboTags"
                allow-create
                placeholder="Vue, Nuxt или свой"
                @create="onComboTagCreate"
              />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoCombobox model-value="msk" :options="comboCities" disabled />
            </TaoFormField>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCombobox v-model="city" :options="cities" /&gt;
    &lt;TaoCombobox v-model="query" :options="tags" allow-create /&gt;
    &lt;TaoCombobox v-model="tag" :options="tags" allow-create @create="onCreate" /&gt;
    
    &lt;TaoCombobox
      v-model="city"
      :options="cities"
      placeholder="Start typing"
      empty-text="Nothing found"
      clear-text="Clear"
    &gt;
      &lt;template #create="{ text }"&gt;Add “&#123;&#123; text &#125;&#125;”&lt;/template&gt;
      &lt;template #chevron&gt;&lt;TaoIcon name="chevron-down" /&gt;&lt;/template&gt;
    &lt;/TaoCombobox&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
