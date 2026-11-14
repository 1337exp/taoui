<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  TaoButton,
  TaoCheckbox,
  TaoDropdownMenu,
  TaoInput,
  TaoInputNumber,
  TaoSegmented,
  TaoSegmentedOption,
  TaoSelect,
  TaoTabs,
  TaoTag,
  TaoThemeToggle,
  contrastRatio,
} from '@1337exp/taoui'
import A11yPanel from '../a11y/A11yPanel.vue'
import { useRoles } from '../a11y/colors.js'
import { CONTROLS } from './controls.js'
import { whileHovered } from './hover.js'
import { LADDER_ROLES, hoverProblem, judge, ladderStep } from './measure.js'
import { toHexOver } from './paint.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'HarmonyBench' })

// The bench puts the controls of the kit side by side on a surface of your choice, in a size of your choice, and measures
// them with the browser: which step of the text ladder each one is, its weight, its height, and whether its fill can be
// seen on the surface. Switch the theme or the palette in the header and it measures again.
// Стенд кладёт контролы набора рядом на выбранную поверхность и в выбранном размере и мерит их браузером: какая это
// ступень лестницы текста, вес, высота, видна ли заливка на поверхности. Смените тему или палитру в шапке, и он смерит снова.

const surface = ref('raised')
const size = ref('medium')
const stage = ref(null)

const SURFACES = [
  { id: 'page', role: '--tao-color-bg', en: 'Page', ru: 'Страница' },
  { id: 'raised', role: '--tao-color-surface-raised', en: 'Panel, popover, modal', ru: 'Панель, поповер, модалка' },
  { id: 'sunken', role: '--tao-color-surface-sunken', en: 'Sunken', ru: 'Вдавленная' },
]
const SIZES = ['small', 'medium', 'large']

const { colors } = useRoles(stage, LADDER_ROLES)

// the values of the demo controls / значения демонстрационных контролов
const text = ref('Value')
const number = ref(12)
const choice = ref('a')
const tab = ref('one')
const checked = ref(true)
const layout = ref('two')
const menu = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
]
const options = [
  { value: 'a', label: 'Default' },
  { value: 'b', label: 'Other' },
]
const tabs = [
  { value: 'one', label: 'Tab one' },
  { value: 'two', label: 'Tab two' },
]

const rows = ref([])
const promises = ref([])
const wanted = ref(0)
let timer = 0

/** The colour the page has under the stage: the stage surface may itself be translucent. */
function pageHex() {
  const bg = getComputedStyle(document.body).backgroundColor
  return toHexOver(bg === 'rgba(0, 0, 0, 0)' ? '#ffffff' : bg, '#ffffff')
}

/** What a text stands on: the fills of its box and of its ancestors up to the stage, laid one over another. */
function backdrop(el, host, ground) {
  const chain = []
  for (let node = el; node && node !== host; node = node.parentElement) chain.unshift(node)
  let hex = ground
  for (const node of chain) hex = toHexOver(getComputedStyle(node).backgroundColor, hex)
  return hex
}

/** The colour of a text as seen on its backdrop: the step it is, the ratio it reads with. */
function readText(el, host, ground, prefer) {
  const back = backdrop(el, host, ground)
  const hex = toHexOver(getComputedStyle(el).color, back)
  return { hex, step: ladderStep(hex, colors.value, prefer), ratio: contrastRatio(hex, back) }
}

function measure() {
  const host = stage.value
  if (!host) return
  const under = pageHex()
  const ground = toHexOver(getComputedStyle(host).backgroundColor, under)

  const probe = document.createElement('div')
  probe.style.height = 'var(--tao-control-height)'
  probe.style.position = 'absolute'
  probe.style.visibility = 'hidden'
  host.appendChild(probe)
  wanted.value = probe.getBoundingClientRect().height
  probe.remove()

  const measured = []
  for (const control of CONTROLS) {
    const cell = host.querySelector(`[data-harmony="${control.cell ?? control.id}"]`)
    const read = control.text ? cell?.querySelector(control.text) : null
    const style = read ? getComputedStyle(read) : null
    const box = control.box ? cell?.querySelector(control.box) : null
    const fillEl = control.fill ? cell?.querySelector(control.fill) : null
    const underEl = control.on ? cell?.querySelector(control.on) : null
    const standsOn = underEl ? toHexOver(getComputedStyle(underEl).backgroundColor, ground) : ground
    const fillColour = fillEl ? toHexOver(getComputedStyle(fillEl).backgroundColor, standsOn) : null
    const rest = read ? readText(read, host, ground, control.expect.step) : null
    const target = control.hover && read ? cell.querySelector(control.hover) : null
    const hovered = target ? whileHovered(target, () => readText(read, host, ground, control.expect.step)) : null
    measured.push({
      id: control.id,
      name: tr(control.en, control.ru),
      expect: control.expect,
      hex: rest?.hex ?? null,
      step: rest?.step ?? null,
      ratio: rest?.ratio ?? null,
      hover: hovered ? { ...hovered, problem: hoverProblem(rest, hovered) } : null,
      size: style ? Number.parseFloat(style.fontSize) : null,
      weight: style ? Number(style.fontWeight) : null,
      height: box ? box.getBoundingClientRect().height : null,
      wanted: wanted.value,
      fill: fillColour ? contrastRatio(fillColour, standsOn) : null,
    })
  }
  rows.value = measured
  promises.value = judge(measured)
}

// colours move with a transition: measure when they have settled / цвета едут с переходом: мерим, когда осели
function later() {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => nextTick(measure), 420)
}

watch([surface, size], later)
watch(colors, later)
onMounted(later)
onBeforeUnmount(() => window.clearTimeout(timer))

const PROMISE_TEXT = {
  step: ['One step of the ladder per role', 'Одна ступень лестницы на роль'],
  read: ['The text reads on what it stands on (4.5:1)', 'Текст читается на своём фоне (4,5:1)'],
  hover: ['A hover keeps the text readable and goes up the ladder', 'Hover не портит чтение и идёт вверх по лестнице'],
  weight: ['One weight for the labels', 'Один вес у подписей'],
  height: ['One height for the controls of a size', 'Одна высота у контролов размера'],
  fill: ['A fill that is seen on its surface', 'Заливка, видная на своей поверхности'],
}
const promiseText = (id) => tr(PROMISE_TEXT[id][0], PROMISE_TEXT[id][1])
const offenderList = (promise) => promise.offenders.map((o) => `${rows.value.find((r) => r.id === o.id)?.name}: ${o.detail}`).join('; ')
const fillOf = (row) => (row.fill == null ? '—' : `${row.fill.toFixed(2)}:1`)
const num = (value, unit = '') => (value == null ? '—' : `${Math.round(value * 10) / 10}${unit}`)
const failed = (row, id) => promises.value.find((p) => p.id === id)?.offenders.some((o) => o.id === row.id)
</script>

<template>
  <A11yPanel icon="tao-eye" :title="tr('Controls side by side', 'Контролы рядом')">
    <template #hint>
      {{ tr('the same controls on one surface; the numbers are measured on this page and follow the theme and the palette', 'одни и те же контролы на одной поверхности; числа измерены на этой странице и идут за темой и палитрой') }}
    </template>

    <div class="harmony-pick">
      <span class="harmony-pick__label">{{ tr('Surface', 'Поверхность') }}</span>
      <TaoSegmented v-model="surface" size="small" :aria-label="tr('Surface', 'Поверхность')">
        <TaoSegmentedOption v-for="s in SURFACES" :key="s.id" :value="s.id">{{ tr(s.en, s.ru) }}</TaoSegmentedOption>
      </TaoSegmented>
      <span class="harmony-pick__label">{{ tr('Size', 'Размер') }}</span>
      <TaoSegmented v-model="size" size="small" :aria-label="tr('Size', 'Размер')">
        <TaoSegmentedOption v-for="s in SIZES" :key="s" :value="s">{{ s }}</TaoSegmentedOption>
      </TaoSegmented>
    </div>

    <ul v-if="promises.length" class="harmony-promises" :aria-label="tr('Verdicts', 'Вердикты')">
      <li v-for="promise in promises" :key="promise.id" class="harmony-promises__item">
        <TaoTag size="small" :tone="promise.ok ? 'success' : 'danger'">{{ promise.ok ? tr('ok', 'ок') : promise.offenders.length }}</TaoTag>
        <span>
          {{ promiseText(promise.id) }}
          <small v-if="promise.id === 'weight'" class="harmony-promises__house">{{ tr('the house weight', 'вес большинства') }}: {{ promise.house }}</small>
          <small v-if="!promise.ok" class="harmony-promises__who">{{ offenderList(promise) }}</small>
        </span>
      </li>
    </ul>

    <div ref="stage" class="harmony-stage" :class="`harmony-stage--${surface} tao-size-${size}`">
      <div class="harmony-cell" data-harmony="button-primary"><TaoButton variant="primary">Primary</TaoButton></div>
      <div class="harmony-cell" data-harmony="button-secondary"><TaoButton variant="secondary">Secondary</TaoButton></div>
      <div class="harmony-cell" data-harmony="button-ghost"><TaoButton variant="ghost" tone="neutral">Ghost</TaoButton></div>
      <div class="harmony-cell" data-harmony="input"><TaoInput v-model="text" aria-label="Input" /></div>
      <div class="harmony-cell" data-harmony="select"><TaoSelect v-model="choice" :options="options" :clearable="false" aria-label="Select" /></div>
      <div class="harmony-cell" data-harmony="input-number"><TaoInputNumber v-model="number" aria-label="Number" /></div>
      <div class="harmony-cell" data-harmony="segmented">
        <TaoSegmented v-model="layout" aria-label="Segmented">
          <TaoSegmentedOption value="one">One</TaoSegmentedOption>
          <TaoSegmentedOption value="two">Two</TaoSegmentedOption>
        </TaoSegmented>
      </div>
      <div class="harmony-cell" data-harmony="tabs"><TaoTabs v-model="tab" :items="tabs" /></div>
      <div class="harmony-cell" data-harmony="dropdown"><TaoDropdownMenu :items="menu" :size="size" /></div>
      <div class="harmony-cell" data-harmony="theme-toggle"><TaoThemeToggle system :apply="false" model-value="system" /></div>
      <div class="harmony-cell" data-harmony="menu">
        <nav class="showcase-nav harmony-menu" aria-label="Sample">
          <a class="showcase-nav__link" href="#harmony" @click.prevent>Page</a>
          <a class="showcase-nav__link active" href="#harmony" @click.prevent>Current page</a>
        </nav>
      </div>
      <div class="harmony-cell" data-harmony="link"><a href="#harmony" @click.prevent>Link</a></div>
      <div class="harmony-cell" data-harmony="checkbox"><TaoCheckbox v-model="checked">Checkbox</TaoCheckbox></div>
      <div class="harmony-cell" data-harmony="tag"><TaoTag>Tag</TaoTag></div>
    </div>

    <div class="harmony-table-wrap">
      <table class="harmony-table">
        <thead>
          <tr>
            <th scope="col">{{ tr('Control', 'Контрол') }}</th>
            <th scope="col">{{ tr('Text', 'Текст') }}</th>
            <th scope="col">{{ tr('Reads', 'Читается') }}</th>
            <th scope="col">{{ tr('Hover', 'Hover') }}</th>
            <th scope="col">{{ tr('Size', 'Размер') }}</th>
            <th scope="col">{{ tr('Weight', 'Вес') }}</th>
            <th scope="col">{{ tr('Height', 'Высота') }}</th>
            <th scope="col">{{ tr('Fill on the surface', 'Заливка на поверхности') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id">
            <td>{{ row.name }}</td>
            <td :class="{ 'harmony-bad': failed(row, 'step') }">
              <span v-if="row.hex" class="harmony-dot" :style="{ background: row.hex }" aria-hidden="true" />
              <code>{{ row.step ?? (row.hex ? 'other ' + row.hex : '—') }}</code>
              <small v-if="row.expect.step" class="harmony-want">{{ tr('want', 'надо') }} {{ row.expect.step }}</small>
            </td>
            <td :class="{ 'harmony-bad': failed(row, 'read') }">{{ row.ratio == null ? '—' : row.ratio.toFixed(2) + ':1' }}</td>
            <td :class="{ 'harmony-bad': failed(row, 'hover') }">
              <template v-if="row.hover">
                <span class="harmony-dot" :style="{ background: row.hover.hex }" aria-hidden="true" />
                <code>{{ row.hover.step ?? 'other' }}</code> · {{ row.hover.ratio.toFixed(2) }}:1
              </template>
              <template v-else>—</template>
            </td>
            <td>{{ num(row.size, 'px') }}</td>
            <td :class="{ 'harmony-bad': failed(row, 'weight') }">{{ num(row.weight) }}</td>
            <td :class="{ 'harmony-bad': failed(row, 'height') }">{{ num(row.height) }}</td>
            <td :class="{ 'harmony-bad': failed(row, 'fill') }">{{ fillOf(row) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="harmony-note">
      {{
        tr(
          'Hover is read without a pointer: the rules with :hover are copied for the moment, so the colours are the ones the hover ends with. Fields and a select take their text from one token (input-text), the others from the ladder; tabs and segments that are not chosen are `subtle` on purpose. A red cell is a place where the kit says one thing and draws another.',
          'Hover читается без указателя: правила с :hover на миг копируются, так что цвета — те, которыми hover заканчивается. Поля и селект берут текст из одного токена (input-text), остальные — из лестницы; невыбранные вкладки и сегменты намеренно `subtle`. Красная ячейка — место, где набор говорит одно, а рисует другое.',
        )
      }}
    </p>
  </A11yPanel>
</template>

<style scoped>
.harmony-pick {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}

.harmony-pick__label {
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.harmony-promises {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 8px 16px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}

.harmony-promises__item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.harmony-promises__item small {
  display: block;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.harmony-promises__who {
  overflow-wrap: anywhere;
}

/* the stage is a surface the controls stand on; its colour is the role, so a change of the theme moves it */
.harmony-stage {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 20px;
  border: 1px dashed var(--tao-color-border-strong);
  border-radius: var(--tao-radius-panel);
}

.harmony-stage--page {
  background: var(--tao-color-bg);
}

.harmony-stage--raised {
  background: var(--tao-color-surface-raised);
}

.harmony-stage--sunken {
  background: var(--tao-color-surface-sunken);
}

.harmony-cell {
  display: inline-flex;
  align-items: center;
}

/* the real sidebar links of this page, without its frame: the bench measures the menu itself / настоящие ссылки боковой панели этой страницы без её рамки: стенд мерит само меню */
.harmony-menu {
  position: static;
  display: flex;
  flex-direction: column;
  width: 160px;
  max-height: none;
  padding: 0;
  border: 0;
  background: transparent;
}

.harmony-table-wrap {
  margin-top: 16px;
  overflow-x: auto;
}

.harmony-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.harmony-table th,
.harmony-table td {
  padding: 6px 10px;
  border-bottom: 1px solid var(--tao-color-border);
  text-align: start;
  white-space: nowrap;
}

.harmony-table th {
  color: var(--tao-color-text-muted);
  font-size: 12px;
  font-weight: 500;
}

.harmony-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-inline-end: 6px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--tao-color-border-strong);
}

.harmony-want {
  margin-inline-start: 8px;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.harmony-bad {
  color: var(--tao-color-danger);
  font-weight: 600;
}

.harmony-bad .harmony-want {
  color: inherit;
  font-weight: 400;
}

.harmony-note {
  margin: 12px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}
</style>
