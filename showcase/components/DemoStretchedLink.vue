<script setup>
import { ref } from 'vue'
import { TaoStretchedLink, TaoButton, TaoTag } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoStretchedLink' })

// The demo shows which one took the click: the stretched link or the button above it.
const opened = ref(0)
const pressed = ref(0)
</script>

<template>
  <ShowcaseSection id="stretched-link" :tables="propTables['stretched-link']">
    <h2>TaoStretchedLink</h2>
    <Tr>
      <template #en>
        <p>
          A whole card or row is one link, and the buttons inside it still work on their own. The link keeps its place in the markup
          (the title); its layer is stretched over the container with <code>tao-stretched</code>. A control that must stay
          clickable by itself takes <code>tao-stretched-raise</code>. The keyboard sees one link, and its focus ring goes round the whole container.
        </p>
      </template>
      <template #ru>
        <p>
          Целая карточка или строка это одна ссылка, а кнопки внутри нажимаются сами по себе. Ссылка остаётся на своём месте в
          разметке (заголовок), её слой растягивается на контейнер с <code>tao-stretched</code>. Элемент, который должен нажиматься
          сам, получает <code>tao-stretched-raise</code>. Клавиатура видит одну ссылку, а кольцо фокуса идёт по всему контейнеру.
        </p>
      </template>
    </Tr>

    <div class="stretched-demo tao-stretched">
      <div class="stretched-demo__text">
        <strong class="stretched-demo__title">
          <TaoStretchedLink to="#stretched-link" @click.prevent="opened++">TaoStretchedLink</TaoStretchedLink>
        </strong>
        <span class="stretched-demo__sub">{{ tr('Click anywhere on the row, or the button on the right.', 'Нажмите в любом месте строки или на кнопку справа.') }}</span>
      </div>
      <TaoTag size="small">{{ tr('link', 'ссылка') }}: {{ opened }}</TaoTag>
      <TaoTag size="small" tone="success">{{ tr('button', 'кнопка') }}: {{ pressed }}</TaoTag>
      <TaoButton class="tao-stretched-raise" size="small" @click="pressed++">{{ tr('Press', 'Нажать') }}</TaoButton>
    </div>

    <Tr>
      <template #en>
        <p>
          <strong>One rule:</strong> do not put <code>filter</code>, <code>transform</code>, <code>perspective</code>,
          <code>will-change: transform</code> or <code>contain</code> on the link (on <code>:hover</code> too). Such a property
          makes the link the containing block of its own layer, the layer shrinks to the link, the pointer is no longer over it,
          the property goes, the layer stretches back, and the cursor flickers every frame. Light the link with a colour
          (<code>background</code>, <code>color-mix</code>) or put the effect on an inner element; on the container it is fine.
        </p>
      </template>
      <template #ru>
        <p>
          <strong>Одно правило:</strong> не давайте ссылке <code>filter</code>, <code>transform</code>, <code>perspective</code>,
          <code>will-change: transform</code> и <code>contain</code> (и на <code>:hover</code> тоже). Такое свойство делает ссылку
          опорным блоком для её же слоя, слой сжимается до ссылки, курсор оказывается уже не над ним, свойство пропадает, слой
          снова растягивается, и курсор мигает каждый кадр. Подсвечивайте ссылку цветом (<code>background</code>,
          <code>color-mix</code>) или вешайте эффект на внутренний элемент; контейнеру это можно.
        </p>
      </template>
    </Tr>

    <div class="code-block">
      <pre><code>&lt;div class="tao-stretched"&gt;
  &lt;h4&gt;&lt;TaoStretchedLink to="/projects/taoui"&gt;TaoUI&lt;/TaoStretchedLink&gt;&lt;/h4&gt;
  &lt;p&gt;{{ tr('A showcase of every component.', 'Витрина всех компонентов.') }}&lt;/p&gt;
  &lt;TaoButton class="tao-stretched-raise" @click="copy"&gt;{{ tr('Copy', 'Копировать') }}&lt;/TaoButton&gt;
&lt;/div&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.stretched-demo {
  display: flex;
  align-items: center;
  gap: var(--tao-space-3);
  padding: var(--tao-space-3) var(--tao-space-4);
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface-raised);
  transition: border-color var(--tao-transition-base);
}

.stretched-demo:hover {
  border-color: var(--tao-color-border-strong);
}

.stretched-demo__text {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  flex-direction: column;
  gap: var(--tao-space-1);
}

.stretched-demo__title a {
  color: var(--tao-color-text-strong);
  text-decoration: none;
}

.stretched-demo__sub {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}
</style>
