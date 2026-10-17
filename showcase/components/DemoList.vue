<script setup>
import { computed, ref } from 'vue'
import { TaoList, TaoListItem, TaoAvatar, TaoButton, TaoTag } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoList' })

const people = computed(() => [
  { id: 'anna', name: tr('Anna Kozlova', 'Анна Козлова'), role: tr('Design · Moscow', 'Дизайн · Москва') },
  { id: 'boris', name: tr('Boris Volkov', 'Борис Волков'), role: tr('Engineering · Kazan', 'Разработка · Казань') },
  { id: 'kira', name: tr('Kira', 'Кира'), role: tr('Support · offline', 'Поддержка · офлайн'), disabled: true },
  { id: 'oleg', name: tr('Oleg Morozov', 'Олег Морозов'), role: tr('Analytics · Saint Petersburg', 'Аналитика · Санкт-Петербург') },
])
const selectedId = ref('anna')

const files = ref([
  { id: '1', name: 'report.pdf', kb: 245 },
  { id: '2', name: 'invoice-2026.xlsx', kb: 18 },
  { id: '3', name: 'brief.docx', kb: 92 },
])

function removeFile(id) {
  files.value = files.value.filter((file) => file.id !== id)
}
</script>

<template>
  <ShowcaseSection id="list" :tables="propTables['list']">
    <h2>TaoList / TaoListItem</h2>
    <Tr>
      <template #en>
        <p>
          A list row on a page: prefix, title, caption, meta, a hover action.
          Not a Select and not a table — those have their own popups and columns.
        </p>
      </template>
      <template #ru>
        <p>
          Строка списка на странице: префикс, заголовок, подпись, мета, действие по ховеру.
          Не Select и не таблица — у тех свои попапы и колонки.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('People', 'Люди') }}</h3>
    <Tr>
      <template #en>
        <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
          A click selects the row. <code>clickable</code> makes it a button.
        </p>
      </template>
      <template #ru>
        <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
          Клик выбирает строку. <code>clickable</code> делает её кнопкой.
        </p>
      </template>
    </Tr>
    <TaoList class="demo-wide" :aria-label="tr('People', 'Люди')">
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
          <TaoTag tone="info" flat>new</TaoTag>
        </template>
      </TaoListItem>
    </TaoList>

    <h3>{{ tr('Files', 'Файлы') }}</h3>
    <Tr>
      <template #en>
        <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
          The cross appears on hover. On touch it is always visible.
        </p>
      </template>
      <template #ru>
        <p style="margin-top: 0; color: var(--tao-color-text-muted); font-size: 13px;">
          Крестик появляется при наведении. На таче он всегда на виду.
        </p>
      </template>
    </Tr>
    <TaoList class="demo-wide" :empty="!files.length" :aria-label="tr('Files', 'Файлы')">
      <TaoListItem
        v-for="file in files"
        :key="file.id"
        :title="file.name"
      >
        <template #suffix>{{ tr(`${file.kb} KB`, `${file.kb} КБ`) }}</template>
        <template #action>
          <TaoButton
            size="small"
            variant="ghost"
            tone="danger"
            :aria-label="tr(`Remove ${file.name}`, `Убрать ${file.name}`)"
            @click="removeFile(file.id)"
          >
            ✕
          </TaoButton>
        </template>
      </TaoListItem>
      <template #empty>{{ tr('No files — all the rows were removed.', 'Файлов нет — удалили все строки.') }}</template>
    </TaoList>

    <h3>{{ tr('Sizes', 'Размеры') }}</h3>
    <div class="button-row" style="align-items: stretch;">
      <TaoList size="small" class="demo-list-size" :aria-label="tr('Size S', 'Размер S')">
        <TaoListItem title="Small" description="32px" />
        <TaoListItem :title="tr('Another row', 'Ещё строка')" />
      </TaoList>
      <TaoList size="medium" class="demo-list-size" :aria-label="tr('Size M', 'Размер M')">
        <TaoListItem title="Medium" :description="tr('like Input', 'как Input')" />
        <TaoListItem :title="tr('Another row', 'Ещё строка')" />
      </TaoList>
      <TaoList size="large" class="demo-list-size" :aria-label="tr('Size L', 'Размер L')">
        <TaoListItem title="Large" :description="tr('avatar and two lines', 'аватар и две строки')" />
        <TaoListItem :title="tr('Another row', 'Ещё строка')" />
      </TaoList>
    </div>

    <h3>{{ tr('Scroll and no border', 'Скролл и без рамки') }}</h3>
    <div class="button-row" style="align-items: flex-start;">
      <TaoList class="demo-list-size" :max-height="132" :aria-label="tr('A long list', 'Длинный список')">
        <TaoListItem v-for="n in 8" :key="n" :title="tr(`Row ${n}`, `Строка ${n}`)" />
      </TaoList>
      <TaoList :bordered="false" :divided="false" class="demo-list-size" :aria-label="tr('No border', 'Без рамки')">
        <TaoListItem :title="tr('No border', 'Без рамки')" :description="tr('like options in a popup', 'как опции в попапе')" active />
        <TaoListItem :title="tr('Neighbour', 'Соседняя')" />
        <TaoListItem :title="tr('Disabled', 'Выключена')" disabled />
      </TaoList>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoList&gt;
  &lt;TaoListItem
    title="{{ tr('Anna Kozlova', 'Анна Козлова') }}"
    description="{{ tr('Design · Moscow', 'Дизайн · Москва') }}"
    clickable
    :selected="picked === 'anna'"
    @click="picked = 'anna'"
  &gt;
    &lt;template #prefix&gt;&lt;TaoAvatar name="{{ tr('Anna Kozlova', 'Анна Козлова') }}" size="small" /&gt;&lt;/template&gt;
  &lt;/TaoListItem&gt;
&lt;/TaoList&gt;

&lt;TaoListItem title="report.pdf"&gt;
  &lt;template #suffix&gt;{{ tr('245 KB', '245 КБ') }}&lt;/template&gt;
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
