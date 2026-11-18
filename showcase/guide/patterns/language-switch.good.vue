<script setup>
import { ref } from 'vue'
import { TaoFlex, TaoLanguageSwitch, TaoThemeToggle } from '@1337exp/taoui'

// the page's own language, so the demo does not change it
const lang = ref(document.documentElement.lang === 'ru' ? 'ru' : 'en')
</script>

<template>
  <TaoFlex align="center" :gap="8">
    <TaoLanguageSwitch v-model="lang" :languages="['en', 'ru', 'de', 'fr', 'ja']" />
    <TaoThemeToggle :apply="false" />
  </TaoFlex>
</template>
