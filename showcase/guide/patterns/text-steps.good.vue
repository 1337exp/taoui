<script setup>
import { TaoButton } from '@1337exp/taoui'
</script>

<template>
  <div class="tao-panel" style="padding: 16px; display: grid; gap: 6px; justify-items: start">
    <strong style="color: var(--tao-color-text-strong)">Billing</strong>
    <span style="color: var(--tao-color-text)">Your plan renews on 1 December.</span>
    <small style="color: var(--tao-color-text-muted)">Invoices go to the owner of the account.</small>
    <TaoButton variant="ghost" tone="neutral">Change plan</TaoButton>
  </div>
</template>
