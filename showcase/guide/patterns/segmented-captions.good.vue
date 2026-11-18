<script setup>
import { ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'

const every = ref('month')
</script>

<template>
  <div style="width: 240px">
    <TaoSegmented v-model="every" legend="How often will we charge you?" block>
      <TaoSegmentedOption value="month">Monthly</TaoSegmentedOption>
      <TaoSegmentedOption value="once">Once</TaoSegmentedOption>
    </TaoSegmented>
  </div>
</template>
