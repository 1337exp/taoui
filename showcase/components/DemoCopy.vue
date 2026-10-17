<script setup>
import { computed } from 'vue'
import { TaoCopy } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCopy' })

const copyText = computed(() => tr('This text will be copied to the clipboard!', 'Этот текст будет скопирован в буфер обмена!'))
</script>

<template>
  <ShowcaseSection id="copy" :tables="propTables['copy']">
    <h2>TaoCopy</h2>
    <Tr>
      <template #en>
        <p>
          A sheets icon by default. A click copies; a tooltip shows for a couple of seconds.
          If the button is hidden or unmounted, the tooltip goes with it.
          Your own look — the <code>{ copy, copied }</code> slot.
        </p>
      </template>
      <template #ru>
        <p>
          По умолчанию — иконка листов. Клик копирует, сверху на пару секунд тултип.
          Если кнопку скрыли или размонтировали, подсказка уходит вместе с ней.
          Свой вид — слот <code>{ copy, copied }</code>.
        </p>
      </template>
    </Tr>

    <div class="copy-preview">
            <code>{{ copyText }}</code>
            <TaoCopy :text="copyText" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCopy :text="value" /&gt;
&lt;TaoCopy :text="value" copy-label="Copy" success-text="Copied!" /&gt;

&lt;TaoCopy :text="value"&gt;
  &lt;template #default="{ copy, copied }"&gt;
    &lt;TaoButton @click="copy"&gt;{{ copied ? 'Done' : 'Copy' }}&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoCopy&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.copy-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 12px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
}

.copy-preview code {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
