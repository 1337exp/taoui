<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { TaoCounter, TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCounter' })

const counterValue = ref(1284)

// a clock: the mask draws the colons, the value is the digits hhmmss
// часы: маска рисует двоеточия, значение — цифры ччммсс
const seconds = ref(3 * 60 + 30)
const running = ref(false)
let timer
const clock = computed(() => {
  const s = seconds.value
  return (Math.floor(s / 3600) % 100) * 10000 + (Math.floor(s / 60) % 60) * 100 + (s % 60)
})

function toggleClock() {
  running.value = !running.value
  clearInterval(timer)
  if (running.value) {
    timer = setInterval(() => { seconds.value += 1 }, 1000)
  }
}

onBeforeUnmount(() => clearInterval(timer))

const price = ref(1250)
</script>

<template>
  <ShowcaseSection id="counter" :tables="propTables['counter']">
    <h2>TaoCounter</h2>
          <p>{{ tr('A number display, not an input. The digits flip when the value changes. For a balance, a score, an online count.', 'Витрина числа, не поле ввода. Цифры переворачиваются при смене значения. Для баланса, счёта, онлайна.') }}</p>

          <TaoCounter :value="counterValue" :max-digits="6" />
          <div class="button-row" style="margin-top: 12px;">
            <TaoButton size="small" variant="secondary" @click="counterValue = Math.max(0, counterValue - 1)">−1</TaoButton>
            <TaoButton size="small" @click="counterValue += 1">+1</TaoButton>
            <TaoButton size="small" variant="ghost" @click="counterValue += 100">+100</TaoButton>
            <TaoButton size="small" variant="ghost" @click="counterValue += 1337">+1337</TaoButton>
          </div>
          <p style="margin-top: 8px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ counterValue }}</p>

          <h3>{{ tr('A mask: format', 'Маска: format') }}</h3>
          <p>{{ tr('As in TaoPinCode: # is a digit (a wheel), any other character is drawn as it is. The mask fixes the number of digits, so a number that does not fit shows as all nines. Without a mask the counter is grouped by thousands and grows with the number.', 'Как в TaoPinCode: # — цифра (колёсико), любой другой символ рисуется как есть. Маска задаёт число цифр, поэтому число, которое не влезло, показано одними девятками. Без маски счётчик группирует по тысячам и растёт вместе с числом.') }}</p>

          <div class="demo-counter-rows">
            <span class="demo-counter-note">{{ tr('A clock, hhmmss, the zeros stay bright', 'Часы, ччммсс, нули не приглушены') }}</span>
            <div>
              <TaoCounter :value="clock" format="##:##:##" :mute-zeros="false" />
              <div class="button-row" style="margin-top: 8px;">
                <TaoButton size="small" @click="toggleClock">{{ running ? tr('Pause', 'Пауза') : tr('Start', 'Пуск') }}</TaoButton>
                <TaoButton size="small" variant="ghost" @click="seconds = 0">{{ tr('Reset', 'Сброс') }}</TaoButton>
              </div>
            </div>

            <span class="demo-counter-note">{{ tr('A unit after the digits', 'Единица после цифр') }}</span>
            <div>
              <TaoCounter :value="price" format="### ###₽" />
              <div class="button-row" style="margin-top: 8px;">
                <TaoButton size="small" variant="secondary" @click="price = Math.max(0, price - 250)">−250</TaoButton>
                <TaoButton size="small" @click="price += 250">+250</TaoButton>
                <TaoButton size="small" variant="ghost" @click="price = 999999">999 999</TaoButton>
                <TaoButton size="small" variant="ghost" @click="price += 1000000">+1 000 000</TaoButton>
              </div>
            </div>

            <span class="demo-counter-note">{{ tr('A prefix, a digit in the mask is text', 'Приставка, цифра в маске — текст') }}</span>
            <TaoCounter :value="9261234" format="+7 ### ##-##" :mute-zeros="false" />

            <span class="demo-counter-note">{{ tr('Commas, a negative number', 'Запятые, отрицательное число') }}</span>
            <TaoCounter :value="-1234567" format="#,###,###" />
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoCounter :value="score" :max-digits="6" /&gt;

&lt;TaoCounter :value="hhmmss" format="##:##:##" :mute-zeros="false" /&gt;
&lt;TaoCounter :value="price" format="### ###₽" /&gt;
&lt;TaoCounter :value="phone" format="+7 ### ##-##" :mute-zeros="false" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-counter-rows {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) auto;
  gap: var(--tao-space-3) var(--tao-space-4);
  align-items: center;
  margin-top: var(--tao-space-3);
}

.demo-counter-note {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

@media (max-width: 600px) {
  .demo-counter-rows {
    grid-template-columns: 1fr;
    gap: var(--tao-space-1);
  }

  .demo-counter-note {
    margin-top: var(--tao-space-3);
  }
}
</style>
