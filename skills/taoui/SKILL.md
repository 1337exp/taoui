---
name: taoui
description: Build Vue 3 interfaces with @1337exp/taoui 6 (TaoUI) — setup, themes and palettes, size / density / tone / surface contexts, the typography layer, components and their props, and the mistakes people make with them. Use when code imports @1337exp/taoui, uses Tao* components or --tao-* tokens, or the user asks for TaoUI.
---

# TaoUI 6

A Vue 3 component kit on design tokens. Components read **roles** (CSS custom properties `--tao-*`), never colours, so a
theme, a palette or a context class changes every component under it. The props of every component, with types and
defaults, are in [references/components.md](references/components.md); read the section you need before writing a
component you have not used yet. **How to put them together** (the accent budget, choosing a size: small / medium / large and
density, a toolbar, the footer of a form, a destructive action: what to use when, with a do and a don't) is in [references/patterns.md](references/patterns.md); read
it before you compose a screen. **A new app starts from `TaoShell`** (the shell: navigation, action, project, language, theme, the page as `<main>` with a skip link,
`<TaoHosts />` inside) and from a page starter in [references/starters.md](references/starters.md) (a whole screen in one file, with the
decisions it makes and why); copy the one that fits instead of composing a screen from scratch.
**Your own CSS goes outside of any layer and wins over the kit** (the kit lives in `@layer tao.*`); a global rule on an element
(`h2 {}`, `* { margin: 0 }`) wins too, so put such resets in `@layer reset, tao;` declared before the kit.

## Setup

```js
import { createApp } from 'vue'
import { setTaoLocale, localeRu } from '@1337exp/taoui'   // ESM-only; Vue 3.5+; named exports only
import '@1337exp/taoui/styles.css'                          // required, once: the core (tokens, themes, contexts, typography)
import '@1337exp/taoui/palettes.css'                        // optional: the 7 ready palettes

setTaoLocale(localeRu)                                      // optional, English by default
createApp(App).mount('#app')
```

- **Import the components you use**: `import { TaoButton } from '@1337exp/taoui'`. The CSS of a component comes with the component (about 38 KB of CSS for one, against 244 KB for the whole kit); do not import a stylesheet per component.
- Global registration is optional and costs the whole kit: `import TaoUI from '@1337exp/taoui/plugin'`, `app.use(TaoUI, { locale: localeRu })`. Prefer named imports. On the server (Nuxt, SSR) give the language to the app through the plugin: the process is shared by requests.
- Nuxt 3: the CSS in `app.vue`; the plugin only if you want global tags. Components are SSR-safe; `toast()` / `confirm()` do nothing on the server, and the package must go through Vite on the server too (`vite: { ssr: { noExternal: ['@1337exp/taoui'] } }`: the CSS of a component is imported from its JS), and `toast.defaults` / `confirm.defaults` are process-wide (set them once at start-up, not per request).
- Browser floor: Chrome / Edge 130, Safari 18, Firefox 132 (the last two years: `@layer`, `inert`, `round()`, nesting, `color-mix()`, `light-dark()`, `@property`, container queries).

## Rules that keep an app consistent

1. **Colours come from roles**, never hex: `var(--tao-color-text-muted)`, `--tao-color-accent`, `--tao-color-surface`,
   `--tao-color-border`, `--tao-color-danger`… A hex in app CSS breaks the light mode and every palette.
   **Pick the text step by its job** (patterns.md, "The text ladder"): `text-strong` for headings and the value that is the
   point, `text` for body copy and every control at rest, `text-muted` for hints and captions; hover goes one step up.
   Never paint body copy `strong` to make it important.
2. **Status is `tone`**, the same everywhere: `success | danger | warning | info | neutral` (the accent when omitted) on
   TaoButton, TaoAlert, TaoTag, the stripe of TaoCard / TaoBlock (`stripeTone`), TaoTimeline markers; `toast.danger()`. Say the status in words
   too: colour alone is not a message.
3. **Size and density are contexts**, not props on every control: `class="tao-size-small"` (or `-medium`, `-large`) and
   `class="tao-density-compact | comfortable | auto"` on any container change every control inside. An explicit `size`
   prop wins. `comfortable` gives touch-sized controls (34 / 44 / 52px); `auto` is comfortable on `pointer: coarse`.
4. **A surface is a material**: `surface="flat | grain | glass"` on TaoCard / TaoBlock or `class="tao-surface-glass"` on any
   element. Glass needs something behind it (popovers, a header over a scroll). A surface paints the fill, the ring and the blur and has
   no shape: the corners are the element's own `border-radius` (TaoCard / TaoBlock have it; on your own element add
   `tao-panel` or a radius), otherwise the glass is a square. A field with an opaque inner part (the track of TaoSegmented, the trigger of TaoSelect / TaoDate) hides a surface on its root.
   **Frames are a context too**: `class="tao-frames-soft"` on `<html>` or a container lets the decorative frames of Alert, Spoiler,
   Table, List, Toolbar and Menubar go clear (the fill holds the panel); `bordered` on one of them overrides it. Field frames and
   focus rings never follow it.
5. **Floating panels** (Select, Combobox, Date, Popover, Tooltip, menus) are teleported to `body`; they carry the size and
   the density of where they hang from by themselves. Do not wrap them in `overflow: hidden` expecting a clip.
6. **Do not restyle internals by class names** (`.tao-select__panel` …) unless the reference says a class is public;
   tune tokens instead. When you must, note that `TaoGrid` lays out on `.tao-grid__cells`, not on `.tao-grid`.
7. **Text content goes in `.tao-prose`**: the library never styles a bare `h1` or `p`. `<article class="tao-prose">` gives
   headings, lists, quotes, code and links; `<h2 class="tao-heading-5">` gives any tag the look of a level.

## Themes and palettes

```html
<html data-tao-mode="light">                              <!-- light is the opt-in; with no attribute the theme is dark -->
<html data-tao-theme="lagoon">                            <!-- a palette, dark -->
<html data-tao-theme="lagoon" data-tao-mode="light">      <!-- its light twin -->
```

Palettes: `sunset`, `marple`, `violet-dusk`, `ocean-blue`, `pinheiro`, `tokyo-night`, `lagoon` (`taoPalettes`). Put the
attributes on `<html>` so teleported panels follow. Your own palette at run time:
`applyTaoPalette({ name, label, stops: [darkest, …, lightest] }, 'dark' | 'light', element?)` returns a function that
takes it off; `taoPaletteCss(def)` gives the CSS. `class="tao-atmosphere"` on `<body>` paints the soft glow behind a page.

Contrast: every palette keeps WCAG 2 numbers (4.5:1 text, 3:1 fills); the polarity of a label on a fill is chosen by APCA,
so light-mode fills carry white labels. `contrastRatio(a, b)` and `apcaContrast(text, bg)` are exported: use APCA to
choose a text colour, WCAG 2 to promise a number.

## Layout

- `TaoContainer` (page width), `TaoFlex` / `TaoSpace` (rows and stacks with `gap`), `TaoDivider`, `TaoSplit` (resizable panes).
- `TaoGrid min="220px"` — a catalog of equal tiles. `TaoGrid :cols` + `TaoGridItem :col :row :order` — a bento. Values can be
  per width class **of the grid itself**: `compact` < 600px, `medium` < 840px, `expanded`:
  `:cols="{ compact: 3, expanded: 6 }"`, `:col="{ compact: 'full', expanded: 4 }"`, `:order="{ compact: 9 }"`. A plain
  number is one column on compact. `rowHeight` is the exact row height (a mosaic: pictures are cropped).
- `TaoNav` — app navigation from one list: a bottom bar, a rail or a drawer, `layout="auto"` by its own width; put the page
  in its default slot and it lays it out. `floating` makes the bar a detached pill (the FAB is your own button beside
  it). `fill` makes it the shell of an app: it takes its parent's height (`html, body, #app { height: 100% }`), the
  page scrolls inside `.tao-nav__content` and the footer stands at the bottom of the side panel; more than one child of
  `#action` stack one under the other; `--tao-nav-compact` (1 on the bar and the rail, 0 on the side panel) is there for
  your own pieces in the slots. `select(item, event)` (the item, `item.id` is the section) + `event.preventDefault()` to route with a router. Widths `--tao-nav-rail-width` /
  `--tao-nav-drawer-width`; the action button may take `shortcut="N"` (shown in the side panel, hidden when round). `surface="glass"` for a
  translucent bar over the page (as on TaoCard; it turns solid where blur is off). `#footer`: a small line under the
  items (version, About) in the rail and the side panel. `badgeTone="neutral"`: grey counters, the accent on the
  current item. `.tao-nav` is the whole layout (navigation + page); style the menu with `surface`, not on the root.

## Forms

- Every field takes `size`, `disabled`, `invalid` (a red frame); the text fields, switches and checkboxes also `id`, `name`, `required`, `autofocus` (and `readOnly` on `TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoQuantity`, `TaoDragNumber`, `TaoPresetInput`, `TaoSelect`, `TaoCombobox`, `TaoDate`, `TaoDateRange`, `TaoColorInput`); a select, a date, a colour, a pin code and a slider submit through a hidden input (`name` → `FormData`, `required` → the native check). The message, the label and the hint go through
  **`TaoFormField`** (`label`, `hint`, `error`), which also wires `id`, `aria-describedby` and `aria-invalid`. The dense row of an
  inspector (caption left, control right, `x y` in one row) is **`TaoProp`**, wired the same way. The shell of a whole app (the
  navigation, the main action, the project chip, language and theme, the page) is **`TaoShell`**: do not copy the starter by hand. The frame of an **editor** (a workspace in the middle, tools around it: rails with tool buttons that open panels, a menu on top, a status bar at the bottom) is **`TaoWorkbench`**: slots `top-start` / `top-end`, `left-start` / `left-end`, `right-…`, `bottom-…` for the bars, `leftTools` / `rightTools` / `bottomTools` with `v-model:left` / `right` / `bottom` for the panels, `left-panel` / `right-panel` / `bottom-panel` for their content; the starter `editor` shows it whole. The mode, the palette and the language
  of a product are one call, **`createKitPrefs({ key })`** (it reads, puts on `<html>`, follows the system, saves); bind its `mode` to
  `TaoThemeToggle system :apply="false"` and its `locale` to `TaoLanguageSwitch`.
- `TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoQuantity`, `TaoDragNumber` (caption + number + unit in one cell: drag it sideways like a slider, click to type, ± buttons; `variant="filled"` + `:controls="false"` for a column of values in a panel), `TaoSelect`, `TaoCombobox`, `TaoPresetInput` (a field with presets and two arrows, e.g. font size or zoom: `options` with `default: true` for «Auto», `loop`, `custom`), `TaoDate` (`editable` to type `5`, `5.3`, `05.03.26`) / `TaoDateRange`
  (`YYYY-MM-DD` strings), `TaoCalendar` (the inline month calendar, `mode="single" | "range"`), `TaoCheckbox`,
  `TaoChecklist` (one model for a group), `TaoRadioGroup` + `TaoRadio`, `TaoSwitch`, `TaoSegmented`, `TaoSlider` /
  `TaoRangeSlider`, `TaoPinCode` (`status="success | error"` after `complete`), `TaoColorInput` / `TaoColorPicker`,
  `TaoFileDrop`. A form is a plain `<form>`; there is no TaoForm.
- Attributes given to a field (`aria-label`, `name`, `autocomplete`, `inputmode`, `data-*`, listeners) reach its control
  (the input, the trigger button, the checkbox); `class` and `style` stay on its wrapper. A field that reads as text
  (an item of a list being edited): `<TaoInput variant="plain">` (`TaoInputNumber`, `TaoCombobox` and `TaoTextarea` take the same `variant`). On `TaoColorInput` the
  `aria-label` is followed by the colour («Background: #ff8800»); `TaoColorPicker` is a group it names.

## Overlays and feedback

- `TaoDocTabs` (the tabs of open documents: `items` `{ id, label, dirty?, preview?, closable? }`, `v-model` the active one; it only draws the row: `@close`, `@pin`, `@reorder(from, to)`, `@menu` are requests the app carries out), `TaoCommandList` (the field and the list of the palette with no window, for a page, a panel or a `TaoPopover`; `@select` closes nothing), `TaoCommandPalette` (a dialog, `modal="false"` for a panel with no dimming, the whole screen on a phone by default, that searches `items` `{ id, label, group?, shortcut?, keywords?, disabled? }`, `Ctrl+K` style: you open it from your own key with `v-model`, `@select` runs the pick; the search alone is `matchCommands`), `TaoModal` (`fullscreen`, `fullscreen="narrow"` for a page on a phone), `TaoDrawer` (`side="bottom"` is the phone's
  bottom sheet) — v-model; Escape closes the top layer only. `TaoPopover`, `TaoTooltip` (`placement`; the tip is the opposite of the theme, and so is every hint of the kit; a hint you draw yourself wears the class `tao-tip` and sets no background of its own, the colour of the panels is the one it hangs over; `shortcut` adds the key as a key cap; `bold` is on, semi-bold text; `animated` is the fade, off by default: a share of the base duration, `0` off, `1` base, `2` twice, or the token `--tao-tooltip-motion`). `TaoKbd` is the one look for a key (`variant` `cap` / `plain`): do not draw your own `<kbd>`.
- Menus share one engine: `TaoDropdownMenu`, `TaoMenubar`, `TaoContextMenu`, `TaoMenu` (the panel for your own shell). `TaoMenu` and `TaoPopover` take `anchor` as an element or a point `{ x, y }` of the screen (a menu at a drop point or at the pointer; recipe for a context menu: on `contextmenu` prevent the default and open at `clientX` / `clientY`, or just use `TaoContextMenu`). `TaoDropdownMenu block`: the button fills its place and draws nothing, for a whole chip of yours in `#button` (never style `.tao-dropdown-menu__button` from outside).
  Items are a data tree `TaoMenuItem[]`: `{ id, label, icon?, shortcut?, disabled?, items? }`,
  `{ type: 'checkbox' | 'radio', checked }`, `{ type: 'label' | 'separator' }`. `@select="item => …"` (the whole item, `item.id` names it). `closeOnScroll`.
  With TaoUX, `createCommands().toMenu(layout)` builds this tree and binds the same shortcuts.
- `TaoToolbar` (one tab stop, arrows walk it) with `TaoToolbarGroup` and `TaoToolbarSeparator`; toggles are
  `TaoButton v-model:pressed`, a one-of-many choice inside it is `TaoSegmented`. A bar that must stay one row (an editor, a phone)
  is `<TaoToolbar overflow>`: the groups that do not fit go under a «⋮» button, a `TaoToolbarGroup pinned` never does.
- `toast({ type: 'success', message: 'Saved' })` or `toast.success('Saved')`, `toast.danger('…', { title: 'Network', timeout: 5000 })`,
  `{ actions: [{ label: 'Undo', onClick }] }`; it gives back `{ id, dismiss() }`. `await confirm({ title: 'Delete?', message: '…', tone: 'danger' })` resolves to a boolean. Both draw in **`<TaoHosts />`** (= `TaoToastViewport` + `TaoConfirmHost`, which can stand alone): put it once into the root of the app (`TaoShell` has it inside); it stands in the
  app's own tree, so it reads the locale you `provideTaoLocale` (the button texts follow it), and a second one draws nothing.
  Without a host nothing is shown and a dev warning says so.
- `TaoAlert` (`tone`, `title`, `closable`, `collapsible` + `v-model:collapsed`), `TaoEmpty`, `TaoLoader`, `TaoSkeleton`,
  `TaoProgress`.

## Data and display

`TaoTable` (columns, sort, row click, also from the keyboard; `stack` = cards under 600px, `minWidth` = sideways scroll; generic: the row type comes from `rows`, an interface or a `readonly` array will do), `TaoPagination` (`pageInput` for hundreds of pages), `TaoList` / `TaoListItem` (`roving`: one Tab stop, arrows between the rows),
`TaoTree` (expand, select, tri-state `checkable`, lazy `load`, a row context `menu`, `hint` / `tone` on a node, rows moved by drag and Ctrl+X / Ctrl+V through `@move` + `moveTreeNodes`), `TaoStages`, `TaoTimeline` (`active` makes it a progress),
`TaoTag`, `TaoAvatar`, `TaoImage`, `TaoCarousel`, `TaoCard` (`#media`, `#title`, `#sub`, `#footer`, `#corner`, `closable`,
`stripe` + `stripeTone`; `radius` is one length or the corners one by one, `[0, 0, 12, 12]` in the order of CSS `border-radius`, for a sharp side next to a stripe; the same on `TaoBlock` and `TaoAnimatedBorder`; `square="top"` makes a side or a corner sharp and keeps the radius as it is: prefer it when you only want some corners sharp), `TaoBlock`, `TaoTabs`, `TaoBreadcrumb`, `TaoLink` (underlined by default, `underline="hover"` or `"none"` for a link that is clear from its place), `TaoStretchedLink` (a whole card or row as one link, the buttons inside still work: `tao-stretched` on the container, `tao-stretched-raise` on a control that must click by itself; never `filter` / `transform` on the link), `TaoSpoiler` / `TaoSpoilerGroup`, `TaoCounter`,
`TaoCopy`, `TaoTour` (a guided tour: `:step` / `:index` / `:count`, events `next` / `prev` / `skip`; it only draws, the state is yours or TaoUX `useTour`; a step is `{ id, target?, title?, text?, placement? }`), `TaoThemeToggle` (the light / dark switch as an icon button: flips `data-tao-mode` of `<html>`, or `v-model` with `:apply="false"`; `system` adds a third state, «follow the OS» (click: system → light → dark; `v-model` then holds `'system'` too, resolve it with `resolveTaoMode()`); `#icon="{ mode, choice, next }"` for your own glyph), `TaoLanguageSwitch` (the language of the interface: a globe that opens a list of `:languages="['ru', 'en']"`, each under its own name from `Intl.DisplayNames` (`taoLanguageName(code)`); `v-model` is the code; it writes `<html lang>` unless `:apply="false"`; `icon-only` for a phone; the texts, the storage and `setTaoLocale` are the app's; not flags, not `RU | EN` in a `TaoSegmented`), `TaoMarquee` (one line that runs round only when it does not fit), `TaoScrubber` (play / pause + time),
`TaoScrollTop`, `TaoAnimatedBorder`, `TaoIcon`.

Small charts only: `TaoSparkline` (a trend), `TaoMeter` (a value in a range, `low` / `high` / `optimum`), `TaoDonut`
(`segments` or `value` of `max`), `TaoHeatmap` (`values` by `rows` × `cols`, threshold `steps` with a legend, a grid the
arrows move through). Series colours `--tao-color-chart-1…6`. For a real chart (axes, tooltips) use a chart
library and feed it `taoChartTheme()` / `watchTaoChartTheme(apply)`; do not build axes by hand.

## Icons

`<TaoIcon name="tao-check" />`: 45 built-in SVG icons under the `tao-` prefix (incl. `tao-settings`, `tao-edit`, `tao-trash`, `tao-bell`, `tao-tag`, `tao-repeat`, `tao-undo`, `tao-redo`, `tao-sun`, `tao-moon`, `tao-monitor`, `tao-globe` for the language, `tao-pipette`) (`taoIconNames`). Your own:
`registerTaoIcons({ rocket: { body: '<path d="…"/>' } })` on a 24 grid with `currentColor`; add `grid: true` for icons made
only of straight lines through the middle (a plus), so they stay crisp when small. Any other name renders the class
`icon-<name>` for an icon font you bring.

## Language

`setTaoLocale(localeRu)` (or `app.use(TaoUI, { locale: localeRu })` from `@1337exp/taoui/plugin`, on the server); `setTaoLocale(localeEn)` switches at run time without a reload; a prop passed by
hand (`placeholder`, `closeLabel`…) always wins. For SSR per request, `provideTaoLocale`.

Scrollbars: thin (6px) by default; `--tao-scrollbar-size` / `-thumb` / `-track` / `-width` (Firefox) change them on the page or on a block, the class `tao-native-scrollbars` (on `<html>` or a block) gives the browser's own back.

Which language to start with: `detectTaoLanguage(['en', 'ru'], { fallback?, requested? })` returns one of your languages by `navigator.languages` (`parseAcceptLanguage(header)` for a server); it only answers, `setTaoLocale` sets. A locale text may be plural forms `{ one, few, many, other }` (`formatTaoText(text, { count }, code)` does it for your own texts); a plain string stays the same for every number.

## Mistakes to avoid

- Writing hex colours or `rgba()` in app CSS instead of roles; inventing token names (check `styles.css`).
- Passing `size` to every control instead of one `tao-size-*` / `tao-density-*` class on the container; worse, to some of them
  only (the rest stay medium and the row comes out uneven), or pinning `--tao-control-height` on one (patterns.md, "Controls
  side by side").
- Styling `.tao-grid` as a grid (it is `.tao-grid__cells`); expecting `rowHeight` to be a minimum (it is exact).
- Putting `TaoMarquee` in a parent without left room: the left fade takes `fade` px (22) left of the text.
- Using colour alone for a status; forgetting `aria-label` on an icon-only button (`TaoButton icon="tao-plus"` needs one).
- Global `h1 { … }` styles fighting `.tao-prose` (its rules are `:where()`, so yours win by design).
- Expecting `variant="danger"` on a button: the colour is `tone="danger"`, the shape is `variant`.
- Tinting a hover, a highlighted row or a wash with the accent (`--tao-color-accent-subtle`, `accent-text`): what the pointer is over is neutral (`--tao-color-hover`, `--tao-tone-wash`, text up to `text-strong`); the accent is for what is chosen or current. A test (`tests/accent-budget.test.ts`) keeps it for the components.
- A `ghost` or `text` button without `tone` is accent-coloured (amber): in a toolbar, a row or a header it must be
  `tone="neutral"`. The accent is for the one main action, the selected item and the focus (patterns.md, the accent budget).
- Importing from deep paths (`@1337exp/taoui/dist/...`); only the package root, `styles.css`, `palettes.css` and
  `styles/*` are public.

Migrating from TaoUI 5: the top section of `CHANGELOG.md` ("How to update from 5.x") lists the steps and every rename; `MIGRATION-5.md` is the older 4 → 5 table.
