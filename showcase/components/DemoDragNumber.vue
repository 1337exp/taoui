<script setup>
import { ref } from 'vue'
import { TaoDragNumber, TaoFormField } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDragNumber' })

const width = ref(5)
const depth = ref(3)
const height = ref(0.5)

const capsule = ref({ height: 2.2, radius: 0.35, crouch: 0.9, step: 0.25, jump: 1.2, slope: 45 })
const opacity = ref(80)
const committed = ref('')
</script>

<template>
  <ShowcaseSection id="drag-number" :tables="propTables['drag-number']">
    <h2>TaoDragNumber</h2>
    <Tr>
      <template #en>
        <p>
          A number field for panels and editors, the kind a 3D tool has: a caption, the number and its unit in one cell.
          <strong>Drag it sideways</strong> like a slider (a quarter of a step per pixel; <kbd>Shift</kbd> is ten times slower,
          <kbd>Ctrl</kbd> snaps to the step, <kbd>Esc</kbd> puts it back), <strong>click it</strong> to type (<code>5</code>,
          <code>0,5</code>, or with the unit, <code>5 m</code>), or use the <strong>− / +</strong> buttons and the arrow keys.
          It is one control with two looks: with the caption inside and the buttons on the sides, or, with
          <code>:controls="false"</code> and <code>variant="filled"</code>, a bare column of values with the captions outside.
          The unit is not part of the value; the value stays a number. For whole items in a cart use <code>TaoQuantity</code>.
        </p>
      </template>
      <template #ru>
        <p>
          Числовое поле для панелей и редакторов, как в 3D-пакетах: подпись, число и единица измерения в одной ячейке.
          <strong>Тяните вбок</strong>, как слайдер (четверть шага на пиксель; <kbd>Shift</kbd> в десять раз медленнее,
          <kbd>Ctrl</kbd> по сетке шага, <kbd>Esc</kbd> возвращает), <strong>кликните</strong>, чтобы набрать (<code>5</code>,
          <code>0,5</code> или с единицей, <code>5 м</code>), или жмите <strong>− / +</strong> и стрелки на клавиатуре.
          Это один контрол в двух видах: подпись внутри и кнопки по бокам, или, с <code>:controls="false"</code> и
          <code>variant="filled"</code>, голый столбец значений с подписями снаружи. Единица не входит в значение: значение остаётся числом.
          Для целых штук в корзине — <code>TaoQuantity</code>.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('Caption inside, buttons on the sides', 'Подпись внутри, кнопки по бокам') }}</h3>
    <div class="demo-stack demo-stack--narrow">
      <TaoDragNumber v-model="width" label="Width" unit="m" :min="0" :max="50" :step="0.5" @commit="committed = `Width ${$event} m`" />
      <TaoDragNumber v-model="depth" label="Depth" unit="m" :min="0" :max="50" :step="0.5" />
      <TaoDragNumber v-model="height" label="Height" unit="m" :min="0" :max="50" :step="0.5" />
      <p class="demo-drag-note">
        {{ committed ? tr('@commit once per action: ', '@commit один раз на действие: ') + committed : tr('Drag a field, or click it and type', 'Потяните поле или кликните и наберите') }}
      </p>
    </div>

    <h3>{{ tr('A column of values, captions outside', 'Столбец значений, подписи снаружи') }}</h3>
    <div class="demo-drag-column">
      <label for="dn-height">Height</label>
      <TaoDragNumber id="dn-height" v-model="capsule.height" variant="filled" :controls="false" unit="m" :min="0" :step="0.05" />
      <label for="dn-radius">Radius</label>
      <TaoDragNumber id="dn-radius" v-model="capsule.radius" variant="filled" :controls="false" unit="m" :min="0" :step="0.05" />
      <label for="dn-crouch">Crouch</label>
      <TaoDragNumber id="dn-crouch" v-model="capsule.crouch" variant="filled" :controls="false" unit="m" :min="0" :step="0.05" />
      <label for="dn-step">Max Step</label>
      <TaoDragNumber id="dn-step" v-model="capsule.step" variant="filled" :controls="false" unit="m" :min="0" :step="0.05" />
      <label for="dn-jump">Jump</label>
      <TaoDragNumber id="dn-jump" v-model="capsule.jump" variant="filled" :controls="false" unit="m" :min="0" :step="0.05" />
      <label for="dn-slope">Max Slope</label>
      <TaoDragNumber id="dn-slope" v-model="capsule.slope" variant="filled" :controls="false" unit="°" :min="0" :max="90" :step="1" />
    </div>

    <h3>{{ tr('In a form, with a hint and an error', 'В форме, с подсказкой и ошибкой') }}</h3>
    <div class="demo-stack demo-stack--narrow">
      <TaoFormField :label="tr('Opacity', 'Непрозрачность')" :hint="tr('0–100 %, Shift for fine dragging', '0–100 %, Shift для точной протяжки')">
        <TaoDragNumber v-model="opacity" unit="%" :min="0" :max="100" :step="5" :drag-speed="0.5" />
      </TaoFormField>
      <TaoFormField :label="tr('Width', 'Ширина')" :error="tr('Must be less than 3 m', 'Должна быть меньше 3 м')">
        <TaoDragNumber v-model="width" unit="m" :min="0" :step="0.5" :controls="false" />
      </TaoFormField>
      <TaoDragNumber :model-value="12" label="Disabled" unit="px" disabled />
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoDragNumber v-model="width" label="Width" unit="m" :min="0" :step="0.5" /&gt;

&lt;!-- a column of values, the captions are yours --&gt;
&lt;label for="r"&gt;Radius&lt;/label&gt;
&lt;TaoDragNumber id="r" v-model="radius" variant="filled" :controls="false" unit="m" :step="0.05" /&gt;

&lt;TaoDragNumber v-model="angle" unit="°" :min="0" :max="360" @commit="saveUndoStep" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-drag-note {
  margin: 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

/* a caption column and a column of values, as in an inspector panel / столбец подписей и столбец значений, как в инспекторе */
.demo-drag-column {
  display: grid;
  grid-template-columns: max-content minmax(0, 14rem);
  gap: var(--tao-space-1) var(--tao-space-3);
  align-items: center;
  max-width: 24rem;
}

.demo-drag-column label {
  color: var(--tao-color-text-muted);
  text-align: right;
}
</style>
