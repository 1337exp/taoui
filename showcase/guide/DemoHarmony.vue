<script setup>
import ShowcaseSection from '../components/ShowcaseSection.vue'
import Tr from '../components/Tr.vue'
import HarmonyBench from '../harmony/HarmonyBench.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'DemoHarmony' })

// The section is only a frame: the bench lives in showcase/harmony/ with the data it reads (controls.js) and the rules
// that judge it (measure.js). A new control goes to controls.js with what it is expected to be.
// Раздел — только рамка: стенд живёт в showcase/harmony/ вместе с данными (controls.js) и правилами (measure.js).
</script>

<template>
  <ShowcaseSection id="harmony">
    <h2>{{ tr('Controls side by side', 'Контролы рядом') }}</h2>
    <Tr>
      <template #en>
        <p>
          Every control is right on its own and may still look wrong in a row: one pale, one bright, one thin, one heavy, one
          taller than the rest. This is the bench for that. It stands the controls of the kit on one surface, measures what the
          browser really draws, and says where the row breaks the rules of the text ladder, of one weight, of one height, and of
          a fill that can be seen. Change a theme, a palette, a surface or a size and it measures again. Use it before and after
          a change of a colour role, a weight or a size.
        </p>
      </template>
      <template #ru>
        <p>
          Каждый контрол по отдельности верен, а в ряду всё равно может выглядеть неправильно: один бледный, другой яркий,
          третий тонкий, четвёртый жирный, пятый выше остальных. Для этого и стенд. Он ставит контролы набора на одну
          поверхность, измеряет то, что браузер правда рисует, и говорит, где ряд ломает правила лестницы текста, одного веса,
          одной высоты и видимой заливки. Смените тему, палитру, поверхность или размер, и он измерит снова. Пользуйтесь им до
          и после правки цветовой роли, веса или размера.
        </p>
      </template>
    </Tr>

    <HarmonyBench />
  </ShowcaseSection>
</template>
