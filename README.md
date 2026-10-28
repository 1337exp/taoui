<h1 align="center">Tao UI</h1>

<p align="center">
  <b>A Vue 3 component library driven by design tokens.</b><br>
  Change a handful of CSS variables and the whole kit follows.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@1337exp/taoui"><img src="https://img.shields.io/npm/v/@1337exp/taoui?color=cb3837&logo=npm" alt="npm"></a>
  <a href="https://github.com/1337exp/taoui/actions/workflows/ci.yml"><img src="https://github.com/1337exp/taoui/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/1337exp/taoui/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@1337exp/taoui" alt="license"></a>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <b>English</b> · <a href="https://github.com/1337exp/taoui/blob/master/README.ru.md">Русский</a> ·
  <a href="#install">Install</a> ·
  <a href="#showcase">Showcase</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/screenshots/overview-dark.webp" alt="Tao UI components in the dark theme" width="860">
</p>

## Why Tao UI

- **Tokens first.** Colours, radii, spacing and type come from CSS variables in three layers (primitives, semantic, theme). Re-theme the kit, or one panel of it, without touching a component.
- **One scale, one API.** `small` / `medium` / `large` everywhere, the same `v-model` / `change` / `*Text` / `*Label` rules for every field, tones instead of ad-hoc colours.
- **Dark and light** out of the box, plus surfaces (`flat` / `grain` / `glass`) for HUDs and landing pages.
- **Built-in languages.** Placeholders, dates and aria labels in English and Russian, switchable at runtime without a reload.
- **Nuxt and plain Vue.** `TaoLink` picks `NuxtLink`, `RouterLink` or `<a>` by itself. Fully typed, ES and CJS builds.
- **Keyboard friendly.** Focus traps, `role` / `aria-*` on the controls.

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/color-picker.webp" alt="TaoColorPicker: square, hue strip, HEX / RGB / HSL modes"><br><sub><b>TaoColorPicker</b> — HEX / RGB / HSL, eyedropper, <code>v-model</code> is a hex string</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/themes.webp" alt="Dark and light themes switching"><br><sub><b>Themes</b> — one attribute, every component follows</sub></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/slider.webp" alt="TaoRangeSlider with marks"><br><sub><b>TaoSlider / TaoRangeSlider</b> — marks, discrete scales, vertical</sub></td>
    <td><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/screenshots/surfaces-dark.webp" alt="flat, grain and glass surfaces"><br><sub><b>Surfaces</b> — flat, grain, glass</sub></td>
  </tr>
</table>

## Components

### Basics

- **TaoBlock** — container with padding and radius
- **TaoButton** — `variant`: `primary` / `secondary` / `ghost` / `text`; `tone` colours any of them (accent by default, neutral, success, danger, warning, info). `v-model:pressed` makes it a toggle (`aria-pressed`)
- **TaoCard** — card with media / header / title / footer slots and a `#corner` (a tag, a menu button). `#media` can be a photo or `TaoCarousel`; `closable` adds a cross and the `close` event. `flush` is a tile (no padding/shadow, fills the cell); `#overlay` is a scrim on the media; `stripe="top | left | bottom"` with `stripeTone` (a tone or the palette `gradient`) draws a coloured stripe the corners clip
- **TaoCopy** — clipboard icon. After a click, a “Copied” tooltip; if the trigger is gone, the tooltip is too
- **TaoMarquee** — one line that never wraps: when it does not fit it runs round with fading edges and a pause at the start of every round, when it fits it stands still. Stops on hover, on focus and on a tap (WCAG 2.2.2); wraps with «reduce motion»; a screen reader reads it once. `text` or inline content in the slot, `speed`, `gap`, `fade` (the left fade takes that much room left of the text: give the parent the padding), `paused`
- **TaoInput** — text field with v-model, validation, and `#prefix` / `#suffix` slots (icon or text inside the frame)
- **TaoInputGroup** — outer glue: `#before` | field | `#after` (protocol, unit, button)
- **TaoModal** — modal with animation and slots
- **TaoDrawer** — side panel (filters, settings). Esc, backdrop click, focus trap — same as the modal
- **TaoSpoiler** — disclosure. `v-model` and `aria-expanded`. Neighbours do not close each other
- **TaoSpoilerGroup** — accordion: `v-model` is the open panel key (`null` = all closed); spoilers take `name`. Without `v-model` the group keeps that key itself
- **TaoTabs** — tabbed sections
- **TaoNav** — navigation between the sections of an app: one list of items (`icon`, `href`, `badge`), three looks. `layout="auto"` picks by the width of TaoNav itself (container queries, no JS): a bottom bar below 600px (more than five items: «More» with a menu), a rail with icons below 840px, a side panel with labels from 840px. With the page in its slot it lays the page out: the bar sticks to the bottom (safe area kept), the side list to the top. `floating` lifts the bar into a detached pill with a shadow (the rail and the side panel stay). The `#action` slot is the screen's main action and moves with the navigation: round above the bar at the end side, at the top of the rail, extended with its text at the top of the side panel. `select(id, event)` lets a router take over a link
- **TaoTooltip** — hover hint. `placement`: `top` / `bottom` / `left` / `right`, each with `-start` / `-end`; flips at the viewport edge
- **TaoPopover** — click panel with any slot content, Esc and outside click; `placement` as Tooltip. Not a tooltip, not an action menu

### Layout

- **TaoContainer** — max-width (wide / slim / ultra-slim) and centering
- **TaoFlex** — flexbox wrapper: justify / align / direction / wrap / gap
- **TaoSpace** — even gap between children
- **TaoGrid** / **TaoGridItem** — tiles: `min` is a catalog (auto-fill), `cols` is a bento. An adaptive bento takes values per width class of the grid itself (compact < 600px, medium < 840px, expanded): `:cols="{ compact: 3, expanded: 6 }"`, `:col="{ compact: 'full', expanded: 4 }"`, `:order="{ compact: 9 }"` — on a phone the big blocks take the row, small tiles stay three in a row, a side block goes down. A plain number keeps one column on a phone. `rowHeight` fixes the row height, as a mosaic wants. Not masonry
- **TaoDivider** — `solid` (plain border) / `dashed` / `colored` (accent) / `gap`. Optional `text` sits in the middle of any of them; `fade` softens the line ends; `size` is for `gap` (small / medium / large)
- **TaoSplit** — two panes and a gutter. `row` / `column` like Flex. `v-model` is the start size in `%` or `px`; `resizable="false"` locks the gutter. Not Divider.
- **TaoFieldset** — grouped frame: `legend` sits on the top border, `align` is start / center / end
- **TaoAnimatedBorder** — animated border wrapper: the rainbow, the colours of a `tone` (follows the theme) or your own `colors`; a still gradient with `prefers-reduced-motion`

### Forms

- **TaoCheckbox** — checkbox with v-model, pre/post slots, and `indeterminate`
- **TaoChecklist** — checkboxes with one model (the checked values): `select-all` with a mixed state, a `counter` «3 of 5», `strike` for a to-do list (a look only, the checkbox tells the state), `description` per item. A fieldset: in a `TaoFormField` the group takes the label and the error
- **TaoSwitch** — boolean toggle (`role="switch"`)
- **TaoRadio** / **TaoRadioGroup** — classic radios: longer labels, can stack vertically
- **TaoSegmented** / **TaoSegmentedOption** — compact exclusive choice among 2–5 short options. Not tabs
- **TaoSelect** — dropdown with keyboard, same chrome as Input. `size` (`small` / `medium` / `large`, same scale as Button). Clear via “Clear” in the list or Delete; `clearable="false"` turns clearing off, `#clear` replaces the row content
- **TaoCombobox** — Select with a field: type to filter, `allow-create` writes a custom value into `v-model`, `create` lets the parent append the list. Takes the same `size`, `clearable` and `#clear` as `TaoSelect`
- **TaoDate** — a single day: `YYYY-MM-DD`, no time, no timezone. Calendar popup like Select
- **TaoDateRange** — a period: `v-model` is `{ start, end }` or `null`. First click is start, second is end (they swap if end is earlier). An incomplete pick is not written to the model
- **TaoCalendar** — the month calendar itself, inline (no popup): `mode="single"` (`YYYY-MM-DD`) or `"range"` (`{ start, end }`), `min` / `max`, arrows / PageUp / PageDown / Home / End. `TaoDate` and `TaoDateRange` are a field with this calendar in a popup
- **TaoFormField** — shared label / hint / error for form controls
- **TaoInputNumber** — number with min/max/step and ± on the right. Empty value is `null`. `@commit` fires once when an edit is finished (blur, Enter, ±, arrow), unlike `v-model`, which updates on every keystroke
- **TaoQuantity** — cart quantity: `− | field | +`, integers, stock; minus at the minimum can remove the row
- **TaoTextarea** — autosizing multiline. `maxlength` caps input, `count` shows “entered / max”. `variant`: `bar` (default) / `outline` (frame like Input) / `filled` / `plain`; `readonly`; `align`; `blurOnEnter`
- **TaoPinCode** — N cells. By default a click clears the cell and everything to the right (`clear-on="focus"`); `clear-on="input"` replaces the digit only when typing. `format="#-##-##"` draws visual separators (not part of the value; a paste in that shape or as a clean code is split into cells). The last cell blurs and emits `complete`; `status="success | error"` (set after `complete`) glows or shakes the cells and says it to a screen reader
- **TaoSlider** / **TaoRangeSlider** — one thumb (`v-model` is a number) or two (`[from, to]`, `minGap`). Mouse, touch, arrows. `marks` (ticks, numbers, `{ value, label }`), `discrete` for stepped scales, `vertical`, `flat`, `format`; `variant="thin"` is a thin track for seek / volume
- **TaoColorPicker** — saturation / brightness square, hue and opacity strips, swatches, eyedropper (where the browser has `EyeDropper`), HEX / RGB / HSL input modes. `v-model` is a hex string; `colorModel()` adapts your own colour storage
- **TaoColorInput** — a field with a swatch and the hex text; the picker opens in a popover
- **TaoFileDrop** — drop zone (drag & drop + click). File names listed under the zone, `v-model` is `File[]`. Clearing the whole batch is the parent’s job (`clear-request`)

### Data display

- **TaoTable** — simple table: columns, empty, loading, sort via `v-model:sort`. `head` tints the header, `lines` draws row rules (both on by default). `striped` starts on the first row; `striped="even"` starts on the second. Not a datagrid.
- **TaoSparkline** / **TaoMeter** / **TaoDonut** — small charts for a card or a line of text: a trend (`values` with `null` gaps, `area`, `dot`), a measured value in a range (`role="meter"`, coloured by `low` / `high` / `optimum` as the HTML `<meter>`), a share of a whole (`segments`, or one `value` of `max`, `legend`, a centre slot). The series colours are the roles `--tao-color-chart-1…6` (the first is the accent, so palettes recolour them). For axes and tooltips use a chart library: `taoChartTheme()` gives it the theme colours as `rgb()`, `watchTaoChartTheme(apply)` re-applies them on a theme or palette change
- **TaoPagination** — pages with ellipsis. Clicking “…” jumps `jump` pages (5 by default)
- **TaoEmpty** — empty list, no results, no access
- **TaoList** / **TaoListItem** — list row: icon, title, caption, hover action. Not Select, not a table
- **TaoTree** — files or objects as a tree: `v-model:expanded`, selection `none | single | multiple` (`v-model:selected`), checkboxes with mixed parents (`checkable`, `v-model:checked`), lazy children (`hasChildren` + `load`). ARIA tree: one tab stop, arrows, `→` / `←` in and out, Home / End, `*`, type-ahead. Slots `#icon`, `#label`, `#actions`; rows on the control tokens (size and density)
- **TaoStages** — stage list: `wait` / `work` / `ok` / `bad`. Not a linear stepper
- **TaoTimeline** — a vertical feed of events: order steps, releases, a log. `active` fills the line up to the current event (`aria-current="step"`), without it the feed is a log of the past; `tone` and `icon` per marker, `#marker` / `#title` / `#content` slots; `align="alternate"` puts events on both sides and folds into one below 480px of its own width
- **TaoSkeleton** — loading placeholder (text / title / circle / rect)
- **TaoCounter** — flipping digits (not an input)
- **TaoCarousel** — strip: full slide with `autoplay`, card with `peek`, row with `per-view`. Arrows via `controls` or `#prev` / `#next`; marks under the strip via `indicator` (`dots`, `bars` or `progress`). With `autoplay` the current mark fills over the interval and the slide changes when it is full; hover, keyboard focus, touch, a hidden tab and the pause button stop it, `prefers-reduced-motion` turns it off
- **TaoAvatar** — photo or initials, sizes `small` / `medium` / `large`. Status `dot` and `count`
- **TaoTag** — badge with tones. `#prefix` (avatar), `closable` dismisses the chip, `flat` drops the border
- **TaoAlert** — inline page/form banner (success / error / warning / info); `collapsible` folds the body under the title (find-in-page still finds it)
- **TaoProgress** — static bar (`progress` in %). Percent centered on top, or `showPercentage="right"`; `#left` / `#right` slots are captions, then the percent sits in parentheses on the right. `false` hides it. Width is `minWidth` / `maxWidth`, not the value domain
- **TaoScrubber** — play / pause, a slider over time with event marks, a “time / length” label. Does not advance time by itself: drive `v-model` with your own clock
- **TaoLoader** — four-dot spinner
- **TaoImage** — `<img>` wrapper: fade-in and placeholder. `lazy` turns on native `loading="lazy"`
- **TaoIcon** — SVG icons (29 built in, your own via `registerTaoIcons`) or an icon font (see Icons below)

### Navigation

- **TaoLink** — `<NuxtLink>` in Nuxt, `<RouterLink>` with vue-router, otherwise a plain `<a>` — no extra setup
- **TaoBreadcrumb** — crumbs: the last item is the current page
- **TaoDropdownMenu** / **TaoMenu** — a menu from a plain data tree `items`: submenus, checkboxes, radios, separators, group labels, shortcuts to show, disabled items. Arrows, Home / End, type-ahead, `→` / `←` for submenus, Esc closes the top level first. `TaoMenu` is the panel itself, for your own shells (a menu bar, a context menu); flips at the viewport edge
- **TaoMenubar** / **TaoContextMenu** — the menu bar of an editor and the menu on the right click, on `TaoMenu`. The bar is one tab stop (`role="menubar"`): `←` / `→` walk it, `↓` / Enter open, with a menu open `←` / `→` and the pointer move to the neighbour menu; an entry without `items` is a plain action. The context menu opens at the pointer (or at the element for the Menu key / Shift+F10) and wraps its content without a box of its own
- **TaoToolbar** / **TaoToolbarGroup** / **TaoToolbarSeparator** — a bar of tools (`role="toolbar"`): one tab stop, `←` / `→` (or `↑` / `↓` when `orientation="vertical"`) walk the items, Home / End; inside a `TaoSegmented` the arrows pick the option and go on from its edge. Groups are split by a thin line across the bar; `inset` puts a sunken pill behind a group. Toggles are `TaoButton` with `v-model:pressed`
- **TaoScrollTop** — floating “back to top”: `solid` / `ghost` / `text` looks, `side`, a mouse-hover `label`. Appears on reverse scroll after `boundary`

### Feedback

- **toast()** — fluent toasts: `toast().success().message('Saved')`
- **confirm()** — overlay question: the same fluent API plus `await`. Not a toast — it waits for an answer and does not dismiss itself.
- **TaoToastViewport** / **TaoConfirmHost** — hosts; if they are missing from the tree, the first call mounts them on `body`

## Conventions

Visual tones: `success` | `danger` | `warning` | `info` | `neutral` (type `TaoTone`), always the `tone` prop: Button, Alert, Tag (`toast.danger()` for toasts). The accent is a tone too and the default one. A tone is a context class like a size: `.tao-tone-danger` on any element sets `--tao-tone`, `--tao-tone-on`, `--tao-tone-text`, … (see `styles/tone.css`). Unlike a size it does **not** inherit, so a button inside a red alert stays an accent button.
Stages describe a process, not a tone: `wait` / `work` / `ok` / `bad` (`danger` is accepted as `bad`).

Control sizes: `small` | `medium` | `large` (type `TaoSize`). One scale for Button, Input, InputNumber, Quantity, Textarea, Select, Combobox, Date, DateRange, Segmented, InputGroup and FormField — controls of one size line up in a row. Checkbox, Radio / RadioGroup and Switch scale the indicator (14 / 18 / 22px) and the label; Tag scales its height (18 / 20 / 24px); Tabs, Pagination buttons and List rows take the Button height; Table scales cell padding (`size="small"` for the dense one); FileDrop scales the zone and file rows; Slider scales the track and thumb.
Without `size` a control takes the size of its ancestors, `medium` at the root. Set it for a whole block with the class `tao-size-small` / `-medium` / `-large` on any element, or with `size` on `TaoFormField` / `TaoInputGroup`. An explicit `size` on a control wins.

```vue
<div class="tao-size-small">
  <TaoInput v-model="q" />
  <TaoButton>Find</TaoButton>
</div>
```

Content and layout keep their own scale and do not inherit: Avatar (24 / 32 / 48px), Divider `gap`, Loader / Icon / ScrollTop (pixels).
Container lives on another axis — width: `width="wide" | "slim" | "ultra-slim"`.

**Density** is the second axis of the controls, on top of the size: the class `tao-density-compact` / `-comfortable` / `-auto` on a container (or on `<html>`) changes the height and the padding of every size in it, not the font. `comfortable` gives 34 / 44 / 52px (touch-sized rows), `compact` 22 / 32 / 40px (dense tools and tables), `auto` is comfortable on a touch screen (`pointer: coarse`) and the default with a mouse. Select and Combobox carry it into their panels. Type `TaoDensity`; the steps are tokens `--tao-density-height-*` / `--tao-density-padding-x-*` / `-y-*`.

```html
<html class="tao-density-auto">
```


Surfaces — what a panel is made of: `flat` fill (default), `grain` (static film grain), `glass` (translucent, blurs what is
behind). Use `surface` on TaoCard / TaoBlock or the class `tao-surface-grain` / `-glass` on any element — a game HUD, a
landing section, a sidebar. Tune the look once with theme tokens (`--tao-surface-grain-image` / `-size`, `--tao-glass-fill`
/ `-border` / `-blur`). A surface belongs to one element: nested panels do not inherit it. Glass needs something behind
it — keep it for things that float over content; over a flat background it is just a grey fill, over animation it is
re-blurred every frame. Toast and confirm are glass by default, tinted by their tone; `toast.defaults({ surface: 'flat' })`
and `confirm.defaults({ surface: 'flat' })` turn it off, `.surface('flat')` does it for one. Without blur support or with
`prefers-reduced-transparency` glass falls back to a solid panel.

Font size scale (primitives): `xs` 12 … `xl` 18 for controls; `2xl` 24, `3xl` 32, `4xl` 36 for titles and prose.
There is no heading component — use `h1 { font-size: var(--tao-font-size-3xl) }`.

API rules — every component follows them:

- **Fields** take `v-model`, `disabled`, `error` (red frame) and `size`. Label, hint and error text come from `TaoFormField`.
- **Events**: `update:X` for v-model plus `change` when the user finished a change (Slider, Split — on release). Other events are verbs in the present tense: `select`, `close`, `create`.
- **Texts**: visible ones are `*Text` (`clearText`, `successText`), screen-reader ones are `*Label` (`closeLabel`).
- **Lists**: data arrays are `items`; selectable items carry `value` + `label` (`TaoSelectOption`, `TaoTabItem`). Identifiers of plain data (table columns, stages) stay `key`.
- **Booleans** are adjectives without `is` / `has` / `as`: `closable`, `clickable`, `masked`, `newTab`. Layout axis is `direction: 'row' | 'column'`, not `vertical`.
- **Lengths** (`padding`, `radius`, `gap`, `maxHeight`): a number is pixels, a string goes to CSS as is (type `TaoLength`).

## Typography

An opt-in layer: the library never styles a bare `h1` or `p`. Put `.tao-prose` on a wrapper and the text inside gets
headings, paragraphs, lists, quotes, code, rules and links in the theme roles, spaced by proximity (a heading close to
its text, far from the block before). Every rule inside is `:where()`, so your CSS always wins.

```html
<article class="tao-prose">
  <h1>Title</h1>
  <p>Text with a <a href="/docs">link</a>.</p>
</article>

<h2 class="tao-heading-5">An h2 the size of level 5</h2>
```

The heading scale comes from two numbers: `--tao-text-base` (16px, the text and h6) and `--tao-text-ratio` (1.25), each
level up one more step: 16 / 20 / 25 / 31 / 39 / 49. Set the ratio on `:root` or on one wrapper (1.2 calmer, 1.333
bolder) and the scale under it follows; h1 and h2 shrink on a narrow screen, never below h3 / h4. The steps are tokens
`--tao-heading-1…6` for your own rules. `.tao-heading-1…6` gives the look of a level to any tag: the tag says what it is,
the class how big.

### For AI assistants

The package ships a skill, `skills/taoui/SKILL.md` with `references/components.md`: the setup, the rules (roles not colours, contexts not props), every component and its props, and the mistakes people make. Point your assistant at it; for Claude Code, copy `node_modules/@1337exp/taoui/skills/taoui` into your project's `.claude/skills/`. The component reference is generated from the showcase prop tables (`npm run skill`), and a test keeps the skill naming every component.

## Icons

The library ships **29 SVG icons** (check, close, plus, minus, chevrons, arrows, search, eye, more, grip, play, pause,
skip-back, copy, calendar, info, alert, circles, folder, file). They draw on `currentColor`, so an icon takes the text colour and the
font size, and live under the reserved prefix `tao-`: `<TaoIcon name="tao-check" />`, the list is `taoIconNames`.

```vue
<TaoIcon name="tao-check" />            <!-- built-in -->
<TaoIcon name="rocket" />               <!-- registered with registerTaoIcons, or `icon-rocket` of your own font -->
<TaoButton icon="tao-plus">Add</TaoButton>
<TaoButton icon="tao-close" aria-label="Close" />   <!-- only an icon: a square, aria-label is required -->
```

```ts
registerTaoIcons({ rocket: { body: '<path d="M12 3l4 8-4 10-4-10z"/>' } }); // 24x24 grid unless you pass viewBox
```

A name without the `tao-` prefix is looked up among the icons you registered, and then rendered as the class
`icon-<name>` for an external icon font (IcoMoon / Fontello and the like) that the host app connects itself. All
built-in parts (close buttons, steppers, pagination arrows, toasts…) use the built-in icons and their `#…-icon` slots
let you replace them with anything.

## Install

```bash
npm install @1337exp/taoui
```

Requires Vue 3.4+. The package is **ESM-only** (Vite, Nuxt 3, webpack 5 and Node 18+ with `import` all work; a plain `require('@1337exp/taoui')` does not: use `import()`).

### Browser support

The CSS uses `color-mix()`, container queries and registered custom properties (`@property`), so the floor is
**Chrome / Edge 111, Safari 16.4, Firefox 128**: the browsers of 2023–2024. Firefox 128 is the limiting one (`@property`).
On an older browser everything stays readable; what you lose is small: a registered property is what keeps a tone
(`.tao-tone-*`) and a surface from leaking into the children, so without it a Button inside a red Alert may turn red.
The same list is the `browserslist` field of the package and the build target.

From a local folder:

```bash
npm install ../path-to-tao-ui
```

## Usage

### Nuxt 3

Create `plugins/tao-ui.ts`:

```typescript
import { defineNuxtPlugin } from '#app'
import TaoUI from '@1337exp/taoui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(TaoUI)
})
```

Import styles in `app.vue` or a layout:

```vue
<script setup>
import '@1337exp/taoui/styles.css'
</script>
```

### Vue 3

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import TaoUI from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'

const app = createApp(App)
app.use(TaoUI)
app.mount('#app')
```

### Language

Built-in texts (placeholders, “Clear”, aria labels, dates) are English by default. Russian ships with the library:

```javascript
import TaoUI, { localeRu } from '@1337exp/taoui'

app.use(TaoUI, { locale: localeRu })
```

Change single texts — the rest stays from the default:

```javascript
app.use(TaoUI, { locale: { select: { placeholder: 'Pick one' } } })
```

Another language: copy `localeEn` (or `localeRu`), translate, pass it the same way (type `TaoLocale`). Keys repeat prop names —
`locale.select.placeholder` is the default of TaoSelect `placeholder`, and a prop passed by hand always wins.

Switch the language at any moment — from your settings, a language picker, a route. Components already on the page
update at once, without a reload and without losing what users typed:

```javascript
import { setTaoLocale, localeEn, localeRu } from '@1337exp/taoui'

function onLanguageChange(lang) {
  setTaoLocale(lang === 'ru' ? localeRu : localeEn)
}
```

Without the plugin (individual components) `setTaoLocale()` is the only call you need.

### Upgrading to 5.0

5.0 deletes every name that 2.0 deprecated (plus the `error` tone alias), see [MIGRATION-5.md](MIGRATION-5.md) for the table old → new.

### Upgrading from 3.x

4.0 changes one default: the built-in texts are now English (they were Russian). To stay on Russian, pass the locale
once — `app.use(TaoUI, { locale: localeRu })`, or `setTaoLocale(localeRu)` without the plugin. The date helpers and
the date components follow the locale and default to `en-US` as well.

### Upgrading from 1.x

See the 2.0.0 entry of [CHANGELOG.md](CHANGELOG.md) for what broke. Old names were removed in 5.0.

### Individual components

```vue
<script setup>
import { TaoButton, TaoFormField, TaoInput, TaoModal } from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'
</script>

<template>
  <TaoButton variant="primary">Press me</TaoButton>
  <TaoFormField label="Your text">
    <TaoInput v-model="text" />
  </TaoFormField>
  <TaoModal v-model="isOpen" title="Title">
    Modal body
  </TaoModal>
</template>
```

## Split

`TaoSplit` is two panes and a gutter. It is not `TaoDivider` (a line) and not an n-pane layout: three columns are two nested splits.

`direction` matches Flex: `row` (start | end) or `column` (start above end). Slots are `#start` / `#end`.

`v-model` is the start pane size. `unit` is `%` (default — the ratio survives a container resize) or `px` (a sidebar; the end pane takes the rest). With `px`, pass an explicit size — the default `50` is 50px. `min` / `max` apply to start; `min-end` is the other pane's floor; all three use the same unit. `resizable="false"` keeps the gutter but locks it.

The split fills the parent (`width` / `height: 100%`). Give the parent a bounded size on the split axis — a `column` split without a height has no `%` to compute. Panes use `min-width` / `min-height: 0` and `overflow: hidden`, so content cannot block shrinking. Scroll belongs on an inner wrapper (`overflow: auto; height: 100%; min-height: 0`). A nested `TaoSplit` as a direct child of a pane stretches on its own.

```vue
<TaoSplit v-model="side" unit="px" :min="160" :max="480" :min-end="240">
  <template #start>Nav</template>
  <template #end>Main</template>
</TaoSplit>
```

## Toast

The chain runs in the same tick; `setTimeout(0)` actually shows the toast.

```javascript
import { toast } from '@1337exp/taoui'

toast().success().message('Saved')
toast().danger().title('Network').timeout(5000).message('No connection')
toast.success('Saved')
toast.warning('Draft', { timeout: 1000 })
```

Default position is `topCenter`. Globally:

```javascript
toast.defaults({ position: 'bottomRight' })
toast.byBottomRight()
```

There is no overlay `question` in this kit — that is confirm, not toast. Buttons on a toast, if needed:

```javascript
toast().info().message('Delete the file?').action('Delete', onRemove)
```

You can skip the viewport: the first call creates it. For explicit control (tests, a custom layout):

```vue
<TaoToastViewport />
```

## Confirm

An overlay question in the center of the screen. This is not a toast: no progress bar, no auto-close, `await`, Esc and overlay click = cancel.

```javascript
import { confirm } from '@1337exp/taoui'

if (await confirm().title('Delete the file?').message('This cannot be undone').danger()) {
  remove()
}

const ok = await confirm('Leave without saving?', {
  ok: 'Leave',
  cancel: 'Stay',
})
```

Queue: a second `confirm()` while the first is open will wait. Default labels are “OK” / “Cancel”:

```javascript
confirm.defaults({ ok: 'Yes', cancel: 'No' })
```

## Forms

`TaoFormField` attaches a shared label / hint / error and forwards `id` to the nested control.

```vue
<TaoFormField label="City" hint="Optional">
  <TaoSelect v-model="city" :options="cities" />
</TaoFormField>

<TaoSwitch v-model="dark" label="Dark theme" />

<TaoRadioGroup v-model="plan" legend="Plan">
  <TaoRadio value="free" label="Free" />
  <TaoRadio value="pro" label="Pro" />
</TaoRadioGroup>

<TaoSegmented v-model="period" legend="Period">
  <TaoSegmentedOption value="week">Week</TaoSegmentedOption>
  <TaoSegmentedOption value="month">Month</TaoSegmentedOption>
  <TaoSegmentedOption value="year">Year</TaoSegmentedOption>
</TaoSegmented>

<TaoAlert tone="warning" title="Draft">Save before you leave.</TaoAlert>
```

`TaoSegmented` is a short exclusive choice with every option visible. It is not page navigation — that is `TaoTabs`. Longer labels or more than 5–6 items belong in `TaoRadioGroup` or `TaoSelect`.

`TaoSelect` opens from the keyboard (arrows, Enter, Esc); the list flips at the viewport edge. Delete or “Clear” at the bottom of the list resets the value to `null`.

When `null` is not a valid value (a grid step, a sort order), pass `:clearable="false"`: the clear row and the Delete / Backspace shortcut disappear. The clear row label is `clear-text`; for an icon or any markup use the `#clear` slot. `size` is `small` / `medium` / `large` (inherited from ancestors when not set) and also scales the open list.

```vue
<TaoSelect v-model="step" :options="steps" size="small" :clearable="false" />

<TaoSelect v-model="city" :options="cities">
  <template #clear><TaoIcon name="close" /> Reset</template>
</TaoSelect>
```

`TaoCombobox` is the same menu with a field. Typing filters options. `allow-create` writes the typed string into `v-model` when there is no exact match. The list does not mutate itself: listen to `create` and append an option from the parent.

Label, hint and error text always come from `TaoFormField`. `TaoFormField` also wraps `TaoTextarea`, `TaoCheckbox`, `TaoSwitch`, `TaoRadioGroup`, and `TaoSegmented` — id, hint, and error are forwarded for you.

`TaoTag` can be a chip: `#prefix` on the left (usually `TaoAvatar`), `closable` draws a cross and emits `close`. The close click does not bubble. `flat` drops the border and keeps the fill.

```vue
<TaoTag tone="neutral" closable @close="remove">
  <template #prefix>
    <TaoAvatar name="Anna Kozlova" size="small" />
  </template>
  Anna Kozlova
</TaoTag>
```

## Table and pagination

The table renders what you pass in: it does not slice or sort the data. That works for both server-side and client-side paging — the page is cut outside.

```vue
<TaoTable
  :columns="columns"
  :rows="pageRows"
  v-model:sort="sort"
  empty-text="No records yet"
>
  <template #cell-status="{ row }">
    <TaoTag :tone="row.status === 'active' ? 'success' : 'neutral'">
      {{ row.status }}
    </TaoTag>
  </template>
</TaoTable>

<TaoPagination v-model:page="page" :total="rows.length" :page-size="8" />
```

```javascript
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'city', label: 'City' },
  { key: 'status', label: 'Status' },
]
```

The `cell-<key>` slot replaces a cell. `loading` shows an overlay; an empty list shows text or the `#empty` slot. Clicking a `sortable` header cycles `asc → desc → off`.

## Empty states and loading

```vue
<TaoEmpty title="Nothing found">
  Change the filter or reset search.
  <template #action>
    <TaoButton variant="secondary">Reset</TaoButton>
  </template>
</TaoEmpty>

<TaoSkeleton variant="title" />
<TaoSkeleton :lines="3" />
<TaoSkeleton variant="circle" />

<TaoStages :items="[
  { key: 'pay', label: 'Payment', status: 'ok' },
  { key: 'pack', label: 'Packing', status: 'work' },
  { key: 'ship', label: 'Shipping', status: 'wait' },
]" />

<TaoList>
  <TaoListItem
    title="Ann Kozlova"
    description="Design · Moscow"
    clickable
    :selected="picked === 'ann'"
    @click="picked = 'ann'"
  >
    <template #prefix>
      <TaoAvatar name="Ann Kozlova" size="small" />
    </template>
  </TaoListItem>
</TaoList>
```

```vue
<TaoInput v-model="q" placeholder="Search…">
  <template #prefix>⌕</template>
</TaoInput>

<TaoInputGroup>
  <template #before>https://</template>
  <TaoInput v-model="host" placeholder="example.com" />
  <template #after>
    <TaoButton>Check</TaoButton>
  </template>
</TaoInputGroup>

<form @submit.prevent="onSave">
  <TaoFormField label="Email">
    <TaoInput v-model="email" type="email" />
  </TaoFormField>
  <TaoButton type="submit">Save</TaoButton>
</form>

<TaoFormField label="Quantity">
  <TaoInputNumber v-model="qty" :min="1" :max="99" />
</TaoFormField>

<TaoQuantity v-model="qty" :max="12" @dec="onDec" />

<TaoFormField label="Delivery day" hint="The model is always YYYY-MM-DD">
  <TaoDate v-model="day" min="2026-09-01" max="2026-09-30" />
</TaoFormField>

<TaoFormField label="Stay">
  <TaoDateRange v-model="stay" min="2026-09-01" max="2026-09-30" />
</TaoFormField>

<TaoCounter :value="score" :max-digits="6" />

<TaoCarousel :autoplay="4000" loop indicator="bars">
  <article v-for="item in banners" :key="item.id" class="hero">
    <strong>{{ item.title }}</strong>
    <span>{{ item.text }}</span>
  </article>
</TaoCarousel>
<TaoCarousel :peek="72" :controls="false" indicator="dots">…</TaoCarousel>
<TaoCarousel v-model="slide" :per-view="5" :peek="28">
  <template #prev></template>
  <template #next="{ go, disabled }">
    <button type="button" :disabled="disabled" @click="go">next</button>
  </template>
  <article v-for="item in products" :key="item.id">…</article>
</TaoCarousel>
```

`TaoDrawer` is a side sheet, not a centered modal:

```vue
<TaoDrawer v-model="open" title="Filters">
  ...
</TaoDrawer>
```

## Design tokens and theming

Library styles are layers. Components **never** touch raw colors or sizes: they read semantic roles, and
the contexts built on them (size, tone, surface). That is the theming mechanism: override 20–30 variables
and every component follows, with no edits inside the components themselves.

```
tokens/primitives.css → tokens/semantic.css → themes/*.css → contexts/*.css → base.css
  raw colors, scales    radii, shadows,       colour roles     size, tone,       reset
  leave them alone      type, motion          per theme        surface classes
```

### Layers

| File (in `src/styles/`) | Role | Touch it? |
|---|---|---|
| `tokens/primitives.css` | Raw palette, space / radius / shadow scales (`--tao-orange-400`, `--tao-space-3`…) | Usually no |
| `tokens/semantic.css` | Theme-independent roles: radii, shadows, type, motion | Rarely |
| `themes/dark.css` | The colour roles of the default (dark) theme: `--tao-color-accent`, `--tao-color-surface`, … | **Yes — this is the theming API** |
| `themes/light.css` | The same roles under `[data-tao-theme="light"]` | Yes, as a sample |
| `contexts/size.css`, `tone.css`, `surface.css` | `.tao-size-*` and `.tao-density-*`, `.tao-tone-*`, `.tao-surface-*`: what a control reads to know its size, colour and material | Rarely |
| `base.css` | Global reset (scrollbar, links, box-sizing) | Rarely |

Everything comes in through `@1337exp/taoui/styles.css` (dark and light both: light turns on with `data-tao-theme="light"`).
The raw files are importable as `@1337exp/taoui/styles/tokens/primitives.css` and so on.

### Your own theme

A theme is just semantic tokens under your selector.
Nothing in the components needs to change:

```css
/* my-brand-theme.css */
[data-tao-theme="my-brand"] {
    --tao-color-accent: #6c5ce7;
    --tao-color-accent-hover: #5a4bd1;
    --tao-color-bg: #0f0f1a;
    --tao-color-surface: #0f0f1a;
    --tao-color-surface-raised: #1a1a2e;
    --tao-color-text: #d6d6e8;
    --tao-color-text-strong: #ffffff;
    /* remaining roles: see themes/dark.css */
}
```

```vue
<!-- app.vue -->
<template>
  <div data-tao-theme="my-brand">
    <NuxtPage />
  </div>
</template>
```

Or switch the theme on `<html>` so modals/tooltips teleported to `body` pick it up:

```javascript
document.documentElement.setAttribute('data-tao-theme', 'light')
```

### Token groups

- `--tao-color-accent*` — brand/accent (primary buttons, active tabs, links)
- `--tao-color-on-accent` — text on the accent
- `--tao-color-selection`, `--tao-color-selection-text` — text selection (`::selection`)
- `--tao-color-surface*` — container backgrounds (default / raised / sunken / hover)
- `--tao-color-border*` — borders
- `--tao-color-text*` — text (default / strong / subtle / muted / disabled)
- `--tao-color-danger*`, `--tao-color-success*`, `--tao-color-warning*`, `--tao-color-info*` — status colors
- `--tao-color-input-*` — fields, because input bg/text often differs from surface/text
- `--tao-radius-control`, `--tao-radius-panel` — radii (small controls vs large panels)
- `--tao-shadow-panel`, `--tao-shadow-overlay` — shadows
- `--tao-font-size-*` — type scale in `primitives.css`: `xs`–`xl` controls, `2xl`–`4xl` titles / prose
- `--tao-control-height-*` (26 / 36 / 44px), `--tao-control-padding-x-*`, `--tao-control-padding-y-*`, `--tao-control-font-size-*`, `--tao-control-font-size-secondary-*`, `--tao-button-padding-x-*`, `--tao-indicator-size-*`, `--tao-tag-height-*` / `-padding-x-*` / `-font-size-*` — the size scale in `primitives.css`. Components read the current values from `contexts/size.css`: `--tao-control-height`, `--tao-control-padding-x` / `-y`, `--tao-control-font-size`, `--tao-control-font-size-secondary`, `--tao-button-padding-x`, `--tao-indicator-size`, `--tao-tag-height` / `-padding-x` / `-font-size`. Use them in your own controls to match the size around them.

The full list of colour roles lives in `src/styles/themes/dark.css` — the file worth opening
to see the whole theming API.

### Palettes

A palette is four colours, from the darkest to the lightest: a whole set of roles comes out, for a dark and a light mode.
Seven are ready (`sunset`, `marple`, `violet-dusk`, `ocean-blue`, `pinheiro`, `tokyo-night`, `lagoon`; the list is `taoPalettes`).

```javascript
import '@1337exp/taoui/styles.css'
import '@1337exp/taoui/palettes.css'          // all of them, or '@1337exp/taoui/styles/palettes/sunset.css' for one
```

```html
<html data-tao-theme="sunset">                            <!-- dark -->
<html data-tao-theme="sunset" data-tao-mode="light">      <!-- its light twin -->
```

`data-tao-mode="light" | "dark"` also works on its own, with the default colours; `data-tao-theme="light"` is the old spelling of the same.
Put it on `<html>` (so modals and tooltips teleported to `body` follow) or on any element for a part of the page.

What a palette decides, so you do not have to:

- **The accent** is the stop whose lightness suits the mode (name it with `accent: 1` when the automatic choice is not the one you meant), moved along lightness only until it is seen on the page (3:1), carries a readable text (4.5:1) and reads as text itself (`--tao-color-accent-text`, 4.5:1).
- **The page and the surfaces** are a very dark (or very light) tint of the palette's deepest hue.
- **The statuses** (`danger`, `warning`, `success`, `info`) keep their recognisable hue sector but share the lightness and the chroma of the palette, and a status that would be mistaken for the accent is pushed away (a palette may name its own colour: `status: { success: '#7fbf2f' }`). Every status keeps 4.5:1 for its text, as a fill and as text.
- **`--tao-color-accent-2`, `--tao-glow`, `--tao-gradient`, `--tao-bg-atmosphere`:** the second accent, the glow colour, a gradient through the four stops, and the soft glow behind the page (`class="tao-atmosphere"` on `<body>` or the app root paints it; a static layer, no blur).

The contrast is not a promise in the README: `tests/palette.test.ts` holds every palette in both modes to these numbers.

A palette of your own, at run time (a theme editor, a colour the user picked):

```javascript
import { applyTaoPalette } from '@1337exp/taoui'

const stop = applyTaoPalette({ name: 'mine', label: 'Mine', stops: ['#102030', '#306090', '#60c0f0', '#e0f4ff'] }, 'dark')
stop()   // takes it off again; a third argument puts it on one element instead of the page
```

or as a file: `taoPaletteCss(def)` returns the CSS the preset files are made of. To add a preset to the library, add it to `src/palettes.ts` and run `npm run palettes`.

#### Contrast: WCAG 2 and APCA

Two questions are asked of every colour pair, and they are answered by two different models.

**Is it allowed?** WCAG 2 contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` of the relative luminances, from 1 to 21. It is the
legal standard (and the one accessibility audits check), so every number the palettes promise is a WCAG 2 ratio: 4.5:1
for text, 3:1 for a fill seen on the page. `contrastRatio(a, b)` computes it.

**Which reads better?** WCAG 2 has a known blind spot: it treats light and dark the same way, and on mid-tone colours it
overrates black. On the green `#2ea85c` it says black 6.4:1 against white 3.1:1, while the eye clearly reads white better.
APCA (Accessible Perceptual Contrast Algorithm, the model behind the WCAG 3 draft) follows how we see: it knows that
light text on a dark background and dark text on a light one are not symmetric, and that thin text needs more. It gives
a lightness contrast **Lc** from about −108 to 106 (the sign is the polarity: negative is light text on dark); about 75 is
body text, 60 a label, 45 a large heading. `apcaContrast(text, background)` computes it.

| On `#2ea85c` | WCAG 2 | APCA Lc |
|---|---|---|
| black text | **6.4 : 1** | 47 |
| white text | 3.1 : 1 | **62** |

So the palettes use both, each for what it is good at:

1. **The polarity by APCA.** In light mode the label on a fill (the accent, a status) is the colour APCA reads better;
   on mid-tones that is white.
2. **The numbers by WCAG 2.** The fill is then moved along lightness until that label reaches 4.5:1, so a white label
   on a mid-tone gets a slightly deeper fill, never a weaker label.
3. **Dark mode keeps a dark label.** There the fills are light on purpose (to be seen on a dark page), and a light fill
   carries dark text in both models.

The checks are in `tests/palette.test.ts`: every palette, both modes, every fill. If you build your own colours, the two
functions are exported, use them the same way: APCA to choose, WCAG 2 to promise.

### A theme from scratch, without primitives

```javascript
import '@1337exp/taoui/styles/tokens/primitives.css'   // keep the scales if you want
import '@1337exp/taoui/styles/tokens/semantic.css'     // radii, shadows, type, motion
import './my-colour-roles.css'                         // your colour roles instead of themes/dark.css
import '@1337exp/taoui/styles/contexts/size.css'       // the contexts the components read
import '@1337exp/taoui/styles/contexts/tone.css'
import '@1337exp/taoui/styles/contexts/surface.css'
import '@1337exp/taoui/styles/base.css'
```

## Showcase

Every component with live examples, prop tables and copy-ready snippets. Language (EN / RU) and theme (dark / light) switch in the header.

```bash
cd showcase
npm install
npm run dev        # or, from the repo root: npm run showcase
```

The showcase points at `src/` directly, so component edits show up without
`npm run build`. `npm run showcase:build` produces a static site with relative
paths, ready to drop into any folder (for example `/sandbox/taoui/`).

Screenshots and clips in this README come from the showcase: see [docs/media](docs/media/README.md).

## Development

```bash
# Build the library
npm run build

# Watch mode
npm run dev

# Type check
npm run type-check

# Tests (Vitest)
npm test
```

## Publishing to npm

Only `dist/` (the built library) and `src/styles/` (raw tokens, so you can
import `tokens/primitives.css` on its own for a custom theme) are published, plus
`README.md`, `LICENSE`, `CHANGELOG.md` and `MIGRATION-5.md`.
Component sources (`src/components/*.vue`), build configs, and `showcase/`
stay in the repo — clone it to get them.

`npm publish` **itself** runs the type check, the tests and a full rebuild first
(`prepublishOnly` in `package.json`), so a stale or missing `dist/` cannot
reach the registry. You do not need to build by hand before `npm publish`.

See what would go into the tarball, without publishing, and check the package the way a consumer meets it
(`publint` for the manifest, `attw` for the type resolution):

```bash
npm pack --dry-run
npm run lint:package
npm run smoke      # installs the packed tarball into a clean Vite project and builds it
```

Keep the publish token out of the repository: reference it from `.npmrc` as
`//registry.npmjs.org/:_authToken=${NPM_TOKEN}` and set `NPM_TOKEN` in your shell.
`.npmrc` is git-ignored either way.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).
Security reports: [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 1337exp
