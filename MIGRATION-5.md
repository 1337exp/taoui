# Migrating to 5.0

5.0 is a deliberate breaking release. This page grows with every phase; **what is listed here is already done on the `v5` branch**.
Everything that 2.0 deprecated is deleted, together with its warnings.

## Removed names → what to use

| Component | Removed | Use |
|---|---|---|
| Alert, Tag | `type` | `tone` |
| Alert, Tag, Avatar `dot`, `toast` | tone `error` | `danger` (`toast.error()` → `toast.danger()`, type `TaoToastType` loses `'error'`) |
| Tag | `pointer` | `clickable` |
| Input | `label`, `errorMessage` | `label` / `error` of `TaoFormField` |
| Textarea | `noBorder`, `noBackground` | `variant="filled"` / `variant="plain"` |
| Textarea | `dummy` | `readonly` |
| Textarea | `textCenter`, `autoFocus`, `submitOnEnter` | `align="center"`, `autofocus`, `blurOnEnter` |
| Textarea | `borderInverse` | none (the bar on the right is gone) |
| Table | `compact`, event `sort` | `size="small"`, event `change` (or `v-model:sort`) |
| FileDrop | event `files` | event `change` |
| DropdownMenu | event `selected` | event `select` |
| Tabs | `tabs`, item `key` | `items`, item `value` |
| Checkbox | `value` (boolean) | `checked` or `v-model` |
| PinCode | `hidden` | `masked` |
| Copy | `successMessage` | `successText` |
| ScrollTop | `hasOutline`, `tabindex` prop | `outline`, a plain `tabindex` attribute |
| Link | `asNewTab` | `newTab` |
| Space, Stages | `vertical` | `direction` |
| Container | `size` | `width` |
| Avatar | `size="s"` / `"m"` / `"l"` | `small` / `medium` / `large` |
| Divider | `size="big"` | `size="large"` |
| Progress | `min`, `max` | `minWidth`, `maxWidth` |
| Stages | item `status: 'danger'` | `'bad'` |
| types | `TaoSegmentedSize`, `TaoListSize`, the deprecated `key` form of `TaoTabItem` | `TaoSize`, `TaoSize`, `value` |
| CSS | `--tao-field-height` | `--tao-control-height` |
| CSS | `--tao-color-text-on-accent` | `--tao-color-on-accent` |

## Overlays

| What | Before | Now |
|---|---|---|
| `TaoDropdownMenu` data | `actions: { id, name, ico? }[]` | `items: TaoMenuItem[]`: `{ id, label, icon?, shortcut?, disabled?, items? }`, `{ type: 'checkbox' \| 'radio' \| 'label' \| 'separator' }`; `name` → `label`, `ico` → `icon` |
| `TaoDropdownMenu` slot `item` | `{ id, ico, text }` | `{ item, id, label, icon }` |
| `TaoDropdownMenu` DOM | `.tao-dropdown-menu__list`, `__item` (buttons) | `.tao-menu`, `.tao-menu__item` (`role="menuitem"` divs); the trigger button keeps its classes |
| `TaoPopover`, `TaoTooltip`, `TaoColorInput` | `position="top" \| "bottom" \| "left" \| "right"` | `placement` (same four plus `-start` / `-end`); Popover and ColorInput default `bottom-start`, Tooltip `top`, DropdownMenu `bottom-end` |
| Escape in Modal, Drawer, `confirm()`, popups | handled on the dialog, only with focus inside | one document listener, **top layer only**: a Select inside a Modal closes first, the Modal on the next press |
| Popup keyboard | Select had Home / End, the others did not | the arrows skip disabled items, Home / End and type-ahead where it is a list (Select, menus) |

New: `TaoMenu` (the menu panel with submenus, checkbox and radio items, type-ahead, `aria-activedescendant`), types `TaoMenuItem` and friends, `TaoPlacement`; composables behind them (`useFloating`, `useDismiss`, `useLayer`, `useListNav`) are internal for now.

## Packaging and styles

| What | Before | Now |
|---|---|---|
| Module format | ESM (`index.mjs`) **and** CommonJS (`index.cjs`) | **ESM only**, `dist/index.js`. `require('@1337exp/taoui')` fails: use `import` or `await import()`. Vite, Nuxt 3, webpack 5 and Node 18+ with `import` are unaffected |
| `package.json` | `main`, `module`, `exports.import` / `exports.require`; `nuxt` as an optional peer | `exports["."] = { types, default }`; `sideEffects: ["**/*.css"]`; the only peer is `vue` |
| Style files | `src/styles/primitives.css`, `semantic.css`, `size.css`, `tone.css`, `surface.css`, `base.css`, `themes/light.css` | `tokens/primitives.css`, `tokens/semantic.css` (theme-independent roles), `themes/dark.css` (the colour roles), `themes/light.css`, `contexts/size.css`, `contexts/tone.css`, `contexts/surface.css`, `base.css`. The colour roles that lived in `semantic.css` are now in `themes/dark.css` |
| `@1337exp/taoui/styles/*` imports | `…/styles/primitives.css`, `…/styles/semantic.css` | `…/styles/tokens/primitives.css`, `…/styles/themes/dark.css`, … (`styles.css` with everything is unchanged) |
| Browsers | not stated | Chrome / Edge 111, Safari 16.4, Firefox 128 (`browserslist`, the build target, README) |
| Release checks | type-check, tests, build | + `publint`, `attw` (`npm run lint:package`) and the consumer smoke test (`npm run smoke`) in CI |

For TaoUX: its bridge test reads `node_modules/@1337exp/taoui/src/styles/semantic.css`; the same roles are in `themes/dark.css` now (the 13 contract tokens are unchanged).

The light theme stays in the core stylesheet: it is 3 KB, and a second import to turn it on would be a step for nothing. Palettes (5.1) will be separate opt-in files.

## Components

| What | Before | Now |
|---|---|---|
| `TaoTimeline` | the play / pause + time slider | **`TaoScrubber`** (the name `TaoTimeline` is free for a vertical event feed). Classes `.tao-timeline*` → `.tao-scrubber*`; locale section `timeline` → `scrubber`. API unchanged |
| `TaoCard` slots | `cover`, `headerTitle`, `headerSecondary`, `header` | `media` (was `cover`), `header` (a free row: lay out left and right yourself, replaces `headerTitle` / `headerSecondary`), `title`, `sub`, default, `footer`, `overlay`, and the new `corner` (top right: a tag, a menu button) |
| `TaoCard` classes | `.tao-card__cover`, `--cover-only`, `__header-title`, `__header--between` | `.tao-card__media`, `--media-only`; the others are gone |
| `TaoCard` | no way to close | `closable` + event `close` (+ `closeLabel`, locale section `card`); `--tao-card-corner-size` reserves room for the corner |
| `TaoTabs` `justify` | any CSS string | the `TaoJustify` keywords (`flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly`, `normal`), as in `TaoFlex` |
| `TaoGrid` / `TaoGridItem` | the 560px rule in both files | in `TaoGrid` only (one place); same behaviour |
| `TaoDate` / `TaoDateRange` DOM | the panel holds the month header, grid, footer itself | the panel holds a **`TaoCalendar`** (`.tao-calendar`, a group labelled with the month); the day / header / footer classes `.tao-date__*` are unchanged. The popup is `role="dialog"` labelled with the field text |
| `TaoAnimatedBorder` | the rainbow only, radius `2 × width` | `variant` (`rainbow` / `tone`), `tone`, `colors`, `radius` (default `--tao-radius-panel`; the border outside is radius + width); still gradient with `prefers-reduced-motion`; the rainbow list is the token `--tao-gradient-rainbow` |
| language on the server | one global value shared by every request | `app.use(TaoUI, { locale })` on the server gives **that app** its language and leaves the global one alone; in the browser it is `setTaoLocale` as before |

New: `TaoCalendar` (an inline month calendar: `mode="single"` or `"range"`, keyboard, min / max), `provideTaoLocale()` (another language for a subtree), `TaoJustify`; internal: `useField` (what every form control takes from `TaoFormField`).

## Icons

| What | Before | Now |
|---|---|---|
| Close / clear / remove buttons (Alert, Drawer, Modal, Tag, FileDrop, toast) | the text `×` / `✕` | `<TaoIcon name="tao-close">`; the `#close-icon`, `#clear-icon`, `#remove-icon` slots still replace it |
| InputNumber / Quantity steppers, Pagination arrows, Spoiler arrow, Timeline buttons, dropdown trigger | the text `+` `−` `‹` `›` `▶` `❚❚` `⏮` `⋮` | built-in icons (`tao-plus`, `tao-chevron-right`, `tao-play`, …) |
| Carousel, Date / DateRange, Copy, ScrollTop, Stages, toast, confirm | hand-drawn inline `<svg>` | the same icons through `TaoIcon`; ScrollTop's arrow is now `tao-chevron-up` |
| `TaoButton` `icon` | a text node (an emoji or a symbol) | **a name for `TaoIcon`** (`tao-plus`, a registered or a font icon); an emoji there now renders as a missing font icon: use the default slot instead |
| `TaoSegmentedOption` `icon` | a text node | a name for `TaoIcon`, or the `#icon` slot |
| `TaoIcon` `name` | always the class `icon-<name>` | `tao-…` is a built-in SVG, a name from `registerTaoIcons` is your SVG, **any other name is the class `icon-<name>` as before**: your icon font keeps working |
| `TaoIcon` size | `size` set `font-size` | an SVG icon is `1em` or `size` px; a font icon keeps the `font-size` behaviour |
| styling hooks | `.tao-copy__button svg`, `.tao-carousel__nav svg` | the icon root is `.tao-icon` (a span around the svg) |

New: `TaoButton` `iconEnd`; an icon-only button (an icon and no text) is a square of the control height and warns in development without `aria-label`; `registerTaoIcons`, `taoIconNames`, type `TaoIconDef`; the prefix `tao-` is reserved for the built-in set.

## Changed

| What | Before | Now |
|---|---|---|
| Button `variant="danger"` | the filled red button | `tone="danger"` (a `variant` is only the shape: `primary` / `secondary` / `ghost` / `text`) |
| Button `tone` | painted `ghost` and `text` only (and `secondary` for danger) | works on every variant; `tone=""` is gone, leave it out for the accent; `tone="accent"` is allowed |
| `.tao-button--danger`, `.tao-button--tone-*` classes | styling hooks | gone: the root carries `tao-tone-<name>` and `tao-button--toned` |
| `.tao-alert--<tone>`, `.tao-tag--<tone>`, `.tao-toast--<type>`, `.tao-avatar__dot--<tone>`, `.tao-confirm__panel--danger` | styling hooks | gone: `tao-tone-<name>` on the same element (Tag: plus `tao-tag--toned`) |
| `--tao-transition-base` | `all <duration> <ease>` | colour, shadow, opacity, transform only (size, padding and the glass backdrop no longer animate) |
| Card / Block `radius` and `padding` defaults | numbers 8 / 16 / 20 inline | tokens `--tao-radius-panel`, `--tao-space-4` / `-5`; the panel publishes `--tao-radius`, `--tao-pad`, `--tao-radius-inner` (class `.tao-panel`) |
| z-index of floating things | literals 1000 … 1200 | `--tao-z-modal`, `-popup`, `-tooltip`, `-toast`, `-confirm` |
| Light theme, accent as text (ghost / text Button) | `#ff227a`, 3.6:1 | `--tao-color-accent-text` (`pink-700`), 5.8:1 |

New: `.tao-tone-*` classes and `--tao-tone*` tokens (not inherited), `toneClass()`, type `TaoToneName`, tokens `--tao-color-accent-text(-hover)`, `--tao-color-on-success|warning|info`, `--tao-pink-800`. A dev-only warning names an unknown tone.

`src/deprecate.ts` stays as machinery: the next removals can be announced in a minor release with a warning that names the version.
