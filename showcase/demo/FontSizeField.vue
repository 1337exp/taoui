<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { TaoIcon, TaoInput, TaoTooltip } from '@1337exp/taoui'
import { tr } from '../i18n.js'

defineOptions({ name: 'FontSizeField' })

/**
 * Not part of the library: a font size field of three parts, a compact TaoInput, a block of two arrows and a small
 * pop-up with the sizes (not a dropdown: it is narrow, centred under the input, and the input keeps the focus, so typing
 * and the arrows work while it is open). The value is `'auto'` or a number. The arrows walk a ring: Auto, 4, 8 … 64,
 * Auto. «Up» goes to the next one (from 64 to Auto), «down» to the previous one (from Auto to 64). A number typed by
 * hand (1 to 999, Enter or leaving the field) is kept; the arrows then go to the nearest size.
 * Не часть библиотеки: поле размера шрифта из трёх деталей — компактный TaoInput, блок из двух стрелок и маленькое
 * всплывающее окно с размерами (не выпадающий список: оно узкое, по центру под полем, а фокус остаётся в поле, поэтому
 * ввод и стрелки работают при открытом окне). Значение — `'auto'` или число. Стрелки ходят по кольцу: Auto, 4, 8 … 64,
 * Auto. «Вверх» — к следующему (с 64 на Auto), «вниз» — к предыдущему (с Auto на 64). Число, набранное руками (от 1 до
 * 999, Enter или уход из поля), сохраняется; стрелки тогда идут к ближайшему размеру.
 */
const model = defineModel({ default: 'auto' })
const props = defineProps({
  sizes: { type: Array, default: () => [4, 8, 10, 12, 14, 18, 24, 32, 48, 64] },
  label: { type: String, default: '' },
})

const autoLabel = computed(() => tr('Auto', 'Авто'))
const items = computed(() => [{ value: 'auto', label: autoLabel.value }, ...props.sizes.map((size) => ({ value: size, label: String(size) }))])
const labelOf = (value) => (value === 'auto' ? autoLabel.value : String(value))
const name = computed(() => props.label || tr('Font size', 'Размер шрифта'))

// the text in the field is its own until it is committed / текст в поле свой, пока его не подтвердили
const text = ref(labelOf(model.value))
const open = ref(false)
const fieldRef = ref(null)
const panelRef = ref(null)
const panelStyle = ref({ top: '0px', left: '0px' })

watch([model, autoLabel], () => {
  text.value = labelOf(model.value)
})

const remToPx = (rem) => rem * parseFloat(getComputedStyle(document.documentElement).fontSize)

function place() {
  const field = fieldRef.value
  const panel = panelRef.value
  if (!field || !panel) return
  const rect = field.getBoundingClientRect()
  const gap = 6
  // the side with more room; the list scrolls when it does not fit there / сторона, где больше места; список прокручивается, если там не влезает
  const spaceBelow = window.innerHeight - rect.bottom - gap - 8
  const spaceAbove = rect.top - gap - 8
  const natural = panel.scrollHeight + 2
  const up = spaceBelow < natural && spaceAbove > spaceBelow
  const room = up ? spaceAbove : spaceBelow
  const height = Math.min(natural, room, remToPx(22))
  const left = Math.min(Math.max(8, rect.left + rect.width / 2 - panel.offsetWidth / 2), window.innerWidth - panel.offsetWidth - 8)
  panelStyle.value = { top: `${up ? rect.top - gap - height : rect.bottom + gap}px`, left: `${left}px`, maxHeight: `${Math.max(120, Math.min(room, remToPx(22)))}px` }
}

async function openPanel() {
  if (open.value) return
  open.value = true
  await nextTick()
  place()
  panelRef.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'center' })
  window.addEventListener('resize', place)
  window.addEventListener('scroll', place, true)
  document.addEventListener('pointerdown', outside, true)
}

function hide() {
  open.value = false
  window.removeEventListener('resize', place)
  window.removeEventListener('scroll', place, true)
  document.removeEventListener('pointerdown', outside, true)
}

function outside(event) {
  if (!fieldRef.value?.contains(event.target) && !panelRef.value?.contains(event.target)) {
    commit()
    hide()
  }
}

onBeforeUnmount(hide)

// the text in the field becomes the value: Auto, a number from 1 to 999, else the field goes back to what it had
// текст в поле становится значением: Auto, число от 1 до 999, иначе поле возвращается к прежнему
function commit() {
  const raw = text.value.trim().toLowerCase()
  if (raw === '' || raw === 'auto' || raw === autoLabel.value.toLowerCase()) {
    model.value = 'auto'
  } else {
    const value = Math.round(Number(raw))
    if (Number.isFinite(value) && value >= 1 && value <= 999) model.value = value
  }
  text.value = labelOf(model.value)
}

function pick(value) {
  model.value = value
  text.value = labelOf(value)
  hide()
}

function step(direction) {
  const ring = ['auto', ...props.sizes]
  const at = ring.indexOf(model.value)
  if (at >= 0) {
    model.value = ring[(at + direction + ring.length) % ring.length]
  } else {
    // a size that is not in the list: the nearest one on that side, and Auto when there is none
    // размера нет в списке: ближайший с этой стороны, а если такого нет — Auto
    const near = direction > 0 ? props.sizes.find((size) => size > model.value) : [...props.sizes].reverse().find((size) => size < model.value)
    model.value = near ?? 'auto'
  }
  text.value = labelOf(model.value)
}

function onKey(event) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    step(event.key === 'ArrowUp' ? 1 : -1)
    void openPanel()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    commit()
    hide()
  } else if (event.key === 'Escape' && open.value) {
    event.stopPropagation()
    text.value = labelOf(model.value)
    hide()
  }
}

function onFocus(event) {
  event.target.select?.()
  void openPanel()
}

function onBlur() {
  // a click inside the pop-up keeps the focus in the field (mousedown is prevented), so a blur is a real leave
  // клик в окне оставляет фокус в поле (mousedown отменён), так что уход фокуса — настоящий
  commit()
  hide()
}
</script>

<template>
  <div ref="fieldRef" class="font-size-field">
    <TaoTooltip :content="name">
      <TaoInput
        v-model="text"
        class="font-size-field__input"
        inputmode="numeric"
        autocomplete="off"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="open"
        :aria-label="name"
        @focus="onFocus"
        @blur="onBlur"
        @click="openPanel"
        @keydown="onKey"
      />
    </TaoTooltip>
    <div class="font-size-field__steps">
      <!-- like the arrows of a native number field: not a tab stop, and a press does not take the focus from the field / как стрелки родного числового поля: не табуляция, и нажатие не забирает фокус у поля -->
      <button type="button" tabindex="-1" class="font-size-field__step" :aria-label="tr('Next size', 'Следующий размер')" @mousedown.prevent @click="step(1)">
        <TaoIcon name="tao-chevron-up" />
      </button>
      <button type="button" tabindex="-1" class="font-size-field__step" :aria-label="tr('Previous size', 'Предыдущий размер')" @mousedown.prevent @click="step(-1)">
        <TaoIcon name="tao-chevron-down" />
      </button>
    </div>

    <Teleport to="body">
      <ul v-if="open" ref="panelRef" class="font-size-field__panel" role="listbox" :aria-label="name" :style="panelStyle" @mousedown.prevent>
        <li v-for="item in items" :key="item.value" role="option" :aria-selected="item.value === model" class="font-size-field__option" @click="pick(item.value)">
          {{ item.label }}
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
.font-size-field {
  display: inline-flex;
  align-items: center;
  gap: var(--tao-space-1);
}

.font-size-field__input {
  width: 4.5rem;
}

.font-size-field__input :deep(input) {
  text-align: center;
}

.font-size-field__steps {
  display: grid;
  height: var(--tao-control-height);
}

.font-size-field__step {
  display: grid;
  place-items: center;
  width: calc(var(--tao-control-height) * 0.6);
  padding: 0;
  border: 0;
  border-radius: var(--tao-radius-sm);
  background: transparent;
  color: var(--tao-color-text-muted);
  font-size: 0.9em;
  cursor: pointer;
  transition: color var(--tao-duration-fast) var(--tao-ease-base), background-color var(--tao-duration-fast) var(--tao-ease-base);
}

.font-size-field__step:hover {
  color: var(--tao-color-text);
  background: var(--tao-color-hover);
}

.font-size-field__step:active {
  color: var(--tao-color-text-strong);
}
</style>

<style>
/* the pop-up is teleported to <body>, so its rules are not scoped / окно уезжает в <body>, поэтому правила без scoped */
.font-size-field__panel {
  position: fixed;
  z-index: var(--tao-z-popup);
  display: grid;
  gap: 2px;
  min-width: 4.5rem;
  margin: 0;
  padding: var(--tao-space-2);
  overflow: auto;
  list-style: none;
  background: var(--tao-color-surface-raised);
  color: var(--tao-color-text);
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-lg);
  box-shadow: var(--tao-shadow-overlay);
}

.font-size-field__option {
  padding: var(--tao-space-2) var(--tao-space-3);
  border-radius: var(--tao-radius-md);
  text-align: center;
  cursor: pointer;
  user-select: none;
}

.font-size-field__option:hover {
  background: var(--tao-color-hover);
  color: var(--tao-color-text-strong);
}

.font-size-field__option[aria-selected='true'] {
  color: var(--tao-color-accent);
}
</style>
