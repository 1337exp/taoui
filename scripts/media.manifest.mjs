// What the media pipeline captures. Edit this file, run `npm run media`.
//
// Every target is a CSS selector inside the showcase. Names become file names, so keep them
// stable: README files and the website link to them.

/** Page language for every capture. Switch to 'ru' to build a Russian set under another folder. */
export const LANG = 'en'

/** Theme variants for screenshots. */
export const THEMES = ['dark', 'light']

/**
 * Still images.
 *   selector  element to crop to (omit: the whole viewport)
 *   pad       extra pixels around the element [top, right, bottom, left]
 *   before    optional async (page, h) => void: open a popup, type something...
 */
export const shots = [
  { name: 'overview', before: (page, h) => h.scrollTo(page, '#card .tao-card') },
  { name: 'surfaces', selector: '#surface .surface-stage', pad: [8, 8, 8, 8] },
  { name: 'color-picker', selector: '#color .tao-color-picker', pad: [16, 16, 16, 16] },
  { name: 'table', selector: '#table .tao-table-wrap', pad: [8, 8, 8, 8] },
  { name: 'cards', selector: '#card .product-cards', pad: [8, 8, 8, 8] },
  { name: 'forms', selector: '#select .demo-stack', pad: [12, 12, 12, 12] },
  { name: 'split', selector: '#split .split-demo', pad: [8, 8, 8, 8] },
  { name: 'carousel', selector: '#carousel .tao-carousel', pad: [8, 8, 8, 8] },
  {
    name: 'toasts',
    before: async (page, h) => {
      await h.scrollTo(page, '#toast')
      for (const label of ['success', 'danger', 'warning']) {
        await page.locator('#toast .button-row button', { hasText: new RegExp(`^${label}$`) }).first().click()
        await page.waitForTimeout(250)
      }
      await page.waitForTimeout(500)
    },
  },
]

/**
 * Short loops for the website and the README (mp4 + animated WebP + a poster frame).
 *   crop      selector the video is cropped to ('viewport' keeps the whole 1280x720 frame;
 *             'all:<selector>' covers every match as one rectangle)
 *   pad       as in shots
 *   steps     async (page, h) => void: the interaction, recorded
 * Keep them under ~8 seconds: they are a taste, not a tutorial.
 */
export const clips = [
  {
    name: 'color-picker',
    crop: '#color .tao-color-picker',
    pad: [12, 12, 0, 12],
    prepare: (page, h) => h.scrollTo(page, '#color .tao-color-picker'),
    steps: async (page, h) => {
      const area = page.locator('#color .tao-color-picker__area').first()
      const hue = page.locator('#color .tao-color-picker__hue').first()
      const box = await h.box(area)
      const hueBox = await h.box(hue)
      await h.drag(page, [box.x + box.width * 0.2, box.y + box.height * 0.6], [box.x + box.width * 0.85, box.y + box.height * 0.15])
      await h.drag(page, [hueBox.x + hueBox.width * 0.1, hueBox.y + hueBox.height / 2], [hueBox.x + hueBox.width * 0.7, hueBox.y + hueBox.height / 2])
      await h.drag(page, [box.x + box.width * 0.85, box.y + box.height * 0.15], [box.x + box.width * 0.4, box.y + box.height * 0.5])
      for (const mode of ['RGB', 'HSL', 'HEX']) {
        await page.locator('#color .tao-color-picker__modes').first().getByText(mode, { exact: true }).click()
        await page.waitForTimeout(600)
      }
    },
  },
  {
    name: 'slider',
    // the three sliders with marks, as one rectangle
    crop: 'all:#slider .tao-slider--has-marks.demo-wide',
    pad: [28, 12, 12, 12],
    prepare: (page, h) => h.scrollTo(page, '#slider .tao-slider--has-marks.demo-wide'),
    steps: async (page, h) => {
      const thumbs = page.locator('#slider [role="slider"]')
      for (const index of [3, 4, 5]) {
        const b = await h.box(thumbs.nth(index))
        const rail = await h.box(thumbs.nth(index).locator('xpath=ancestor::*[contains(@class,"tao-slider ")][1]'))
        const cx = b.x + b.width / 2
        const cy = b.y + b.height / 2
        await h.drag(page, [cx, cy], [rail.x + rail.width * 0.85, cy])
        await h.drag(page, [rail.x + rail.width * 0.85, cy], [rail.x + rail.width * 0.4, cy])
      }
      await page.waitForTimeout(400)
    },
  },
  {
    name: 'split',
    crop: '#split .split-demo',
    pad: [8, 8, 8, 8],
    prepare: (page, h) => h.scrollTo(page, '#split .split-demo'),
    steps: async (page, h) => {
      const handle = page.locator('#split .split-demo .tao-split__handle').first()
      const b = await h.box(handle)
      const cx = b.x + b.width / 2
      const cy = b.y + b.height / 2
      await h.drag(page, [cx, cy], [cx + 160, cy])
      await h.drag(page, [cx + 160, cy], [cx - 200, cy])
      await h.drag(page, [cx - 200, cy], [cx, cy])
    },
  },
  {
    name: 'toasts',
    crop: 'viewport',
    prepare: (page, h) => h.scrollTo(page, '#toast'),
    steps: async (page) => {
      for (const label of ['success', 'danger', 'warning', 'info']) {
        await page.locator('#toast .button-row button', { hasText: new RegExp(`^${label}$`) }).first().click()
        await page.waitForTimeout(700)
      }
      await page.waitForTimeout(1500)
    },
  },
  {
    name: 'themes',
    crop: 'viewport',
    prepare: (page, h) => h.scrollTo(page, '#card'),
    steps: async (page, h) => {
      await page.waitForTimeout(600)
      for (const theme of ['light', 'dark', 'light', 'dark']) {
        await h.setTheme(page, theme)
        await page.waitForTimeout(900)
      }
    },
  },
]
