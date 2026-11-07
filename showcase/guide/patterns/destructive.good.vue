<script setup>
import { TaoButton, TaoFlex } from '@1337exp/taoui'
</script>

<template>
  <TaoFlex justify="flex-end" :gap="8">
    <TaoButton variant="secondary">Keep</TaoButton>
    <TaoButton tone="danger" icon="tao-trash">Delete</TaoButton>
  </TaoFlex>
</template>
