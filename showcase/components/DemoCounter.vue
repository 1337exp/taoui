<script setup>
import { ref } from 'vue'
import { TaoCounter, TaoButton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCounter' })

const counterValue = ref(1284)
</script>

<template>
  <ShowcaseSection id="counter" :tables="propTables['counter']">
    <h2>TaoCounter</h2>
          <p>Витрина числа, не поле ввода. Цифры переворачиваются при смене значения. Для баланса, счёта, онлайна.</p>
    
          <TaoCounter :value="counterValue" :max-digits="6" />
          <div class="button-row" style="margin-top: 12px;">
            <TaoButton size="small" variant="secondary" @click="counterValue = Math.max(0, counterValue - 1)">−1</TaoButton>
            <TaoButton size="small" @click="counterValue += 1">+1</TaoButton>
            <TaoButton size="small" variant="ghost" @click="counterValue += 100">+100</TaoButton>
          </div>
          <p style="margin-top: 8px; font-size: 13px;">Значение: {{ counterValue }}</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoCounter :value="score" :max-digits="6" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
