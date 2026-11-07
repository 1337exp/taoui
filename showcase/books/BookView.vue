<script setup>
// One book of the showcase: its menu, its search and its pages. The pages are loaded when the book is opened, so the
// other two books cost nothing until then. The shell (App.vue) owns the theme bar and the choice of the book.
// Одна книга шоукейса: её меню, поиск и страницы. Страницы грузятся, когда книгу открывают, так что две другие книги
// ничего не стоят, пока их не открыли. Оболочка (App.vue) держит панель темы и выбор книги.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TaoButton, TaoIcon, TaoInput } from '@1337exp/taoui'
import { tr } from '../i18n.js'

const props = defineProps({
  book: { type: Object, required: true },
  // { id, n }: the section the address names; a new `n` goes there again / раздел, который назвал адрес; новый `n` — идём туда снова
  focus: { type: Object, default: null },
})

const navGroups = props.book.nav
const { demoById } = await props.book.load()

// Search looks through both languages, whichever is on screen.
const both = (text) => (text && typeof text === 'object' ? `${text.en ?? ''} ${text.ru ?? ''}` : (text ?? ''))

const activeGroup = ref('all')
const query = ref('')
const activeSection = ref('')

const currentGroup = computed(() => {
  if (query.value.trim()) return null
  return navGroups.find((group) => group.id === activeGroup.value) ?? null
})

function itemMatchesQuery(item, needle) {
  const hay = [item.id, both(item.label), ...(item.aliases ?? [])].join(' ').toLowerCase()
  return hay.includes(needle)
}

function sectionVisible(group, item) {
  const needle = query.value.trim().toLowerCase()
  if (needle) {
    const hay = [group.id, both(group.title), item.id, both(item.label), ...(item.aliases ?? [])].join(' ').toLowerCase()
    return hay.includes(needle)
  }
  return activeGroup.value === 'all' || activeGroup.value === group.id
}

function groupVisibleInNav(group) {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return true
  if (both(group.title).toLowerCase().includes(needle)) return true
  return group.items.some((item) => itemMatchesQuery(item, needle))
}

function itemVisibleInNav(group, item) {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return true
  if (both(group.title).toLowerCase().includes(needle)) return true
  return itemMatchesQuery(item, needle)
}

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
  <div class="showcase-body">
    <nav class="showcase-nav" :aria-label="tr(book.title)">
      <TaoInput
        v-model="query"
        class="showcase-nav__search"
        size="small"
        :placeholder="tr('Find a page…', 'Найти страницу…')"
        :aria-label="tr('Find a page', 'Найти страницу')"
      >
        <template #prefix><TaoIcon name="tao-search" /></template>
      </TaoInput>

      <button
        type="button"
        class="showcase-nav__all"
        :class="{ active: activeGroup === 'all' && !query }"
        @click="showAll"
      >
        {{ tr('All', 'Все') }}
      </button>

      <div
        v-for="group in navGroups"
        v-show="groupVisibleInNav(group)"
        :key="group.id"
        class="showcase-nav__group"
      >
        <button
          type="button"
          class="showcase-nav__group-title"
          :class="{ active: activeGroup === group.id }"
          @click="toggleGroup(group.id)"
        >
          {{ tr(group.title) }}
        </button>
        <a
          v-for="item in group.items"
          v-show="itemVisibleInNav(group, item)"
          :key="item.id"
          class="showcase-nav__link"
          :class="{ active: activeSection === item.id }"
          :href="'#' + item.id"
          @click.prevent="goTo(group.id, item.id)"
        >
          {{ tr(item.label) }}
        </a>
      </div>
    </nav>

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
          v-show="sectionVisible(group, item)"
        />
      </template>
    </main>
  </div>
</template>
