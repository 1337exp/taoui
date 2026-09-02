<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  TaoBlock,
  TaoButton,
  TaoCard,
  TaoCopy,
  TaoInput,
  TaoModal,
  TaoSpoiler,
  TaoTabs,
  TaoTooltip,
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
  TaoSwitch,
  TaoRadio,
  TaoRadioGroup,
  TaoAlert,
  TaoTable,
  TaoPagination,
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

// TaoModal demo
const isModalOpen = ref(false)

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

// TaoCopy demo
const copyText = 'Этот текст будет скопирован в буфер обмена!'

// TaoCheckbox demo
const checkedA = ref(false)
const checkedB = ref(true)

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
      { id: 'input', label: 'TaoInput' },
      { id: 'textarea', label: 'TaoTextarea' },
      { id: 'checkbox', label: 'TaoCheckbox' },
      { id: 'select', label: 'Select / Switch / Radio' },
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
      { id: 'confirm', label: 'confirm()' },
      { id: 'tooltip', label: 'TaoTooltip' },
      { id: 'dropdown', label: 'DropdownMenu' },
      { id: 'spoiler', label: 'TaoSpoiler' },
    ],
  },
  {
    id: 'nav',
    title: 'Навигация',
    items: [
      { id: 'tabs', label: 'TaoTabs' },
      { id: 'link', label: 'TaoLink' },
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
        <p class="description">Компоненты по темам. Слева — оглавление, сверху можно оставить только одну группу.</p>
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
      <p>Карточка с поддержкой слотов для cover, header и footer</p>
      
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

      <div class="code-block">
        <pre><code>&lt;TaoCard :padding="20" :radius="12"&gt;
  &lt;template #cover&gt;
    &lt;div&gt;Обложка&lt;/div&gt;
  &lt;/template&gt;
  &lt;template #header&gt;
    &lt;h3&gt;Заголовок&lt;/h3&gt;
  &lt;/template&gt;
  &lt;p&gt;Содержимое&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;TaoButton&gt;Действие&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoCard&gt;</code></pre>
      </div>
    </section>

    <!-- TaoInput -->
    <section id="input" class="showcase-section" v-show="sectionVisible('forms', 'TaoInput')">
      <h2>TaoInput</h2>
      <p>Поле ввода с поддержкой v-model, валидации и различных типов</p>
      
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
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoInput 
  v-model="value" 
  label="Название" 
  placeholder="Введите значение" 
/&gt;

&lt;TaoInput 
  type="email" 
  label="Email" 
  error 
  error-message="Некорректный email"
/&gt;</code></pre>
      </div>
    </section>

    <!-- TaoModal -->
    <section id="modal" class="showcase-section" v-show="sectionVisible('overlays', 'TaoModal')">
      <h2>TaoModal</h2>
      <p>Модальное окно с поддержкой слотов и анимацией</p>
      
      <TaoButton @click="isModalOpen = true" variant="primary">
        Открыть модальное окно
      </TaoButton>

      <TaoModal v-model="isModalOpen" title="Заголовок модального окна">
        <p>Это содержимое модального окна. Здесь можно разместить форму, текст, изображения или любые другие компоненты.</p>
        <p>Модальное окно закрывается по клику на крестик, по кнопке "Закрыть" или по клику вне области окна.</p>
        
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

    <!-- TaoSpoiler -->
    <section id="spoiler" class="showcase-section" v-show="sectionVisible('overlays', 'TaoSpoiler')">
      <h2>TaoSpoiler</h2>
      <p>Раскрывающийся блок (аккордеон)</p>
      
      <TaoSpoiler title="Нажмите, чтобы раскрыть">
        <p>Это скрытое содержимое спойлера. Здесь можно разместить подробную информацию, дополнительные настройки или любой другой контент, который нужно показывать по требованию.</p>
        <ul>
          <li>Пункт списка 1</li>
          <li>Пункт списка 2</li>
          <li>Пункт списка 3</li>
        </ul>
      </TaoSpoiler>

      <TaoSpoiler title="Ещё один спойлер" style="margin-top: 12px;">
        <p>Можно создавать несколько спойлеров подряд для организации контента в виде аккордеона.</p>
      </TaoSpoiler>

      <div class="code-block">
        <pre><code>&lt;TaoSpoiler title="Заголовок"&gt;
  &lt;p&gt;Скрытое содержимое&lt;/p&gt;
&lt;/TaoSpoiler&gt;</code></pre>
      </div>
    </section>

    <!-- TaoTabs -->
    <section id="tabs" class="showcase-section" v-show="sectionVisible('nav', 'TaoTabs')">
      <h2>TaoTabs</h2>
      <p>Вкладки для переключения между различными секциями контента</p>
      
      <TaoTabs v-model="activeTab" :tabs="tabs">
        <template #default="{ activeTab }">
          <p>{{ tabContents[activeTab] }}</p>
        </template>
      </TaoTabs>

      <div class="code-block">
        <pre><code>&lt;TaoTabs v-model="activeTab" :tabs="tabs"&gt;
  &lt;template #default="{ activeTab }"&gt;
    &lt;p&gt;{{ tabContents[activeTab] }}&lt;/p&gt;
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
      <p>Всплывающая подсказка при наведении</p>
      
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

    <!-- TaoCopy -->
    <section id="copy" class="showcase-section" v-show="sectionVisible('basics', 'TaoCopy')">
      <h2>TaoCopy</h2>
      <p>Кнопка копирования текста в буфер обмена</p>
      
      <TaoCopy :text="copyText" success-message="Скопировано! ✓">
        <template #default="{ copy, copied }">
          <TaoButton 
            :variant="copied ? 'primary' : 'secondary'" 
            @click="copy"
          >
            {{ copied ? '✓ Скопировано' : '📋 Копировать текст' }}
          </TaoButton>
        </template>
      </TaoCopy>

      <div class="copy-preview">
        <strong>Текст для копирования:</strong>
        <p style="margin: 8px 0 0; font-family: monospace;">{{ copyText }}</p>
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCopy text="Текст для копирования"&gt;
  &lt;template #default="{ copy, copied }"&gt;
    &lt;TaoButton @click="copy"&gt;
      {{ copied ? '✓ Скопировано' : '📋 Копировать' }}
    &lt;/TaoButton&gt;
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
      <p>Чекбокс с поддержкой v-model</p>

      <div style="display: flex; gap: 20px;">
        <TaoCheckbox v-model="checkedA" label="Не отмечен" />
        <TaoCheckbox v-model="checkedB" label="Отмечен" />
        <TaoCheckbox :model-value="false" label="Disabled" disabled />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoCheckbox v-model="checked" label="Согласен с условиями" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoSwitch / Radio / Select -->
    <section id="select" class="showcase-section" v-show="sectionVisible('forms', 'TaoSwitch TaoRadio TaoSelect TaoFormField')">
      <h2>TaoSwitch / TaoRadio / TaoSelect</h2>
      <p>Форменные контролы, которых не хватало для логина, профиля и настроек. Label, hint и error — через TaoFormField.</p>

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

    <!-- TaoAlert -->
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
      <p>Многострочное поле с авто-высотой</p>

      <TaoTextarea v-model="textareaValue" placeholder="Печатайте..." style="max-width: 400px;" />

      <div class="code-block">
        <pre><code>&lt;TaoTextarea v-model="text" placeholder="Печатайте..." /&gt;</code></pre>
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
      <p>Статичная полоса прогресса и интерактивный слайдер (drag + клик)</p>

      <h3>TaoProgress</h3>
      <TaoProgress :progress="65" show-percentage style="max-width: 400px;" />

      <h3>TaoSlider</h3>
      <TaoSlider v-model="sliderValue" show-value style="max-width: 400px;" />
      <p style="margin-top: 4px; font-size: 13px;">Значение: {{ sliderValue }} — <em>ПКМ по слайдеру открывает точный ввод числа</em></p>

      <div class="code-block">
        <pre><code>&lt;TaoProgress :progress="65" show-percentage /&gt;
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
      <p>Обёртка над &lt;img&gt; с плавным fade-in при загрузке и плейсхолдером</p>

      <div style="width: 160px; height: 120px;">
        <TaoImage :src="imageSrc" />
      </div>

      <div class="code-block">
        <pre><code>&lt;TaoImage :src="imageUrl" /&gt;</code></pre>
      </div>
    </section>

    <!-- TaoFileDrop -->
    <section id="filedrop" class="showcase-section" v-show="sectionVisible('forms', 'TaoFileDrop')">
      <h2>TaoFileDrop</h2>
      <p>Зона загрузки файлов (drag &amp; drop + клик). Компонент управляется через v-model, поэтому очистку можно как выполнять сразу, так и подтверждать через модалку.</p>

      <h3>Мгновенная очистка</h3>
      <TaoFileDrop
        v-model="filesInstant"
        style="max-width: 400px;"
        show-clear
        @clear-request="filesInstant = []"
      />
      <p style="margin-top: 4px; font-size: 13px;">Файлов: {{ filesInstant.length }}</p>

      <h3>Очистка через подтверждение</h3>
      <TaoFileDrop
        v-model="filesConfirm"
        style="max-width: 400px;"
        show-clear
        @clear-request="requestClearConfirm"
      />
      <p style="margin-top: 4px; font-size: 13px;">Файлов: {{ filesConfirm.length }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoFileDrop v-model="files" show-clear @clear-request="files = []" /&gt;

&lt;!-- или с подтверждением --&gt;
&lt;TaoFileDrop v-model="files" show-clear @clear-request="onClear" /&gt;

async function onClear() {
  if (await confirm().title('Удалить файлы?').danger()) {
    files = []
  }
}</code></pre>
      </div>
    </section>

    <!-- TaoPinCode -->
    <section id="pincode" class="showcase-section" v-show="sectionVisible('forms', 'TaoPinCode')">
      <h2>TaoPinCode</h2>
      <p>Пин-код из N полей с авто-переходом фокуса между ними. Backspace на пустом поле стирает предыдущее и переходит на него.</p>

      <h3>Обычный (буквы и цифры)</h3>
      <TaoPinCode v-model="pinValue" :length="4" />
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValue }}</p>

      <h3>Только цифры</h3>
      <TaoPinCode v-model="pinValueNumeric" :length="4" numbers-only />
      <p style="margin-top: 8px; font-size: 13px;">Значение: {{ pinValueNumeric }}</p>

      <div class="code-block">
        <pre><code>&lt;TaoPinCode v-model="pin" :length="4" /&gt;

&lt;!-- запрещает ввод всего, кроме 0-9 --&gt;
&lt;TaoPinCode v-model="pin" :length="4" numbers-only /&gt;</code></pre>
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
      <p>Страницы с многоточием, счётчик «с–по из N». Текущая страница — через <code>v-model:page</code>.</p>

      <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" />
      <TaoPagination v-model:page="pagerPage" :total="500" :page-size="10" size="small" style="margin-top: 12px;" />

      <div class="code-block">
        <pre><code>&lt;TaoPagination v-model:page="page" :total="500" :page-size="10" /&gt;</code></pre>
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.showcase-top .description {
  margin-bottom: 0;
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
  margin-bottom: 8px;
}

.description {
  color: var(--tao-color-text-muted);
  margin-bottom: 40px;
  font-size: 16px;
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

.copy-preview {
  margin-top: 12px;
  padding: 12px;
  background: var(--tao-color-surface-sunken);
  border-radius: var(--tao-radius-panel);
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
