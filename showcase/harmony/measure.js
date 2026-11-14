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
 * border alone. White against #f5f5f5 is 1.09, so a deliberate quiet fill passes.
 * Заливка ближе к своей поверхности, чем это (отношение WCAG 2), не видна как заливка: контрол держится одной рамкой.
 * Белое на #f5f5f5 — 1,09, так что намеренная тихая заливка проходит.
 */
export const MELT_RATIO = 1.04

/** The ladder step a colour is, by name (`null`: not one of the steps). / Какая это ступень лестницы (`null` — никакая). */
export function ladderStep(hex, resolved) {
  const found = LADDER.find(([, role]) => resolved[role] && resolved[role].toLowerCase() === String(hex).toLowerCase())
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

  return [
    { id: 'step', offenders: step, checked: stepped.length },
    { id: 'weight', offenders: weight, checked: weighted.length, house },
    { id: 'height', offenders: height, checked: tall.length },
    { id: 'fill', offenders: fill, checked: filled.length },
  ].map((promise) => ({ ...promise, ok: promise.offenders.length === 0 }))
}
