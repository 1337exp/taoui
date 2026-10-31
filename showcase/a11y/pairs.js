// Which colour is read on which, and how much it must reach. The numbers are the promises of the palettes
// (tests/palette.test.ts): 4.5:1 for text, 3:1 for a fill seen on the page.
// Какой цвет читается на каком и сколько он должен набрать. Числа — обещания палитр (tests/palette.test.ts).
import { MIN_STATUS_DISTANCE } from '../../src/palette'

export const TEXT_RATIO = 4.5
export const FILL_RATIO = 3

const R = (name) => `--tao-color-${name}`

/** The left list: a role, what it is seen on, what it must reach (no `on`: a ground, nothing to reach). */
export const ROLE_ROWS = [
  { role: R('accent'), on: R('bg'), need: FILL_RATIO },
  { role: R('accent-text'), on: R('bg'), need: TEXT_RATIO },
  { role: R('on-accent'), on: R('accent'), need: TEXT_RATIO },
  { role: R('bg') },
  { role: R('surface-raised') },
  { role: R('text'), on: R('bg'), need: TEXT_RATIO },
  { role: R('text-strong'), on: R('bg'), need: TEXT_RATIO },
  { role: R('text-muted'), on: R('surface-raised'), need: TEXT_RATIO },
  { role: R('success'), on: R('bg'), need: FILL_RATIO },
  { role: R('warning'), on: R('bg'), need: FILL_RATIO },
  { role: R('danger'), on: R('bg'), need: FILL_RATIO },
  { role: R('info'), on: R('bg'), need: FILL_RATIO },
]

/** The right table: a pair read as text, or as a label on a fill. / Правая таблица: пара как текст или подпись на заливке. */
export const PAIRS = [
  { en: 'text on the page', ru: 'текст на странице', fg: R('text'), bg: R('bg'), need: TEXT_RATIO },
  { en: 'strong text', ru: 'сильный текст', fg: R('text-strong'), bg: R('bg'), need: TEXT_RATIO },
  { en: 'caption on a card', ru: 'подпись на карточке', fg: R('text-muted'), bg: R('surface-raised'), need: TEXT_RATIO },
  { en: 'accent as text', ru: 'акцент как текст', fg: R('accent-text'), bg: R('bg'), need: TEXT_RATIO },
  { en: 'label on the accent', ru: 'подпись на акценте', fg: R('on-accent'), bg: R('accent'), need: TEXT_RATIO },
  { en: 'accent fill on the page', ru: 'заливка акцента на странице', fg: R('accent'), bg: R('bg'), need: FILL_RATIO },
  { en: 'danger as text', ru: 'danger как текст', fg: R('danger-text'), bg: R('bg'), need: TEXT_RATIO },
  { en: 'label on success', ru: 'подпись на success', fg: R('on-success'), bg: R('success'), need: TEXT_RATIO },
]

/** The palette lab: the accent and the four statuses, each as a fill seen on the page and with its label. */
export const LAB_ROWS = [
  { role: 'accent', fg: R('accent'), bg: R('bg'), need: FILL_RATIO, en: 'accent → page', ru: 'accent → страница' },
  { role: 'on-accent', fg: R('on-accent'), bg: R('accent'), need: TEXT_RATIO, en: 'label → accent', ru: 'подпись → accent' },
  { role: 'accent-text', fg: R('accent-text'), bg: R('bg'), need: TEXT_RATIO, en: 'accent-text → page', ru: 'accent-text → страница' },
  ...['danger', 'warning', 'success', 'info'].flatMap((name) => [
    { role: name, fg: R(name), bg: R('bg'), need: FILL_RATIO, en: `${name} → page`, ru: `${name} → страница` },
    { role: `on-${name}`, fg: R(`on-${name}`), bg: R(name), need: TEXT_RATIO, en: `label → ${name}`, ru: `подпись → ${name}` },
  ]),
]

/** Every role the section reads, once. / Каждая роль, которую читает раздел, по разу. */
export const ALL_ROLES = [
  ...new Set([
    ...ROLE_ROWS.flatMap((row) => [row.role, row.on]),
    ...PAIRS.flatMap((pair) => [pair.fg, pair.bg]),
    ...LAB_ROWS.flatMap((row) => [row.fg, row.bg]),
  ]),
].filter(Boolean)

/** The numbers the palettes promise, for the strip "what is promised in numbers". */
export const PROMISES = [
  { value: '4.5 : 1', en: 'text on the page and on a card', ru: 'текст на странице и на карточке' },
  { value: '3 : 1', en: 'a fill seen on the page', ru: 'заливка, видимая на странице' },
  { value: '4.5 : 1', en: 'the label on a fill', ru: 'подпись на заливке' },
  { value: `≥ ${MIN_STATUS_DISTANCE}`, en: 'the distance of a status from the accent in OKLab', ru: 'расстояние статуса от акцента в OKLab' },
]
