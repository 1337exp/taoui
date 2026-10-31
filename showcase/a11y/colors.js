import { onBeforeUnmount, onMounted, ref } from 'vue'

// Colour helpers for the "Contrast and keyboard" section: the browser resolves a role to a colour, the kit's own
// contrastRatio() / apcaContrast() judge it, so what the page shows is what the page really has.
// Помощники раздела «Контраст и клавиатура»: роль в цвет превращает браузер, а судят её contrastRatio() и
// apcaContrast() из набора, поэтому страница показывает то, что у неё есть на самом деле.

let sampler
const sampleContext = () => {
  if (!sampler) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    sampler = canvas.getContext('2d', { willReadFrequently: true })
  }
  return sampler
}
const byte = (n) => n.toString(16).padStart(2, '0')

/** Any CSS colour the browser understands (rgb(), a color-mix() result, color(srgb …)) as #rrggbb. */
export function toHex(css) {
  const ctx = sampleContext()
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = '#000'
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${byte(r)}${byte(g)}${byte(b)}`
}

/** The colour a role has at `host` right now, as #rrggbb. */
export function resolveRole(host, name) {
  const probe = document.createElement('span')
  probe.style.display = 'none'
  probe.style.color = `var(${name})`
  host.appendChild(probe)
  const value = getComputedStyle(probe).color
  probe.remove()
  return toHex(value)
}

const ROOT_ATTRIBUTES = ['data-tao-theme', 'data-tao-mode', 'style', 'class']

/**
 * The resolved colours of `names` at `hostRef` (the page when it is empty), recomputed when the theme, the mode or an
 * inline palette on <html> changes. `refresh()` is for a change the observer does not see (a palette put on `host`).
 * Цвета ролей `names` у `hostRef` (у страницы, если он пуст); пересчитываются при смене темы, режима или палитры на
 * <html>. `refresh()` — для перемены, которую наблюдатель не видит (палитра, положенная на `host`).
 */
export function useRoles(hostRef, names) {
  const colors = ref({})
  let observer
  function refresh() {
    const host = hostRef?.value ?? document.documentElement
    const next = {}
    for (const name of names) next[name] = resolveRole(host, name)
    colors.value = next
  }
  onMounted(() => {
    refresh()
    observer = new MutationObserver(refresh)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ROOT_ATTRIBUTES })
  })
  onBeforeUnmount(() => observer?.disconnect())
  return { colors, refresh }
}

/** 'dark' or 'light': the mode the showcase is in now. / Режим, в котором сейчас витрина. */
export function useRootMode() {
  const mode = ref('dark')
  let observer
  const read = () => {
    mode.value = document.documentElement.getAttribute('data-tao-mode') === 'light' ? 'light' : 'dark'
  }
  onMounted(() => {
    read()
    observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tao-mode'] })
  })
  onBeforeUnmount(() => observer?.disconnect())
  return mode
}

/** h 0–360, s and l 0–100 → #rrggbb. */
export function hslToHex(h, s, l) {
  const sat = s / 100
  const light = l / 100
  const a = sat * Math.min(light, 1 - light)
  const channel = (n) => {
    const k = (n + h / 30) % 12
    return Math.round(255 * (light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
  }
  return `#${byte(channel(0))}${byte(channel(8))}${byte(channel(4))}`
}

/** Four stops for a palette of your own, dark to light, one hue with a small drift. / Четыре стопа, от тёмного к светлому. */
export function randomStops() {
  const hue = Math.random() * 360
  return [
    [10, 55],
    [30, 85],
    [52, 65],
    [86, 75],
  ].map(([l, s]) => hslToHex((hue + (Math.random() * 30 - 15) + 360) % 360, s, l))
}
