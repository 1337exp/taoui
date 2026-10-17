<script setup>
import { computed } from 'vue'
import PropsTable from './PropsTable.vue'
import { lang } from '../i18n.js'
import { propTablesEn } from '../propTables.en.js'

defineOptions({ name: 'ShowcaseSection' })

const props = defineProps({
  id: { type: String, required: true },
  // The Russian tables (propTables.js). English ones, when written, replace them.
  tables: { type: Array, default: () => [] },
})

const shown = computed(() => (lang.value === 'en' && propTablesEn[props.id]) || props.tables)
</script>

<template>
  <section :id="id" class="showcase-section">
    <slot />
    <div v-if="shown.length" class="showcase-section__props">
      <PropsTable
        v-for="(table, index) in shown"
        :key="table.title || index"
        :title="table.title"
        :kind="table.kind || 'props'"
        :rows="table.rows"
        :slots="table.slots || ''"
      />
    </div>
  </section>
</template>
