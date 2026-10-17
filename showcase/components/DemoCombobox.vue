<script setup>
import { computed, ref } from 'vue'
import { TaoFormField, TaoCombobox } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCombobox' })

const comboCity = ref(null)
const comboSmall = ref("msk")
const comboLarge = ref("msk")
const comboTag = ref(null)
const comboFree = ref(null)
const comboCities = computed(() => [
  { value: 'msk', label: tr('Moscow', 'Москва') },
  { value: 'spb', label: tr('Saint Petersburg', 'Санкт-Петербург') },
  { value: 'kzn', label: tr('Kazan', 'Казань'), disabled: true },
  { value: 'nsk', label: tr('Novosibirsk', 'Новосибирск') },
  { value: 'ekb', label: tr('Yekaterinburg', 'Екатеринбург') },
  { value: 'nn', label: tr('Nizhny Novgorod', 'Нижний Новгород') },
  { value: 'sam', label: tr('Samara', 'Самара') },
  { value: 'oms', label: tr('Omsk', 'Омск') },
  { value: 'chel', label: tr('Chelyabinsk', 'Челябинск') },
  { value: 'rnd', label: tr('Rostov-on-Don', 'Ростов-на-Дону') },
  { value: 'ufa', label: tr('Ufa', 'Уфа') },
  { value: 'krsk', label: tr('Krasnoyarsk', 'Красноярск') },
  { value: 'vrn', label: tr('Voronezh', 'Воронеж') },
  { value: 'perm', label: tr('Perm', 'Пермь') },
  { value: 'vlg', label: tr('Volgograd', 'Волгоград') },
])
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
          <Tr>
            <template #en>
              <p>
                A Select with a field: you type — the list filters. By default only values from the list:
                if nothing matches, the input rolls back. The empty list, “Clear” and “Add” are the slots
                <code>#empty</code> / <code>#clear</code> / <code>#create</code> (or the props
                <code>empty-text</code> / <code>clear-text</code>). <code>allow-create</code>
                keeps your own text in
                <code>v-model</code>; the Combobox does not touch the list itself. For the new value to appear in
                <code>options</code>, listen to <code>@create</code>. Esc and a click outside close it.
              </p>
            </template>
            <template #ru>
              <p>
                Select с полем: печатаете — список фильтруется. По умолчанию только из списка:
                не нашли — ввод откатывается. Пустой список, «Очистить» и «Добавить» — слоты
                <code>#empty</code> / <code>#clear</code> / <code>#create</code> (или пропы
                <code>empty-text</code> / <code>clear-text</code>). <code>allow-create</code>
                оставляет свой текст в
                <code>v-model</code>; список Combobox сам не трогает. Чтобы новое появилось в
                <code>options</code>, слушайте <code>@create</code>. Esc и клик снаружи закрывают.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFormField
              :label="tr('City', 'Город')"
              :hint="comboCity ? tr(`In the model: ${comboCity}`, `В модели: ${comboCity}`) : tr('Only from the list. Start with “mo” or “sai”', 'Только из списка. Начните с «мо» или «сан»')"
            >
              <TaoCombobox v-model="comboCity" :options="comboCities" :placeholder="tr('Start typing a city', 'Начните вводить город')" />
            </TaoFormField>
    
            <TaoFormField
              :label="tr('Your own query', 'Свой запрос')"
              :hint="comboFree ? tr(`In the model: ${comboFree}`, `В модели: ${comboFree}`) : tr('The list does not change. “Vite” goes only to the variable', 'Список не меняется. «Vite» уйдёт только в переменную')"
            >
              <TaoCombobox
                v-model="comboFree"
                :options="comboFreeOptions"
                allow-create
                :placeholder="tr('Vue, Nuxt or your own', 'Vue, Nuxt или свой')"
              />
            </TaoFormField>
    
            <TaoFormField
              :label="tr('Tag into the list', 'Тег в список')"
              :hint="comboTag ? tr(`In the model: ${comboTag}`, `В модели: ${comboTag}`) : tr('“Vite” lands in both the model and options via @create', '«Vite» попадёт и в модель, и в options через @create')"
            >
              <TaoCombobox
                v-model="comboTag"
                :options="comboTags"
                allow-create
                :placeholder="tr('Vue, Nuxt or your own', 'Vue, Nuxt или свой')"
                @create="onComboTagCreate"
              />
            </TaoFormField>
    
            <TaoFormField label="Disabled">
              <TaoCombobox model-value="msk" :options="comboCities" disabled />
              <div style="display: flex; flex-direction: column; gap: 12px">
                <TaoCombobox v-model="comboSmall" :options="comboCities" size="small" :clearable="false" placeholder="small, clearable=false" />
                <TaoCombobox v-model="comboLarge" :options="comboCities" size="large" placeholder="large" />
              </div>
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
