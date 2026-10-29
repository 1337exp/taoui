<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { TaoButton, TaoIcon, TaoInput, TaoScrollTop, TaoSelect, TaoTag, taoPalettes } from '@1337exp/taoui'
import { navGroups } from './nav.js'
import { demoById } from './sections.js'
import { lang, LANGS, tr } from './i18n.js'
import { scrollTopDemo } from './scrollTopDemo.js'
import pkg from '../package.json'

const version = pkg.version

// Search looks through both languages, whichever is on screen.
const both = (text) => (text && typeof text === 'object' ? `${text.en ?? ''} ${text.ru ?? ''}` : (text ?? ''))

// Theme = a palette (a list of ready-made ones, or the default) x a mode (dark / light). The choice is remembered.
// The default palette keeps the old attribute (data-tao-theme="dark" / "light"); a palette is data-tao-theme="<name>"
// plus data-tao-mode for its light twin.
const STORE = 'tao-showcase-theme'
const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '{}')
  } catch {
    return {}
  }
})()
const known = new Set(['default', ...taoPalettes.map((p) => p.name)])
const palette = ref(known.has(saved.palette) ? saved.palette : 'default')
const theme = ref(saved.mode === 'light' ? 'light' : 'dark')
// density is a second axis next to the size: one class on <html> changes every control on the page
const DENSITIES = ['compact', 'default', 'comfortable', 'auto']
const density = ref(DENSITIES.includes(saved.density) ? saved.density : 'default')

const paletteOptions = computed(() => [
  { value: 'default', label: tr('Default', 'По умолчанию') },
  ...taoPalettes.map((p) => ({ value: p.name, label: p.label })),
])
const swatches = computed(() => taoPalettes.find((p) => p.name === palette.value)?.stops ?? [])

function applyTheme() {
  const el = document.documentElement
  el.setAttribute('data-tao-theme', palette.value === 'default' ? theme.value : palette.value)
  el.setAttribute('data-tao-mode', theme.value)
  document.body.classList.add('tao-atmosphere')
  DENSITIES.forEach((d) => el.classList.toggle(`tao-density-${d}`, d === density.value && d !== 'default'))
  try {
    localStorage.setItem(STORE, JSON.stringify({ palette: palette.value, mode: theme.value, density: density.value }))
  } catch {
    // a private window: the choice is just not remembered
  }
}

function setTheme(value) {
  theme.value = value
  applyTheme()
}

function setDensity(value) {
  density.value = value
  applyTheme()
}

function setPalette(value) {
  palette.value = value ?? 'default'
  applyTheme()
}

applyTheme()

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
    const hay = [groupId, both(group?.title), item?.id, both(item?.label), ...(item?.aliases ?? [])]
      .join(' ')
      .toLowerCase()
    return hay.includes(needle)
  }
  return activeGroup.value === 'all' || activeGroup.value === groupId
}

function groupVisibleInNav(group) {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return true
  if (both(group.title).toLowerCase().includes(needle)) return true
  return group.items.some((item) => itemMatchesQuery(item, needle))
}

function itemMatchesQuery(item, needle) {
  const hay = [item.id, both(item.label), ...(item.aliases ?? [])].join(' ').toLowerCase()
  return hay.includes(needle)
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

  // opened with #section (a shared link, a reload): go there / открыта по ссылке с #раздел: идём туда
  const id = decodeURIComponent(location.hash.slice(1))
  const group = id && navGroups.find((g) => g.items.some((item) => item.id === id))
  if (group) goTo(group.id, id)
})

onBeforeUnmount(() => {
  sectionObserver?.disconnect()
})
</script>

<template>
  <div class="showcase">
    <header class="showcase-top">
      <div>
        <h1 class="showcase-title">
          Tao UI
          <!-- the version of the build, so a deployed showcase says what it shows / версия сборки: развёрнутый шоукейс говорит, что показывает -->
          <TaoTag size="small" flat :title="tr('The version this showcase is built from', 'Версия, из которой собран этот шоукейс')">v{{ version }}</TaoTag>
        </h1>
        <p class="showcase-lead">{{ tr('A Vue 3 kit on design tokens.', 'Vue 3 kit на дизайн-токенах.') }}</p>
      </div>
      <div class="showcase-top__controls">
      <div class="theme-switcher">
        <span class="theme-switcher__label">{{ tr('Language:', 'Язык:') }}</span>
        <button
          v-for="code in LANGS"
          :key="code"
          type="button"
          class="theme-switcher__btn"
          :class="{ active: lang === code }"
          @click="lang = code"
        >
          {{ code.toUpperCase() }}
        </button>
      </div>
      <div class="theme-switcher">
        <span class="theme-switcher__label">{{ tr('Palette:', 'Палитра:') }}</span>
        <span class="palette-select">
          <TaoSelect :model-value="palette" :options="paletteOptions" :clearable="false" @update:model-value="setPalette" />
        </span>
        <span class="palette-swatches" aria-hidden="true">
          <i v-for="color in swatches" :key="color" :style="{ background: color }" />
        </span>
      </div>
      <div class="theme-switcher">
        <span class="theme-switcher__label">{{ tr('Mode:', 'Режим:') }}</span>
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
      <div class="theme-switcher">
        <span class="theme-switcher__label">{{ tr('Density:', 'Плотность:') }}</span>
        <button
          v-for="d in DENSITIES"
          :key="d"
          type="button"
          class="theme-switcher__btn"
          :class="{ active: density === d }"
          @click="setDensity(d)"
        >
          {{ d }}
        </button>
      </div>
      </div>
    </header>

    <div class="showcase-body">
      <nav class="showcase-nav" :aria-label="tr('Showcase sections', 'Разделы showcase')">
        <TaoInput
          v-model="query"
          class="showcase-nav__search"
          size="small"
          :placeholder="tr('Find a component…', 'Найти компонент…')"
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
          <TaoButton variant="secondary" tone="neutral" size="small" @click="showAll">{{ tr('All components', 'Все компоненты') }}</TaoButton>
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
      <p>Tao UI · MIT · 2026 · <a href="https://github.com/1337exp/taoui">GitHub</a> · <a href="https://www.npmjs.com/package/@1337exp/taoui">npm</a></p>
    </footer>

    <TaoScrollTop
      :boundary="200"
      :variant="scrollTopDemo.variant"
      :side="scrollTopDemo.side"
      :label="scrollTopDemo.label === 'on' ? tr('Back to top', 'Наверх') : ''"
    />
  </div>
</template>
