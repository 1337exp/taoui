<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { TaoIcon, TaoProgress, TaoRangeSlider, TaoSlider, TaoScrubber } from '@1337exp/taoui'
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
const sliderLoad = ref(82)
const sliderBand = ref([20, 65])
const sliderStrength = ref(25)
// reveal: plain until the fill gets to the zone / reveal: обычная, пока заливка не дошла до зоны
const strengthZones = [
  { to: 33, tone: 'danger' },
  { to: 66, tone: 'warning', reveal: true, dot: true },
  { to: 100, tone: 'success', reveal: true, dot: true },
]
// zones: each runs to its `to`; a dot where it ends / зоны: каждая идёт до своего `to`; точка там, где она кончается
const loadZones = [
  { to: 40, tone: 'info', dot: true },
  { to: 70, tone: 'warning', dot: true },
  { to: 100, tone: 'danger' },
]
// The scrubber does not keep time itself: here a simple timer drives it (in projects: usePlayback from @1337exp/taoux/playback)
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
    <h2>TaoProgress / TaoSlider / TaoScrubber</h2>
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

          <h3>{{ tr('Zones', 'Зоны') }}</h3>
          <Tr>
            <template #en>
              <p>
                <code>zones</code> colours the scale: each zone runs to its <code>to</code>, the last one to <code>max</code>. The bar shows them dimmed,
                the filled part in full colour, the thumb wears the colour of the zone it stands in. <code>dot: true</code> puts a bead where a zone ends;
                <code>tone</code> is a colour role of the theme, <code>color</code> any CSS colour. Colour alone is not a message: say the state in words too.
              </p>
            </template>
            <template #ru>
              <p>
                <code>zones</code> красит шкалу: каждая зона идёт до своего <code>to</code>, последняя до <code>max</code>. Полоса показывает их приглушённо,
                закрашенная часть полным цветом, ручка носит цвет зоны, в которой стоит. <code>dot: true</code> ставит точку там, где зона кончается;
                <code>tone</code> — роль цвета темы, <code>color</code> — любой CSS-цвет. Цвет — не сообщение: состояние скажите и словами.
              </p>
            </template>
          </Tr>
          <TaoSlider v-model="sliderLoad" :zones="loadZones" :aria-label="tr('Load', 'Нагрузка')" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Load', 'Нагрузка') }}: {{ sliderLoad }}</p>
          <TaoRangeSlider v-model="sliderBand" :zones="[{ to: 30, tone: 'neutral' }, { to: 70, tone: 'success' }, { to: 100, color: '#c026d3' }]" variant="thin" :aria-label="tr('Band', 'Полоса')" class="demo-wide" />
          <div style="display: flex; align-items: center; gap: 24px; margin-top: 12px;">
            <TaoSlider v-model="sliderLoad" :zones="loadZones" vertical :aria-label="tr('Load', 'Нагрузка')" />
            <TaoSlider v-model="sliderLoad" :zones="loadZones" flat :aria-label="tr('Load', 'Нагрузка')" class="demo-wide" />
          </div>
          <h3>{{ tr('A bubble with the value', 'Плашка со значением') }}</h3>
          <Tr>
            <template #en>
              <p>
                <code>bubble</code> shows the value beside the thumb in the colour of its zone (the accent without zones), with a label that reads on it.
                It is off by default. <code>true</code>: it shows while you drag, hover or tab to the thumb; <code>'always'</code>: it stays.
                The text is <code>format</code>, or your own through the <code>#bubble="{ value, zone }"</code> slot. Leave room for it above the bar.
              </p>
            </template>
            <template #ru>
              <p>
                <code>bubble</code> показывает значение у ручки цветом её зоны (без зон — акцентом), с подписью, которая на нём читается.
                По умолчанию выключена. <code>true</code>: видна, пока тянете, наводите или дошли до ручки Tab; <code>'always'</code>: остаётся.
                Текст — <code>format</code> или ваш, через слот <code>#bubble="{ value, zone }"</code>. Оставьте ей место над полосой.
              </p>
            </template>
          </Tr>
          <div style="padding-top: 44px;">
            <TaoSlider v-model="sliderLoad" :zones="loadZones" bubble :format="(v) => `${v}%`" :aria-label="tr('Load', 'Нагрузка')" class="demo-wide" />
          </div>
          <div style="padding-top: 44px;">
            <TaoSlider v-model="sliderLoad" :zones="loadZones" bubble="always" variant="thin" :aria-label="tr('Load', 'Нагрузка')" class="demo-wide">
              <template #bubble="{ value, zone }">
                <TaoIcon v-if="zone && value > 70" name="tao-info" /> {{ value }}%
              </template>
            </TaoSlider>
          </div>
          <pre><code>&lt;TaoSlider v-model="load" :zones="zones" bubble :format="(v) =&gt; `${v}%`" /&gt;
&lt;TaoSlider v-model="load" :zones="zones" bubble="always"&gt;
  &lt;template #bubble="{ value, zone }"&gt;&lt;TaoIcon name="tao-info" /&gt; &#123;&#123; value &#125;&#125;%&lt;/template&gt;
&lt;/TaoSlider&gt;</code></pre>

          <h3>{{ tr('Zones that appear as it fills', 'Зоны, что проявляются по мере заполнения') }}</h3>
          <p>
            {{ tr('A zone with reveal has no colour until the value gets there: the field looks plain and is painted as you fill it.', 'У зоны с reveal нет цвета, пока значение до неё не дошло: поле выглядит обычным и красится по мере заполнения.') }}
          </p>
          <TaoSlider v-model="sliderStrength" :zones="strengthZones" :aria-label="tr('Strength', 'Надёжность')" class="demo-wide" />
          <p style="margin-top: 4px; font-size: 13px;">{{ tr('Strength', 'Надёжность') }}: {{ sliderStrength }}</p>

          <pre><code>&lt;TaoSlider v-model="load" :zones="[
  { to: 40, tone: 'info', dot: true },
  { to: 70, tone: 'warning', dot: true },
  { to: 100, tone: 'danger' },
]" /&gt;</code></pre>

          <h3>TaoScrubber</h3>
          <TaoScrubber v-model="time" v-model:playing="playing" :length="8" :marks="[0, 2, 4, 6]" :format="(t) => tr(`${t.toFixed(2)} s`, `${t.toFixed(2)} с`)" class="demo-wide" />
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
&lt;TaoScrubber v-model="time" v-model:playing="playing" :length="8" :marks="[0, 2, 4, 6]" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
