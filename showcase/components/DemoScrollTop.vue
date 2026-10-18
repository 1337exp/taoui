<script setup>
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'
import { scrollTopDemo } from '../scrollTopDemo.js'

defineOptions({ name: 'DemoScrollTop' })
</script>

<template>
  <ShowcaseSection id="scrolltop" :tables="propTables['scrolltop']">
    <h2>TaoScrollTop</h2>
          <Tr>
            <template #en>
              <p>
                A floating “back to top” button. It appears on a reverse scroll past the
                <code>boundary</code> threshold. Three looks: <code>solid</code>, <code>ghost</code> and <code>text</code>
                (a bare caption with an arrow). <code>label</code> adds a caption: beside the button on mouse hover
                (not on touch) for <code>solid</code> / <code>ghost</code>, always visible for <code>text</code>.
                The caption opens towards the page unless <code>labelSide</code> says otherwise.
              </p>
              <p class="carousel-note">Pick a look below, scroll the showcase down and a little back up — the button pops up.</p>
            </template>
            <template #ru>
              <p>
                Плавающая кнопка «наверх». Появляется при обратном скролле после порога
                <code>boundary</code>. Три вида: <code>solid</code>, <code>ghost</code> и <code>text</code>
                (подпись со стрелкой без фона). <code>label</code> добавляет подпись: рядом с кнопкой при наведении мыши
                (не на таче) у <code>solid</code> / <code>ghost</code>, у <code>text</code> видна всегда.
                Подпись раскрывается к странице, если <code>labelSide</code> не задан явно.
              </p>
              <p class="carousel-note">Выберите вид ниже, прокрутите витрину вниз и чуть вверх — кнопка всплывёт.</p>
            </template>
          </Tr>

          <div class="demo-row">
            <TaoSegmented v-model="scrollTopDemo.variant">
              <TaoSegmentedOption value="solid" label="solid" />
              <TaoSegmentedOption value="ghost" label="ghost" />
              <TaoSegmentedOption value="text" label="text" />
            </TaoSegmented>
            <TaoSegmented v-model="scrollTopDemo.side">
              <TaoSegmentedOption value="left" label="left" />
              <TaoSegmentedOption value="right" label="right" />
            </TaoSegmented>
            <TaoSegmented v-model="scrollTopDemo.label">
              <TaoSegmentedOption value="on" label="label" />
              <TaoSegmentedOption value="off" label="no label" />
            </TaoSegmented>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoScrollTop :boundary="200" /&gt;
&lt;TaoScrollTop variant="ghost" label="Back to top" /&gt;
&lt;TaoScrollTop variant="text" side="left" :offset="32" /&gt;
&lt;TaoScrollTop label="Up" label-side="right" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
