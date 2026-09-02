<script setup>
import { ref } from 'vue'
import { TaoFieldset, TaoFormField, TaoInput } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoFieldset' })

const fieldsetAddress = ref('')
</script>

<template>
  <ShowcaseSection id="fieldset" :tables="propTables['fieldset']">
    <h2>TaoFieldset</h2>
          <p>
            Группа связанных полей: рамка, подпись на верхней границе.
            Это <code>fieldset</code> + <code>legend</code>, не карточка и не Divider.
            <code>align</code> — <code>start</code>, <code>center</code> или <code>end</code>.
          </p>
    
          <div class="demo-stack">
            <TaoFieldset legend="Доставка">
              <TaoFormField label="Адрес">
                <TaoInput v-model="fieldsetAddress" placeholder="Улица, дом" />
              </TaoFormField>
            </TaoFieldset>
    
            <TaoFieldset legend="Оплата" align="center">
              <p style="margin: 0; font-size: 13px;">Счёт придёт на почту после подтверждения.</p>
            </TaoFieldset>
    
            <TaoFieldset legend="Возврат" align="end">
              <p style="margin: 0; font-size: 13px;">14 дней, если сохранён товарный вид.</p>
            </TaoFieldset>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoFieldset legend="Доставка"&gt;
      &lt;TaoFormField label="Адрес"&gt;
        &lt;TaoInput v-model="address" /&gt;
      &lt;/TaoFormField&gt;
    &lt;/TaoFieldset&gt;
    
    &lt;TaoFieldset legend="Оплата" align="center"&gt;…&lt;/TaoFieldset&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
