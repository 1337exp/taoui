<script setup>
import { ref } from 'vue'
import { TaoButton, TaoToolbar, TaoToolbarGroup, TaoToolbarSeparator } from '@1337exp/taoui'
import './icons.js'

const bold = ref(true)
const italic = ref(false)
</script>

<template>
  <TaoToolbar label="Formatting">
    <TaoToolbarGroup label="Text style">
      <TaoButton v-model:pressed="bold" variant="ghost" icon="bold" aria-label="Bold" />
      <TaoButton v-model:pressed="italic" variant="ghost" icon="italic" aria-label="Italic" />
    </TaoToolbarGroup>
    <TaoToolbarSeparator />
    <TaoButton variant="ghost" icon="tao-undo" aria-label="Undo" />
    <TaoButton variant="ghost" icon="tao-redo" aria-label="Redo" />
  </TaoToolbar>
</template>
