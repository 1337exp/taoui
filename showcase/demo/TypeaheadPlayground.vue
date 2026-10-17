<script setup>
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { TaoLoader } from '@1337exp/taoui'
import { tr } from '../i18n.js'

defineOptions({ name: 'TypeaheadPlayground' })

/**
 * Not part of the library: a draft of an async typeahead for the showcase only.
 * Fetch, debounce and abort live here; the kit must not do this.
 */
const selected = defineModel({ default: null })

const catalog = computed(() => [
  { id: '1', name: tr('Anna Kozlova', 'Анна Козлова'), city: tr('Moscow', 'Москва'), role: tr('Design', 'Дизайн') },
  { id: '2', name: tr('Ivan Petrov', 'Иван Петров'), city: tr('Saint Petersburg', 'Санкт-Петербург'), role: tr('Frontend', 'Фронтенд') },
  { id: '3', name: tr('Maria Sokolova', 'Мария Соколова'), city: tr('Kazan', 'Казань'), role: tr('Product', 'Продукт') },
  { id: '4', name: tr('Andrey Volkov', 'Андрей Волков'), city: tr('Novosibirsk', 'Новосибирск'), role: tr('Backend', 'Бэкенд') },
  { id: '5', name: tr('Elena Morozova', 'Елена Морозова'), city: tr('Yekaterinburg', 'Екатеринбург'), role: 'QA' },
  { id: '6', name: tr('Pavel Novikov', 'Павел Новиков'), city: tr('Moscow', 'Москва'), role: tr('Mobile', 'Мобилка') },
  { id: '7', name: tr('Olga Smirnova', 'Ольга Смирнова'), city: tr('Samara', 'Самара'), role: tr('Analytics', 'Аналитика') },
  { id: '8', name: tr('Dmitry Orlov', 'Дмитрий Орлов'), city: tr('Krasnoyarsk', 'Красноярск'), role: 'DevOps' },
  { id: '9', name: tr('Natalia Belova', 'Наталья Белова'), city: tr('Rostov-on-Don', 'Ростов-на-Дону'), role: tr('Marketing', 'Маркетинг') },
  { id: '10', name: tr('Sergey Kuznetsov', 'Сергей Кузнецов'), city: tr('Voronezh', 'Воронеж'), role: tr('Frontend', 'Фронтенд') },
  { id: '11', name: tr('Anton Lebedev', 'Антон Лебедев'), city: tr('Perm', 'Пермь'), role: tr('Data', 'Данные') },
  { id: '12', name: tr('Irina Vasilieva', 'Ирина Васильева'), city: tr('Moscow', 'Москва'), role: tr('Content', 'Контент') },
  { id: '13', name: tr('Alexey Popov', 'Алексей Попов'), city: tr('Omsk', 'Омск'), role: tr('Support', 'Поддержка') },
  { id: '14', name: tr('Tatiana Fedorova', 'Татьяна Фёдорова'), city: tr('Ufa', 'Уфа'), role: 'HR' },
  { id: '15', name: tr('Nikita Egorov', 'Никита Егоров'), city: tr('Volgograd', 'Волгоград'), role: tr('Frontend', 'Фронтенд') },
  { id: '16', name: tr('Angelina Krylova', 'Ангелина Крылова'), city: tr('Chelyabinsk', 'Челябинск'), role: tr('Design', 'Дизайн') },
  { id: '17', name: tr('Mikhail Zaitsev', 'Михаил Зайцев'), city: tr('Kazan', 'Казань'), role: tr('Backend', 'Бэкенд') },
  { id: '18', name: tr('Svetlana Panina', 'Светлана Панина'), city: tr('Saint Petersburg', 'Санкт-Петербург'), role: tr('Product', 'Продукт') },
])

const localId = useId()
const listId = `${localId}-list`
const query = ref('')
const hits = ref([])
const pending = ref(false)
const open = ref(false)
const focused = ref(false)
const composing = ref(false)
const picking = ref(false)
const skipFocusOpen = ref(false)
const activeIndex = ref(-1)
const requestSeq = ref(0)
const aborted = ref(0)

const fieldRef = ref(null)
const inputRef = ref(null)
const panelRef = ref(null)
const listRef = ref(null)
const listStyle = ref({ top: '0px', left: '0px', width: '0px' })

let debounceId = 0
let abort = null

const needle = computed(() => query.value.trim())
const canSearch = computed(() => needle.value.length >= 2)
const showList = computed(() => open.value && (canSearch.value || pending.value || hits.value.length > 0))
const activeId = computed(() => (activeIndex.value >= 0 ? `${listId}-row-${activeIndex.value}` : undefined))

function searchCatalog(text, signal) {
  const q = text.toLowerCase()
  const wait = 280 + Math.floor(Math.random() * 320)
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      resolve(
        catalog.value.filter(
          (row) => row.name.toLowerCase().includes(q) || row.city.toLowerCase().includes(q),
        ),
      )
    }, wait)
    const onAbort = () => {
      window.clearTimeout(timer)
      reject(Object.assign(new Error('Aborted'), { name: 'AbortError' }))
    }
    if (signal.aborted) {
      onAbort()
      return
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function updatePosition() {
  const trigger = fieldRef.value
  const panel = panelRef.value
  if (!trigger || !panel) {
    return
  }
  const rect = trigger.getBoundingClientRect()
  const gap = 4
  const spaceBelow = window.innerHeight - rect.bottom - gap
  const openUp = spaceBelow < panel.offsetHeight && rect.top > spaceBelow
  listStyle.value = {
    top: `${openUp ? rect.top - panel.offsetHeight - gap : rect.bottom + gap}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  }
}

async function setOpen(next) {
  open.value = next
  if (!next) {
    return
  }
  await nextTick()
  updatePosition()
  scrollActiveIntoView()
}

function scrollActiveIntoView() {
  const list = listRef.value
  if (!list || activeIndex.value < 0) {
    return
  }
  list.querySelector(`[data-typeahead-index="${activeIndex.value}"]`)?.scrollIntoView({ block: 'nearest' })
}

function syncQueryFromModel() {
  query.value = selected.value?.name ?? ''
}

function cancelInFlight() {
  window.clearTimeout(debounceId)
  if (abort) {
    abort.abort()
    abort = null
    aborted.value += 1
  }
}

function scheduleSearch() {
  if (composing.value) {
    return
  }
  cancelInFlight()
  if (!canSearch.value) {
    hits.value = []
    pending.value = false
    return
  }
  const text = needle.value
  debounceId = window.setTimeout(() => {
    const ac = new AbortController()
    abort = ac
    const seq = ++requestSeq.value
    pending.value = true
    void setOpen(true)
    searchCatalog(text, ac.signal)
      .then((rows) => {
        if (seq !== requestSeq.value) {
          return
        }
        hits.value = rows
        activeIndex.value = rows.length ? 0 : -1
      })
      .catch((error) => {
        if (error?.name === 'AbortError') {
          return
        }
      })
      .finally(() => {
        if (seq === requestSeq.value) {
          pending.value = false
          abort = null
        }
      })
  }, 280)
}

function selectHit(row) {
  cancelInFlight()
  selected.value = row
  query.value = row.name
  hits.value = []
  pending.value = false
  open.value = false
  skipFocusOpen.value = true
  inputRef.value?.focus()
}

function clear() {
  cancelInFlight()
  selected.value = null
  query.value = ''
  hits.value = []
  pending.value = false
  open.value = false
  inputRef.value?.focus()
}

function close() {
  cancelInFlight()
  pending.value = false
  open.value = false
  syncQueryFromModel()
}

function moveActive(delta) {
  if (!hits.value.length) {
    return
  }
  const next = (activeIndex.value + delta + hits.value.length) % hits.value.length
  activeIndex.value = next
  scrollActiveIntoView()
}

function onInput(event) {
  query.value = event.target.value
  void setOpen(true)
  if (!composing.value) {
    scheduleSearch()
  }
}

function onFocus() {
  focused.value = true
  if (skipFocusOpen.value) {
    skipFocusOpen.value = false
    return
  }
  if (canSearch.value) {
    void setOpen(true)
  }
  nextTick(() => inputRef.value?.select())
}

function onBlur() {
  focused.value = false
  window.setTimeout(() => {
    if (picking.value) {
      picking.value = false
      return
    }
    if (fieldRef.value?.contains(document.activeElement) || panelRef.value?.contains(document.activeElement)) {
      return
    }
    close()
  }, 0)
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!open.value) {
      void setOpen(true)
      return
    }
    moveActive(1)
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!open.value) {
      void setOpen(true)
      return
    }
    moveActive(-1)
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    const row = hits.value[activeIndex.value]
    if (row) {
      selectHit(row)
    }
  }
}

function onDocumentPointer(event) {
  const target = event.target
  if (fieldRef.value?.contains(target) || panelRef.value?.contains(target)) {
    return
  }
  close()
}

function onViewportChange() {
  if (open.value) {
    updatePosition()
  }
}

watch(
  () => selected.value,
  () => {
    if (!focused.value) {
      syncQueryFromModel()
    }
  },
  { immediate: true },
)
watch(showList, (isOpen) => {
  if (isOpen) {
    document.addEventListener('pointerdown', onDocumentPointer)
    window.addEventListener('resize', onViewportChange)
    window.addEventListener('scroll', onViewportChange, true)
    nextTick(updatePosition)
    return
  }
  document.removeEventListener('pointerdown', onDocumentPointer)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})

onBeforeUnmount(() => {
  cancelInFlight()
  document.removeEventListener('pointerdown', onDocumentPointer)
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('scroll', onViewportChange, true)
})
</script>

<template>
  <div class="showcase-typeahead">
    <div ref="fieldRef" class="showcase-typeahead__field">
      <span class="showcase-typeahead__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </span>
      <input
        :id="localId"
        ref="inputRef"
        class="showcase-typeahead__input"
        type="search"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-expanded="showList"
        :aria-controls="listId"
        :aria-activedescendant="showList ? activeId : undefined"
        :aria-busy="pending || undefined"
        :placeholder="tr('Start with “an” or “mosc”', 'Начните с «ан» или «моск»')"
        :value="query"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        @compositionstart="composing = true"
        @compositionend="composing = false; scheduleSearch()"
      />
      <TaoLoader v-if="pending" :size="20" inline />
      <button
        v-else-if="query"
        type="button"
        class="showcase-typeahead__clear"
        :aria-label="tr('Clear', 'Очистить')"
        @mousedown.prevent="picking = true"
        @click="clear"
      >
        ×
      </button>
    </div>

    <p class="showcase-typeahead__meta">
      {{ tr('Requests', 'Запросов') }}: {{ requestSeq }} · {{ tr('cancelled', 'отменено') }}: {{ aborted }}
      <template v-if="selected"> · {{ tr('selected', 'выбрано') }}: {{ selected.id }}</template>
      <template v-else> · {{ tr('in the model', 'в модели') }}: null</template>
    </p>

    <Teleport to="body">
      <div
        v-if="showList"
        ref="panelRef"
        class="showcase-typeahead-panel"
        :style="listStyle"
      >
        <p v-if="!canSearch" class="showcase-typeahead-panel__hint">{{ tr('At least 2 characters more — then the request goes out', 'Ещё хотя бы 2 символа — тогда уйдёт запрос') }}</p>
        <ul
          v-else
          :id="listId"
          ref="listRef"
          class="showcase-typeahead-panel__list"
          role="listbox"
          :aria-busy="pending || undefined"
        >
          <li v-if="pending && !hits.length" class="showcase-typeahead-panel__hint">{{ tr('Searching…', 'Ищем…') }}</li>
          <li v-else-if="!pending && !hits.length" class="showcase-typeahead-panel__empty">
            <slot name="empty">{{ tr('Nothing found', 'Ничего не найдено') }}</slot>
          </li>
          <li
            v-for="(row, index) in hits"
            :id="`${listId}-row-${index}`"
            :key="row.id"
            class="showcase-typeahead-panel__option"
            :class="{ 'showcase-typeahead-panel__option--active': index === activeIndex }"
            role="option"
            :aria-selected="selected?.id === row.id"
            :data-typeahead-index="index"
            @mousedown.prevent="picking = true"
            @click="selectHit(row)"
            @mouseenter="activeIndex = index"
          >
            <slot name="item" :hit="row" :active="index === activeIndex">
              <span class="showcase-typeahead-panel__name">{{ row.name }}</span>
              <span class="showcase-typeahead-panel__sub">{{ row.city }} · {{ row.role }}</span>
            </slot>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<style>
.showcase-typeahead-panel {
  z-index: 1050;
  position: fixed;
  overflow: hidden;
  background: var(--tao-color-surface-raised);
  color: var(--tao-color-text);
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-control);
  box-shadow: var(--tao-shadow-overlay);
}

.showcase-typeahead-panel__list {
  margin: 0;
  padding: var(--tao-space-1);
  max-height: 260px;
  overflow: auto;
  list-style: none;
}

.showcase-typeahead-panel__hint,
.showcase-typeahead-panel__empty {
  padding: var(--tao-space-2) var(--tao-space-3);
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}

.showcase-typeahead-panel__option {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--tao-space-2) var(--tao-space-3);
  border-radius: var(--tao-radius-sm);
  cursor: pointer;
  user-select: none;
}

.showcase-typeahead-panel__option--active,
.showcase-typeahead-panel__option:hover {
  background: var(--tao-color-surface-hover);
}

.showcase-typeahead-panel__name {
  font-size: var(--tao-font-size-md);
}

.showcase-typeahead-panel__sub {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-xs);
}
</style>

<style scoped>
.showcase-typeahead {
  width: 100%;
}

.showcase-typeahead__field {
  display: flex;
  align-items: center;
  gap: var(--tao-space-2);
  width: 100%;
  min-height: 36px;
  padding: 0 var(--tao-space-3);
  border: 1px solid var(--tao-color-border-strong);
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-input-bg);
  color: var(--tao-color-input-text);
  transition: var(--tao-transition-base);
}

.showcase-typeahead__field:focus-within {
  border-color: var(--tao-color-accent);
  box-shadow: 0 0 0 2px var(--tao-color-accent-subtle-hover);
}

.showcase-typeahead__icon {
  display: inline-flex;
  flex: 0 0 auto;
  color: var(--tao-color-text-muted);
}

.showcase-typeahead__icon svg {
  display: block;
  width: 16px;
  height: 16px;
}

.showcase-typeahead__input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font-size: var(--tao-font-size-md);
  font-family: inherit;
  outline: none;
}

.showcase-typeahead__input::-webkit-search-cancel-button {
  appearance: none;
}

.showcase-typeahead__input::placeholder {
  color: var(--tao-color-input-placeholder);
}

.showcase-typeahead__clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--tao-color-text-muted);
  font: inherit;
  line-height: 1;
  cursor: pointer;
}

.showcase-typeahead__clear:hover {
  color: var(--tao-color-text-strong);
}

.showcase-typeahead__meta {
  margin: var(--tao-space-2) 0 0;
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-xs);
}
</style>
