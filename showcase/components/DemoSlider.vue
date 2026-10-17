<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { TaoProgress, TaoRangeSlider, TaoSlider, TaoTimeline } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSlider' })

const sliderValue = ref(35)
const sliderVolume = ref(70)
const sliderWheel = ref(50)
const sliderRange = ref([200, 4000])
const sliderColor = ref(3)
// The timeline does not keep time itself: here a simple timer drives it (in projects: usePlayback from @1337exp/taoux/playback)
const time = ref(1.25)
const playing = ref(false)
let timer = 0
watch(playing, (on) => {
  clearInterval(timer)
  if (on) timer = window.setInterval(() => { time.value = (time.value + 0.05) % 8 }, 50)
})
onBeforeUnmount(() => clearInterval(timer))
const colorMarks = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D'].map((label, value) => ({ value, label }))
</script>

<template>
  <ShowcaseSection id="slider" :tables="propTables['slider']">
    <h2>TaoProgress / TaoSlider / TaoTimeline</h2>
          <Tr>
            <template #en><p>A static bar and a slider. The percentage sits on top in the centre or on the right with <code>show-percentage="right"</code>; if <code>#right</code> is present, the percentage goes on the right in brackets. <code>:show-percentage="false"</code> hides it. The slider listens to the arrows, Home/End and PageUp/Down. It is a form control by default; <code>size="small"</code> gives a thin track for seek / volume.</p></template>
            <template #ru><p>Статичная полоса и слайдер. Проценты сверху по центру или <code>show-percentage="right"</code> справа; если есть <code>#right</code>, процент справа в скобках. <code>:show-percentage="false"</code> прячет. Слайдер слушает стрелки, Home/End и PageUp/Down. По умолчанию — форм-контрол; <code>size="small"</code> — тонкий трек для seek / громкости.</p></template>
          </Tr>
    
          <h3>TaoProgress</h3>
          <div class="demo-stack">
            <TaoProgress :progress="65" />
            <TaoProgress :progress="50">
              <template #left>{{ tr('0 KB', '0кб') }}</template>
              <template #right>{{ tr('50 KB', '50кб') }}</template>
            </TaoProgress>
            <TaoProgress :progress="50" show-percentage="right">
              <template #left>{{ tr('0 KB', '0кб') }}</template>
              <template #right>{{ tr('50 KB', '50кб') }}</template>
            </TaoProgress>
            <TaoProgress :progress="50" :show-percentage="false">
              <template #left>{{ tr('0 KB', '0кб') }}</template>
              <template #right>{{ tr('50 KB', '50кб') }}</template>
            </TaoProgress>
          </div>
    
          <h3>TaoSlider</h3>
          <TaoSlider v-model="sliderValue" show-value class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Value', 'Значение') }}: {{ sliderValue }}</p>
    
          <h3>variant="thin"</h3>
          <TaoSlider v-model="sliderVolume" variant="thin" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Volume', 'Громкость') }}: {{ sliderVolume }}</p>

          <h3>wheel</h3>
          <TaoSlider v-model="sliderWheel" variant="thin" :wheel="5" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Volume with a wheel', 'Громкость с колёсиком') }}: {{ sliderWheel }} — <em>{{ tr('scrolling over the slider changes the value by 5', 'прокрутка над слайдером меняет значение на 5') }}</em></p>
    
          <h3>TaoRangeSlider, marks, discrete</h3>
          <TaoRangeSlider v-model="sliderRange" :min="0" :max="5000" :step="100" marks class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Range', 'Диапазон') }}: {{ sliderRange[0] }} – {{ sliderRange[1] }}</p>
          <TaoSlider v-model="sliderColor" :min="0" :max="7" :marks="colorMarks" discrete class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('A stepped scale: the value sits only on the marks, a click on a label moves the handle', 'Ступенчатая шкала: значение только на метках, клик по подписи переносит ручку') }}</p>

          <h3>TaoTimeline</h3>
          <TaoTimeline v-model="time" v-model:playing="playing" :length="8" :marks="[0, 2, 4, 6]" :format="(t) => tr(`${t.toFixed(2)} s`, `${t.toFixed(2)} с`)" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Buttons, a slider with event marks and a caption. It does not keep time itself: v-model and v-model:playing', 'Кнопки, слайдер с метками событий и подпись. Время не ведёт сам: v-model и v-model:playing') }}</p>

          <div class="code-block">
            <pre><code>&lt;TaoProgress :progress="65" /&gt;

&lt;TaoProgress :progress="50"&gt;
  &lt;template #left&gt;{{ tr('0 KB', '0кб') }}&lt;/template&gt;
  &lt;template #right&gt;{{ tr('50 KB', '50кб') }}&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" show-percentage="right"&gt;
  &lt;template #left&gt;{{ tr('0 KB', '0кб') }}&lt;/template&gt;
  &lt;template #right&gt;{{ tr('50 KB', '50кб') }}&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" :show-percentage="false"&gt;
  &lt;template #left&gt;{{ tr('0 KB', '0кб') }}&lt;/template&gt;
  &lt;template #right&gt;{{ tr('50 KB', '50кб') }}&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoSlider v-model="value" show-value /&gt;
&lt;TaoSlider v-model="volume" variant="thin" /&gt;
&lt;TaoSlider v-model="volume" variant="thin" :wheel="5" /&gt;
&lt;TaoRangeSlider v-model="range" :min="0" :max="5000" :step="100" marks /&gt;
&lt;TaoSlider v-model="color" :min="0" :max="7" :marks="colorMarks" discrete /&gt;
&lt;TaoTimeline v-model="time" v-model:playing="playing" :length="8" :marks="[0, 2, 4, 6]" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
