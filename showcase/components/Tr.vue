<script setup>
import { lang } from '../i18n.js'

defineOptions({ name: 'Tr' })

// <Tr>
//   <template #en>English markup</template>
//   <template #ru>Русская разметка</template>
// </Tr>
// A missing language falls back to the other one.
</script>

<template>
  <slot v-if="$slots[lang]" :name="lang" />
  <slot v-else :name="lang === 'ru' ? 'en' : 'ru'" />
</template>
