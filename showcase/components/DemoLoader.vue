<script setup>
import { ref } from 'vue'
import { TaoButton, TaoLoader, TaoProgress, TaoSkeleton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoLoader' })

const saving = ref(false)
function save() {
  saving.value = true
  setTimeout(() => (saving.value = false), 2000)
}
</script>

<template>
  <ShowcaseSection id="loader" :tables="propTables['loader']">
    <h2>TaoLoader</h2>
    <Tr>
      <template #en>
        <p>
          The wait whose end nobody knows. Four looks: <code>dots</code> (the first one, still the default), <code>ring</code>, <code>pulse</code> and <code>diamonds</code> (a hollow diamond crosses to the filled one and takes its place, a new filled one grows where it stood).
          A screen reader hears “Loading” (<code>label</code> says it your way), under «reduce motion» nothing travels or turns: the picture only breathes.
        </p>
      </template>
      <template #ru>
        <p>
          Ожидание, конца которого никто не знает. Четыре вида: <code>dots</code> (первый, по-прежнему по умолчанию), <code>ring</code>, <code>pulse</code> и <code>diamonds</code> (пустой ромб переходит к заполненному и занимает его место, на старом вырастает новый заполненный).
          Скринридер слышит «Загрузка» (<code>label</code> скажет по-своему), при «уменьшить движение» ничто не бежит и не крутится: картинка только дышит.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('Looks and tones', 'Виды и тона') }}</h3>
    <div class="demo-loaders">
      <TaoLoader variant="dots" :size="48" />
      <TaoLoader variant="ring" />
      <TaoLoader variant="pulse" />
      <TaoLoader variant="diamonds" :size="64" />
      <TaoLoader variant="ring" tone="success" />
      <TaoLoader variant="ring" tone="danger" />
      <TaoLoader variant="pulse" tone="warning" />
      <TaoLoader variant="ring" color="rebeccapurple" />
    </div>

    <h3>{{ tr('Sizes', 'Размеры') }}</h3>
    <div class="demo-loaders">
      <TaoLoader variant="ring" size="small" />
      <TaoLoader variant="ring" size="medium" />
      <TaoLoader variant="ring" size="large" />
      <TaoLoader variant="ring" :size="20" inline />
      <span>{{ tr('a line of text with a loader', 'строка текста с лоадером') }}</span>
    </div>

    <h3>{{ tr('In a button', 'В кнопке') }}</h3>
    <Tr>
      <template #en><p><code>loading</code> on a button draws the same ring in the text colour of the button, and the button says it is busy by itself (<code>aria-busy</code>).</p></template>
      <template #ru><p><code>loading</code> у кнопки рисует то же кольцо цветом текста кнопки, а кнопка сама говорит, что занята (<code>aria-busy</code>).</p></template>
    </Tr>
    <div class="demo-loaders">
      <TaoButton :loading="saving" @click="save">{{ tr('Save', 'Сохранить') }}</TaoButton>
      <TaoButton variant="secondary" tone="danger" loading>{{ tr('Delete', 'Удалить') }}</TaoButton>
    </div>

    <h3>{{ tr('Which wait to choose', 'Какое ожидание выбрать') }}</h3>
    <div class="wait-guide">
      <div class="wait-guide__item">
        <div class="wait-guide__sample"><TaoLoader variant="ring" size="small" /></div>
        <strong>TaoLoader</strong>
        <span>{{ tr('Nobody knows how long it takes, and there is a small place for it: a button, a card, a row.', 'Неизвестно, сколько ждать, и места немного: кнопка, карточка, строка.') }}</span>
      </div>
      <div class="wait-guide__item">
        <div class="wait-guide__sample"><TaoSkeleton :lines="2" /></div>
        <strong>TaoSkeleton</strong>
        <span>{{ tr('You know what the content will look like: the wait keeps its place and the page does not jump.', 'Известно, как будет выглядеть содержимое: ожидание держит его место, и страница не прыгает.') }}</span>
      </div>
      <div class="wait-guide__item">
        <div class="wait-guide__sample"><TaoProgress :progress="60" :show-percentage="false" /></div>
        <strong>TaoProgress</strong>
        <span>{{ tr('You know how much is left: an upload, a long job. A number is a promise a spinner cannot give.', 'Известно, сколько осталось: загрузка файла, долгая работа. Число — обещание, которого спиннер дать не может.') }}</span>
      </div>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoLoader /&gt;                                  &lt;!-- the four dots, 80px, as it was --&gt;
&lt;TaoLoader variant="ring" tone="success" /&gt;
&lt;TaoLoader variant="pulse" size="large" label="Saving" /&gt;
&lt;TaoLoader variant="ring" color="currentColor" :size="16" decorative /&gt;
&lt;TaoButton loading&gt;Save&lt;/TaoButton&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-loaders {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}

.wait-guide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.wait-guide__item {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 14px 16px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface-raised);
  font-size: 13px;
  color: var(--tao-color-text-muted);
}

.wait-guide__item strong {
  color: var(--tao-color-text-strong);
}

.wait-guide__sample {
  display: flex;
  align-items: center;
  min-height: 44px;
}
</style>
