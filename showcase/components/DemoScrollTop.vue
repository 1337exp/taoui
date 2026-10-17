<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoScrollTop' })
</script>

<template>
  <ShowcaseSection id="scrolltop" :tables="propTables['scrolltop']">
    <h2>TaoScrollTop</h2>
          <Tr>
            <template #en>
              <p>
                A floating “back to top” button. It appears on a reverse scroll past the
                <code>boundary</code> threshold. The button itself sits in the bottom right corner of the page.
              </p>
              <p class="carousel-note">Scroll the showcase down and a little back up — the button pops up at the bottom right.</p>
            </template>
            <template #ru>
              <p>
                Плавающая кнопка «наверх». Появляется при обратном скролле после порога
                <code>boundary</code>. Сама кнопка — в правом нижнем углу страницы.
              </p>
              <p class="carousel-note">Прокрутите витрину вниз и чуть вверх — кнопка всплывёт справа внизу.</p>
            </template>
          </Tr>
    
          <div class="code-block">
            <pre><code>&lt;TaoScrollTop :boundary="200" /&gt;
&lt;TaoScrollTop :size="48" :right="16" :bottom="16" aria-label="Back to top" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
