# Changelog

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
