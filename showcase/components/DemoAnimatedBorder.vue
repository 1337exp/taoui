<script setup>
import { TaoAnimatedBorder } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAnimatedBorder' })
</script>

<template>
  <ShowcaseSection id="animated-border" :tables="propTables['animated-border']">
    <h2>TaoAnimatedBorder</h2>
          <p>Контейнер с анимированной радужной рамкой — декоративный эффект, не завязан на тему</p>
    
          <div style="display: flex; gap: 24px; flex-wrap: wrap;">
            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">По умолчанию — только контур</p>
              <TaoAnimatedBorder style="padding: 20px; display: inline-block;">
                Только рамка
              </TaoAnimatedBorder>
            </div>
    
            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">light — рамка + мягкое свечение</p>
              <TaoAnimatedBorder light style="padding: 20px; display: inline-block;">
                Рамка со свечением
              </TaoAnimatedBorder>
            </div>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoAnimatedBorder&gt;
      Только переливающийся контур
    &lt;/TaoAnimatedBorder&gt;
    
    &lt;TaoAnimatedBorder light&gt;
      Контур + мягкое свечение вокруг
    &lt;/TaoAnimatedBorder&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
