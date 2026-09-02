# Tao UI

**English** · [Русский](README.ru.md)

A Vue 3 component library for Nuxt/Vue apps, driven by design tokens:
change a handful of CSS variables and the whole kit follows.

## Components

### Basics

- **TaoBlock** — container with padding and radius
- **TaoButton** — `primary` / `secondary` / `ghost` / `text` / `danger`. `tone` tints ghost and text (danger, success, warning, info)
- **TaoCard** — card with cover / header / footer slots. `#cover` can be a photo or `TaoCarousel`
- **TaoCopy** — clipboard icon. After a click, a “Copied” tooltip; if the trigger is gone, the tooltip is too
- **TaoInput** — text field with v-model, validation, and `#prefix` / `#suffix` slots (icon or text inside the frame)
- **TaoInputGroup** — outer glue: `#before` | field | `#after` (protocol, unit, button)
- **TaoModal** — modal with animation and slots
- **TaoDrawer** — side panel (filters, settings). Esc, backdrop click, focus trap — same as the modal
- **TaoSpoiler** — disclosure. `v-model` and `aria-expanded`. Neighbours do not close each other
- **TaoSpoilerGroup** — accordion: `v-model` is the open panel key (`null` = all closed); spoilers take `name`
- **TaoTabs** — tabbed sections
- **TaoTooltip** — hover hint. `top` / `bottom` / `left` / `right`, flips at the viewport edge
- **TaoPopover** — click panel with any slot content, Esc and outside click. Not a tooltip, not an action menu

### Layout

- **TaoContainer** — max-width (wide / slim / ultra-slim) and centering
- **TaoFlex** — flexbox wrapper: justify / align / direction / wrap / gap
- **TaoSpace** — even gap between children
- **TaoDivider** — `line` (hairline), `text` (line with a label), `gap` (empty space, size: small / medium / large)
- **TaoFieldset** — grouped frame: `legend` sits on the top border, `align` is start / center / end
- **TaoAnimatedBorder** — rainbow border wrapper (decorative, not tied to the theme)

### Forms

- **TaoCheckbox** — checkbox with v-model, pre/post slots, and `indeterminate`
- **TaoSwitch** — boolean toggle (`role="switch"`)
- **TaoRadio** / **TaoRadioGroup** — classic radios: longer labels, can stack vertically
- **TaoSegmented** / **TaoSegmentedOption** — compact exclusive choice among 2–5 short options. Not tabs
- **TaoSelect** — dropdown with keyboard, same chrome as Input. Clear via “Clear” in the list or Delete
- **TaoCombobox** — Select with a field: type to filter, `allow-create` writes a custom value into `v-model`, `create` lets the parent append the list
- **TaoDate** — a single day: `YYYY-MM-DD`, no time, no timezone. Calendar popup like Select
- **TaoDateRange** — a period: `v-model` is `{ start, end }` or `null`. First click is start, second is end (they swap if end is earlier). An incomplete pick is not written to the model
- **TaoFormField** — shared label / hint / error for form controls
- **TaoInputNumber** — number with min/max/step and ± on the right. Empty value is `null`
- **TaoQuantity** — cart quantity: `− | field | +`, integers, stock; minus at the minimum can remove the row
- **TaoTextarea** — autosizing multiline. `maxlength` caps input, `count` shows “entered / max”
- **TaoPinCode** — N cells. By default a click clears the cell and everything to the right (`clear-on="focus"`); `clear-on="input"` replaces the digit only when typing. The last cell blurs and emits `complete`
- **TaoSlider** — mouse, touch, and arrows. Optional precise input on right-click. `size="small"` is a thin track for seek / volume
- **TaoFileDrop** — drop zone (drag & drop + click). File names listed under the zone, `v-model` is `File[]`. Clearing the whole batch is the parent’s job (`clear-request`)

### Data display

- **TaoTable** — simple table: columns, empty, loading, sort via `v-model:sort`. Not a datagrid.
- **TaoPagination** — pages with ellipsis. Clicking “…” jumps `jump` pages (5 by default)
- **TaoEmpty** — empty list, no results, no access
- **TaoStages** — stage list: `wait` / `work` / `ok` / `bad`. Not a linear stepper
- **TaoSkeleton** — loading placeholder (text / title / circle / rect)
- **TaoCounter** — flipping digits (not an input)
- **TaoCarousel** — strip: full slide with `autoplay`, card with `peek`, row with `per-view`. Arrows via `controls` or `#prev` / `#next`, dots via `dots`
- **TaoAvatar** — photo or initials, sizes `small` / `medium` / `large`. Status `dot` and `count`
- **TaoTag** — badge with tones. `#prefix` (avatar), `closable` dismisses the chip, `flat` drops the border
- **TaoAlert** — inline page/form banner (success / error / warning / info)
- **TaoProgress** — static bar (`progress` in %). Percent centered on top, or `showPercentage="right"`; `#left` / `#right` slots are captions, then the percent sits in parentheses on the right. `false` hides it. Width is `minWidth` / `maxWidth`, not the value domain
- **TaoLoader** — four-dot spinner
- **TaoImage** — `<img>` wrapper: fade-in and placeholder. `lazy` turns on native `loading="lazy"`
- **TaoIcon** — icon-font wrapper (see Icons below)

### Navigation

- **TaoLink** — `<NuxtLink>` in Nuxt, `<RouterLink>` with vue-router, otherwise a plain `<a>` — no extra setup
- **TaoBreadcrumb** — crumbs: the last item is the current page
- **TaoDropdownMenu** — dropdown that flips at the viewport edge
- **TaoScrollTop** — floating “back to top” with a ripple. Appears on reverse scroll after `boundary`

### Feedback

- **toast()** — fluent toasts: `toast().success().message('Saved')`
- **confirm()** — overlay question: the same fluent API plus `await`. Not a toast — it waits for an answer and does not dismiss itself.
- **TaoToastViewport** / **TaoConfirmHost** — hosts; if they are missing from the tree, the first call mounts them on `body`

## Conventions

Visual tones: `success` | `danger` | `warning` | `info` | `neutral`.
`error` on Alert, Tag, and `toast()` is an alias of `danger`. Button already uses `danger`.
Stages describe a process, not a tone: `wait` / `work` / `ok` / `bad` (`danger` is accepted as `bad`).

Control sizes: `small` | `medium` | `large`.
Avatar also accepts short `s` / `m` / `l`. Divider `gap` used to call the large size `big` — that is an alias of `large`.
Container lives on another axis: `wide` / `slim` / `ultra-slim`.

## Icons

`TaoIcon` does not ship its own set — it renders `icon-<name>`
for an external icon font (IcoMoon / Fontello and the like). Connect a font
with classes such as `.icon-arrow-up { ... }` in the host app.

## Install

```bash
npm install @1337exp/taoui
```

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

### Individual components

```vue
<script setup>
import { TaoButton, TaoInput, TaoModal } from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'
</script>

<template>
  <TaoButton variant="primary">Press me</TaoButton>
  <TaoInput v-model="text" label="Your text" />
  <TaoModal v-model="isOpen" title="Title">
    Modal body
  </TaoModal>
</template>
```

## Toast

The chain runs in the same tick; `setTimeout(0)` actually shows the toast.

```javascript
import { toast } from '@1337exp/taoui'

toast().success().message('Saved')
toast().error().title('Network').timeout(5000).message('No connection')
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

<TaoAlert type="warning" title="Draft">Save before you leave.</TaoAlert>
```

`TaoSegmented` is a short exclusive choice with every option visible. It is not page navigation — that is `TaoTabs`. Longer labels or more than 5–6 items belong in `TaoRadioGroup` or `TaoSelect`.

`TaoSelect` opens from the keyboard (arrows, Enter, Esc); the list flips at the viewport edge. Delete or “Clear” at the bottom of the list resets the value to `null`.

`TaoCombobox` is the same menu with a field. Typing filters options. `allow-create` writes the typed string into `v-model` when there is no exact match. The list does not mutate itself: listen to `create` and append an option from the parent.

`TaoFormField` also wraps `TaoTextarea` and `TaoCheckbox` — id, hint, and error are forwarded for you.

`TaoTag` can be a chip: `#prefix` on the left (usually `TaoAvatar`), `closable` draws a cross and emits `close`. The close click does not bubble. `flat` drops the border and keeps the fill.

```vue
<TaoTag type="neutral" closable @close="remove">
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
    <TaoTag :type="row.status === 'active' ? 'success' : 'neutral'">
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

<TaoCarousel :autoplay="4000" loop dots>
  <article v-for="item in banners" :key="item.id" class="hero">
    <strong>{{ item.title }}</strong>
    <span>{{ item.text }}</span>
  </article>
</TaoCarousel>
<TaoCarousel :peek="72" :controls="false" dots>…</TaoCarousel>
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

Library styles are three layers. Components **never** touch raw colors or sizes —
only semantic variables. That is the theming mechanism: override 20–30 variables
and every component follows, with no edits inside the components themselves.

```
primitives.css   →   semantic.css   →   themes/*.css (optional)
  raw colors          public theming     ready-made themes on top
  and scales,         API: this is       of semantic — light is
  leave them alone    what you change    the example
```

### Layers

| File | Role | Touch it? |
|---|---|---|
| `primitives.css` | Raw palette, space / radius / shadow scales (`--tao-orange-400`, `--tao-space-3`…) | Usually no |
| `semantic.css` | Default (dark) theme tokens: `--tao-color-accent`, `--tao-color-surface`, `--tao-color-danger`, etc. | **Yes — this is the theming API** |
| `themes/light.css` | Alternate theme via `[data-tao-theme="light"]` | Yes, as a sample |
| `base.css` | Global reset (scrollbar, links, box-sizing) | Rarely |

All four come in through `@1337exp/taoui/styles.css`.

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
    /* remaining tokens: see semantic.css */
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
- `--tao-color-on-accent` — text on the accent (`--tao-color-text-on-accent` is an alias)
- `--tao-color-selection`, `--tao-color-selection-text` — text selection (`::selection`)
- `--tao-color-surface*` — container backgrounds (default / raised / sunken / hover)
- `--tao-color-border*` — borders
- `--tao-color-text*` — text (default / strong / muted / disabled)
- `--tao-color-danger*`, `--tao-color-success*`, `--tao-color-warning*`, `--tao-color-info*` — status colors
- `--tao-color-input-*` — fields, because input bg/text often differs from surface/text
- `--tao-radius-control`, `--tao-radius-panel` — radii (small controls vs large panels)
- `--tao-shadow-panel`, `--tao-shadow-overlay` — shadows

The full list lives in `src/styles/semantic.css` — the only file worth opening
to see the whole theming API.

### A theme from scratch, without primitives

```javascript
import '@1337exp/taoui/styles/primitives.css' // keep the scales if you want
import './my-semantic.css'              // your semantic layer instead of @1337exp/taoui/styles/semantic.css
import '@1337exp/taoui/styles/base.css'
```

## Showcase

To browse every component:

```bash
cd showcase
npm install
npm run dev
```

The showcase has a dark / light switch in the header, so you can see token
overrides without editing component code.

The showcase points at `src/` directly, so component edits show up without
`npm run build`. Building `dist/` is for publishing and for other projects
that install the package.

## Development

```bash
# Build the library
npm run build

# Watch mode
npm run dev

# Type check
npm run type-check
```

## Publishing to npm

Only `dist/` (the built library) and `src/styles/` (raw tokens, so you can
import `primitives.css` on its own for a custom theme) are published.
Component sources (`src/components/*.vue`), build configs, and `showcase/`
stay in the repo — clone it to get them.

`npm publish` **itself** runs the type check and a full rebuild first
(`prepublishOnly` in `package.json`), so a stale or missing `dist/` cannot
reach the registry. You do not need to build by hand before `npm publish`.

See what would go into the tarball, without publishing:

```bash
npm pack --dry-run
```

## License

MIT
