<script setup>
import { ref } from 'vue'
import { TaoProgress, TaoSlider } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSlider' })

const sliderValue = ref(35)
const sliderVolume = ref(70)
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
          <p style="margin-top: 4px; font-size: 13px;">Значение: {{ sliderValue }} — <em>ПКМ по слайдеру открывает точный ввод числа</em></p>
    
          <h3>size="small"</h3>
          <TaoSlider v-model="sliderVolume" size="small" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">Громкость: {{ sliderVolume }}</p>
    
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
    &lt;TaoSlider v-model="volume" size="small" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
