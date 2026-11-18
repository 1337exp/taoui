<script setup>
import { ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'

const every = ref('month')
</script>

<template>
  <div style="width: 240px">
    <TaoSegmented v-model="every" legend="Billing" block>
      <TaoSegmentedOption value="month">Charge me every month until I cancel</TaoSegmentedOption>
      <TaoSegmentedOption value="once">Charge me once, at the end of the year</TaoSegmentedOption>
    </TaoSegmented>
  </div>
</template>
