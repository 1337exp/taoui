<script setup>
import { computed, ref } from 'vue'
import { TaoSegmented, TaoSegmentedOption } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTypography' })

// the whole scale follows one number set on the wrapper
const ratio = ref('1.25')
const ladder = computed(() => [1, 2, 3, 4, 5, 6].map((n) => ({ n, px: Math.round(16 * Number(ratio.value) ** (6 - n) * 10) / 10 })))
</script>

<template>
  <ShowcaseSection id="typography" :tables="propTables['typography']">
    <h2>{{ tr('Typography', 'Типографика') }}</h2>
    <Tr>
      <template #en>
        <p>
          An opt-in layer. <code>.tao-prose</code> on a wrapper styles the text inside; nothing touches a bare
          <code>h1</code> or <code>p</code>. The heading scale comes from two numbers, <code>--tao-text-base</code> and
          <code>--tao-text-ratio</code>: change the ratio below and the whole scale follows. <code>.tao-heading-1…6</code>
          gives the look of a level to any tag, so the tag says what it is and the class how big.
        </p>
      </template>
      <template #ru>
        <p>
          Слой включается явно. <code>.tao-prose</code> на обёртке оформляет текст внутри; голые <code>h1</code> и
          <code>p</code> не трогаются. Шкала заголовков — из двух чисел, <code>--tao-text-base</code> и
          <code>--tao-text-ratio</code>: поменяйте коэффициент ниже, и вся шкала последует. <code>.tao-heading-1…6</code>
          даёт вид уровня любому тегу: тег говорит, что это, класс — какого размера.
        </p>
      </template>
    </Tr>

    <div class="typo-demo__controls">
      <TaoSegmented v-model="ratio" size="small">
        <TaoSegmentedOption value="1.2" :label="tr('1.2 calm', '1.2 спокойно')" />
        <TaoSegmentedOption value="1.25" :label="tr('1.25 default', '1.25 по умолчанию')" />
        <TaoSegmentedOption value="1.333" :label="tr('1.333 bold', '1.333 смело')" />
      </TaoSegmented>
      <span class="typo-demo__ladder">
        <span v-for="step in ladder" :key="step.n">h{{ step.n }} {{ step.px }}</span>
      </span>
    </div>

    <article class="tao-prose typo-demo__article" :style="{ '--tao-text-ratio': ratio }">
      <h1>{{ tr('Tokens first', 'Сначала токены') }}</h1>
      <p>
        {{ tr('A component reads roles, never colours. Change a role and every component follows: the palette, the light mode, the stripe of a card.', 'Компонент читает роли, а не цвета. Меняете роль — и за ней идёт каждый компонент: палитра, светлый режим, полоса у карточки.') }}
        <a href="#surface">{{ tr('Read about surfaces', 'О поверхностях') }}</a>.
      </p>
      <h2>{{ tr('Three layers', 'Три слоя') }}</h2>
      <ul>
        <li>{{ tr('primitives: the raw scale of colours and sizes;', 'примитивы: сырая шкала цветов и размеров;') }}</li>
        <li>{{ tr('roles: what a colour is for, per theme;', 'роли: для чего цвет, по темам;') }}</li>
        <li>
          {{ tr('contexts: size, density, tone, surface —', 'контексты: размер, плотность, тон, поверхность —') }}
          <ul>
            <li>{{ tr('set on any element, they reach its subtree.', 'ставятся на любой элемент и действуют на поддерево.') }}</li>
          </ul>
        </li>
      </ul>
      <h3>{{ tr('A quote', 'Цитата') }}</h3>
      <blockquote>{{ tr('The closer things are in meaning, the closer they stand.', 'Чем ближе по смыслу, тем ближе на странице.') }}</blockquote>
      <h4>{{ tr('Code', 'Код') }}</h4>
      <p>{{ tr('Inline:', 'В строке:') }} <code>--tao-text-ratio: 1.2</code>.</p>
      <pre><code>&lt;article class="tao-prose"&gt;…&lt;/article&gt;</code></pre>
      <hr />
      <h2 class="tao-heading-5">{{ tr('An h2 that looks like level 5', 'h2, который выглядит как уровень 5') }}</h2>
      <p>{{ tr('The outline of the page keeps the h2; the design gets a quieter title.', 'В структуре страницы остаётся h2, а дизайн получает тихий заголовок.') }}</p>
    </article>

    <div class="code-block">
      <pre><code>&lt;article class="tao-prose"&gt;
  &lt;h1&gt;Title&lt;/h1&gt;
  &lt;p&gt;Text with a &lt;a href="…"&gt;link&lt;/a&gt;.&lt;/p&gt;
&lt;/article&gt;

&lt;h2 class="tao-heading-5"&gt;An h2 the size of level 5&lt;/h2&gt;

:root { --tao-text-ratio: 1.2; }        /* the whole scale */
.article { --tao-text-base: 18px; }      /* one place only */</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.typo-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.typo-demo__ladder {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--tao-color-text-muted);
}

.typo-demo__article {
  max-width: 68ch;
  margin-bottom: 16px;
  padding: 24px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}
</style>
