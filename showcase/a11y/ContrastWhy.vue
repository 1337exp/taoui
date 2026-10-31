<script setup>
import { computed, ref } from 'vue'
import { TaoColorInput, TaoTag, apcaContrast, contrastRatio } from '@1337exp/taoui'
import A11yPanel from './A11yPanel.vue'
import RatioBadge from './RatioBadge.vue'
import Tr from '../components/Tr.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'ContrastWhy' })

// The two questions on one colour of your choice: the label colours are the ones the palettes use.
// Два вопроса на одном цвете по вашему выбору: цвета подписи те же, что у палитр.
const WHITE = '#ffffff'
const BLACK = '#0d0d0d'

const fill = ref('#2ea85c')

const labels = computed(() => {
  const rows = [
    { name: tr('black label', 'чёрная подпись'), hex: BLACK },
    { name: tr('white label', 'белая подпись'), hex: WHITE },
  ].map((row) => ({ ...row, ratio: contrastRatio(row.hex, fill.value), lc: apcaContrast(row.hex, fill.value) }))
  const byEye = rows.reduce((best, row) => (Math.abs(row.lc) > Math.abs(best.lc) ? row : best))
  const byRatio = rows.reduce((best, row) => (row.ratio > best.ratio ? row : best))
  return { rows, byEye: byEye.hex, byRatio: byRatio.hex }
})
</script>

<template>
  <A11yPanel icon="tao-info" :title="tr('Two questions for every pair of colours', 'Два вопроса к каждой паре цветов')">
    <template #hint>{{ tr('“is it allowed” is WCAG 2, “what reads better” is APCA', '«разрешено ли» отвечает WCAG 2, «что читается лучше» — APCA') }}</template>

    <div class="contrast-why">
      <div class="contrast-why__text">
        <Tr>
          <template #en>
            <p>
              WCAG 2 takes the ratio of luminances and checks it against what an audit asks: 4.5:1 for text, 3:1 for a fill seen on
              the page. It has a known blind spot: it looks at light and dark the same way, and on mid-tone colours it overrates black.
            </p>
            <p>
              APCA (the model behind the WCAG 3 draft) knows that light text on dark and dark text on light are not symmetric, and
              that thin text needs more. It gives a lightness contrast Lc from about −108 to 106: around 75 is body text, 60 a label,
              45 a large heading.
            </p>
            <p>
              <strong>So the palettes use both: APCA chooses the polarity of a label, WCAG 2 sets the number, and the fill moves along
              lightness until that number is met.</strong>
            </p>
          </template>
          <template #ru>
            <p>
              WCAG 2 берёт отношение яркостей и проверяет его тем, что спрашивает аудит доступности: 4,5:1 для текста, 3:1 для
              заливки, видимой на странице. У него известное слепое пятно: он одинаково смотрит на светлое и тёмное, и на средних по
              яркости цветах переоценивает чёрный.
            </p>
            <p>
              APCA (модель за черновиком WCAG 3) знает, что светлый текст на тёмном и тёмный на светлом несимметричны, а тонкому
              тексту нужно больше. Она даёт Lc примерно от −108 до 106: около 75 — основной текст, 60 — подпись, 45 — крупный
              заголовок.
            </p>
            <p>
              <strong>Поэтому палитры используют обе: APCA выбирает полярность подписи, WCAG 2 задаёт число, а заливка двигается по
              яркости, пока это число не выполнится.</strong>
            </p>
          </template>
        </Tr>
      </div>

      <div class="contrast-why__try">
        <label class="contrast-why__pick">
          <span>{{ tr('Label on', 'Подпись на') }}</span>
          <TaoColorInput v-model="fill" :alpha="false" :eyedropper="false" :aria-label="tr('The fill colour', 'Цвет заливки')" />
        </label>

        <table class="contrast-why__table">
          <thead>
            <tr>
              <th scope="col">{{ tr('Label', 'Подпись') }}</th>
              <th scope="col">WCAG 2</th>
              <th scope="col">APCA Lc</th>
              <th scope="col">{{ tr('Reads better', 'Читается лучше') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in labels.rows" :key="row.hex">
              <td>
                <span class="contrast-why__aa" :style="{ color: row.hex, background: fill }" aria-hidden="true">Aa</span>
                {{ row.name }}
              </td>
              <td><RatioBadge :ratio="row.ratio" :need="4.5" /></td>
              <td class="contrast-why__lc">{{ Math.round(row.lc) }}</td>
              <td>
                <TaoTag v-if="row.hex === labels.byEye" size="small">{{ tr('by APCA', 'по APCA') }}</TaoTag>
              </td>
            </tr>
          </tbody>
        </table>

        <p class="contrast-why__verdict">
          <template v-if="labels.byEye === labels.byRatio">
            {{ tr('Here both models agree on the label.', 'Здесь обе модели сходятся на подписи.') }}
          </template>
          <template v-else>
            {{
              tr(
                'Here they disagree: the ratio prefers the other label, the eye reads this one better. On mid-tones that is the usual case.',
                'Здесь они расходятся: отношение предпочитает другую подпись, а глаз лучше читает эту. На средних тонах так бывает постоянно.',
              )
            }}
          </template>
        </p>
        <p class="contrast-why__fine">
          {{
            tr(
              'In light mode the palettes take the label APCA reads better; in dark mode the fills are light on purpose and keep a dark label. Tests hold every palette in both modes to 4.5:1. contrastRatio() and apcaContrast() are exported: measure your own colours the same way.',
              'В светлом режиме палитры берут подпись, которую APCA читает лучше; в тёмном заливки светлые нарочно и держат тёмную подпись. Тесты держат каждую палитру в обоих режимах на 4,5:1. contrastRatio() и apcaContrast() экспортированы: свои цвета можно мерить так же.',
            )
          }}
        </p>
      </div>
    </div>
  </A11yPanel>
</template>

<style scoped>
.contrast-why {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 28px;
}

.contrast-why__text p {
  margin: 0 0 12px;
  color: var(--tao-color-text);
  font-size: 14px;
  line-height: 1.55;
}

.contrast-why__text strong {
  color: var(--tao-color-text-strong);
}

.contrast-why__pick {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.contrast-why__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.contrast-why__table th {
  padding: 0 8px 8px;
  text-align: left;
  color: var(--tao-color-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.contrast-why__table td {
  padding: 8px;
  border-top: 1px solid var(--tao-color-border);
}

.contrast-why__aa {
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

.contrast-why__lc {
  font-variant-numeric: tabular-nums;
}

.contrast-why__verdict {
  margin: 12px 0 0;
  color: var(--tao-color-text-strong);
  font-size: 13px;
}

.contrast-why__fine {
  margin: 8px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
  line-height: 1.5;
}

@container (max-width: 760px) {
  .contrast-why {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
