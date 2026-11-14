// The "Controls side by side" bench: what is measured and how it is judged. The page measures its own controls with the
// browser (computed styles), this file only decides: it has no DOM, so a test can hold it.
// Стенд «Контролы рядом»: что измеряется и как судится. Страница измеряет свои контролы браузером (вычисленные стили),
// здесь только решения: DOM нет, поэтому их держит тест.

/** The steps of the text ladder and the roles beside it, as [name, role]. / Ступени лестницы текста и соседние роли. */
export const LADDER = [
  ['strong', '--tao-color-text-strong'],
  ['text', '--tao-color-text'],
  ['subtle', '--tao-color-text-subtle'],
  ['muted', '--tao-color-text-muted'],
  ['disabled', '--tao-color-text-disabled'],
  ['accent', '--tao-color-accent'],
  ['accent-text', '--tao-color-accent-text'],
  ['on-accent', '--tao-color-on-accent'],
]

export const LADDER_ROLES = LADDER.map(([, role]) => role)

/**
 * A fill that is closer to its surface than this (a WCAG 2 ratio) is not seen as a fill: the control is held by its
 * border alone. White against #f5f5f5 is 1.09 and the dark layers are 1.04 to 1.06 apart, so a deliberate quiet fill passes.
 * Заливка ближе к своей поверхности, чем это (отношение WCAG 2), не видна как заливка: контрол держится одной рамкой.
 * Белое на #f5f5f5 — 1,09, так что намеренная тихая заливка проходит.
 */
export const MELT_RATIO = 1.03

/** WCAG 2 for text of this size: the promise of the kit (the contrast section of the Guide). / Обещание набора для текста. */
export const TEXT_RATIO = 4.5

/** Brighter is a smaller rank: a hover may keep the step or go up, never down. / Ярче — меньший ранг: hover не опускает ступень. */
const RANK = { strong: 0, text: 1, subtle: 2, muted: 3, disabled: 4 }

/**
 * What is wrong with a hover, or `null`. The text must stay readable on the hover fill, and on a ladder it goes one step up
 * or stays: a hover that turns the text into a colour from no step (a stray link colour) or makes it dimmer is wrong.
 * Что не так с hover, или `null`. Текст читается на заливке hover и по лестнице идёт на ступень вверх или остаётся:
 * hover, красящий текст в цвет вне лестницы (чужой цвет ссылки) или тусклее, — ошибка.
 */
export function hoverProblem(rest, hover) {
  if (hover.ratio < TEXT_RATIO) return `${hover.ratio.toFixed(2)}:1`
  if (rest.step in RANK) {
    if (!(hover.step in RANK)) return `${rest.step} → ${hover.step ?? 'other'}`
    if (RANK[hover.step] > RANK[rest.step]) return `${rest.step} → ${hover.step}`
  }
  return null
}

/**
 * The ladder step a colour is, by name (`null`: not one of the steps). Two roles may be one colour (the accent and the accent
 * text in the dark theme): `prefer` is the step the control is expected to be, and wins when it is one of them.
 * Какая это ступень лестницы (`null` — никакая). Две роли могут быть одним цветом (акцент и акцентный текст в тёмной теме):
 * `prefer` — ожидаемая ступень контрола, она выигрывает, если подходит.
 */
export function ladderStep(hex, resolved, prefer) {
  const same = (role) => resolved[role] && resolved[role].toLowerCase() === String(hex).toLowerCase()
  const wanted = LADDER.find(([name]) => name === prefer)
  if (wanted && same(wanted[1])) return wanted[0]
  const found = LADDER.find(([, role]) => same(role))
  return found ? found[0] : null
}

const mostCommon = (values) => {
  const counts = new Map()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  let best = null
  for (const [value, count] of counts) if (best === null || count > counts.get(best)) best = value
  return best
}

/**
 * The four promises of a row of controls, from what was measured. A row item is
 * `{ id, expect: { step, weight, height }, step, weight, height, wanted, fill }`: `fill` is the WCAG ratio of its fill to
 * its surface (`null` when it has no fill of its own), `wanted` the control height of the size.
 * Четыре обещания ряда контролов по замерам.
 */
export function judge(items) {
  const offenders = (list, detail) => list.map((item) => ({ id: item.id, detail: detail(item) }))

  const stepped = items.filter((item) => item.expect.step)
  const step = offenders(
    stepped.filter((item) => item.step !== item.expect.step),
    (item) => `${item.step ?? '?'} ≠ ${item.expect.step}`,
  )

  const weighted = items.filter((item) => item.expect.weight && item.weight != null)
  const house = mostCommon(weighted.map((item) => item.weight))
  const weight = offenders(
    weighted.filter((item) => item.weight !== house),
    (item) => `${item.weight} ≠ ${house}`,
  )

  const tall = items.filter((item) => item.expect.height && item.height != null)
  const height = offenders(
    tall.filter((item) => Math.abs(item.height - item.wanted) > 1),
    (item) => `${Math.round(item.height)} ≠ ${Math.round(item.wanted)}`,
  )

  const filled = items.filter((item) => item.fill != null)
  const fill = offenders(
    filled.filter((item) => item.fill < MELT_RATIO),
    (item) => `${item.fill.toFixed(2)}:1`,
  )

  const read = offenders(
    items.filter((item) => item.ratio != null && item.expect.step !== 'disabled' && item.ratio < TEXT_RATIO),
    (item) => `${item.ratio.toFixed(2)}:1`,
  )
  const hovered = items.filter((item) => item.hover != null)
  const hover = offenders(
    hovered.filter((item) => item.hover.problem),
    (item) => item.hover.problem,
  )

  return [
    { id: 'step', offenders: step, checked: stepped.length },
    { id: 'read', offenders: read, checked: items.filter((item) => item.ratio != null).length },
    { id: 'hover', offenders: hover, checked: hovered.length },
    { id: 'weight', offenders: weight, checked: weighted.length, house },
    { id: 'height', offenders: height, checked: tall.length },
    { id: 'fill', offenders: fill, checked: filled.length },
  ].map((promise) => ({ ...promise, ok: promise.offenders.length === 0 }))
}
