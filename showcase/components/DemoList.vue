<script setup>
import { ref } from 'vue'
import { TaoList, TaoListItem, TaoAvatar, TaoButton, TaoTag } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoList' })

const people = [
  { id: 'anna', name: 'Анна Козлова', role: 'Дизайн · Москва' },
  { id: 'boris', name: 'Борис Волков', role: 'Разработка · Казань' },
  { id: 'kira', name: 'Кира', role: 'Поддержка · офлайн', disabled: true },
  { id: 'oleg', name: 'Олег Морозов', role: 'Аналитика · Санкт-Петербург' },
]
const selectedId = ref('anna')

const files = ref([
  { id: '1', name: 'report.pdf', size: '245 КБ' },
  { id: '2', name: 'invoice-2026.xlsx', size: '18 КБ' },
  { id: '3', name: 'brief.docx', size: '92 КБ' },
])

function removeFile(id) {
  files.value = files.value.filter((file) => file.id !== id)
}
</script>

<template>
  <ShowcaseSection id="list" :tables="propTables['list']">
    <h2>TaoList / TaoListItem</h2>
    <p>
      Строка списка на странице: префикс, заголовок, подпись, мета, действие по ховеру.
      Не Select и не таблица — у тех свои попапы и колонки.
    </p>

    <h3>Люди</h3>
    <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
      Клик выбирает строку. <code>clickable</code> делает её кнопкой.
    </p>
    <TaoList class="demo-wide" aria-label="Люди">
      <TaoListItem
        v-for="person in people"
        :key="person.id"
        :title="person.name"
        :description="person.role"
        :selected="selectedId === person.id"
        :disabled="person.disabled"
        clickable
        @click="selectedId = person.id"
      >
        <template #prefix>
          <TaoAvatar :name="person.name" size="small" />
        </template>
        <template v-if="person.id === 'oleg'" #suffix>
          <TaoTag type="info" flat>new</TaoTag>
        </template>
      </TaoListItem>
    </TaoList>

    <h3>Файлы</h3>
    <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
      Крестик появляется при наведении. На таче он всегда на виду.
    </p>
    <TaoList class="demo-wide" :empty="!files.length" aria-label="Файлы">
      <TaoListItem
        v-for="file in files"
        :key="file.id"
        :title="file.name"
      >
        <template #suffix>{{ file.size }}</template>
        <template #action>
          <TaoButton
            size="small"
            variant="ghost"
            tone="danger"
            :aria-label="`Убрать ${file.name}`"
            @click="removeFile(file.id)"
          >
            ✕
          </TaoButton>
        </template>
      </TaoListItem>
      <template #empty>Файлов нет — удалили все строки.</template>
    </TaoList>

    <h3>Размеры</h3>
    <div class="button-row" style="align-items: stretch;">
      <TaoList size="small" class="demo-list-size" aria-label="Размер S">
        <TaoListItem title="Small" description="32px" />
        <TaoListItem title="Ещё строка" />
      </TaoList>
      <TaoList size="medium" class="demo-list-size" aria-label="Размер M">
        <TaoListItem title="Medium" description="как Input" />
        <TaoListItem title="Ещё строка" />
      </TaoList>
      <TaoList size="large" class="demo-list-size" aria-label="Размер L">
        <TaoListItem title="Large" description="аватар и две строки" />
        <TaoListItem title="Ещё строка" />
      </TaoList>
    </div>

    <h3>Скролл и без рамки</h3>
    <div class="button-row" style="align-items: flex-start;">
      <TaoList class="demo-list-size" :max-height="132" aria-label="Длинный список">
        <TaoListItem v-for="n in 8" :key="n" :title="`Строка ${n}`" />
      </TaoList>
      <TaoList :bordered="false" :divided="false" class="demo-list-size" aria-label="Без рамки">
        <TaoListItem title="Без рамки" description="как опции в попапе" active />
        <TaoListItem title="Соседняя" />
        <TaoListItem title="Выключена" disabled />
      </TaoList>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoList&gt;
  &lt;TaoListItem
    title="Анна Козлова"
    description="Дизайн · Москва"
    clickable
    :selected="picked === 'anna'"
    @click="picked = 'anna'"
  &gt;
    &lt;template #prefix&gt;&lt;TaoAvatar name="Анна Козлова" size="small" /&gt;&lt;/template&gt;
  &lt;/TaoListItem&gt;
&lt;/TaoList&gt;

&lt;TaoListItem title="report.pdf"&gt;
  &lt;template #suffix&gt;245 КБ&lt;/template&gt;
  &lt;template #action&gt;
    &lt;TaoButton size="small" variant="ghost" @click="remove"&gt;✕&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoListItem&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-list-size {
  width: 200px;
  max-width: 100%;
}
</style>
