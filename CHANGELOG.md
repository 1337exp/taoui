# Changelog

## 5.10.0

Nothing to migrate.

- **`TaoInput` `variant`:** `outline` (the frame, the default), `filled` (a fill only) and `plain` (no frame, no fill, no inset), the names `TaoTextarea` already uses. A `plain` field reads as text, for an item of a list being edited: the caret shows the focus, and an error is a red line under the text, so the text does not move. The height is the same in all three. `filled` takes a fill of the text colour, so it shows on a page, a card or glass alike.
- A test now fails for any field whose control takes the field id (`:id="controlId"`) but does not split its attributes with `useControlAttrs`, so a new field cannot put its `aria-label` on the wrapper again.
- Showcase: the variants in the TaoInput section.

## 5.9.0

A new component; nothing to migrate.

- **TaoHeatmap.** A value for each pair of two things: orders by weekday and hour, visits by week and day. `values` by `rows` × `cols` (`null` is no data); a cell takes the colour of the highest threshold it reaches (`steps`, round numbers at 10–80% of the largest value by default), from faint to the full `tone`, and the legend names them («200+, 500+, 1 000+»). The `hatch` lowest levels are striped, so they read apart from the empty cells without colour too. A tip over the cell gives the row, the column and the number (`format`, by the locale by default; a `tip` slot for your own), kept on whole pixels inside the map. It is a `role="grid"`: one cell is in the tab order, the arrows, Home / End and PageUp / PageDown move it, and a screen reader reads the row, the column and the number. It fits the width of its container, and the column names show as often as they fit (`labelEvery` to choose).
- Showcase: «Orders by time» in the charts section.

## 5.8.4

A fix; nothing to migrate.

- **The rest of the fields get their name too.** `TaoQuantity` and `TaoFileDrop` pass their attributes to their control (the number input, the file input), like the fields in 5.8.3. `TaoColorInput` passes them to its trigger button, and an `aria-label` you give names it while the colour still follows: «Background: #ff8800» (without one, the locale's «Choose a colour»). `TaoColorPicker` is a `group`, so its `aria-label` names something. Each `TaoPinCode` cell says which character it is: «Character 2 of 6», from the new optional locale key `pinCode.cellLabel` (a locale written before still type-checks, English stands in).

## 5.8.3

A fix; nothing to migrate.

- **A field's attributes reach its control.** `TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoCombobox`, `TaoSelect`, `TaoDate`, `TaoDateRange`, `TaoSwitch`, `TaoCheckbox` and `TaoRadio` are a wrapper around their control, and Vue put every attribute you gave them on the wrapper: an `aria-label` named nothing there (a screen reader read the field without its name), and `name`, `autocomplete`, `inputmode`, `data-*` and listeners such as `@focus` missed the control too. Now `class` and `style` stay on the wrapper and everything else goes to the control (the input, the textarea, the trigger button, the checkbox). If you relied on an attribute or a listener landing on the wrapper, put it on an element around the field instead.
- Showcase: the search field has its own `aria-label`.

## 5.8.2

No change to the library: the showcase writes the chosen section into the address (`#section`) and opens a `#section` link, and the `taoui-dev` skill is up to date.

## 5.8.1

Fixes after 5.8.0; nothing to migrate.

- **TaoTag is centred as in 5.6.2 again.** The optical centring of 5.7.0 (`text-box`, the letters themselves in the middle) brought the tall letters too close to the top border; the line of 5.6.2 centres the text on a whole pixel, and that is what a tag does now. The horizontal centring of a wide tag stays.
- **A snackbar has no cross unless you ask.** A toast with no title and an action has no close button by default: next to the action it is a mistap waiting to happen, and the toast goes by itself. `.closable(true)` brings it back; toasts with a title keep the default.
- **The snackbar action no longer jumps on the first hover.** A toast at the bottom or in the centre stood on a fractional pixel (lines of 1.45 × 14px are 20.3px), and when the first hover repainted the action its text snapped a pixel down. The toast's lines are whole pixels now (`round()`, with the plain value for older browsers), and in a snackbar the text and the action share a baseline instead of being centred half a pixel apart. Across, a centred toast stood on half a pixel in a window of odd width (Chrome shifted the text sideways): the centred areas and the toast are an even number of pixels wide now, so the middle is a whole pixel.
- **The toast's bounce is no longer clipped.** Since the fade moved onto the toast (5.8.0) its slot clipped it, and the slight growth of the bounce and the shadow were cut at the edges. The slot clips only while its row folds away.
- Showcase: a **Backgrounds** section: plain, grain, the glow of the palette, the gradient, glow and grain, each one line of CSS from the roles and classes the kit has.

## 5.8.0

A toast for work in progress; nothing to migrate.

- **`toast().loading()`**: a spinner instead of the icon, no timeout, `aria-busy`. Finish it with a toast of the same `id` and `replace()`.
- **`toast.promise(promise, { loading, success, error })`**: loading while the promise runs, then success or error in the same place (`success` / `error` may be functions of the result / the error); it returns the same promise.
- **A glass toast keeps its blur while it fades.** The fade ran on the toast's wrapper, and an ancestor below opacity 1 cuts a `backdrop-filter` off from what is behind it (Chrome): the blur waited for the fade in and then popped in, and went out at once on the fade out. The fade now runs on the toast itself.
- **A snackbar is one line.** A toast with no title and an action puts the text and the action on one line, the action at the end as a text button, as phones do (Material, iOS); a long text wraps and the action goes under it, still at the end. With a title the actions stay below as buttons. A neutral toast (`show()`) has no icon of its own now; an icon you give, a status and the spinner still show.
- Showcase: a snackbar example, «Note deleted · Undo» at the bottom.
- **`replace()` changes a toast where it stands.** It used to drop the old one and add the new one at the end of the stack (a leave and an enter, a jump); now it takes the place and the id of the one it replaces, and the item restarts its timer for the new content.

## 5.7.0

Two options and the visual fixes made after 5.6.0; nothing to migrate.

- **`TaoPagination pageSizes`** (`[10, 20, 50, 100]`): a «Per page» choice next to the total, `v-model:page-size`. A new size moves the page so the first row on screen stays on screen (rows 41–60 at 20 a page are page 1 at 50). The caption is the locale key `perPageText` (optional, so a locale written before still type-checks) and labels the list for a screen reader.
- **`TaoNav indicator="line"`**: the current section in the accent colour with a short line instead of a tint, under the item in the bar look and along its start edge in the rail and the side panel; `auto` moves it with the look. `pill` stays the default.
- **No flash on a field that opens a list.** TaoSelect, TaoDate and TaoDateRange lit their frame on the press (focus) and dropped it at once when the list opened (the focus moves into the list): now the field stays lit while its list is open.
- **The hover shows on any fill.** Rows and controls under the pointer (menus, the menu bar, Select / Combobox options, the tree, the nav, lists, the table, pagination, the calendar, secondary buttons) take the new role `--tao-color-hover`, a see-through wash of the strong text, instead of the solid `--tao-color-surface-hover`. It shows on a grain or glass panel too, and the default dark theme gets a hover you can see (1.27:1 against the raised surface, gray-700 on gray-800 was 1.09:1; palettes 1.16 → 1.25). `surface-hover` stays the solid colour (the colour inputs' checkerboard uses it).
- **The neutral fill under the pointer is a step, not a jump.** It went to the text colour: near-white in the dark themes, so the white label was lost on it, and near-black in the light one. The new role `--tao-color-neutral-hover` steps it a little darker in the dark themes and a little towards the strong text in the light one; the label stays about 7.6:1.
- **TaoTag** centres its text when it is wider than the text (a grid, a fixed width), and centres the letters themselves: a font keeps more room above its letters than below (Segoe UI, Roboto), so with the line box centred the lowercase sat about half a pixel low. Where `text-box` is supported (Chrome 133+, Safari 18.2+) the text is trimmed to the x-height and the baseline, with padding that gives the ascenders and descenders their room back, and the offset is rounded to a whole pixel, so the fix of 5.6.2 (no jumping text) holds; a tag with an avatar keeps the plain centring; elsewhere it is as it was.
- Showcase: the sparkline cards show a trend tag in the `#corner` of TaoCard.

## 5.6.2

Two pixel-level fixes; nothing to migrate.

- **`TaoTag`: the text no longer jumps from one tag to the next.** The line was `1.25` (15px in a 16px inside, so the text stood 1.5px from the edge). On a fractional position of the page the box and the text rounded to different pixels, and in a list of cards the text of one tag sat a pixel higher than in another. The line is as tall as the inside of the tag now (`calc(var(--tao-tag-height) - 2px)`), the text stands a whole pixel from the edge in every size.
- **The cross of `TaoDrawer`, `TaoModal` and `TaoAlert` is in the middle of its button.** In a flex button Chrome keeps the icon's span `inline-flex`, and `align-items: center` put the icon 2px above the middle (next to the title it looked high). The button is `inline-grid` with `place-items: center` now; it is still `1em x 1em` (5.6.1).

## 5.6.1

- **Fixed: the cross of TaoDrawer, TaoModal and TaoAlert was 24 x 28 px, so its focus ring was a rectangle.** The cross is an inline SVG icon (since 5.0), but the button was still sized as a text glyph: a block that is a text line tall, with the gap under the baseline below a 24px icon. The button is a flex box of exactly the icon's size (`1em x 1em`) now, and the ring is square. Nothing to migrate.

## 5.6.0

Typing a date, as Next Up's old app did; nothing to migrate.

- **`TaoDate editable`**: a text field you type the date into, with the calendar on a button next to it (or ↓). The text is read in the locale's order of day and month: `5` is the 5th of this month, `5.3` the 5th of March (`3/5` in en-US), `05.03.26` and `5.3.2026` full dates, digits alone split as `0503` / `050326`, ISO works too; a two-digit year goes to the nearest century. Enter or leaving the field applies it; a text that is not a date, or a date outside `min` / `max`, puts the value back; Esc drops the typing (and only then the next Esc reaches a dialog around it); an empty field is `null`. The field shows the date in numbers as the locale writes it (`05.03.2026`, `03/05/2026`). `parse` and `format` take your own rules («tomorrow»), `calendarLabel` names the button (an optional key of the locale, so a locale written before still type-checks). Without `editable` TaoDate is the button it was.
- **Exported:** `parseTaoDateInput(text, { locale, reference })`, `formatTaoDateShort(iso, locale)`, `taoDateOrder(locale)`.
- **Docs:** the default `locale` of TaoDate and TaoDateRange is the app locale (`setTaoLocale`), not `'en-US'` as the prop table said.

## 5.5.0

What a phone interface needs, asked for by an app built on TaoUI (Next Up); nothing to migrate.

- **`TaoDrawer side="bottom"`**: a bottom sheet. It rises from the bottom edge, as wide as the screen up to 640px (centred on a computer), as tall as its content up to 90% of the screen, with rounded top corners, a grip and its last line above the safe area. Esc, the backdrop and the focus trap as before.
- **`TaoModal fullscreen`**: `true` is the whole screen, square corners, the header and the footer stay while the content scrolls, the safe areas kept; `'narrow'` does that only on a screen narrower than 600px, so one modal is a dialog on a computer and a page on a phone.
- **Eight app icons**: `tao-settings`, `tao-edit`, `tao-trash`, `tao-bell`, `tao-tag`, `tao-repeat`, `tao-undo`, `tao-redo`. 40 built-in icons now (the docs still said 29, though the alignment icons of 5.2 had made it 32).
- **Showcase:** on a phone the page no longer scrolls sideways (the carousel demo widened it to its slide track, and the theme switchers did not wrap), so a sheet or a fixed bar is not cut at the edge.

## 5.4.5

- **The slider has one cursor, the pointing finger**, over the rail, over the thumb and for the whole drag (TaoSlider, TaoRangeSlider, TaoScrubber). It was `grab` over the thumb, `grabbing` while pressed and, once the pointer moved, the rail's finger (the rail holds the pointer capture): three shapes flickered in one gesture, and Opera on Windows draws `grab` / `grabbing` as the four-way move arrows and an up arrow. The finger looks the same in every browser.

## 5.4.4

Visual fixes, nothing to migrate.

- **TaoNav does not move when the page scrolls.** The side column (the action and the items of the rail and the side panel) stuck at `top: 0` although it stands below the panel's 4px padding, so the first 4px of scrolling lifted it against the edge; it now sticks where it stands. The floating bar jumped up a fraction of a pixel with the content at the very end of the scroll (the page height is often fractional and the scroll end is rounded up): its bottom margin is now 1px short of its sticky offset, so it stays stuck.
- **TaoAlert folds with a slide**, as TaoSpoiler does: the body's row closes from `1fr` to `0fr`, and the text gets `hidden="until-found"` when the slide has ended, so find-in-page still opens it. With reduced motion it folds at once.
- **Series colours stand further apart.** In the dark theme chart-4 (violet) sat next to the info blue of chart-2 (colour distance 0.092): it is a deeper violet now (`--tao-violet-400` `#9d5cff`, 0.189). In the light theme chart-4 is a purple (`--tao-violet-600` `#b03ad1`) and chart-6 orange (`--tao-tangerine-600`, new), because teal sat on the dark success green (0.093). A test keeps every pair of both themes at least 0.11 apart and 3:1 on the page. `--tao-teal-600`, added in 5.3.0 for that teal, is gone.

## 5.4.3

- **Fixed: the bottom bar of TaoNav rose under the content on a page shorter than the window** (an empty list, a short settings page). The root had no height of its own and the grid inside only shared the height of the content. The root is now a flex column and the shell fills it, so a min-height / height given to TaoNav (min-height: 100dvh for a whole-window app) keeps the bar at the bottom, and the rail and the side panel run the full height. Nothing to migrate: without a height it behaves as before.

## 5.4.2

- **Fixed: a toast in a centred position stuck to the left edge.** `topCenter` (the default), `bottomCenter` and `center` span the whole width, and the stack inside was `width: 100%`, so there was nothing to centre. The stack now shrinks to its widest toast in those three positions and `justify-content: center` centres it. Corner positions are unchanged. Nothing to migrate.

## 5.4.1

- **Fixed: a striped `TaoCard` / `TaoBlock` painted over a sticky `TaoNav` bar.** The stripe layer (`::after`) and the Card `#corner` use `z-index: 1`, but a panel did not form a stacking context, so they joined the page's layer and tied with the bar (`z-index: 1`, earlier in the DOM): the coloured stripe ran across the bottom bar while a card scrolled under it. `.tao-panel` is now `isolation: isolate`. Nothing to migrate.

## 5.4.0

One slot, nothing to migrate.

- **`TaoNav` `#action`:** the main action of a screen (Compose, New) moves with the navigation instead of staying in a far corner of a wide screen. Pass a `TaoButton` with `icon` and its text in `<span class="tao-nav__action-label">`. The bar look puts it round above itself at the end side, 12px off like the pill (with `floating` it lines up with the pill's edge, so it follows a centred pill); the rail puts it round at the top, above the items; the side panel puts it at the top, full width, with the text (an extended button). In the round looks the text is visually hidden and stays the button's name. CSS places it from the same `--_*` variables as the rest, so `layout="auto"` switches it by container queries without JS; that is also why the slot has no props: only CSS knows the look in `auto`. The hand-placed round button of the 5.2 showcase is gone.

## 5.3.0

Small charts and a bridge to chart libraries; nothing to migrate.

- **`TaoSparkline`**: a trend for a card, a table cell or a line of text. `values` (a `null` is a gap that splits the line), `area`, `dot` on the last value, `tone`, a fixed `min` / `max` to compare several. With `label` it is an image with that name, without it a decoration.
- **`TaoMeter`**: a measured value in a range (`role="meter"`): disk space, a battery, a score. With `low` / `high` / `optimum` it colours itself as the HTML `<meter>` does: the region of the optimum is success, the next one warning, the far one danger. `label`, `valueText` (a number or your own text, read as `aria-valuetext`). The progress of a task stays `TaoProgress`.
- **`TaoDonut`**: a share of a whole, from `segments` (`{ label, value, tone?, color? }`) or a single `value` of `max`. `legend`, a centre slot, `size` / `thickness`; a screen reader hears the label and every part with its share.
- **Series colours** `--tao-color-chart-1…6`: the accent first, then the info, success and warning roles (so a palette moves them away from its accent), a violet and, last, pink in the dark theme or teal in the light one, whose accent is pink. Red is left out: it reads as «bad». Palettes re-declare the series built on roles and give their second stop to chart-4. New primitives `--tao-violet-400 / -600`, `--tao-teal-600`.
- **`taoChartTheme(el?)`** returns the theme colours for Chart.js, ECharts, uPlot and the like, resolved where the element is (its palette, its mode) and converted to `rgb()` / `rgba()`: the roles are often `color-mix()`, which canvas libraries do not parse. **`watchTaoChartTheme(apply, el?)`** calls it now and on every theme, mode or palette change. TaoUI will not grow axes, tooltips or zoom: that is a chart library's work.

## 5.2.0

New components and options, nothing to migrate.

- **`TaoToolbar`**, **`TaoToolbarGroup`**, **`TaoToolbarSeparator`**: a bar of tools (`role="toolbar"`). It is one Tab stop with a roving tabindex: `←` / `→` (`↑` / `↓` with `orientation="vertical"`) walk the items and wrap, Home / End go to the ends, disabled items are skipped, and the bar remembers the last item. The items are found in the DOM, so any control fits: inside a `TaoSegmented` the arrows pick the option and move on from its edge, a text field keeps its arrows. A thin line across the bar splits the groups; `inset` puts a sunken pill behind a group. `variant="panel | plain"`, `size`.
- **`TaoButton` `v-model:pressed`:** a toggle button (Bold, a filter). It says `aria-pressed` and, while pressed, wears a wash of its tone's text colour (every variant but `primary`). Without the prop the button is unchanged.
- **`TaoNav` `floating`:** in the bar look the panel is a detached pill above the page, inset from the edges and above the safe area, with a shadow and a pill for the active item; 520px at most, centred. The rail and the side panel do not change, in `auto` too. The main action of a screen belongs beside it as your own round button (see the showcase), not in a notch of the bar.
- **Icons** `tao-align-left`, `tao-align-center`, `tao-align-right`.

## 5.1.1

Visual fixes, nothing to migrate.

- **Dark theme tone fills:** the neutral button had a dark label on its grey fill (3.4:1), it is white now (5.7:1) through a new role `--tao-color-on-neutral` (white in both themes). Success and info are a step lighter (`green-400`, the new `blue-300`) so they read as buttons on a dark page with their dark label, and **warning leans to orange** (`--tao-tangerine-400`, `#ff8f3d`): the amber accent keeps yellow, so the two are not mistaken for each other (colour distance 0.037 → 0.114 for the text, as fill and as text). The light theme and the palettes are unchanged.
- **Hover is twice as quick:** `--tao-transition-base` runs on the new `--tao-duration-hover` (0.1s instead of 0.2s), so a state follows the pointer instead of trailing behind it; other motion keeps its durations. Rows the pointer sweeps across (TaoMenu items, TaoMenubar entries, TaoTree rows) change at once, as in a system menu.
- **TaoSplit cursors** are the matching pair `ew-resize` / `ns-resize` (`col-resize` / `row-resize` are drawn as two different shapes on Windows).

## 5.1.0

Two small additions, nothing to migrate.

- **`TaoSwitch` `loading`**: the change is being applied (a request is on its way). A spinner runs on the thumb, a click does nothing and the box stays as the model says, the switch is not greyed out like a disabled one, and `aria-busy` tells a screen reader.
- **A contact patch on the slider thumb** (`TaoSlider`, `TaoRangeSlider`, `TaoScrubber`): a soft ring of the thumb's own colour around the dot, wider under the pointer and widest while dragging, as if a finger pressed it. A shadow, so the layout and the hit area stay the same; none on `flat` and disabled sliders; the keyboard focus ring moves outside it.

## 5.0.0

A foundation release: shared mechanisms instead of per-component copies, and a clean API. Everything deprecated since 2.0 is removed, so read [MIGRATION-5.md](MIGRATION-5.md) first. Why and how: `docs/v5-plan.md`.

In numbers: the tarball is 329 KB (560 KB before the ESM-only build), 451 tests (183 before), one floating-panel engine instead of eight copies, 27 built-in icons instead of three icon mechanisms, one tone mechanism instead of six. TaoUX 0.2.0 and taofx follow it.

### Breaking

- **Every name deprecated since 2.0 is removed**, with the tone alias `error` (Alert, Tag, Avatar `dot`, `toast`). The table old → new is in [MIGRATION-5.md](MIGRATION-5.md).
- `TaoTabItem` is a plain `{ value, label, disabled? }`; `TaoSegmentedSize` and `TaoListSize` are gone (use `TaoSize`); `--tao-field-height` and `--tao-color-text-on-accent` are gone.

### Palettes

- **White labels on light-mode fills:** the text colour on a fill is picked by APCA (`apcaContrast` and `contrastRatio` are exported; README «Contrast: WCAG 2 and APCA» explains both), the contrast model of the coming WCAG 3, instead of the larger WCAG 2 ratio, which overrates black on mid-tones (on `#2ea85c` WCAG 2 says black 6.4 vs white 3.1, the eye and APCA say white Lc 62 vs black 47). In light mode every palette now puts a white label on its accent and statuses, the fill moved a little deeper to keep 4.5:1 (Pinheiro `#27997a` → `#008567`); dark mode keeps its light accents with a dark label. A status is now measured against the accent after it is fitted for its label, so a deeper status cannot come close to the accent. The default light theme follows: success / warning / info are `green-700` / `yellow-700` / `blue-600` with a white label (they had a dark one).
- **Seven ready palettes** (`sunset`, `marple`, `violet-dusk`, `ocean-blue`, `pinheiro`, `tokyo-night`, `lagoon`), each with a dark and a light mode: `import '@1337exp/taoui/palettes.css'`, then `data-tao-theme="sunset"` (+ `data-tao-mode="light"`). They are separate opt-in files, the core stylesheet did not grow.
- **A palette is four colours.** The accent is picked by lightness and moved only along lightness until it is seen (3:1), carries text (4.5:1) and reads as text (4.5:1); the surfaces are a tint of the palette's deepest hue; the statuses keep their hue sector but share the palette's lightness and chroma, and are pushed away from the accent when they would be mistaken for it. A palette can name its accent stop or a status colour when the automatic choice is not right.
- **`applyTaoPalette(def, mode, el?)`** puts the same roles on the page (or an element) at run time, for your own palette or a colour a user picked; `taoPaletteCss(def)` returns the CSS; `taoPalettes` is the list for a picker. The code is `src/palette.ts` (OKLCH maths, no dependencies); the preset files are generated from it (`npm run palettes`) and a test keeps them equal.
- **New roles** in both default themes: `--tao-color-accent-2`, `--tao-glow`, `--tao-gradient`, `--tao-bg-atmosphere`, and the class `.tao-atmosphere` (a static glow behind the page, no blur). `data-tao-mode="light" | "dark"` works next to `data-tao-theme`.
- 150 palette tests: contrast of the accent, its text and every status in both modes of every palette, statuses told apart from the accent, hue sectors, no invented roles, the files equal the generator.
- The showcase has a palette picker (with the four colours of the chosen one) next to the dark / light switch; the choice is remembered.

### Packaging

- **A skill for AI assistants** ships in the package: `skills/taoui/SKILL.md` (setup, rules, themes and contexts, layout, forms, overlays, mistakes to avoid) and `references/components.md`, generated from the showcase prop tables by `npm run skill`. `tests/skill.test.ts` keeps the reference generated and the skill naming every exported component, every palette and only tokens that exist. The repository has its own `.claude/skills/taoui-dev` for working on TaoUI.
- **ESM only.** The CommonJS build and its source map are gone (`dist/index.js`, `index.d.ts`, `styles.css`, one map): the tarball is smaller and there is one way to load the library. `require()` users switch to `import()`.
- `package.json`: `exports` with `types` + `default`, `sideEffects: ["**/*.css"]`, `files` include `MIGRATION-5.md`, `browserslist` (Chrome / Edge 111, Safari 16.4, Firefox 128; the build targets the same), the unused `nuxt` peer is removed.
- **Style files are laid out by layer:** `tokens/` (primitives, theme-independent semantic roles), `themes/` (`dark.css` holds the colour roles, `light.css`), `contexts/` (size, tone, surface), `base.css`. `styles.css` is the same bundle (dark and light).
- `npm run lint:package` (`publint` + `attw`) and the consumer smoke test run in CI; README has a "Browser support" section.

### Components

- **New `TaoMarquee`** (from the home page's MarqueeText): one line that runs round only when it does not fit, with fading edges (the left one in a padding outside the text, so at rest the line stands in place) and a pause at the start of every round; only `transform` moves. It stops on hover (`pauseOnHover`), on focus (a running line is a tab stop) and on a tap, and `paused` stops it from the app (WCAG 2.2.2); with `prefers-reduced-motion` it wraps. The second round is `aria-hidden` and `inert`, so a link in the slot stays one tab stop. `text` or the default slot, `speed`, `gap`, `fade`; `measure()`.
- **Fixed: a `TaoCard` with only `#media` stretches its picture over the whole card again** (a mosaic tile): the stylesheet still named the old `tao-card--cover-only` class after the `cover` → `media` rename.
- **Adaptive bento in `TaoGrid`:** `cols`, and `col` / `row` / the new `order` of `TaoGridItem`, take a number or a value per width class of the grid itself (`compact` < 600px, `medium` < 840px, `expanded`, as TaoNav), mobile first; `col: 'full'` is the whole row, and a span never runs past the columns there are. `rowHeight` sets the height of every row (a mosaic keeps its proportions). **Fixed:** the narrow-grid rule never applied (a container query cannot ask an element about its own width): a narrow grid kept its columns and only lost the spans; the grid now has an outer element that measures and an inner `.tao-grid__cells` that lays out. A plain number still means one column on a phone, at 600px instead of 560px.
- **Crisp plus and minus:** an icon of only straight lines through the middle (`grid: true` in `TaoIconDef`; `tao-plus`, `tao-minus`) is drawn 2 screen pixels wide and snapped to the pixel grid. Scaled to 14–16px its 1.2px line used to fall between two pixels and go soft (4 solid pixels and 32 half-transparent ones at 14px, 28 / 8 now). Your own icons can set `grid` too.
- **Button labels are not selected** with the text around them: `user-select: none` on TaoButton, the tabs of TaoTabs, the entries of TaoMenubar and TaoNav, the TaoCopy button and the TaoSpoiler header (the rest already had it).
- **`TaoPinCode` `status`** (`idle | success | error`), set by the app after `complete`: `error` shakes the group once and paints the cells red (`aria-invalid`), `success` runs a soft glow over the cells from the left and paints them green; a hidden `role="status"` says it in words (`successText` / `errorText`). `play()` repeats the animation for a second wrong code; no motion with `prefers-reduced-motion`.
- **`TaoAlert` `collapsible`** with `v-model:collapsed`: the title becomes the disclosure button (`aria-expanded`, `aria-controls`), the tone stays; the folded body keeps its text in the DOM with `hidden="until-found"`, so find-in-page and links to text open the alert (`beforematch`). Without a title the toggle says «Details» (`detailsLabel`). The message is a `<div>` now (it was a `<p>`), so it can hold lists and blocks.
- **`stripe` on `TaoCard` and `TaoBlock`**: a coloured stripe on one side (`top | left | bottom`), `stripeTone` = a tone (accent by default) or `gradient` from the palette, so it follows the theme. It is a layer with the panel's own radius: the corners clip it, over a picture in `#media` too and with `overflow`. Token `--tao-stripe-width` (4px); the classes `.tao-stripe-*` work on any `.tao-panel`.
- **A checked box shows a tick** (TaoCheckbox, TaoChecklist, TaoTree): the square inside an accent box read as an empty frame at a glance. The shape is in percentages of the box, the same in every size; a mixed box is still a dash.
- **New `TaoTimeline`, a vertical event feed** (the name of the old player, now `TaoScrubber`): `TaoTimelineItem` with `title`, `time` + `datetime` (`<time>`), `description`, `icon`, `tone`. `active` makes it a progress (the line filled up to the current event, `aria-current="step"`, the next ones upcoming), without it a log of the past. `align="alternate"` puts the events on both sides and folds into one side below 480px of its own width (a container query). Slots `#marker`, `#title`, `#content` with `{ item, index, state, active }`.
- **New `TaoChecklist`**: checkboxes with one model, the checked values in the order of the items (`TaoChecklistItem`: `value`, `label`, `description`, `disabled`). `selectAll` with a mixed state (it leaves a disabled item alone), `counter` «3 of 5» (`aria-live`), `strike` for a to-do list (the whole text of a done item, its description too). A fieldset with a legend; in a `TaoFormField` the group takes the id, the label and the error, the checkboxes inside keep ids of their own.
- **New `TaoTree`**: a tree of files or objects (`TaoTreeNode`: `id`, `label`, `icon`, `children`, `hasChildren`, `disabled`). `v-model:expanded`, `selection` `none | single | multiple` with `v-model:selected`, `checkable` with `v-model:checked` (the model holds the nodes without children; parents are checked / mixed by them, a click toggles a whole branch), lazy children through `load(node)` with a spinner, `aria-busy` and `load-error`. The ARIA tree keyboard (one tab stop, ↑ ↓, → / ←, Home / End, `*`, type-ahead); a flat list with `aria-level`. Slots `#icon`, `#label`, `#actions`. Two new built-in icons, `tao-folder` and `tao-file` (29 in all).
- **`TaoInputNumber` stepper icons** follow the height of the field (`0.28 ×` the control height: 10px at medium), instead of the text size that almost touched the border, and keep a crisp 1.5px line (`vector-effect: non-scaling-stroke`, `shape-rendering: crispEdges`) instead of a soft 0.8px one.
- **`TaoPagination` `pageInput`**: a field to type a page in, `true` always or a number of pages from which it shows (`false` by default). Enter or leaving the field goes there, clamped to the range; Esc drops it; the current page is the placeholder.
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

- **Opening a menu never scrolls the page:** the position is written to the panel at once (a `focus()` right after it used to see the panel where it stood the previous time, and after the page layout changed the browser scrolled there), a closed panel forgets its place, and panels take the focus with `preventScroll`.
- **Floating panels no longer trail a smooth scroll:** a panel is `position: absolute` in document coordinates and scrolls together with the page; `fixed` only when its anchor is pinned to the screen (a `fixed` / `sticky` ancestor, the context menu point). Before, a `fixed` panel was moved from the `scroll` event, which comes a frame after the page has moved.
- **One shape for every floating panel:** Menu, Select, Combobox, Popover and the date panel take `--tao-radius-panel` (8px), their items the concentric radius `panel − padding` (4px), the same as the entries of `TaoMenubar`. Before, the menu items came out square (4 − 4) and the Select options stuck out of their panel corners.

- **One positioning, dismiss and layer engine** instead of eight copies: `computePosition` (pure, tested) and `useFloating` (follows scroll and resize), `useDismiss` (outside press, capture phase), `useLayer` (a stack of open layers: **Escape goes to the top one only**, page scroll lock, focus return), `useListNav` (arrows, Home / End, type-ahead, disabled items skipped). Popover, Tooltip, Select, Combobox, Date, DateRange, the Copy tip, Modal, Drawer and `confirm()` use them.
- **New `TaoMenu`** and a rebuilt **`TaoDropdownMenu`** on it: a data tree `items` with submenus, checkboxes, radios, group labels, separators, shortcuts (a ready string to show), disabled items; `aria-activedescendant`, type-ahead, `→` / `←`, Tab closes. Types `TaoMenuItem`, `TaoPlacement`.
- **New `TaoMenubar`** (an ARIA menubar: one tab stop, `←` / `→` with wrap, Home / End, `↓` / Enter / Space open, with a menu open `←` / `→` and the pointer switch to the neighbour menu, Esc gives the focus back to the entry; a top entry without `items` is a plain action) and **`TaoContextMenu`** (a menu at the pointer on the right click, the Menu key / Shift+F10 open it at the element; `display: contents`, so the layout does not change; closes when the page scrolls). **`closeOnScroll`** is on every menu: `TaoMenu`, `TaoDropdownMenu` and `TaoMenubar` (off: the menu follows its button), `TaoContextMenu` (on: the point it opened for moves away); a new close reason `'scroll'` and `menuReturnsFocus(reason)` for your own shells. The menus take the density of their anchor and pad their items with the control tokens, so `comfortable` gives finger-sized rows in them too. `TaoMenu` emits `edge` for `←` / `→` that have nowhere to go inside it.
- **`placement`** (`top` / `bottom` / `left` / `right` plus `-start` / `-end`) replaces `position` on Popover, Tooltip and ColorInput.
- A Select inside a Modal no longer closes the Modal on Escape.

### Tone

- **One mechanism for every status colour.** `.tao-tone-<name>` (accent, neutral, success, danger, warning, info) sets `--tao-tone`, `-hover`, `-on`, `-text`, `-text-hover`, `-subtle`, `-wash`; Button, Alert, Tag, toast, confirm and the Avatar dot read only those. The tokens do not inherit, so a Button inside a red Alert stays an accent button. New `toneClass()` helper and `TaoToneName` type.
- **`TaoButton`: `tone` works on every `variant`** (it only painted ghost and text before); `variant="danger"` is gone (use `tone="danger"`); about 30 hand-written selectors became 8.
- New role tokens: `--tao-color-accent-text(-hover)` and `--tao-color-on-success|warning|info`. The light theme's ghost / text Button label is now readable (5.8:1 instead of 3.6:1).
- Tests hold every `on-*` colour to 4.5:1 (the light accent's white-on-rose, 3.64:1, is the one documented exception) and every tone's text to 4.5:1.

### Tokens

- **Typography layer** (`styles/typography.css`, in `styles.css`, opt-in by class): a heading scale from `--tao-text-base` (16px) and `--tao-text-ratio` (1.25) → `--tao-heading-1…6` (49 / 39 / 31 / 25 / 20 / 16), recomputed wherever the ratio is set; h1 / h2 fluid on a narrow screen. `.tao-prose` styles the text inside a wrapper (`:where()` rules, roles for colours, spacing from the text size), `.tao-heading-1…6` gives any tag the look of a level. `--tao-line-height-body` / `-heading`, `--tao-font-family-mono`.
- **Density, a second axis of the controls:** `.tao-density-compact` / `-comfortable` / `-auto` (and `-default` to reset) on any container change the height and the padding of every size, not the font: comfortable 34 / 44 / 52px, compact 22 / 32 / 40px, auto = comfortable on `pointer: coarse`. Size and density combine anywhere in the tree (the current tokens are recomputed wherever either changes); Select and Combobox carry the density into their teleported panels. Tokens `--tao-density-*`, type `TaoDensity`; the showcase header has a switch.
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
