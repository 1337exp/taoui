<script setup>
import { computed } from 'vue'
import { TaoCombobox, TaoIcon } from '@1337exp/taoui'
import { tr } from '../i18n.js'

defineOptions({ name: 'FontSizeField' })

/**
 * Not part of the library: a font size field of two TaoUI parts, a TaoCombobox and a pair of arrows. The value is
 * `'auto'` or a number. The arrows walk a ring: Auto, 4, 8 … 64, Auto. «Up» goes to the next one (from 64 to Auto),
 * «down» to the previous one (from Auto to 64). A number typed in by hand is kept; the arrows then go to the nearest size.
 * Не часть библиотеки: поле размера шрифта из двух деталей TaoUI, TaoCombobox и пары стрелок. Значение — `'auto'` или
 * число. Стрелки ходят по кольцу: Auto, 4, 8 … 64, Auto. «Вверх» — к следующему (с 64 на Auto), «вниз» — к
 * предыдущему (с Auto на 64). Число, набранное руками, сохраняется; стрелки тогда идут к ближайшему размеру.
 */
const model = defineModel({ default: 'auto' })
const props = defineProps({
  sizes: { type: Array, default: () => [4, 8, 10, 12, 14, 18, 24, 32, 48, 64] },
  label: { type: String, default: '' },
})

const options = computed(() => [
  { value: 'auto', label: tr('Auto', 'Авто') },
  ...props.sizes.map((size) => ({ value: size, label: String(size) })),
])

function step(direction) {
  const ring = ['auto', ...props.sizes]
  const at = ring.indexOf(model.value)
  if (at >= 0) {
    model.value = ring[(at + direction + ring.length) % ring.length]
    return
  }
  // a size that is not in the list: the nearest one on that side, and Auto when there is none
  // размера нет в списке: ближайший с этой стороны, а если такого нет — Auto
  const near = direction > 0 ? props.sizes.find((size) => size > model.value) : [...props.sizes].reverse().find((size) => size < model.value)
  model.value = near ?? 'auto'
}

// a number typed by hand: whole, 1 to 999, else the field keeps what it had
// число, набранное руками: целое от 1 до 999, иначе поле остаётся как было
function create(text) {
  const value = Math.round(Number(text))
  if (Number.isFinite(value) && value >= 1 && value <= 999) {
    model.value = value
  }
}

// Combobox gives null when the field is emptied: that is Auto / пустое поле — это Auto
function pick(value) {
  model.value = value ?? 'auto'
}
</script>

<template>
  <div class="font-size-field">
    <TaoCombobox
      class="font-size-field__input"
      :model-value="model"
      :options="options"
      :clearable="false"
      allow-create
      :aria-label="label || tr('Font size', 'Размер шрифта')"
      @update:model-value="pick"
      @create="create"
    />
    <div class="font-size-field__steps">
      <!-- like the arrows of a native number field: not a tab stop, the keys of the field do the same / как стрелки родного числового поля: не табуляция, то же делают клавиши поля -->
      <button type="button" tabindex="-1" class="font-size-field__step" :aria-label="tr('Next size', 'Следующий размер')" @click="step(1)">
        <TaoIcon name="tao-chevron-up" />
      </button>
      <button type="button" tabindex="-1" class="font-size-field__step" :aria-label="tr('Previous size', 'Предыдущий размер')" @click="step(-1)">
        <TaoIcon name="tao-chevron-down" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.font-size-field {
  display: inline-flex;
  align-items: center;
  gap: var(--tao-space-1);
}

.font-size-field__input {
  width: 7rem;
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
