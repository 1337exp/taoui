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

`src/deprecate.ts` stays as machinery: the next removals can be announced in a minor release with a warning that names the version.
