<script setup>
import { computed } from 'vue'
import { apcaContrast, contrastRatio } from '@1337exp/taoui'
import A11yPanel from './A11yPanel.vue'
import RatioBadge from './RatioBadge.vue'
import { useRoles } from './colors.js'
import { ALL_ROLES, PAIRS, ROLE_ROWS } from './pairs.js'
import { tr } from '../i18n.js'

defineOptions({ name: 'ContrastLive' })

// What the page reads right now: every role is resolved by the browser (the theme, the mode, a palette) and judged by
// the kit's own contrastRatio() and apcaContrast(). Change the palette in the header and the numbers follow.
// Что страница читает сейчас: каждую роль разрешает браузер (тема, режим, палитра), а судят contrastRatio() и
// apcaContrast() из набора. Смените палитру в шапке, и числа пойдут следом.
const { colors } = useRoles(null, ALL_ROLES)

const ready = computed(() => Boolean(colors.value[ROLE_ROWS[0].role]))

const roles = computed(() =>
  ROLE_ROWS.map((row) => ({
    ...row,
    hex: colors.value[row.role],
    ratio: row.on ? contrastRatio(colors.value[row.role], colors.value[row.on]) : null,
  })),
)

const pairs = computed(() =>
  PAIRS.map((pair) => {
    const fg = colors.value[pair.fg]
    const bg = colors.value[pair.bg]
    return { ...pair, fgHex: fg, bgHex: bg, ratio: contrastRatio(fg, bg), lc: Math.abs(apcaContrast(fg, bg)) }
  }),
)

const short = (role) => role.replace('--tao-color-', '')
</script>

<template>
  <A11yPanel icon="tao-eye" :title="tr('A live look: what the page reads now', 'Живой разбор: что сейчас читает страница')">
    <template #hint>{{ tr('read from the computed styles; change the palette and the numbers follow', 'значения сняты из вычисленных стилей; смени палитру, и числа пересчитаются') }}</template>

    <div v-if="ready" class="contrast-live">
      <ul class="contrast-live__roles" :aria-label="tr('Roles', 'Роли')">
        <li v-for="row in roles" :key="row.role" class="contrast-live__role">
          <span class="contrast-live__swatch" :style="{ background: row.hex }" aria-hidden="true" />
          <code class="contrast-live__name" :title="row.role">{{ short(row.role) }}</code>
          <code class="contrast-live__hex">{{ row.hex }}</code>
          <RatioBadge v-if="row.ratio !== null" :ratio="row.ratio" :need="row.need" />
          <span v-else class="contrast-live__ground">{{ tr('ground', 'фон') }}</span>
        </li>
      </ul>

      <table class="contrast-live__pairs">
        <thead>
          <tr>
            <th scope="col">{{ tr('Pair', 'Пара') }}</th>
            <th scope="col">{{ tr('As seen', 'Как видно') }}</th>
            <th scope="col">APCA Lc</th>
            <th scope="col" class="contrast-live__last">WCAG 2</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pair in pairs" :key="pair.en">
            <td>
              <span class="contrast-live__aa" :style="{ color: pair.fgHex, background: pair.bgHex }" aria-hidden="true">Aa</span>
              {{ tr(pair.en, pair.ru) }}
            </td>
            <td class="contrast-live__how">{{ short(pair.fg) }} → {{ short(pair.bg) }}</td>
            <td class="contrast-live__lc">{{ Math.round(pair.lc) }}</td>
            <td class="contrast-live__last"><RatioBadge :ratio="pair.ratio" :need="pair.need" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="contrast-live__note">
      {{
        tr(
          '4.5:1 is the promise for text, 3:1 for a fill seen on the page. APCA says which label reads better, WCAG 2 says how much is promised.',
          '4,5:1 — обещание для текста, 3:1 — для заливки, видимой на странице. APCA отвечает за то, какая подпись читается лучше, WCAG 2 — за то, сколько обещано.',
        )
      }}
    </p>
  </A11yPanel>
</template>

<style scoped>
.contrast-live {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 24px;
}

.contrast-live__roles {
  display: grid;
  align-content: start;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contrast-live__role {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 4px 12px;
  font-size: 13px;
}

.contrast-live__swatch {
  width: 28px;
  height: 28px;
  border-radius: var(--tao-radius-sm);
  box-shadow: inset 0 0 0 1px var(--tao-color-border);
}

.contrast-live__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--tao-color-text);
}

.contrast-live__hex,
.contrast-live__how,
.contrast-live__lc {
  color: var(--tao-color-text-muted);
  font-variant-numeric: tabular-nums;
}

.contrast-live__ground {
  min-width: 48px;
  text-align: center;
  color: var(--tao-color-text-muted);
  font-size: 12px;
}

.contrast-live__pairs {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.contrast-live__pairs th {
  padding: 0 8px 8px;
  text-align: left;
  color: var(--tao-color-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.contrast-live__pairs td {
  padding: 8px;
  border-top: 1px solid var(--tao-color-border);
}

/* the ratio is the last column, under the badges of the list above it */
.contrast-live__last {
  text-align: right;
}

.contrast-live__aa {
  display: inline-block;
  min-width: 28px;
  margin-right: 8px;
  padding: 2px 4px;
  border-radius: var(--tao-radius-sm);
  box-shadow: inset 0 0 0 1px var(--tao-color-border);
  text-align: center;
  font-size: 12px;
  font-weight: 700;
}

.contrast-live__note {
  margin: 16px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

@container (max-width: 760px) {
  .contrast-live {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
