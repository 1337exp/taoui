<script setup>
import { ref } from 'vue'
import { TaoChecklist, TaoCombobox, TaoDate, TaoDateRange, TaoEmpty, TaoFileDrop, TaoPagination, TaoSelect, TaoTable } from '@1337exp/taoui'

defineOptions({ name: 'LocaleSpecimen' })

// The same components, with no text given by hand: every word on them comes from the locale around.
// Те же компоненты без единого текста, заданного руками: каждое слово на них берётся из локали вокруг.
const select = ref('')
const combo = ref('')
const date = ref('2026-11-05')
const range = ref(['', ''])
const checked = ref(['a'])
const page = ref(3)
const files = ref([])
const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
]
const items = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' },
  { value: 'c', label: 'C' },
]
</script>

<template>
  <div class="specimen">
    <TaoSelect v-model="select" :options="options" />
    <TaoCombobox v-model="combo" :options="options" />
    <TaoDate v-model="date" />
    <TaoDateRange v-model="range" />
    <TaoChecklist v-model="checked" :items="items" select-all counter />
    <TaoPagination v-model:page="page" :total="500" :page-size="10" :page-sizes="[10, 20, 50]" size="small" />
    <TaoTable :columns="[{ key: 'a', label: 'A' }]" :rows="[]" />
    <TaoEmpty />
    <TaoFileDrop v-model="files" />
  </div>
</template>

<style scoped>
.specimen {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
