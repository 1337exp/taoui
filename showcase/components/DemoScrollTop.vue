<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoScrollTop' })
</script>

<template>
  <ShowcaseSection id="scrolltop" :tables="propTables['scrolltop']">
    <h2>TaoScrollTop</h2>
          <p>
            Плавающая кнопка «наверх». Появляется при обратном скролле после порога
            <code>boundary</code>. Сама кнопка — в правом нижнем углу страницы.
          </p>
          <p class="carousel-note">Прокрутите витрину вниз и чуть вверх — кнопка всплывёт справа внизу.</p>
    
          <div class="code-block">
            <pre><code>&lt;TaoScrollTop :boundary="200" /&gt;
&lt;TaoScrollTop :size="48" :right="16" :bottom="16" aria-label="Back to top" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
