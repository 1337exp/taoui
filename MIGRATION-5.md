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
