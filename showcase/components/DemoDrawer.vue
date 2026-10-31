<script setup>
import { ref } from 'vue'
import { TaoButton, TaoDrawer, TaoIcon, TaoInput } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoDrawer' })

const isDrawerOpen = ref(false)
const side = ref('right')

function open(value) {
  side.value = value
  isDrawerOpen.value = true
}

// a sheet like the comments of a video: its own header, a list, a line to type in at the bottom
// лист как комментарии к видео: своя шапка, список, строка ввода внизу
const isCommentsOpen = ref(false)
const draft = ref('')
const comments = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  author: '@user' + (index + 1),
  text: tr('A comment under the video, number ', 'Комментарий под видео, номер ') + (index + 1),
  likes: Math.round(4600 / (index + 1)),
}))
</script>

<template>
  <ShowcaseSection id="drawer" :tables="propTables['drawer']">
    <h2>TaoDrawer</h2>
          <p>{{ tr('A side panel: filters, a cart, settings. Esc and a click on the backdrop close it, the focus does not escape to the page.', 'Боковая панель: фильтры, корзина, настройки. Esc и клик по фону закрывают, фокус не уезжает на страницу.') }}</p>
    
          <div class="button-row">
            <TaoButton variant="secondary" @click="open('right')">{{ tr('Open on the right', 'Открыть справа') }}</TaoButton>
            <TaoButton variant="secondary" @click="open('bottom')">{{ tr('Open a bottom sheet', 'Открыть нижний лист') }}</TaoButton>
            <TaoButton variant="secondary" @click="isCommentsOpen = true">{{ tr('A sheet of your own (comments)', 'Свой лист (комментарии)') }}</TaoButton>
          </div>
          <TaoDrawer v-model="isDrawerOpen" :side="side" :title="tr('Filters', 'Фильтры')">
            <p>{{ tr('Form fields can go here. On a narrow screen this is handier than a centred modal.', 'Здесь могут быть поля формы. На узком экране это удобнее модалки по центру.') }}</p>
            <template #footer>
              <TaoButton variant="secondary" @click="isDrawerOpen = false">{{ tr('Reset', 'Сбросить') }}</TaoButton>
              <TaoButton @click="isDrawerOpen = false">{{ tr('Apply', 'Применить') }}</TaoButton>
            </template>
          </TaoDrawer>
    
          <p>{{ tr('A bottom sheet is pulled down by its grip and header: it closes when pulled far enough or flung, and comes back otherwise (swipe-to-close). The content scrolls on its own. A header of your own (#header), no cross (show-close="false"), a line to type in pinned to the bottom (#footer): that makes the comments of a video.', 'Нижний лист тянут вниз за ручку и шапку: он закрывается, если утянут далеко или брошен, иначе возвращается (swipe-to-close). Содержимое прокручивается само. Своя шапка (#header), без крестика (show-close="false"), строка ввода внизу (#footer): так выглядят комментарии к видео.') }}</p>
          <TaoDrawer v-model="isCommentsOpen" side="bottom" :show-close="false" aria-label="Comments">
            <template #header="{ close }">
              <strong class="comments__title">{{ tr('Comments', 'Комментарии') }} <span class="comments__count">275</span></strong>
              <span class="comments__tools">
                <TaoButton variant="text" size="small" :aria-label="tr('Filter', 'Фильтр')"><TaoIcon name="tao-settings" /></TaoButton>
                <TaoButton variant="text" size="small" :aria-label="tr('Close', 'Закрыть')" @click="close"><TaoIcon name="tao-close" /></TaoButton>
              </span>
            </template>
            <ul class="comments">
              <li v-for="item in comments" :key="item.id">
                <b>{{ item.author }}</b>
                <p>{{ item.text }}</p>
                <small>{{ item.likes }}</small>
              </li>
            </ul>
            <template #footer>
              <TaoInput v-model="draft" class="comments__input" :placeholder="tr('Add a comment', 'Введите текст комментария')" />
            </template>
          </TaoDrawer>

          <div class="code-block">
            <pre><code>&lt;TaoDrawer v-model="open" title="{{ tr('Filters', 'Фильтры') }}"&gt;
  ...
&lt;/TaoDrawer&gt;

&lt;TaoDrawer v-model="open" side="bottom" title="Filters"&gt;   &lt;!-- a sheet from the bottom, pulled down by the grip --&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
&lt;/TaoDrawer&gt;

&lt;TaoDrawer v-model="open" side="bottom" :show-close="false" aria-label="Comments"&gt;
  &lt;template #header="{ close }"&gt;Comments &lt;button @click="close"&gt;x&lt;/button&gt;&lt;/template&gt;
  ...
  &lt;template #footer&gt;&lt;TaoInput v-model="draft" /&gt;&lt;/template&gt;
&lt;/TaoDrawer&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.comments {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.comments p {
  margin: 2px 0;
}

.comments__tools {
  display: inline-flex;
  gap: 4px;
}

.comments__input {
  flex: 1;
}

.comments small,
.comments__count {
  color: var(--tao-color-text-muted);
}
</style>
