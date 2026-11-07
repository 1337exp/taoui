<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TaoButton, TaoPopover, TaoScrollTop, TaoSegmented, TaoSegmentedOption, TaoSelect, TaoTag, TaoThemeToggle, readTaoMode, taoPalettes } from '@1337exp/taoui'
import { bookById, bookOfSection, books } from './books/index.js'
import BookView from './books/BookView.vue'
import { lang, LANGS, tr } from './i18n.js'
import { narrow } from './narrow.js'
import { scrollTopDemo } from './scrollTopDemo.js'
import pkg from '../package.json'

const version = pkg.version

// The book is the first thing the address says: #/guide opens a book, #button opens the book that holds that section
// and goes there (so the old links keep working). The pages of a book are in books/BookView.vue.
// Книга — первое, что говорит адрес: #/guide открывает книгу, #button — книгу, где лежит этот раздел, и идёт к нему
// (старые ссылки работают). Страницы книги — в books/BookView.vue.
const bookId = ref(books[0].id)
const book = computed(() => bookById(bookId.value))
const focus = ref(null)
let focusCount = 0

function readAddress() {
  const hash = decodeURIComponent(location.hash.slice(1))
  if (hash.startsWith('/')) {
    const target = bookById(hash.slice(1))
    if (target) bookId.value = target.id
    focus.value = null
    return
  }
  const holder = hash && bookOfSection(hash)
  if (holder) {
    bookId.value = holder.id
    focus.value = { id: hash, n: ++focusCount }
  }
}

function openBook(id) {
  if (id !== bookId.value) {
    bookId.value = id
    focus.value = null
  }
  // replace, not push: Back leaves the page / replace, а не push: «Назад» уходит со страницы
  history.replaceState(null, '', `#/${id}`)
  window.scrollTo({ top: 0 })
}

readAddress()

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
// frames: the loudness of decorative frames, one class on <html> (src/styles/contexts/frames.css)
const FRAMES = ['framed', 'soft']
const frames = ref(FRAMES.includes(saved.frames) ? saved.frames : 'framed')

// the mark of the project follows the mode: a white T on dark, a dark T on light (showcase/public/logo)
// знак проекта идёт за режимом: белая T на тёмном, тёмная на светлом
const logoSrc = computed(() => `${import.meta.env.BASE_URL}logo/logo-mark-${theme.value}.svg`)

// The settings bar sticks to the top, so the options are at hand wherever you scroll. Its height goes to the page
// (--showcase-bar) for the section list and the scroll margins; the brand shows in it only once it has stuck.
// Панель настроек липнет к верху: опции под рукой, где бы ни прокрутили. Её высота уходит в страницу (--showcase-bar)
// для списка разделов и отступов прокрутки; бренд в ней появляется, только когда она прилипла.
// the rare options sit in the "View" popover; a dot on its button says one of them is off the default
// редкие опции лежат в поповере «Вид»; точка на его кнопке говорит, что одна из них не по умолчанию
const viewChanged = computed(() => density.value !== 'default' || frames.value !== 'framed')

const rootRef = ref(null)
const barRef = ref(null)
const sentinelRef = ref(null)
const stuck = ref(false)

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
  el.classList.toggle('tao-frames-soft', frames.value === 'soft')
  try {
    localStorage.setItem(STORE, JSON.stringify({ palette: palette.value, mode: theme.value, density: density.value, frames: frames.value }))
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

function setFrames(value) {
  frames.value = value
  applyTheme()
}

function setPalette(value) {
  palette.value = value ?? 'default'
  applyTheme()
}

applyTheme()

let barObserver = null
let stuckObserver = null
let modeObserver = null

onMounted(() => {
  // a TaoThemeToggle in a demo changes <html> by itself: the bar follows and remembers it / переключатель в демо сам меняет <html>: панель идёт следом и запоминает
  modeObserver = new MutationObserver(() => {
    const mode = readTaoMode(document.documentElement)
    if (mode !== theme.value) setTheme(mode)
  })
  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tao-mode'] })
  barObserver = new ResizeObserver(() => {
    const bar = barRef.value
    // a bar that does not stick (a narrow screen) takes no room from the section list / не липнущая панель не отнимает места
    const room = bar && getComputedStyle(bar).position === 'sticky' ? bar.offsetHeight + 8 : 0
    rootRef.value?.style.setProperty('--showcase-bar', `${room}px`)
  })
  if (barRef.value) barObserver.observe(barRef.value)
  stuckObserver = new IntersectionObserver(([entry]) => {
    stuck.value = !entry.isIntersecting && entry.boundingClientRect.top < 0
  })
  if (sentinelRef.value) stuckObserver.observe(sentinelRef.value)

  // a link typed or followed inside the page (a guide page pointing at #button) / ссылка, набранная или нажатая внутри страницы
  window.addEventListener('hashchange', readAddress)
})

onBeforeUnmount(() => {
  modeObserver?.disconnect()
  barObserver?.disconnect()
  stuckObserver?.disconnect()
  window.removeEventListener('hashchange', readAddress)
})
</script>

<template>
  <div ref="rootRef" class="showcase">
    <header class="showcase-top">
      <div>
        <!-- the mark is the T of the word; the name for a screen reader is the whole word / знак — это T слова; имя для скринридера — слово целиком -->
        <h1 class="showcase-title" aria-label="Tao UI">
          <span class="showcase-title__word" aria-hidden="true"><img class="showcase-title__mark" :src="logoSrc" alt="" width="89" height="87" />ao UI</span>
          <!-- the version of the build, so a deployed showcase says what it shows / версия сборки: развёрнутый шоукейс говорит, что показывает -->
          <TaoTag size="small" flat :title="tr('The version this showcase is built from', 'Версия, из которой собран этот шоукейс')">v{{ version }}</TaoTag>
        </h1>
        <p class="showcase-lead">{{ tr('A Vue 3 kit on design tokens.', 'Vue 3 kit на дизайн-токенах.') }}</p>
      </div>
    </header>

    <div ref="sentinelRef" class="showcase-bar-sentinel" aria-hidden="true"></div>
    <div ref="barRef" class="showcase-bar tao-size-small" role="group" :aria-label="tr('Showcase settings', 'Настройки шоукейса')">
      <span class="showcase-bar__brand" :class="{ 'showcase-bar__brand--on': stuck }" aria-hidden="true">
        <img :src="logoSrc" alt="" width="22" height="22" />
        Tao UI
        <TaoTag size="small" flat>v{{ version }}</TaoTag>
      </span>
      <!-- the three books: the choice sits in the bar, so it is at hand wherever you have scrolled / три книги: выбор в панели, под рукой, как бы далеко ни прокрутили -->
      <nav class="showcase-books" :aria-label="tr('Showcase books', 'Книги шоукейса')">
        <a
          v-for="item in books"
          :key="item.id"
          class="showcase-books__tab"
          :class="{ active: item.id === bookId }"
          :href="'#/' + item.id"
          :aria-current="item.id === bookId ? 'page' : undefined"
          @click.prevent="openBook(item.id)"
        >
          {{ tr(item.title) }}
        </a>
      </nav>
      <div class="showcase-bar__controls">
        <!-- a phone keeps only the theme in the bar (it is what you test while you scroll); the rest folds into the popover / телефон оставляет в панели только тему (её проверяют на ходу), остальное складывается в поповер -->
        <template v-if="!narrow">
          <TaoSegmented :model-value="lang" :aria-label="tr('Language', 'Язык')" @update:model-value="lang = $event">
            <TaoSegmentedOption v-for="code in LANGS" :key="code" :value="code">{{ code.toUpperCase() }}</TaoSegmentedOption>
          </TaoSegmented>
          <span class="showcase-bar__palette">
            <span class="palette-select">
              <TaoSelect :model-value="palette" :options="paletteOptions" :clearable="false" :aria-label="tr('Palette', 'Палитра')" @update:model-value="setPalette" />
            </span>
            <span class="palette-swatches" aria-hidden="true">
              <i v-for="color in swatches" :key="color" :style="{ background: color }" />
            </span>
          </span>
        </template>
        <TaoThemeToggle :model-value="theme" :apply="false" @update:model-value="setTheme" />
        <TaoPopover placement="bottom-end">
          <template #trigger>
            <TaoButton variant="secondary" icon="tao-settings" :aria-label="narrow ? tr('View', 'Вид') : undefined">
              <template v-if="!narrow">{{ tr('View', 'Вид') }}</template>
              <i v-if="viewChanged" class="showcase-bar__dot" :title="tr('Not the defaults', 'Не по умолчанию')" />
            </TaoButton>
          </template>
          <div class="showcase-view tao-size-medium">
            <template v-if="narrow">
              <div class="showcase-view__row">
                <span class="showcase-view__label">{{ tr('Language', 'Язык') }}</span>
                <TaoSegmented :model-value="lang" :aria-label="tr('Language', 'Язык')" @update:model-value="lang = $event">
                  <TaoSegmentedOption v-for="code in LANGS" :key="code" :value="code">{{ code.toUpperCase() }}</TaoSegmentedOption>
                </TaoSegmented>
              </div>
              <div class="showcase-view__row">
                <span class="showcase-view__label">{{ tr('Palette', 'Палитра') }}</span>
                <span class="showcase-bar__palette">
                  <span class="palette-select">
                    <TaoSelect :model-value="palette" :options="paletteOptions" :clearable="false" :aria-label="tr('Palette', 'Палитра')" @update:model-value="setPalette" />
                  </span>
                  <span class="palette-swatches" aria-hidden="true">
                    <i v-for="color in swatches" :key="color" :style="{ background: color }" />
                  </span>
                </span>
              </div>
            </template>
            <div class="showcase-view__row">
              <span class="showcase-view__label">{{ tr('Density', 'Плотность') }}</span>
              <TaoSegmented :model-value="density" :aria-label="tr('Density', 'Плотность')" @update:model-value="setDensity">
                <TaoSegmentedOption v-for="d in DENSITIES" :key="d" :value="d">{{ d }}</TaoSegmentedOption>
              </TaoSegmented>
            </div>
            <div class="showcase-view__row">
              <span class="showcase-view__label">{{ tr('Frames', 'Рамки') }}</span>
              <TaoSegmented :model-value="frames" :aria-label="tr('Frames', 'Рамки')" @update:model-value="setFrames">
                <TaoSegmentedOption v-for="f in FRAMES" :key="f" :value="f">{{ f }}</TaoSegmentedOption>
              </TaoSegmented>
            </div>
          </div>
        </TaoPopover>
      </div>
      <!-- the book puts its page menu button here on a phone (books/BookView.vue) / книга кладёт сюда кнопку меню страниц на телефоне -->
      <div v-if="narrow" id="showcase-pages-slot" class="showcase-bar__pages"></div>
    </div>

    <!-- one book at a time: its pages are fetched when it is opened / одна книга за раз: её страницы грузятся, когда её открывают -->
    <Suspense>
      <BookView :key="book.id" :book="book" :focus="focus" />
      <template #fallback>
        <p class="showcase-book-lead">{{ tr('Loading…', 'Загрузка…') }}</p>
      </template>
    </Suspense>

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
