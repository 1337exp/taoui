# TaoUI components: props, events, slots

Generated from the showcase prop tables by `npm run skill`; do not edit by hand.
A default "inherited" means the value comes from a context class on an ancestor (size, density).

## TaoBlock

Showcase section: `#block`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `padding` | `number \| string \| (…)[]` | 16 | Inner padding. A number is px, a string is any CSS length. An array works like CSS padding (1–4 values) |
| `radius` | `number \| string \| (…)[]` | 8 | Corner radius. A number is px, a string is CSS: all corners. An array or a string of 1 to 4 lengths gives the corners one by one, in the order of CSS border-radius: [0, 0, 12, 12] is a square top and a rounded bottom |
| `square` | `string \| string[]` | — | Sharp corners with the radius kept as it is (the token of the theme, radius, the --tao-radius of your class): a side (top, bottom, left, right), a corner (top-left, top-right, bottom-right, bottom-left), several as an array or a string with spaces. Wins over radius, leaves the other corners alone |
| `shadow` | `boolean` | true | Panel shadow |
| `hover` | `boolean` | false | Stronger shadow on hover, pointer cursor |
| `surface` | `'flat' \| 'grain' \| 'glass'` | 'flat' | What the block is made of: fill / grain / glass. See “Surfaces” |
| `stripe` | `'top' \| 'left' \| 'bottom'` | — | A coloured stripe on one side; the corners clip it (over a picture in #media too) |
| `stripeTone` | `tone \| 'gradient'` | 'accent' | The stripe colour: accent, success / danger / warning / info / neutral, or the palette gradient. Say a status in the text as well |

**Slots, events, notes.** default — the block content.

## TaoButton

Showcase section: `#button`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `type` | `'button' \| 'submit' \| 'reset'` | 'button' | The native button type |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'text'` | 'primary' | Shape. The colour is tone |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'danger' \| 'warning' \| 'info'` | 'accent' | The colour, on any variant. accent is the theme accent. neutral keeps the text strong and only the hover wash takes the theme colour: the quiet action next to a primary one |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size. Without it — the size of the ancestors (the tao-size-* class or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `loading` | `boolean` | false | A spinner, the click is swallowed |
| `block` | `boolean` | false | 100% width |
| `minWidth` | `number \| string` | — | Minimum width (number = px); the --tao-button-min-width variable |
| `icon` | `string` | '' | An icon before the text: a name for TaoIcon (tao-plus, your own or a font one). Without text and slot the button is a square of the control height and needs aria-label |
| `iconEnd` | `string` | '' | An icon after the text |
| `v-model:pressed` | `boolean` | — | A toggle button (Bold, a filter): aria-pressed and the tone tint while pressed. Without it the button is an ordinary one |
| `shortcut` | `string` | — | The key that does the same (N, Ctrl+K): shown at the end of the button, given as aria-keyshortcuts. On an icon-only button it is not printed (no room in the square): it goes to the tooltip, "Label (key)", and to aria-keyshortcuts; your own title wins. It only shows the key; listening to it is the app's job |

**Slots, events, notes.** default — the button caption.

## .tao-prose / .tao-heading-*

Showcase section: `#typography`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `--tao-text-base` | `length` | 16px | The text size and h6; the scale is counted from it |
| `--tao-text-ratio` | `number` | 1.25 | The step of the scale: each level up is multiplied by it (1.2 calmer, 1.333 bolder). Set it on any element and the scale under it follows |
| `--tao-heading-1…6` | `length` | 49 / 39 / 31 / 25 / 20 / 16 | The steps, ready for your own rules; h1 and h2 in .tao-prose shrink on a narrow screen (not below h3 / h4) |
| `--tao-line-height-body / -heading` | `number` | 1.6 / 1.25 | Line height of text and headings |
| `--tao-font-family-mono` | `font` | ui-monospace… | The code font in .tao-prose |

**Slots, events, notes.** .tao-prose on a wrapper: headings, paragraphs, lists, quotes, code, hr, links (the theme link colour), images; spacing by proximity. Every rule inside is :where(), your CSS wins. .tao-heading-1…6 — the look of a level on any tag (h2 class="tao-heading-5").

## Classes and tokens

Showcase section: `#surface`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `.tao-surface-grain` | `class` | — | Static film grain. Any element |
| `.tao-surface-glass` | `class` | — | A translucent fill + background blur. Without blur support, or with prefers-reduced-transparency, it is solid |
| `--tao-surface-grain-image / -size` | `image / length` | SVG / 160px | Your own grain texture |
| `--tao-glass-fill / -border / -blur` | `color / color / length` | 55% / white 8% / 16px | Glass |

**Slots, events, notes.** A surface belongs to a single element: nested panels do not inherit it. Toast and confirm are glass by default: toast.defaults({ surface: 'flat' }) / confirm.defaults({ surface: 'flat' }) turn it off.

## TaoCard

Showcase section: `#card`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `padding` | `number \| string \| (…)[]` | var(--tao-space-5) | Padding of the card body. A number is px, a string is CSS. With flush — 0. Published as --tao-pad |
| `radius` | `number \| string \| (…)[]` | var(--tao-radius-panel) | Corner radius. A number is px, a string is CSS: all corners. An array or a string of 1 to 4 lengths gives the corners one by one, in the order of CSS border-radius ([top-left, top-right, bottom-right, bottom-left], two values are the diagonals): [0, 0, 12, 12] is a square top and a rounded bottom, and a stripe on a sharp side stays straight. Published as --tao-radius (and --tao-radius-tl / -tr / -br / -bl when the corners differ); children get --tao-radius-inner (one length) and --tao-radius-inner-tl / -tr / -br / -bl for a child in a corner |
| `square` | `string \| string[]` | — | Sharp corners with the radius kept as it is (the token of the theme, radius, the --tao-radius of your class): a side (top, bottom, left, right), a corner (top-left, top-right, bottom-right, bottom-left), several as an array or a string with spaces. Wins over radius, leaves the other corners alone. A stripe on a squared side stays straight |
| `shadow` | `boolean` | true | The regular shadow. Off with flush |
| `shadowBottomOnly` | `boolean` | false | A line at the bottom of the card, not a scrim over the photo |
| `flush` | `boolean` | false | A tile: no padding and no shadow, cover/body fill the whole cell |
| `hover` | `boolean` | false | An accent outline on hover |
| `surface` | `'flat' \| 'grain' \| 'glass'` | 'flat' | What the card is made of: fill / grain / glass. See “Surfaces” |
| `stripe` | `'top' \| 'left' \| 'bottom'` | — | A coloured stripe on one side; the corners clip it (over a picture in #media too) |
| `stripeTone` | `tone \| 'gradient'` | 'accent' | The stripe colour: accent, success / danger / warning / info / neutral, or the palette gradient. Say a status in the text as well |
| `active` | `boolean` | false | The selected state |
| `overflow` | `boolean` | false | Do not clip the content (media / carousel) |
| `closable` | `boolean` | false | A close button in the top right corner; the parent removes the card on the close event |
| `closeLabel` | `string` | 'Close' | aria-label of the close button |

**Slots, events, notes.** default — the body. #media (a photo or a carousel on top), #overlay (a scrim over the media or the whole tile), #header (the top row: laid out as you like), #title, #sub, #footer, #corner (the top right corner: a tag, a menu button; the title leaves room for it, the width is the variable --tao-card-corner-size). The close event — the cross was pressed.

## TaoMarquee

Showcase section: `#marquee`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | '' | The line; or anything inline in the slot (a link, an icon, bold text) |
| `speed` | `number` | 40 | Speed, pixels per second |
| `gap` | `number` | 48 | The gap between the end of the line and its next round, px |
| `fade` | `number` | 22 | The width of the fading edges, px. The left fade lives in a padding outside the text: at rest the line stands where it would, but the parent needs that much room on the left (its padding, or a smaller fade; 0 for none) or the running text shows past its edge |
| `pauseOnHover` | `boolean` | true | Stop on hover, and a tap stops and starts it. false is for a background line: a cursor or a finger passing by does not stop it, and the running text cannot be selected. Focus still stops it, Tab reaches the line |
| `roundPause` | `boolean` | true | A pause at the start of every round, to read the beginning. false — the line runs without a stop, like a looped picture. Not set: a decorative line has no pause, an ordinary one has |
| `decorative` | `boolean` | false | The line is only decoration (a background, a design feature) with no meaning: a ghost. Hidden from a screen reader, not a tab stop, a cursor and a tap are nothing to it, the text cannot be selected, it runs without pauses. Only for text nobody needs to read. With «reduce motion» it stands still, clipped |
| `paused` | `boolean` | false | Stopped by the app |
| `fill` | `boolean` | false | Run also when the line fits: it is repeated, with gap between the copies, until the copies cover the whole width (a ticker of quotes, a row of logos). Without it a line that fits stands still |
| `reverse` | `boolean` | false | Run to the right instead of to the left |

**Slots, events, notes.** default — the content of the line; its copies for the next rounds are hidden from a screen reader and inert. It runs only when it does not fit (always with fill); it stops on hover, on focus (a running line is a tab stop) and on a tap; with «reduce motion» it wraps. The line is as wide as its content: when the width of a part changes (live prices), everything after it moves and the strip twitches, so give live items a block of fixed width (columns in ch, tabular-nums). The content of the slot is watched: a new price, a font that came or an image measure the line again by themselves, measure() is only for rare cases (measure again by hand).

## TaoCopy

Showcase section: `#copy`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `text` | `string` | — | The string for the clipboard. Required |
| `successText` | `string` | 'Copied!' | The tooltip text after the click |
| `copyLabel` | `string` | 'Copy' | aria-label of the button |
| `tip` | `boolean` | true | Show a tooltip above the button after copying (the same hint look as TaoTooltip: the opposite of the theme) |

## TaoTour

Showcase section: `#tour`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `step` | `TaoTourStep \| null` | null | The step on screen; null closes the tour. A step: { id, target?, title?, text?, placement? }. target is a CSS selector, an element or a function that finds it; without it (or when nothing is found) the step is a card in the middle |
| `index` | `number` | 0 | The place of the step in the tour, from 0 (for the dots and "Step 2 of 5"). With TaoUX it is position, which does not count the steps that are jumped over |
| `count` | `number` | 0 | How many steps there are; at 1 or less there are no dots and no counter. With TaoUX it is total |
| `first` | `boolean` | index === 0 | No Back button |
| `last` | `boolean` | index === count - 1 | The button says Done instead of Next, and there is no Skip |
| `placement` | `TaoPlacement` | 'bottom' | Where the card stands against the target when the step does not say. It flips when it does not fit |
| `padding` | `number` | 6 | Space between the target and the edge of the lit window, px |
| `interactive` | `boolean` | false | The target can be pressed (a "press here" step); the rest of the page stays shut |
| `nextLabel / prevLabel / skipLabel / doneLabel` | `string` | from the locale | Button texts |
| `progressLabel` | `string` | 'Step {n} of {count}' | The progress text |

**Slots, events, notes.** default { step, index, count }: your own card content (instead of the title and the text). Events: next, prev, skip (the buttons, the arrows, Esc). TaoTour only draws: you keep the state, or use useTour from TaoUX (@1337exp/taoux/tour), which jumps over steps with no target and remembers that the tour was seen. The step scrolls its target into view by itself.

## TaoThemeToggle

Showcase section: `#theme-toggle`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `'dark' \| 'light' \| 'system'` | page mode | The mode ('system' only with system). Without it the button reads the mode of <html> (data-tao-mode) and follows it |
| `apply` | `boolean` | true | Write the mode to <html>. Turn it off to do it yourself from v-model (save the choice, change a class) |
| `system` | `boolean` | false | A third state, "system": the page follows the operating system (prefers-color-scheme, live). The click goes system → light → dark; the icon is the state the toggle is in (a monitor for the system) |
| `size` | `'small' \| 'medium' \| 'large'` | from ancestors | Button size |
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'text'` | 'ghost' | Button look |
| `tone` | `'accent' \| 'neutral' \| …` | 'neutral' | The colour of the button, as for TaoButton. neutral by default: a switch is a quiet tool, the accent is not for it |
| `toLightLabel` | `string` | 'Switch to the light theme' | aria-label while a click leads to the light theme |
| `toDarkLabel` | `string` | 'Switch to the dark theme' | aria-label while a click leads to the dark theme |
| `toSystemLabel` | `string` | 'Switch to the system theme' | aria-label while a click leads to the system theme (system) |

**Slots, events, notes.** icon: your own glyph, { mode, choice, next } (the mode on the page, the pick — "system" included —, and the pick a click leads to); the button stays a square and keeps its label. update:modelValue: the new pick ("dark" \| "light", and "system" with system). Without system the icon is the theme a click leads to (a sun while dark, a moon while light).

## TaoLanguageSwitch

Showcase section: `#language-switch`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | first language | The code of the language in use. Without it the switch keeps the choice itself and starts on the first language of the list |
| `languages` | `(string \| { code, label? })[]` | — | The languages: codes ('ru') or { code, label }. The name of a code is the language in itself (English, Deutsch, Español), given by the engine (Intl.DisplayNames); label is for when the autonym is not what you want |
| `apply` | `boolean` | true | Write the language to <html lang> on mount and on a change (the browser, a screen reader and the hyphenation take it from there). Turn it off to do it yourself |
| `iconOnly` | `boolean` | false | Only the globe, no name beside it: a phone, a narrow rail. The name stays in the accessible name of the button |
| `size` | `'small' \| 'medium' \| 'large'` | from ancestors | Button size |
| `placement` | `TaoPlacement` | 'bottom-end' | Where the list opens; flips when there is no room (top-start in the footer of a panel) |
| `label` | `string` | 'Language' | The name of the switch: the label of the button and of the list (from the locale) |

**Slots, events, notes.** update:modelValue: the code of the picked language (not sent when the one in use is picked). The switch knows none of your texts and stores nothing: the texts of the app, the storage and setTaoLocale for the built-in texts are yours. The accessible name of the button is «Language: English» (the visible word is inside it). The helper taoLanguageName(code) gives the autonym for your own lists.

## TaoInput

Showcase section: `#input`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number` | '' | The field value |
| `type` | `'text' \| 'password' \| 'email' \| 'number' \| 'tel'` | 'text' | The native input type |
| `placeholder` | `string` | '' | The hint inside |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `readOnly` | `boolean` | false | The value can be looked at, selected and is sent with the form, but not changed: typing, the arrows, the steppers, Enter and blur leave it alone; unlike disabled, the focus stays |
| `@commit` | `string` | — | The edit is finished: the field lost the focus or Enter was pressed with a changed text (the native change); v-model fires on every character |
| `variant` | `'outline' \| 'filled' \| 'plain'` | 'outline' | A frame / a fill only / nothing: plain reads as text (an item of a list being edited): no inset, the caret shows the focus, an error is a red line under the text. The height does not change |
| `id` | `string` | auto | The input id; otherwise taken from FormField or useId |

**Slots, events, notes.** #prefix and #suffix — inside the frame, left/right (an icon, text).

## TaoInputGroup

Showcase section: `#input`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The size of the whole group: addons, the field and buttons inside |

**Slots, events, notes.** default — the field itself (TaoInput etc.). #before / #after — a protocol, a unit, a button. Glues addon + field + addon into one frame.

## TaoInputNumber

Showcase section: `#input-number`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number \| null` | null | A number. An empty field is null, not 0 and not a string |
| `min / max` | `number` | — | The bounds. If not set — no limit |
| `step` | `number` | 1 | The step of ± and the arrows |
| `precision` | `number` | — | Digits after the decimal point |
| `@commit` | `number \| null` | — | Edit finished: blur, Enter, ±, arrow key (once per action; v-model fires per keystroke). |
| `controls` | `boolean` | true | ± buttons on the right |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `readOnly` | `boolean` | false | The value can be looked at, selected and is sent with the form, but not changed: typing, the arrows, the steppers, Enter and blur leave it alone; unlike disabled, the focus stays |
| `variant` | `'outline' \| 'filled' \| 'plain'` | 'outline' | As on TaoInput: a frame / a fill only / nothing (the field reads as text, an error is a red line under the text) |
| `placeholder` | `string` | '' | The hint when null |

## TaoQuantity

Showcase section: `#quantity`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | 1 | A whole quantity. Never empty |
| `min` | `number` | 1 | The lower bound |
| `max` | `number` | — | Stock. If not set — no ceiling |
| `allowRemove` | `boolean` | true | The minus at min stays alive and fires remove — the parent may remove the row |
| `@commit` | `number` | — | The edit is finished: plus or minus, or leaving the field after typing (once per action; v-model fires on every change) |
| `@remove` | `—` | — | The minus was pressed at the minimum with allowRemove: the app takes the item away |
| `forceMaxLimit` | `boolean` | true | Clamp the input to max on blur and when more than the stock arrives |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `readOnly` | `boolean` | false | The value is shown, can be selected and goes with the form, but is not changed: typing, arrows, ± and the drag leave it alone; unlike disabled, the focus stays |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |

**Slots, events, notes.** #decrement-icon / #increment-icon — the button icons.

## TaoDragNumber

Showcase section: `#drag-number`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | 0 | A number. Never empty |
| `label` | `string` | — | The caption on the left of the field. It also names the control for a screen reader (an aria-label of your own wins). Without it the number sits in the middle |
| `unit` | `string` | — | The unit after the number (m, °, %). Not part of the value; a typed “5 m” reads as 5, another unit is a typo |
| `min / max` | `number` | — | The bounds. A drag stops at them and does not “save up” the overshoot |
| `step` | `number` | 1 | The step of ± and the arrows (PageUp / PageDown ten steps, Home / End the bounds). Also sets the precision |
| `precision` | `number` | decimals of step | How many decimal places the value is rounded to |
| `dragSpeed` | `number` | step / 4 | Value change per pixel of a drag. Shift is ten times slower, Ctrl snaps to the step grid, Esc puts it back |
| `controls` | `boolean` | true | The − and + buttons on the sides |
| `repeat` | `boolean` | true | A held − / + repeats its step: the first at once, after a 0.4 s pause the steps come every 120 ms and speed up to every 40 ms. The whole run is one @commit, Esc puts the value back, a bound stops it |
| `variant` | `'outline' \| 'filled'` | 'outline' | A frame / a fill and no frame (a column of fields in a panel) |
| `format` | `(value: number) => string` | — | Text of the number at rest (1 200, 5.00). The field edits the plain number |
| `@commit` | `number` | — | The action ended and changed the value: end of a drag, ±, an arrow, Enter or blur of a typed number (once per action; v-model updates on every move) |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `readOnly` | `boolean` | false | The value is shown, can be selected and goes with the form, but is not changed: typing, arrows, ± and the drag leave it alone; unlike disabled, the focus stays |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `incrementLabel / decrementLabel` | `string` | from the locale | Button labels for a screen reader |

**Slots, events, notes.** #decrement-icon / #increment-icon — the button icons.

## TaoTextarea

Showcase section: `#textarea`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | '' | Text |
| `placeholder` | `string` | '' | Hint |
| `rows` | `number` | 3 | The initial height |
| `maxHeight` | `number \| string` | 500 | How tall the field grows with its text before it scrolls: a number is px, a string any CSS length (50vh), none — no limit. Dragging the corner stops there too |
| `maxlength` | `number` | — | Cuts the input |
| `count` | `boolean` | false | Show “typed / maximum” (together with maxlength) |
| `resize` | `boolean` | true | Can be dragged by the corner |
| `variant` | `'bar' \| 'outline' \| 'filled' \| 'plain'` | 'bar' | A stripe on the left / a frame like TaoInput / a fill only / nothing |
| `noSpace` | `boolean` | false | A space cannot be typed — neither from the keyboard nor by pasting |
| `align` | `'start' \| 'center' \| 'end'` | 'start' | Text alignment |
| `blurOnEnter` | `boolean` | false | Enter drops the focus instead of inserting a line break (Shift+Enter inserts it); keydown goes out first |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red border |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `readOnly` | `boolean` | false | The value can be looked at, selected and is sent with the form, but not changed: typing, the arrows, the steppers, Enter and blur leave it alone; unlike disabled, the focus stays |
| `@commit` | `string` | — | The edit is finished: the field lost the focus or Enter was pressed with a changed text (the native change); v-model fires on every character |

## TaoChecklist

Showcase section: `#checklist`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoChecklistItem[]` | — | { id, label, description?, disabled? } |
| `v-model` | `(string \| number)[]` | [] | The checked values, in the order of the items |
| `legend` | `string` | — | The group caption (legend). In a TaoFormField the field gives it |
| `name` | `string` | — | The name in a form: every checked item is sent under it, its id as the value |
| `id` | `string` | — | The id of the group (the fieldset): the label of a TaoFormField points at it |
| `selectAll` | `boolean` | false | «Select all» on top: mixed when some are checked; toggles every enabled item |
| `counter` | `boolean` | false | «3 of 5» next to the caption, announced politely |
| `strike` | `boolean` | false | Strike the checked items through (a to-do list). A look only: the checkbox tells the state |
| `disabled` | `boolean` | false | The whole group is disabled |
| `invalid` | `boolean` | false | Red frames; the message goes to error of TaoFormField |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size of the checkboxes |
| `selectAllLabel` | `string` | 'Select all' | The «Select all» label |
| `counterText` | `string` | '{checked} of {total}' | The counter text |

**Slots, events, notes.** #item — { item, checked }: your own item text. Event update:modelValue. «Select all» leaves a disabled item alone. A fieldset: in a TaoFormField the group takes the id, the label and the error of the field, the checkboxes inside keep ids of their own.

## TaoCheckbox

Showcase section: `#checkbox`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | — | Checked / not |
| `label` | `string` | '' | The caption on the right |
| `indeterminate` | `boolean` | false | A dash instead of the tick. A click sets checked, the parent works out the mixed state |
| `disabled` | `boolean` | false | Disabled |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | A 14 / 18 / 22 square and the caption font size. Without it — the size of the ancestors |
| `invalid` | `boolean` | false | A red accent. The error text goes through TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |

## TaoSelect

Showcase section: `#select`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number \| null` | null | value of the selected option. Clearing → null |
| `items` | `TaoSelectItem[]` | [] | { id, label, disabled? } |
| `placeholder` | `string` | 'Choose' | When the model is null |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red border |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). name is the name in a form: the value goes into FormData through a hidden input; required — a form does not submit the field empty (the native check, its message points at the visible control); id is what the label of TaoFormField points at |
| `readOnly` | `boolean` | false | The value can be seen and is sent with the form, but not changed: the pop-up does not open, no typing and no clearing (aria-readonly) |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, as TaoButton; also scales the opened list. Without it — the size of the ancestors |
| `clearable` | `boolean` | true | Clear row and Delete / Backspace. Turn off when null is not valid. |
| `clearText` | `string` | 'Clear' | Label of the clear row. |

**Slots, events, notes.** #clear: content of the clear row (icon, markup), replaces clearText. #chevron: custom arrow.

## TaoSwitch

Showcase section: `#select`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | false | On / off. role="switch" |
| `label` | `string` | '' | The caption on the right |
| `disabled` | `boolean` | false | Disabled |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The track is 28 / 36 / 44 px wide, and the caption font size. Without it — the size of the ancestors |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `loading` | `boolean` | false | The change is being applied: a spinner on the thumb, a click does nothing, not greyed out; aria-busy |

## TaoRadio / TaoRadioGroup

Showcase section: `#select`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string \| number \| boolean` | — | Radio: the value of this point. Required |
| `v-model` | `the same` | — | Group holds the selection. A Radio without a group holds its own |
| `legend` | `string` | — | Group: the group caption |
| `required` | `boolean` | false | The group must have a pick: the native required on every radio |
| `id` | `string` | — | The id of the group (the fieldset): the label of a TaoFormField points at it |
| `direction` | `'row' \| 'column'` | 'row' | Group: in a row or in a column |
| `disabled` | `boolean` | false | A single point or the whole group |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | A 14 / 18 / 22 circle and the caption font size. On a group — for all the radios inside |
| `label / name` | `string` | '' | Radio: the caption and name, if there is no group |

## TaoFormField

Showcase section: `#select`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | A shared caption above the control |
| `hint` | `string` | — | A hint under the field |
| `error` | `string` | — | The error text; if present, the field is invalid |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The size of the control inside |

**Slots, events, notes.** default — the control itself (Input, Select, Switch…). #label-end — after the label (a «?» with a hint, a link): a sibling of the label, not part of its name.

## TaoSegmented

Showcase section: `#segmented`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number \| boolean` | — | value of the selected option |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The segment height, the same scale as TaoButton. Without it — the size of the ancestors |
| `block` | `boolean` | false | Stretch to the parent width |
| `minWidth` | `number \| string` | — | Minimum width of every option (number = px); the --tao-segmented-option-min-width variable |
| `legend` | `string` | — | The accessible name of the group |
| `disabled` | `boolean` | false | The whole group |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `name` | `string` | auto | name for the radio inputs inside |
| `required` | `boolean` | false | The group must have a pick: the native required on every radio |
| `id` | `string` | — | The id of the group (the fieldset): the label of a TaoFormField points at it |

**Slots, events, notes.** default — a set of TaoSegmentedOption.

## TaoSegmentedOption

Showcase section: `#segmented`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `string \| number \| boolean` | — | The option value. Required |
| `label` | `string` | '' | The text. Or the default slot |
| `icon` | `string` | '' | A TaoIcon name on the left |
| `count` | `number \| string` | — | A number on the right (a badge) |
| `disabled` | `boolean` | false | This option |

## TaoCombobox

Showcase section: `#combobox`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number \| null` | null | value of an option, or an arbitrary string with allow-create |
| `items` | `TaoSelectItem[]` | [] | { id, label, disabled? }. The list is not mutated by the component |
| `placeholder` | `string` | 'Start typing' | The empty field |
| `allowCreate` | `boolean` | false | A value that is not in the list can be kept |
| `emptyText` | `string` | 'Nothing found' | An empty filter |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, as TaoButton and TaoSelect; also scales the opened list. Without it — the size of the ancestors |
| `clearable` | `boolean` | true | Clear row in the list. Turn off when null is not valid. |
| `clearText` | `string` | 'Clear' | Label of the clear row; slot #clear replaces it. |
| `disabled / invalid` | `boolean` | false | Disabled / a red border |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `readOnly` | `boolean` | false | The value can be seen and is sent with the form, but not changed: the pop-up does not open, no typing and no clearing (aria-readonly) |
| `variant` | `'outline' \| 'filled' \| 'plain'` | 'outline' | As on TaoInput: a frame / a fill only / nothing (the field reads as text, an error is a red line under the text) |

**Slots, events, notes.** create — an event when a new value is typed: the parent extends options itself.

## TaoDocTabs

Showcase section: `#doc-tabs`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | — | The value of the active tab. It may be none of them (no document open): then the first one is the way in by Tab |
| `items` | `{ id, label, title?, dirty?, preview?, closable? }[]` | [] | The tabs. id is the id of the document; title the full name for a hint; dirty the unsaved dot; preview a preview (italics, pinned by a double click or Enter); closable: false has no cross and cannot be closed |
| `controls` | `string` | — | The id of the element the active tab controls (the document view): aria-controls |
| `label` | `string` | 'Open documents' | The name of the row for a screen reader |
| `closeLabel` | `string` | 'Close' | The label of the cross (the tab name follows it) |
| `dirtyLabel` | `string` | 'unsaved changes' | What is read instead of the dot |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, same scale as TaoButton |

**Slots, events, notes.** #label="{ tab }" — your own content of a tab instead of the label. update:modelValue — a tab was picked (a click, the arrows, Home, End). close(value) — a request to close (the cross, the middle button, Delete): the app closes it. pin(value) — a preview was pinned (a double click, Enter). reorder(from, to) — a tab was moved (by dragging or Alt + arrows; the tabs can be dragged only when you listen to reorder and there is more than one tab; there is no dragging on a touch screen, use the menu of your app there): to is the place once the tab is taken out and put back (splice(to, 0, ...splice(from, 1))). menu(value, event) — a right click or the menu key: the app draws the menu. Tabs that do not fit scroll sideways, the wheel too; the active one is always in view. The cross is for the pointer only (aria-hidden), a keyboard user closes with Delete.

## TaoCommandList

Showcase section: `#command-palette`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ id, label, group?, shortcut?, icon?, description?, keywords?, disabled? }[]` | [] | The commands. The list only searches and shows them; running one is @select |
| `placeholder` | `string` | 'Type a command…' | The hint in the empty field |
| `emptyText` | `string` | 'No commands found' | The text when nothing fits |
| `label` | `string` | 'Commands' | The name of the field and the list for a screen reader |
| `limit` | `number` | 50 | The most rows shown |
| `autofocus` | `boolean` | false | Put the focus in the field when the list appears |

**Slots, events, notes.** #item="{ item, active, ranges }" — your own row (ranges are the stretches of the label the query found). #empty — nothing found. select(item) — a command was picked (Enter or a click), the list closes nothing; escape — Escape was pressed in the field. Methods: focus(), reset() (clears the query). The field and the list with no window: lay it in a page, a panel or a TaoPopover, its parent gives it a height (the list scrolls itself); class and style go to the root. TaoCommandPalette is this inside a dialog. The search and the keys are the palette's (below).

## TaoCommandPalette

Showcase section: `#command-palette`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | — | Open or closed. Required (as on TaoModal). The palette listens to no key itself: open it from yours |
| `items` | `{ id, label, group?, shortcut?, icon?, description?, keywords?, disabled? }[]` | [] | The commands. The palette only searches and shows them; running one is @select. group gives captions while the query is empty; shortcut is the text of the shortcut; keywords are words that find it though they are not shown; disabled is shown but cannot be picked |
| `placeholder` | `string` | 'Type a command…' | The hint in the empty field |
| `emptyText` | `string` | 'No commands found' | The text when nothing fits |
| `label` | `string` | 'Commands' | The name of the dialog and the list for a screen reader |
| `limit` | `number` | 50 | The most rows shown |
| `surface` | `'flat' \| 'grain' \| 'glass'` | 'flat' | What the panel is made of, as on TaoModal |
| `modal` | `boolean` | true | true — a modal dialog: the page is dimmed and locked, a press on the dimmed part closes it. false — a panel over a living page, as in VS Code: no dimming, no scroll lock, a press outside the panel closes it |
| `fullscreen` | `boolean \| 'narrow'` | 'narrow' | As on TaoModal: true — the whole screen, 'narrow' — the whole screen only below 600px (a phone), false — never |

**Slots, events, notes.** #item="{ item, active, ranges }" — your own row (ranges are the stretches of the label the query found). #empty — nothing found. select(item) — a command was picked (Enter or a click), the palette closes after it; update:modelValue and close — closing. class, style and the other attributes go to the dialog panel. Every word of the query must fit: the start of the label scores higher, then the start of a word, then any place, then the letters in order; the group, the description and keywords find a command too. Keys: ↑ ↓ (a disabled row is skipped, the ends join), Home End, Enter, Esc; the focus never leaves the field. The search is exported as matchCommands(items, query, limit).

## TaoPresetInput

Showcase section: `#preset-input`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number \| null` | null | The value: the value of an option, or a number typed by hand (custom) |
| `options` | `{ value, label, disabled?, default? }[]` | [] | The presets. They go in this order in the pop-up, and the arrows walk them in it («up» is the next one). The option with default is what an empty field means («Auto»): the pop-up shows it first, and the arrows reach it after the last one |
| `loop` | `boolean` | false | The arrows go round: past the last one the first, before the first one the last. Without it the ends hold |
| `custom` | `boolean` | true | A whole number that is not in the list is a value too (between min and max). Off: only the presets |
| `min` | `number` | 1 | The lowest typed number (custom) |
| `max` | `number` | 999 | The highest typed number (custom) |
| `size` | `'small' \| 'medium' \| 'large'` | from ancestors | Size, the same scale as TaoButton |
| `variant` | `'filled' \| 'outline'` | 'filled' | filled: a fill, the frame shows while the field is edited; outline: a frame |
| `disabled` | `boolean` | false | Disabled |
| `readOnly` | `boolean` | false | The value is shown, can be selected and goes with the form, but is not changed: the list does not open, typing and arrows leave it alone; unlike disabled, the focus stays |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). id is what the label of TaoFormField points at (otherwise the FormField's or useId); name is the name in a form (FormData, a native submit); required is the native required; autofocus takes the focus when the field appears |
| `@commit` | `value` | — | The edit is finished: the field lost the focus or Enter was pressed with a changed text (the native change); v-model fires on every character |
| `nextLabel` | `string` | 'Next value' | aria-label of the up arrow |
| `prevLabel` | `string` | 'Previous value' | aria-label of the down arrow |

**Slots, events, notes.** aria-label, name, autocomplete and listeners reach the input, class and style the wrapper. The width of the input is the variable --tao-preset-input-width (4.5rem). update:modelValue: the new value. Keys: ↑ ↓ step, Home End go to the ends, Enter applies, Esc throws the text away; Tab applies and goes on. The arrows are not tab stops.

## TypeaheadPlayground

Showcase section: `#typeahead`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `object \| null` | null | The selected hit { id, name, city, role } or null |

**Slots, events, notes.** #item="{ hit, active }" — a list row. #empty — nothing found. Not part of the npm package, lives in showcase/demo.

## TaoDate

Showcase section: `#date`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| null` | null | A single day YYYY-MM-DD, with no time and no time zone |
| `min / max` | `string` | — | The bounds in the same format |
| `placeholder` | `string` | 'Date' | The empty field |
| `locale` | `string` | the app locale | The calendar captions and the order of day and month; without it the language of setTaoLocale |
| `editable` | `boolean` | false | A text field you type the date into, the calendar on the button next to it or ↓. In the locale's order of day and month: 5 is the 5th of this month, 5.3 the 5th of March (3/5 in en-US), 05.03.26, 0503, ISO. Enter or leaving the field applies it; a text that is not a date or is outside min / max puts the value back; Esc drops the typing; an empty field is null |
| `parse / format` | `(text, { locale, reference }) => string \| null / (iso, locale) => string` | — | Your own reading of the typed text («tomorrow») and your own text in the field; reference is the current value or today |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled / invalid` | `boolean` | false | Disabled / a red border |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). name is the name in a form: the value goes into FormData through a hidden input; required — a form does not submit the field empty (the native check, its message points at the visible control); id is what the label of TaoFormField points at |
| `readOnly` | `boolean` | false | The value can be seen and is sent with the form, but not changed: the pop-up does not open, no typing and no clearing (aria-readonly) |
| `todayText / clearText` | `string` | 'Today' / 'Clear' | The buttons at the bottom of the popup |
| `calendarLabel` | `string` | 'Choose a date' | aria-label of the calendar button of an editable field |

**Slots, events, notes.** #icon, #prev-icon, #next-icon — the icons of the field and of the month arrows.

## TaoDateRange

Showcase section: `#date`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `{ start, end } \| null` | null | A period YYYY-MM-DD. An incomplete choice is not written to the model |
| `min / max` | `string` | — | The bounds |
| `placeholder` | `string` | 'Period' | While null |
| `locale` | `string` | the app locale | The calendar captions; without it the language of setTaoLocale |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium |
| `disabled / invalid` | `boolean` | false | Disabled / a red border |
| `name` | `string` | — | The name in a form: the range goes into FormData as <name>-start and <name>-end (ISO dates, through hidden inputs); required needs both |
| `readOnly` | `boolean` | false | The value can be seen and is sent with the form, but not changed: the pop-up does not open, no typing and no clearing (aria-readonly) |

**Slots, events, notes.** The first click is start, the second is end (they swap if end is earlier).

## TaoPinCode

Showcase section: `#pincode`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `length` | `number` | — | The number of cells. Not needed with format: it is counted from the mask |
| `format` | `string` | — | A mask with separators: # is a cell, the rest is a separator (#-##-## gives 0-00-00). Separators are not part of the value |
| `v-model` | `string` | '' | The cells glued into a string |
| `numbersOnly` | `boolean` | false | Digits only |
| `masked` | `boolean` | false | Dots instead of characters |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract. name — the whole code goes into FormData through a hidden input; required — a form does not submit the code until every cell is filled; id is on the first cell |
| `bordered` | `boolean` | true | The frame of the cells. false is the light style, no frame at all: a fill; the focus, an error and a result are told by a tint of the fill and the colour of the digit |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Cells 40×46 / 50×56 / 58×64. Without it — the size of the ancestors |
| `clearOn` | `'focus' \| 'input'` | 'focus' | focus — a click clears the cell and everything to the right; input — changes only on typing |
| `status` | `'idle' \| 'success' \| 'error'` | 'idle' | The result of the check, set by the app (on complete): error shakes the cells and paints them red, success runs a glow and paints them green; a screen reader hears it. Set idle again when the user edits; play() repeats the animation |
| `successText / errorText` | `string` | 'The code is correct' / 'Wrong code' | What a screen reader hears |
| `placeholder` | `string` | '' | The character in an empty cell |

**Slots, events, notes.** The complete event — the last cell was typed (it blurs).

## TaoProgress

Showcase section: `#slider`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `progress` | `number` | 0 | The fill 0–100, not the bar width |
| `minWidth / maxWidth` | `number` | 200 / — | The bar width in px |
| `height` | `number` | 8 | The thickness in px |
| `showPercentage` | `boolean \| 'top' \| 'right'` | true | true/top — above the bar, right — on the right, false — hide |
| `animated` | `boolean` | true | Smooth filling |

**Slots, events, notes.** #left / #right — captions. If #right is present, the percentage goes on the right in brackets.

## TaoSlider

Showcase section: `#slider`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | — | The current value. Required. Two handles: TaoRangeSlider with a [from, to] pair |
| `min / max / step` | `number` | 0 / 100 / 1 | The range and the step |
| `marks` | `boolean \| (number \| { value, label? })[]` | — | Scale marks: true — automatic divisions, an array of numbers or objects with a caption. A click on a caption moves the handle |
| `marksSide` | `'start' \| 'end'` | 'end' | The marks side: end — under a horizontal slider and to the right of a vertical one, start — above and to the left |
| `discrete` | `boolean` | false | The value only on the marks (a stepped scale); the arrows follow the marks |
| `format` | `(value: number) => string` | — | Number text: the captions of automatic marks and the value on the bar |
| `flat` | `boolean` | false | No round handles: a flat bar with a fill. Keyboard and focus work |
| `bubble` | `boolean \| 'always'` | false | A bubble with the value beside the thumb, in the colour of its zone (the accent without zones), with a label that reads on it. Off by default. true — it shows while the thumb is dragged, hovered or has the keyboard focus; "always" — it stays. The text is format or the #bubble="{ value, zone }" slot. A screen reader does not need it (there is aria-valuetext). Leave room for it above the bar (to the right of a vertical one) |
| `zones` | `{ to, tone?, color?, dot?, reveal? }[]` | — | The scale in colour: each zone runs to its to (the first from min, the last to max, no gaps and no overlaps). tone is a colour role of the theme (accent, success, warning, danger, info, neutral), color is any CSS colour and wins over tone. The bar shows the zones dimmed, the filled part in full colour, the thumb takes the colour of its zone. dot: true puts a bead where a zone ends (none at max). reveal: true — the zone has no colour until the value gets there: the field looks plain and is painted as it fills (its dot shows once the fill has got to it). Colour is not a message: say the state in words |
| `vertical` | `boolean` | false | Vertical: the maximum on top, marks on the right. Length — --tao-slider-length (10rem) |
| `variant` | `'bar' \| 'thin'` | 'bar' | bar — a thick track, a form control; thin — a thin one (seek / volume). It used to be size="small" |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The scale of the track and the thumb (the thumb is 16 / 20 / 24). Without it — the size of the ancestors |
| `showValue` | `boolean` | false | The value over the bar |
| `disabled` | `boolean` | false | Disabled |
| `invalid` | `boolean` | false | A red outline of the track. The error text is error on TaoFormField |
| `name` | `string` | — | The name in a form: the number goes into FormData through a hidden input; a range sends <name>-from and <name>-to |
| `id / required / autofocus` | `string / boolean / boolean` | — / false / false | The field contract (FieldProps): the id of the first thumb (the label of a TaoFormField points at it), required on the hidden value inputs (a slider always has a value, so it never holds a form back), autofocus |
| `wheel` | `number` | 0 | The change step for the mouse wheel (a single handle). 0 — disabled |
| `editable` | `boolean` | false | The value can be typed: a right click or a double click on the bar, or Enter / F2 on a handle, opens a field over the bar (for a range, for the nearest or the focused handle). Enter or leaving the field sets the value, snapped to the step (or to a mark with discrete) and kept in range; Esc drops the edit |
| `editLabel` | `string` | from the locale | The accessible name of the field of editable (slider.editLabel, "Value") |
| `@commit` | `value` | — | Finished changing: released, a key, the wheel, a click on a mark. v-model fires on every move |
| `#mark` | `{ mark, active }` | — | A custom mark caption |

## TaoRangeSlider

Showcase section: `#slider`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `[number, number]` | — | A [from, to] pair. Required |
| `minGap` | `number` | 0 | The smallest distance between the handles; the handles do not jump over each other |
| `…` | `` |  | The rest as in TaoSlider: min / max / step, marks, discrete, format, vertical, variant, size, showValue, disabled, invalid, name |

## TaoScrubber

Showcase section: `#slider`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | — | The current time. Required |
| `v-model:playing` | `boolean` | false | Whether playback is running (the look of the button). The component does not keep time itself |
| `length` | `number` | — | The length; the slider goes from 0 to it. Required |
| `step` | `number` | 0.01 | The slider step |
| `marks` | `(number \| { value, label? })[]` | — | Event marks on the scale |
| `marksSide` | `'start' \| 'end'` | 'end' | The marks above the slider or below it |
| `format` | `(time: number) => string` | toFixed(2) | The time text in the marks and the caption |
| `pauseOnScrub` | `boolean` | true | Pause while the user holds the slider |
| `showRestart / showTime` | `boolean` | true | The “to the start” button; the “time / length” caption |
| `variant` | `'bar' \| 'thin'` | 'thin' | The track thickness |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Size; without it — the size of the ancestors |
| `disabled` | `boolean` | false | Disabled |
| `playLabel / pauseLabel / restartLabel` | `string` | from the locale | Button captions for screen readers |
| `@restart` | `—` | — | The “to the start” button (the time is already set to 0) |
| `@commit` | `time` | — | Finished seeking: the slider was released or a key was pressed |
| `#mark / #time` | `{ mark, active } / { time, length, text }` | — | A custom mark caption; a custom time caption |

## TaoColorPicker

Showcase section: `#color`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | — | The colour as a hex string: #rrggbb, with alpha also #rrggbbaa. rgb()/rgba() is accepted on input too. Required |
| `alpha` | `boolean` | false | The opacity bar and #rrggbbaa |
| `swatches` | `string[]` | — | Ready colours under the palette; the selected one is marked |
| `modes` | `('hex' \| 'rgb' \| 'hsl')[]` | ['hex', 'rgb', 'hsl'] | Colour input modes; a single mode hides the switch |
| `v-model:mode` | `'hex' \| 'rgb' \| 'hsl'` | the first of modes | The current input mode; v-model:mode remembers the choice between openings |
| `eyedropper` | `boolean` | true | An eyedropper (only where the browser supports EyeDropper) |
| `disabled` | `boolean` | false | Disabled |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The field size; without it — the size of the ancestors |
| `areaLabel / hueLabel / alphaLabel / hexLabel / swatchesLabel / eyedropperLabel` | `string` | from the locale | Captions for screen readers (the colorPicker locale) |
| `@commit` | `hex` | — | Finished editing: the square or a bar was released, a key, the hex field, a swatch. v-model fires on every move |

## TaoColorInput

Showcase section: `#color`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | — | The colour as a hex string. Required |
| `alpha / swatches / modes / v-model:mode / eyedropper / size` | `` |  | As in TaoColorPicker |
| `clearable` | `boolean` | false | The colour can be taken away again: a Clear button under the palette and Delete / Backspace on the field; gives "" (the field then says Not set) |
| `placeholder` | `string` | 'Not set' | What the field says while the value is empty (""): an optional colour that is not set; the swatch is crossed out |
| `placement` | `TaoPlacement` | 'bottom-start' | Side and alignment: top / bottom / left / right and -start / -end. Flips at the screen edge |
| `invalid` | `boolean` | false | A red border. The error text is error on TaoFormField |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps). name is the name in a form: the value goes into FormData through a hidden input; required — a form does not submit the field empty (the native check, its message points at the visible control); id is what the label of TaoFormField points at |
| `readOnly` | `boolean` | false | The value can be seen and is sent with the form, but not changed: the pop-up does not open, no typing and no clearing (aria-readonly) |
| `disabled` | `boolean` | false | Disabled |

## colorModel(source, options)

Showcase section: `#color`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `source` | `Ref<T>` | — | Your colour storage. Returns a writable hex string for v-model |
| `format` | `'object' \| 'array' \| 'css'` | 'object' | { r, g, b, a }, [r, g, b, a] or an rgb(r g b / a) string |
| `range` | `255 \| 1` | 255 | The range of r, g, b; opacity is always 0…1 |
| `space` | `'srgb' \| 'linear'` | 'srgb' | The space of r, g, b; linear only with range: 1 (rendering, the TaoFX gradient) |
| `alpha` | `boolean` | false | Store opacity; without it a hex #rrggbb |
| `precision` | `number` | 5 | Digits of fractional values (range 1); for a linear colour fewer give steps in the dark |

## TaoFileDrop

Showcase section: `#filedrop`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `File[]` | [] | The list of files. The component does not accumulate it — only what the parent gave |
| `multiple` | `boolean` | false | Several files |
| `accept` | `string` | '*' | As in <input type="file"> |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The height of the zone and of the file rows. Without it — the size of the ancestors |
| `list` | `boolean` | true | Names under the zone. Removing a file goes straight to v-model |
| `disabled` | `boolean` | false | The zone is off: nothing can be dropped or picked |
| `invalid` | `boolean` | false | Red frame. The message goes to TaoFormField error |
| `id / name / required / autofocus` | `string / string / boolean / boolean` | — / — / false / false | The field contract (FieldProps) for the native file input: id (the label of a TaoFormField points at it), name, required, autofocus |
| `showClear` | `boolean` | false | The “clear all” button. It does not clear by itself — it fires clear-request |

**Slots, events, notes.** default — the zone text. The update:modelValue event — files were added or removed. reject — the files that did not pass accept (File[]): they are not in v-model, tell the user why. clear-request: the parent decides whether to reset at once or after confirm().

## TaoSparkline

Showcase section: `#charts`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `values` | `(number \| null)[]` | — | The series; null is a gap that splits the line |
| `label` | `string` | — | What it shows, for a screen reader («Visits, 12 weeks, growing»). Without it the line is decoration (aria-hidden) |
| `tone` | `'accent' \| 'neutral' \| 'success' \| 'danger' \| 'warning' \| 'info'` | 'accent' | The colour |
| `area` | `boolean` | false | A soft fill under the line |
| `dot` | `boolean` | false | A dot on the last value |
| `min / max` | `number` | the data | A fixed range (values outside are clamped): to compare several sparklines |
| `height` | `number \| string` | 32 | Height (number = px). The width is the width of the container |

**Slots, events, notes.** A trend without axes or a tooltip: for a card, a table cell, a line of text.

## TaoMeter

Showcase section: `#charts`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | — | The measured value |
| `min / max` | `number` | 0 / 100 | The range |
| `low / high` | `number` | — | The bounds of the low and the high region. Without them the meter is the accent colour |
| `optimum` | `number` | the middle | The best value. Its region is success, the next one warning, the far one danger, as the HTML <meter>: optimum 0 for disk space used, max for a battery |
| `label` | `string` | — | Shown above the bar, the accessible name |
| `valueText` | `string \| boolean` | false | The value right of the label: true is the number, a string your own text (read as aria-valuetext) |
| `tone` | `TaoToneName` | — | A fixed colour instead of low / high |

**Slots, events, notes.** role="meter". A measured value in a range (disk, battery, a score), not the progress of a task: that is TaoProgress.

## TaoDonut

Showcase section: `#charts`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `segments` | `TaoDonutSegment[]` | — | { label, value, tone?, color? }. The parts take --tao-color-chart-1…6 in order; a tone or a CSS colour wins. 3–5 parts read well |
| `value / max` | `number` | 0 / 100 | Without segments: a single ring, value of max |
| `tone` | `TaoToneName` | 'accent' | The colour of the single ring |
| `label` | `string` | — | The accessible name; the parts and their shares are read after it |
| `size / thickness` | `number` | 120 / 12 | The outer size and the ring width, px |
| `legend` | `boolean` | false | A list of the parts with their shares next to the ring |

**Slots, events, notes.** default — the middle of the ring (a number, a word). taoChartTheme(el?) returns the theme colours as rgb() for a chart library: colors (6 series), text, textMuted, grid, axis, background, tooltip, tooltipText, danger / success / warning, fontFamily; watchTaoChartTheme(apply, el?) calls it now and on every theme, mode or palette change, and returns stop().

## TaoHeatmap

Showcase section: `#charts`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `values` | `(number \| null)[][]` | — | One array per row, one value per column; null is no data |
| `rows / cols` | `string[]` | — | The names of the rows («Mon») and the columns («12 am») |
| `steps` | `number[]` | by the data | The thresholds, ascending: a cell takes the colour of the highest one it reaches, below the first it is empty. By default round numbers at 10–80% of the largest value |
| `tone` | `TaoToneName` | 'accent' | The colour of the levels: from faint to the full tone |
| `label` | `string` | — | The accessible name of the grid |
| `legend` | `boolean` | true | The thresholds with their colours («500+») under the map |
| `hatch` | `number` | 1 | How many of the lowest levels are striped, so they read apart from empty cells without colour too |
| `labelEvery` | `number` | 1 | Show every n-th column name; all of them are still read |
| `colLabels` | `'top' \| 'bottom'` | 'bottom' | Where the column names stand |
| `cellHeight` | `number` | — | The cell height, px; square cells by default |
| `gap` | `number` | 3 | The gap between cells, px |
| `format` | `(value) => string` | by the locale | How a number is written in the tip, the cells and the legend |

**Slots, events, notes.** tip { row, col, value, text } — the tip over a cell. It is a hint like a tooltip, the opposite of the theme: your content takes its colour (`currentColor`), a text token of the theme would be unreadable on it. role="grid": one cell is in the tab order, the arrows, Home / End (Ctrl for the corners) and PageUp / PageDown move it; a screen reader reads the row, the column and the number. The map fits the width of its container.

## TaoTable

Showcase section: `#table`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `columns` | `TaoTableColumn<T>[]` | — | Required. { id, label, sortable?, align?, width?, minWidth?, nowrap?, value?(row) }. A list shared by tables of any rows: TaoTableColumn[] without T |
| `rows` | `T[]` | [] | The data. The table is generic: T comes from here (an interface, a class, a readonly array), and the row in the slots and in row-click is a T |
| `v-model:sort` | `{ id, dir } \| null` | null | Sorting. dir: asc \| desc |
| `loading` | `boolean` | false | The loading overlay |
| `emptyText` | `string` | 'No data' | If rows is empty and not loading |
| `striped` | `boolean \| 'odd' \| 'even'` | false | Zebra. true/odd — from the first row, even — from the second |
| `hover` | `boolean` | true | Highlight the row on hover |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Paddings and text of cells (small = the former compact), and the size of controls in cells too |
| `head` | `boolean` | true | Highlight the header |
| `lines` | `boolean` | true | Lines between rows |
| `bordered` | `boolean` | by context | The outer frame. Not set, it follows the frames context; false: no frame, the table sits on a raised fill. The lines between rows stay (lines) |
| `sticky` | `boolean` | false | A sticky header (needs maxHeight) |
| `rowKey` | `string \| fn` | 'id' | The row key |
| `maxHeight` | `number \| string` | — | Scroll. A number is px |
| `minWidth` | `number \| string` | — | The table is never narrower than this (a number is px): in a narrower place it scrolls sideways instead of squeezing the columns into thin stacks. Not under stack cards |
| `clickable` | `boolean` | false | The rows can be clicked: a pointer cursor and the row-click event. From the keyboard the table is one Tab stop: the arrows and Home / End walk the rows, Enter and Space do what a click does (a key inside a button or a field of the row stays with it). The focus of a row is a tint of the accent and a 2px bar at its start (not a ring: the rounded frame of the table would cut its corners) |
| `stack` | `boolean` | false | Under 600px (the width of the table itself, not of the window) a row turns into a card: each cell under its column label. A container query, no JavaScript. The header stays for a screen reader |

**Slots, events, notes.** Cell: #cell-{id}="{ row, value }" (row is a T, value is unknown). Events: update:sort — the sorting changed, row-click, if clickable.

## TaoPagination

Showcase section: `#pagination`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model:page` | `number` | 1 | The current page |
| `total` | `number` | 0 | Total records (not pages) |
| `pageSize` | `number` | 10 | Records per page |
| `jump` | `number` | 5 | A click on “…” jumps this many pages. 0 — “…” is decorative |
| `pageInput` | `boolean \| number` | false | A field to type a page in: true — always, a number — from this many pages on. Enter or leaving the field goes there (clamped to the range), Esc drops it |
| `pageSizes` | `number[]` | — | The page sizes to choose from: «Per page» next to the total, v-model:page-size. On a change the page moves so the first row on screen stays on screen |
| `siblingCount` | `number` | 1 | How many numbers around the current one |
| `showTotal` | `boolean` | true | The “1–10 of N” caption |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Buttons 26 / 36 / 44, like TaoButton. Without it — the size of the ancestors |
| `disabled` | `boolean` | false | Disabled |

## TaoEmpty

Showcase section: `#empty`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | 'Nothing here' | The empty state title |

**Slots, events, notes.** default — an explanation. #icon — a picture/icon. #action — a button.

## TaoTree

Showcase section: `#tree`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoTreeNode[]` | — | { id, label, icon?, children?, hasChildren?, disabled?, hint?, tone? }. hasChildren without children — the children come from load when it opens. hint — a quiet note after the label («library root»). tone — the colour of the label: 'muted' \| 'accent' \| 'info' \| 'success' \| 'warning' \| 'danger' |
| `v-model:expanded` | `string[]` | own | Ids of the expanded nodes. Without a model the tree keeps them itself. A saved view can be put back: open lazy folders load by themselves, level by level; a failed load closes the folder (load-error) |
| `selection` | `'none' \| 'single' \| 'multiple'` | 'single' | Selection mode. none — a click on a folder toggles it |
| `v-model:selected` | `string \| string[] \| null` | own | An id (single) or a list of ids (multiple) |
| `checkable` | `boolean` | false | Checkboxes. A parent is checked, unchecked or mixed by its leaves; a click on a parent toggles the whole branch |
| `v-model:checked` | `string[]` | own | Ids of the checked nodes without children (leaves and folders not loaded yet). A checked lazy folder hands its check to its children once loaded |
| `load` | `(node) => Promise<TaoTreeNode[]>` | — | Loads the children of a node with hasChildren; a spinner and aria-busy meanwhile |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Row height, as for the controls; the density works too |
| `label` | `string` | 'Tree' | Accessible name of the tree |
| `loadingLabel` | `string` | 'Loading…' | The hint of the spinner |
| `menu` | `TaoMenuItem[] \| (node, selected) => TaoMenuItem[]` | — | The context menu of a row: right click, the Menu key, Shift+F10. A right click outside the selection selects the row first (no select event), inside it keeps the selection. An empty list leaves the browser's menu |
| `menuLabel` | `string` | 'Context menu' | Accessible name of the menu |
| `@move` | `(move: TaoTreeMove) => void \| Promise` | — | Turns moving rows on: dragging and Ctrl+X / Ctrl+C / Ctrl+V. move = { ids, parentId, index, targetId, position, copy }; index is the place among the children of parentId once the moved ones are taken out. The tree changes nothing: make the move yourself (moveTreeNodes(nodes, move)); return a promise and the rows wait, a rejected one comes as move-error |
| `sort` | `'none' \| 'name' \| (a, b) => number` | 'none' | The order of the rows. none — the data's, a drag puts a row between others. name — folders first, by name, numbers as numbers («file 2» before «file 10»); a function — your own compare. With a sort a drag only changes the folder: onto a folder puts the rows in it, onto any other row into its folder, no line between rows. nodes is not changed |
| `movable` | `boolean \| (node) => boolean` | true | Which rows can be moved (disabled ones never) |
| `canDrop` | `(move) => boolean` | — | May the rows go there: false shows a «no» cursor and no mark. Into itself and its descendants the tree refuses anyway |

**Slots, events, notes.** #icon, #label, #actions — { node, level, expanded, selected }; the actions show on hover and focus (always on a touch screen). Events: update:expanded / selected / checked, select(node) — a click, Enter, Space without checkboxes; open(node) — a double click or Enter on a node without children (on a branch they open and close it); load-error(node, error) — the node stays closed; menu(node, event) — a menu was asked for on a row (preventDefault — a menu of your own instead of ours and the browser's); menu-select(id, node, selected) — an item of menu; move-error(move, error) — the promise of @move was rejected. Moving by the pointer: the middle of a folder puts the rows inside, between rows there, and below the last row of a folder going left takes them out of it; a closed folder under the pointer opens, the list scrolls at its edge, Ctrl or Alt makes a copy, Esc cancels; a selected row takes the whole selection. The selection of a tree without the focus is grey, with the focus the accent. Keys: ↑ ↓, → opens or goes in, ← closes or goes to the parent, Home / End, * opens the siblings, letters search, Enter selects and acts as a double click, Space checks, Menu / Shift+F10 — the menu, with @move: Ctrl+X / Ctrl+C — cut / copy, Ctrl+V on a folder — to its end, on a row — after it, Esc — forget.

## TaoList

Showcase section: `#list`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Row height 26 / 36 / 44. An Item without its own size takes it from here |
| `bordered` | `boolean` | true | A border around the list |
| `divided` | `boolean` | true | Lines between rows |
| `maxHeight` | `number \| string` | — | Scroll. A number is pixels |
| `empty` | `boolean` | false | Show #empty instead of rows |
| `label` | `string` | '' | The list name |
| `roving` | `boolean` | false | One Tab stop for the whole list: the arrows move between the rows, Home / End to the ends, disabled rows are skipped; Tab comes back to the row it left (the selected one the first time). The stop of a row is its button (clickable) or the row itself |

**Slots, events, notes.** default — TaoListItem. #empty — if empty.

## TaoListItem

Showcase section: `#list`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `title` | `string` | '' | The title. The default slot replaces it |
| `description` | `string` | '' | A caption under the title |
| `tone` | `'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | — | A status colour of the row: the title keeps it when the row is selected (the selection tint stays, the text does not turn accent) |
| `selected` | `boolean` | false | The selected row |
| `disabled` | `boolean` | false | Disabled |
| `active` | `boolean` | false | Highlight without selected |
| `clickable` | `boolean` | false | A button row, fires click |
| `size` | `'small' \| 'medium' \| 'large'` | from the list | Override the list size |
| `actionAlways` | `boolean` | false | #action is always visible, not only on hover |

**Slots, events, notes.** default — the title. #prefix, #description, #suffix, #action (on hover; always on touch).

## TaoTimeline

Showcase section: `#timeline`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoTimelineItem[]` | — | { id, title, time?, datetime?, description?, icon?, tone? }. time is shown, datetime goes to <time datetime> |
| `active` | `string` | — | The id of the current event: the line is filled up to it, the next ones wait, it gets aria-current="step". Without active the feed is a log of the past |
| `align` | `'start' \| 'alternate'` | 'start' | alternate — the events on both sides of the line; below 480px of its own width it folds into start |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The marker and the text on the control scale; the density works too |

**Slots, events, notes.** #marker, #title, #content — { item, index, state, active }; state: done / current / upcoming. A marker tone: success / danger / warning / info / neutral, the accent without one. An <ol>: a screen reader hears the order, the line and the markers are hidden from it.

## TaoStages

Showcase section: `#stages`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoStageItem[]` | [] | { id, label?, status?: wait \| work \| ok \| bad } |
| `direction` | `'row' \| 'column'` | 'column' | column — top to bottom, row — in a row. As in TaoFlex |
| `label` | `string` | 'Stages' | The list name |

**Slots, events, notes.** default / #icon="{ item, index, status }" — replace the step text or icon.

## TaoSkeleton

Showcase section: `#skeleton`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'text' \| 'title' \| 'circle' \| 'rect'` | 'text' | The placeholder shape |
| `lines` | `number` | 1 | How many lines (text) |
| `width / height` | `string` | '' | A CSS size, if it has to be set explicitly |

## TaoCounter

Showcase section: `#counter`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `value` | `number` | 0 | A number on display. Not an input |
| `maxDigits` | `number` | 9 | The minimum width in digits when there is no format (the leading zeros are dimmed); a longer number grows the counter |
| `format` | `string` | — | A mask, as in TaoPinCode: # is a digit, any other character is drawn as it is: "##:##:##" a clock, "#,###,###", "+7 ###", "### ###₽". The mask fixes the number of digits: a number that does not fit shows as all nines, the counter does not grow. A space is a narrow gap. Without format — groups of three with a gap |
| `muteZeros` | `boolean` | true | Dim the zeros that only pad the number on the left (the last digit is never dimmed). Turn it off for a clock: 00:03:30 has no padding |

## TaoCarousel

Showcase section: `#carousel`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | 0 | The index of the current snap |
| `perView` | `number` | 1 | How many slides are in the frame. 5 — a product strip |
| `peek` | `number` | 0 | How many px of the next card are visible on the right (with centered: on both sides) |
| `centered` | `boolean` | false | The current slide in the middle and the biggest, the ones beside it shrink, the outer ones fade and are cut by the edge. perView is how many whole slides are in the frame, a step and the arrows go by one slide, the arrows lie on the edges of the strip. Restyle with --tao-carousel-scale-step (0.09), --tao-carousel-fade (0.55) and --tao-carousel-ring (the ring around an arrow, the page background by default) |
| `autoplay` | `number` | 0 | Time per slide in ms. 0 — off. The current indicator fills over this time and the slide changes when it is full (the clock is a CSS animation). Pauses on hover / keyboard focus / touch and drag / a hidden tab; off with prefers-reduced-motion |
| `loop` | `boolean` | false | Loop round in a circle. With centered: a seamless cycle with no end, the empty places at the ends are taken by the slides from the other end, the slides are drawn 3 times (the extra copies are inert and aria-hidden, a slide needs no id or ref); whenever the strip stops in a copy it goes back to the real set unseen |
| `indicator` | `'dots' \| 'bars' \| 'progress'` | — | Marks under the strip: dots (the current one stretches into a pill) / equal bars / one bar (the fill of the slide, the position without autoplay) |
| `pausable` | `boolean` | true | With autoplay: a button that stops and resumes it (autoplay that moves for more than 5 seconds must be stoppable) |
| `pauseLabel / playLabel` | `string` | 'Pause autoplay' / 'Start autoplay' | aria-label of the button |
| `controls` | `boolean` | true | Arrows. false hides both |

**Slots, events, notes.** default — slides. #prev / #next="{ go, disabled }" — custom buttons. #prev-icon / #next-icon — the icon only. #dots="{ index, count, go }" — your own indicator as a whole (an invisible fill then keeps the time), #dot — your own mark.

## TaoContainer

Showcase section: `#container`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `width` | `'wide' \| 'slim' \| 'ultra-slim'` | 'wide' | max-width: 1120 / 500 / 400 |
| `free` | `boolean` | false | No horizontal auto-centring |

**Slots, events, notes.** default — the content.

## TaoFlex

Showcase section: `#flex`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `justify` | `flex justify-content` | 'flex-start' | flex-start, center, space-between, space-around, space-evenly, flex-end, normal |
| `align` | `flex align-items` | 'stretch' | stretch, flex-start, center, flex-end, baseline |
| `direction` | `flex-direction` | 'row' | row, column and reverse |
| `wrap` | `flex-wrap` | 'nowrap' | nowrap, wrap, wrap-reverse |
| `gap` | `number \| string` | '0px' | The gap. A number is px, a string is CSS |
| `tag` | `string` | 'div' | Which HTML tag to render |

## TaoSpace

Showcase section: `#flex`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `direction` | `'row' \| 'column'` | 'row' | As in TaoFlex |
| `block` | `boolean` | false | display: flex without wrap |
| `expand` | `boolean` | false | 100% width |

**Slots, events, notes.** default — children with an even gap.

## TaoGrid

Showcase section: `#grid`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `min` | `string` | '220px' | The minimum tile width (auto-fill). A catalogue. Ignored with cols |
| `cols` | `number \| { compact, medium, expanded }` | 0 | Fixed columns (bento). A number: one column on compact, the number from medium on. An object: per width class of the grid itself (compact < 600px, medium < 840px, expanded), a missing class takes the smaller one. 0 — the min mode |
| `gap` | `number \| string` | token space-4 | The gap between cells. A number is px, a string is CSS |
| `rowHeight` | `number \| string` | — | The height of every row, as a mosaic wants: the grid keeps its proportions, a picture in a tile is cropped. Without it the rows follow the content |

**Slots, events, notes.** default — cards or TaoGridItem. Not masonry: the row follows the tallest. The width classes follow the width of the grid, not of the window (inside a TaoSplit pane too).

## TaoGridItem

Showcase section: `#grid`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `col` | `number \| 'full' \| { compact, medium, expanded }` | 1 | How many columns to take; 'full' is the whole row. Never more than there are. For cols, not for min |
| `row` | `number \| { compact, medium, expanded }` | 1 | How many rows to take. A number: 1 on compact, the number from medium on |
| `order` | `number \| { compact, medium, expanded }` | 0 | The place in the flow: { compact: 9 } sends a side block to the end on a phone |

**Slots, events, notes.** default — a tile. In a catalogue it can go without the wrapper.

## TaoDivider

Showcase section: `#divider`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'solid' \| 'dashed' \| 'colored' \| 'gap'` | 'solid' | solid — a regular border, dashed — dashes, colored — accent, gap — a gap |
| `text` | `string` | '' | An optional caption in the middle. Works with any variant |
| `fade` | `boolean` | false | Soft line edges. Does not affect gap |
| `size` | `'small' \| 'medium' \| 'large'` | 'medium' | For gap only — the height of the gap. Not inherited. |

**Slots, events, notes.** default — the same as text. If there is a slot, it wins over the prop.

## TaoSplit

Showcase section: `#split`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `number` | 50 | The size of the start pane in unit |
| `direction` | `'row' \| 'column'` | 'row' | As in Flex |
| `collapsed` | `'start' \| 'end' \| false` | false | Closes one pane: it is not drawn, the other fills the box, the divider goes with it (no separator, no line, no gutter). The size stays in v-model, so the pane opens as it was |
| `unit` | `'%' \| 'px'` | '%' | Percent or pixels |
| `min / max` | `number` | 0 / — | The bounds of the start pane |
| `minEnd` | `number` | 0 | The minimum of the second pane |
| `resizable` | `boolean` | true | false — the bar is there, but cannot be dragged |
| `step` | `number` | 1% or 8px | The arrow step when the bar is focused |
| `@commit` | `value` | — | Finished dragging or an arrow was pressed. v-model fires on every move |

**Slots, events, notes.** #start and #end — the two panes. Three columns = two nested splits.

## TaoWorkbench

Showcase section: `#workbench`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `leftTools / rightTools / bottomTools` | `TaoWorkbenchTool[]` | [] | { id, label, icon?, shortcut?, badge?, badgeLabel?, disabled?, separator? }. The buttons of a rail: each has a hint (with its key), a press opens or closes a panel. The bottom tools stand in the bottom bar |
| `v-model:left / right / bottom` | `string \| null` | null | The id of the tool whose panel is open. A press on the open one closes it, on another opens that one. null: no panel (it is not drawn, and the divider is gone) |
| `v-model:leftSize / rightSize / bottomSize` | `number` | 280 / 280 / 220 | The width of the left and the right panel and the height of the bottom one, px. Save them yourself if you want (localStorage) |
| `panelMin / centerMin` | `number` | 160 / 240 | The least size of a panel and what the workspace is squeezed to, px |
| `glow` | `boolean` | true | The glow in the top left corner, the colour of the palette (the token --tao-workbench-glow, --tao-glow by default). false: a plain background |
| `topLabel / leftLabel / rightLabel / bottomLabel / mainLabel / skipLabel / closePanelLabel` | `string` | from the locale | The names of the regions for a screen reader, the skip link and the label of the close button of a panel (with {name}) |

**Slots, events, notes.** default — the workspace. The bars: #top-start / #top-end, #left-start / #left-end, #right-start / #right-end, #bottom-start / #bottom-end (start is the first end, end the other; a rail puts its tools before start). #left-panel, #right-panel, #bottom-panel ({ tool }) — the content of the open tool; #panel-actions ({ tool, side }) — beside the title of a panel. The `commit` event (the name of the size: leftSize / rightSize / bottomSize, and its value): the size is chosen, the gesture is over, the moment to write the layout to storage. Regions: header, nav on the left and the right, main, footer; F6 / Shift+F6 go round them, and the first tab stop is a link to the workspace.

## TaoShell

Showcase section: `#shell`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | — | The id of the current section |
| `items` | `TaoNavItem[]` | — | The sections. Required |
| `projects` | `{ id, title }[]` | — | The projects of the app: a chip under the action with a menu. Without them no chip |
| `v-model:project` | `string` | the first project | The id of the current project |
| `action` | `{ label, icon?, shortcut? }` | — | The main action of the screen; the action event |
| `languages` | `string[] \| { code, label? }[]` | — | The languages of the switch. Without them no switch |
| `prefs` | `TaoKitPrefs` | — | The preferences of the product (createKitPrefs): the theme and the language bind to them |
| `v-model:layout` | `'auto' \| 'bar' \| 'rail' \| 'drawer'` | 'auto' | The look of the navigation, as on TaoNav |
| `v-model:look` | `'bar' \| 'rail' \| 'drawer'` | — | The look the navigation has now, to read |
| `label` | `string` | Navigation | The accessible name of the navigation |
| `badgeTone` | `'accent' \| 'neutral'` | 'neutral' | The colour of the counters |

**Slots, events, notes.** default — the page. tools — your own tools instead of the language and the theme (in the footer of the panel and in the header on a phone). Events: action, new-project.

## TaoProp

Showcase section: `#prop`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | The caption on the left. It names the control for a screen reader. Required |
| `hint` | `string` | — | A quiet line under the control |
| `error` | `string` | — | The message under the control; with it the control is invalid |
| `labelWidth` | `number \| string` | '7.5rem' | The width of the caption column: a number is px, a string any CSS length. For all rows at once: the variable --tao-prop-label-width |
| `size` | `'small' \| 'medium' \| 'large'` | of ancestors | Size of the control inside |

**Slots, events, notes.** default — the control, or several in a row (x y w h). #caption — the caption itself instead of label (an icon, a mark); the name for a screen reader stays label. A long caption is cut with an ellipsis, the whole text is in the title: the rows of an inspector keep one height.

## TaoFieldset

Showcase section: `#fieldset`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `legend` | `string` | '' | A caption on the top frame |
| `align` | `'start' \| 'center' \| 'end'` | 'start' | Where to shift the legend |

**Slots, events, notes.** default — the fields. #legend — if the caption is not a string.

## TaoAnimatedBorder

Showcase section: `#animated-border`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'rainbow' \| 'tone'` | 'rainbow' | What the border is made of: the rainbow or the colours of a tone |
| `tone` | `TaoToneName` | 'accent' | The tone for variant="tone"; the theme accent without it |
| `colors` | `string[]` | — | Your own colours (any CSS colour), they win over variant |
| `radius` | `number \| string \| (…)[]` | var(--tao-radius-panel) | Corner radius of the content; the border outside is that plus its width. An array or a string of 1 to 4 lengths gives the corners one by one, as on TaoCard |
| `square` | `string \| string[]` | — | Sharp corners with the radius kept as it is (the token of the theme, radius, the --tao-radius of your class): a side (top, bottom, left, right), a corner (top-left, top-right, bottom-right, bottom-left), several as an array or a string with spaces. Wins over radius, leaves the other corners alone. The border outside a sharp corner is sharp too |
| `borderWidth` | `number` | 3 | The outline thickness in px |
| `speed` | `number` | 6 | The duration of one turn in seconds |
| `light` | `boolean` | false | A soft glow around the frame |
| `glow` | `number` | 16 | The glow radius in px. Makes sense with light |

**Slots, events, notes.** default — the content inside the frame. With prefers-reduced-motion the gradient stands still.

## TaoModal

Showcase section: `#modal`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | — | Open. Required |
| `title` | `string` | '' | The title in the header |
| `closable` | `boolean` | true | The cross, Esc, a click on the backdrop. The close(reason) event: button \| escape \| outside (a drawer also swipe) |
| `closeLabel` | `string` | 'Close' | aria-label of the cross |
| `fullscreen` | `boolean \| 'narrow'` | false | true — the whole screen: square corners, the header and the footer stay while the content scrolls, the safe areas kept. narrow — only on a screen narrower than 600px: a dialog on a computer, a page on a phone |
| `surface` | `'flat' \| 'grain' \| 'glass'` | 'flat' | What the panel is made of, as on TaoCard. class, style and the other attributes go to the panel; the content scrolls, the header and #footer stay. --tao-modal-bg is the panel colour for a bar of your own that sticks inside |

**Slots, events, notes.** default — the body. #footer — buttons. #close-icon — the cross icon.

## TaoDrawer

Showcase section: `#drawer`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | — | Open. Required |
| `title` | `string` | '' | The title |
| `side` | `'left' \| 'right' \| 'bottom'` | 'right' | Where it slides in from. bottom is a sheet: as wide as the screen up to 640px, as tall as its content up to 90% of the screen, rounded top, a grip, above the safe area |
| `closable` | `boolean` | true | The user can close it: Esc, the backdrop, the cross, the pull-down of a sheet. false — only the parent closes it |
| `showClose` | `boolean` | true | The cross in the header. false hides only the cross: Esc, the backdrop and the pull-down still close it |
| `swipeToClose` | `boolean` | true | side="bottom" only: the sheet is pulled down by its grip and header; it closes when pulled half of its height (swipeThreshold) or flung, and comes back otherwise. It does not start from a button or a field in the header, so the content still scrolls. Needs closable |
| `swipeThreshold` | `number` | 0.5 | side="bottom" only: how far, as a share of its height (0.05–1), the sheet must be pulled to close. A touch that only grazes it does not close it; a fast fling needs 15% of the height at least |
| `closeLabel` | `string` | 'Close' | aria-label of the cross |
| `surface` | `'flat' \| 'grain' \| 'glass'` | 'flat' | What the panel is made of, as on TaoCard. class, style and the other attributes go to the panel; --tao-drawer-bg is its colour |

**Slots, events, notes.** default — the body. #footer — buttons or an input line pinned to the bottom. #close-icon — the cross icon. #header="{ close }" — the whole header instead of the title and the cross (a title with a counter, a filter, a cross of your own); name it for a screen reader with aria-label on the panel.

## confirm()

Showcase section: `#confirm`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `confirm(options)` | `({ title?, message?, ok?, cancel?, tone?, surface? }) => Promise<boolean>` |  | One object, asks at once. true — ok, false — cancel / Esc / backdrop / nothing to ask (a title or a message is needed) |
| `confirm(title, options?)` | `(string, options?) => Promise<boolean>` |  | A short call with a title |
| `title / message` | `string` |  | The title and text |
| `ok / cancel` | `string` |  | Button captions |
| `tone` | `'accent' \| 'danger'` | 'accent' | danger — a red confirm button (a deletion) |
| `confirm.defaults` | `({ ok, cancel, surface })` |  | Default captions for the whole app |
| `confirm.dismiss()` | `() => void` |  | Closes the open question with false |

## TaoTooltip

Showcase section: `#tooltip`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `content` | `string` | — | The hint text. Required |
| `placement` | `TaoPlacement` | 'top' | Side and alignment: top / bottom / left / right and -start / -end. Flips at the screen edge |
| `shortcut` | `string` | — | The key that does the same: a key cap after the text (`T`, `Ctrl+K`) |
| `variant` | `'inverse' \| 'raised'` | 'inverse' | inverse: the opposite of the theme (Material 3, shadcn/ui, Atlassian); raised: a panel of the theme itself with a thin frame, as the hovers of VS Code, JetBrains and Windows: for an IDE-like surface (the hints of TaoWorkbench) |
| `bold` | `boolean` | true | The text in semi-bold (600): a hint is small and short. `false` is the regular weight; the token `--tao-tooltip-weight` sets the weight |
| `animated` | `boolean \| number` | off | The fade-in: a number is a share of the base duration (`0` off, `1` the base time, `2` twice as long, `0.5` half), `true` is `1`. Without the prop the token `--tao-tooltip-motion` decides |

**Slots, events, notes.** default — the trigger (a button, an icon…). Colours: `--tao-tooltip-bg` and `--tao-tooltip-text`, by default the opposite of the theme, for all hints at once (TaoCopy, TaoHeatmap, taoChartTheme). A hint of your own wears the class `tao-tip` and sets no background: `surface-raised` is the colour of the panels it hangs over.

## TaoKbd

Showcase section: `#kbd`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'cap' \| 'plain'` | 'cap' | Look: `cap` a key cap (a quiet fill of the text colour), `plain` the key as muted text with no cap, for a column of keys in a menu or a list |

**Slots, events, notes.** default — the key: `T`, `Ctrl+K`, `⌘`. One look for a button (`shortcut`), a tooltip (`shortcut`), a menu and a command list.

## TaoPopover

Showcase section: `#popover`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | uncontrolled | Open state. Without v-model it holds its own |
| `placement` | `TaoPlacement` | 'bottom-start' | Side and alignment of the panel: top / bottom / left / right and -start / -end. Flips at the edge |
| `disabled` | `boolean` | false | Does not open |
| `anchor` | `HTMLElement \| { x, y, width?, height? } \| null` | null | A virtual anchor instead of the trigger: a point of the screen (viewport coordinates) or another element. A point stays put, Esc gives the focus back to what had it before opening |

**Slots, events, notes.** #trigger — the button. default — the panel content. Not a tooltip and not an action menu.

## TaoDropdownMenu

Showcase section: `#dropdown`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoMenuItem[]` | [] | Entries: plain { id, label, icon?, shortcut?, disabled?, items? }, checkboxes { type: "checkbox", checked }, radios { type: "radio", group, checked }, { type: "label" }, { type: "separator" }. items inside an entry is a submenu |
| `placement` | `TaoPlacement` | 'bottom-end' | Where the list opens. Flips at the screen edge |
| `menuLabel` | `string` | 'Menu' | aria-label of the button and of the menu |
| `closeOnScroll` | `boolean` | false | Close when the page scrolls. Off: the menu follows its button |
| `size` | `'small' \| 'medium' \| 'large'` | — | The button becomes a square of that control height: a compact kebab for a list row. Without it — the padding round the icon |
| `dots` | `'vertical' \| 'horizontal'` | 'vertical' | The three dots of the button: upright ⋮ (a narrow column, a toolbar) or lying ⋯ (a row of a table or a list, the corner of a card). Ignored when #icon or #button is given |
| `tabbable` | `boolean` | true | The button is a Tab stop. Off: it leaves the Tab order (the row has its own menu key) and still opens by a click |
| `block` | `boolean` | false | The button fills the width and the height of its place and draws nothing of its own (no padding, no background, the corners of its parent): for a trigger that is a whole chip of yours in #button, the project under the main action of TaoNav, an account in a header. The hover and the focus ring go round the chip, the ring inside, so a clipping box does not cut it |

**Slots, events, notes.** #icon — the trigger icon, #button — the whole button content, #item="{ item, id, label, icon }" — your own item face. The select event — the whole item (item.id is its id). shortcut is a ready string to show: the menu neither parses nor listens to it.

## TaoMenu

Showcase section: `#dropdown`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoMenuItem[]` |  | The same entries |
| `open` | `boolean` |  | Whether it is open. The owner closes it on the close event |
| `anchor` | `HTMLElement \| { x, y, width?, height? } \| null` |  | What the panel hangs from: an element, or a point of the screen in viewport coordinates (a menu at the pointer, no anchor element). A point follows nothing: the panel is fixed, flips and shifts at the edges, and on close the focus goes back to where it was before opening. Change the point and the menu moves; an element can be swapped for a point and back |
| `placement` | `TaoPlacement` | 'bottom-end'; 'bottom-start' at a point | Side and alignment. At a point the default puts the top-left corner at it, 4px below (the point is not covered by the first item) |
| `closeOnScroll` | `boolean` | false | Close when the page or a scroll container that holds the anchor scrolls (for a point, the element under it); a scroll elsewhere (a carousel) does not close it. Off: a panel on an element follows it, a panel at a point stays at its screen point |
| `label` | `string` | — | Accessible name of the menu |

**Slots, events, notes.** Event select — the whole item (item.id is its id), close(reason) — the menu asks to be closed (escape / select / outside / tab). The panel for your own shells: a button, a context menu, a menu bar.

## TaoToolbar

Showcase section: `#toolbar`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | Accessible name of the bar: Formatting, Tools |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The size of the controls inside |
| `orientation` | `'horizontal' \| 'vertical'` | 'horizontal' | Which arrows walk it (← → or ↑ ↓); the separators lie across |
| `variant` | `'panel' \| 'plain'` | 'panel' | panel — a raised bar of its own with concentric corners; plain — only the layout, for a toolbar inside a header |
| `bordered` | `boolean` | by context | The frame of a panel. Not set, it follows the frames context; false: no frame, the raised fill stays |
| `overflow` | `boolean` | false | One row, never wrapped: the groups that do not fit go, the last one first, under a «⋮» button that opens them in a panel. Horizontal bars only. Off: the items wrap onto a new line |
| `overflowLabel` | `string` | from the locale | Name of the «⋮» button for a screen reader (default «More») |

**Slots, events, notes.** default — any controls: TaoButton (toggles with v-model:pressed), TaoSegmented, a select, TaoToolbarGroup, TaoToolbarSeparator. Keys: the bar is one Tab stop and remembers the last item; ← → (↑ ↓ when vertical) walk it and wrap, Home / End go to the ends, disabled items are skipped. Inside a radio group (TaoSegmented) the arrows pick the option and go on from its edge; a text field keeps its arrows. Without overflow the items wrap onto a new line on a narrow screen. With overflow only whole TaoToolbarGroup go (the separator before a group goes with it); loose items and groups with pinned stay. A group that went keeps the width it had in the row, and is measured again only when it is back in it. The method reveal(el) (through a ref) makes an element visible: if it is in a group that went, it opens the menu and returns the same element, so a list can be anchored to it. A press on an element with data-tao-keep-open does not close the menu (for your own panels, not TaoUI ones).

## TaoToolbarGroup

Showcase section: `#toolbar`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — | Accessible name of the group: Text style, Alignment |
| `inset` | `boolean` | false | A sunken pill behind the group: its buttons read as one set |
| `pinned` | `boolean` | false | In a bar with overflow: the group never goes under «⋮» (undo and redo, the main action) |

**Slots, events, notes.** default — the tools of one kind. role="group". In a bar with overflow the attributes (class, style, data-*) land on the group itself, not on its host.

## TaoToolbarSeparator

Showcase section: `#toolbar`

**Slots, events, notes.** A thin line between the groups, across the bar: vertical in a horizontal toolbar. role="separator".

## TaoMenubar

Showcase section: `#menubar`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoMenuItem[]` | — | The top entries: { id, label, items } is a menu, { id, label } a plain action. Inside a menu, everything TaoMenu can do (submenus, checkboxes, radios, shortcuts). Separators and labels at the top level are ignored |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The height of the bar, as for the controls |
| `label` | `string` | 'Menu bar' | Accessible name of the bar |
| `closeOnScroll` | `boolean` | false | Close an open menu when the page scrolls. Off: it follows its entry |
| `bordered` | `boolean` | by context | The outer frame. Not set, it follows the frames context; false: no frame, the raised fill stays |
| `flat` | `boolean` | false | No fill, no frame, no padding of its own: the bar sits on the surface it is put on (the top bar of an editor, a header), only the entries are drawn |

**Slots, events, notes.** The select event — the picked item (item.id is its id) item (in a menu or a plain top entry). #item — your own item face in the menus. #end — after the menus, at the far end of the bar (a theme toggle, a search): outside of the menubar role. Keys: Tab enters the bar, ← → walk it, Home / End, ↓ / Enter / Space open, with a menu open ← → move to the neighbour menu, Esc closes and gives the focus back. No folding of entries into “…” on a narrow bar yet.

## TaoContextMenu

Showcase section: `#menubar`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoMenuItem[]` | — | The entries, as in TaoMenu |
| `disabled` | `boolean` | false | Leave the browser menu alone |
| `menuLabel` | `string` | 'Context menu' | Accessible name of the menu |
| `closeOnScroll` | `boolean` | true | Close when the page or a scroll container with the point of the menu scrolls (the point moves away from under the menu); a scroll elsewhere does not close it. false keeps it at the screen point. Scrolling inside the menu never closes it |

**Slots, events, notes.** default — the area where the right click (or the Menu key / Shift+F10) opens the menu; the wrapper does not take part in the layout (display: contents). #item — your own item face. Events select — the whole item (item.id is its id), open({ x, y }) — where it opened. On iOS a long press sends no contextmenu: give it a button there.

## TaoSpoiler

Showcase section: `#spoiler`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `boolean` | uncontrolled | Open / closed. Without a model the panel keeps its own state (closed at first) |
| `title` | `string` | '' | The button title |
| `name` | `string \| number` | — | The panel key inside TaoSpoilerGroup |
| `bordered` | `boolean` | by context | The outer frame. Not set, it follows the frames context; false: the header fill holds the panel |

**Slots, events, notes.** default — the body. Neighbours do not close each other.

## TaoSpoilerGroup

Showcase section: `#spoiler`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string \| number \| null` | uncontrolled | The key of the open panel. null — all closed. Without a model the group remembers the key itself |

**Slots, events, notes.** default — a set of TaoSpoiler with name.

## TaoNav

Showcase section: `#tao-nav`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `TaoNavItem[]` | — | { id, label, icon?, href?, badge?, disabled? }. With href the item is an <a> link, without it a button. badge: a number or a string is a count, badgeLabel is what a screen reader says about it («3 unread», «not saved»; a dot is heard as nothing without it), true a dot |
| `v-model` | `string` | — | The id of the current section: aria-current="page" and the active look |
| `v-model:look` | `'bar' \| 'rail' \| 'drawer'` | — | Read-only: the look the navigation is in now (by its own width: under 600px bar, under 840px rail, else drawer). For code that must know the look (navCompact(look)); CSS still draws it |
| `v-model:layout` | `'auto' \| 'bar' \| 'rail' \| 'drawer'` | 'auto' | bar — a bottom bar, rail — a rail with icons, drawer — a side panel with labels. auto — by the width of TaoNav itself: bar below 600px, rail below 840px, drawer from 840px (container queries, no JS) |
| `maxBarItems` | `number` | 5 | How many fit the bar. With more items maxBarItems − 1 stay, the rest go into «More» with a menu |
| `label` | `string` | 'Navigation' | Accessible name of the navigation |
| `moreLabel` | `string` | 'More' | The label of «More» |
| `indicator` | `'pill' \| 'line'` | 'pill' | How the current section is marked: a tint behind the item, or the accent colour and a short line (under the item in the bar, along its start edge on the side; auto moves it) |
| `floating` | `boolean` | false | In the bar look, a detached pill above the page: inset from the edges and above the safe area, round, with a shadow; the active item is a pill too. The rail and the side panel do not change. The main action of the screen goes beside it as your own round button, not into the bar |
| `fill` | `boolean` | false | The shell of an app: TaoNav takes the height of its parent (give it one: html, body, #app { height: 100% }), the page scrolls inside .tao-nav__content or its own panes instead of the document, and the footer stands at the bottom of the side panel. No page scrollbar comes and goes, nothing shifts. A ready shell is in the Guide, «Starters» |
| `badgeTone` | `'accent' \| 'neutral'` | 'accent' | The counters: accent on every item, or neutral — grey, the accent on the current item only. A dot (badge: true) stays the accent |
| `surface` | `'flat' \| 'glass' \| 'grain'` | 'flat' | What the panel is made of, as on TaoCard: glass lets the page show blurred through the bar as it scrolls under it (solid where blur is not supported or less transparency is asked) |

**Slots, events, notes.** default — the page: TaoNav lays it out next to the navigation (the bar sticks to the bottom, on the side the list sticks to the top; env(safe-area-inset-bottom) is kept). Without the slot it is a standalone panel with a border. #label — your own item label ({ item, active }). Structure: .tao-nav is the whole layout (the navigation and the page), .tao-nav__panel the navigation, .tao-nav__content the page; a style for the menu goes on the panel (or use surface), not on the root. #footer — a small line under the items in the rail and the side panel (the version, «About», a link); the bar does not show it. #action — the main action of the screen: a TaoButton with icon and its text in <span class="tao-nav__action-label">; the bar puts it round above itself at the end side (above the pill with floating), the rail round at the top, the side panel extended with the text at the top; in the round looks the text is hidden but stays the name of the button (a shortcut on it too). Several children of #action stand one under the other (the action, then a project chip). --tao-nav-compact is 1 on the bar and the rail and 0 on the side panel, for your own pieces in the slots. The side panel gives the button its own corners; --tao-nav-action-radius: var(--tao-radius-full) makes it a pill. --tao-nav-rail-width (80px) and --tao-nav-drawer-width (240px) set the widths. Events: update:modelValue, select(item, event) — event.preventDefault() keeps a link from navigating, to route it yourself.

## TaoTabs

Showcase section: `#tabs`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `v-model` | `string` | — | value of the active tab. Required |
| `items` | `TaoTabItem[]` | — | { id, label, disabled? } — like Select items |
| `justify` | `TaoJustify` | — | Where the tabs sit in the row, as in TaoFlex: flex-start, center, flex-end, space-between, space-around, space-evenly. Without it, at the left |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | The tab height as TaoButton (26 / 36 / 44). Without it — the size of the ancestors |

**Slots, events, notes.** default="{ activeTab }" — the content of the active panel.

## TaoBreadcrumb

Showcase section: `#breadcrumb`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ label, to? }[]` | — | The crumbs. The last one is the current page, without a link. Required |
| `label` | `string` | 'Breadcrumb' | The navigation name |

## TaoLink

Showcase section: `#link`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `to` | `string \| object` | — | The address. NuxtLink → RouterLink → <a> |
| `newTab` | `boolean` | false | target=_blank + rel=noopener |
| `private` | `boolean` | false | rel=noopener noreferrer |
| `exactPath` | `boolean` | false | An exact path match for active (vue-router) |
| `underline` | `'always' \| 'hover' \| 'none'` | 'always' | Underline. always: in a line of text a link does not rest on colour alone (in the light theme it is the text colour). hover: the line only under the pointer and the focus, for a link that is clear from its place (a menu, a card title). none: no line |

**Slots, events, notes.** default — the link text. Class tao-link (and tao-link--hover / tao-link--none).

## TaoStretchedLink

Showcase section: `#stretched-link`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `to` | `string \| object` | — | The address, as in TaoLink |
| `newTab` | `boolean` | false | target=_blank + rel=noopener |
| `private` | `boolean` | false | rel=noopener noreferrer |
| `exactPath` | `boolean` | false | An exact path match for active (vue-router) |
| `underline` | `'always' \| 'hover' \| 'none'` | 'none' | As in TaoLink; the card is the sign of a link here, so no line by default |

**Slots, events, notes.** default — the link text. Classes: tao-stretched on the container (position: relative), tao-stretched-raise on the controls that must stay clickable by themselves; --tao-stretched-radius is the corner of the focus ring. Never give the link filter, transform, perspective, will-change: transform or contain (on :hover too): the cursor flickers.

## TaoScrollTop

Showcase section: `#scrolltop`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'solid' \| 'ghost' \| 'text'` | 'solid' | The look: a filled circle, a light circle or a caption with an arrow |
| `side` | `'left' \| 'right'` | 'right' | Which edge of the page the button sits on |
| `offset` | `number \| string` | 24 | The offset from that edge (older name: right) |
| `label` | `string` | — | The caption: on mouse hover (not touch) for solid / ghost, always visible for text (the locale text by default); an empty string hides it |
| `labelSide` | `'left' \| 'right'` | — | Which side the caption goes; opposite to side by default |
| `boundary` | `number` | 300 | The threshold in px: it appears on a reverse scroll after it |
| `size` | `number` | 40 | The button size in px |
| `bottom` | `number \| string` | 24 | The offset from the bottom edge |
| `zIndex` | `number` | 1000 | The layer |
| `outline` | `boolean` | true | The focus outline |

## toast()

Showcase section: `#toast`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `toast(options)` | `({ message?, title?, type?, ... }) => { id, dismiss() }` |  | One object, shown at once. A message or a title is needed. Gives back a handle: id (the given one or its own) and dismiss() |
| `toast.success(msg, options?)` | `(string, options?) => handle` |  | A short call with a type. Also danger / warning / info / show (neutral) |
| `type` | `'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | 'info' | The type; it sets how long the toast lives (danger the longest). Without type the time comes from toast.defaults |
| `title / message` | `string` |  | The title and text |
| `timeout` | `number` | by type | Time in ms; 0 — does not close itself |
| `position` | `'topRight' \| 'topLeft' \| 'topCenter' \| 'bottomRight' \| 'bottomLeft' \| 'bottomCenter' \| 'center'` | from defaults | Where the toast stands |
| `actions` | `{ label, onClick }[]` | [] | Buttons in the toast; with no title there is no cross unless closable is asked |
| `icon / closable / progress / surface` | `` |  | The icon, the cross, the time bar, the surface (glass \| flat) |
| `loading` | `boolean` | false | Work in progress: a spinner, no timeout, aria-busy. Finish it with a toast of the same id and replace: it takes its place |
| `id / replace / once` | `string / boolean / boolean` |  | id names the toast; replace swaps the toast with that id where it stands and restarts its time; once does not show a second one |
| `onClosed` | `() => void` |  | The toast closed |
| `toast.promise(p, texts)` | `(Promise, { loading, success, error }) => Promise` |  | Loading while the promise runs, then success or error in the same place; success / error can be functions of the result / the error |
| `toast.dismiss(id?)` | `(string?) => void` |  | Closes the toast with that id, or all of them |
| `toast.defaults` | `(partial) => toast` |  | Position, timeout, closeLabel for the whole app |

## TaoAlert

Showcase section: `#alert`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | 'info' | The status colour, as TaoButton |
| `title` | `string` | '' | The title. Can be omitted |
| `closable` | `boolean` | false | The cross. It does not unmount itself — it fires close |
| `closeLabel` | `string` | 'Close' | aria-label of the cross |
| `collapsible` | `boolean` | false | The body folds under the title (the title is the toggle, aria-expanded); the tone stays. Folded text stays in the DOM, find-in-page opens it |
| `v-model:collapsed` | `boolean` | own | Folded or not; v-model:collapsed="true" starts folded. Better open for an error |
| `detailsLabel` | `string` | 'Details' | The toggle text when there is no title |
| `bordered` | `boolean` | by context | The frame. Not set, it follows the frames context (.tao-frames-soft); false: no frame, a stronger tint of the tone; true: the frame stays |

**Slots, events, notes.** default — the text. #close-icon. v-if + @close — to hide it.

## TaoTag

Showcase section: `#tag`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `tone` | `'neutral' \| 'success' \| 'danger' \| 'warning' \| 'info' \| ''` | '' | The status colour, as TaoButton |
| `flat` | `boolean` | false | No border, the fill stays |
| `square` | `boolean` | auto | A square of the tag height with no side padding: for an icon alone. On by itself when there is a #prefix and no text; set it for an icon in the default slot. Needs aria-label |
| `size` | `'small' \| 'medium' \| 'large'` | inherited | Height 18 / 20 / 24. Without it — the size of the ancestors |
| `closable` | `boolean` | false | The cross. Fires close, does not touch the array itself |
| `clickable` | `boolean` | false | A pointer cursor (a clickable chip), as TaoListItem / TaoTable |
| `color / background / borderColor` | `string` | — | Override the tokens by hand |

**Slots, events, notes.** default — the text. #prefix — an avatar or an icon on the left.

## TaoLoader

Showcase section: `#loader`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'dots' \| 'ring' \| 'pulse' \| 'diamonds'` | 'dots' | The look: four dots / a ring with a turning arc / ripples from a core / four diamonds on two axes that flow into each other: a hollow one crosses to a filled one and takes it in, and a new filled one grows where it stood |
| `size` | `number \| string` | 80 for dots, 40 for the others | The size. A number is px, "40px" works, or small / medium / large (24 / 40 / 64) |
| `tone` | `'accent' \| 'success' \| 'danger' \| 'warning' \| 'info' \| 'neutral'` | 'accent' | A colour role of the theme |
| `color` | `string` | — | A CSS colour of your own, wins over tone; currentColor takes the text colour around it |
| `inline` | `boolean` | false | Inline, without block centring |
| `label` | `string` | 'Loading' | What a screen reader says (the text of the locale by default) |
| `decorative` | `boolean` | false | A picture only: hidden from a screen reader (the wait is said elsewhere; a button with loading says it itself) |

**Slots, events, notes.** Under «reduce motion» nothing travels or turns: the loader only breathes.

## TaoImage

Showcase section: `#image`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | '' | The image address |
| `alt` | `string` | '' | The alternative text |
| `lazy` | `boolean` | false | The native loading="lazy" |
| `pixelated` | `boolean` | false | image-rendering: pixelated |
| `placeholderText` | `string` | 'No image available' | The text if src is empty or fails |

## TaoAvatar

Showcase section: `#avatar`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `src` | `string` | '' | A photo. If empty — initials from name |
| `name` | `string` | '' | For the initials and alt |
| `size` | `'small' \| 'medium' \| 'large'` | 'medium' | 24 / 32 / 48px. Content, does not inherit the size of ancestors. |
| `dot` | `boolean \| tone` | false | The status dot. true = success |
| `count` | `number \| string` | — | A badge. 0 and empty are not drawn, >99 → 99+ |

## TaoIcon

Showcase section: `#icon`

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | tao-… is a built-in SVG; a name from registerTaoIcons; any other name is the class icon-{name} of your font. Required |
| `size` | `number` | — | Pixels. Without it an SVG icon is 1em (follows the font size) |
| `margin` | `string` | '0px' | The outer margin |
| `invert` | `boolean` | false | Invert the colour |

**Slots, events, notes.** #prefix / #postfix — next to the icon. registerTaoIcons({ name: { body, viewBox? } }) adds your own SVGs; the prefix tao- is reserved.
