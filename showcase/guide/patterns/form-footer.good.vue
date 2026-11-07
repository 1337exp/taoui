<script setup>
import { TaoButton, TaoFlex } from '@1337exp/taoui'
</script>

<template>
  <TaoFlex justify="flex-end" :gap="8">
    <TaoButton variant="secondary">Cancel</TaoButton>
    <TaoButton>Save</TaoButton>
  </TaoFlex>
</template>
