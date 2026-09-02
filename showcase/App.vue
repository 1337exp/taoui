<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { TaoScrollTop } from '@tao/ui'
import { navGroups } from './nav.js'
import { demoById } from './sections.js'

const theme = ref('dark')
function setTheme(value) {
  theme.value = value
  document.documentElement.setAttribute('data-tao-theme', value)
}

const activeGroup = ref('all')
const query = ref('')
const activeSection = ref('')

const currentGroup = computed(() => {
  if (query.value.trim()) return null
  return navGroups.find((group) => group.id === activeGroup.value) ?? null
})

function sectionVisible(groupId, sectionId) {
  const needle = query.value.trim().toLowerCase()
  if (needle) {
    const group = navGroups.find((item) => item.id === groupId)
    const item = group?.items.find((entry) => entry.id === sectionId)
    const hay = [groupId, group?.title, item?.id, item?.label, ...(item?.aliases ?? [])]
      .join(' ')
      .toLowerCase()
    return hay.includes(needle)
  }
  return activeGroup.value === 'all' || activeGroup.value === groupId
}

function groupVisibleInNav(group) {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return true
  if (group.title.toLowerCase().includes(needle)) return true
  return group.items.some((item) => itemMatchesQuery(item, needle))
}

function itemMatchesQuery(item, needle) {
  const hay = [item.id, item.label, ...(item.aliases ?? [])].join(' ').toLowerCase()
  return hay.includes(needle)
}

function itemVisibleInNav(group, item) {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return true
  if (group.title.toLowerCase().includes(needle)) return true
  return itemMatchesQuery(item, needle)
}

function goTo(groupId, sectionId) {
  query.value = ''
  activeGroup.value = groupId
  nextTick(() => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = sectionId
  })
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
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})
</script>

<template>
  <div class="showcase">
    <header class="showcase-top">
      <div>
        <h1>Tao UI</h1>
        <p class="showcase-lead">Vue 3 kit на дизайн-токенах. Поменял переменные — поменялась тема.</p>
      </div>
      <div class="theme-switcher">
        <span class="theme-switcher__label">Тема:</span>
        <button
          v-for="t in ['dark', 'light']"
          :key="t"
          type="button"
          class="theme-switcher__btn"
          :class="{ active: theme === t }"
          @click="setTheme(t)"
        >
          {{ t }}
        </button>
      </div>
    </header>

    <div class="showcase-body">
      <nav class="showcase-nav" aria-label="Разделы showcase">
        <input
          v-model="query"
          class="showcase-nav__search"
          type="search"
          placeholder="Найти компонент…"
        />

        <button
          type="button"
          class="showcase-nav__all"
          :class="{ active: activeGroup === 'all' && !query }"
          @click="showAll"
        >
          Все
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
            {{ group.title }}
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
            {{ item.label }}
          </a>
        </div>
      </nav>

      <main class="showcase-main">
        <div v-if="currentGroup" class="showcase-banner">
          <div>
            <p class="showcase-banner__kicker">Раздел</p>
            <h2 class="showcase-banner__title">{{ currentGroup.title }}</h2>
          </div>
          <button type="button" class="showcase-banner__reset" @click="showAll">Все компоненты</button>
        </div>

        <template v-for="group in navGroups" :key="group.id">
          <component
            v-for="item in group.items"
            :key="item.id"
            :is="demoById[item.id]"
            v-show="sectionVisible(group.id, item.id)"
          />
        </template>
      </main>
    </div>

    <footer class="showcase-footer">
      <p>Tao UI · MIT · 2026</p>
    </footer>

    <TaoScrollTop :boundary="200" />
  </div>
</template>
