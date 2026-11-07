<script setup>
import { ref } from 'vue'
import { TaoButton, TaoFlex, TaoSegmented, TaoSegmentedOption, TaoSelect } from '@1337exp/taoui'

const mode = ref('grid')
const palette = ref('sunset')
const palettes = [
  { value: 'sunset', label: 'Sunset' },
  { value: 'lagoon', label: 'Lagoon' },
]
</script>

<template>
  <TaoFlex class="tao-size-small" align="center" :gap="8">
    <TaoSegmented v-model="mode" aria-label="Mode">
      <TaoSegmentedOption value="grid">Grid</TaoSegmentedOption>
      <TaoSegmentedOption value="list">List</TaoSegmentedOption>
    </TaoSegmented>
    <TaoSelect v-model="palette" :options="palettes" :clearable="false" aria-label="Palette" />
    <TaoButton variant="secondary">Apply</TaoButton>
  </TaoFlex>
</template>
