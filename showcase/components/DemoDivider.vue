<script setup>
import { TaoDivider } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDivider' })
</script>

<template>
  <ShowcaseSection id="divider" :tables="propTables['divider']">
    <h2>TaoDivider</h2>
    <p>
      Стиль линии — <code>variant</code>: обычный <code>solid</code>, <code>dashed</code>, акцентный
      <code>colored</code> или пустой <code>gap</code>. Подпись — проп <code>text</code>. Плавные края —
      <code>fade</code>.
    </p>

    <h3>solid</h3>
    <TaoDivider />
    <TaoDivider text="или" />
    <TaoDivider fade />
    <TaoDivider fade text="или" />

    <h3>dashed</h3>
    <TaoDivider variant="dashed" />
    <TaoDivider variant="dashed" text="или" />
    <TaoDivider variant="dashed" fade />
    <TaoDivider variant="dashed" fade text="или" />

    <h3>colored</h3>
    <TaoDivider variant="colored" />
    <TaoDivider variant="colored" text="или" />
    <TaoDivider variant="colored" fade />
    <TaoDivider variant="colored" fade text="или" />

    <h3>gap</h3>
    <p class="carousel-note">Пустой отступ. <code>size</code> — small / medium / large. Текст тоже можно.</p>
    <TaoDivider variant="gap" size="small" />
    <TaoDivider variant="gap" text="раздел" size="small" />

    <div class="code-block">
      <pre><code>&lt;TaoDivider /&gt;
&lt;TaoDivider text="или" /&gt;
&lt;TaoDivider fade /&gt;
&lt;TaoDivider variant="dashed" fade /&gt;
&lt;TaoDivider variant="colored" fade /&gt;
&lt;TaoDivider variant="gap" size="small" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>
