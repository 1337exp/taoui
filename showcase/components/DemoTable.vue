<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoTable, TaoEmpty, TaoTag, TaoPagination, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { lang } from '../i18n.js'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTable' })

const tableStatuses = ['active', 'paused', 'banned']
const tableAll = computed(() => {
  const cities = [
    tr('Moscow', 'Москва'),
    tr('Kazan', 'Казань'),
    tr('Saint Petersburg', 'Санкт-Петербург'),
    tr('Novosibirsk', 'Новосибирск'),
  ]
  return Array.from({ length: 47 }, (_, index) => ({
    id: index + 1,
    name: `${tr('User', 'Пользователь')} ${String(index + 1).padStart(2, '0')}`,
    city: cities[index % cities.length],
    orders: (index * 7) % 41,
    status: tableStatuses[index % 3],
  }))
})
const tableColumns = computed(() => [
  { key: 'name', label: tr('Name', 'Имя'), sortable: true },
  { key: 'city', label: tr('City', 'Город'), sortable: true },
  { key: 'orders', label: tr('Orders', 'Заказы'), align: 'right', sortable: true, width: 110 },
  { key: 'status', label: tr('Status', 'Статус'), width: 140 },
])
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
  const rows = tableAll.value.slice()
  const sort = tableSort.value
  if (!sort) return rows
  return rows.sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    const cmp =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), lang.value)
    return sort.dir === 'asc' ? cmp : -cmp
  })
})

const tableRows = computed(() => {
  if (tableEmpty.value) return []
  const start = (tablePage.value - 1) * tablePageSize
  return tableSorted.value.slice(start, start + tablePageSize)
})

const tableTotal = computed(() => (tableEmpty.value ? 0 : tableAll.value.length))

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
          <Tr>
            <template #en><p>A simple table for lists of entities. It neither sorts nor paginates — the parent does that, so the same component works with a server too. Header highlight — <code>head</code>, lines — <code>lines</code>. Zebra — <code>striped</code> (from the first row) or <code>striped="even"</code>.</p></template>
            <template #ru><p>Простая таблица для списков сущностей. Сама не сортирует и не режет страницы — это делает родитель, поэтому тот же компонент работает и с сервером. Подсветка шапки — <code>head</code>, линии — <code>lines</code>. Зебра — <code>striped</code> (с первой строки) или <code>striped="even"</code>.</p></template>
          </Tr>
    
          <div class="button-row">
            <TaoButton size="small" variant="secondary" @click="flashTableLoading">{{ tr('Loading', 'Загрузка') }}</TaoButton>
            <TaoButton size="small" variant="ghost" @click="tableEmpty = !tableEmpty; tablePage = 1">
              {{ tableEmpty ? tr('Show rows', 'Показать строки') : tr('Empty table', 'Пустая таблица') }}
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
            :empty-text="tr('No records yet', 'Пока нет записей')"
            @change="onTableSort"
            @row-click="(row) => toast().info().message(row.name)"
          >
            <template #empty>
              <TaoEmpty :title="tr('No records yet', 'Пока нет записей')">{{ tr('The list is empty — press “Show rows”.', 'Список пуст — нажмите «Показать строки».') }}</TaoEmpty>
            </template>
            <template #cell-status="{ row }">
              <TaoTag :tone="row.status === 'active' ? 'success' : row.status === 'banned' ? 'danger' : 'neutral'">
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
    &lt;TaoTag :tone="row.status === 'active' ? 'success' : 'neutral'"&gt;
      &#123;&#123; row.status &#125;&#125;
    &lt;/TaoTag&gt;
  &lt;/template&gt;
&lt;/TaoTable&gt;

&lt;TaoPagination v-model:page="page" :total="rows.length" :page-size="8" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
