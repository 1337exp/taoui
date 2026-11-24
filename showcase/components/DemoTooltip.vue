<script setup>
import { TaoTooltip, TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTooltip' })
</script>

<template>
  <ShowcaseSection id="tooltip" :tables="propTables['tooltip']">
    <h2>TaoTooltip</h2>
          <Tr>
            <template #en>
              <p>
                A hint on hover and focus. The side is <code>top</code> / <code>bottom</code> /
                <code>left</code> / <code>right</code>. If it does not fit, it flips and sticks to the screen edge.
              </p>
            </template>
            <template #ru>
              <p>
                Подсказка при наведении и фокусе. Сторона — <code>top</code> / <code>bottom</code> /
                <code>left</code> / <code>right</code>. Если не влезает, переворачивается и прижимается к краю экрана.
              </p>
            </template>
          </Tr>
          
          <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
            <TaoTooltip :content="tr('A hint on top', 'Подсказка сверху')" placement="top">
              <TaoButton variant="secondary">Top</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint below', 'Подсказка снизу')" placement="bottom">
              <TaoButton variant="secondary">Bottom</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint on the left', 'Подсказка слева')" placement="left">
              <TaoButton variant="secondary">Left</TaoButton>
            </TaoTooltip>
    
            <TaoTooltip :content="tr('A hint on the right', 'Подсказка справа')" placement="right">
              <TaoButton variant="secondary">Right</TaoButton>
            </TaoTooltip>
          </div>
    
          <Tr>
            <template #en>
              <p>
                The tip is the opposite of the theme: dark on a light one, light on a dark one, so it does not melt into the
                panels it hangs over. <code>shortcut</code> adds the key as a key cap. The colours are
                <code>--tao-tooltip-bg</code> and <code>--tao-tooltip-text</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Подсказка обратна теме: тёмная на светлой, светлая на тёмной, чтобы не сливаться с панелями, над которыми
                висит. <code>shortcut</code> добавляет клавишу значком. Цвета — <code>--tao-tooltip-bg</code> и
                <code>--tao-tooltip-text</code>.
              </p>
            </template>
          </Tr>
          <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
            <TaoTooltip :content="tr('Create freehand drawings', 'Рисовать от руки')" shortcut="P" placement="right">
              <TaoButton variant="secondary">{{ tr('With a key', 'С клавишей') }}</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('Command palette', 'Палитра команд')" shortcut="Ctrl+K">
              <TaoButton variant="secondary">Ctrl+K</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('The regular weight (bold = false)', 'Обычный вес (bold = false)')" :bold="false">
              <TaoButton variant="secondary">bold false</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('Fades in (animated = 1)', 'Появляется плавно (animated = 1)')" :animated="1">
              <TaoButton variant="secondary">animated 1</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('A slow fade (animated = 3)', 'Медленно (animated = 3)')" :animated="3">
              <TaoButton variant="secondary">animated 3</TaoButton>
            </TaoTooltip>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 16px;">
            <TaoTooltip :content="tr('No room on the left — it opens on the right', 'Слева некуда — откроется справа')" placement="left">
              <TaoButton variant="secondary" size="small">{{ tr('At the left edge', 'У левого края') }}</TaoButton>
            </TaoTooltip>
            <TaoTooltip :content="tr('No room on the right — it opens on the left', 'Справа некуда — откроется слева')" placement="right">
              <TaoButton variant="secondary" size="small">{{ tr('At the right edge', 'У правого края') }}</TaoButton>
            </TaoTooltip>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoTooltip content="{{ tr('Hint text', 'Текст подсказки') }}" placement="top"&gt;
  &lt;TaoButton&gt;{{ tr('Hover me', 'Наведи на меня') }}&lt;/TaoButton&gt;
&lt;/TaoTooltip&gt;</code></pre>
          </div>

          <h3>{{ tr('A hint of your own', 'Своя подсказка') }}</h3>
          <Tr>
            <template #en>
              <p>
                Every small hint that floats over the interface, the tip of <code>TaoCopy</code>, the tip over a cell of
                <code>TaoHeatmap</code>, wears the class <code>tao-tip</code>: the same inverted look, the same hooks. If you draw a
                hint yourself, give it the class and draw only its layout. <strong>Do not paint a background of your own</strong>:
                <code>surface-raised</code> is the colour of the panels it hangs over, and the hint melts into them. The content takes
                the colour of the hint; a quieter line is <code>color-mix(in srgb, currentColor 70%, transparent)</code>, not a text
                token, which is made for the normal background.
              </p>
            </template>
            <template #ru>
              <p>
                Любая маленькая подсказка, парящая над интерфейсом, подсказка <code>TaoCopy</code>, подсказка над клеткой
                <code>TaoHeatmap</code>, носит класс <code>tao-tip</code>: тот же обратный вид, те же хуки. Если рисуете подсказку
                сами, дайте ей класс и рисуйте только раскладку. <strong>Своего фона не задавайте</strong>: <code>surface-raised</code>
                это цвет панелей под ней, и подсказка в них сливается. Содержимое берёт цвет подсказки; строка потише —
                <code>color-mix(in srgb, currentColor 70%, transparent)</code>, а не текстовый токен, он сделан для обычного фона.
              </p>
            </template>
          </Tr>
          <div class="code-block">
            <pre><code>&lt;div class="tao-tip my-hint" role="status"&gt;
  {{ tr('Saved', 'Сохранено') }}
  &lt;small&gt;{{ tr('a moment ago', 'только что') }}&lt;/small&gt;
&lt;/div&gt;

.my-hint { position: fixed; padding: var(--tao-space-2) var(--tao-space-3); }
.my-hint small { color: color-mix(in srgb, currentColor 70%, transparent); }</code></pre>
          </div>
  </ShowcaseSection>
</template>
