<script setup>
import { ref } from 'vue'
import { TaoFlex, TaoSegmented, TaoSegmentedOption, TaoThemeToggle } from '@1337exp/taoui'

const lang = ref('en')
</script>

<template>
  <TaoFlex align="center" :gap="8">
    <TaoSegmented v-model="lang" aria-label="Language">
      <TaoSegmentedOption value="en">EN</TaoSegmentedOption>
      <TaoSegmentedOption value="ru">RU</TaoSegmentedOption>
      <TaoSegmentedOption value="de">DE</TaoSegmentedOption>
      <TaoSegmentedOption value="fr">FR</TaoSegmentedOption>
      <TaoSegmentedOption value="ja">JA</TaoSegmentedOption>
    </TaoSegmented>
    <TaoThemeToggle :apply="false" />
  </TaoFlex>
</template>
