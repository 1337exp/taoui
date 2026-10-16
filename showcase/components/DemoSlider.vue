<script setup>
import { ref } from 'vue'
import { TaoProgress, TaoRangeSlider, TaoSlider } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSlider' })

const sliderValue = ref(35)
const sliderVolume = ref(70)
const sliderWheel = ref(50)
const sliderRange = ref([200, 4000])
const sliderColor = ref(3)
const colorMarks = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D'].map((label, value) => ({ value, label }))
</script>

<template>
  <ShowcaseSection id="slider" :tables="propTables['slider']">
    <h2>TaoProgress / TaoSlider</h2>
          <p>Статичная полоса и слайдер. Проценты сверху по центру или <code>show-percentage="right"</code> справа; если есть <code>#right</code>, процент справа в скобках. <code>:show-percentage="false"</code> прячет. Слайдер слушает стрелки, Home/End и PageUp/Down. По умолчанию — форм-контрол; <code>size="small"</code> — тонкий трек для seek / громкости.</p>
    
          <h3>TaoProgress</h3>
          <div class="demo-stack">
            <TaoProgress :progress="65" />
            <TaoProgress :progress="50">
              <template #left>0кб</template>
              <template #right>50кб</template>
            </TaoProgress>
            <TaoProgress :progress="50" show-percentage="right">
              <template #left>0кб</template>
              <template #right>50кб</template>
            </TaoProgress>
            <TaoProgress :progress="50" :show-percentage="false">
              <template #left>0кб</template>
              <template #right>50кб</template>
            </TaoProgress>
          </div>
    
          <h3>TaoSlider</h3>
          <TaoSlider v-model="sliderValue" show-value class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Значение: {{ sliderValue }}</p>
    
          <h3>variant="thin"</h3>
          <TaoSlider v-model="sliderVolume" variant="thin" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Громкость: {{ sliderVolume }}</p>

          <h3>wheel</h3>
          <TaoSlider v-model="sliderWheel" variant="thin" :wheel="5" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Громкость с колёсиком: {{ sliderWheel }} — <em>прокрутка над слайдером меняет значение на 5</em></p>
    
          <h3>TaoRangeSlider, marks, discrete</h3>
          <TaoRangeSlider v-model="sliderRange" :min="0" :max="5000" :step="100" marks class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Диапазон: {{ sliderRange[0] }} – {{ sliderRange[1] }}</p>
          <TaoSlider v-model="sliderColor" :min="0" :max="7" :marks="colorMarks" discrete class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Ступенчатая шкала: значение только на метках, клик по подписи переносит ручку</p>

          <div class="code-block">
            <pre><code>&lt;TaoProgress :progress="65" /&gt;

&lt;TaoProgress :progress="50"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" show-percentage="right"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" :show-percentage="false"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoSlider v-model="value" show-value /&gt;
&lt;TaoSlider v-model="volume" variant="thin" /&gt;
&lt;TaoSlider v-model="volume" variant="thin" :wheel="5" /&gt;
&lt;TaoRangeSlider v-model="range" :min="0" :max="5000" :step="100" marks /&gt;
&lt;TaoSlider v-model="color" :min="0" :max="7" :marks="colorMarks" discrete /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
