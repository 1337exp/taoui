// A colour as the eye gets it: a translucent colour laid over the one under it. (`toHex()` of the contrast section
// drops the alpha, and the kit's sunken surfaces are translucent.)
// Цвет таким, каким его видит глаз: полупрозрачный, положенный на тот, что под ним. (`toHex()` раздела о контрасте
// отбрасывает прозрачность, а вдавленные поверхности набора полупрозрачны.)

let sampler
const context = () => {
  if (!sampler) {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    sampler = canvas.getContext('2d', { willReadFrequently: true })
  }
  return sampler
}
const byte = (n) => n.toString(16).padStart(2, '0')

/** `css` laid over `under` (#rrggbb), as #rrggbb. */
export function toHexOver(css, under) {
  const ctx = context()
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = under
  ctx.fillRect(0, 0, 1, 1)
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `#${byte(r)}${byte(g)}${byte(b)}`
}
