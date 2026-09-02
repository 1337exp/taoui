<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  TaoBlock,
  TaoButton,
  TaoCard,
  TaoCopy,
  TaoInput,
  TaoInputGroup,
  TaoInputNumber,
  TaoQuantity,
  TaoModal,
  TaoSpoiler,
  TaoSpoilerGroup,
  TaoTabs,
  TaoTooltip,
  TaoPopover,
  TaoContainer,
  TaoFlex,
  TaoSpace,
  TaoIcon,
  TaoLoader,
  TaoImage,
  TaoCheckbox,
  TaoTag,
  TaoDivider,
  TaoAnimatedBorder,
  TaoTextarea,
  TaoScrollTop,
  TaoProgress,
  TaoSlider,
  TaoFileDrop,
  TaoDropdownMenu,
  TaoPinCode,
  TaoLink,
  TaoFormField,
  TaoSelect,
  TaoCombobox,
  TaoDate,
  TaoSwitch,
  TaoRadio,
  TaoRadioGroup,
  TaoAlert,
  TaoTable,
  TaoPagination,
  TaoEmpty,
  TaoSkeleton,
  TaoDrawer,
  TaoAvatar,
  TaoBreadcrumb,
  TaoCounter,
  TaoCarousel,
  TaoStages,
  toast,
  confirm,
} from '@tao/ui'

// Theme switcher demo
const theme = ref('dark')
function setTheme(value) {
  theme.value = value
  document.documentElement.setAttribute('data-tao-theme', value)
}

// TaoButton demos
const buttonVariants = ['primary', 'secondary', 'ghost', 'danger']
const buttonSizes = ['small', 'medium', 'large']

// TaoInput demo
const inputValue = ref('')
const searchQuery = ref('')
const amountText = ref('1490')
const siteHost = ref('taoui.dev')
const formEmail = ref('')
const formPassword = ref('')
const formSaving = ref(false)

function onDemoSubmit() {
  formSaving.value = true
  window.setTimeout(() => {
    formSaving.value = false
    toast().success().message('Сохранено')
  }, 700)
}
const qty = ref(2)
const price = ref(1490)
const cartQty = ref(1)
const shelfQty = ref(1)
const stockQty = ref(3)
const quantityNote = ref('')

function onShelfDec(value) {
  if (value <= 1) {
    quantityNote.value = 'Минус на 1: родитель может убрать строку'
    toast().info().message('Убрать из корзины')
  }
}

function onStockInc(value) {
  if (value >= 5) {
    quantityNote.value = 'Сток кончился — плюс больше не двигает число'
  }
}
const counterValue = ref(1284)
const carouselHero = ref(0)
const carouselPeek = ref(0)
const carouselStrip = ref(0)
const carouselBare = ref(0)
const carouselCustom = ref(0)
const carouselExample = `<TaoCarousel :autoplay="4000" loop dots>
  <article v-for="item in banners" :key="item.id" class="hero">
    <strong>{{ item.title }}</strong>
    <span>{{ item.text }}</span>
  </article>
</TaoCarousel>

/* вид слайда — ваш article, не карусель */
.hero {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  min-height: 180px;
  padding: 20px;
  border-radius: var(--tao-radius-panel);
  background: linear-gradient(135deg, var(--tao-color-accent-subtle), var(--tao-color-surface-sunken));
}`
const carouselBanners = [
  { id: 1, title: 'Осенняя коллекция', text: 'Новые фактуры и спокойные цвета' },
  { id: 2, title: 'Скидка 20%', text: 'На вторую пару обуви' },
  { id: 3, title: 'Только что поступило', text: 'Куртки Drift и рюкзаки Field' },
  { id: 4, title: 'Бесплатная доставка', text: 'От 5 000 ₽ по городу' },
]
const carouselProducts = [
  { id: 1, name: 'Nova', price: '8 990 ₽' },
  { id: 2, name: 'Drift', price: '12 400 ₽' },
  { id: 3, name: 'Field', price: '4 350 ₽' },
  { id: 4, name: 'Arc', price: '15 200 ₽' },
  { id: 5, name: 'Halo', price: '3 190 ₽' },
  { id: 6, name: 'Pike', price: '6 750 ₽' },
  { id: 7, name: 'Moss', price: '9 100 ₽' },
  { id: 8, name: 'Volt', price: '2 490 ₽' },
  { id: 9, name: 'Dune', price: '11 300 ₽' },
  { id: 10, name: 'Flint', price: '5 620 ₽' },
  { id: 11, name: 'Reef', price: '7 840 ₽' },
  { id: 12, name: 'Ash', price: '13 050 ₽' },
  { id: 13, name: 'Glow', price: '1 990 ₽' },
  { id: 14, name: 'Nori', price: '4 880 ₽' },
  { id: 15, name: 'Bolt', price: '10 200 ₽' },
  { id: 16, name: 'Yarn', price: '3 640 ₽' },
]

// TaoModal demo
const isModalOpen = ref(false)
const isDrawerOpen = ref(false)

// TaoTabs demo
const activeTab = ref('tab1')
const tabs = [
  { key: 'tab1', label: 'Вкладка 1' },
  { key: 'tab2', label: 'Вкладка 2' },
  { key: 'tab3', label: 'Вкладка 3', disabled: true }
]

const tabContents = {
  tab1: 'Содержимое первой вкладки. Здесь может быть любой контент.',
  tab2: 'Содержимое второй вкладки. Можно размещать текст, изображения, формы.',
  tab3: 'Эта вкладка отключена.'
}

// TaoSpoiler demo
const spoilerOpen = ref(false)
const spoilerFaq = ref('ship')
const popoverOpen = ref(false)
const popoverStock = ref(true)

// TaoCopy demo
const copyText = 'Этот текст будет скопирован в буфер обмена!'

// TaoCheckbox demo
const checkedA = ref(false)
const checkedB = ref(true)
const fruitChecks = ref([
  { label: 'Яблоки', checked: true },
  { label: 'Груши', checked: false },
  { label: 'Сливы', checked: true },
])
const allFruitsChecked = computed({
  get: () => fruitChecks.value.every((item) => item.checked),
  set: (next) => {
    fruitChecks.value.forEach((item) => {
      item.checked = next
    })
  },
})
const fruitsMixed = computed(
  () => fruitChecks.value.some((item) => item.checked) && !allFruitsChecked.value,
)

// TaoTextarea demo
const textareaValue = ref('')

// TaoProgress / TaoSlider demo
const sliderValue = ref(35)

// TaoFileDrop demo — два сценария очистки: мгновенно и через подтверждение
const filesInstant = ref([])
const filesConfirm = ref([])
async function requestClearConfirm() {
  const ok = await confirm()
    .title('Удалить файлы?')
    .message('Список загруженных файлов будет очищен.')
    .ok('Удалить')
    .danger()
  if (ok) {
    filesConfirm.value = []
  }
}

// TaoDropdownMenu demo
const dropdownActions = [
  { id: 'edit', name: 'Редактировать' },
  { id: 'duplicate', name: 'Дублировать' },
  { id: 'delete', name: 'Удалить' }
]

// TaoPinCode demo
const pinValue = ref('')
const pinValueNumeric = ref('')
const pinValueReplace = ref('')
const pinCompleteNote = ref('')

function onPinComplete(value) {
  pinCompleteNote.value = 'Готово: ' + value
}

const city = ref('')
const cityError = ref('')
const cities = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'nsk', label: 'Новосибирск' },
]
const notifyEmail = ref(true)
const plan = ref('pro')
const comboCity = ref(null)
const comboTag = ref(null)
const comboFree = ref(null)
const comboCities = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'kzn', label: 'Казань', disabled: true },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'ekb', label: 'Екатеринбург' },
  { value: 'nn', label: 'Нижний Новгород' },
  { value: 'sam', label: 'Самара' },
  { value: 'oms', label: 'Омск' },
  { value: 'chel', label: 'Челябинск' },
  { value: 'rnd', label: 'Ростов-на-Дону' },
  { value: 'ufa', label: 'Уфа' },
  { value: 'krsk', label: 'Красноярск' },
  { value: 'vrn', label: 'Воронеж' },
  { value: 'perm', label: 'Пермь' },
  { value: 'vlg', label: 'Волгоград' },
]
const comboFreeOptions = [
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'ts', label: 'TypeScript' },
]
const comboTags = ref([
  { value: 'vue', label: 'Vue' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'ts', label: 'TypeScript' },
])
function onComboTagCreate(text) {
  const exists = comboTags.value.some(
    (tag) => tag.value === text || tag.label.toLowerCase() === String(text).toLowerCase(),
  )
  if (!exists) {
    comboTags.value.push({ value: text, label: text })
  }
}
const deliveryDate = ref('2026-09-02')
const emptyDate = ref(null)
const errorDate = ref(null)
const orderStages = [
  { key: 'pay', label: 'Оплата', status: 'ok' },
  { key: 'pack', label: 'Сборка', status: 'work' },
  { key: 'ship', label: 'Доставка', status: 'wait' },
  { key: 'done', label: 'Получено', status: 'wait' },
]
const importStages = [
  { key: 'file', label: 'Файл', status: 'ok' },
  { key: 'parse', label: 'Разбор', status: 'ok' },
  { key: 'match', label: 'Сопоставление', status: 'bad' },
  { key: 'save', label: 'Запись', status: 'wait' },
]
const showAlert = ref(true)

const tableCities = ['Москва', 'Казань', 'Санкт-Петербург', 'Новосибирск']
const tableStatuses = ['active', 'paused', 'banned']
const tableAll = Array.from({ length: 47 }, (_, index) => ({
  id: index + 1,
  name: `Пользователь ${String(index + 1).padStart(2, '0')}`,
  city: tableCities[index % tableCities.length],
  orders: (index * 7) % 41,
  status: tableStatuses[index % 3],
}))
const tableColumns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'city', label: 'Город', sortable: true },
  { key: 'orders', label: 'Заказы', align: 'right', sortable: true, width: 110 },
  { key: 'status', label: 'Статус', width: 140 },
]
const tablePage = ref(1)
const tablePageSize = 8
const tableSort = ref({ key: 'name', dir: 'asc' })
const tableLoading = ref(false)
const tableEmpty = ref(false)
const pagerPage = ref(12)
const breadcrumbItems = [
  { label: 'Главная', to: '/' },
  { label: 'Пользователи', to: '/users' },
  { label: 'Профиль' },
]

const tableSorted = computed(() => {
  const rows = tableAll.slice()
  const sort = tableSort.value
  if (!sort) return rows
  return rows.sort((a, b) => {
    const left = a[sort.key]
    const right = b[sort.key]
    const cmp =
      typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'ru')
    return sort.dir === 'asc' ? cmp : -cmp
  })
})

const tableRows = computed(() => {
  if (tableEmpty.value) return []
  const start = (tablePage.value - 1) * tablePageSize
  return tableSorted.value.slice(start, start + tablePageSize)
})

const tableTotal = computed(() => (tableEmpty.value ? 0 : tableAll.length))

function onTableSort() {
  tablePage.value = 1
}

function flashTableLoading() {
  tableLoading.value = true
  window.setTimeout(() => {
    tableLoading.value = false
  }, 1100)
}

function fireToast(kind) {
  if (kind === 'success') {
    toast().success().message('Сохранено')
    return
  }
  if (kind === 'error') {
    toast().error().title('Сеть').message('Нет соединения')
    return
  }
  if (kind === 'warning') {
    toast().warning().short().message('Черновик не отправлен')
    return
  }
  if (kind === 'info') {
    toast.info('Можно вызвать и короткой формой')
    return
  }
  if (kind === 'action') {
    toast()
      .show()
      .title('Файл загружен')
      .message('Открыть в новой вкладке?')
      .action('Понятно', () => {})
    return
  }
  toast().byBottomRight().success().message('Справа снизу')
}

const confirmResult = ref('')
async function fireConfirm(kind) {
  if (kind === 'danger') {
    const ok = await confirm()
      .title('Удалить файл?')
      .message('Это нельзя отменить.')
      .ok('Удалить')
      .danger()
    confirmResult.value = ok ? 'удалили' : 'отменили'
    return
  }

  const ok = await confirm('Сохранить изменения?').ok('Сохранить').cancel('Не сейчас')
  confirmResult.value = ok ? 'сохранили' : 'не сейчас'
}

// TaoImage demo — data URI, чтобы демонстрация не зависела от внешней сети
const imageSrc = ref('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTYwIDEyMCI+CiAgPHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTU4IiBoZWlnaHQ9IjExOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmZiZmJmIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI4MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5kZW1vIGltYWdlPC90ZXh0Pgo8L3N2Zz4K')
function stubPhoto(label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><rect width="220" height="220" fill="#f4f4f4"/><rect x="1" y="1" width="218" height="218" fill="none" stroke="#d4d4d4"/><text x="110" y="118" font-family="sans-serif" font-size="28" fill="#8a8a8a" text-anchor="middle">${label}</text></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
const cardPhotos = [stubPhoto('1'), stubPhoto('2'), stubPhoto('3')]
const cardGallery = ref(0)

const navGroups = [
  {
    id: 'basics',
    title: 'Основы',
    items: [
      { id: 'block', label: 'TaoBlock' },
      { id: 'button', label: 'TaoButton' },
      { id: 'card', label: 'TaoCard' },
      { id: 'copy', label: 'TaoCopy' },
    ],
  },
  {
    id: 'forms',
    title: 'Формы',
    items: [
      { id: 'input', label: 'TaoInput / Group' },
      { id: 'input-number', label: 'TaoInputNumber' },
      { id: 'quantity', label: 'TaoQuantity' },
      { id: 'textarea', label: 'TaoTextarea' },
      { id: 'checkbox', label: 'TaoCheckbox' },
      { id: 'select', label: 'Select / Switch / Radio' },
      { id: 'combobox', label: 'TaoCombobox' },
      { id: 'date', label: 'TaoDate' },
      { id: 'pincode', label: 'TaoPinCode' },
      { id: 'slider', label: 'Progress / Slider' },
      { id: 'filedrop', label: 'TaoFileDrop' },
    ],
  },
  {
    id: 'data',
    title: 'Данные',
    items: [
      { id: 'table', label: 'TaoTable' },
      { id: 'pagination', label: 'TaoPagination' },
      { id: 'empty', label: 'TaoEmpty' },
      { id: 'stages', label: 'TaoStages' },
      { id: 'skeleton', label: 'TaoSkeleton' },
      { id: 'counter', label: 'TaoCounter' },
      { id: 'carousel', label: 'TaoCarousel' },
    ],
  },
  {
    id: 'layout',
    title: 'Макет',
    items: [
      { id: 'container', label: 'TaoContainer' },
      { id: 'flex', label: 'Flex / Space' },
      { id: 'divider', label: 'TaoDivider' },
      { id: 'animated-border', label: 'AnimatedBorder' },
    ],
  },
  {
    id: 'overlays',
    title: 'Оверлеи',
    items: [
      { id: 'modal', label: 'TaoModal' },
      { id: 'drawer', label: 'TaoDrawer' },
      { id: 'confirm', label: 'confirm()' },
      { id: 'tooltip', label: 'TaoTooltip' },
      { id: 'popover', label: 'TaoPopover' },
      { id: 'dropdown', label: 'DropdownMenu' },
      { id: 'spoiler', label: 'Spoiler / Group' },
    ],
  },
  {
    id: 'nav',
    title: 'Навигация',
    items: [
      { id: 'tabs', label: 'TaoTabs' },
      { id: 'breadcrumb', label: 'TaoBreadcrumb' },
      { id: 'link', label: 'TaoLink' },
      { id: 'scrolltop', label: 'TaoScrollTop' },
    ],
  },
  {
    id: 'feedback',
    title: 'Обратная связь',
    items: [
      { id: 'toast', label: 'toast()' },
      { id: 'alert', label: 'TaoAlert' },
      { id: 'tag', label: 'TaoTag' },
      { id: 'loader', label: 'TaoLoader' },
    ],
  },
  {
    id: 'media',
    title: 'Медиа',
    items: [
      { id: 'image', label: 'TaoImage' },
      { id: 'avatar', label: 'TaoAvatar' },
      { id: 'icon', label: 'TaoIcon' },
    ],
  },
]

const activeGroup = ref('all')
const query = ref('')
const activeSection = ref('')

const currentGroup = computed(() => {
  if (query.value.trim()) return null
  return navGroups.find((group) => group.id === activeGroup.value) ?? null
})

function sectionVisible(groupId, label) {
  const needle = query.value.trim().toLowerCase()
  if (needle) {
    const group = navGroups.find((item) => item.id === groupId)
    return (
      label.toLowerCase().includes(needle) ||
      groupId.toLowerCase().includes(needle) ||
      Boolean(group?.title.toLowerCase().includes(needle))
    )
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
  return item.label.toLowerCase().includes(needle) || item.id.toLowerCase().includes(needle)
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

function preventShowcaseNav(event) {
  if (event.target instanceof Element && event.target.closest('a')) {
    event.preventDefault()
  }
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
      </div>
      <div class="theme-switcher">
        <span class="theme-switcher__label">Тема:</span>
        <button
          v-for="t in ['dark', 'light']"
          :key="t"
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

    <!-- TaoBlock -->
    <section id="block" class="showcase-section" v-show="sectionVisible('basics', 'TaoBlock')">
      <h2>TaoBlock</h2>
      <p>Базовый контейнер с настраиваемыми отступами и скруглением</p>
      <TaoBlock :padding="24" :radius="12">
        <p>Это контент внутри TaoBlock. Можно задавать padding, radius, shadow и hover эффекты.</p>
      </TaoBlock>
      <div class="code-block">
        <pre><code>&lt;TaoBlock :padding="24" :radius="12"&gt;
  &lt;p&gt;Контент&lt;/p&gt;
&lt;/TaoBlock&gt;</code></pre>
      </div>
    </section>

    <!-- TaoButton -->
    <section id="button" class="showcase-section" v-show="sectionVisible('basics', 'TaoButton')">
      <h2>TaoButton</h2>
      <p>Кнопки различных вариантов и размеров</p>
      
      <h3>Варианты (variant)</h3>
      <div class="button-row">
        <TaoButton
          v-for="variant in buttonVariants"
          :key="variant"
          :variant="variant"
        >
          {{ variant }}
        </TaoButton>
      </div>

      <h3>Размеры (size)</h3>
      <div class="button-row">
        <TaoButton
          v-for="size in buttonSizes"
          :key="size"
          :size="size"
          variant="primary"
        >
          {{ size }}
        </TaoButton>
      </div>

      <h3>Состояния</h3>
      <div class="button-row">
        <TaoButton variant="primary" loading>Loading</TaoButton>
        <TaoButton variant="primary" disabled>Disabled</TaoButton>
        <TaoButton variant="primary" block>Block (100% width)</TaoButton>
      </div>

      <h3>С иконкой</h3>
      <div class="button-row">
        <TaoButton variant="primary" icon="★">С иконкой</TaoButton>
        <TaoButton variant="secondary" icon="⚡">Действие</TaoButton>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoButton variant="primary" size="medium"&gt;
  Кнопка
&lt;/TaoButton&gt;

&lt;TaoButton variant="secondary" loading&gt;
  Загрузка...
&lt;/TaoButton&gt;

&lt;TaoButton variant="primary" icon="★"&gt;
  С иконкой
&lt;/TaoButton&gt;</code></pre>
      </div>
    </section>

    <!-- TaoCard -->
    <section id="card" class="showcase-section" v-show="sectionVisible('basics', 'TaoCard')">
      <h2>TaoCard</h2>
      <p>
        Карточка со слотами cover / header / footer. Обложка — любой контент: фото или карусель.
        Проп <code>hover</code> даёт обводку акцентом при наведении — у товаров ниже он выключен.
      </p>
      
      <TaoCard :padding="20" :radius="12">
        <template #cover>
          <div class="card-cover"></div>
        </template>
        <template #header>
          <h3 style="margin: 0;">Заголовок карточки</h3>
        </template>
        <p>Основное содержимое карточки. Здесь можно разместить описание, изображение или любой другой контент.</p>
        <template #footer>
          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <TaoButton size="small" variant="secondary">Отмена</TaoButton>
            <TaoButton size="small" variant="primary">Действие</TaoButton>
          </div>
        </template>
      </TaoCard>

      <h3>Товар</h3>
      <p class="carousel-note">
        Ширина 220px — в витрине, сам Card на 100%. Одно фото — <code>TaoImage</code> в <code>#cover</code>.
        Несколько — <code>TaoCarousel</code> туда же: без стрелок, точки, свайп.
      </p>
      <div class="product-cards">
        <div class="product-card">
          <TaoCard :padding="12" :radius="12">
            <template #cover>
              <img class="product-card__photo" :src="cardPhotos[0]" alt="Кроссовки Nova" />
            </template>
            <template #title>Nova</template>
            <template #sub>Кроссовки</template>
            <template #footer>8 990 ₽</template>
          </TaoCard>
        </div>
        <div class="product-card product-card--gallery">
          <TaoCard :padding="12" :radius="12">
            <template #cover>
              <TaoCarousel v-model="cardGallery" :controls="false" dots aria-label="Фото товара">
                <img
                  v-for="(src, index) in cardPhotos"
                  :key="index"
                  class="product-card__photo"
                  :src="src"
                  :alt="'Фото ' + (index + 1)"
                  draggable="false"
                />
              </TaoCarousel>
            </template>
            <template #title>Drift</template>
            <template #sub>3 фото, листайте</template>
            <template #footer>12 400 ₽</template>
          </TaoCard>
        </div>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #cover&gt;
    &lt;img src="photo.jpg" alt="Товар" /&gt;
  &lt;/template&gt;
  &lt;template #title&gt;Nova&lt;/template&gt;
  &lt;template #sub&gt;Кроссовки&lt;/template&gt;
  &lt;template #footer&gt;8 990 ₽&lt;/template&gt;
&lt;/TaoCard&gt;

&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #cover&gt;
    &lt;TaoCarousel :controls="false" dots&gt;
      &lt;img v-for="src in photos" :src="src" draggable="false" /&gt;
    &lt;/TaoCarousel&gt;
  &lt;/template&gt;
&lt;/TaoCard&gt;</code></pre>
      </div>
    </section>

    <!-- TaoInput -->
    <section id="input" class="showcase-section" v-show="sectionVisible('forms', 'TaoInput TaoInputGroup')">
      <h2>TaoInput</h2>
      <p>Поле ввода с v-model. Иконка или единица — слоты <code>#prefix</code> / <code>#suffix</code> внутри рамки. Склейка снаружи — <code>TaoInputGroup</code>.</p>
      
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <TaoInput 
          v-model="inputValue" 
          label="Текстовое поле" 
          placeholder="Введите текст" 
        />
        
        <TaoInput 
          type="email" 
          label="Email" 
          placeholder="example@mail.com" 
        />
        
        <TaoInput 
          type="password" 
          label="Пароль" 
          placeholder="••••••••" 
        />
        
        <TaoInput 
          label="С ошибкой" 
          error 
          error-message="Некорректное значение" 
          model-value="Невалидное значение"
        />
        
        <TaoInput 
          label="Отключенное поле" 
          disabled 
          model-value="Нельзя редактировать"
        />

        <TaoFormField label="Поиск" hint="Иконка и крестик живут внутри поля">
          <TaoInput v-model="searchQuery" placeholder="Найти…">
            <template #prefix>
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </template>
            <template #suffix>
              <button v-if="searchQuery" type="button" aria-label="Очистить" @click="searchQuery = ''">×</button>
            </template>
          </TaoInput>
        </TaoFormField>

        <TaoFormField label="Сумма">
          <TaoInput v-model="amountText" placeholder="0">
            <template #suffix>₽</template>
          </TaoInput>
        </TaoFormField>

        <TaoFormField label="Сайт" hint="https:// и кнопка — снаружи, это уже группа">
          <TaoInputGroup>
            <template #before>https://</template>
            <TaoInput v-model="siteHost" placeholder="example.com" />
            <template #after>
              <TaoButton @click="toast().info().message('Проверяем ' + siteHost)">Проверить</TaoButton>
            </template>
          </TaoInputGroup>
        </TaoFormField>
      </div>

      <h3 style="margin: 28px 0 8px; font-size: 16px;">Форма и submit</h3>
      <p style="margin: 0 0 12px;">Отдельного TaoForm нет: обычный <code>&lt;form&gt;</code>, Enter в поле отправляет, кнопка с <code>type="submit"</code>. В SPA — <code>@submit.prevent</code>.</p>
      <form style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;" @submit.prevent="onDemoSubmit">
        <TaoFormField label="Email">
          <TaoInput v-model="formEmail" type="email" placeholder="you@mail.com" />
        </TaoFormField>
        <TaoFormField label="Пароль">
          <TaoInput v-model="formPassword" type="password" placeholder="••••••••" />
        </TaoFormField>
        <TaoButton type="submit" :loading="formSaving">Войти</TaoButton>
      </form>

      <div class="code-block">
        <pre><code>&lt;TaoInput v-model="q" placeholder="Найти…"&gt;
  &lt;template #prefix&gt;…&lt;/template&gt;
  &lt;template #suffix&gt;₽&lt;/template&gt;
&lt;/TaoInput&gt;

&lt;TaoInputGroup&gt;
  &lt;template #before&gt;https://&lt;/template&gt;
  &lt;TaoInput v-model="host" /&gt;
  &lt;template #after&gt;
    &lt;TaoButton&gt;Проверить&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoInputGroup&gt;

&lt;form @submit.prevent="onSave"&gt;
  &lt;TaoFormField label="Email"&gt;
    &lt;TaoInput v-model="email" type="email" /&gt;
  &lt;/TaoFormField&gt;
  &lt;TaoButton type="submit"&gt;Сохранить&lt;/TaoButton&gt;
&lt;/form&gt;</code></pre>
      </div>
    </section>

    <section id="input-number" class="showcase-section" v-show="sectionVisible('forms', 'TaoInputNumber')">
      <h2>TaoInputNumber</h2>
      <p>Число, не текст: стрелки, кнопки ± справа, min/max/step. Пустое поле — <code>null</code>. Для корзины — <code>TaoQuantity</code>.</p>

      <div style="max-width: 280px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField label="Количество" hint="Стрелки вверх/вниз тоже меняют шаг">
          <TaoInputNumber v-model="qty" :min="1" :max="99" />
        </TaoFormField>
        <TaoFormField label="Цена">
          <TaoInputNumber v-model="price" :min="0" :step="10" />
        </TaoFormField>
        <TaoFormField label="Без кнопок" hint="Только клавиатура и ввод">
          <TaoInputNumber v-model="price" :min="0" :step="10" :controls="false" />
        </TaoFormField>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoFormField label="Количество"&gt;
  &lt;TaoInputNumber v-model="qty" :min="1" :max="99" /&gt;
&lt;/TaoFormField&gt;</code></pre>
      </div>
    </section>

    <section id="quantity" class="showcase-section" v-show="sectionVisible('forms', 'TaoQuantity')">
      <h2>TaoQuantity</h2>
      <p>
        Количество в магазине: кнопки по бокам, только целые штуки, не пустое поле.
        <code>allow-remove</code> — минус на минимуме остаётся живым и шлёт <code>dec</code> (убрать строку).
        Без него минус на 1 выключен. <code>force-max-limit</code> прижимает ввод к стоку.
      </p>

      <div style="max-width: 280px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField label="В корзине" hint="Минус на 1 выключен — удаление отдельной кнопкой">
          <TaoQuantity v-model="cartQty" :max="12" :allow-remove="false" />
        </TaoFormField>
        <TaoFormField label="С витрины" hint="Минус на 1 шлёт dec — можно убрать карточку">
          <TaoQuantity v-model="shelfQty" :max="8" @dec="onShelfDec" />
        </TaoFormField>
        <TaoFormField label="Сток 5 шт." hint="Плюс стопорится на максимуме, лишнее в поле схлопывается">
          <TaoQuantity v-model="stockQty" :max="5" @inc="onStockInc" />
        </TaoFormField>
        <p v-if="quantityNote" style="margin: 0; color: var(--tao-color-text-muted); font-size: 13px;">{{ quantityNote }}</p>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoQuantity v-model="qty" :max="12" :allow-remove="false" /&gt;

&lt;TaoQuantity
  v-model="qty"
  :max="stock"
  @dec="onDec"
  @change="onChange"
/&gt;</code></pre>
      </div>
    </section>
    <section id="modal" class="showcase-section" v-show="sectionVisible('overlays', 'TaoModal')">
      <h2>TaoModal</h2>
      <p>Модальное окно: слоты, клик по фону, Esc, ловушка фокуса. Закрывается и по крестику.</p>
      
      <TaoButton @click="isModalOpen = true" variant="primary">
        Открыть модальное окно
      </TaoButton>

      <TaoModal v-model="isModalOpen" title="Заголовок модального окна">
        <p>Это содержимое модального окна. Здесь можно разместить форму, текст, изображения или любые другие компоненты.</p>
        <p>Закрывается по Esc, по крестику, по кнопке внизу или по клику вне окна.</p>
        
        <template #footer>
          <TaoButton variant="secondary" @click="isModalOpen = false">Отмена</TaoButton>
          <TaoButton variant="primary" @click="isModalOpen = false">Подтвердить</TaoButton>
        </template>
      </TaoModal>

      <div class="code-block">
        <pre><code>&lt;TaoButton @click="isOpen = true"&gt;
  Открыть
&lt;/TaoButton&gt;

&lt;TaoModal v-model="isOpen" title="Заголовок"&gt;
  &lt;p&gt;Содержимое&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;TaoButton @click="isOpen = false"&gt;Закрыть&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoModal&gt;</code></pre>
      </div>
    </section>

    <section id="drawer" class="showcase-section" v-show="sectionVisible('overlays', 'TaoDrawer')">
      <h2>TaoDrawer</h2>
      <p>Боковая панель: фильтры, корзина, настройки. Esc и клик по фону закрывают, фокус не уезжает на страницу.</p>

      <TaoButton variant="secondary" @click="isDrawerOpen = true">Открыть справа</TaoButton>
      <TaoDrawer v-model="isDrawerOpen" title="Фильтры">
        <p>Здесь могут быть поля формы. На узком экране это удобнее модалки по центру.</p>
        <template #footer>
          <TaoButton variant="secondary" @click="isDrawerOpen = false">Сбросить</TaoButton>
          <TaoButton @click="isDrawerOpen = false">Применить</TaoButton>
        </template>
      </TaoDrawer>

      <div class="code-block">
        <pre><code>&lt;TaoDrawer v-model="open" title="Фильтры"&gt;
  ...
&lt;/TaoDrawer&gt;</code></pre>
      </div>
    </section>

    <section id="spoiler" class="showcase-section" v-show="sectionVisible('overlays', 'TaoSpoiler TaoSpoilerGroup')">
      <h2>TaoSpoiler</h2>
      <p>
        Раскрывающийся блок. <code>v-model</code> держит открытость.
        Несколько подряд сами друг друга не закрывают — для аккордеона оберните в
        <code>TaoSpoilerGroup</code>: в модели ключ панели или <code>null</code>.
      </p>

      <TaoSpoiler v-model="spoilerOpen" title="Нажмите, чтобы раскрыть">
        <p>Это скрытое содержимое спойлера. Здесь можно разместить подробную информацию, дополнительные настройки или любой другой контент, который нужно показывать по требованию.</p>
        <ul>
          <li>Пункт списка 1</li>
          <li>Пункт списка 2</li>
          <li>Пункт списка 3</li>
        </ul>
      </TaoSpoiler>

      <h3 style="margin: 24px 0 12px;">Группа</h3>
      <p class="carousel-note">Открыли одну — другая закрылась. Повторный клик по открытой сворачивает все.</p>
      <TaoSpoilerGroup v-model="spoilerFaq">
        <TaoSpoiler name="pay" title="Оплата">
          <p>Счёт и чек приходят на почту после подтверждения.</p>
        </TaoSpoiler>
        <TaoSpoiler name="ship" title="Доставка">
          <p>Срок 2–5 дней, трек-номер в личном кабинете.</p>
        </TaoSpoiler>
        <TaoSpoiler name="return" title="Возврат">
          <p>14 дней, если сохранён товарный вид.</p>
        </TaoSpoiler>
      </TaoSpoilerGroup>

      <div class="code-block">
        <pre><code>&lt;TaoSpoiler v-model="open" title="Заголовок"&gt;
  &lt;p&gt;Скрытое содержимое&lt;/p&gt;
&lt;/TaoSpoiler&gt;

&lt;TaoSpoilerGroup v-model="faq"&gt;
  &lt;TaoSpoiler name="pay" title="Оплата"&gt;…&lt;/TaoSpoiler&gt;
  &lt;TaoSpoiler name="ship" title="Доставка"&gt;…&lt;/TaoSpoiler&gt;
&lt;/TaoSpoilerGroup&gt;</code></pre>
      </div>
    </section>

    <!-- TaoTabs -->
    <section id="tabs" class="showcase-section" v-show="sectionVisible('nav', 'TaoTabs')">
      <h2>TaoTabs</h2>
      <p>Вкладки — примитив, не карточка страницы. Стрелки листают, Home/End — к краям.</p>
      
      <TaoTabs v-model="activeTab" :tabs="tabs">
        <template #default="{ activeTab }">
          <p>{{ tabContents[activeTab] }}</p>
        </template>
      </TaoTabs>

      <div class="code-block">
        <pre><code>&lt;TaoTabs v-model="activeTab" :tabs="tabs"&gt;
  &lt;template #default="{ activeTab }"&gt;
    &lt;p&gt;&#123;&#123; tabContents[activeTab] &#125;&#125;&lt;/p&gt;
  &lt;/template&gt;
&lt;/TaoTabs&gt;

&lt;script setup&gt;
const tabs = [
  { key: 'tab1', label: 'Вкладка 1' },
  { key: 'tab2', label: 'Вкладка 2' }
]
&lt;/script&gt;</code></pre>
      </div>
    </section>

    <!-- TaoTooltip -->
    <section id="tooltip" class="showcase-section" v-show="sectionVisible('overlays', 'TaoTooltip')">
      <h2>TaoTooltip</h2>
      <p>Всплывающая подсказка при наведении и при фокусе с клавиатуры</p>
      
      <div style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
        <TaoTooltip content="Подсказка сверху" position="top">
          <TaoButton variant="secondary">Top</TaoButton>
        </TaoTooltip>

        <TaoTooltip content="Подсказка снизу" position="bottom">
          <TaoButton variant="secondary">Bottom</TaoButton>
        </TaoTooltip>

        <TaoTooltip content="Подсказка слева" position="left">
          <TaoButton variant="secondary">Left</TaoButton>
        </TaoTooltip>

        <TaoTooltip content="Подсказка справа" position="right">
          <TaoButton variant="secondary">Right</TaoButton>
        </TaoTooltip>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoTooltip content="Текст подсказки" position="top"&gt;
  &lt;TaoButton&gt;Наведи на меня&lt;/TaoButton&gt;
&lt;/TaoTooltip&gt;</code></pre>
      </div>
    </section>

    <section id="popover" class="showcase-section" v-show="sectionVisible('overlays', 'TaoPopover')">
      <h2>TaoPopover</h2>
      <p>
        Панель по клику: внутри любой контент. <code>v-model</code> — открытость.
        Esc и клик снаружи закрывают, у края экрана панель переворачивается.
        Это не Tooltip (там текст и hover) и не DropdownMenu (там список действий).
      </p>

      <TaoPopover v-model="popoverOpen">
        <template #trigger>
          <TaoButton variant="secondary">Фильтры</TaoButton>
        </template>
        <TaoCheckbox v-model="popoverStock" label="Только в наличии" />
        <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
          <TaoButton size="small" @click="popoverOpen = false">Готово</TaoButton>
        </div>
      </TaoPopover>
      <p style="margin-top: 8px; font-size: 13px;">{{ popoverStock ? 'В наличии' : 'Все товары' }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoPopover v-model="open"&gt;
  &lt;template #trigger&gt;
    &lt;TaoButton variant="secondary"&gt;Фильтры&lt;/TaoButton&gt;
  &lt;/template&gt;
  &lt;TaoCheckbox v-model="inStock" label="Только в наличии" /&gt;
&lt;/TaoPopover&gt;</code></pre>
      </div>
    </section>

    <section id="copy" class="showcase-section" v-show="sectionVisible('basics', 'TaoCopy')">
      <h2>TaoCopy</h2>
      <p>
        По умолчанию — иконка листов. Клик копирует, сверху на пару секунд тултип.
        Если кнопку скрыли или размонтировали, подсказка уходит вместе с ней.
        Свой вид — слот <code>{ copy, copied }</code>.
      </p>

      <div class="copy-preview">
        <code>{{ copyText }}</code>
        <TaoCopy :text="copyText" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCopy :text="value" /&gt;

&lt;TaoCopy :text="value"&gt;
  &lt;template #default="{ copy, copied }"&gt;
    &lt;TaoButton @click="copy"&gt;{{ copied ? 'Готово' : 'Копировать' }}&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoCopy&gt;</code></pre>
      </div>
    </section>

    <!-- TaoContainer -->
    <section id="container" class="showcase-section" v-show="sectionVisible('layout', 'TaoContainer')">
      <h2>TaoContainer</h2>
      <p>Ограничение ширины контента с авто-центровкой (wide / slim / ultra-slim)</p>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <TaoContainer size="ultra-slim" style="background: var(--tao-color-surface-sunken); padding: 8px; border-radius: 6px;">
          ultra-slim (max-width: 400px)
        </TaoContainer>
        <TaoContainer size="slim" style="background: var(--tao-color-surface-sunken); padding: 8px; border-radius: 6px;">
          slim (max-width: 500px)
        </TaoContainer>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoContainer size="slim"&gt;
  Контент ограниченной ширины
&lt;/TaoContainer&gt;</code></pre>
      </div>
    </section>

    <!-- TaoFlex / TaoSpace -->
    <section id="flex" class="showcase-section" v-show="sectionVisible('layout', 'TaoFlex TaoSpace')">
      <h2>TaoFlex / TaoSpace</h2>
      <p>Обёртка над flexbox и авто-расстановка дочерних элементов с равномерным gap</p>

      <h3>TaoFlex</h3>
      <TaoFlex justify="space-between" style="background: var(--tao-color-surface-sunken); padding: 12px; border-radius: 6px;">
        <span>Слева</span>
        <span>По центру</span>
        <span>Справа</span>
      </TaoFlex>

      <h3>TaoSpace</h3>
      <TaoSpace>
        <TaoButton size="small" variant="secondary">Один</TaoButton>
        <TaoButton size="small" variant="secondary">Два</TaoButton>
        <TaoButton size="small" variant="secondary">Три</TaoButton>
      </TaoSpace>

      <div class="code-block">
        <pre><code>&lt;TaoFlex justify="space-between"&gt;
  &lt;span&gt;Слева&lt;/span&gt;
  &lt;span&gt;Справа&lt;/span&gt;
&lt;/TaoFlex&gt;

&lt;TaoSpace&gt;
  &lt;TaoButton&gt;Один&lt;/TaoButton&gt;
  &lt;TaoButton&gt;Два&lt;/TaoButton&gt;
&lt;/TaoSpace&gt;</code></pre>
      </div>
    </section>

    <!-- TaoDivider -->
    <section id="divider" class="showcase-section" v-show="sectionVisible('layout', 'TaoDivider')">
      <h2>TaoDivider</h2>
      <p>Разделитель: линия, линия с текстом, или пустой отступ</p>

      <p style="margin-bottom: 4px;">variant="line" (по умолчанию):</p>
      <TaoDivider variant="line" />

      <p style="margin-bottom: 4px;">variant="text":</p>
      <TaoDivider variant="text">или</TaoDivider>

      <div class="code-block">
        <pre><code>&lt;TaoDivider variant="line" /&gt;
&lt;TaoDivider variant="text"&gt;или&lt;/TaoDivider&gt;
&lt;TaoDivider variant="gap" size="small" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoAnimatedBorder -->
    <section id="animated-border" class="showcase-section" v-show="sectionVisible('layout', 'TaoAnimatedBorder')">
      <h2>TaoAnimatedBorder</h2>
      <p>Контейнер с анимированной радужной рамкой — декоративный эффект, не завязан на тему</p>

      <div style="display: flex; gap: 24px; flex-wrap: wrap;">
        <div>
          <p style="margin-bottom: 8px; font-size: 13px;">По умолчанию — только контур</p>
          <TaoAnimatedBorder style="padding: 20px; display: inline-block;">
            Только рамка
          </TaoAnimatedBorder>
        </div>

        <div>
          <p style="margin-bottom: 8px; font-size: 13px;">light — рамка + мягкое свечение</p>
          <TaoAnimatedBorder light style="padding: 20px; display: inline-block;">
            Рамка со свечением
          </TaoAnimatedBorder>
        </div>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoAnimatedBorder&gt;
  Только переливающийся контур
&lt;/TaoAnimatedBorder&gt;

&lt;TaoAnimatedBorder light&gt;
  Контур + мягкое свечение вокруг
&lt;/TaoAnimatedBorder&gt;</code></pre>
      </div>
    </section>

    <!-- TaoCheckbox -->
    <section id="checkbox" class="showcase-section" v-show="sectionVisible('forms', 'TaoCheckbox')">
      <h2>TaoCheckbox</h2>
      <p>Чекбокс с v-model. Hint и error — через TaoFormField. <code>indeterminate</code> — частично выбран: черта, клик ставит галочку, смешанное считает родитель.</p>

      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
        <div style="display: flex; gap: 20px;">
          <TaoCheckbox v-model="checkedA" label="Не отмечен" />
          <TaoCheckbox v-model="checkedB" label="Отмечен" />
          <TaoCheckbox :model-value="false" label="Disabled" disabled />
        </div>
        <TaoFormField error="Нужно согласие">
          <TaoCheckbox v-model="checkedA" label="Принимаю условия" />
        </TaoFormField>

        <h3>Неопределённый</h3>
        <TaoCheckbox v-model="allFruitsChecked" :indeterminate="fruitsMixed" label="Все фрукты" />
        <div style="display: flex; flex-direction: column; gap: 8px; padding-left: 24px;">
          <TaoCheckbox
            v-for="item in fruitChecks"
            :key="item.label"
            v-model="item.checked"
            :label="item.label"
          />
        </div>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCheckbox v-model="checked" label="Согласен с условиями" /&gt;
&lt;TaoCheckbox v-model="all" :indeterminate="some" label="Все" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoSwitch / Radio / Select -->
    <section id="select" class="showcase-section" v-show="sectionVisible('forms', 'TaoSwitch TaoRadio TaoSelect TaoFormField')">
      <h2>TaoSwitch / TaoRadio / TaoSelect</h2>
      <p>Форменные контролы. Label, hint и error — через TaoFormField. Select сбрасывается в <code>null</code> кнопкой «Очистить» или Delete.</p>

      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField label="Город" hint="Казань пока недоступна">
          <TaoSelect v-model="city" :options="cities" placeholder="Выберите город" />
        </TaoFormField>

        <TaoFormField label="С ошибкой" error="Выберите город">
          <TaoSelect v-model="cityError" :options="cities" />
        </TaoFormField>

        <TaoSwitch v-model="notifyEmail" label="Письма об обновлениях" />
        <TaoSwitch :model-value="true" label="Disabled" disabled />

        <TaoRadioGroup v-model="plan" legend="Тариф">
          <TaoRadio value="free" label="Free" />
          <TaoRadio value="pro" label="Pro" />
          <TaoRadio value="team" label="Team" disabled />
        </TaoRadioGroup>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoFormField label="Город" hint="Необязательно"&gt;
  &lt;TaoSelect v-model="city" :options="cities" /&gt;
&lt;/TaoFormField&gt;

&lt;TaoSwitch v-model="on" label="Тёмная тема" /&gt;

&lt;TaoRadioGroup v-model="plan" legend="Тариф"&gt;
  &lt;TaoRadio value="free" label="Free" /&gt;
  &lt;TaoRadio value="pro" label="Pro" /&gt;
&lt;/TaoRadioGroup&gt;</code></pre>
      </div>
    </section>

    <section id="combobox" class="showcase-section" v-show="sectionVisible('forms', 'TaoCombobox')">
      <h2>TaoCombobox</h2>
      <p>
        Select с полем: печатаете — список фильтруется. По умолчанию только из списка:
        не нашли — ввод откатывается. <code>allow-create</code> оставляет свой текст в
        <code>v-model</code>; список Combobox сам не трогает. Чтобы новое появилось в
        <code>options</code>, слушайте <code>@create</code>. Esc и клик снаружи закрывают.
      </p>

      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField
          label="Город"
          :hint="comboCity ? `В модели: ${comboCity}` : 'Только из списка. Начните с «мо» или «сан»'"
        >
          <TaoCombobox v-model="comboCity" :options="comboCities" placeholder="Начните вводить город" />
        </TaoFormField>

        <TaoFormField
          label="Свой запрос"
          :hint="comboFree ? `В модели: ${comboFree}` : 'Список не меняется. «Vite» уйдёт только в переменную'"
        >
          <TaoCombobox
            v-model="comboFree"
            :options="comboFreeOptions"
            allow-create
            placeholder="Vue, Nuxt или свой"
          />
        </TaoFormField>

        <TaoFormField
          label="Тег в список"
          :hint="comboTag ? `В модели: ${comboTag}` : '«Vite» попадёт и в модель, и в options через @create'"
        >
          <TaoCombobox
            v-model="comboTag"
            :options="comboTags"
            allow-create
            placeholder="Vue, Nuxt или свой"
            @create="onComboTagCreate"
          />
        </TaoFormField>

        <TaoFormField label="Disabled">
          <TaoCombobox model-value="msk" :options="comboCities" disabled />
        </TaoFormField>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCombobox v-model="city" :options="cities" /&gt;
&lt;TaoCombobox v-model="query" :options="tags" allow-create /&gt;
&lt;TaoCombobox v-model="tag" :options="tags" allow-create @create="onCreate" /&gt;</code></pre>
      </div>
    </section>

    <section id="date" class="showcase-section" v-show="sectionVisible('forms', 'TaoDate')">
      <h2>TaoDate</h2>
      <p>
        Один день, не дата-время. В <code>v-model</code> всегда <code>YYYY-MM-DD</code>,
        без часов и пояса. Попап как у Select: Esc, клик снаружи, стрелки по дням.
      </p>

      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField label="День доставки" :hint="'В модели: ' + (deliveryDate || 'null')">
          <TaoDate v-model="deliveryDate" min="2026-09-01" max="2026-09-30" />
        </TaoFormField>

        <TaoFormField label="Пустое поле" hint="Очистить — внизу календаря">
          <TaoDate v-model="emptyDate" placeholder="Выберите день" />
        </TaoFormField>
      </div>

      <h3>Состояния</h3>
      <p class="carousel-note">
        Красная рамка — не поломка календаря, а <code>error</code> у <code>TaoFormField</code>, как у Select.
      </p>
      <div style="max-width: 400px; display: flex; flex-direction: column; gap: 16px;">
        <TaoFormField label="Не указали день" error="Укажите дату">
          <TaoDate v-model="errorDate" />
        </TaoFormField>

        <TaoFormField label="Disabled">
          <TaoDate model-value="2026-09-02" disabled />
        </TaoFormField>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoFormField label="День доставки"&gt;
  &lt;TaoDate v-model="day" min="2026-09-01" max="2026-09-30" /&gt;
&lt;/TaoFormField&gt;</code></pre>
      </div>
    </section>
    <section id="alert" class="showcase-section" v-show="sectionVisible('feedback', 'TaoAlert')">
      <h2>TaoAlert</h2>
      <p>Инлайн-баннер: ошибка формы, предупреждение на странице. Не тост — живёт в вёрстке.</p>

      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px;">
        <TaoAlert type="success" title="Сохранено">Профиль обновлён.</TaoAlert>
        <TaoAlert type="error" title="Ошибка">Не удалось связаться с сервером.</TaoAlert>
        <TaoAlert v-if="showAlert" type="warning" title="Черновик" closable @close="showAlert = false">
          Сохраните, прежде чем уйти.
        </TaoAlert>
        <TaoAlert type="info">Можно вызвать и без заголовка.</TaoAlert>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoAlert type="warning" title="Черновик" closable @close="hide"&gt;
  Сохраните, прежде чем уйти.
&lt;/TaoAlert&gt;</code></pre>
      </div>
    </section>

    <!-- TaoTextarea -->
    <section id="textarea" class="showcase-section" v-show="sectionVisible('forms', 'TaoTextarea')">
      <h2>TaoTextarea</h2>
      <p>Многострочное поле с авто-высотой. <code>maxlength</code> режет ввод, <code>count</code> показывает «введено / максимум».</p>

      <div style="max-width: 400px;">
        <TaoFormField label="Комментарий" hint="Необязательно">
          <TaoTextarea v-model="textareaValue" placeholder="Печатайте..." :maxlength="140" count />
        </TaoFormField>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoTextarea v-model="text" placeholder="Печатайте..." :maxlength="140" count /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoTag -->
    <section id="tag" class="showcase-section" v-show="sectionVisible('feedback', 'TaoTag')">
      <h2>TaoTag</h2>
      <p>Тег / бейдж со статусами</p>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <TaoTag>default</TaoTag>
        <TaoTag type="neutral">neutral</TaoTag>
        <TaoTag type="success">success</TaoTag>
        <TaoTag type="danger">danger</TaoTag>
        <TaoTag type="warning">warning</TaoTag>
        <TaoTag type="info">info</TaoTag>
        <TaoTag pointer>кликабельный</TaoTag>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoTag type="success"&gt;Активен&lt;/TaoTag&gt;
&lt;TaoTag type="danger"&gt;Ошибка&lt;/TaoTag&gt;</code></pre>
      </div>
    </section>

    <!-- toast -->
    <section id="toast" class="showcase-section" v-show="sectionVisible('feedback', 'toast')">
      <h2>toast()</h2>
      <p>Fluent-уведомления: цепочка в одном тике, setTimeout(0) отправляет показ.</p>

      <div class="button-row">
        <TaoButton variant="primary" @click="fireToast('success')">success</TaoButton>
        <TaoButton variant="danger" @click="fireToast('error')">error</TaoButton>
        <TaoButton variant="secondary" @click="fireToast('warning')">warning</TaoButton>
        <TaoButton variant="ghost" @click="fireToast('info')">info</TaoButton>
        <TaoButton variant="secondary" @click="fireToast('action')">с кнопкой</TaoButton>
        <TaoButton variant="secondary" @click="fireToast('corner')">bottomRight</TaoButton>
      </div>

      <div class="code-block">
        <pre><code>toast().success().message('Сохранено')
toast().error().title('Сеть').message('Нет соединения')
toast.success('Сохранено')</code></pre>
      </div>
    </section>

    <!-- confirm -->
    <section id="confirm" class="showcase-section" v-show="sectionVisible('overlays', 'confirm')">
      <h2>confirm()</h2>
      <p>Вопрос с оверлеем. Не тост: ждёт ответ, Esc и клик по фону = отмена, можно await.</p>

      <div class="button-row">
        <TaoButton variant="primary" @click="fireConfirm('save')">обычный</TaoButton>
        <TaoButton variant="danger" @click="fireConfirm('danger')">опасный</TaoButton>
      </div>
      <p v-if="confirmResult" style="margin-top: 8px; font-size: 13px;">Ответ: {{ confirmResult }}</p>

      <div class="code-block">
        <pre><code>if (await confirm().title('Удалить файл?').danger()) {
  remove()
}</code></pre>
      </div>
    </section>

    <!-- TaoProgress / TaoSlider -->
    <section id="slider" class="showcase-section" v-show="sectionVisible('forms', 'TaoProgress TaoSlider')">
      <h2>TaoProgress / TaoSlider</h2>
      <p>Статичная полоса и слайдер. Проценты сверху по центру или <code>show-percentage="right"</code> справа; если есть <code>#right</code>, процент справа в скобках. <code>:show-percentage="false"</code> прячет. Слайдер слушает стрелки, Home/End и PageUp/Down.</p>

      <h3>TaoProgress</h3>
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 400px;">
        <TaoProgress :progress="65" />
        <TaoProgress :progress="50">
          <template #left>0кб</template>
          <template #right>50кб</template>
        </TaoProgress>
        <TaoProgress :progress="50" show-percentage="right">
          <template #left>0кб</template>
          <template #right>50кб</template>
        </TaoProgress>
        <TaoProgress :progress="50" :show-percentage="false">
          <template #left>0кб</template>
          <template #right>50кб</template>
        </TaoProgress>
      </div>

      <h3>TaoSlider</h3>
      <TaoSlider v-model="sliderValue" show-value style="max-width: 400px;" />
      <p style="margin-top: 4px; font-size: 13px;">Значение: {{ sliderValue }} — <em>ПКМ по слайдеру открывает точный ввод числа</em></p>

      <div class="code-block">
        <pre><code>&lt;TaoProgress :progress="65" /&gt;

&lt;TaoProgress :progress="50"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" show-percentage="right"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoProgress :progress="50" :show-percentage="false"&gt;
  &lt;template #left&gt;0кб&lt;/template&gt;
  &lt;template #right&gt;50кб&lt;/template&gt;
&lt;/TaoProgress&gt;

&lt;TaoSlider v-model="value" show-value /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoLoader -->
    <section id="loader" class="showcase-section" v-show="sectionVisible('feedback', 'TaoLoader')">
      <h2>TaoLoader</h2>
      <p>Анимированный лоадер</p>

      <div style="display: flex; gap: 24px; align-items: center;">
        <TaoLoader :size="40" />
        <TaoLoader :size="24" inline />
        <TaoLoader :size="40" color="var(--tao-color-danger)" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoLoader :size="40" /&gt;
&lt;TaoLoader :size="24" inline /&gt;
&lt;TaoLoader :size="40" color="var(--tao-color-danger)" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoImage -->
    <section id="image" class="showcase-section" v-show="sectionVisible('media', 'TaoImage')">
      <h2>TaoImage</h2>
      <p>
        Обёртка над <code>&lt;img&gt;</code>: fade-in и плейсхолдер. По умолчанию грузится сразу.
        <code>lazy</code> — браузер сам отложит загрузку, пока картинка не рядом с экраном.
      </p>

      <div style="width: 160px; height: 120px;">
        <TaoImage :src="imageSrc" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoImage :src="imageUrl" /&gt;
&lt;TaoImage :src="imageUrl" lazy /&gt;</code></pre>
      </div>
    </section>

    <section id="avatar" class="showcase-section" v-show="sectionVisible('media', 'TaoAvatar')">
      <h2>TaoAvatar</h2>
      <p>Фото или инициалы. Точка статуса и счётчик — по желанию, можно вместе.</p>

      <div class="button-row" style="align-items: center;">
        <TaoAvatar name="Анна Козлова" size="small" />
        <TaoAvatar name="Анна Козлова" />
        <TaoAvatar name="Борис" size="large" />
        <TaoAvatar :src="imageSrc" name="Демо" size="large" />
      </div>

      <h3>Индикатор</h3>
      <div class="button-row" style="align-items: center;">
        <TaoAvatar name="Анна Козлова" dot />
        <TaoAvatar name="Борис" size="large" dot="danger" />
        <TaoAvatar name="Кира" size="large" dot="warning" />
        <TaoAvatar name="Олег" dot="neutral" />
        <TaoAvatar name="Анна Козлова" :count="3" />
        <TaoAvatar name="Борис" size="large" :count="128" />
        <TaoAvatar :src="imageSrc" name="Демо" size="large" dot :count="2" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoAvatar name="Анна Козлова" /&gt;
&lt;TaoAvatar name="Анна" dot /&gt;
&lt;TaoAvatar name="Борис" :count="3" /&gt;
&lt;TaoAvatar :src="url" name="Анна" size="large" dot :count="2" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoFileDrop -->
    <section id="filedrop" class="showcase-section" v-show="sectionVisible('forms', 'TaoFileDrop')">
      <h2>TaoFileDrop</h2>
      <p>
        Зона загрузки (drag &amp; drop + клик). Текст внутри — слот, по умолчанию по-русски.
        Имена выбранных файлов — список под зоной; крестик в строке сразу пишет в
        <code>v-model</code>. Стереть всё — <code>show-clear</code> и <code>clear-request</code>:
        компонент сам массив не трогает. <code>multiple</code> дописывает файлы, а не заменяет.
        <code>:list="false"</code> прячет список.
      </p>

      <h3>Мгновенная очистка</h3>
      <TaoFileDrop
        v-model="filesInstant"
        style="max-width: 400px;"
        multiple
        show-clear
        @clear-request="filesInstant = []"
      />

      <h3>Очистка через подтверждение</h3>
      <TaoFileDrop
        v-model="filesConfirm"
        style="max-width: 400px;"
        show-clear
        :list="false"
        @clear-request="requestClearConfirm"
      >
        Перетащите накладную или выберите с диска
      </TaoFileDrop>
      <p style="margin-top: 4px; font-size: 13px;">Файлов: {{ filesConfirm.length }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoFileDrop v-model="files" multiple show-clear @clear-request="files = []" /&gt;

&lt;TaoFileDrop v-model="files" show-clear :list="false" @clear-request="onClear"&gt;
  Перетащите накладную или выберите с диска
&lt;/TaoFileDrop&gt;</code></pre>
      </div>
    </section>

    <!-- TaoPinCode -->
    <section id="pincode" class="showcase-section" v-show="sectionVisible('forms', 'TaoPinCode')">
      <h2>TaoPinCode</h2>
      <p>
        По умолчанию клик стирает ячейку и все справа — неверный код можно набрать заново с этого места.
        <code>clear-on="input"</code> оставляет цифру, пока не введут новую.
        Последняя ячейка снимает фокус и шлёт <code>complete</code>.
      </p>

      <h3>Стереть при фокусе</h3>
      <TaoPinCode v-model="pinValue" :length="4" @complete="onPinComplete" />
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValue }}</p>
      <p v-if="pinCompleteNote" style="margin-top: 4px; font-size: 13px; color: var(--tao-color-success);">{{ pinCompleteNote }}</p>

      <h3>Только цифры</h3>
      <TaoPinCode v-model="pinValueNumeric" :length="4" numbers-only />
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValueNumeric }}</p>

      <h3>Стереть при вводе</h3>
      <TaoPinCode v-model="pinValueReplace" :length="4" numbers-only clear-on="input" />
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValueReplace }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoPinCode v-model="pin" :length="4" @complete="onDone" /&gt;

&lt;TaoPinCode v-model="pin" :length="4" numbers-only /&gt;

&lt;TaoPinCode v-model="pin" :length="4" clear-on="input" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoDropdownMenu -->
    <section id="dropdown" class="showcase-section" v-show="sectionVisible('overlays', 'TaoDropdownMenu')">
      <h2>TaoDropdownMenu</h2>
      <p>Выпадающее меню с авто-позиционированием у края экрана</p>

      <TaoDropdownMenu :actions="dropdownActions" @selected="(id) => console.log('selected:', id)" />

      <div class="code-block">
        <pre><code>&lt;TaoDropdownMenu :actions="actions" @selected="onSelected" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoLink -->
    <section id="link" class="showcase-section" v-show="sectionVisible('nav', 'TaoLink')">
      <h2>TaoLink</h2>
      <p>Ссылка, использующая &lt;NuxtLink&gt; в Nuxt-проекте и обычный &lt;a&gt; вне его — без дополнительной настройки</p>

      <TaoLink to="https://github.com" as-new-tab>Открыть в новой вкладке →</TaoLink>

      <div class="code-block">
        <pre><code>&lt;TaoLink to="/profile"&gt;Профиль&lt;/TaoLink&gt;
&lt;TaoLink to="https://example.com" as-new-tab&gt;Внешняя ссылка&lt;/TaoLink&gt;</code></pre>
      </div>
    </section>

    <section id="breadcrumb" class="showcase-section" v-show="sectionVisible('nav', 'TaoBreadcrumb')">
      <h2>TaoBreadcrumb</h2>
      <p>
        <code>to</code> — путь страницы. В приложении с роутером «Пользователи» откроет <code>/users</code>.
        Последний пункт без ссылки: вы уже там. Здесь клик не уводит со страницы, чтобы не сломать демо.
      </p>

      <div @click.capture="preventShowcaseNav">
        <TaoBreadcrumb :items="breadcrumbItems" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoBreadcrumb :items="[
  { label: 'Главная', to: '/' },
  { label: 'Пользователи', to: '/users' },
  { label: 'Профиль' },
]" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoIcon -->
    <section id="icon" class="showcase-section" v-show="sectionVisible('media', 'TaoIcon')">
      <h2>TaoIcon</h2>
      <p>Обёртка для icon-шрифта — рендерит класс <code>icon-&lt;name&gt;</code>, сам шрифт нужно подключить в проекте (см. README)</p>

      <div class="code-block">
        <pre><code>&lt;TaoIcon name="arrow-up" :size="20" /&gt;</code></pre>
      </div>
    </section>

    <section id="table" class="showcase-section" v-show="sectionVisible('data', 'TaoTable')">
      <h2>TaoTable</h2>
      <p>Простая таблица для списков сущностей. Сама не сортирует и не режет страницы — это делает родитель, поэтому тот же компонент работает и с сервером.</p>

      <div class="button-row">
        <TaoButton size="small" variant="secondary" @click="flashTableLoading">Загрузка</TaoButton>
        <TaoButton size="small" variant="ghost" @click="tableEmpty = !tableEmpty; tablePage = 1">
          {{ tableEmpty ? 'Показать строки' : 'Пустая таблица' }}
        </TaoButton>
      </div>

      <TaoTable
        :columns="tableColumns"
        :rows="tableRows"
        v-model:sort="tableSort"
        :loading="tableLoading"
        striped
        clickable
        empty-text="Пока нет записей"
        @sort="onTableSort"
        @row-click="(row) => toast().info().message(row.name)"
      >
        <template #empty>
          <TaoEmpty title="Пока нет записей">Список пуст — нажмите «Показать строки».</TaoEmpty>
        </template>
        <template #cell-status="{ row }">
          <TaoTag :type="row.status === 'active' ? 'success' : row.status === 'banned' ? 'danger' : 'neutral'">
            {{ row.status }}
          </TaoTag>
        </template>
      </TaoTable>

      <TaoPagination
        v-model:page="tablePage"
        :total="tableTotal"
        :page-size="tablePageSize"
        style="margin-top: 12px;"
      />

      <div class="code-block">
        <pre><code>&lt;TaoTable :columns="columns" :rows="pageRows" v-model:sort="sort"&gt;
  &lt;template #cell-status="{ row }"&gt;
    &lt;TaoTag :type="row.status === 'active' ? 'success' : 'neutral'"&gt;
      &#123;&#123; row.status &#125;&#125;
    &lt;/TaoTag&gt;
  &lt;/template&gt;
&lt;/TaoTable&gt;

&lt;TaoPagination v-model:page="page" :total="rows.length" :page-size="8" /&gt;</code></pre>
      </div>
    </section>

    <section id="pagination" class="showcase-section" v-show="sectionVisible('data', 'TaoPagination')">
      <h2>TaoPagination</h2>
      <p>
        Страницы с многоточием, счётчик «с–по из N». Текущая страница — через <code>v-model:page</code>.
        Клик по «…» прыгает на <code>jump</code> страниц (по умолчанию 5) — как в Ant, только без подписей «-3 / +5».
        <code>:jump="0"</code> оставляет многоточие декоративным.
      </p>

      <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" />
      <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" :jump="3" size="small" style="margin-top: 12px;" />

      <div class="code-block">
        <pre><code>&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" /&gt;
&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" :jump="3" /&gt;</code></pre>
      </div>
    </section>

    <section id="empty" class="showcase-section" v-show="sectionVisible('data', 'TaoEmpty')">
      <h2>TaoEmpty</h2>
      <p>Пустой список, нет поиска, нет прав — одна заготовка вместо самодельной вёрстки.</p>

      <TaoEmpty title="Ничего не нашлось">
        Измените фильтр или сбросьте поиск.
        <template #action>
          <TaoButton size="small" variant="secondary">Сбросить</TaoButton>
        </template>
      </TaoEmpty>

      <div class="code-block">
        <pre><code>&lt;TaoEmpty title="Ничего не нашлось"&gt;
  Измените фильтр.
&lt;/TaoEmpty&gt;</code></pre>
      </div>
    </section>

    <section id="stages" class="showcase-section" v-show="sectionVisible('data', 'TaoStages')">
      <h2>TaoStages</h2>
      <p>
        Список независимых стадий, не степпер «ты на шаге 3».
        Статусы: <code>ok</code>, <code>work</code>, <code>wait</code>, <code>bad</code>.
      </p>

      <div style="display: flex; flex-wrap: wrap; gap: 40px;">
        <div>
          <h3>Заказ</h3>
          <TaoStages :items="orderStages" />
        </div>
        <div>
          <h3>Импорт</h3>
          <TaoStages :items="importStages" />
        </div>
      </div>

      <h3>В строку</h3>
      <TaoStages :items="orderStages" :vertical="false" />

      <div class="code-block">
        <pre><code>&lt;TaoStages :items="[
  { key: 'pay', label: 'Оплата', status: 'ok' },
  { key: 'pack', label: 'Сборка', status: 'work' },
  { key: 'ship', label: 'Доставка', status: 'wait' },
]" /&gt;</code></pre>
      </div>
    </section>

    <section id="skeleton" class="showcase-section" v-show="sectionVisible('data', 'TaoSkeleton')">
      <h2>TaoSkeleton</h2>
      <p>Плейсхолдер, пока данные едут. Не путать с лоадером — это форма контента, а не спиннер.</p>

      <div style="display: flex; flex-direction: column; gap: 16px; max-width: 360px;">
        <TaoSkeleton variant="title" />
        <TaoSkeleton :lines="3" />
        <div style="display: flex; gap: 12px; align-items: center;">
          <TaoSkeleton variant="circle" />
          <TaoSkeleton :lines="2" />
        </div>
        <TaoSkeleton variant="rect" height="72px" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoSkeleton variant="title" /&gt;
&lt;TaoSkeleton :lines="3" /&gt;
&lt;TaoSkeleton variant="circle" /&gt;</code></pre>
      </div>
    </section>

    <section id="counter" class="showcase-section" v-show="sectionVisible('data', 'TaoCounter')">
      <h2>TaoCounter</h2>
      <p>Витрина числа, не поле ввода. Цифры переворачиваются при смене значения. Для баланса, счёта, онлайна.</p>

      <TaoCounter :value="counterValue" :max-digits="6" />
      <div class="button-row" style="margin-top: 12px;">
        <TaoButton size="small" variant="secondary" @click="counterValue = Math.max(0, counterValue - 1)">−1</TaoButton>
        <TaoButton size="small" @click="counterValue += 1">+1</TaoButton>
        <TaoButton size="small" variant="ghost" @click="counterValue += 100">+100</TaoButton>
      </div>
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ counterValue }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoCounter :value="score" :max-digits="6" /&gt;</code></pre>
      </div>
    </section>

    <section id="carousel" class="showcase-section" v-show="sectionVisible('data', 'TaoCarousel')">
      <h2>TaoCarousel</h2>
      <p>
        Три режима одной ленты: целый слайд с автопрокруткой, карточка с краешком следующей,
        полоса из пяти квадратов. Стрелки и точки можно спрятать или подменить слотами.
      </p>

      <h3 class="carousel-heading">Целый слайд</h3>
      <p class="carousel-note">Каждые 4 секунды вперёд. Наведи курсор или сфокусируй — пауза. <code>loop</code> крутит по кругу. <code>dots</code> — сколько слайдов и где вы.</p>
      <TaoCarousel v-model="carouselHero" :autoplay="4000" loop dots aria-label="Баннеры">
        <article v-for="item in carouselBanners" :key="item.id" class="carousel-hero">
          <strong>{{ item.title }}</strong>
          <span>{{ item.text }}</span>
        </article>
      </TaoCarousel>

      <h3 class="carousel-heading">Одна карточка + краешек</h3>
      <p class="carousel-note"><code>per-view="1"</code> и <code>peek</code> — видно, что справа ещё есть товар.</p>
      <TaoCarousel v-model="carouselPeek" :peek="72" aria-label="Карточка с краем">
        <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
          <div class="carousel-card__cover">{{ item.id }}</div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.price }}</span>
        </article>
      </TaoCarousel>

      <h3 class="carousel-heading">Полоса из пяти</h3>
      <p class="carousel-note">Палец пролистывает пачку. Стрелки тоже прыгают на пять.</p>
      <TaoCarousel v-model="carouselStrip" :per-view="5" :peek="28" aria-label="Товары">
        <article v-for="item in carouselProducts" :key="item.id" class="carousel-card">
          <div class="carousel-card__cover">{{ item.id }}</div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.price }}</span>
        </article>
      </TaoCarousel>

      <h3 class="carousel-heading">Без стрелок</h3>
      <p class="carousel-note">
        <code>:controls="false"</code> прячет обе. Пустой <code>#prev</code> или <code>#next</code> — только одну сторону.
        Здесь вместо стрелок — <code>dots</code>.
      </p>
      <TaoCarousel v-model="carouselBare" :peek="72" :controls="false" dots aria-label="Без стрелок">
        <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
          <div class="carousel-card__cover">{{ item.id }}</div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.price }}</span>
        </article>
      </TaoCarousel>

      <h3 class="carousel-heading">Свои стрелки</h3>
      <p class="carousel-note">
        Слоты <code>#prev</code> / <code>#next</code> подменяют кнопки целиком. В слот приходят <code>go</code> и <code>disabled</code>.
      </p>
      <TaoCarousel v-model="carouselCustom" :peek="72" aria-label="Свои стрелки">
        <template #prev="{ go, disabled }">
          <button type="button" class="carousel-nav" :disabled="disabled" @click="go">назад</button>
        </template>
        <template #next="{ go, disabled }">
          <button type="button" class="carousel-nav" :disabled="disabled" @click="go">вперёд</button>
        </template>
        <article v-for="item in carouselProducts.slice(0, 8)" :key="'custom-' + item.id" class="carousel-card">
          <div class="carousel-card__cover">{{ item.id }}</div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.price }}</span>
        </article>
      </TaoCarousel>

      <div class="code-block">
        <pre><code>{{ carouselExample }}</code></pre>
      </div>
    </section>

    <section id="scrolltop" class="showcase-section" v-show="sectionVisible('nav', 'TaoScrollTop')">
      <h2>TaoScrollTop</h2>
      <p>
        Плавающая кнопка «наверх». Появляется при обратном скролле после порога
        <code>boundary</code>. Сама кнопка — в правом нижнем углу страницы.
      </p>
      <p class="carousel-note">Прокрутите витрину вниз и чуть вверх — кнопка всплывёт справа внизу.</p>

      <div class="code-block">
        <pre><code>&lt;TaoScrollTop :boundary="200" /&gt;
&lt;TaoScrollTop :size="48" :right="16" :bottom="16" /&gt;</code></pre>
      </div>
    </section>
      </main>
    </div>

    <footer class="showcase-footer">
      <p>Tao UI Library © 2024. Создано с любовью ❤️</p>
      <p style="font-size: 12px; margin-top: 8px;">Прокрутите вниз и обратно вверх, чтобы увидеть TaoScrollTop в правом нижнем углу.</p>
    </footer>

    <TaoScrollTop :boundary="200" />
  </div>
</template>

<style scoped>
.showcase {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px 20px 40px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

.showcase-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.showcase-body {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.showcase-nav {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow: auto;
  padding: 12px 10px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}

.showcase-nav__search {
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 8px 10px;
  border: 1px solid var(--tao-color-border-strong);
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-text);
  font-family: inherit;
  font-size: 13px;
}

.showcase-nav__search::placeholder {
  color: var(--tao-color-text-muted);
}

.showcase-nav__all,
.showcase-nav__group-title {
  display: block;
  width: 100%;
  margin: 0;
  padding: 6px 8px;
  border: 0;
  background: transparent;
  color: var(--tao-color-text);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  border-radius: var(--tao-radius-control);
}

.showcase-nav__all {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.showcase-nav__group {
  margin-top: 10px;
}

.showcase-nav__group-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--tao-color-text-muted);
}

.showcase-nav__all:hover,
.showcase-nav__group-title:hover,
.showcase-nav__link:hover {
  background: var(--tao-color-surface-hover);
}

.showcase-nav__all.active,
.showcase-nav__group-title.active {
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-accent);
}

.showcase-nav__link {
  display: block;
  padding: 4px 8px 4px 12px;
  color: var(--tao-color-text);
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none;
  border-radius: var(--tao-radius-control);
}

.showcase-nav__link.active {
  color: var(--tao-color-accent);
  font-weight: 600;
}

.showcase-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  padding: 16px 18px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface-sunken);
}

.showcase-banner__kicker {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--tao-color-text-muted);
}

.showcase-banner__title {
  margin: 2px 0 0;
  font-size: 22px;
}

.showcase-banner__reset {
  flex-shrink: 0;
  padding: 6px 12px;
  border: 1px solid var(--tao-color-border-strong);
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface);
  color: var(--tao-color-text);
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.showcase-section {
  scroll-margin-top: 16px;
}

@media (max-width: 860px) {
  .showcase-top {
    flex-direction: column;
  }

  .showcase-body {
    grid-template-columns: 1fr;
  }

  .showcase-nav {
    position: static;
    max-height: none;
    margin-bottom: 8px;
  }

  .showcase-nav__group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .showcase-nav__group-title {
    width: auto;
    margin-right: 4px;
  }

  .showcase-nav__link {
    width: auto;
    padding: 4px 8px;
  }
}

.theme-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  flex-shrink: 0;
}

.theme-switcher__label {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.theme-switcher__btn {
  padding: 6px 14px;
  border-radius: var(--tao-radius-control);
  border: 1px solid var(--tao-color-border-strong);
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-text);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  transition: var(--tao-transition-base, all 0.2s ease);
}

.theme-switcher__btn:hover {
  background: var(--tao-color-surface-hover);
}

.theme-switcher__btn.active {
  background: var(--tao-color-accent);
  color: var(--tao-color-on-accent);
  border-color: var(--tao-color-accent);
}

h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--tao-color-text-strong);
  margin: 0;
}

.showcase-section {
  margin-bottom: 48px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--tao-color-border);
}

.showcase-section:last-of-type {
  border-bottom: none;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--tao-color-accent);
  margin-bottom: 8px;
}

h3 {
  font-size: 16px;
  font-weight: 500;
  color: var(--tao-color-text);
  margin: 24px 0 12px;
}

p {
  color: var(--tao-color-text);
  line-height: 1.6;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.card-cover {
  height: 150px;
  background: linear-gradient(135deg, var(--tao-color-accent) 0%, var(--tao-color-accent-active) 100%);
  border-radius: 12px 12px 0 0;
}

.product-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.product-card {
  width: 220px;
  max-width: 220px;
  min-width: 0;
  flex-shrink: 0;
  overflow: hidden;
}

.product-card :deep(.tao-card),
.product-card :deep(.tao-carousel),
.product-card :deep(.tao-carousel__row),
.product-card :deep(.tao-carousel__track) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.product-card :deep(.tao-card__title) {
  font-size: 16px;
}

.product-card :deep(.tao-card__footer) {
  font-weight: 600;
}

.product-card__photo {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #f4f4f4;
}

.product-card--gallery :deep(.tao-carousel) {
  position: relative;
}

.product-card--gallery :deep(.tao-carousel__track) {
  gap: 0;
}

.product-card--gallery :deep(.tao-carousel__dots) {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  z-index: 1;
}

.copy-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 12px;
  padding: 12px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
}

.copy-preview code {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.carousel-heading {
  margin: 28px 0 4px;
  font-size: 16px;
}

.carousel-note {
  margin: 0 0 12px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.carousel-hero {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  min-height: 180px;
  padding: 20px;
  border-radius: var(--tao-radius-panel);
  background: linear-gradient(135deg, var(--tao-color-accent-subtle) 0%, var(--tao-color-surface-sunken) 100%);
}

.carousel-hero span {
  color: var(--tao-color-text-muted);
  font-size: 14px;
}

.carousel-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carousel-card__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: var(--tao-radius-control);
  background: linear-gradient(135deg, var(--tao-color-accent-subtle) 0%, var(--tao-color-surface-sunken) 100%);
  color: var(--tao-color-text-muted);
  font-size: 22px;
  font-weight: 700;
}

.carousel-card span {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.carousel-nav {
  margin: 0;
  padding: 8px 12px;
  border: 1px solid var(--tao-color-border-strong);
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-text);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.carousel-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.code-block {
  margin-top: 16px;
  padding: 16px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
  overflow-x: auto;
  border: 1px solid var(--tao-color-border);
}

.code-block pre {
  margin: 0;
}

.code-block code {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  color: var(--tao-color-text);
  line-height: 1.5;
}

.showcase-footer {
  margin-top: 60px;
  padding-top: 32px;
  border-top: 1px solid var(--tao-color-border);
  text-align: center;
  color: var(--tao-color-text-muted);
}
</style>
