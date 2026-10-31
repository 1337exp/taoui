<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { TaoButton, TaoColorInput, TaoSparkline, TaoTag, applyTaoPalette, contrastRatio } from '@1337exp/taoui'
import A11yPanel from './A11yPanel.vue'
import RatioBadge from './RatioBadge.vue'
import { randomStops, useRoles, useRootMode } from './colors.js'
import { LAB_ROWS } from './pairs.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'PaletteLab' })

// applyTaoPalette(): four stops in, the whole theme out. The preview wears the palette on its own element (the third
// argument); "Apply to the page" puts it on <html> and "Remove" takes it off, as the returned function does.
// applyTaoPalette(): на входе четыре стопа, на выходе вся тема. Превью носит палитру на своём элементе (третий
// аргумент); «Применить к странице» кладёт её на <html>, «Снять» убирает возвращённой функцией.
const stops = ref(['#1d1b04', '#565b00', '#90ac1d', '#d7f3ba'])
const mode = useRootMode()
const preview = ref(null)
const onPage = ref(false)

const def = computed(() => ({ name: 'mine', label: 'Mine', stops: [...stops.value] }))
const gradient = computed(() => `linear-gradient(90deg, ${stops.value.join(', ')})`)
const code = computed(
  () =>
    `import { applyTaoPalette } from '@1337exp/taoui'\n\nconst stop = applyTaoPalette(\n  { name: 'mine', label: 'Mine',\n    stops: [${stops.value.map((s) => `'${s}'`).join(', ')}] },\n  '${mode.value}'\n)\nstop()   // ${tr('take it off', 'снять')}`,
)

const roleNames = [...new Set(LAB_ROWS.flatMap((row) => [row.fg, row.bg]))]
const { colors, refresh } = useRoles(preview, roleNames)

let stopPreview = () => {}
let stopPage = () => {}

function paint() {
  if (!preview.value) return
  stopPreview()
  try {
    stopPreview = applyTaoPalette(def.value, mode.value, preview.value)
  } catch {
    stopPreview = () => {}
  }
  refresh()
}

function applyToPage() {
  stopPage()
  try {
    stopPage = applyTaoPalette(def.value, mode.value)
    onPage.value = true
  } catch {
    onPage.value = false
  }
}

function removeFromPage() {
  stopPage()
  stopPage = () => {}
  onPage.value = false
}

watch([def, mode], () => {
  paint()
  if (onPage.value) applyToPage()
})
onMounted(() => nextTick(paint))
onBeforeUnmount(() => {
  stopPreview()
  stopPage()
})

const rows = computed(() =>
  LAB_ROWS.map((row) => {
    const fg = colors.value[row.fg]
    const bg = colors.value[row.bg]
    return { ...row, hex: colors.value[`--tao-color-${row.role}`] ?? fg, ratio: fg && bg ? contrastRatio(fg, bg) : 0 }
  }),
)
const ready = computed(() => Object.keys(colors.value).length > 0)

function shuffle() {
  stops.value = randomStops()
}
</script>

<template>
  <A11yPanel icon="tao-edit" :title="tr('applyTaoPalette: four stops make a whole theme', 'applyTaoPalette: четыре стопа — и вся тема')">
    <template #hint>{{ tr('what a theme editor, or a colour the user picked, is for', 'то, для чего нужен редактор темы или цвет, который выбрал пользователь') }}</template>

    <div class="palette-lab">
      <div class="palette-lab__side">
        <div v-for="(stop, index) in stops" :key="index" class="palette-lab__stop">
          <span class="palette-lab__index" aria-hidden="true">{{ index }}</span>
          <TaoColorInput v-model="stops[index]" :alpha="false" :eyedropper="false" :aria-label="tr(`Stop ${index}`, `Стоп ${index}`)" />
        </div>
        <div class="palette-lab__gradient" :style="{ background: gradient }" aria-hidden="true" />
        <div class="palette-lab__actions">
          <TaoButton v-if="!onPage" @click="applyToPage">{{ tr('Apply', 'Применить') }}</TaoButton>
          <TaoButton v-else variant="secondary" @click="removeFromPage">{{ tr('Remove', 'Снять') }}</TaoButton>
          <TaoButton variant="ghost" tone="neutral" icon="tao-repeat" @click="shuffle">{{ tr('Four random stops', 'Четыре случайных стопа') }}</TaoButton>
        </div>
        <div class="code-block palette-lab__code">
          <pre><code>{{ code }}</code></pre>
        </div>
      </div>

      <div class="palette-lab__main">
        <div ref="preview" class="palette-lab__preview" :data-mode="mode">
          <div class="palette-lab__row">
            <TaoButton>Accent</TaoButton>
            <TaoButton variant="secondary">Secondary</TaoButton>
            <TaoButton variant="ghost">Ghost</TaoButton>
          </div>
          <div class="palette-lab__row">
            <TaoTag tone="success" size="small">success</TaoTag>
            <TaoTag tone="warning" size="small">warning</TaoTag>
            <TaoTag tone="danger" size="small">danger</TaoTag>
            <TaoTag tone="info" size="small">info</TaoTag>
          </div>
          <TaoSparkline :values="[3, 5, 4, 7, 6, 9, 8, 12, 11, 14]" area dot :label="tr('A sample trend', 'Пример тренда')" />
        </div>

        <table v-if="ready" class="palette-lab__roles">
          <thead>
            <tr>
              <th scope="col">{{ tr('Role', 'Роль') }}</th>
              <th scope="col">{{ tr('Value', 'Значение') }}</th>
              <th scope="col">WCAG 2</th>
              <th scope="col" class="palette-lab__rating">{{ tr('Rating', 'Оценка') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.role + row.en">
              <td>
                <span class="palette-lab__chip" :style="{ background: colors[row.fg] }" aria-hidden="true" />
                {{ row.role }}
              </td>
              <td class="palette-lab__hex">{{ colors[row.fg] }}</td>
              <td class="palette-lab__pair">{{ tr(row.en, row.ru) }}</td>
              <td class="palette-lab__rating"><RatioBadge :ratio="row.ratio" :need="row.need" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="palette-lab__note">
      {{
        tr(
          'The computation is the one the build uses for the preset files, and a test keeps them equal: every palette of the kit, in both modes.',
          'Расчёт — тот же, которым собираются файлы пресетов, и тест держит их равными: каждая палитра набора, оба режима.',
        )
      }}
    </p>
  </A11yPanel>
</template>

<style scoped>
.palette-lab {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
  gap: 24px;
}

.palette-lab__side {
  display: grid;
  align-content: start;
  gap: 10px;
  min-width: 0;
}

.palette-lab__stop {
  display: flex;
  align-items: center;
  gap: 12px;
}

.palette-lab__index {
  width: 12px;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.palette-lab__gradient {
  height: 28px;
  border-radius: var(--tao-radius-full);
  box-shadow: inset 0 0 0 1px var(--tao-color-border);
}

.palette-lab__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.palette-lab__code {
  margin-top: 4px;
}

.palette-lab__main {
  display: grid;
  align-content: start;
  gap: 20px;
  min-width: 0;
}

.palette-lab__preview {
  display: grid;
  gap: 14px;
  padding: 16px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-bg);
  color: var(--tao-color-text);
}

.palette-lab__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.palette-lab__roles {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.palette-lab__roles th {
  padding: 0 8px 8px;
  text-align: left;
  color: var(--tao-color-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.palette-lab__roles td {
  padding: 6px 8px;
  border-top: 1px solid var(--tao-color-border);
}

.palette-lab__chip {
  display: inline-block;
  width: 22px;
  height: 14px;
  margin-right: 8px;
  vertical-align: -2px;
  border-radius: var(--tao-radius-sm);
  box-shadow: inset 0 0 0 1px var(--tao-color-border);
}

.palette-lab__hex,
.palette-lab__pair {
  color: var(--tao-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.palette-lab__rating {
  text-align: right;
}

.palette-lab__note {
  margin: 16px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

@container (max-width: 760px) {
  .palette-lab {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
