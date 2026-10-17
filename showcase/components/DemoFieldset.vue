<script setup>
import { ref } from 'vue'
import { TaoFieldset, TaoFormField, TaoInput } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFieldset' })

const fieldsetAddress = ref('')
</script>

<template>
  <ShowcaseSection id="fieldset" :tables="propTables['fieldset']">
    <h2>TaoFieldset</h2>
          <Tr>
            <template #en>
              <p>
                A group of related fields: a frame with a caption on the top border.
                This is <code>fieldset</code> + <code>legend</code>, not a card and not a Divider.
                <code>align</code> — <code>start</code>, <code>center</code> or <code>end</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Группа связанных полей: рамка, подпись на верхней границе.
                Это <code>fieldset</code> + <code>legend</code>, не карточка и не Divider.
                <code>align</code> — <code>start</code>, <code>center</code> или <code>end</code>.
              </p>
            </template>
          </Tr>
    
          <div class="demo-stack">
            <TaoFieldset :legend="tr('Delivery', 'Доставка')">
              <TaoFormField :label="tr('Address', 'Адрес')">
                <TaoInput v-model="fieldsetAddress" :placeholder="tr('Street, house', 'Улица, дом')" />
              </TaoFormField>
            </TaoFieldset>
    
            <TaoFieldset :legend="tr('Payment', 'Оплата')" align="center">
              <p style="margin: 0; font-size: 13px;">{{ tr('The invoice will arrive by email after confirmation.', 'Счёт придёт на почту после подтверждения.') }}</p>
            </TaoFieldset>
    
            <TaoFieldset :legend="tr('Returns', 'Возврат')" align="end">
              <p style="margin: 0; font-size: 13px;">{{ tr('14 days, if the item is in its original condition.', '14 дней, если сохранён товарный вид.') }}</p>
            </TaoFieldset>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFieldset legend="{{ tr('Delivery', 'Доставка') }}"&gt;
  &lt;TaoFormField label="{{ tr('Address', 'Адрес') }}"&gt;
    &lt;TaoInput v-model="address" /&gt;
  &lt;/TaoFormField&gt;
&lt;/TaoFieldset&gt;

&lt;TaoFieldset legend="{{ tr('Payment', 'Оплата') }}" align="center"&gt;…&lt;/TaoFieldset&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
