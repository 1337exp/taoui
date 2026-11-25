# Changelog

## 6.0.0-alpha.0

The start of 6.0, a major version with **no backward compatibility**: no deprecated names, no shims. This alpha is the packaging and the first foundations; the API vocabulary, the tokens and the overlays follow in the next alphas. Not published.

**How to update from 5.x**

1. `app.use(TaoUI)` comes from its own entry now: `import TaoUI from '@1337exp/taoui/plugin'`. The root entry has no default export. Better: drop the global registration and import the components you use, `import { TaoButton } from '@1337exp/taoui'`.
2. Keep `import '@1337exp/taoui/styles.css'` once. It is the **core** only now (tokens, themes, contexts, typography, base); the CSS of a component comes with the component. You import no stylesheet per component.
3. Vue 3.5 or newer, and a browser of the last two years: Chrome / Edge 130, Safari 18, Firefox 132.
4. Put `<TaoHosts />` once into the root of the app (`TaoShell` has it inside), or `toast()` and `confirm()` show nothing: the second app on `document.body` that used to draw them is gone.

- **One package, unbundled: the CSS of a component comes with the component.** The package was one `index.js` and one 231 KB `styles.css` with the CSS of every component, so an app that used a button shipped the carousel's styles. Now every source module is a module of the package (`preserveModules`), every component has its own CSS file, and the component imports it: a bundler takes the CSS together with the component, and an unused component brings nothing. Measured on a throwaway Vite app, one `TaoButton`: CSS **38 KB (7 KB gzipped) instead of 231 KB (34 KB)**, JS 78 KB instead of 105 KB. Vite's library mode drops the `import` of a module's CSS from the JS, so `scripts/viteInjectCssImports.ts` puts it back (and `npm run smoke` fails if the carousel's CSS reaches an app that imports only the button, or if one component costs more than 80 KB of CSS).
- **The root entry is named exports only.** No default export, no `TaoUI` plugin, no stylesheet import. Global registration is `@1337exp/taoui/plugin`, and it costs what it always cost: the whole kit and all its CSS (about 380 KB of JS and 232 KB of CSS before gzip), which is the reason it is no longer the default way to start. It registers every component the root entry exports, so a new component cannot be forgotten.
- **Declarations are one file per module**, not one rolled-up `index.d.ts`. The patch that made the rolled-up file work for the generic `TaoTable` is kept per file (`npm run smoke` still checks that a wrong row, handler and slot fail to compile). The types resolve with `moduleResolution: bundler`, which every Vue / Vite / Nuxt app has; `node16` / `nodenext` cannot name a `.vue` file at all, so the rule «internal resolution error» is ignored in `lint:package` on purpose.
- **Foundations, no change you can see.** One `src/primitives/number.ts` (`clamp`, `roundTo`, `decimalsOf`, `normalizeNumber`) replaces about fifteen copies, and the numeric helpers of `TaoDragNumber` left the public entry. One `usePointerDrag` is the gesture of the slider, the split, the colour square, the drag number and the carousel: the press takes the pointer, another pointer is ignored, and the gesture **ends by itself** when its `pointerup` never comes (the window loses the focus, the page is hidden, the capture is taken away, the component goes away), with the reason handed to the component. `TaoColorPicker` used to stay pressed after Alt-Tab; it does not. One live `useReducedMotion` replaces four private `matchMedia` reads, so a change of the setting after mount reaches the carousel, the drawer, the marquee and the tour.
- **One keyboard contract, `useRoving`.** `listNav.ts` moved into `primitives/useRoving.ts` and learned `orientation: 'both'`; `TaoTabs`, `TaoDocTabs`, `TaoCommandList` and `TaoList` dropped their private arrow / Home / End switches for it (`TaoMenu`, `TaoSelect`, `TaoTree` and `TaoCombobox` already used it). What differs per widget is a flag at the call site (`loop`, `orientation`), not a copy. The toolbar (its own edge rules) and the heatmap (a 2D grid) keep their own handlers for now.
- **`defineModel`, and a visible change of meaning.** `TaoPopover`, `TaoSpoiler`, `TaoSpoilerGroup`, `TaoModal`, `TaoDrawer` and `TaoCommandPalette` use Vue's own model: with `v-model` the parent keeps the state, without it the component keeps its own (the hand-written `isControlled` blocks are gone). **`TaoSpoiler` has no `defaultOpen` any more**: give it a `v-model` that starts `true`. A parent that passes `modelValue` WITHOUT an `onUpdate:modelValue` listener no longer holds the value still: the component follows its own state (a `v-model` always passes both). The other form controls move to `defineModel` in the next alphas.
- **Fixes and accessibility from the second Grok xHigh review** (the new v6 work; each fix is pinned by a test that failed before it, `tests/review2.fixes.test.ts`, `tests/hosts.test.ts`). *Hosts:* the place of the host is a queue with a reactive owner (`primitives/hostSlot.ts`): when the host that draws goes away (a route, a `v-if`, `<KeepAlive>`) the next one draws the toasts that wait and asks the open question at once (before, a confirm could stay unanswered for good), and a question that waited for the host takes the focus when it appears. *Toast:* an `alert` (danger, warning) no longer carries `aria-live="polite"` over its implicit assertive one; the time stops while the focus is inside the toast, not only under the pointer (WCAG 2.2.1); the cross is a 24px target (2.5.8). *Confirm:* no bounce and no fade with `prefers-reduced-motion`. *Forms:* a native `form.reset()` no longer leaves the hidden value behind the control (it is set from the model again after the reset). `TaoProp`: the caption of a slider focuses the thumb, not its hidden value input. `TaoShell`: without `prefs` the language switch follows the choice (header and footer show the same one); the page is a `<main>` and the first stop of the tab order is a skip link to it (`shell.skipLabel`; the link moves the focus and leaves the address alone, so a hash router keeps its route); `TaoNav` has a `skip` slot for it. *CSS:* the one `!important` of the kit (`-moz-appearance` on a number input, inside `tao.base`) is gone: an author `!important` in a layer beats an app rule outside of it, and a test now keeps the kit free of it. *Radius:* the steps are a 4px ladder around the base (-4, 0, +4, +8), not multiples of it, so any base gives an even ladder. *Docs:* `skills/taoui/SKILL.md` is v6 (`select(item, event)`, `<TaoHosts />`, layers, process-wide defaults).
- **Fixes from the third Grok review (of the fixes themselves; `tests/inert.test.ts`, `tests/review2.fixes.test.ts`, `tests/kitPrefs.test.ts`).** *Inert:* two dialogs opened in the same turn made each other inert (neither could be clicked): the lower layer now leaves the roots of the modal layers above it alone; the scrim of `confirm()` was inert too, so a click on it did not answer `false`: the root of the dialog is now the outer element that holds the scrim. *`TaoSelect`:* a press inside the list (the scrollbar, the padding) no longer closes it (the panel keeps the focus on the trigger, and a blur into the panel is not a leave); a select that becomes `readOnly` or `disabled` while open closes and its options no longer commit; the active option stays one of the items when they shrink; PageUp / PageDown jump ten options and Alt+ArrowUp picks the active one and closes (the select-only combobox keys). *`createKitPrefs`:* with `deferred` the system scheme is not read before `restore()` (the first state is the server's), and `restore()` after `dispose()` arms nothing. Three tests that proved nothing were made to prove it (the form `reset`, the early read of the scheme, the radius ladder).
- **Small things from the second review.** `toast({ once: true })` without an `id`: the handle now names the toast by the key the store finds it by, so `dismiss()` works (also on the handle of a repeat that was not shown). `autocomplete` that you give a `TaoQuantity`, `TaoInputNumber`, `TaoDragNumber`, `TaoPresetInput`, `TaoDate` or `TaoCombobox` reaches the input instead of the hard-coded `off`. `usePopup`: a panel that is open on the first render takes the size and the density of its anchor once it is mounted. The `app-shell` starter is a `TaoShell` now (the action, the project, the prefs, `<main>` and the skip link come with it), and the README names the layer order for Tailwind v4 (`@layer theme, base, tao, components, utilities;`).
- **`createKitPrefs` for a server-rendered app: `deferred` and `restore()`.** The saved language and the system mode were read in `setup`, so the server and the first render of the browser could disagree, and on the server `setTaoLocale` wrote a locale that every request of the process shares. Now the language of a request goes to the tree of that request by `provide` (the global locale is not touched on the server), and with `deferred: true` the first state is the options only (the language: the option or the first locale, not the browser's) and `restore()` (called from `onMounted` by itself in a component) reads what was saved and starts to follow the system; nothing is saved before it, so the defaults cannot overwrite what the person picked. Without `deferred` nothing changes: a page that is not rendered on the server reads everything at once and has the right theme before the first paint. `tests/kitPrefs.ssr.test.ts` (a node environment) and `tests/kitPrefs.test.ts` hold it.
- **The page behind a dialog is `inert`.** `aria-modal` is only a hint: the keyboard and some screen readers still reached the page under a `TaoModal`, a `TaoDrawer` or a `confirm()`. Now `useLayer` takes a `modalRoot` and, while the layer is open, sets `inert` on the siblings of every ancestor of the dialog up to `<body>`, as they are at that moment: a select that opens later inside the dialog (teleported to the body) works, the toast viewports stay live (a status message must be heard under a dialog), an element the author made inert is left alone, and with two dialogs the page is freed by the last one. The browser floor already has `inert` (Chrome 102, Safari 15.5, Firefox 112). `tests/inert.test.ts` holds it; checked with the real `confirm()` in the showcase.
- **`TaoSelect` is the select-only combobox of the WAI-ARIA Authoring Practices.** The focus used to move from the trigger to the list when it opened, with `aria-activedescendant` on the list: a screen reader saw the combobox lose the focus. Now the focus stays on the trigger the whole time; it carries `aria-activedescendant` (the active option), `aria-autocomplete="none"`, and `aria-controls` only while the list exists (it is not in the document when closed); the arrows, Home, End, type-ahead, Enter, Space, Delete and Escape work from the trigger, Tab closes the list and picks nothing. The listbox has a name: the `aria-label` you gave the select, otherwise the caption of its `TaoFormField` / `TaoProp`, otherwise the placeholder. `tests/overlays.test.ts` holds it; checked with the real keyboard in the showcase.
- **`readOnly` on `TaoQuantity`, `TaoDragNumber` and `TaoPresetInput`.** The value is shown, can be selected and goes with the form, but is not changed: the arrows, ±, typing, Enter and blur leave it alone, a drag does not start, the list of the preset field does not open, and the native `readonly` is on the input (the focus stays, unlike `disabled`). `tests/field.contract.test.ts` holds it.
- **One host for `toast()` and `confirm()`: `<TaoHosts />`, in the tree of the app.** The fallback that mounted a second Vue app on `document.body` is removed: that app saw neither the locale an app provides nor its plugins, and a toast shown before the real viewport mounted could end up on the screen twice. `<TaoHosts />` (= `TaoToastViewport` + `TaoConfirmHost`) stands once in the root of the app, `TaoShell` has it inside, and the first host to mount draws: a second one (a viewport written by hand next to it) draws nothing. The cross of a toast and the OK / Cancel buttons are read from the locale in effect where the host stands (`provideTaoLocale` reaches them, the global `setTaoLocale` is the fallback); `setTaoLocale` no longer writes into `toast.defaults` / `confirm.defaults`, so `toast.defaults({ closeLabel })` and `confirm.defaults({ ok, cancel })` are only the app's own text and win over any locale. A call before the host is mounted waits and shows with it; a dev warning names the missing host after a second. The server stays inert (`toast()` nothing, `confirm()` `false`). `tests/hosts.test.ts` holds it.
- **Cascade layers, and one knob for the radius.** The kit's CSS now lives in `@layer tao.tokens, tao.themes, tao.base, tao.typography, tao.contexts, tao.components`: the core files by `@import … layer(…)` in `styles/index.css`, a component's `<style>` and the date panel's stylesheet by a PostCSS step of the build (`scripts/postcssTaoLayers.mjs`, also in the showcase config), and the order is written at the top of every file so it is the same whichever file loads first. The CSS of an app is in no layer and a rule outside of the layers beats every rule inside them whatever its specificity, so an app restyles a kit part with one class, without `!important` or `:deep`. Checked on the showcase (14283 elements, 40 computed properties each, dark and light) before and after: the only change is one image width the demo CSS set and the kit's rule used to win (the app wins now). The price is stated in the README: a global rule on an element (`h2 {…}`, `* { margin: 0 }`) beats the kit's class rules too, so put such rules in a layer of your own that sits under `tao` (`@layer reset, tao;`). Palettes stay outside of the layers on purpose: a palette must beat the theme. **Radius:** `--tao-radius-base: 10px` is the roundness of a product, and `-sm / -md / -lg / -xl` are counted from it (a 4px ladder: -4, 0, +4, +8, never below 0; first made as ×0.6 / ×1 / ×1.4 / ×1.8, which gave 10, 16, 22, 29 at a base of 16px, so the second Grok review had it changed) and snapped to a whole pixel with `round()` (a corner on a fractional pixel is painted with a soft, flickering edge); `TaoKbd` and the toast edge, which multiplied a radius by a fraction, round too, and `tests/radius.tokens.test.ts` fails for a radius multiplied by a fraction without `round()`. At 10px the scale is the same 6 / 10 / 14 / 18.
- **The product layer, second part: `TaoShell`, and `TaoNav` says its look.** Every app of ours copied the same shell (Axis, NextUp, fin-view): `TaoNav fill`, the main action, the project chip with its menu, the language and the theme in the footer and again in a thin header on a phone, and a `:deep` height for the page. `TaoShell` is that, once: `items`, `v-model` (the section), `projects` with `v-model:project` and the `new-project` event, `action` with the `action` event, `languages`, `prefs` (a `createKitPrefs` object: the theme and the language bind to it and it applies them), a `#tools` slot, and the page in the default slot. On a phone the bar has no room, so the chip and the tools go up into a header by a container query on `TaoNav`, with no JavaScript and no second breakpoint. `TaoNav` got two models: `v-model:layout` (`auto`, `bar`, `rail`, `drawer`: an app may keep the choice of its user, a collapsed side panel is `rail`) and `v-model:look` (never `auto`: what it has now, measured from its own width at the same 600 and 840 px as the CSS). CSS still decides the look, so nothing flashes on the server; `look` is for code that must know, with `navLook(width)` and `navCompact(look)` exported. New texts `shell` in the locale.
- **The product layer, first part: `createKitPrefs` and `TaoProp`.** Ten apps of ours copied the same two files: a `theme.ts` (the saved mode, else `prefers-color-scheme`, written to `dataset.taoMode`) and an `i18n` pair (`setTaoLocale(code === 'ru' ? localeRu : localeEn)`), and each reimplemented «system or saved». **`createKitPrefs({ key, mode?, palette?, locale?, locales?, storage?, root? })`** is that, once: it reads what was saved (`<key>.mode`, `<key>.palette`, `<key>.locale`), puts it on the page (`data-tao-mode`, `data-tao-theme`, `lang`, `setTaoLocale`), follows the operating system while the mode is `system`, saves every change, and gives back refs (`mode`, `palette`, `locale`, and `resolvedMode`) plus `dispose()`. They bind to `<TaoThemeToggle v-model="prefs.mode" system :apply="false" />` and `<TaoLanguageSwitch v-model="prefs.locale" />`. A saved value that makes no sense is ignored; a storage that throws (a private window) is a page that saves nothing. **`TaoProp`** is the row of an inspector that `pkt-cards-maker` (`Row.vue`) and kupona (`Field.vue`) each built: the caption on the left (`labelWidth`, or `--tao-prop-label-width`), the control or several (`x y w h`) on the right, a hint or an error under them, a long caption cut with an ellipsis and kept whole in the `title`; it wires the label like `TaoFormField` (`id`, `aria-describedby`, `aria-invalid`, so a select or a colour field works in it too). `TaoFormField` stays the vertical form. **Not done, on purpose:** `surface="sunken"` (`--tao-color-surface-sunken` is already the token, and `surface` is the material axis: flat, grain, glass, not a colour), `TaoShell` (it needs the nav's `v-model:layout` and a public compact flag first) and the wiring of `createCommands` to `TaoMenubar` / `TaoCommandPalette` (`createCommands` lives in TaoUX: that is a decision across the two packages).
- **One `usePopup` for the fields with a pop-up.** `TaoSelect`, `TaoCombobox`, `TaoDate`, `TaoDateRange` and `TaoPresetInput` each repeated the same plumbing: the panel hung on its anchor (`useFloating`), a press outside dismissed it (`useDismiss`), Escape went to the layer stack (`useLayer`), and a panel teleported to `body` took the size and density resolved at its anchor. `primitives/usePopup.ts` is that, once; what differs stays with the field (when it opens, what dismissing and Escape do: close, commit, revert). No change you can see. **The Popover API and `<dialog>` are not used, on purpose:** a select in a modal already stands above it (`--tao-z-popup` 1050 over `--tao-z-modal` 1000, the panels are teleported to `body`), so the top layer solves nothing today. It would start to matter only if the modal itself became a `<dialog>` (its top layer would cover every z-index popup, and the pop-ups would have to move to the top layer with it): that is one decision about the whole overlay family, and `usePopup` is the one place where the popups would change.
- **A select, a date, a colour, a pin code and a slider are part of a form.** `TaoSelect` is a `<button role="combobox">` and `TaoCombobox` shows the label in its input, so a form saw neither the picked id nor a `required`; a `name` on them landed on the button or on the text, where it did nothing or sent the label. Now a hidden input (the inner `TaoFormValue`, a visually hidden text input that is not exported) holds the value: **`name` puts it into `FormData`** and **`required` holds the form back** with the native message, whose focus goes to the control the user can see (a `hidden` input is never validated, so it is a hidden-by-style text input). What is sent: `TaoSelect` and `TaoCombobox` the `id` of the pick (a created string with `allow-create`), `TaoDate` the ISO date (also with `editable`), `TaoDateRange` `<name>-start` and `<name>-end`, `TaoColorInput` the hex, `TaoPinCode` the whole code (with `required`, only a complete one), `TaoSlider` the number and `TaoRangeSlider` `<name>-from` and `<name>-to`. They take `id`, `name`, `required`, `autofocus` as props (a `name` given as an attribute used to fall onto the button; it is the prop now). A disabled control is disabled in the form too. **`readOnly`** on `TaoSelect`, `TaoCombobox`, `TaoDate` (and its typing field), `TaoDateRange` and `TaoColorInput`: the value is seen and sent, the list, the calendar or the palette does not open, nothing types or clears it (`aria-readonly`). The combobox's text input no longer carries `name` and `required`: they would have sent and checked the text, not the pick. `tests/form.value.test.ts` holds the contract; checked in a real browser (an empty required select blocks `reportValidity`, the focus lands on the trigger, `FormData` has the id).
- **`toast()` and `confirm()` take one object.** The fluent chain (`toast().danger().title(…).message(…).action(…)`, `await confirm().title(…).message(…).danger()`) waited a tick (`setTimeout(0)`) for the chain to finish, returned a builder, and had a second form (`toast.success(message, options)`) that did the same. Now: **`toast({ message, title?, type?, timeout?, position?, icon?, closable?, progress?, surface?, id?, once?, replace?, actions?, onClosed?, loading? })`** shows at once and returns a handle `{ id, dismiss() }`; `toast.success | danger | warning | info | show(message, options?)` stay as the short forms; `toast.promise` and `toast.defaults({ position, timeout, … })` stay. `confirm({ title?, message?, ok?, cancel?, tone?: 'danger', surface? })` or `confirm('Title?', options?)` returns a real `Promise<boolean>`, asks at once, and says `false` when there is nothing to ask. **Gone:** the builders (`TaoToastBuilder`, `TaoConfirmBuilder`), `.byBottomRight()` and the other corner methods and statics (the position is an option, the default is `toast.defaults({ position })`), `.short()` (`timeout: 1000`), `.danger()` of confirm (`tone: 'danger'`). `toast.dismiss(id)` finds a toast by the `id` you gave it. The types: `TaoToastOptions`, `TaoToastHandle`, `TaoConfirmOptions` (were `TaoToastShortcutOptions`, `TaoConfirmShortcutOptions`). They draw in `<TaoHosts />` (see the next entry): the body fallback of 5.x is gone. The toast positions (`topRight`, …) are not `TaoPlacement` yet: they are physical corners, and `start` / `end` would flip in RTL. `tests/toast.api.test.ts` holds the contract.
- **The rest of the vocabulary: `key` is `id`, `ariaLabel` is `label`, `select` hands out the item, `close` says why.** (1) A column of `TaoTable` and a stage of `TaoStages` are `{ id, … }` (was `key`), the sort is `{ id, dir }`, the cell slot is `cell-<id>`; `rowKey` stays (it names a field of the row, for `v-for`). (2) The accessible name of `TaoTree`, `TaoList`, `TaoCarousel`, `TaoBreadcrumb`, `TaoMenubar`, `TaoNav`, `TaoPagination`, `TaoStages` and the sliders is **`label`** (was `ariaLabel`); the locale text is still the fallback. An `aria-label` attribute you used to give them was read as the prop and is now an ordinary attribute on the root, so **move it to `label`**. `TaoScrollTop` lost `ariaLabel`: its `label` is its caption and its name. `TaoSegmentedOption` keeps `ariaLabel` on purpose: its `label` is the visible text, and an icon-only option needs a name that is not shown. (3) **`select` is `[item]`**: `TaoMenu`, `TaoContextMenu`, `TaoDropdownMenu` and `TaoMenubar` hand out the item (`TaoMenuPick`, `item.id` is the id) instead of the bare id, and `TaoNav` `select(item, event)` the nav item; `TaoTree`, `TaoCommandList` and `TaoCommandPalette` already did. `menu-select` of `TaoTree` keeps `(id, node, selected)`. (4) **`close` is always `close(reason)`** with one list, `TaoCloseReason` (`escape`, `outside`, `button`, `select`, `tab`, `scroll`, `swipe`; it was `TaoMenuCloseReason`, which only the menus had): `TaoModal`, `TaoDrawer`, `TaoCommandPalette`, `TaoCard`, `TaoAlert` and `TaoTag` (it gave the click event) say it too. `TaoDocTabs` `close(id)` stays: that is a request about one tab. `tests/close.reason.test.ts` holds the reasons.
- **A list is `items`, a row is `{ id, label }`, and `v-model` holds the `id`.** The same idea had three names for the list (`options` on `TaoSelect` and `TaoCombobox`, `nodes` on `TaoTree`, `items` elsewhere) and two for the identity of a row (`value` on selects, tabs, doc tabs and checklists, `id` on menus, nav, commands, tree and timeline). Now: **`TaoSelect` and `TaoCombobox` take `items` (was `options`), `TaoTree` takes `items` (was `nodes`)**, and the rows of `TaoSelect`, `TaoCombobox`, `TaoTabs`, `TaoDocTabs` and `TaoChecklist` are `{ id, label }` (was `{ value, label }`); the `label` slot of `TaoTabs` hands out `id`, not `value`. The types: `TaoSelectOption` is `TaoSelectItem`, and `TaoTabItem`, `TaoChecklistItem`, `TaoDocTab` have `id`. The selected value is still whatever the `id` is, so a `v-model` keeps working; only the literals change. `TaoPresetInput` keeps `options` and `value` on purpose: a preset is a number the arrows do arithmetic on, not the identity of a row (its type no longer extends the select's). There is no alias, and an old `options` or `nodes` is an unknown attribute that draws an empty list. `tests/items.contract.test.ts` holds the new names.
- **Fixes from a Grok xHigh review of the branch** (nine confirmed by a test before the fix, `tests/review.fixes.test.ts`). `TaoDate` and `TaoDateRange` closed only when the picked value changed, so clicking the day that was already chosen left the popup open: `TaoCalendar` now says **`select`** at the end of every pick (a day, today, clear), even when the value stays, and the popups close on it. A failed `reload` of a lazy folder after a move left it open and empty; it keeps its children. A drag release with reduced motion (or under a pixel from a slide) skipped the recentring of a looping carousel. `TaoSwitch` and `TaoRadio` stayed visually switched when the parent refused the change; the native input is put back to the model. A `TaoRadio` with `autofocus` in a group focused the fieldset (the id of the field belongs to the group; the radio has its own now). `TaoInputNumber` committed on every blur and twice for Enter then blur: it commits once per finished edit and only for a number that differs from the last committed one (a value that came from outside is not an edit). A range slider emitted an `update:modelValue` with an unchanged array on every pointer move. `nativeFieldAttrs` wiped a native `readonly` on controls that have no `readOnly` prop. A slider, split or colour square that was unmounted mid-drag committed a value the user never finished. `TaoColorInput` in a `TaoFormField` is named by the label and its own text (`aria-labelledby`) instead of an `aria-label` that replaced the label; a given `aria-label` still wins.
- **`defineModel` on every form control.** `TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoQuantity`, `TaoDragNumber`, `TaoPresetInput`, `TaoCombobox`, `TaoSelect`, `TaoDate`, `TaoDateRange`, `TaoCalendar`, `TaoCheckbox`, `TaoSwitch`, `TaoRadio`, `TaoRadioGroup`, `TaoSegmented`, `TaoSegmentedOption`, `TaoChecklist`, `TaoFileDrop`, `TaoPinCode`, `TaoSlider`, `TaoRangeSlider`, `TaoSplit`, `TaoScrubber`, `TaoColorPicker`, `TaoColorInput`, `TaoTabs`, `TaoDocTabs`, `TaoNav`, `TaoCarousel` and `TaoLanguageSwitch` use Vue's own model: with `v-model` the parent holds the state, without it the component keeps its own, so every one of them works uncontrolled (a `TaoSwitch` with no `v-model` now turns on by itself; the hand-written own-state of `TaoCheckbox` and `TaoLanguageSwitch` is gone). The changes you can see: **a parent that passes `modelValue` WITHOUT an `onUpdate:modelValue` listener no longer holds the value still** (the component follows its own state; a `v-model` always passes both), and **a write of the value the model already has is not emitted** (picking the active tab or radio again says nothing). **`TaoCheckbox` has no `checked` prop any more**: use `v-model`. `TaoThemeToggle` keeps its own model on purpose: without a value it reads the mode of the page. `tests/defineModel.test.ts` fails for a hand-declared `update:modelValue`.
- **One event contract: `update:X` while a value is edited, `commit` when the edit is finished, no `change`.** `change` was five things (a finished edit, a pick, a sort, a page, an open) and, on a text field, the native DOM event. **`commit`** now ends an edit and is declared on: `TaoInput` (new: the native `change`, a blur or Enter with a changed text), `TaoTextarea` (it was the native event re-emitted untyped, now `commit: [value]`), `TaoInputNumber` and `TaoDragNumber` (already), `TaoQuantity`, `TaoPresetInput`, `TaoSlider`, `TaoRangeSlider`, `TaoSplit`, `TaoColorPicker`, `TaoColorInput`, and `TaoScrubber` (it was `seek`). **`change` is deleted** from the controls that pick one of a few: `TaoCheckbox`, `TaoSwitch`, `TaoRadio`, `TaoRadioGroup`, `TaoSegmented`, `TaoSelect`, `TaoCombobox`, `TaoDate`, `TaoDateRange`, `TaoCalendar`, `TaoChecklist`, `TaoFileDrop`, `TaoPinCode`, `TaoTabs`, `TaoDocTabs`, `TaoPagination`, `TaoCarousel`, `TaoLanguageSwitch`, `TaoThemeToggle`, `TaoPopover`, `TaoSpoiler`, `TaoSpoilerGroup` and `TaoTable` (use `update:sort`): the `update:X` that comes with it said the same, so a `@change` on them is dead, and on `TaoInput`/`TaoTextarea` it is now only the native event on the input. `TaoQuantity` lost `dec`, `inc` and the numeric `blur`: it has `commit` (a plus or minus, or leaving the field with a changed number; once per action), **`remove`** (the minus at the minimum with `allowRemove`, which `dec` used to be), and `blur` gives the `FocusEvent`; `TaoQuantityChangeSource` is gone. Every `defineEmits` is typed now (`TaoInput`, `TaoTextarea`, `TaoImage` were arrays), and `tests/events.contract.test.ts` fails for an untyped list, a `change` or an old name. Not yet: `close` with a reason everywhere, `select: [item]`.
- **`error` is `invalid` on every control.** The red frame was `error` (a boolean) on the controls and `error` (the message, a string) on `TaoFormField`, so the wrong prop was easy to pass and a boolean `error` on a field next to a `TaoFormField` read as a message. A control takes `invalid` now (`TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoQuantity`, `TaoDragNumber`, `TaoPresetInput`, `TaoCombobox`, `TaoSelect`, `TaoDate`, `TaoDateRange`, `TaoCheckbox`, `TaoChecklist`, `TaoRadio`, `TaoRadioGroup`, `TaoSegmented`, `TaoSwitch`, `TaoPinCode`, `TaoColorInput`, the sliders); `error` stays the text of `TaoFormField`, and `status="error"` of `TaoPinCode` is the result of a check. **There is no alias: an old `error` on a control is an unknown attribute now and does nothing** (search your code for `error` next to a field). `useField()` returns `isInvalid` instead of `invalid`. `TaoColorInput` now calls `useField`, so a `TaoFormField` around it reaches its button (the `id` for the label, `aria-invalid`, `aria-describedby`), and it takes `id`.
- **One field contract, `FieldProps`** (`src/formField.ts`): `id`, `name`, `invalid`, `disabled`, `size`, `required`, `autofocus` under the same names, drawn with `useField(props)` and `nativeFieldAttrs(props)`. Before, `name`, `required` and `autofocus` were accidents of attribute fall-through (and `autofocus` only worked on a page that loads); now they are declared props on `TaoInput`, `TaoTextarea`, `TaoInputNumber`, `TaoQuantity`, `TaoDragNumber`, `TaoPresetInput`, `TaoCombobox`, `TaoCheckbox`, `TaoSwitch` and `TaoRadio`, `required` is the native one (a form does not submit the field empty), and `autofocus` takes the focus when the field appears. `ReadableFieldProps` adds **`readOnly`**: the value stays visible, selectable, focusable and sent with the form, and nothing changes it. It is on `TaoInput`, `TaoTextarea` (it was `readonly`) and `TaoInputNumber` (typing, the arrows, the steppers, Enter and blur leave the value alone; a blur used to clamp it). `useField()` also does the autofocus. Not yet on `TaoSelect`, `TaoDate`, `TaoDateRange`, `TaoChecklist`, `TaoRadioGroup`, `TaoSegmented`, `TaoPinCode`, `TaoColorInput`, the sliders and `TaoFileDrop`, and `readOnly` not yet on the other number and list fields: those need the popup rewrite (a hidden input so the value reaches `FormData`) and come with it. A lowercase `readonly` on `TaoTextarea` still reaches the control as the native attribute.
- **`TaoTree` is split along its seams, and its three models are `defineModel`.** The context menu (`treeMenu.ts`), the lazy loading (`treeLoad.ts`) and the index of known nodes (`indexNodes` in `tree.ts`) left the component, each tested without it; `TaoSliderBase` gave its typing field (`sliderEditor.ts`) and its key table (`keyTarget`, `snapValue` in `slider.ts`) the same way. `v-model:expanded`, `v-model:selected` and `v-model:checked` work as before with a `v-model`; a parent that passes the value WITHOUT an `onUpdate:` listener no longer holds it still (the tree follows its own state), as with the overlays above. Picking the row that is already selected in `selection="single"` no longer emits `update:selected` again (the value did not change); `select` still comes.
- **`TaoCarousel` gave away its momentum and its pauses.** `carouselGlide.ts` (the release speed of a drag, the roll onto a slide), `carouselPause.ts` (what stops the autoplay) and the pure geometry in `carousel.ts` (`wantedCopies`, `nearestSlide`, `cycleTarget`, `centerDistance`) are tested without the component. The carousel no longer binds `blur`, `pagehide` and `visibilitychange` by itself: dropping the hover when the window loses the focus is `listenFocusLoss`, the same as every other lasting gesture of the kit.
- **No shim for a locale written before 5.x.** The keys `tree.menuLabel`, `tree.countLabel`, `tree.rootLabel`, `tree.cutText`, `tree.copyText`, `tree.movedText`, `tree.copiedText`, `tree.canceledText`, `tree.refusedText`, `date.calendarLabel`, `pagination.perPageText` and `pinCode.cellLabel` are **required** in `TaoLocale` now (they were optional, with an English fallback inside the component). A full `TaoLocale` you wrote by hand must have them; a partial one passed to `createTaoLocale`, `setTaoLocale` or `provideTaoLocale` is still merged over English, so nothing is missing at run time.
- **The browser floor moved to the last two years** (Chrome / Edge 130, Safari 18, Firefox 132): it is what lets the next alphas use the Popover API, `<dialog>`, `@layer`, native nesting, relative colours and `light-dark()` instead of our own code. The peer range of Vue is 3.5 (5.57.1 fixed the false 3.4).

## 5.57.2

Five fixes, found by a Grok review of the repository and checked by hand. One look changes: in the light theme the placeholder of a field is darker (it was below the contrast the kit promises).

- **The close button of a `TaoCard` has a round hover.** Its corner was worked out as the radius of the card minus the **padding** of the card (20px, more than the 18px radius: so 0, a square hover), but the button sits at the offset of its corner box, `--tao-space-3` (12px) from the edge. It is now the top right corner minus that offset (6px at the default radius, and it follows `radius` and `square`). Found by the owner on a screenshot.
- **The placeholder of a field reads at 4.5:1 in the light theme.** It was `--tao-gray-300`, `#999999`, the colour of a disabled item: 2.85:1 on the page and 2.6:1 on the field. It is `--tao-color-text-muted` now (5.7:1 and 5.3:1), and `tests/tokens.test.ts` rates the placeholder on the page and on a card in both themes. The dark one was already above.
- **A palette on a section keeps the mode of the page.** `data-tao-theme="lagoon"` on a section of a light page painted the section dark (the light block of a palette needed `data-tao-mode="light"` on that very element, and the dark block matched anything). The light block now also reaches an element that has a palette and no mode of its own inside a light page: `[data-tao-mode="light"] [data-tao-theme="…"]:not([data-tao-mode])`. A section that says `data-tao-mode="dark"` itself still stays dark. The seven palette files are regenerated.
- **`TaoProgress` is a `progressbar` for a screen reader.** It had no role and no value, so it was silent. The root has `role="progressbar"` with `aria-valuemin`, `aria-valuemax` and `aria-valuenow` (the share kept inside 0..100); an `aria-label` you give the component lands on it. The width defaults (200–400px) are not touched: that is a look.
- **`prefers-reduced-motion` reaches the overlays.** The fade of `TaoModal`, the sliding panel and the scrim of `TaoDrawer`, and the bounce and the fold of the row of a toast (`TaoToastViewport`) had no rule: they moved whatever the system said. With reduced motion they appear and go at once. `tests/reducedMotion.test.ts` holds it.

## 5.57.1

Two fixes.

- **The Vue peer range says 3.5, which is what the kit needs.** The code imports `useId` from `vue` (`TaoFormField`, `TaoMenu`, `TaoAlert`, `TaoCommandList`, `TaoDocTabs`, `TaoDrawer`, and others), and `useId` came with Vue 3.5, but `peerDependencies` still said `^3.4.0`: an app on 3.4 installed the kit without a warning and failed at runtime. The peer range, the dev range and the «Requires» line of both READMEs and of the skill are 3.5 now. Found by a Grok review of the repository, checked by hand against the installed `vue` 3.5.43.
- **`TaoAnimatedBorder`: a sharp corner stays sharp outside without `sign()`.** 5.57.0 used `sign()` to keep the outside of a sharp corner sharp, but `sign()` is Chrome 119, and the floor of the kit is Chrome 111 (README, Browser support): there the ring lost its radius. It is `min(width, corner × 1000)` now: the whole width for any visible corner, 0 for a sharp one, with the same result and a function that is older than the floor.

## 5.57.0

One small look change: the border of `TaoAnimatedBorder` outside a sharp corner is sharp now (it was a few pixels rounded). Nothing else changes for existing code.

- **`square`: sharp corners, the radius kept as it is.** `radius` as an array replaces every corner, so to keep the radius of the theme (or a `--tao-radius` of your own class) and make only some corners sharp you had to name the token in each corner, and a class could not be kept at all. `square` on `TaoCard`, `TaoBlock` and `TaoAnimatedBorder` only turns the named corners to `0px` and leaves the rest alone: `square="top"` is a sharp top, a side is `top | bottom | left | right`, a corner is `top-left | top-right | bottom-right | bottom-left`, several are an array or a string with spaces (`['top-left', 'bottom-right']`, `"top-left bottom-right"`). The rest of the corners keep what the panel has: the token `--tao-radius-panel`, a `radius`, or a `--tao-radius` set by your own class (`.my-card { --tao-radius: 28px }` and `square="bottom"` is 28px at the top, sharp at the bottom). With a `radius` array it is applied on top. A stripe stays straight on a squared side. The panel gets the class `tao-panel--corners` only then, which builds the outline from the four corners (contexts/surface.css), so a `--tao-radius: 0 0 12px 12px` written by hand on your own `.tao-panel` keeps working. The close button of a `TaoCard` and the inner radii follow the squared corners. Types: `TaoSquare`, `TaoSquareSide`; the pure part is `squaredCorners` and `radiusVars(radius, square)` in `radius.ts` (tested).
- **`TaoAnimatedBorder`: a sharp corner is sharp outside too.** The border outside is the corner plus its width, and for a sharp corner that left a 3px curve on the outside of the ring. The width is added only to a rounded corner now (`sign()` of the corner), so `radius="0"` and `square` give a ring with a square outside corner.

## 5.56.0

Nothing changes for existing code: a single `radius` (a number or a length) is drawn exactly as before.

- **`radius` of `TaoCard`, `TaoBlock` and `TaoAnimatedBorder` takes the corners one by one.** A design often wants a sharp corner or a sharp side (above all with `stripe`: a straight stripe on a card whose other side is rounded), and `radius` was one length. Now it is also an array of 1 to 4 lengths in the order of CSS `border-radius`: `[0, 0, 12, 12]` is a sharp top and a rounded bottom, `[top-left, top-right, bottom-right, bottom-left]`, two values are the diagonals (`[0, 24]`), three are `[top-left, top-right and bottom-left, bottom-right]`. A string of 1 to 4 lengths means the same (`"0 0 12px 12px"`, which already worked for the outline but broke the inner radius: it does not any more); `:radius="0"` makes all corners sharp. The stripe follows: its layer takes the radius of the panel, so it stays straight on a sharp side. `TaoAnimatedBorder` adds its width to every corner. The type is `TaoRadius`.
- **The panel contract publishes every corner.** `.tao-panel` (the class of `TaoCard` and `TaoBlock`, and of your own panel) now has `--tao-radius-tl / -tr / -br / -bl` and the inner radius of each corner, `--tao-radius-inner-tl / -tr / -br / -bl`, for a child that sits in one corner: the close button of a `TaoCard` is concentric to the top right corner, whatever the others are. `--tao-radius-inner` stays **one length**, as it was: with equal corners the same number, with different ones it follows the largest corner (a child in no corner keeps a fair value). A bare `0` in a corner is turned into `0px`, because `calc()` and `max()` of the inner radii do not take a unitless zero. On your own `.tao-panel` with different corners set the four corner properties yourself: `--tao-radius` alone, a value of four lengths, cannot be turned into an inner radius. The new pure part is in `radius.ts` (`cornerRadii`, `radiusVars`, tested).

## 5.55.0

One look changes by default: the tip of `TaoCopy`, the tip over a cell of `TaoHeatmap` and the tooltip colours of `taoChartTheme()` are the opposite of the theme now, like `TaoTooltip`. To keep the old look for all of them: `:root { --tao-tooltip-bg: var(--tao-color-surface-raised); --tao-tooltip-text: var(--tao-color-text-strong) }`.

- **Every hint of the kit is the opposite of the theme, and that is said in one place.** `TaoTooltip` had been made the opposite of the theme (dark on a light page, light on a dark one, so it does not melt into the panels it hangs over), but the other hints of the kit were drawn on `surface-raised`, the colour of those very panels, and nobody had changed them: the «Copied» tip of `TaoCopy` and the tip over a cell of `TaoHeatmap`. Now the look is one class, `.tao-tip` (`src/styles/contexts/tip.css`): the background, the text colour, the weight, the radius and the shadow, with the hooks `--tao-tooltip-bg`, `--tao-tooltip-text` and `--tao-tooltip-weight` for all hints at once. `TaoTooltip`, `TaoCopy` and `TaoHeatmap` wear it and draw only their layout; an arrow reads the private `--_tip-bg`, so a body and its arrow cannot differ. The tip of `TaoCopy` is semi-bold now, like a tooltip; the tip of `TaoHeatmap` keeps the regular weight (it has two lines and a bold value), its quieter line is the colour of the hint thinned out (`color-mix(… currentColor 70% …)`), not a text token, which is unreadable on the inverted background. **If you fill the `tip` slot of `TaoHeatmap` with your own content, let it take the colour of the hint** (no `--tao-color-text*` tokens in it).
- **`taoChartTheme().tooltip` / `.tooltipText` are the opposite of the theme too.** They were `surface-raised` and `text-strong`, so the tooltip of a chart library (Chart.js, ECharts) did not match the hints of the page. They read the same hooks now (`--tao-tooltip-bg`, `--tao-tooltip-text`).
- **A hint of your own wears `tao-tip`.** The showcase page of `TaoTooltip` has a block «A hint of your own», the rule is in `CONTRIBUTING.md` (component rules, 7) and in the repository skill. The «Contrast & keyboard» bench rates the pair «text of a hint» (4.5:1). `tests/tip.test.ts` is the guard: it fails for a component that takes the layer of the hints (`--tao-z-tooltip`) or names its root `…__tip` without the class, that sets a colour, a shadow or a radius on that root, or that repeats the hook outside `tip.css`.

## 5.54.0

Nothing changes for existing code: without `format` a `TaoCounter` is drawn as before.

- **`TaoCounter` `format`: a mask for the number.** The counter showed one thing: the digits in groups of three with a gap, padded with zeros to `maxDigits` (`000 000`). Now `format` is a mask, in the syntax of `TaoPinCode`: `#` is a digit (a wheel), any other character is drawn as it is. `##:##:##` is a clock, `#,###,###` has commas, `+7 ###` a prefix, `### ###₽` a unit, `#-##-##` a number as in a pin code. A space is the narrow gap it always was, any other character is a fixed slot with no wheel and no frame, quieter than the digits; a digit written in the mask (the `7` of `+7`) is text too, it does not roll. The digits that change still roll in turn from the right, across the separators. The mask fixes the number of digits and the counter does not grow: a number that does not fit is shown as the largest one the mask holds (`999 999`), not as zeros, because a score that suddenly reads `000 000` looks like a bug; without `format` the counter grows with the number, as before. `muteZeros` (on by default) dims the zeros that only pad the number on the left, the last digit never; turn it off for a clock, where `00:03:30` has no padding. A mask with no `#` is no mask. The label for a screen reader is the number as drawn without the padding zeros and the separators between them (`$ 000 123` is `$123`, a clock is `00:03:30`); without `format` it is the number, as before. A negative number keeps its minus in front of the cells; a fraction that truncates to zero (`-0.5`) has no minus any more. The pure part is in `counterFormat.ts` (`counterLayout`, tested). Decimals stay out: the value is a whole number, the point of a mask like `###.##` is only drawn, pass `1250` for `12.50`.

## 5.53.0

A new component, nothing changes for existing code.

- **`TaoDragNumber`: a number you drag.** The number field of a panel or an editor, as in a 3D tool: the caption, the number and its unit in one cell. Press and move sideways and the value follows the pointer like a slider (a quarter of a step per pixel, `dragSpeed` to change it; `Shift` is ten times slower, `Ctrl` snaps to the step grid, `Esc` puts the value back); a click without a move starts typing (`5`, `0,5`, or with the unit, `5 m`; another unit or a word is dropped, the value stays). The `−` and `+` buttons, the arrow keys, `PageUp` / `PageDown` (ten steps) and `Home` / `End` (the bounds) step it. A held `−` / `+` repeats (`repeat`, on by default): the first step at once, after a 0.4 s pause the steps come every 120 ms and speed up to every 40 ms; the whole run is one `@commit`, `Esc` puts the value back, a bound stops it, and the click that follows a press is not a second step (a click from the keyboard or a screen reader is a plain step). It is one control with two looks: the caption inside and the buttons on the sides (`label`, `unit`), or `variant="filled"` with `:controls="false"` for a bare column of values with the captions outside (a `<label for>` of your own, or `TaoFormField`). The unit is not part of the value, the `v-model` is a number; `precision` (the decimals of `step` by default) rounds it, `min` / `max` clamp it, and a drag past a bound does not save up the overshoot. `v-model` updates on every move, `@commit` once per action (end of a drag, ±, an arrow, Enter, blur of a typed number), so a form can push one undo step. It is a field like the others: `TaoFormField` (label, hint, error), `size`, `error`, the attributes go to the `role="spinbutton"` input, the `label` names it for a screen reader. A finger moving sideways drags (`touch-action: pan-y`), up and down still scrolls. A drag whose `pointerup` never comes (Alt-Tab, a screenshot, a system dialog, the capture taken away) ends when the window loses the focus (`listenFocusLoss`, as in `TaoSlider` and `TaoCarousel`): the value stays, `@commit` fires once, the field is not left «pressed». The pure part is in `dragNumber.ts` (`dragNumberAdvance`, `dragNumberResolve`, `parseDragNumber`, …, tested). `TaoQuantity` stays what it was, whole items in a cart.

## 5.52.0

One look changes by default: a `TaoLink` is underlined now. To keep the old look on a link: `<TaoLink underline="none">` (or `hover`). `TaoStretchedLink` keeps its look (no line); a crumb of `TaoBreadcrumb` gets the line under the pointer. The types of `TaoTable` got wider, nothing narrower: code that compiled still compiles (the default row type is `any` now, so a shared `TaoTableColumn[]` fits every table).

- **`TaoLink` is underlined, `underline="always" | "hover" | "none"`.** In the light theme the link colour is the text colour (`--tao-color-link` is black, 1.4:1 to the text; in the dark theme 1.1:1, the hue alone), so a link in a list or a line of text did not read as a link without the underline: not by sight and not by WCAG 1.4.1 (a link is told from text by a line or by 3:1). The line was only in `.tao-prose`. Now the link has the class `tao-link` and the line by default (the same one as `.tao-prose`: 1px, offset 0.18em); `hover` shows it only under the pointer and the focus (a menu entry, a card title, anything clear from its place), `none` never. The rule weighs one class, so a class of your own, written later, wins. `TaoStretchedLink` is `none` by default (the card is the sign of a link), a crumb of `TaoBreadcrumb` is `hover`. The «Contrast & keyboard» bench of the showcase rates the new pair «link on the page» (4.5:1) too. Found by an agent that made the cheat sheet ai-gen: it had added the line with its own CSS.
- **`TaoTable` is generic: a row can be an interface.** The rows were `Record<string, unknown>[]`, and an interface has no index signature, so `TaoTable :rows="flags"` with `interface Flag { … }` did not compile: the type had to be written as `type Flag = { … }`. Now `TaoTable<T>`: `T` comes from `rows` (an interface, a class, a plain object), `rows` and `columns` may be `readonly` (`as const` data, props), and the row is a `T` in the cell slots (`#cell-flag="{ row }"` knows `row.flag`), in `@row-click`, in `rowKey` and in `TaoTableColumn<T>.value(row)`. `columns` do not take part in the inference (`NoInfer`, TypeScript 5.4+), so the rows decide, and a list typed `TaoTableColumn[]` (the row type `any` by default) fits a table of any rows. `value` of a column is a method: a column of `Record` rows goes to a table of `Flag` rows too. New: the type `TaoTableRowKey`, the pure `tableCellValue` and `tableRowId` in `table.ts` (tested). Found by the cheat sheet ai-gen, where the agent had to give the flag its type with `type`.
- **`TaoTable` in a narrow place: `stack` and `minWidth`.** A table kept its columns as wide as the words allowed, so on a phone prose was squeezed into stacks of 100px (4 columns, a row 177px high), and the sideways scroll of its wrap began only after that. `stack`: under 600px of the table's own width (a container query on the wrap, so it follows the room it is given inside a shell, not the window; no JavaScript) every row is a card, each cell under its column label (`data-label`, with an empty alternative so a screen reader does not say it twice); the header stays in the DOM, hidden by sight, and the cells carry the table roles, so the table is still a table for a screen reader after it turned into blocks. The wrap needs a width of its own to be a container (it has `width: 100%`); in a shrink-to-fit parent give it one. `minWidth` (a number is px): the table is never narrower, and a narrower place scrolls it sideways; `stack` cards ignore it. A column takes `nowrap` (a code, a date, a flag) and its own `minWidth`. The alignment of a column is now the private variable `--_tao-align` read by `text-align` (it was the inline `text-align`), so the cards put everything at the start; nothing changes by sight. Found by the cheat sheet ai-gen, where a wrapper with `min-width` and `overflow-x` had to do it.
- **`TaoTextarea` follows its width, not only its text.** The autosized height was measured on mount and when the value changed, so after the field changed its width (a window resize, a drawer opening beside it) the height was stale: a scrollbar instead of wrapping, or a height measured once at a tiny width that stayed huge. A `ResizeObserver` on the field now measures again when its width changes (height-only changes, such as our own write, are ignored, so there is no loop); nothing is attached where `ResizeObserver` does not exist.
- **The rows of a `clickable` `TaoTable` work from the keyboard.** A row was a `<tr>` with only `@click`: no `tabindex`, no key, so with the keyboard a list of records could not be opened at all. Now the table is one Tab stop (a roving `tabindex`: the first row, then the row that had the focus last), the arrows and Home / End walk the rows (no wrap at the ends, as in `TaoList roving`), Enter and Space emit `row-click` as a click does (Space does not scroll the page), and the focused row has a tint and a bar of 2px in the accent at its start (on every cell of a `stack` card). Not a ring: a ring is a rectangle, and the rounded frame of the table cut its corners on the first and the last row, while a fill is clipped by the frame cleanly; the bar is on the logical edge, so in RTL it is at the right. A key that comes from a control inside the row (a button, a field, a menu) stays with that control and is not a row click. A click with the mouse is as before: a click on a button in a row still reaches `row-click` (stop it with `@click.stop` on the button). The pure step is `tableRowTarget` in `table.ts`. For a screen reader a row stays a row: when the action matters, also put a real link or button in the row. Found while reading `TaoTable` for the cheat sheet ai-gen.

## 5.51.0

Nothing to migrate: `menu`, `hint`, `tone` and `@move` are new and do nothing until set; Enter on a folder now also opens or closes it. One look changes by default: the selected row of a tree without the focus is grey (`--tao-color-hover`) instead of the accent; to keep the accent always, `.my-tree:not(:focus-within) .tao-tree__row--selected { background: var(--tao-color-accent-subtle); color: var(--tao-color-accent-text); }`. The corners are softer and the scrollbars a pixel thicker (below); the old look is `:root { --tao-radius-sm: 4px; --tao-radius-md: 8px; --tao-radius-lg: 12px; --tao-radius-control: 4px; --tao-radius-panel: 8px; --tao-scrollbar-size: 5px; }`.

- **The Guide has Starters: whole screens to begin a project from.** A starter is one Vue file people copy as is, live on the page in a frame of the width you pick (phone, tablet, wide), with the decisions it makes and why, and the whole file under it; `npm run skill` writes them into `skills/taoui/references/starters.md`, so an AI assistant starts a new app from the same shape. A starter uses the public API only (a test holds it: no `:deep(.tao-…)`, no private `--_…`). The first one is **the app shell with a side menu**, as in Axis and NextUp: `TaoNav fill` with the side panel, the rail and the bar from one list, one main action, quiet counters, the language and the theme at the bottom of the panel (in a thin header on a phone, by a container query on `tao-nav`, no JavaScript), settings as a section of the menu. The second is **a list and the open item**, as the notes of NextUp: side by side when there is room and one at a time when there is not (the list, then the item with Back and Escape), decided by a container query on an outer box, so it follows the room it is given inside the shell, not the window; each pane scrolls by itself, a `TaoList roving` list, the focus moves to the item heading and back to its row in the single pane, quiet icon actions with the one that destroys in `tone="danger"`. The showcase chrome (its accent `h2`, its paragraphs) no longer reaches into a block marked `showcase-free`, so a starter looks as it will in your app. Each starter is its own entry of the Guide menu, in the group «Starters» (`#starter-app-shell`, `#starter-list-detail`).
- **`TaoNav` `fill`: the shell of an app.** TaoNav takes the height of its parent (`html, body, #app { height: 100% }`), the page scrolls inside `.tao-nav__content` or its own panes instead of the document, and the side column runs the full height, so the `#footer` stands at the bottom of the panel. With nothing scrolling as a document, no page scrollbar comes and goes between a short section and a long one, and nothing shifts sideways. Axis needed six `:deep(.tao-nav__…)` rules for this; it can drop them.
- **Several children of the `TaoNav` `#action` stand one under the other** (the action, then a project chip), with a small gap; one child looks as before. **`--tao-nav-compact`** is public: 1 on the bar and the rail, 0 on the side panel, set on the navigation only (the page beside it and everything outside a TaoNav read 0), for your own pieces in `#action`, `#footer` and `#label`, a chip that keeps only its icon on the rail. Axis and fin-view read the private `--_compact` for that.
- **`TaoLanguageSwitch` in a TaoNav shows its name where there is room:** on the side panel «🌐 English», on the rail only the globe, by `--tao-nav-compact`, without `icon-only` and without JavaScript (in `auto` only CSS knows the look). The name is folded by width, not removed, so the button is still «Language: English». Axis did this with `:deep` rules on the switch.
- **`TaoDropdownMenu` `block`: a trigger that is a whole chip of yours.** The button fills the width and the height of its place and draws nothing of its own (no padding, no background, the corners of its parent), and what is in `#button` stretches inside it, so the chip is the button and the hover and the focus ring go round it (the ring inside, so a clipping box such as the action of TaoNav does not cut it). Under the `#action` of TaoNav a block menu keeps its own inside and the height of a control, so the rail squares it like the button above. Axis and fin-view styled `.tao-dropdown-menu__button` from outside for their project and portfolio chips; they can drop it. The app shell starter has the chip now: the folder, the project, a chevron, a menu of the projects with the current one checked and «New project»; a round icon on the rail by `--tao-nav-compact`, in the header on a phone.
- **A plain `TaoList` (`bordered=false`) keeps air between a tinted row and the line.** Its rows are rounded and take a tint on hover and selection, and the line was their own bottom border, so the tint ran into it. The line now stands in an 8px gap between the rows, shorter than the row by the text inset on both sides, as the thread list of hub has it. A bordered list is as before.
- **Softer corners by default: 6 / 10 / 14 / 18px.** NextUp, Axis and fin-view each set the same five values over the kit, so they are the kit's now: `--tao-radius-sm` 6px (was 4), `-md` 10px (was 8), `-lg` 14px (was 12), the new `-xl` 18px; `--tao-radius-control` takes `md` (10px, was `sm` 4px) and `--tao-radius-panel` takes `xl` (18px, was `md` 8px). An app that set these values can drop them.
- **Scrollbars are 6px thick by default** (`--tao-scrollbar-size`, was 5px): a pixel easier to catch with the mouse, still thin.

- **`TaoTree` has a context menu of its own.** `menu` is a list of `TaoMenuItem`, or `(node, selected) => items` built for the row it opens on; the pick comes as `menu-select(id, node, selected)`. It opens on the right click anywhere on the row (not only over the label, as a `TaoContextMenu` in the `#label` slot did), on the Menu key and on Shift+F10, under the row from the start of its label; the focus goes back to the row when it closes, and a second right click moves it. The selection follows the file managers and IDEs: a right click outside the selection selects that row first (as `update:selected`, without `select`, so an app that opens a file on `select` does not open it), a right click inside a multiple selection keeps it and the menu acts on all of it (`selected` is those ids). An empty list leaves the browser's own menu. For a menu of your own the new `menu(node, event)` event comes on every request; `event.preventDefault()` in it keeps both ours and the browser's away. While the menu is open the selection keeps its accent, and a row that is not in the selection (`selection="none"`, a disabled row) is marked. Pure helper `menuSelection(mode, selected, node)` in `tree.ts`, types `TaoTreeMenu`, `TaoTreeTone`.
- **A node takes `hint` and `tone`.** `hint` is a quiet note after the label («library root», «3 files», «changed»); it gives way first when the row is narrow and is part of the row's name for a screen reader, after a hidden comma («App.vue, changed»). `tone` (`muted`, `accent`, `info`, `success`, `warning`, `danger`) colours the label: an excluded folder, a new or a broken file. On a filled row (hover, selection, the open menu) the plain text roles fell under 4.5:1 (dark `danger-text` 4.1, `text-muted` 4.3), so such a row takes the `*-text-hover` roles and a quiet colour a third of the way to the text: measured in the showcase, the worst pair is 4.9:1 in the light theme and 5.5:1 in the dark one. A colour is not the only sign of a state: say it in `hint` too.
- **The selection of a tree without the focus is grey**, as in an IDE: the accent tells which tree the keys go to. The showcase demo shows all of it (right click, Shift+F10, hints and tones, click outside the tree).
- **The rows of `TaoTree` can be moved**, by the pointer and by the keyboard, once the app listens to `@move`. The tree changes nothing: it hands `{ ids, parentId, index, targetId, position, copy }` to the app, which moves its data (the new helper `moveTreeNodes(nodes, move)` does it for a plain `TaoTreeNode[]`; a copy needs new ids, so it is the app's). `index` is the place among the children of `parentId` once the moved nodes are taken out, ready for a `splice`. `@move` is a prop as well as an event, so the tree waits for the promise it returns: the rows stay dimmed and `aria-busy` and cannot be moved again, and a rejected promise comes as `move-error` with the data untouched. Lazy children of a folder the move touched are loaded again.
  - **The pointer:** a row lifts after 5px (a shaky click is still a click, and the click after a drop is not a pick); the middle of a folder puts the rows inside at the end, its top and bottom quarters before and after it, a leaf splits in halves, below an open folder is its first child, and below the last row of a folder the pointer going left takes the rows out of it, one level per indent. The place is a line from the level the rows will stand at, a folder is framed; a closed folder under the pointer opens after 650ms (a lazy one loads), the list scrolls at the edge of its scroll box, a ghost with the name (or «3 items») follows the pointer, Ctrl or Alt makes it a copy («+»), Escape and a lost window focus cancel. A selected row takes the whole selection, the topmost only (a child goes with its parent). Not by touch yet: on a phone a drag would fight the scroll, so it is keyboard and menu there.
  - **The keyboard:** Ctrl+X or Ctrl+C on the rows, Ctrl+V on a folder (to its end) or on a row (after it), Escape forgets; each step is said in a live region («README.md moved to src.»), a place they cannot go is said and not done.
  - **Where they may go:** never onto themselves or into their own descendants, never into a disabled folder, and no mark where nothing would change; `canDrop(move)` refuses more (a «no» cursor, no mark), `movable` picks the rows that can be moved. The pure part (`dropTarget`, `topmostIds`, `isTreeContainer`) is in `tree.ts` with its tests; texts `tree.countLabel`, `rootLabel`, `cutText`, `copyText`, `movedText`, `copiedText`, `canceledText`, `refusedText` (`en`, `ru`; optional in a locale of your own, like `menuLabel`, which is optional now too). The showcase demo moves for real, with a wait as a server would take («Slow server») and `node_modules` refused.
- **`sort`: a tree that keeps its own order.** `none` (the default) shows the data's order and a drag can put a row between others; `name` puts folders first and sorts by name as people read it (`Intl.Collator` of the locale, numbers as numbers: «file 2» before «file 10»; helper `compareTreeNodes(locale)`), a function is your own compare. The tree sorts what it shows, `nodes` is left as it is. With a sort a drag only changes the folder: onto a folder it puts the rows in it, onto any other row into that row's folder, with no line between rows (a place among siblings would be undone by the sort), and the top level is framed as a whole tree; a drop into the folder the rows are already in is no move. Ctrl+V follows the same rule. The default stays `none`: Axis and the WorldEditor of game-chronos keep an order of their own on purpose, and a sort switched on for them would shuffle it.
- **The selection is a tint, not an accent of the text.** A selected row keeps the colour of its text and icon (it was `accent-text`): the accent of a label is left to what the app marks on purpose with `tone`, or a walk through the tree shines as much as a mark. The tint is `accent-subtle` while the tree has the focus and grey without it, as before. The showcase demo no longer paints an open folder with the accent either.
- **A saved view of a tree comes back whole.** `expanded`, `selected` and `checked` are lists of ids, so an app can store them (TaoUX `createSavedStorage`) and give them back after a reload. A lazy folder in a restored `expanded` used to show open and empty: its children were loaded only on a click. Now every open lazy folder that is on screen loads by itself, and its own open children show up and load in turn, so a saved chain (`node_modules / vue / dist`) opens level by level; the `expanded` given is not rewritten. A folder whose load fails is closed again with `load-error`, once, not in a loop.
- **A double click acts, a single click selects.** A double click on a folder opens or closes it, on a node without children it emits the new `open(node)` (a file into an editor). Enter does the same after it selects, as the ARIA tree pattern asks (Enter on a branch used to only select it). The two clicks of a double click do not undo a multiple selection, a double click on the chevron, the box or the actions is not one on the row, and with `selection="none"` (where a click already toggles a folder) only a leaf is opened.
- **A menu with `closeOnScroll` closes only for a scroll that moves what it is for** (`TaoMenu`, and so `TaoContextMenu` and the menu of `TaoTree`): the page, or a container that holds the anchor; for a point, the element under it when the menu opens. Any scroll on the page used to close it: on the showcase an autoplaying carousel scrolled its track every few seconds and closed every open context menu, which looked like «the menu closes when the pointer leaves it». A scroll inside the menu still does not count.

## 5.50.0

Nothing to migrate: a component and an icon are added, and two looks are put right (the keys in a menu and a command list, the highlight of a command list row).

- **The keys of a menu and a command list are on the line of their label again.** `TaoKbd` `plain` kept the height of the key cap (`1.7em`, about 24px): on a text line it did nothing, but in a flex row (a menu row, a command list row) the key is a block, so its text sat at the top of that box, a few pixels above the label. `plain` now has `height: auto`, and a test holds that every box property of the cap is reset on it. This reached `TaoMenu` (and so `TaoContextMenu`, `TaoDropdownMenu`, `TaoMenubar`) and `TaoCommandList` (`TaoCommandPalette`).
- **The highlighted row of a command list has the corners of a menu row.** The list was inset by 8px and the row corners are the panel radius minus the inset, which is 0 with the default 8px radius: a bar that did not touch the edges and had square corners. The inset is the 4px of `TaoMenu` now (one `--_inset` for the list padding, the row corners and the start of the field text), so the corners are 4px and the text of the field still stands over the labels of the rows.

- **New `TaoLanguageSwitch`:** the language of the interface as a globe that opens a list of the languages, each under its own name (`Русский`, `English`, `Deutsch`), the current one checked. `languages` is codes or `{ code, label }`, `v-model` is the code; the names come from the engine (`Intl.DisplayNames`, the helper `taoLanguageName(code)` is exported), so there is no table to keep. It shows the name of the current language beside the globe, `icon-only` leaves the globe (a phone); the accessible name of the button is «Language: English» either way (the visible word is inside it, and the label is a locale text: `languageSwitch.label`, `en` / `ru` built in). It writes `<html lang>` on mount and on a change (`:apply="false"` to do it yourself). What it does not do, on purpose: it knows none of your texts and stores nothing; the messages of the app, the storage and `setTaoLocale(localeRu)` for the built-in texts stay yours (`@change` is the place). Built on `TaoDropdownMenu`, so the list, the keys and the focus return are the menu's. Every name carries its own `lang`, so a screen reader reads «Deutsch» in German.
- **Menu items take `lang`.** `TaoMenuItem` (`item`, `checkbox`, `radio`, `label`) has an optional `lang`: the language of the label when it is not the page's, written as `lang` on the row (`TaoMenu`, `TaoDropdownMenu`, `TaoContextMenu`). Without it nothing changes.
- **Icon `tao-globe`**, beside `tao-sun`, `tao-moon` and `tao-monitor` for the theme: the sign of the switch above (44 built-in icons now).
- **The Guide: «Switching the language».** The do (the switch beside the theme toggle) and the don't (`EN | RU | DE | FR | JA` in a `TaoSegmented`), the rule and the reason: the name of a language in itself, no flags (a flag is a country, and the W3C Internationalization guidance says not to use them for language links), no codes, and a list that only grows is a menu from the start. The header of the showcase has the switch now instead of the segmented `RU | EN`.

## 5.49.2

Nothing to migrate. A segmented control whose captions fit looks and measures as before; one that did not fit used to lose its last words, and now wraps them.

- **`TaoSegmented`: a caption that does not fit is no longer cut off.** When the track hits `max-width: 100%` (a narrow column, a long Russian caption beside a short one) the options give way: the label wraps to a second line, then ends in an ellipsis, and the option shows the full text as a native `title` on hover (set only while it is cut). With room, an option keeps its natural width, as before (`flex: 0 1 auto`, it was `0 0 auto`); the face fills the option, so the focus ring is as tall as a two-line neighbour. The `block` ellipsis rule never matched (it looked for the label as a child of the track, where it is a great-grandchild) and is gone: `block` gets the same wrapping.
- **A safety net, not a layout.** Two lines are for the unforeseen (a language, a font, a narrow container); a caption that does not fit by design belongs in a shorter word, `TaoRadioGroup` or `TaoSelect`. The showcase section «When the captions do not fit» shows it.
- **The Guide explains why: a new pattern «A segmented switch: short captions».** A do and a don't side by side, the rule (2 to 5 options, one word or a short noun phrase each, the explanation in the `legend`, sentences go to `TaoRadioGroup`) and the reason, from Apple's Human Interface Guidelines (about five segments on iPhone, segments of similar size, nouns) and the GitLab Pajamas design system (2 or 3 options, never over 5, a one-word label). Also in `skills/taoui/references/patterns.md` for assistants (`npm run skill`).

## 5.49.1

Nothing to migrate. To make a key selectable again (a page of documentation that wants it copied): `.my-doc .tao-kbd { user-select: text; }`.

- **`TaoKbd` is not selectable.** A key is a hint, not content: a double click on a menu row or a button no longer selects the key with it, and a copied row carries no key. `user-select: none` sits on the zero-specificity `:where(.tao-kbd)` rule, so both `cap` and `plain` have it and the place that holds a key can override it.

## 5.49.0

Nothing to migrate: an `anchor` that is an element works as before.

- **`TaoMenu` opens at a point of the screen.** `anchor` is now an element or a virtual anchor `{ x, y, width?, height? }` in viewport coordinates (types `TaoAnchor`, `TaoVirtualAnchor`, helpers `isVirtualAnchor`, `anchorRect` in `floating.ts`): a menu at a drop point of a canvas or at the pointer needs no empty positioned element any more. With a point the default `placement` is `bottom-start` (the top-left corner 4px under the point, so the click that opened the menu does not hit the first item; with an element it stays `bottom-end`); the panel is `fixed`, flips and shifts at the viewport edges like an anchored one, stays at its screen point on scroll (`closeOnScroll` closes it, as with an element), moves when the point changes, and the point can be swapped for an element and back. With a point the menu gives the focus back, on close, to what had it before opening (not after a press elsewhere or a scroll). Escape, outside press, arrows, type-ahead and submenus are the same as before.
- **`TaoPopover` takes the same `anchor`** (a point or an element instead of the trigger); Escape gives the focus back to what had it before opening.
- **`useFloating`** accepts a ref, a getter or a value as the anchor and re-measures when the anchor changes.
- **`TaoContextMenu`** is built on it: the hidden `.tao-context-menu__anchor` span and its own focus bookkeeping are gone (a private detail, the behaviour is the same).
- **Recipe, a context menu of your own:** `@contextmenu.prevent="e => { point = { x: e.clientX, y: e.clientY }; open = true }"` and `<TaoMenu :items :open :anchor="point" @close="open = false" />` (the demo of `TaoMenubar / TaoContextMenu` shows it). Not tested in real browsers or on touch.

## 5.48.0

A link with a class keeps its own colour on hover (it used to turn rose). Three looks change: the text of a field in the light theme is softer, the rose of a link on hover is a shade deeper, the accent text of a palette is a shade darker where it stands on a tint. To give your own link the rose on hover as before: `.my-link:hover { color: var(--tao-color-link-hover); }`.

- **`a:hover` no longer beats a class.** `base.css` had `a:hover { color: link-hover }`, weight 0,1,1, and any class on a link weighs 0,1,0, so a menu link, a card that is a link or a link of your own turned rose on hover whatever its class said. Now it is `a:where(:hover)`, which weighs as `a` and no more: a bare link still turns rose, a link with a class keeps its colour. `TaoNav` and `TaoLink` are not affected.
- **Light theme: `--tao-color-input-text` is `text`.** It was `gray-950`, which is `text-strong`, so the value of a field, a number input and a select read brighter than the buttons beside it, against the text ladder («field values: `text`»). The dark theme already had the same colour.
- **Light theme: the rose of a link on hover is `accent-text-hover`.** It was `pink-400`, 3.7 to 4.0:1 on a page and on a grey panel; now it is above 4.5:1, as in the palettes.
- **Palettes: `accent-text` reads on the tints of the accent too.** A chosen item, a tag and a hovered row stand on `accent-subtle` (8 to 16 % of the accent over the surface), which is a little darker ground than the page, and a generated `accent-text` that was 4.6:1 on the page came out 4.0 to 4.4:1 there. The generator now asks 4.6:1 on the page, on a raised surface and on both tints; the seven palettes are regenerated (`npm run palettes`), and `tests/palette.test.ts` holds it for every palette and mode.
- **The bench of the Guide.** A select is a field (its value is regular weight, like an input), so the weight 500 is asked of the labels of controls only; the plain link, which turns rose by design, is judged by how it reads, not by the step. With these, the bench is clean on every palette and both modes on the page and on a panel; one known edge is left: a chosen segment in the dark theme on a sunken surface (1.0:1 to its track).

## 5.47.0

Nothing to migrate. One look changes in the light theme and in palettes: the text of a chosen item is a shade darker.

- **The text of a chosen item is `accent-text`, not `accent`.** `--tao-color-accent` is the colour of a fill (a button, a check, an underline: white sits on it); `--tao-color-accent-text` is the same hue made for being text, 4.5:1 on a page. In the light theme the plain accent as text on a panel is only 3.6 to 4.2:1, so a chosen segment, a chosen tab and an accent tag did not keep the promise of the contrast section. `TaoSegmentedOption` (chosen, and the count), `TaoTabs` (selected), `TaoDocTabs` (active), `TaoTag`, `TaoCombobox` / `TaoSelect` / `TaoPresetInput` (the selected option), `TaoListItem` (the selected title), `TaoCounter`, `TaoPinCode` (the value), `TaoCommandList` (the matched letters) and the initials of `TaoAvatar` now use it, as `TaoNav` and `TaoTree` already did. In the dark theme the two roles are one colour, so nothing changes there; icons, underlines, borders and fills stay `accent`. The bench of the Guide («Controls side by side») shows the rest: on a palette the generated `accent-text` is made for the page, so a chosen segment and a tag, which stand on a tint, reach 4.0 to 4.4:1 there.

## 5.46.0

Nothing to migrate. One look changes in the light theme: a field, a track or a code block sunk into a panel is seen now (it was the colour of the panel).

- **Light theme: `--tao-color-surface-sunken` is a tint, as in the dark one.** `--tao-color-surface-raised` and `--tao-color-surface-sunken` were both `gray-50` there, and a popover, a modal and a card are raised, so a `TaoSegmented` track, a `TaoInput` and the like sunk into one had the colour of the panel they stood on and were held by a hairline border alone. Now `sunken` is `gray-900` at 4.3 % over what is under it: on the white page it is the same `#f5f5f5` as before, on a raised panel it is darker. The dark theme already did so.
- **`TaoSegmented`: the hook `--tao-segmented-thumb`.** The thumb was `surface-raised`, the colour of the track on a page in the light theme. The light theme sets the hook to a soft white (60 % over the track; pure white shouted beside a grey track and a white page), so the thumb is seen on the track on the page, on a panel and in a popover; with no hook the thumb is `surface-raised` as before (the dark theme).
- **The Guide has a bench, «Controls side by side» (`#harmony`).** It stands the controls of the kit in a row on a surface of your choice (page, panel, sunken) in a size of your choice, measures them with the browser and judges the row: one step of the text ladder per role, one weight for the labels, one height for a size, a fill that is seen, a text that reads on what it stands on (4.5:1), and a hover that keeps the text readable and goes up the ladder. A hover is read without a pointer (`showcase/harmony/hover.js` copies the rules with `:hover` for a moment). It follows the theme and the palette. It shows what is left to decide: the text of a field and a select is `input-text` (`text-strong` in the light theme), not the `text` the ladder promises; a select is weight 400 where the others are 500; a chosen segment, a chosen tab and an accent tag draw their text in `accent`, not in `accent-text`, the role made for text, and reach only 3.6 to 4.2:1 on a panel; the global `a:hover` (a rose link) is 3.7:1 on a grey panel. The rules are in `showcase/harmony/measure.js` with a test, the controls in `showcase/harmony/controls.js`.
- **The sidebar of the showcase: a hover that reads.** The kit's `a:hover` (weight 0,1,1) beats a class on a link (0,1,0), so a menu link turned rose on the grey of its hover, 3:1. The links go to `text-strong` on hover, the current one is `accent-text` (4.5:1) and its hover `accent-text-hover`; the same `accent-text` for the current tab of the books and the current group. The bench measures this row, so it can not come back.

## 5.45.0

Nothing to migrate: the dots stand upright by default, as before.

- **`TaoDropdownMenu` `dots`: upright or lying three dots.** `dots="horizontal"` gives ⋯ (a row of a table or a list, the corner of a card), the default `vertical` gives ⋮ (a narrow column, a toolbar). It is only the default face of the button: your own `#icon` or `#button` slot wins and `dots` is ignored.

## 5.44.0

The text of a tip is semi-bold now. To keep the regular weight: `:bold="false"` on the tooltip, or `:root { --tao-tooltip-weight: 400 }` for all of them.

- **The skill is up to date.** `skills/taoui/SKILL.md` names `TaoKbd`, the new `TaoTooltip` props (`shortcut`, `bold`, `animated`) and the rule that a hover is never the accent; `references/components.md` and `patterns.md` are regenerated.
- **`TaoTooltip` `bold`, on by default.** A hint is small (12 px) and short, and at the regular weight it is thin on its inverted background. The text is weight 600 now, the weight of the key cap next to it. `bold="false"` returns the regular weight; the token `--tao-tooltip-weight` sets the weight for every tooltip.

## 5.43.0

The tip now appears at once, without the fade. To keep the old fade: `animated` on the tooltip, or `:root { --tao-tooltip-motion: 1 }` for all of them.

- **`TaoTooltip` appears at once; `animated` brings the fade back.** A hint was fading in over 0.2 s, and on a toolbar, where the pointer goes from one button to the next, every hint began from nothing and the bar felt slow. The fade is off by default now. `animated` is a share of the base duration (`--tao-duration-base`): `0` off, `1` the base time, `2` twice as long, `0.5` half; `true` is `1`. Without the prop the token `--tao-tooltip-motion` (the same number) decides, so an app sets the time once for every tooltip.
- **The text of a tooltip sits in the middle.** The box was symmetric, but a line of text sits a little above the middle of its line box, so the hint looked raised; the text takes 0.06em more room on top and less below.
- **A key is the same height everywhere, and the letter is in the middle.** The key in a button, a tooltip and on its own had three heights, and the letter was nudged by a padding that fitted only one of them. `TaoKbd` is now one single line (`line-height: 1`, which puts a capital almost exactly in the middle) of an even height of whole pixels (`1.7em`, 22 px at the usual size); in a tooltip it is a little smaller and pulled into the line, and the text and the key stand on one baseline (`align-items: baseline`), in any font.

## 5.42.0

The look changes in a few places: what a pointer is over is no longer accent-coloured. To keep the old look, restore the accent in your own CSS for the selectors listed below.

- **The accent is not for hover.** A wash behind a neutral control was amber under the pointer (fixed in 5.41.0 for `tone="neutral"`), and the same slip was in a dozen other places: the highlighted row of `TaoMenu` (accent text) and of `TaoCommandList` (accent wash), the hover of a `TaoTabs` tab, a `TaoQuantity` button, a `TaoScrollTop` ghost / text button, a slider mark, the clear buttons of `TaoSelect` / `TaoCombobox` / `TaoColorInput`, the `TaoCopy` button, the eyedropper of `TaoColorPicker`, the border of a `TaoColorInput` and the ring of a hover `TaoCard`. Under the pointer they are now neutral: the wash is `--tao-color-hover`, the text goes up to `text-strong`, a border to `border-strong`. The accent stays where a thing is chosen or current (the selected tab, the checked box, the open colour input, the chosen card), for the focus ring and for a solid accent control (whose hover is `accent-hover`).
- **A rule in the guide, and a test that keeps it.** The accent budget got a rule: hover, the row under the arrows and a pressed toggle are neutral, a wash or a fill is never the accent. `tests/accent-budget.test.ts` reads the CSS of every component and fails when a rule for `:hover`, or for the highlighted row of a menu or a list, uses the accent roles (`accent`, `accent-subtle`, `accent-text`).

## 5.41.0

Nothing to migrate for the new component. Two looks change: a neutral control under the pointer is grey, not amber (see below), and a key in a button, a menu and a list is drawn by one component. To keep the old amber wash: `.tao-tone-neutral { --tao-tone-wash: var(--tao-color-accent-subtle-hover); }`.

- **New `TaoKbd`: one look for a key.** A key was drawn in four places, each with its own `<kbd>` and its own CSS (the button, the tooltip, the menu, the command list). Now it is one component: `variant="cap"` (default) is a key cap with a quiet fill of the text colour, `variant="plain"` is muted text with no cap for a column of keys. `TaoButton` (`shortcut`), `TaoTooltip` (`shortcut`), `TaoMenu` and `TaoCommandList` use it; the look of each stays as it was (a cap in the button and the tooltip, plain text in the menu and the list). The base style has zero specificity (`:where`), so the place that holds a key sets its own size.
- **A neutral control's wash is grey.** The neutral tone's hover wash (`--tao-tone-wash`) was the accent tint, so a `tone="neutral"` ghost button (a toolbar tool) turned amber under the pointer while the pressed state next to it was grey. The wash is now the text colour at 10%, the same family as the pressed state. The accent stays for what is chosen or primary.

## 5.40.0

The look changes, not the API: a tooltip is now the opposite of the theme. To keep the old look, set `--tao-tooltip-bg: var(--tao-color-surface-raised); --tao-tooltip-text: var(--tao-color-text-strong);` on `:root`.

- **`TaoTooltip`: the tip is the opposite of the theme.** It was the colour of the panels (`surface-raised`), so in a dark theme a grey tip hung over grey panels and melted into them; it looked like one more piece of the panel, not like a hint. Now it is dark on a light theme and light on a dark one (the background is `--tao-tooltip-bg`, by default the strong text colour; the text is `--tao-tooltip-text`, by default the page background), the arrow follows the background. A hint floats over the interface, is temporary and is not a control, and the opposite colour says so at once.
- **`TaoTooltip` `shortcut`.** The key that does the same, as a key cap after the text (`Text` and `T`, `Ctrl+K`), instead of putting it into the text in brackets. The cap takes the colour of the tip, so it fits any theme and any token of your own. The showcase shows it with the other examples.

## 5.39.2

Nothing to migrate: a bar without `max-width` measures as before.

- **`TaoToolbar` `overflow`: a bar that shrinks to its content no longer folds away group by group.** The bar took the room it had from its current width. A floating bar (`position: absolute`, `inline-flex`, `width: max-content`) is exactly as wide as what is left in it, so after a group went under «⋮» the bar was narrower, the narrower bar folded the next group, and so on down to the pinned one (and, if the bar moved while it shrank, the room could shrink with it). Now the room is taken from the bar's own `max-width` in px when it has one: give the bar `max-width` (a number of px, the room you can give it) and it folds only what does not fit that, and the answer does not depend on how wide it was a moment ago. A `max-width` that is a percentage or `calc()` is not a number of px and is ignored, so the width the bar has is used as before.

## 5.39.1

Nothing to migrate; the demo and the docs of `TaoMarquee`, no change in the component.

- **The ticker of the demo no longer twitches.** The quotes of the showcase were bare text: a price that got longer or shorter moved everything after it, and the strip twitched back and forth, and the quotes had no space between them. Every quote is a block of fixed width now (the symbol, the price and the change each in a column of `ch`, `tabular-nums`, prices with a fixed count of decimals) with a gap after it. The docs of `TaoMarquee` say it: the line is as wide as its content, so live parts should have a fixed width.

## 5.39.0

Nothing to migrate: `fill` and `reverse` are off by default, and a marquee without them runs as before. One fix: it now follows its content.

- **`TaoMarquee` follows its content.** It measured the line when the text or the gap changed and when its box was resized, but not when the content of the slot changed (a new price, a font that came late, an image): the line kept the old width, so a line that had grown stood still, or one that had shrunk ran with a hole. The hidden copy that measures the natural width is watched now (`ResizeObserver`), so nobody has to call `measure()`; it stays for the rare case.
- **`TaoMarquee` `fill`: a short line runs too.** A line that fits stood still; with `fill` it is repeated, with `gap` between the copies, until the copies cover the whole width (and one more, since the strip moves by one round), so there is never a hole in the strip. A ticker of quotes, a row of logos. A line wider than the box still has two copies as before; an empty one has nothing to repeat and stands; with «reduce motion» it stands still, as every marquee does. The extra copies are hidden from a screen reader and inert, like the second one always was.
- **`TaoMarquee` `reverse`: to the right.** The same round backwards (the pause at the start of a round goes with it).

## 5.38.2

Nothing to migrate; a fix to the look.

- **`TaoDocTabs`: one place between two tabs is one mark.** While a tab was dragged, the drop mark stood on the right edge of the tab A when the pointer was in its right half, and on the left edge of the next tab B when the pointer was in the left half of B: two marks for one place between A and B, and a mark that jumped across the gap, so it looked as if there were two places to drop. Now both are drawn once, at the left edge of B (after the last tab, at its right edge). A place where the tab would stay as it is (next to its own place) is no place to drop and has no mark.

## 5.38.1

Nothing to migrate; a polish of 5.38.0. One thing changes: tabs are draggable (and Alt + ← → moves them) only when you listen to `reorder`.

- **`TaoDocTabs`: icons instead of glyphs.** The cross is `TaoIcon` (`tao-close`) and the unsaved dot is a circle drawn by the CSS, no `×` or `●` is in the text of a tab; the hidden text for a screen reader is the shared `tao-sr-only`.
- **`TaoDocTabs`: the active tab is brought into view by scrolling the row, not the page.** `scrollIntoView` scrolled every ancestor too: with the row partly off the screen, switching a tab pulled the page. The row now sets its own `scrollLeft`.
- **`TaoDocTabs`: the sideways swipe at the end of the row stays in the row** (`overscroll-behavior-x: contain`), it no longer turns into the back gesture of the browser.
- **`TaoDocTabs`: the cross is always visible on a touch screen** (`hover: none`); before it showed on hover and on the active tab only, so a tab that was not open could not be closed by a finger.
- **`TaoDocTabs`: a tab that cannot be moved is not draggable.** `draggable` and Alt + ← → work only when the app listens to `reorder` and there is more than one tab: a tab dragged nowhere showed a drop mark that did nothing, and Alt + ← was taken from the browser («back») for nothing. A touch screen has no dragging: the app's own menu (`menu`) is the way there.

## 5.38.0

Nothing to migrate: a new component.

- **`TaoDocTabs`: the tabs of open documents.** The row of an editor with several documents: a tab per document (`items`: `{ value, label, title?, dirty?, preview?, closable? }`), a cross to close it, a dot while it has unsaved changes (read aloud as `dirtyLabel`), a **preview** tab in italics (the next preview replaces it: that rule is the app's, the tab only shows it) that a double click or Enter pins, and tabs that can be dragged into another order. The component draws the row and asks, the app does: a close, a pin, a move, a menu are events (`close`, `pin`, `reorder(from, to)`, `menu(value, event)`), because the list and what closing a document means (a question, a save) are the app's. `reorder`'s `to` is the place once the tab is taken out and put back, so `list.splice(to, 0, ...list.splice(from, 1))` is the whole handler (`moveTarget` is exported for your own lists). Keys: ← → walk the tabs and open them (the ends join), Home End, Delete closes (a tab with `closable: false` ignores it and has no cross), Enter pins a preview, Alt + ← → moves the tab itself (the keyboard way to the drag), the menu key or Shift + F10 and a right click ask for the app's menu; the middle button closes. Tabs that do not fit scroll sideways (the wheel scrolls the row when it overflows) and the active one is always brought into view. A tab is a `div role="tab"` with the cross inside it (`aria-hidden`, no Tab stop): the cross is for the pointer, the keyboard has Delete. Slot `#label` for the content of a tab; texts in the locale (`docTabs`) and as props.

## 5.37.3

Nothing to migrate; a fix to the look.

- **`TaoColorPicker`: the preview, the field and the eyedropper stand on one line.** Under the model switch the row has a preview, a field with its label («HEX» or «R», «G», «B») above it, and the eyedropper. The row was centred, so the preview and the button hung in the middle of «label + field» and stood higher than the field, and they were 36px beside a 26px field. It was so since 3.2.1, when the label was put over the HEX field (so that the row keeps its height in every mode). Now the row is one small size (`tao-size-small`, which the density also reaches), the preview, the fields and the button are one height, and `align-items: flex-end` puts them on one line under the labels. In HEX and in RGB / HSL alike.

## 5.37.2

Nothing to migrate; two fixes.

- **A dialog no longer shifts the page sideways when it opens.** A lock of the page scroll (`TaoModal`, `TaoDrawer`, the modal `TaoCommandPalette`, the confirm window) sets `overflow: hidden` on the body, and a page with a classic scrollbar lost the bar and became wider by its width, so everything moved. The lock keeps the place of the bar now (`scrollbar-gutter: stable` on the root while it is locked, given back after) and only when the bar is there: on a short page, or with overlay scrollbars, nothing is reserved. A browser that does not know `scrollbar-gutter` (before Safari 18.2) shows the shift as before.
- **The wheel at the end of a scrolling panel stays in the panel.** As in 5.37.1 for `TaoCommandList`, now the same for the other panels that float over the page or sit in a dialog: the lists of `TaoSelect`, `TaoCombobox` and `TaoPresetInput`, `TaoMenu` (and the menus built on it), `TaoPopover`, the overflow menu of `TaoToolbar`, and the content of `TaoModal` and `TaoDrawer` get `overscroll-behavior: contain`. `TaoTable` and the `pre` of `.tao-prose`, which scroll sideways inside the page, get `overscroll-behavior-x: contain` only: the sideways swipe at the end no longer turns into the back gesture of the browser, and the vertical wheel still goes on to the page.

## 5.37.1

Nothing to migrate; a fix.

- **`TaoCommandList` (and the palette): the wheel at the end of the list does not scroll the page.** When the list was scrolled to its last row, the next turn of the wheel went on to the page behind it (a list in a popover, a panel with `modal="false"`, a list laid in a page). The list has `overscroll-behavior: contain` now: it scrolls by itself and keeps the wheel. In the modal palette the page was locked already, so nothing changes there.

## 5.37.0

Nothing to migrate: `modal` is `true` as before. One thing looks different: on a screen narrower than 600px the palette takes the whole screen now (`fullscreen="narrow"`); `:fullscreen="false"` keeps it a floating panel there too. (The palette is not on npm yet, so no app has seen the old look.)

- **`TaoCommandPalette` `modal`: a panel with no dimming.** `:modal="false"` makes it what the quick open of VS Code is: a panel at the top over a living page, with no dimming and no scroll lock, outlined with a hairline because nothing dims the page behind it. A press outside the panel closes it (there is no backdrop to press), Escape closes it as before, and the dialog says `aria-modal="false"`. The page can be read, scrolled and clicked while it is open.
- **`TaoCommandPalette` `fullscreen`: the whole screen on a phone.** As on `TaoModal`: `true` — always the whole screen, `'narrow'` (the default here) — only below 600px, `false` — never. The panel is the page then: square corners, the field at the top and the list under it taking what is left, the safe areas of the phone kept. The default is `'narrow'` and not `false` (the default of `TaoModal`) because a command list on a phone is a page in every app that has one.

## 5.36.0

Nothing to migrate: `TaoCommandPalette` takes the same props, slots and events and looks the same; the new component is added beside it. (The look of the palette changed in 5.35.1 and 5.35.2, which are not on npm yet.)

- **`TaoCommandList`: the field and the list of the command palette with no window around them.** The palette is a dialog, and a dialog is only one of the places such a list lives: it can be a block of a page, a side panel, a popover under a button. `TaoCommandList` is exactly what is inside the palette (the search, the lit letters, the groups, the rows with an icon, a description and a shortcut, ↑ ↓ Home End Enter, the `combobox` and `listbox` roles for a screen reader, the `#item` and `#empty` slots) and nothing else. `@select` picks a command and closes nothing; `@escape` tells that Escape was pressed in the field; `autofocus` puts the focus in the field when the list appears; `focus()` and `reset()` are for the parent. The list takes the height its parent gives it and scrolls inside it; `class` and `style` go to the root. `TaoCommandPalette` is now this list in a dialog (the overlay, the page scroll lock, Escape, the focus return), made anew at every opening, so it still starts with an empty query and the focus in the field. The texts are the same (`commandPalette` in the locale), and the class names of the rows are `tao-command-list__*` now (they were `tao-command-palette__*`, which no app should have styled).

## 5.35.2

Nothing to migrate; a fix to the look.

- **`TaoCommandPalette`: the description stands in the line of the label.** It was a second line under the label, so a command with a description was taller than its neighbours and the list lost its rhythm (and the arrows walked in unequal steps). Now the description follows the label in the same line (muted, the secondary size of a control) and gives way first: it is cut with an ellipsis and never pushes the label. Every row is one height. For a two-line row of your own use the `#item` slot.

## 5.35.1

Nothing to migrate; the look of `TaoCommandPalette` is put in order.

- **`TaoCommandPalette`: the field and the rows are one scale, the groups read as groups, every row is on one rhythm.** The panel is teleported to `<body>` and set no text size of its own, so the rows took the 16px of the page while the field stayed at 14px: the field looked small beside big rows. The panel sets `--tao-control-font-size` now, the field is one step taller than a row (row height + `--tao-space-2`) and its text starts where the labels of the rows start. A caption of a group is small capitals with spacing (`--tao-font-size-xs`, 600, muted) with a hairline above every group but the first, so it no longer passes for a row. A row is one height (`--tao-control-height`), and a row with a description is the same row with a second line, not a different one. While any row has an icon the rows without one keep an empty column for it, so every label stands in one column. The row under the pointer or the arrows goes one step up the text ladder (`text-strong`), the corners are concentric with the panel, the description, the group name and the shortcut are on the secondary size of a control.

## 5.35.0

Nothing to migrate: a new component.

- **`TaoCommandPalette`: a dialog that searches a list of commands.** The `Ctrl+K` of an editor, without the editor: `items` (`{ id, label, group?, shortcut?, icon?, description?, keywords?, disabled? }`) are searched and shown, the app runs the pick (`@select`) and opens the palette from a key of its own (the palette listens to no key, so it takes no shortcut from the app). Every word of the query must fit, in any order: the start of the label scores highest, then the start of a word in it (after a space, a dot, a dash, an underscore, a slash or a colon), then any place, then the letters in order with gaps (`sv` finds «Save», fewer gaps rank higher); the group, the description and `keywords` find a command too, with nothing to light; `е` and `ё` are one letter, case does not matter. The matched letters of the label are lit. With an empty query the list goes under captions of its groups, with a query each row names its group. A disabled command is shown and cannot be picked. Keys: ↑ ↓ walk the rows that can be picked (the ends join), Home End, Enter picks, Esc closes (through the layer stack: a menu opened from it closes first), Tab keeps the focus in the field, a key during text composition is not taken. A role map for a screen reader: a dialog with a `combobox` field (`aria-controls`, `aria-activedescendant`) and a `listbox` of `option`s. Slots `#item` (your own row: the item, whether it is active, the lit stretches) and `#empty`; `surface`, `limit`, `placeholder`, `emptyText`, `label` (texts also in the locale: `commandPalette`). The search is exported alone as `matchCommands(items, query, limit)` (with `mergeRanges`, `splitByRanges`) for any list you filter by typing. Made for the command registry of TaoUX (`taoux/commands`): its commands map to `items` one to one.

## 5.34.1

Nothing to migrate; a fix.

- **`TaoCarousel` `centered` + `loop`: no flicker at the seam.** When the strip stopped on a copy (going from the last slide to the first, or back) it jumped to the real set in `scrollend`, and the scale and the fade of the slides (`--tao-carousel-d`) were rewritten only by the `scroll` event of that jump, which comes a frame later; that one frame drew the slides in their new places with the old look, a flash. The distances are written in the same frame as the jump now.

## 5.34.0

Nothing to migrate for a plain `loop`. `centered` with `loop` changes: it was a rewind to the first slide, it is a cycle now.

- **`TaoCarousel` `centered` + `loop`: a cycle with no end.** At the ends of a centered strip there was an empty place; now the slides from the other end stand in it. Forward from the last slide is the first one, back from the first is the last, with no rewind, for the arrows, the keys, a swipe and a drag, the autoplay and the model; a dot goes to the nearest copy of its slide, so the shortest way. The slides are drawn three times (more when there are few of them, so the frame is never empty): the middle set is the real one, the others are `inert` and `aria-hidden` and marked `data-tao-carousel-copy`, and a slide should not hold an `id` or a `ref`. Whenever the strip stops in a copy it jumps by whole sets back to the real one, which looks the same. The dots, `v-model` and the `change` event count only the real slides. The copies are drawn after the mount (the server draws the slides once, so hydration has nothing to differ in). A plain `loop` is a rewind as before.

## 5.33.0

Nothing to migrate: `centered` is off by default, and a carousel without it works as before.

- **`TaoCarousel` `centered`: the current slide in the middle.** The strip the shop and gallery pages use: the current slide stands in the middle and is the biggest, the ones beside it are smaller, the outer ones fade and are cut by the edge of the strip, the arrows hang over its edges. `perView` is how many whole slides are in the frame, `peek` is how much of the outer ones shows on each side, and a step (the arrows, the keys, the autoplay) is one slide, the dots count every slide. The strip is still a scroll-snap strip, so the swipe, the mouse drag, the wheel and `loop` work as in the other modes; the first and the last slide can stand in the middle (two spacers), and a change of the width keeps the current one there. The script writes only one number to each slide, `--tao-carousel-d` (its distance from the middle, 0 … 2 slides), and the CSS turns it into `scale` and `opacity`, so the look is restyled with `--tao-carousel-scale-step` (0.09), `--tao-carousel-fade` (0.55) and `--tao-carousel-ring` (the ring around an arrow, the page background by default). The width of a slide is measured by its layout width (the drawn one is scaled).

## 5.32.2

Nothing to migrate; a fix.

- **`TaoSegmented`: the thumb in a scaled parent.** The thumb was measured with `getBoundingClientRect()` (screen px) and drawn in layout px, so inside a parent with `transform: scale(...)` (a zoomed canvas of nodes) it came out smaller by the scale and sat off its option. A change of the zoom does not resize the track, so the `ResizeObserver` stayed quiet and the thumb kept the size of the zoom it appeared at. The boxes are now divided by the scale (the screen size of the track over its layout size), so the thumb is in layout px and right at any zoom; without a layout (SSR, jsdom) the scale is 1 and nothing changes. Found in `kupona`, a calculator on a canvas of nodes.

## 5.32.1

Nothing to migrate; one look changes: the confirm dialog has no bar on its left edge.

- **`confirm()` has no accent bar on the left.** With a large `--tao-radius-panel` the curve of the corners cut the 3px bar into a broken line. As for `toast()`, the bar told nothing the icon and the tinted background do not: it is gone, and `.tao-confirm__accent` with it.

## 5.32.0

Nothing to migrate, but two looks change: `TaoThemeToggle` is neutral now (it was amber; `tone="accent"` brings the old colour back), and a quiet control with `tone="neutral"` is the body colour at rest (it was white).

- **The text ladder is a contract now, and `neutral` follows it.** The kit has five steps of text (`text-strong`, `text`, `text-subtle`, `text-muted`, `text-disabled`), and the Guide says what each is for: strong for headings, titles and the value that is the point; `text` for body copy and every control at rest; muted for hints and captions; hover goes one step up; the accent is for the main action, the selected and the focus. The tone `neutral` broke it: its text was `text-strong` at rest, so a `ghost` / `text` / `secondary` button with `tone="neutral"` was white against the grey `#bfbfbf` of the page text and of a plain `secondary` button. Now `--tao-tone-text` of `neutral` is `text` and `--tao-tone-text-hover` is `text-strong` (a neutral tag and a pressed neutral toggle read in the body colour too). `TaoScrollTop` `ghost` / `text` went from strong to `text` at rest for the same reason. The Guide has the ladder table and a do / don't (`#patterns`), `SKILL.md` and `patterns.md` carry it, and `tests/textContract.test.ts` fails when a component sets `text-strong` on a control at rest without being listed.

- **`TaoPresetInput`: a field with presets.** A compact input, a block of two arrows and a narrow pop-up, as the font size or the zoom of an editor. The input and the arrows are one piece (the same fill, the frame only while the field is edited); the pop-up is not a dropdown, it is centred under the input and the focus stays in the input. The arrows walk `options` in their order («up» is the next one, «down» the previous one) and hold at the ends, or go round with `loop`. The option with `default: true` is what an empty field means («Auto»): the pop-up shows it first, the arrows reach it after the last one. A whole number typed by hand is a value too (`custom`, between `min` and `max`; off: only the presets), and the arrows then go to the nearest preset. Keys: ↑ ↓ step, Home End go to the ends (while no text is being typed), Enter applies, Esc throws the text away; **Tab applies the text and goes on**: the pop-up is not a stop. The input is `role="combobox"` with `aria-controls` and `aria-activedescendant` (the picked option), the arrows are not tab stops and are named by the locale. `aria-label`, `name` and listeners reach the input, `class` and `style` the wrapper; the width of the input is `--tao-preset-input-width`. The logic (`presetLine`, `stepPreset`, `parsePreset`) is in `src/presetInput.ts` with its own tests. It began as a demo of the showcase built from `TaoInput` and a hand-made pop-up.
- **`TaoThemeToggle` `system`: the third state, a monitor.** With `system` the click goes system → light → dark → system, and the page follows the operating system (`prefers-color-scheme`) while «system» is picked, live. The icon is the state the toggle is in (a monitor, a sun, a moon), the `aria-label` says where the click leads (new `toSystemLabel`, the locale has it). `v-model` takes and gives `'system'` too; the page itself always gets `dark` or `light` in `data-tao-mode`, and `data-tao-mode-choice="system"` marks that it is the system's, so a remounted toggle shows the monitor again. The `#icon` slot gets `choice` and `next` is a choice now. Without `system` nothing changes. New: the `tao-monitor` icon (43 built in), `resolveTaoMode()`, `systemTaoMode()` and the `TaoModeChoice` type, for an app that applies the mode itself (`:apply="false"`).
- **`TaoCombobox` shows the whole list when it opens over a picked value.** The field holds the picked label, and the list was filtered by it, so a list of sizes opened on «Auto» showed only «Auto». Now the list is filtered only after the user types; opening, the arrows and the picked value show every option.
- **`TaoThemeToggle` is neutral by default, and has `tone`.** The toggle is a ghost button, and a ghost button without a tone is accent-coloured, so the theme switch was the one amber thing in a toolbar of quiet `ghost` + `neutral` tools, against the guide (the accent is for the one main action, the selected item and the focus). It is `neutral` now; `tone` goes to the button as for `TaoButton`, `tone="accent"` gives the old look.
- **`TaoThemeToggle` with the `#icon` slot: the glyph is centred.** The button kept the padding of a text button and the content sat on a text line, so the glyph stood 1.5px too high; the square is a square now.

## 5.31.0

Nothing to migrate: `overflow` is off by default, and a toolbar without it works as before.

- **`TaoToolbar` `overflow`: one row, the rest under «⋮».** The bar no longer wraps onto a second line (the height jumped, a phone lost half the screen). The `TaoToolbarGroup`s that do not fit go, the last one first, each with the separator before it, under a «⋮» button that shows only when something is hidden and opens them in a panel. They are the same elements as in the bar, teleported, not copies: a toggle keeps its state, `pressed`, `disabled`, `title`, `shortcut` and events work as they did. A group with `pinned` never goes; loose items (a `TaoSegmented`, a lone button) stay too. Only whole groups go, and only in a horizontal bar. The bar is measured before the first paint and follows the width (`ResizeObserver`), the set of groups and the size; the width of a group that went is remembered from when it was in the row. Without `window` (SSR) every group is drawn as it is.
- **Keys and focus.** `role="toolbar"` stays; the arrows, Home and End walk the visible buttons and «⋮» (a folded group is not a stop). «⋮» is a button with `aria-label` (`overflowLabel`, the locale says «More» / «Ещё»), `aria-haspopup="dialog"` and `aria-expanded`; Enter / Space opens the panel, the first button gets the focus, Escape closes it and gives the focus back to «⋮». A press outside closes it, except on a panel above it (a list opened by a button inside it) and on what carries `data-tao-keep-open`. If the button that had the focus goes under «⋮» as the bar narrows, the focus moves to «⋮» instead of vanishing.
- **A list that hangs from a button of a folded group.** The button is the same element in the bar and in the panel, so what hangs from it (`TaoPopover`, your own list) is anchored to what the person sees. For opening a list from the keyboard shortcut of a button that is folded, `toolbar.reveal(el)` (through a ref) opens the panel if needed and returns the same element.
- **`TaoToolbar` with `overflow` fills the width it is given** (`width: 100%`), not `fit-content`: that width is what it measures, and a bar that shrank with the folded groups would never unfold them.

## 5.30.2

Nothing to migrate; the text of the skill only.

- **The skill's `patterns.md`: small is for dense rows and power-user tools only.** A toolbar, an editor panel, a filter or settings bar, a popover or a menu stay medium: an editor people use all day, above all a client one, otherwise grows small buttons that are hard to hit. The toolbar pattern says to leave the size medium.

## 5.30.1

Nothing to migrate.

- **`TaoSegmented` keeps the width of its options in a flex row.** Beside a field that takes the room (`TaoSelect` is 100% wide) it was squeezed until its last option was cut off ("Li" instead of "List"). It no longer shrinks; a `block` one still fills its container.
- **The skill's `patterns.md`: every "Don't" example says what is wrong in it.**

## 5.30.0

Nothing to migrate. One thing may look different: controls inside a `TaoPopover` that hangs in a small, large or compact context now follow it (before they were always medium).

- **`TaoButton`: a slot that draws nothing is no text.** A button with an icon and `<template v-if="wide">View</template>` or an `<i v-if="dot" />` inside kept the content wrapper and its gap although nothing was drawn, so the icon sat off-centre and the button was not the icon-only square. The button now asks what the slot draws at render time (`src/slots.ts`, `slotHasContent`), not whether the slot exists.
- **The same trap in the other components, closed.** `$slots.x` is true for a slot that draws nothing: a wrapper component forwarding a slot it was not given, an inner `v-if` that is false. The wrapper of the slot stayed, with its padding, border or gap: an empty card body, an empty addon, a label gap beside a switch. Now `TaoAlert` (body), `TaoCard` (header, title, sub, body, footer, corner, media), `TaoDivider`, `TaoDonut`, `TaoDrawer` and `TaoModal` (footer), `TaoEmpty` (icon, text, action), `TaoFieldset` (legend), `TaoInput` (prefix, suffix), `TaoInputGroup` (before, after), `TaoListItem`, `TaoMarquee`, `TaoNav` (action, footer), `TaoProgress`, `TaoSegmentedOption`, `TaoSpoiler` (title), `TaoSwitch` (label) and `TaoTag` (prefix) ask what the slot draws (`slotHas`). Slots with props (`TaoTree`, `TaoTimeline`, `TaoTabs` label, `TaoCopy`) are left as they were: the check calls a slot without props.
- **`TaoButton` `shortcut`: not printed on an icon-only button.** The key is shown at the end of a button with text, but an icon-only button is a square of the control height, and the key piled over the icon and over its neighbours (an editor toolbar). Now the key goes to the native tooltip, `Bold (Ctrl+B)` (the `aria-label`, then the key), and stays in `aria-keyshortcuts`; a `title` of your own wins. A button with text is as before. Nobody has to move the key into a tooltip by hand any more.
- **`TaoPopover`: the panel carries the size and the density of where it hangs from.** The skill and the rules say a floating panel does, but only the lists of `TaoSelect` and `TaoCombobox` did: the content of a popover is in `body`, where the context is not inherited, so a small control row inside it grew back to medium. The panel now gets `tao-size-*` and `tao-density-*` when it opens, as the select list does.
- **The skill gets `references/patterns.md`: what to use when, and why.** The accent budget (one filled accent button per region, quiet tools are `ghost` + `tone="neutral"`, status is `tone`), a section on choosing a size (what small / medium / large are for and what they cost, 26 / 36 / 44px, density on top of the size, phone = `tao-density-auto`, how to find where a small control came from), and a do and a don't for a toolbar, the footer of a form, controls side by side (one size from the container, never a size on some of them) and a destructive action. It is generated by `npm run skill` from the same data that draws the Guide page of the showcase (`#patterns`); `SKILL.md` points at it.

The showcase is now three books under one shell (Components, Demos, Guide), with the page menu as a bottom sheet and a sticky compact bar on a phone.

## 5.29.1

- **`TaoSlider` `editable`: the field is opaque.** Its background was the translucent input colour, so over the filled part of the bar the accent showed through it and the typed number was unreadable. The field now lies on the page background first.

## 5.29.0

Nothing to migrate; the defaults do not change (`editable` is off, a slider that does not pass it works as before).

- **`TaoSlider` / `TaoRangeSlider`: `editable`, the value can be typed.** The number over the bar (`show-value`) was only a label, and there was no way to say "exactly 37": the thumb had to be dragged to it. With `editable` a **right click** or a **double click** on the bar (a long press on a touch screen), or **Enter / F2** on a thumb (so the keyboard reaches it too), opens a field over the middle of the bar, where the value text stands. Enter or leaving the field sets the value, snapped to the step (or to the nearest mark with `discrete`) and kept in `min`…`max`, exactly like a value picked with the pointer; a comma works as the decimal point; Esc drops the edit; text that is not a decimal number changes nothing. On a range it edits the thumb nearest to the click (the focused one for the keyboard), and `minGap` still holds. `change` fires once, when the value is set. The field is named by `editLabel`, else by `ariaLabel`, else by the locale (`slider.editLabel`, "Value" / "Значение"); the thumbs advertise `aria-keyshortcuts="Enter F2"`. Off by default, so a slider that is not `editable` keeps its browser context menu.
## 5.28.0

Nothing to migrate; the defaults do not change.

- **New `TaoStretchedLink`: a whole card, row or tile as one link.** A `TaoLink` (so `NuxtLink` / `RouterLink` / `<a>` by itself, with `to`, `newTab`, `private`, `exactPath`) whose layer is stretched over the container: a click anywhere on it goes to the link, and the buttons inside it still work on their own. The link stays where it is in the markup (the title, a "View" button); the container gets `tao-stretched` (it is `position: relative`), and a control that must stay clickable by itself gets `tao-stretched-raise`. The keyboard sees one link and its focus ring goes round the whole container, inside its edge, with the corners from `--tao-stretched-radius` (the radius of a panel by default). The class `tao-stretched-link` works on any `<a>`. It is a context like `tao-frames-soft`: `styles/contexts/stretch.css`, no JavaScript. **One rule, written in the showcase, the README and the stylesheet:** never put `filter`, `transform`, `perspective`, `will-change: transform` or `contain` on the link (on `:hover` too). Such a property makes the link the containing block of its own layer, the layer shrinks to the link, the pointer is no longer over it, the property goes, the layer stretches back, and so on every frame: the cursor flickers between a hand and a text bar. Light the link with a colour, or put the effect on an inner element (on the container it is fine); a test keeps the context itself clear of these properties. Why a component and not a recipe: every site that makes a card clickable meets this, and it is found only by the flicker.
- **confirm(): a button no longer jumps a pixel under the pointer.** A confirm with a message (the danger one, for example) stood on a fraction of a pixel: its text had fractional line heights (16 x 1.3, 14 x 1.45), so the panel was 143.09px high, and centred in a box where the room left over was odd it started at 351.45. A button on such a fraction is drawn one way at first and snapped to whole pixels when it is repainted under the pointer, so it moved down a little. The line heights are whole pixels at the default sizes now (16 x 1.25 = 20, 14 x 1.5 = 21), and a centred panel with an odd room left over gets a margin of 1px, which moves it by half a pixel onto a whole one (`centringNudge`, when the confirm opens and when the window is resized). No layer is forced (a `will-change` made the text blurry). `TaoModal` had the same fault in a window of the other parity (its panel started at 314.5, and with it the close button, the text and the footer button): its title was `line-height: normal`, which is fractional, and the panel was not nudged. The title is as high as the close button now (24px at the default size) and a centred `TaoModal` is nudged the same way. The nudge is one composable, `useWholePixelPanel` (it also looks again when the content changes size), used by both. `showcase/lab/subpixel.html` measures this for `confirm()`, `TaoModal`, `TaoDrawer`, `toast()` and `TaoTooltip`.
- **Floating panels start on whole pixels.** The position of every panel placed by `useFloating` (Tooltip, Popover, Select, Combobox, Date, DropdownMenu, the tip of TaoCopy…) came from the anchor and the size of the panel and was often a fraction: a tooltip centred over a button with an odd width stood on a half pixel. Text and buttons on a fraction are drawn one way at first and snapped to whole pixels when they are repainted, so a button in a popover could jump when the pointer came to it. `computePosition` rounds `top` and `left` (after the flip and the clamp into the window), and the arrow is worked out from the rounded position, so it still points at the middle of the anchor. `showcase/lab/subpixel.html` now also measures `TaoPopover` and `TaoSelect`.
- **TaoCounter: a digit no longer jumps a pixel when it starts to roll.** A digit became a layer of its own only when its `transform` and `blur` began, and the text was then redrawn on whole pixels: in Chromium it moved a little to the left at the start (and back at the end). The digit is a layer from the start now (`will-change`), so it is drawn the same before, during and after. The geometry was never off: the cells and the centre of the text stay put to a hundredth of a pixel.

## 5.27.0

Nothing to migrate; the defaults do not change (a plain string in a locale works as before).

- **Plural forms in locale texts.** A text that depends on a number may now be written as forms, `{ one, few, many, other }` (as `Intl.PluralRules` names the categories; only `other` is required, a missing form falls back to it), chosen by the number (`count`, or `n`) and the `code` of the locale. A plain string is still accepted and is the same for every number, so nobody has to write forms. The built-in texts that count have them now, in English and Russian: the badge of `TaoAvatar` ("1 notification", "2 уведомления", "5 уведомлений") and the jump buttons of `TaoPagination`. `formatTaoText(text, values, code?)` is exported for your own texts; the types are `TaoText` and `TaoPluralForms`.
- **`detectTaoLanguage(supported, { fallback?, requested? })`.** The one of your languages that the user would like most, by `navigator.languages` (a server passes `requested`, e.g. `parseAcceptLanguage(header)`); `ru-RU` fits `ru`, `en` is answered by `en-GB`. It only answers: it does not set the language and does not remember it (`saved ?? detectTaoLanguage(['en', 'ru'])`). `matchTaoLanguage(requested, supported, fallback?)` is the pure core.
- **TaoColorInput: an empty value says it is not set.** For an optional colour (`''`) the field showed an empty frame. Now it says "Not set" (`placeholder`, the text comes from the locale: `colorPicker.placeholder`, "Не задан" in Russian) in a muted voice, the swatch is crossed out, and a screen reader hears it ("Choose color: Not set"). With `clearable` the colour can be taken away again: a Clear row at the foot of the palette, after a divider, as in Select (`colorPicker.clearText` in the locale; it is always there and disabled while there is nothing to clear, so nobody has to guess it exists) and Delete / Backspace on the field; it gives `''`.
- **Scrollbars: four hooks and a class.** `--tao-scrollbar-size` (5px by default, so the thin scrollbar stays; the rule used `max-width`, which could never make it thicker than the browser's own 15px, now it is `width`), `--tao-scrollbar-thumb` (the accent), `--tao-scrollbar-track` (transparent) and `--tao-scrollbar-width` (`thin` | `auto` | `none`, for Firefox). Set them on `:root`, on a block or on a component; the colours are read where the scroll is, so a block with another theme gets its own accent. The class `tao-native-scrollbars` on `<html>`, or on any block, gives the browser's own scrollbars back for everything inside it. Firefox, which has no `::-webkit-scrollbar`, now gets the same look through `scrollbar-width` and `scrollbar-color` (only there: Chrome 121+ understands them too and would ignore the rules above): a thin scrollbar with the accent thumb, like the other browsers; `tao-native-scrollbars` or `--tao-scrollbar-width: auto` turns it off. The showcase has a panel with sliders under «Layers and theming».
- **Showcase: the keys of the locale are browsable.** The sections of the locale are buttons: one shows its keys in English and Russian, built from the real `localeEn` / `localeRu`, so the page cannot differ from the library; a template to translate can be copied. New there: plural forms and the language of the user, both live. `showcase/lab/rtl.html` is a probe of the same components left to right and right to left (the status of RTL is in the README of the lab).

## 5.26.0

Nothing to migrate; the defaults do not change.

- **TaoLoader `variant="diamonds"`.** Four diamonds on two axes, which flow into each other. On each axis a hollow diamond crosses to a filled one; the filled one shrinks as it comes (from half way) and is gone when the hollow one lands; the new filled one grows at the place the hollow one left, before the old one is quite gone; then it goes back the other way. The second axis is the same pair turned a quarter and a fifth of the cycle behind, so the two pass the middle one after the other. Sized, toned and named like the other looks (`size`, `tone`, `color`, `label`), hidden from a screen reader as a picture; under reduced motion it stands and breathes. `showcase/lab/` is a bench for working on such an animation frame by frame (not part of the package).
- **Showcase: a «Localization» section.** The same components with no text given by hand in three columns, each with a language of its own (`provideTaoLocale`): English, Russian and a third made of a few German keys on top of English (its `code` `de-DE` makes the date read the German way). How to set it (`app.use`, `setTaoLocale`, a subtree), your own language, a prop that wins, what is translated (every section of the locale with its count of texts), and what to know (`<html lang>`, no plural forms).

## 5.25.0

Nothing to migrate; the defaults do not change.

- **TaoTour: a guided tour of the page.** The page goes dim, the target stays lit (the lit window glides from one target to the next), a card with an arrow says what it is, with Back / Next / Skip, the dots and "Step 2 of 5". A step is `{ id, target?, title?, text?, placement? }`: `target` is a selector, an element or a function; without it (or when it is not on the page) the step is a card in the middle. `interactive` lets the user press the target itself while the rest of the page stays shut. Escape skips, the arrows move on, Tab stays in the card, focus goes back where it was. The step scrolls its target into view (calmly under reduced motion). TaoTour only draws: the state is yours, or `useTour` from TaoUX `tour`, which jumps over steps whose target is gone and remembers that the tour was seen. `useFloating` takes `fixed: true` for a panel inside a layer that is itself fixed. It renders on the server without touching `window` (the lit window is drawn on the client).
## 5.24.0

Nothing to migrate; the defaults do not change.

- **TaoThemeToggle: the light / dark switch as one icon button.** Until now the kit had no switch of its own, only text in the showcase. The icon is the theme a click leads to (a sun while the page is dark, a moon while it is light), the `aria-label` says the same in words (`toLightLabel` / `toDarkLabel`, in both locales). By default it reads `data-tao-mode` of `<html>`, flips it on a click and follows it when somebody else changes it; a palette keeps its name, the old `data-tao-theme="dark"` spelling follows the mode. For your own storage: `v-model` with `:apply="false"`. New icons `tao-sun` and `tao-moon`; `readTaoMode(el)` and `applyTaoMode(el, mode)` are exported. The `#icon` slot (`{ mode, next }`) puts your own glyph in the button, which stays a square with its label. The mode control of the showcase bar is this button now.

## 5.23.2

Nothing to migrate; the defaults do not change.

- **TaoCopy: the arrow of the tip points at the button at the edge of the window.** When the tip was pushed in from the viewport edge, its arrow stayed in the middle of the tip and no longer pointed at the trigger. It now takes its place from where the trigger falls on the tip (kept off the rounded corners), and it moves to the top edge when the tip flips below the button.

## 5.23.1

Nothing to migrate; the defaults do not change.

- **The mark in the README now reads on any background.** npm has its own dark / light switch that does not follow `prefers-color-scheme`, so the `<picture>` of 5.23.0 handed a dark-on-dark mark to a dark npm page and the logo vanished. `showcase/public/logo/logo-mark.svg` is a neutral one: a white T and a yellow arrow with a thin dark outline, which reads on light, on dark and on any colour; the READMEs use it with a plain `<img>`. `logo-mark-dark.svg` and `logo-mark-light.svg` stay for the showcase, where the theme is ours.

## 5.23.0

Nothing to migrate; the defaults do not change.

- **`TaoPinCode` `bordered=false` has no frame in any state.** In 5.22.0 the plain cells still showed a frame for focus and result; now the focus, an error and a success are told by the fill and the digit only (an accent / danger / success tint), and the cells do not jump.
- **Showcase: a section "Layers & theming".** The real files of the kit (`primitives` → `semantic` → `themes` → `contexts` → `base`) in the order `src/styles/index.css` imports them, each with a note whether it is yours to touch (only the themes are), taken from the source by `?raw`, so the page cannot drift from the library. Below it an own theme by hand: an accent, a page and the corners make a `[data-tao-theme]` file, a preview wears it, and the ratios are rated with the promises of the palettes. `tests/showcase.layers.test.ts` keeps the order equal to `index.css` and the theme's roles real.
- **`TaoSlider` / `TaoRangeSlider` `zones`: the scale in colour.** `:zones="[{ to: 40, tone: 'info', dot: true }, { to: 70, tone: 'warning', dot: true }, { to: 100, tone: 'danger' }]"`. Each zone runs to its `to` (the first from `min`, the last to `max`), so there are no gaps and no overlaps. `tone` is a colour role of the theme, `color` any CSS colour (it wins; its contrast is yours to keep), `dot` puts a bead where the zone ends, `reveal` keeps the zone clear until the value gets there (the field looks plain and is painted as it fills; its dot shows once the fill has reached it). The bar shows the zones dimmed, the filled part in full colour, and the thumb wears the colour of the zone it stands in. Works with `vertical`, `flat`, `variant="thin"` and a range; marks and `discrete` are untouched. Colour is not a message: say the state in words too. The logic is `normalizeZones` / `zoneAt` / `zoneGradient` in `src/slider.ts`; the types `TaoSliderZone` and `TaoSliderZoneTone` are exported.
- **`TaoDrawer` (bottom sheet): a graze no longer closes it.** The sheet closed at 30% of its height, or on any flick faster than 0.5 px/ms that went 24 px: a finger that touched it by accident was enough. Now it closes when pulled half of its height, or flung hard (1.2 px/ms or more, a light swipe is not enough: 0.8 px/ms closed it before) after a path of at least 15% of the height; otherwise it comes back. `swipeThreshold` (0.05–1, default `0.5`) sets the share for your sheet. The backdrop already lets go as the sheet is pulled, so the finger sees what releasing now will do.
- **The mark of the project, and a settings bar in the showcase.** `showcase/public/logo/`: `logo-mark-dark.svg` (a white T for a dark background), `logo-mark-light.svg` (a dark T for a light one) and `favicon.svg` (a tile, with no road markings: at 16px they are only noise), drawn as paths from the design layout; the yellow is `--tao-orange-300`. The READMEs show it with `<picture>`, so GitHub picks the file by its own theme. The showcase wears it in its title as the T of the word, «Tao UI» with the arrow over the `ao` (it follows the mode; the heading keeps its name for a screen reader) and as a favicon. The options of the header moved into a one-line bar that sticks to the top while you scroll, made of the kit itself: language, palette and mode are inline (`TaoSegmented`, `TaoSelect`), the rare ones, density and frames, sit in a «View» popover (`TaoPopover`) whose button shows a dot while one of them is off the default. The brand, with the version tag of the build, shows in the bar once it has stuck, the section list sits below it, and on a phone it scrolls away with the page.
- **A third context: frames (`.tao-frames-soft`).** A light look for the whole app, or for one panel, with one class. `tao-frames-soft` on `<html>` or a container lets the decorative frames of `TaoAlert`, `TaoSpoiler`, `TaoTable`, `TaoList`, `TaoToolbar` and `TaoMenubar` go clear, and the panel is held by its fill: an alert gets a little more tint, a table sits on the raised fill. Nothing moves, the 1px border stays in the box, only unseen. `tao-frames-framed` puts the frames back inside a soft area. `TaoAlert`, `TaoSpoiler`, `TaoTable`, `TaoToolbar` and `TaoMenubar` get `bordered` (not set: follows the context; `true` / `false`: for this panel); `TaoList` keeps its own `bordered`. Not touched on purpose: the frame of a field, the focus ring, and the lines between rows: they say where a control is and what belongs together, and WCAG 1.4.11 asks 3:1 of them. The tokens are `--tao-frame-alpha`, `--tao-frame-tint` and `--tao-frame-fill` (`src/styles/contexts/frames.css`, a new file in the layer order). The showcase has a switch «Frames» in the header. Fields have `variant="filled"` already; its fill is gentle (about 1.1:1 with the page), so use it knowing that.
- **`TaoScrollTop`: the caption has an outline.** The hover caption (`label`, and the text mode) over a page of text kept only a soft halo, and the words under it still showed through. It now has a crisp outline in the page colour as well (`-webkit-text-stroke` with `paint-order: stroke fill`, so only the outer half of the stroke shows and the letters stay whole): the text under the caption is cut clear, in both themes, with no backing and no colour. Where `paint-order` is not supported for HTML text (before Chrome 123) the halo is all there is, as before; `@supports` keeps a stroke from eating the letters there.
- **`TaoStages`: the icons stand on the middle of the label, and the spinner turns about its own centre.** The icon box was a block span, so the svg sat on the text baseline and the box grew by the line gap under it (14 px became 17): every icon was 1.5 px above the middle of its label, and the `work` mark turned about the centre of that taller box and wobbled. The box is now exactly the svg. A test keeps the mark from becoming a block again.
- **`TaoCarousel`: the track keeps the browser's own cursor.** The `grab` / `grabbing` cursors are gone: system cursors differ much between browsers (Opera showed a big black arrow), and which cursor a carousel wants is the app's decision, set on `.tao-carousel__track`. The drag itself is unchanged. (`TaoSplit` keeps its resize cursors and `TaoColorPicker` its crosshair: there the cursor is part of the meaning.)
- **`TaoSlider` / `TaoRangeSlider` `bubble`: the value in a bubble at the thumb.** Off by default, so nothing that exists changes. `bubble`: it shows while the thumb is dragged, hovered or has the keyboard focus (a touch drag shows it above the finger); `bubble="always"`: it stays. The text is `format` of the value, or the `#bubble="{ value, zone }"` slot (an icon, a word). It wears the colour of the zone the thumb stands in (the accent without zones) with a label that reads on it: the `on-` role of the tone, black or white by contrast for a colour of your own, the browser picks for a colour the script cannot read. A screen reader already has `aria-valuetext`, so the bubble is `aria-hidden`. It sits above a horizontal bar and to the right of a vertical one: leave room for it.
- **`TaoLoader`: three looks, a voice, a colour role.** `variant`: `dots` (the four dots, still the default, same size and motion), `ring` (a turning arc) and `pulse` (ripples from a core). `tone` is a colour role of the theme (`color` stays and wins; `currentColor` takes the text around it), `size` is a number or `small` / `medium` / `large`, the sizes come from one number in CSS. It is a `role="status"` with a text for a screen reader (`label`, «Loading» / «Загрузка» from the locale), or `decorative` when the wait is said elsewhere. Under «reduce motion» nothing travels or turns: the picture breathes. `TaoButton loading` wears the same ring in its text colour and says `aria-busy` by itself. The showcase gets «Which wait to choose»: loader, skeleton or progress.
- **`TaoPinCode`: an error paints the digits red**, as a success always painted them green (`--tao-color-danger-text`).

## 5.22.0

Nothing to migrate; the defaults do not change.

- **`TaoPinCode` `bordered`.** `:bordered="false"` is a light style: the cells have a soft fill and no frame at rest. The frame is still in the box (the cells do not jump) and is only clear; focus, the active cell, an error and a result paint it, so a state is never left to a fill colour alone.
- **`TaoDrawer`: the pull of a sheet no longer selects the title.** While the sheet is in the hand the panel has `user-select: none`, and it is given back at the end.
- **`TaoDrawer`: a pointer that vanishes lets go.** The blur of the window, a tab that goes to the background, `pagehide` and a taken capture (`lostpointercapture`) end the pull as a cancel: the sheet settles back and does not close, and the next pull starts clean. The same guard `TaoCarousel` has had.

## 5.21.0

Nothing to migrate; the defaults do not change.

- **`TaoMarquee` `decorative`: a line that is only a picture.** For a marquee used as a design feature, in the background. A ghost: `aria-hidden` and `inert` (not a tab stop, nothing to select, no reaction to a cursor or a tap), `pointer-events: none`, and it runs round without a pause, like a looped GIF. Under «reduce motion» it stands still and is clipped, it does not wrap. Use it only for text nobody needs to read: the stop that WCAG 2.2.2 asks of moving content does not apply to pure decoration, and a screen reader will not see it.
- **`TaoMarquee` `roundPause`.** The rest at the start of every round can be turned off for any line (`:round-pause="false"`): the round is one line plus the gap and the loop has no seam. Not set, it follows `decorative` (no rest) and an ordinary line keeps its rest.

## 5.20.1

Nothing to migrate; the defaults do not change.

- **`TaoMarquee`: `pauseOnHover="false"` is a background line now.** The prop was there, but a line used as a design feature still stopped for a tap and could be selected while it ran. With `pauseOnHover` off a cursor or a finger passing by does not stop it, and the running text has `user-select: none`. Focus still stops it and a running line stays a tab stop, so the keyboard keeps its way to stop moving content (WCAG 2.2.2). The showcase has a background line.
- Showcase: the numbers promised by the palettes sit under the palette lab, with the other colour blocks of the section.

## 5.20.0

Nothing to migrate; the library does not change.

- **Showcase: a section "Contrast & keyboard".** What the README only promised can be tried now. A live look reads the colour roles of this very page from the computed styles and judges every pair with `contrastRatio()` and `apcaContrast()` (the numbers follow the palette and the mode in the header). A pair picker shows the two questions on one colour, with the well-known green `#2ea85c` where WCAG 2 and the eye disagree. A palette lab turns four stops into a whole theme with `applyTaoPalette()` on a preview (or on the page, and takes it off again) and rates the roles it made. A key map lists what the keys do in toolbars, menus, trees and lists, and the numbers the palettes are tested for. Every key line is one a test of the component or its code shows.
- The section is a frame (`showcase/components/DemoA11y.vue`); each block and its data live apart in `showcase/a11y/`, and `tests/showcase.a11y.test.ts` keeps the roles it reads real and its promises equal to the palette constants.

## 5.19.3

A fix; nothing to migrate.

- **`TaoCounter`: a fast run of increments no longer leaves empty and half-rolled slots.** A new value that came while the digits were still rolling cut the roll short and piled several digits in one slot. Now the wheels take the next value only when the last digit has landed: the parent already holds the sum of the increments, so the counter rolls once to the latest value, and again if more came during that roll. `aria-label` tells the real value at once. The gate is `createRollGate` in `src/counterRoll.ts`.

## 5.19.2

A polish; nothing to migrate.

- **`TaoCounter`: the digits roll in turn, not all at once.** All the digits that changed started at the same moment, and `+1337` looked like four wheels jerked together. Now the one on the right goes first and the others follow to the left, 55 ms apart, so they land one after another like an odometer. Only the digits that change take a turn: `1000 → 2000` does not wait for the three that stay. `--tao-counter-stagger` sets the step (`0` brings the old all-at-once back). With `prefers-reduced-motion` the digits change at once. The order is `src/counterRoll.ts`.

## 5.19.1

A fix; nothing to migrate.

- **`toast()` has no accent bar on the left.** The 5.17.2 bar kept away from the rounded corners, and that left a gap between it and the progress line in the lower left corner. The bar told nothing the icon, the tinted background and the progress line do not: it is gone, and `.tao-toast__accent` with it. The progress line keeps its distance from the corners (`--tao-toast-edge`).
- Showcase: the buttons in the header of the comments sheet use `icon` (a square of the control height), not an icon in the slot, so the icons sit in the middle.

## 5.19.0

Nothing to migrate.

- **`TaoDrawer` as a bottom sheet of your own.** A sheet (`side="bottom"`) is pulled down by its grip and header now (`swipeToClose`, on by default): it closes when pulled a third of its height or flung, comes back otherwise, and the backdrop lets go as it goes. The pull starts only from the grip and the header, never from a button or a field in it, so the content still scrolls. It needs `closable`, and if the parent keeps `v-model` open the sheet returns.
- **`show-close="false"` hides only the cross.** `closable="false"` still means that only the parent closes it (no cross, no backdrop, no Escape, no pull); `showClose` is just the cross, the rest keeps working: a sheet with no cross that is pulled down.
- **`#header="{ close }"` replaces the whole header** (a title with a counter, a filter, a cross of your own). Name the panel for a screen reader with `aria-label`. The showcase has the comments of a video built from this, with `#footer` as the line to type in.
- The pull-down is plain pointer events, no dependency on TaoUX; the maths is `src/sheetDrag.ts`.

## 5.18.0

One visible change on a phone: a tap no longer flashes.

- **No system flash on a tap.** Phone browsers paint a blue (or grey) square over a tapped link or button, and it differs by the shell and fights the theme. `styles.css` sets `-webkit-tap-highlight-color` from the new token `--tao-tap-highlight` (`transparent`) on `<html>`; the property is inherited, so every element gets it. A colour in the token brings a flash of your own back, anywhere in the tree. The kit gives a tap its own feedback instead of leaving it to the system; a row of `TaoList` has none yet, it is next.

## 5.17.2

A fix; nothing to migrate.

- **`toast()`: a loading toast turns into its result smoothly.** The tone changed at once when the work finished: the bar, the icon and the tinted background jumped from the accent to green or red. Now the colours follow in 0.3 s, the ring gives way to the result icon that comes in, and with `prefers-reduced-motion` nothing is animated.
- **`toast()`: the accent bar and the progress line are not cut by a large radius.** With `--tao-radius-panel` of 20px and more the curve of the corners cut both marks down to a hair. They keep away from the corners now by 60% of the radius (up to 24px) and have rounded ends, so they lie on the straight part with any radius. `--tao-toast-edge` sets the distance (`0` brings the flush look back). `TaoCard` `stripe` stays clipped by the corners: it is a decoration, the toast marks tell the tone and the time.

## 5.17.1

A fix; nothing to migrate.

- **`TaoTree` does not loop on a repeated id.** An id is unique in the whole tree. When `load(node)` answered with the same ids at every level (the showcase did: opening `vue` under `node_modules` handed back a `vue`), the node inside its own ancestor sent the walk round in a circle: `RangeError: Maximum call stack size exceeded`. A node whose id is already one of its ancestors is a leaf now. The showcase `load` gives path ids.
- Inside the repository: `docs/v5-plan.md` (the ideas journal of the 5.0 design) is removed; MIGRATION-5.md no longer points to it.

## 5.17.0

Nothing to migrate.

- **`TaoFileDrop` `reject` event.** A file that did not pass `accept` was dropped without a word: no `change`, no sign, and the user saw nothing happen. Now `reject` brings the refused files (`File[]`); they are still not in `v-model`, and in a mixed batch the good files go to `change` as before. Say why in your own words (the zone does not guess a message). The `accept` matching moved to `src/fileAccept.ts` with tests. Found by Next Up.

## 5.16.3

A fix; nothing to migrate.

- **`TaoDivider` follows the theme.** The solid and dashed line read the primitive `--tao-gray-300`, the one thing a component must not read, so a theme or a palette could not recolour it. It reads `--tao-color-text-muted` now (the same grey in the dark theme, a little darker in the light one), at the same 20% opacity.
- Inside the repository: `tests/component-styles.test.ts` holds that a component reads roles and not primitives, writes no colour of its own, and adds no spacing pixels beyond the recorded ones; the rules in `CONTRIBUTING.md` are regrouped (colour, then component rules).

## 5.16.2

A fix; nothing to migrate.

- **A light-theme field is the same surface as its neighbours.** `--tao-color-input-bg` is the sunken surface (`--tao-color-surface-sunken`) in the light theme now, as it already was in the dark one, so a field and the segmented track next to it, a switch or a tab bar come out of one role and not of two close greys. It was white in 5.16.0 and translucent white in 5.16.1, and it still stood off its neighbours. The disabled field takes a translucent grey tone, as in the dark theme, because `gray-50` is the field itself now. The text stays at 18:1. The framed fields keep their border.

## 5.16.1

A fix; nothing to migrate.

- **A field follows the panel under it in the light theme.** `--tao-color-input-bg` was pure white (`--tao-gray-0`) whatever it lay on, while in the dark theme it is a translucent tone that follows the surface. On a window or a drawer painted another colour (`--tao-surface-fill`, a darker panel, a tinted palette surface) the light `TaoInput`, `TaoSelect`, `TaoTextarea`, `TaoDate` and the other fields stood out white against components that take their colour from the surface scale. Now it is white at 65% opacity: on a plain page it is still white, on a tinted or darker panel it takes the panel's tone. The text stays at 19:1.

## 5.16.0

Nothing to migrate; the one visible change is the current `TaoNav` item, which is bolder now.

- **`TaoNav`: the current item is told apart by weight as well as colour.** It was the accent colour on its own tint, and that is thin for a person who does not tell colours apart (WCAG 1.4.1: do not rely on colour alone); in the light theme the text on the tint is also close to the 4.5:1 edge. The label is `font-weight: 600` now. `--tao-nav-active-weight` sets another weight (`400` brings the old look back). `indicator="line"` has its line as the second mark already and takes the same weight.

## 5.15.0

`TaoModal` and `TaoDrawer` put your `class`, `style` and other attributes on the dialog panel now, not on the overlay or the layer around it: if you styled the overlay through a class on the component, move that rule to `.tao-modal-overlay` / `.tao-drawer`.

- **`TaoModal` scrolls its content, not itself.** The whole dialog scrolled, so the `#footer` went away with the text and an app drew its own sticky bar (in the page colour, with a dark edge round the buttons). Now the content scrolls and the header and the footer stay, as they already did in `fullscreen`. `--tao-modal-bg` is the panel colour, for a bar of your own that sticks inside.
- **`TaoModal` and `TaoDrawer` take `surface`:** `grain` (a film grain over a solid fill) or `glass`, as on TaoCard, TaoBlock and TaoNav; with the attributes on the panel, `class="tao-surface-grain"` works too. `--tao-drawer-bg` is the drawer panel colour.
- **The grain goes when more contrast is asked** (`prefers-contrast: more`): the fill stays solid and clean.
- **`TaoNav` `badgeTone`:** `neutral` makes the counters grey with the accent on the current item only, so the eye is not pulled round the menu; a dot (`badge: true`) stays the accent. The docs say what is what: `.tao-nav` is the whole layout (navigation and page), `.tao-nav__panel` the navigation, `.tao-nav__content` the page.
- **`TaoDropdownMenu` `size` and `tabbable`:** `size` makes the button a square of that control height (a compact kebab in a list row); `:tabbable="false"` takes it out of the Tab order when the row has its own menu key.
- Showcase: a grain modal with a long text, a compact kebab, neutral counters in the TaoNav demo.

## 5.14.0

Nothing to migrate.

- **`TaoList` `roving`.** One Tab stop for the whole list: the arrows move between the rows, Home / End to the first and the last, disabled rows are skipped, and Tab comes back to the row it left (the selected one the first time). The stop of a row is its button (`clickable`) or the row itself, with the focus ring of a clickable row. Rows added or removed are followed; a key pressed in a row's own control (an input, a menu) stays with it. An app no longer writes its own roving tabindex for a list of records.
- **`TaoListItem` focus ring round the whole row.** On a `clickable` row the ring was drawn on its button, inside the row's padding, so it stood off the edges while the highlight ran the full width. It goes round the row now (`:has()`; older browsers keep the ring on the button).
- Showcase: the «People» list is roving.

## 5.13.0

Nothing to migrate.

- **Hidden inputs no longer stretch the page.** `TaoSwitch`, `TaoCheckbox`, `TaoRadio`, `TaoFileDrop` and `TaoPinCode` keep a visually hidden input (or a status) that is `position: absolute`, and their root was not positioned: the hidden element stood against the page, not the field, so a scrolling container did not clip it and the document grew (a long form in a `overflow: auto` block scrolled the whole page). Each root is `position: relative` now.
- **`TaoNav` `#footer`:** a small line under the items in the rail and the side panel (the version, «About», a link); the bar has no room for it and does not show it.
- Showcase: the TaoNav demo has a footer.

## 5.12.0

Nothing to migrate.

- **`TaoTextarea` `maxHeight`.** The field grew with its text up to 500px, written into the component. Now `maxHeight` sets it: a number is px, a string any CSS length (`50vh`, `20rem`), `none` — no limit; 500 stays the default. Dragging the corner stops there too. A framed field (`variant="outline"`) no longer scrolls by 2px: the height counts its border.

## 5.11.1

A fix; nothing to migrate.

- **Secondary text reads in the dark theme.** `--tao-color-text-muted` (labels, hints, legends, the names in TaoNav and the charts) was `#666`: 3.2:1 on the page and 2.9:1 on a card, below the 4.5:1 of normal text, in every dark palette. It was the grey of the neutral fill too, where a white label needs it dark. The two are apart now: the new `--tao-color-neutral` keeps `#666` for `tone="neutral"` (its white label stays 5.7:1), and muted text is `#8a8a8a` (`--tao-gray-350`): 5.3:1 on the page and 4.8:1 on a card. The light theme was fine (5.7:1) and does not change. The carousel dots and the knob of a switch that is off take the muted grey too and are a little lighter. A test now holds muted text at 4.5:1 on the page and on a card in both themes.
- **`TaoHeatmap` stripes, even.** The hatched levels were one gradient over the whole cell with 1.5px lines, and the browser drew them thicker and thinner by turns. Now a 6px tile repeats, so every stripe is the same: about 1px, 4px apart, at 135°, and lighter (45% of the tone), so they do not ripple.
- Showcase: the «Orders by time» caption stands off the map.

## 5.11.0

Nothing to migrate.

- **`TaoButton` `shortcut`:** `shortcut="N"` shows the key at the end of the button, in a small chip of the button's own text colour, so it fits any variant and tone; in a wide button it goes to the far edge. It is given as `aria-keyshortcuts` and the chip itself is not read twice. It only shows the key: listening to it is the app's job.
- **`TaoNav` labels fit the rail.** An item with the icon over its label (the rail, the bar) kept 12px on each side, so the rail left 47px for a label and «Settings» or «Calendar» in Russian were cut. Now it keeps 4px, and the label has about 63px. The side panel is unchanged.
- **`TaoNav` widths are public:** `--tao-nav-rail-width` (80px), `--tao-nav-drawer-width` (240px) and `--tao-nav-action-radius`, set on `:root` or any wrapper, for an app whose labels are longer still.
- **`TaoNav` action in the side panel:** the button keeps its own corners, like the items under it, instead of a pill (`--tao-nav-action-radius: var(--tao-radius-full)` brings the pill back), and stands off the top edge. A `shortcut` on it shows in the side panel and hides with the label when the button is round.
- **`TaoNav` side panel, lighter.** Its rows were 48px, the finger size of the bar, with 4px around the panel. With a mouse they are now a little taller than a control (40px at the medium size, and they follow the size and the density), and the panel keeps 12px from its edges, so the action and the items stand off them like a list in a card. On a touch screen (`pointer: coarse`) the rows stay 48px. The bar and the rail do not change.
- **`TaoNav` `surface`:** `flat` (the default), `glass` or `grain`, as on TaoCard. `glass` lets the page show blurred through the bar while it scrolls under it, the floating pill included; where blur is not supported or less transparency is asked, the panel is solid.
- Showcase: buttons with a shortcut; the TaoNav action shows `N` and switches the surface, with something bright under the bar.

## 5.10.0

Nothing to migrate.

- **`variant` on the text fields:** `TaoInput`, `TaoInputNumber` and `TaoCombobox` take `outline` (the frame, the default), `filled` (a fill only) and `plain` (no frame, no fill, no inset), the names `TaoTextarea` already uses. On a plain `TaoInputNumber` the ± buttons lose their lines too. A `plain` field reads as text, for an item of a list being edited: the caret shows the focus, and an error is a red line under the text, so the text does not move. The height is the same in all three. `filled` takes a fill of the text colour, so it shows on a page, a card or glass alike.
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

A foundation release: shared mechanisms instead of per-component copies, and a clean API. Everything deprecated since 2.0 is removed, so read [MIGRATION-5.md](MIGRATION-5.md) first.

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
