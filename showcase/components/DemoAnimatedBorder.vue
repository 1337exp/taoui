<script setup>
import { TaoAnimatedBorder } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAnimatedBorder' })
</script>

<template>
  <ShowcaseSection id="animated-border" :tables="propTables['animated-border']">
    <h2>TaoAnimatedBorder</h2>
          <p>{{ tr('A container with an animated rainbow border — a decorative effect, independent of the theme', 'Контейнер с анимированной радужной рамкой — декоративный эффект, не завязан на тему') }}</p>

          <div style="display: flex; gap: 24px; flex-wrap: wrap;">
            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">{{ tr('Default — the outline only', 'По умолчанию — только контур') }}</p>
              <TaoAnimatedBorder style="padding: 20px; display: inline-block;">
                {{ tr('Border only', 'Только рамка') }}
              </TaoAnimatedBorder>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">{{ tr('light — border + a soft glow', 'light — рамка + мягкое свечение') }}</p>
              <TaoAnimatedBorder light style="padding: 20px; display: inline-block;">
                {{ tr('Border with a glow', 'Рамка со свечением') }}
              </TaoAnimatedBorder>
            </div>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoAnimatedBorder&gt;
  {{ tr('Just the shimmering outline', 'Только переливающийся контур') }}
&lt;/TaoAnimatedBorder&gt;

&lt;TaoAnimatedBorder light&gt;
  {{ tr('Outline + a soft glow around it', 'Контур + мягкое свечение вокруг') }}
&lt;/TaoAnimatedBorder&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
