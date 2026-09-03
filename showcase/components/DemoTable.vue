<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoTable, TaoEmpty, TaoTag, TaoPagination, toast } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTable' })

const tableCities = ['Москва', 'Казань', 'Санкт-Петербург', 'Новосибирск']
const tableStatuses = ['active', 'paused', 'banned']
const tableAll = Array.from({ length: 47 }, (_, index) => ({
  id: index + 1,
  name: `Пользователь ${String(index + 1).padStart(2, '0')}`,
  city: tableCities[index % tableCities.length],
  orders: (index * 7) % 41,
  status: tableStatuses[index % 3],
}))
const tableColumns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'city', label: 'Город', sortable: true },
  { key: 'orders', label: 'Заказы', align: 'right', sortable: true, width: 110 },
  { key: 'status', label: 'Статус', width: 140 },
]
const tablePage = ref(1)
const tablePageSize = 8
const tableSort = ref({ key: 'name', dir: 'asc' })
const tableLoading = ref(false)
const tableEmpty = ref(false)
const tableHead = ref(true)
const tableLines = ref(true)
const tableStriped = ref(true)

const stripedLabel = computed(() => {
  if (tableStriped.value === 'even') return 'even'
  if (tableStriped.value) return 'striped'
  return 'striped off'
})

function cycleStriped() {
  tableStriped.value =
    tableStriped.value === true ? 'even' : tableStriped.value === 'even' ? false : true
}

const tableSorted = computed(() => {
  const rows = tableAll.slice()
  const sort = tableSort.value
  if (!sort) return rows
  return rows.sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    const cmp =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'ru')
    return sort.dir === 'asc' ? cmp : -cmp
  })
})

const tableRows = computed(() => {
  if (tableEmpty.value) return []
  const start = (tablePage.value - 1) * tablePageSize
  return tableSorted.value.slice(start, start + tablePageSize)
})

const tableTotal = computed(() => (tableEmpty.value ? 0 : tableAll.length))

function onTableSort() {
  tablePage.value = 1
}

function flashTableLoading() {
  tableLoading.value = true
  window.setTimeout(() => {
    tableLoading.value = false
  }, 1100)
}
</script>

<template>
  <ShowcaseSection id="table" :tables="propTables['table']">
    <h2>TaoTable</h2>
          <p>Простая таблица для списков сущностей. Сама не сортирует и не режет страницы — это делает родитель, поэтому тот же компонент работает и с сервером. Подсветка шапки — <code>head</code>, линии — <code>lines</code>. Зебра — <code>striped</code> (с первой строки) или <code>striped="even"</code>.</p>
    
          <div class="button-row">
            <TaoButton size="small" variant="secondary" @click="flashTableLoading">Загрузка</TaoButton>
            <TaoButton size="small" variant="ghost" @click="tableEmpty = !tableEmpty; tablePage = 1">
              {{ tableEmpty ? 'Показать строки' : 'Пустая таблица' }}
            </TaoButton>
            <TaoButton size="small" :variant="tableHead ? 'secondary' : 'ghost'" @click="tableHead = !tableHead">
              head
            </TaoButton>
            <TaoButton size="small" :variant="tableLines ? 'secondary' : 'ghost'" @click="tableLines = !tableLines">
              lines
            </TaoButton>
            <TaoButton size="small" :variant="tableStriped ? 'secondary' : 'ghost'" @click="cycleStriped">
              {{ stripedLabel }}
            </TaoButton>
          </div>
    
          <TaoTable
            :columns="tableColumns"
            :rows="tableRows"
            v-model:sort="tableSort"
            :loading="tableLoading"
            :head="tableHead"
            :lines="tableLines"
            :striped="tableStriped"
            clickable
            empty-text="Пока нет записей"
            @sort="onTableSort"
            @row-click="(row) => toast().info().message(row.name)"
          >
            <template #empty>
              <TaoEmpty title="Пока нет записей">Список пуст — нажмите «Показать строки».</TaoEmpty>
            </template>
            <template #cell-status="{ row }">
              <TaoTag :type="row.status === 'active' ? 'success' : row.status === 'banned' ? 'danger' : 'neutral'">
                {{ row.status }}
              </TaoTag>
            </template>
          </TaoTable>
    
          <TaoPagination
            v-model:page="tablePage"
            :total="tableTotal"
            :page-size="tablePageSize"
            style="margin-top: 12px;"
          />
    
          <div class="code-block">
            <pre><code>&lt;TaoTable :columns="columns" :rows="pageRows" v-model:sort="sort" empty-text="No records yet"&gt;
  &lt;template #cell-status="{ row }"&gt;
    &lt;TaoTag :type="row.status === 'active' ? 'success' : 'neutral'"&gt;
      &#123;&#123; row.status &#125;&#125;
    &lt;/TaoTag&gt;
  &lt;/template&gt;
&lt;/TaoTable&gt;

&lt;TaoPagination v-model:page="page" :total="rows.length" :page-size="8" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
