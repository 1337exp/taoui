<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import ContrastLive from '../a11y/ContrastLive.vue'
import ContrastWhy from '../a11y/ContrastWhy.vue'
import PaletteLab from '../a11y/PaletteLab.vue'
import PromisesStrip from '../a11y/PromisesStrip.vue'
import KeyboardMap from '../a11y/KeyboardMap.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'DemoA11y' })

// The section is only a frame: each block lives in showcase/a11y/ with the data it reads (pairs.js, keys.js).
// Раздел — только рамка: каждый блок живёт в showcase/a11y/ вместе с данными, которые читает (pairs.js, keys.js).
</script>

<template>
  <ShowcaseSection id="a11y">
    <h2>{{ tr('Contrast and keyboard', 'Контраст и клавиатура') }}</h2>
    <Tr>
      <template #en>
        <p>
          Two things the kit promises about how it can be used: that text and fills are readable in every palette, and that
          every control works without a mouse. Here both can be tried, not read about: the numbers below are measured on this
          very page, with the same functions the kit exports.
        </p>
      </template>
      <template #ru>
        <p>
          Два обещания набора о том, как им можно пользоваться: что текст и заливки читаются в каждой палитре и что каждый
          элемент работает без мыши. Здесь оба можно потрогать, а не прочитать: числа ниже измерены на этой же странице теми
          функциями, которые набор отдаёт наружу.
        </p>
      </template>
    </Tr>

    <ContrastLive />
    <ContrastWhy />
    <PaletteLab />
    <PromisesStrip />
    <KeyboardMap />
  </ShowcaseSection>
</template>
