<script setup>
import { TaoButton, TaoFlex } from '@1337exp/taoui'
</script>

<template>
  <TaoFlex justify="flex-end" :gap="8">
    <TaoButton variant="secondary" tone="danger">Keep</TaoButton>
    <TaoButton icon="tao-trash">Delete</TaoButton>
  </TaoFlex>
</template>
