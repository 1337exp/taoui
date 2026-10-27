# Changelog

## 5.0.0

A foundation release: shared mechanisms instead of per-component copies, and a clean API. Everything deprecated since 2.0 is removed, so read [MIGRATION-5.md](MIGRATION-5.md) first. Why and how: `docs/v5-plan.md`.

In numbers: the tarball is 329 KB (560 KB before the ESM-only build), 451 tests (183 before), one floating-panel engine instead of eight copies, 27 built-in icons instead of three icon mechanisms, one tone mechanism instead of six. TaoUX 0.2.0 and taofx follow it.

### Breaking

- **Every name deprecated since 2.0 is removed**, with the tone alias `error` (Alert, Tag, Avatar `dot`, `toast`). The table old → new is in [MIGRATION-5.md](MIGRATION-5.md).
- `TaoTabItem` is a plain `{ value, label, disabled? }`; `TaoSegmentedSize` and `TaoListSize` are gone (use `TaoSize`); `--tao-field-height` and `--tao-color-text-on-accent` are gone.

### Palettes

- **Seven ready palettes** (`sunset`, `marple`, `violet-dusk`, `ocean-blue`, `pinheiro`, `tokyo-night`, `lagoon`), each with a dark and a light mode: `import '@1337exp/taoui/palettes.css'`, then `data-tao-theme="sunset"` (+ `data-tao-mode="light"`). They are separate opt-in files, the core stylesheet did not grow.
- **A palette is four colours.** The accent is picked by lightness and moved only along lightness until it is seen (3:1), carries text (4.5:1) and reads as text (4.5:1); the surfaces are a tint of the palette's deepest hue; the statuses keep their hue sector but share the palette's lightness and chroma, and are pushed away from the accent when they would be mistaken for it. A palette can name its accent stop or a status colour when the automatic choice is not right.
- **`applyTaoPalette(def, mode, el?)`** puts the same roles on the page (or an element) at run time, for your own palette or a colour a user picked; `taoPaletteCss(def)` returns the CSS; `taoPalettes` is the list for a picker. The code is `src/palette.ts` (OKLCH maths, no dependencies); the preset files are generated from it (`npm run palettes`) and a test keeps them equal.
- **New roles** in both default themes: `--tao-color-accent-2`, `--tao-glow`, `--tao-gradient`, `--tao-bg-atmosphere`, and the class `.tao-atmosphere` (a static glow behind the page, no blur). `data-tao-mode="light" | "dark"` works next to `data-tao-theme`.
- 150 palette tests: contrast of the accent, its text and every status in both modes of every palette, statuses told apart from the accent, hue sectors, no invented roles, the files equal the generator.
- The showcase has a palette picker (with the four colours of the chosen one) next to the dark / light switch; the choice is remembered.

### Packaging

- **ESM only.** The CommonJS build and its source map are gone (`dist/index.js`, `index.d.ts`, `styles.css`, one map): the tarball is smaller and there is one way to load the library. `require()` users switch to `import()`.
- `package.json`: `exports` with `types` + `default`, `sideEffects: ["**/*.css"]`, `files` include `MIGRATION-5.md`, `browserslist` (Chrome / Edge 111, Safari 16.4, Firefox 128; the build targets the same), the unused `nuxt` peer is removed.
- **Style files are laid out by layer:** `tokens/` (primitives, theme-independent semantic roles), `themes/` (`dark.css` holds the colour roles, `light.css`), `contexts/` (size, tone, surface), `base.css`. `styles.css` is the same bundle (dark and light).
- `npm run lint:package` (`publint` + `attw`) and the consumer smoke test run in CI; README has a "Browser support" section.

### Components

- **New `TaoNav`**: navigation between the sections of an app (`TaoNavItem`: `id`, `label`, `icon`, `href`, `badge`, `disabled`; `v-model`). Three looks from one list: `bar` (bottom bar, «More» with a menu over `maxBarItems`), `rail`, `drawer`; `auto` chooses by the width of TaoNav itself with container queries, so it is right on the server and inside a `TaoSplit` pane. The default slot holds the page, TaoNav lays it out (sticky bar with `env(safe-area-inset-bottom)`, sticky side list). Links carry `aria-current="page"`; `select(id, event)` can `preventDefault()` for a router.
- **`TaoTimeline` → `TaoScrubber`** (play / pause + a time slider). The name `TaoTimeline` is kept for a vertical event feed later.
- **`TaoCalendar`**: an inline month calendar, one date or a range, with the keyboard of `TaoDate`. `TaoDate` and `TaoDateRange` are now a field plus a popup around it (they shared 13 of 13 functions; ~1000 lines became ~460 + the calendar).
- **`TaoCarousel`: a filling mark for autoplay.** `indicator="dots" | "bars" | "progress"` replaces the boolean `dots`; with `autoplay` the current mark fills over the interval and the slide changes when it is full. The fill is a CSS animation and the only clock (no JS timer), so what you see is what counts. It pauses on hover, keyboard focus, touch / drag, a hidden tab and a pause button (`pausable`, with `pauseLabel` / `playLabel`: autoplay that moves for more than 5 seconds must be stoppable); with `prefers-reduced-motion` autoplay is off. Without autoplay `progress` shows the position. A custom `#dots` slot still gets its time from an invisible fill.
- **`TaoCard`**: slots `media` (was `cover`), `header`, `title`, `sub`, `footer`, `overlay` and the new `corner`; `closable` + `close`. `headerTitle` and `headerSecondary` are gone (use `header`).
- **`TaoAnimatedBorder`**: `variant="tone"` + `tone` follows the theme, `colors` for your own list, `radius` with concentric corners, a still gradient with `prefers-reduced-motion`. The rainbow is the token `--tao-gradient-rainbow`.
- **`TaoTabs` `justify`** is typed (`TaoJustify`, as in `TaoFlex`). The `TaoGrid` breakpoint lives in one file.
- **Language is SSR-safe:** on the server `app.use(TaoUI, { locale })` no longer changes the process-wide language, so one request cannot leak its language into another. `provideTaoLocale(locale)` gives a subtree its own language.
- **`useField`**: the plumbing every form control took from `TaoFormField` (id, `aria-describedby`, invalid) was copied into 15 components; it is one function now, covered by tests.

### Icons

- **27 built-in SVG icons** (`tao-check`, `tao-close`, `tao-chevron-*`, `tao-play`, …) on `currentColor`, under the reserved prefix `tao-`. `registerTaoIcons()` adds your own; any other name is still the `icon-<name>` class of an external font. `taoIconNames` lists the built-ins.
- Every text glyph (`× ✕ ‹ › ▶ ❚❚ ⏮ ⋮ + −`) and every hand-drawn inline `<svg>` in the components is replaced by `TaoIcon`: one look, the same on every platform (`▶` and `⏮` can turn into colour emoji on some). A test keeps new glyphs and inline svgs out.
- **`TaoButton`:** `icon` is an icon name now (it was a text node), new `iconEnd`; a button with only an icon is a square and asks for `aria-label` in development. `TaoSegmentedOption` `icon` likewise.

### Overlays: one engine

- **Floating panels no longer trail a smooth scroll:** a panel is `position: absolute` in document coordinates and scrolls together with the page; `fixed` only when its anchor is pinned to the screen (a `fixed` / `sticky` ancestor, the context menu point). Before, a `fixed` panel was moved from the `scroll` event, which comes a frame after the page has moved.
- **One shape for every floating panel:** Menu, Select, Combobox, Popover and the date panel take `--tao-radius-panel` (8px), their items the concentric radius `panel − padding` (4px), the same as the entries of `TaoMenubar`. Before, the menu items came out square (4 − 4) and the Select options stuck out of their panel corners.

- **One positioning, dismiss and layer engine** instead of eight copies: `computePosition` (pure, tested) and `useFloating` (follows scroll and resize), `useDismiss` (outside press, capture phase), `useLayer` (a stack of open layers: **Escape goes to the top one only**, page scroll lock, focus return), `useListNav` (arrows, Home / End, type-ahead, disabled items skipped). Popover, Tooltip, Select, Combobox, Date, DateRange, the Copy tip, Modal, Drawer and `confirm()` use them.
- **New `TaoMenu`** and a rebuilt **`TaoDropdownMenu`** on it: a data tree `items` with submenus, checkboxes, radios, group labels, separators, shortcuts (a ready string to show), disabled items; `aria-activedescendant`, type-ahead, `→` / `←`, Tab closes. Types `TaoMenuItem`, `TaoPlacement`.
- **New `TaoMenubar`** (an ARIA menubar: one tab stop, `←` / `→` with wrap, Home / End, `↓` / Enter / Space open, with a menu open `←` / `→` and the pointer switch to the neighbour menu, Esc gives the focus back to the entry; a top entry without `items` is a plain action) and **`TaoContextMenu`** (a menu at the pointer on the right click, the Menu key / Shift+F10 open it at the element; `display: contents`, so the layout does not change; closes when the page scrolls, `closeOnScroll`). `TaoMenu` emits `edge` for `←` / `→` that have nowhere to go inside it.
- **`placement`** (`top` / `bottom` / `left` / `right` plus `-start` / `-end`) replaces `position` on Popover, Tooltip and ColorInput.
- A Select inside a Modal no longer closes the Modal on Escape.

### Tone

- **One mechanism for every status colour.** `.tao-tone-<name>` (accent, neutral, success, danger, warning, info) sets `--tao-tone`, `-hover`, `-on`, `-text`, `-text-hover`, `-subtle`, `-wash`; Button, Alert, Tag, toast, confirm and the Avatar dot read only those. The tokens do not inherit, so a Button inside a red Alert stays an accent button. New `toneClass()` helper and `TaoToneName` type.
- **`TaoButton`: `tone` works on every `variant`** (it only painted ghost and text before); `variant="danger"` is gone (use `tone="danger"`); about 30 hand-written selectors became 8.
- New role tokens: `--tao-color-accent-text(-hover)` and `--tao-color-on-success|warning|info`. The light theme's ghost / text Button label is now readable (5.8:1 instead of 3.6:1).
- Tests hold every `on-*` colour to 4.5:1 (the light accent's white-on-rose, 3.64:1, is the one documented exception) and every tone's text to 4.5:1.

### Tokens

- **Dark theme: `--tao-color-text-disabled` is `gray-500`** (it was `gray-300`, brighter than `text-muted`, so disabled items stood out instead of fading).
- **z-index scale** `--tao-z-modal | popup | tooltip | toast | confirm`; no component writes a literal any more.
- **`--tao-transition-base` no longer animates `all`**: colours, shadow, opacity and transform only.
- **Panel contract:** Card / Block default radius and padding come from tokens; a panel (class `.tao-panel`) publishes `--tao-radius`, `--tao-pad` and `--tao-radius-inner` for concentric corners.

### Internal

- `deprecationWarning` / `warnDeprecated` take the version that removes the name (`removeIn`), no longer a hard-coded "3.0".
- New tests: behaviour of the overlay family, server-side rendering of every component, public entry and token contract; `npm run smoke` installs the packed tarball into a clean Vite project.

## 4.0.1

- **TaoScrollTop:** the ripple is gone. It painted the wave in a tint that disappeared on the accent fill, so it was practically invisible and cost a DOM node, a timer and an `overflow: hidden` clip. The button now has the same 1px press as `TaoButton`.

## 4.0.0

### Breaking: English is the default language

- **Built-in texts are English by default** (they were Russian): placeholders, “Clear”, aria labels, `toast` / `confirm()` defaults, calendar captions. The date helpers (`formatTaoDateLabel` and friends) default to `en-US` instead of `ru-RU`, and `TaoDate` / `TaoDateRange` follow the active locale as before.
- **To stay on Russian**, pass the locale once: `app.use(TaoUI, { locale: localeRu })`, or `setTaoLocale(localeRu)` without the plugin. `localeRu` and `localeEn` are both still exported, nothing else changed in the locale API.
- `setTaoLocale(overrides)` now merges on top of English (it merged on top of Russian). Pass `setTaoLocale(overrides, localeRu)` to keep the old base.

### Minimum width

- **`TaoButton` `minWidth`** (number = px, or any CSS length) and the **`--tao-button-min-width`** variable; default `0`, so nothing changes until you set it. Set the variable on one button, on a container or on `:root`.
- **`TaoSegmented` `minWidth`** and **`--tao-segmented-option-min-width`**: the minimum width of every option, including in `block` mode.

## 3.4.1

- **Fix:** `TaoScrollTop` `variant="text"` could not be shown without a caption: `label=""` now hides it, leaving just the arrow button (the accessible name stays).

## 3.4.0

### TaoScrollTop

- **`variant`:** `solid` (default, as before), `ghost` (a light circle on a raised surface with a hairline border) and `text` (a bare uppercase caption with an arrow, always visible).
- **`label`:** a caption that appears beside the button on mouse hover (`@media (hover: hover) and (pointer: fine)`, so never on touch) and on keyboard focus. For `text` it is always shown and defaults to the locale text.
- **`side`** (`left` / `right`) picks the page edge, **`offset`** is the distance from it (`right` stays as its older name). **`labelSide`** puts the caption left or right of the button; by default it is the side opposite to `side`, so it opens towards the page, and an explicit value wins.
- **Fix:** the button had no accessible name unless `ariaLabel` was passed; it now falls back to `label`, then to the locale text.
- **Fix:** `size`, `bottom` and `zIndex` react to prop changes (they were read once at setup).
- The root is now a positioning wrapper around the button: fall-through attributes (`class`, `data-*`, …) still land on the button, but a `style` that moves the button should go to `bottom` / `offset` props instead.

## 3.3.2

- **Fix:** the focus trap of Modal, Drawer and `confirm()` no longer lets focus escape in Safari on macOS, where Tab skips buttons and links by default. After a Tab the trap checks that focus is still inside the dialog and pulls it back if not.

## 3.3.0

### Presentation

- **Showcase in English and Russian:** language switch in the header, `?lang=`, built-in component texts follow the page. English is the default.
- **Static showcase build** with relative paths (`npm run showcase:build`), ready for any folder such as `/sandbox/taoui/`.
- Repository polish: `LICENSE` (MIT), `CONTRIBUTING.md` (with the colour-token rules), `SECURITY.md`, CI, issue / PR templates, a media pipeline (`npm run media`) that captures the screenshots and clips in `docs/media`.

### Light theme

- **Light theme has its own palette** (taken from the original 666.io site) instead of a copy of the dark one: rose accent `#ff227a` (hover `#e60f66`, active `#c70a55`), black links that turn `#dc4679` on hover, white text on accent. New primitives `--tao-pink-400 … 700`.
- **Text on a solid danger fill is white in every theme** (new token `--tao-color-on-danger`); it used to follow `text-strong`, which is near-black in the light theme (danger Button, Avatar count).
- Light theme: idle text of Segmented and Tabs (`--tao-color-text-subtle`) is darker (`gray-600`).
- **Fix:** `TaoInputNumber` ± buttons no longer overflow in the `small` size.
- New optional token `--tao-button-primary-text-shadow` (none by default; the light theme sets a soft one).
- The light theme no longer inherits the dark theme's glowing link shadow.

### Status colours as text

- **New tokens `--tao-color-{danger,success,warning,info}-text` and `-text-hover`** for status colours used as text. The plain tokens are the solid-fill shades (white text on top); as text on a dark page they were dim (danger about 4:1). The text tokens use lighter shades in the dark theme and darker ones in the light theme (new primitives `green-700`, `yellow-700`, `blue-700`), at least 4.5:1 on the page and on raised surfaces, enforced by `tests/tokens.test.ts`.
- Used by `text` / `ghost` / `secondary` Button tones, Tag, Stages, FileDrop, FormField and the error text of Input and Textarea. Fills, borders and toasts are unchanged.

### Feedback

- **toast():** a light shadow hugging the edge (hook `--tao-toast-shadow`) instead of the large overlay shadow, which showed as a wide smear on stacked toasts.
- **`TaoButton` `tone="neutral"`** for `ghost` and `text`: strong text colour with the soft accent wash on hover.
- **confirm():** the cancel button is `ghost` with `tone="neutral"`, so the primary action stands out and the dialog feels lighter.

## 3.2.1

- **TaoColorPicker:** the HEX label sits above the field, like the labels over the RGB / HSL channels, so the row keeps its height in every mode.

## 3.2.0

- **TaoPinCode `format`:** `format="#-##-##"` draws visual separators between cells. They are not part of the value; a paste in that shape, or as a clean code, is split into cells.
- **TaoColorPicker:** fixed width, so switching HEX / RGB / HSL no longer resizes the popover.

## 3.1.1

- **Popovers close on an outside press in the capture phase**, so a component that stops propagation can no longer keep a popover open.
- **TaoColorPicker:** text is centred in the HEX, RGB and HSL fields.

## 3.1.0

### Colour

- **New `TaoColorPicker`**: square of saturation and brightness, hue and opacity strips, a hex field, swatches, the eyedropper where the browser has `EyeDropper`. `v-model` is a hex string (`#rrggbb`, with `alpha` also `#rrggbbaa`); keyboard: arrows move the cursor (Shift is ten times bigger).
- **Input modes**: HEX, RGB and HSL numbers, switched under the square (`modes` limits them, `v-model:mode` remembers the choice). Opacity is a percent field in RGB and HSL. `parseColor` reads `hsl()` and `hsla()` too; `rgbToHsl` and `hslToRgb` are exported.
- **New `TaoColorInput`**: a field with a swatch and the hex text; the picker opens in a popover.
- **`colorModel(source, options)`** turns your own colour storage (object, array, css string; 0…255 or 0…1; sRGB or linear) into a writable hex string for `v-model`. The pure helpers (`parseColor`, `toHex`, `rgbaToHsva`, `srgbToLinear`, ...) are exported too.
- `TaoSlider`: `ariaLabel` prop and CSS hooks `--tao-slider-track-bg`, `--tao-slider-fill-bg`, `--tao-slider-thumb-bg` (the picker colours its strips with them).
- Locale section `colorPicker`.

## 3.0.0

Cleaner slider family. Breaking changes are allowed in this major: quality over compatibility.

### Slider

- **New `TaoRangeSlider`**: two thumbs, `v-model` is a `[from, to]` pair, `minGap` keeps the thumbs apart.
- **`TaoSlider` and `TaoRangeSlider` share props:** `marks` (`true` for automatic ticks, numbers, or `{ value, label? }`),
  `discrete` (the value only sits on marks: stepped scales with captions), `format`, `vertical`, plus the old
  `min / max / step / variant / size / showValue / disabled / error / wheel`. Clicking a mark caption moves the nearest thumb.
  Slot `#mark="{ mark, active }"` draws a custom caption.
- **`marksSide`** (`'end'` by default, or `'start'`) puts the marks above a horizontal slider / left of a vertical one.
- **`flat`** hides the round thumbs (a plain filled bar); they stay in the markup for keyboard and screen readers.
- **Pure logic in `src/slider.ts`** (value ↔ position, steps without float tails, nearest thumb, marks) with unit tests.

### Fixes

- **TaoSlider takes focus on press** (it used to keep it in a text field). The field blurs first and commits its text, then the slider
  sets the value.
- **TaoInputNumber:** a value changed from outside (a slider, another field) now replaces the draft of a focused field, so blur does not
  write the stale text over it. Typing is not affected: the echo of the field's own value does not overwrite the draft.

- **A range collapsed into one point can be pulled apart again:** pressing exactly on the point decides the thumb by the direction of the
  first move (right: the upper one, left: the lower one). With `flat` such a range shows a small dash instead of disappearing.

- **No focus ring after a mouse press:** the ring is for the keyboard; it comes back on the first key press.

### Timeline

- **New `TaoTimeline`**: play / pause and «to start» buttons, a slider over time with event marks, a «time / length» label.
  `v-model` is the time, `v-model:playing` the play state; `pauseOnScrub` pauses when the user grabs the slider; `marks`, `marksSide`,
  `format`, `showRestart`, `showTime`, `variant`, `size`, slots `#mark` and `#time`. It does not advance the time itself: drive it with
  anything (for example `usePlayback` from `@1337exp/taoux/playback`). New locale section `timeline` (`playLabel`, `pauseLabel`, `restartLabel`).

### Breaking

- `TaoSlider` `v-model` is a **number** now; the `number | string` form is gone.
- **Right-click to type a value is gone** (with the `placeholder` prop): use `TaoInputNumber` next to the slider.
- **Markup:** the root is a `group`; each thumb is its own focusable `role="slider"` (keys go to the thumb, `id` for labels is on the first thumb).
  The pointer area is `.tao-slider__rail`; the root also holds the marks.
- `wheel` works for a single thumb only.

## 2.0.0

One size scale, one API standard, built-in texts in any language. Old prop and event names keep working
as deprecated aliases and print a warning in development builds; they will be removed in 3.0.

### Breaking

- **Size modifier classes are gone.** Sizes now come from CSS variables set by `.tao-size-small` / `-medium` / `-large`.
  If your CSS targeted these classes, switch to `.tao-size-*` or the variables:
  `tao-button--small|medium|large`, `tao-select--small|large`, `tao-combobox--small|large`,
  `tao-select__panel--*`, `tao-combobox__panel--*`, `tao-segmented--*`, `tao-segmented-option--small|medium|large`,
  `tao-pagination--small`, `tao-table--compact`, `tao-list--*`, `tao-list-item--s|m|l`, `tao-file-drop__zone--*`,
  `tao-slider--small` (now `tao-slider--thin`), `tao-textarea--no-border` / `--center`
  (now `--filled` / `--plain` / `--align-center`).
- **`size` has no default any more — it inherits.** A control without `size` takes the size of its ancestors,
  `medium` at the root, so pages without `.tao-size-*` look the same.
- **`--tao-field-height` is now an alias of `--tao-control-height`** and follows the current size.
  Overriding it no longer changes field height — override `--tao-control-height-medium` instead.
- **TaoSlider `size="small"` is a smaller bar now, not the thin track.** Use `variant="thin"` for seek / volume.
- **Small visual changes:**
  - Pagination `small` buttons 28 → 26px;
  - List rows `small` 32 → 26px, `large` 48 → 44px, titles 12 / 14 / 16px;
  - Table `size="small"` (old `compact`) cell text 13 → 12px;
  - Tag is 20px in medium with or without the close button (was 19 / 22);
  - Tabs tab 37 → 36px (Button height);
  - icon-only Segmented options are square;
  - Textarea min-height equals the control height;
  - Select / Combobox `large`: the clear and empty rows are 14px;
  - Textarea `dummy` no longer shows a red bar.
- **TaoCarousel on mouse / trackpad** scrolls freely and settles on a whole slide after it stops
  (CSS snap stays only on touch screens). A mouse drag keeps its momentum.

### Added

- **Sizes.** `TaoSize` (`small | medium | large`) on Button, Input, InputNumber, Quantity, Textarea, Select, Combobox,
  Date, DateRange, Segmented, Checkbox, Radio / RadioGroup, Switch, Tag, Tabs, Pagination, FileDrop, Slider, Table,
  List, PinCode, InputGroup and FormField. `class="tao-size-small"` on any element sizes the whole block.
  Tokens: `--tao-control-height` / `-padding-x` / `-padding-y` / `-font-size` / `-font-size-secondary`,
  `--tao-button-padding-x`, `--tao-indicator-size`, `--tao-tag-height` / `-padding-x` / `-font-size`.
- **Locale.** `app.use(TaoUI, { locale: localeEn })`, `setTaoLocale()`, `localeRu` (default), `localeEn`,
  types `TaoLocale`, `TaoLocaleOverrides`, `TaoUIOptions`. Pass a few keys to change single texts.
  Switching at runtime updates components already on the page.
- **Surfaces.** `surface` on TaoCard / TaoBlock (`flat | grain | glass`, type `TaoSurface`) and classes
  `.tao-surface-grain` / `-glass` for any element. Theme tokens `--tao-surface-grain-image` / `-size`,
  `--tao-glass-fill` / `-border` / `-blur`. Toast and confirm are glass by default (`surface` in their defaults, options
  and builders; `'flat'` turns it off). Glass falls back to a solid panel without blur support or with
  `prefers-reduced-transparency`.
- **`error`** on InputNumber, Quantity, Switch, Segmented, Radio, RadioGroup, Slider and PinCode.
- **`change`** on Slider, Split (on release), Spoiler, Tabs; FileDrop and Table got `change` too.
- **PinCode** `disabled`, `size`, `masked`. **Textarea** `variant` (`bar | outline | filled | plain`), `readonly`,
  `align`, `autofocus`, `blurOnEnter`. **Checkbox** `checked`. **Container** `width`. **Link** `newTab`.
  **ScrollTop** `outline`. **Space / Stages** `direction`. **Copy** `successText`. **Tabs** `items`.
- **Types** `TaoTone`, `TaoLength` (number → px, string → CSS), `TaoTabItem`.
- Length props accept both numbers and strings: Block / Card `padding` and `radius`, Flex / Grid `gap`,
  Grid `min`, List / Table `maxHeight`.
- Dev-only warnings for deprecated props, events and values (once per component and name).
- Tests (`npm test`, Vitest).

### Fixed

- Textarea `noSpace` also strips spaces from pasted text.
- Textarea `borderInverse` turns red on error.
- Slider is marked invalid inside an invalid TaoFormField.

### Deprecated → use instead

| Component | Deprecated | Use |
|---|---|---|
| Alert, Tag | `type` | `tone` |
| Tag | `pointer` | `clickable` |
| Input | `label`, `errorMessage` | `label` / `error` of TaoFormField |
| Textarea | `noBorder`, `noBackground` | `variant="filled"`, `variant="plain"` |
| Textarea | `dummy`, `textCenter`, `autoFocus`, `submitOnEnter`, `borderInverse` | `readonly`, `align="center"`, `autofocus`, `blurOnEnter`, `variant` |
| Table | `compact`, event `sort` | `size="small"`, event `change` |
| FileDrop | event `files` | event `change` |
| DropdownMenu | event `selected` | event `select` |
| Tabs | `tabs`, item `key` | `items`, item `value` |
| Checkbox | `value` (boolean) | `checked` or v-model |
| PinCode | `hidden` | `masked` |
| Copy | `successMessage` | `successText` |
| ScrollTop | `hasOutline`, `tabindex` prop | `outline`, plain `tabindex` attribute |
| Link | `asNewTab` | `newTab` |
| Space, Stages | `vertical` | `direction` |
| Container | `size` | `width` |
| Avatar | `size="s"` / `"m"` / `"l"` | `small` / `medium` / `large` |
| Divider | `size="big"` | `size="large"` |
| — | `TaoSegmentedSize` | `TaoSize` |
