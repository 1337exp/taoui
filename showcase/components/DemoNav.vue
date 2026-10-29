<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoNav, TaoSegmented, TaoSegmentedOption, TaoSwitch } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoNav' })

// one list of sections; the frame width decides the look in `auto`
const all = computed(() => [
  { id: 'home', label: tr('Home', 'Главная'), icon: 'tao-circle' },
  { id: 'search', label: tr('Search', 'Поиск'), icon: 'tao-search' },
  { id: 'inbox', label: tr('Inbox', 'Входящие'), icon: 'tao-info', badge: 3 },
  { id: 'calendar', label: tr('Calendar', 'Календарь'), icon: 'tao-calendar', badge: true },
  { id: 'media', label: tr('Media', 'Медиа'), icon: 'tao-play' },
  { id: 'files', label: tr('Files', 'Файлы'), icon: 'tao-copy' },
  { id: 'done', label: tr('Done', 'Готово'), icon: 'tao-check-circle', disabled: true },
])

const count = ref('5')
const layout = ref('auto')
const width = ref('360px')
const current = ref('home')
const floating = ref(true)
const indicator = ref('pill')
const action = ref(true)

const items = computed(() => all.value.slice(0, Number(count.value)))
const currentLabel = computed(() => all.value.find((item) => item.id === current.value)?.label ?? '')
</script>

<template>
  <ShowcaseSection id="tao-nav" :tables="propTables['tao-nav']">
    <h2>TaoNav</h2>
    <Tr>
      <template #en>
        <p>
          Navigation between the sections of an app: one list of items, three looks. <code>layout="auto"</code> picks the
          look by the width of TaoNav itself (container queries): a bottom bar below 600px, a rail with icons below 840px, a
          side panel with labels from 840px. Put the page into the slot and TaoNav lays it out: the bar sticks to the bottom,
          on the side the list sticks to the top. More than five sections on the bar: the last place is «More» with a menu.
          Change the frame width below (or drag its right edge). <code>floating</code> lifts the bar off the edges into a
          pill with a shadow. The <code>#action</code> slot holds the main action of the screen and moves with the navigation:
          a round button above the bar at the end side, at the top of the rail, an extended button with its text at the top
          of the side panel. Put the text into <code>.tao-nav__action-label</code>: in the round looks it is hidden but
          stays the button's name.
        </p>
      </template>
      <template #ru>
        <p>
          Навигация между разделами приложения: один список пунктов, три вида. <code>layout="auto"</code> выбирает вид по
          ширине самого TaoNav (container queries): нижняя панель до 600px, рейка с иконками до 840px, боковая панель с
          подписями от 840px. Страницу кладут в слот, и TaoNav раскладывает её сам: панель прилипает к низу, сбоку к верху
          прилипает список. Больше пяти разделов на панели: последнее место занимает «Ещё» с меню. Меняйте ширину рамки ниже
          (или тяните её правый край). <code>floating</code> отрывает панель от краёв в «пилюлю» с тенью.
          <code>#action</code> — главное действие экрана, оно идёт за навигацией: круглая кнопка над панелью у
          конечного края, наверху рейки, широкая кнопка с текстом наверху боковой панели. Текст кладут в
          <code>.tao-nav__action-label</code>: в круглых видах он скрыт, но остаётся именем кнопки.
        </p>
      </template>
    </Tr>

    <div class="nav-demo__controls">
      <TaoSegmented v-model="width" size="small">
        <TaoSegmentedOption value="360px" label="360" />
        <TaoSegmentedOption value="700px" label="700" />
        <TaoSegmentedOption value="100%" label="100%" />
      </TaoSegmented>
      <TaoSegmented v-model="layout" size="small">
        <TaoSegmentedOption value="auto" label="auto" />
        <TaoSegmentedOption value="bar" label="bar" />
        <TaoSegmentedOption value="rail" label="rail" />
        <TaoSegmentedOption value="drawer" label="drawer" />
      </TaoSegmented>
      <TaoSegmented v-model="count" size="small">
        <TaoSegmentedOption value="4" :label="tr('4 items', '4 пункта')" />
        <TaoSegmentedOption value="5" :label="tr('5 items', '5 пунктов')" />
        <TaoSegmentedOption value="7" :label="tr('7 items', '7 пунктов')" />
      </TaoSegmented>
      <TaoSwitch v-model="floating" size="small" label="floating" />
      <TaoSegmented v-model="indicator" size="small">
        <TaoSegmentedOption value="pill" label="pill" />
        <TaoSegmentedOption value="line" label="line" />
      </TaoSegmented>
      <TaoSwitch v-model="action" size="small" label="#action" />
    </div>

    <div class="nav-demo__frame" :style="{ width }">
      <TaoNav v-model="current" :items="items" :layout="layout" :floating="floating" :indicator="indicator">
        <div class="nav-demo__page">
          <h3>{{ currentLabel }}</h3>
          <p v-for="n in 12" :key="n">{{ tr('A line of the page, to scroll.', 'Строка страницы, чтобы было что прокручивать.') }} {{ n }}</p>
        </div>
        <template v-if="action" #action>
          <TaoButton icon="tao-plus" size="large">
            <span class="tao-nav__action-label">{{ tr('New', 'Создать') }}</span>
          </TaoButton>
        </template>
      </TaoNav>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoNav v-model="section" :items="sections" floating @select="go"&gt;
  &lt;RouterView /&gt;
  &lt;template #action&gt;
    &lt;TaoButton icon="tao-plus" size="large" @click="create"&gt;
      &lt;span class="tao-nav__action-label"&gt;New&lt;/span&gt;
    &lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoNav&gt;

const sections = [
  { id: 'home', label: 'Home', icon: 'tao-circle', href: '/' },
  { id: 'inbox', label: 'Inbox', icon: 'tao-info', href: '/inbox', badge: 3 },
]

// a link navigates by itself; with a router stop it and route
function go(id, event) {
  event.preventDefault()
  router.push(sections.find((s) =&gt; s.id === id).href)
}</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.nav-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.nav-demo__frame {
  max-width: 100%;
  min-width: 280px;
  height: 380px;
  margin-bottom: 16px;
  overflow: auto;
  resize: horizontal;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-bg);
}

.nav-demo__page {
  padding: 16px;
}

.nav-demo__page h3 {
  margin: 0 0 8px;
}

.nav-demo__page p {
  margin: 0 0 8px;
  color: var(--tao-color-text-muted);
}
</style>
