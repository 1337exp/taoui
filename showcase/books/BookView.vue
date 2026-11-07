<script setup>
// One book of the showcase: its menu, its search and its pages. The pages are loaded when the book is opened, so the
// other two books cost nothing until then. The shell (App.vue) owns the theme bar and the choice of the book.
// On a phone the menu is a bottom sheet; its button goes into the sticky bar through a Teleport (#showcase-pages-slot).
// Одна книга шоукейса: её меню, поиск и страницы. Страницы грузятся, когда книгу открывают, так что две другие книги
// ничего не стоят, пока их не открыли. Оболочка (App.vue) держит панель темы и выбор книги.
// На телефоне меню — нижний лист; его кнопка попадает в липкую панель через Teleport (#showcase-pages-slot).
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TaoButton, TaoDrawer } from '@1337exp/taoui'
import { tr } from '../i18n.js'
import { narrow } from '../narrow.js'
import BookMenu from './BookMenu.vue'
import { sectionVisible } from './match.js'

const props = defineProps({
  book: { type: Object, required: true },
  // { id, n }: the section the address names; a new `n` goes there again / раздел, который назвал адрес; новый `n` — идём туда снова
  focus: { type: Object, default: null },
})

const navGroups = props.book.nav
const { demoById } = await props.book.load()

const activeGroup = ref('all')
const query = ref('')
const activeSection = ref('')
const pagesOpen = ref(false)

const currentGroup = computed(() => {
  if (query.value.trim()) return null
  return navGroups.find((group) => group.id === activeGroup.value) ?? null
})

// the button of the sheet says where you are / кнопка листа говорит, где вы
const currentLabel = computed(() => {
  for (const group of navGroups) {
    const item = group.items.find((entry) => entry.id === activeSection.value)
    if (item) return tr(item.label)
  }
  return ''
})

function goTo(groupId, sectionId) {
  query.value = ''
  activeGroup.value = groupId
  // the address says which section is open, so it can be shared and reloaded; replace, not push: Back leaves the page
  // адрес говорит, какой раздел открыт: им можно поделиться и перезагрузить; replace, а не push: «Назад» уходит со страницы
  history.replaceState(null, '', `#${sectionId}`)
  nextTick(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = sectionId
  })
}

// from the sheet: close it first, the page is locked for scrolling while it is open / из листа: сначала закрыть, пока он открыт, страница не прокручивается
function goFromSheet(groupId, sectionId) {
  pagesOpen.value = false
  setTimeout(() => goTo(groupId, sectionId), 200)
}

function goToId(sectionId) {
  const group = navGroups.find((g) => g.items.some((item) => item.id === sectionId))
  if (group) goTo(group.id, sectionId)
}

function showAll() {
  query.value = ''
  activeGroup.value = 'all'
}

function toggleGroup(groupId) {
  query.value = ''
  activeGroup.value = activeGroup.value === groupId ? 'all' : groupId
}

let sectionObserver = null

onMounted(() => {
  sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) {
        activeSection.value = visible.target.id
      }
    },
    { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 1] },
  )
  document.querySelectorAll('.showcase-section[id]').forEach((el) => sectionObserver.observe(el))
  if (props.focus?.id) goToId(props.focus.id)
})

watch(() => props.focus, (focus) => {
  if (focus?.id) goToId(focus.id)
})

onBeforeUnmount(() => sectionObserver?.disconnect())
</script>

<template>
  <p class="showcase-book-lead">{{ tr(book.lead) }}</p>

  <!-- a phone: the button sits in the sticky bar, the menu is a sheet / телефон: кнопка в липкой панели, меню — лист -->
  <template v-if="narrow">
    <Teleport to="#showcase-pages-slot">
      <TaoButton block size="small" variant="secondary" tone="neutral" icon="tao-align-left" @click="pagesOpen = true">
        {{ tr('Pages', 'Страницы') }}<template v-if="currentLabel"> · {{ currentLabel }}</template>
      </TaoButton>
    </Teleport>
    <TaoDrawer v-model="pagesOpen" side="bottom" :title="tr(book.title)">
      <BookMenu
        v-model:query="query"
        sheet
        :groups="navGroups"
        :label="tr(book.title)"
        :active-group="activeGroup"
        :active-section="activeSection"
        @go="goFromSheet"
        @all="showAll"
        @group="toggleGroup"
      />
    </TaoDrawer>
  </template>

  <div class="showcase-body">
    <BookMenu
      v-if="!narrow"
      v-model:query="query"
      :groups="navGroups"
      :label="tr(book.title)"
      :active-group="activeGroup"
      :active-section="activeSection"
      @go="goTo"
      @all="showAll"
      @group="toggleGroup"
    />

    <main class="showcase-main">
      <div v-if="currentGroup" class="showcase-banner">
        <div>
          <p class="showcase-banner__kicker">{{ tr('Section', 'Раздел') }}</p>
          <h2 class="showcase-banner__title">{{ tr(currentGroup.title) }}</h2>
        </div>
        <TaoButton variant="secondary" tone="neutral" size="small" @click="showAll">{{ tr('Show all', 'Показать всё') }}</TaoButton>
      </div>

      <template v-for="group in navGroups" :key="group.id">
        <component
          v-for="item in group.items"
          :key="item.id"
          :is="demoById[item.id]"
          v-show="sectionVisible(group, item, query, activeGroup)"
        />
      </template>
    </main>
  </div>
</template>
