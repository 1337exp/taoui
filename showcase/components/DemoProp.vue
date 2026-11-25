<script setup>
import { ref } from 'vue'
import { TaoColorInput, TaoDragNumber, TaoProp, TaoSelect, TaoSwitch } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoProp' })

const propX = ref(24)
const propY = ref(48)
const propW = ref(320)
const propColor = ref('#ff8800')
const propBlend = ref('normal')
const propVisible = ref(true)
const blends = () => [
  { id: 'normal', label: tr('Normal', 'Обычный') },
  { id: 'multiply', label: tr('Multiply', 'Умножение') },
  { id: 'screen', label: tr('Screen', 'Экран') },
]
</script>

<template>
  <ShowcaseSection id="prop" :tables="propTables['prop']">
    <h2>TaoProp</h2>
          <Tr>
            <template #en>
              <p>
                A property of a thing, the row of an inspector: the caption on the left, the control on the right, a hint or an error
                under the control. It wires the label to the control as <code>TaoFormField</code> does, so the same fields work in it.
                <code>TaoFormField</code> is the vertical form, <code>TaoProp</code> is the dense one: rows of an editor, a panel of node
                settings. Several controls in one row (<code>x y</code>) are fine.
              </p>
            </template>
            <template #ru>
              <p>
                Свойство вещи, строка инспектора: подпись слева, контрол справа, под контролом подсказка или ошибка. Подпись связывается
                с контролом так же, как у <code>TaoFormField</code>, поэтому те же поля работают в ней. <code>TaoFormField</code> —
                вертикальная форма, <code>TaoProp</code> — плотная: строки редактора, панель настроек ноды. Несколько контролов в одной
                строке (<code>x y</code>) подойдут.
              </p>
            </template>
          </Tr>

          <div class="demo-stack" style="max-width: 460px">
            <TaoProp :label="tr('Position', 'Позиция')">
              <TaoDragNumber v-model="propX" label="X" unit="px" />
              <TaoDragNumber v-model="propY" label="Y" unit="px" />
            </TaoProp>
            <TaoProp :label="tr('Width', 'Ширина')" :hint="tr('Drag sideways or type', 'Тяните вбок или наберите')">
              <TaoDragNumber v-model="propW" unit="px" :min="0" :max="800" />
            </TaoProp>
            <TaoProp :label="tr('Colour', 'Цвет')">
              <TaoColorInput v-model="propColor" />
            </TaoProp>
            <TaoProp :label="tr('Blend mode with a long caption', 'Режим наложения с длинной подписью')">
              <TaoSelect v-model="propBlend" :items="blends()" :clearable="false" />
            </TaoProp>
            <TaoProp :label="tr('Visible', 'Видимость')" :error="propVisible ? '' : tr('A hidden layer is not exported', 'Скрытый слой не выгружается')">
              <TaoSwitch v-model="propVisible" />
            </TaoProp>
            <TaoProp :label="tr('Narrow caption', 'Узкая подпись')" :label-width="72">
              <TaoDragNumber v-model="propX" />
            </TaoProp>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoProp label="{{ tr('Position', 'Позиция') }}"&gt;
  &lt;TaoDragNumber v-model="x" label="X" unit="px" /&gt;
  &lt;TaoDragNumber v-model="y" label="Y" unit="px" /&gt;
&lt;/TaoProp&gt;

&lt;TaoProp label="{{ tr('Width', 'Ширина') }}" hint="{{ tr('Drag sideways or type', 'Тяните вбок или наберите') }}"&gt;
  &lt;TaoDragNumber v-model="width" unit="px" /&gt;
&lt;/TaoProp&gt;

&lt;!-- {{ tr('the width of the caption column', 'ширина колонки подписи') }}: :label-width="96", {{ tr('or the variable', 'или переменная') }} --tao-prop-label-width --&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
