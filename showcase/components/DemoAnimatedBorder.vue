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
          <p>{{ tr('A container with an animated border: the rainbow, the colours of a tone (so it follows the theme), or your own list. A still gradient with prefers-reduced-motion.', 'Контейнер с анимированной рамкой: радуга, цвета тона (поэтому следует теме) или свой список. При prefers-reduced-motion градиент стоит на месте.') }}</p>

          <div style="display: flex; gap: 24px; flex-wrap: wrap;">
            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">{{ tr('Default — the outline only', 'По умолчанию — только контур') }}</p>
              <TaoAnimatedBorder style="padding: 20px; display: inline-block;">
                {{ tr('Border only', 'Только рамка') }}
              </TaoAnimatedBorder>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">variant="tone"</p>
              <TaoAnimatedBorder variant="tone" style="padding: 20px; display: inline-block;">
                {{ tr('The theme accent', 'Акцент темы') }}
              </TaoAnimatedBorder>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">variant="tone" tone="success"</p>
              <TaoAnimatedBorder variant="tone" tone="success" style="padding: 20px; display: inline-block;">
                success
              </TaoAnimatedBorder>
            </div>

            <div>
              <p style="margin-bottom: 8px; font-size: 13px;">:colors</p>
              <TaoAnimatedBorder :colors="['#ff7a18', '#ffd200', '#ff7a18']" :radius="16" style="padding: 20px; display: inline-block;">
                {{ tr('Your colours', 'Свои цвета') }}
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

&lt;TaoAnimatedBorder variant="tone" tone="success" :radius="16"&gt;success&lt;/TaoAnimatedBorder&gt;

&lt;TaoAnimatedBorder :colors="['#ff7a18', '#ffd200']"&gt;...&lt;/TaoAnimatedBorder&gt;

&lt;TaoAnimatedBorder light&gt;
  {{ tr('Outline + a soft glow around it', 'Контур + мягкое свечение вокруг') }}
&lt;/TaoAnimatedBorder&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
