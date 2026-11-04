<script setup>
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import LayerStack from '../layers/LayerStack.vue'
import OwnTheme from '../layers/OwnTheme.vue'
import Scrollbars from '../layers/Scrollbars.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'DemoLayers' })

// The section is only a frame: each block lives in showcase/layers/ with the data it reads (layers.js, theme.js).
// Раздел — только рамка: каждый блок живёт в showcase/layers/ вместе с данными, которые читает (layers.js, theme.js).
</script>

<template>
  <ShowcaseSection id="layers">
    <h2>{{ tr('Layers and theming', 'Слои и темизация') }}</h2>
    <Tr>
      <template #en>
        <p>
          A component knows no colour of its own: it reads roles, and the roles are made in layers. That is why a few dozen
          variables recolour everything, including what you wrote next to the kit. Below are the real files, in the order the
          kit imports them, and a theme of your own made by hand. The numbers on how readable the result is are in
          <a href="#a11y">Contrast &amp; keyboard</a>.
        </p>
      </template>
      <template #ru>
        <p>
          Компонент не знает своих цветов: он читает роли, а роли собираются слоями. Поэтому несколько десятков переменных
          перекрашивают всё, включая то, что вы написали рядом с набором. Ниже настоящие файлы в том порядке, в каком набор
          их подключает, и своя тема, собранная руками. Числа о том, насколько читается результат, — в разделе
          <a href="#a11y">«Контраст и клавиатура»</a>.
        </p>
      </template>
    </Tr>

    <LayerStack />
    <OwnTheme />
    <Scrollbars />
  </ShowcaseSection>
</template>
