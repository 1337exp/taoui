<script setup>
import PropsTable from './PropsTable.vue'

defineOptions({ name: 'ShowcaseSection' })

defineProps({
  id: { type: String, required: true },
  tables: { type: Array, default: () => [] },
})
</script>

<template>
  <section :id="id" class="showcase-section">
    <slot />
    <div v-if="tables.length" class="showcase-section__props">
      <PropsTable
        v-for="(table, index) in tables"
        :key="table.title || index"
        :title="table.title"
        :kind="table.kind || 'props'"
        :rows="table.rows"
        :slots="table.slots || ''"
      />
    </div>
  </section>
</template>
