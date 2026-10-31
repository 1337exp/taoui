// The own theme of the section: a few roles by hand, and the CSS that says them. A role made from another role
// (accent-subtle from accent) is computed where it is declared, so a theme declares it again next to the accent.
// Своя тема раздела: несколько ролей руками и CSS, который их говорит. Роль, собранная из другой (accent-subtle из accent),
// считается там, где объявлена, поэтому тема объявляет её заново рядом с accent.
import { contrastRatio } from '../../src/palette'

const BLACK = '#0d0d0d'
const WHITE = '#ffffff'

/** The label on the accent: whichever of black and white reaches the higher ratio. / Подпись на акценте: чёрная или белая, у кого отношение выше. */
export function labelOn(fill) {
  return contrastRatio(BLACK, fill) >= contrastRatio(WHITE, fill) ? BLACK : WHITE
}

/** The roles of the own theme as CSS variables: what the preview wears and what the code block shows. */
export function themeVars({ accent, bg, radius }) {
  return {
    '--tao-color-accent': accent,
    '--tao-color-accent-hover': 'color-mix(in srgb, var(--tao-color-accent) 86%, white)',
    '--tao-color-accent-active': 'color-mix(in srgb, var(--tao-color-accent) 86%, black)',
    '--tao-color-accent-subtle': 'color-mix(in srgb, var(--tao-color-accent) 8%, transparent)',
    '--tao-color-accent-subtle-hover': 'color-mix(in srgb, var(--tao-color-accent) 14%, transparent)',
    '--tao-color-accent-text': 'var(--tao-color-accent)',
    '--tao-color-on-accent': labelOn(accent),
    '--tao-color-bg': bg,
    '--tao-color-surface': bg,
    '--tao-radius-control': `${Math.max(2, Math.round(radius / 2))}px`,
    '--tao-radius-panel': `${radius}px`,
  }
}

/** The theme as a file: [data-tao-theme="mine"] { … }. */
export function themeCss(values, name = 'mine') {
  const lines = Object.entries(themeVars(values)).map(([key, value]) => `    ${key}: ${value};`)
  return `[data-tao-theme="${name}"] {\n${lines.join('\n')}\n}`
}

/** What the section promises about the colours picked: the numbers of the palettes' own promises. */
export function themeRatings({ accent, bg }) {
  const label = labelOn(accent)
  return [
    { id: 'fill', en: 'accent on the page', ru: 'акцент на странице', ratio: contrastRatio(accent, bg), need: 3 },
    { id: 'text', en: 'accent as text', ru: 'акцент как текст', ratio: contrastRatio(accent, bg), need: 4.5 },
    { id: 'label', en: 'label on the accent', ru: 'подпись на акценте', ratio: contrastRatio(label, accent), need: 4.5 },
  ]
}
