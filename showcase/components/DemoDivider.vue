<script setup>
import { TaoDivider } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDivider' })
</script>

<template>
  <ShowcaseSection id="divider" :tables="propTables['divider']">
    <h2>TaoDivider</h2>
    <Tr>
      <template #en>
        <p>
          The line style is <code>variant</code>: the regular <code>solid</code>, <code>dashed</code>, the accent
          <code>colored</code> or the empty <code>gap</code>. The caption is the <code>text</code> prop. Soft edges —
          <code>fade</code>.
        </p>
      </template>
      <template #ru>
        <p>
          Стиль линии — <code>variant</code>: обычный <code>solid</code>, <code>dashed</code>, акцентный
          <code>colored</code> или пустой <code>gap</code>. Подпись — проп <code>text</code>. Плавные края —
          <code>fade</code>.
        </p>
      </template>
    </Tr>

    <h3>solid</h3>
    <TaoDivider />
    <TaoDivider :text="tr('or', 'или')" />
    <TaoDivider fade />
    <TaoDivider fade :text="tr('or', 'или')" />

    <h3>dashed</h3>
    <TaoDivider variant="dashed" />
    <TaoDivider variant="dashed" :text="tr('or', 'или')" />
    <TaoDivider variant="dashed" fade />
    <TaoDivider variant="dashed" fade :text="tr('or', 'или')" />

    <h3>colored</h3>
    <TaoDivider variant="colored" />
    <TaoDivider variant="colored" :text="tr('or', 'или')" />
    <TaoDivider variant="colored" fade />
    <TaoDivider variant="colored" fade :text="tr('or', 'или')" />

    <h3>gap</h3>
    <Tr>
      <template #en><p class="carousel-note">An empty gap. <code>size</code> — small / medium / large. Text works too.</p></template>
      <template #ru><p class="carousel-note">Пустой отступ. <code>size</code> — small / medium / large. Текст тоже можно.</p></template>
    </Tr>
    <TaoDivider variant="gap" size="small" />
    <TaoDivider variant="gap" :text="tr('section', 'раздел')" size="small" />

    <div class="code-block">
      <pre><code>&lt;TaoDivider /&gt;
&lt;TaoDivider text="{{ tr('or', 'или') }}" /&gt;
&lt;TaoDivider fade /&gt;
&lt;TaoDivider variant="dashed" fade /&gt;
&lt;TaoDivider variant="colored" fade /&gt;
&lt;TaoDivider variant="gap" size="small" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>
