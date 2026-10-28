// English prop tables. Same shape as propTables.js (the Russian source), keyed by section id.
// A section that is missing here falls back to the Russian table. Names, types and
// defaults must match propTables.js; only titles, notes, slots and Russian default text
// are translated. tests/showcase.propTables.test.ts keeps the two files in step.
//
// Editing a section: change the Russian one in propTables.js first, then mirror it here.

const r = (name, type, def, note) => ({ name, type, default: def, note })

export const propTablesEn = {
  block: [
    {
      title: 'TaoBlock',
      rows: [
        r('padding', 'number | string | (…)[]', '16', 'Inner padding. A number is px, a string is any CSS length. An array works like CSS padding (1–4 values)'),
        r('radius', 'number | string', '8', 'Corner radius. A number is px, a string is CSS'),
        r('shadow', 'boolean', 'true', 'Panel shadow'),
        r('hover', 'boolean', 'false', 'Stronger shadow on hover, pointer cursor'),
        r('surface', "'flat' | 'grain' | 'glass'", "'flat'", 'What the block is made of: fill / grain / glass. See “Surfaces”'),
        r('stripe', "'top' | 'left' | 'bottom'", '—', 'A coloured stripe on one side; the corners clip it (over a picture in #media too)'),
        r('stripeTone', "tone | 'gradient'", "'accent'", 'The stripe colour: accent, success / danger / warning / info / neutral, or the palette gradient. Say a status in the text as well'),
      ],
      slots: 'default — the block content.',
    },
  ],
  button: [
    {
      title: 'TaoButton',
      rows: [
        r('type', "'button' | 'submit' | 'reset'", "'button'", 'The native button type'),
        r('variant', "'primary' | 'secondary' | 'ghost' | 'text'", "'primary'", 'Shape. The colour is tone'),
        r('tone', "'accent' | 'neutral' | 'success' | 'danger' | 'warning' | 'info'", "'accent'", 'The colour, on any variant. accent is the theme accent. neutral keeps the text strong and only the hover wash takes the theme colour: the quiet action next to a primary one'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size. Without it — the size of the ancestors (the tao-size-* class or size on FormField / InputGroup), otherwise medium'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('loading', 'boolean', 'false', 'A spinner, the click is swallowed'),
        r('block', 'boolean', 'false', '100% width'),
        r('minWidth', 'number | string', '—', 'Minimum width (number = px); the --tao-button-min-width variable'),
        r('icon', 'string', "''", 'An icon before the text: a name for TaoIcon (tao-plus, your own or a font one). Without text and slot the button is a square of the control height and needs aria-label'),
        r('iconEnd', 'string', "''", 'An icon after the text'),
        r('v-model:pressed', 'boolean', '—', 'A toggle button (Bold, a filter): aria-pressed and the tone tint while pressed. Without it the button is an ordinary one'),
      ],
      slots: 'default — the button caption.',
    },
  ],
  typography: [
    {
      title: '.tao-prose / .tao-heading-*',
      rows: [
        r('--tao-text-base', 'length', '16px', 'The text size and h6; the scale is counted from it'),
        r('--tao-text-ratio', 'number', '1.25', 'The step of the scale: each level up is multiplied by it (1.2 calmer, 1.333 bolder). Set it on any element and the scale under it follows'),
        r('--tao-heading-1…6', 'length', '49 / 39 / 31 / 25 / 20 / 16', 'The steps, ready for your own rules; h1 and h2 in .tao-prose shrink on a narrow screen (not below h3 / h4)'),
        r('--tao-line-height-body / -heading', 'number', '1.6 / 1.25', 'Line height of text and headings'),
        r('--tao-font-family-mono', 'font', 'ui-monospace…', 'The code font in .tao-prose'),
      ],
      slots: '.tao-prose on a wrapper: headings, paragraphs, lists, quotes, code, hr, links (the theme link colour), images; spacing by proximity. Every rule inside is :where(), your CSS wins. .tao-heading-1…6 — the look of a level on any tag (h2 class="tao-heading-5").',
    },
  ],
  surface: [
    {
      title: 'Classes and tokens',
      rows: [
        r('.tao-surface-grain', 'class', '—', 'Static film grain. Any element'),
        r('.tao-surface-glass', 'class', '—', 'A translucent fill + background blur. Without blur support, or with prefers-reduced-transparency, it is solid'),
        r('--tao-surface-grain-image / -size', 'image / length', 'SVG / 160px', 'Your own grain texture'),
        r('--tao-glass-fill / -border / -blur', 'color / color / length', '55% / white 8% / 16px', 'Glass'),
      ],
      slots: "A surface belongs to a single element: nested panels do not inherit it. Toast and confirm are glass by default: toast.defaults({ surface: 'flat' }) / confirm.defaults({ surface: 'flat' }) turn it off.",
    },
  ],
  card: [
    {
      title: 'TaoCard',
      rows: [
        r('padding', 'number | string | (…)[]', 'var(--tao-space-5)', 'Padding of the card body. A number is px, a string is CSS. With flush — 0. Published as --tao-pad'),
        r('radius', 'number | string', 'var(--tao-radius-panel)', 'Corner radius. A number is px, a string is CSS. Published as --tao-radius; children get --tao-radius-inner'),
        r('shadow', 'boolean', 'true', 'The regular shadow. Off with flush'),
        r('shadowBottomOnly', 'boolean', 'false', 'A line at the bottom of the card, not a scrim over the photo'),
        r('flush', 'boolean', 'false', 'A tile: no padding and no shadow, cover/body fill the whole cell'),
        r('hover', 'boolean', 'false', 'An accent outline on hover'),
        r('surface', "'flat' | 'grain' | 'glass'", "'flat'", 'What the card is made of: fill / grain / glass. See “Surfaces”'),
        r('stripe', "'top' | 'left' | 'bottom'", '—', 'A coloured stripe on one side; the corners clip it (over a picture in #media too)'),
        r('stripeTone', "tone | 'gradient'", "'accent'", 'The stripe colour: accent, success / danger / warning / info / neutral, or the palette gradient. Say a status in the text as well'),
        r('active', 'boolean', 'false', 'The selected state'),
        r('overflow', 'boolean', 'false', 'Do not clip the content (media / carousel)'),
        r('closable', 'boolean', 'false', 'A close button in the top right corner; the parent removes the card on the close event'),
        r('closeLabel', 'string', "'Close'", 'aria-label of the close button'),
      ],
      slots: 'default — the body. #media (a photo or a carousel on top), #overlay (a scrim over the media or the whole tile), #header (the top row: laid out as you like), #title, #sub, #footer, #corner (the top right corner: a tag, a menu button; the title leaves room for it, the width is the variable --tao-card-corner-size). The close event — the cross was pressed.',
    },
  ],
  marquee: [
    {
      title: 'TaoMarquee',
      rows: [
        r('text', 'string', "''", 'The line; or anything inline in the slot (a link, an icon, bold text)'),
        r('speed', 'number', '40', 'Speed, pixels per second'),
        r('gap', 'number', '48', 'The gap between the end of the line and its next round, px'),
        r('fade', 'number', '22', 'The width of the fading edges, px. The left fade lives in a padding outside the text: at rest the line stands where it would, but the parent needs that much room on the left (its padding, or a smaller fade; 0 for none) or the running text shows past its edge'),
        r('pauseOnHover', 'boolean', 'true', 'Stop on hover'),
        r('paused', 'boolean', 'false', 'Stopped by the app'),
      ],
      slots: 'default — the content of the line; its copies for the second round are hidden from a screen reader and inert. It runs only when it does not fit; it stops on hover, on focus (a running line is a tab stop) and on a tap; with «reduce motion» it wraps. measure() — measure again by hand.',
    },
  ],
  copy: [
    {
      title: 'TaoCopy',
      rows: [
        r('text', 'string', '—', 'The string for the clipboard. Required'),
        r('successText', 'string', "'Copied!'", 'The tooltip text after the click'),
        r('copyLabel', 'string', "'Copy'", 'aria-label of the button'),
        r('tip', 'boolean', 'true', 'Show a tooltip above the button after copying'),
      ],
    },
  ],
  input: [
    {
      title: 'TaoInput',
      rows: [
        r('v-model', 'string | number', "''", 'The field value'),
        r('type', "'text' | 'password' | 'email' | 'number' | 'tel'", "'text'", 'The native input type'),
        r('placeholder', 'string', "''", 'The hint inside'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('id', 'string', 'auto', 'The input id; otherwise taken from FormField or useId'),
      ],
      slots: '#prefix and #suffix — inside the frame, left/right (an icon, text).',
    },
    {
      title: 'TaoInputGroup',
      rows: [
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The size of the whole group: addons, the field and buttons inside'),
      ],
      slots: 'default — the field itself (TaoInput etc.). #before / #after — a protocol, a unit, a button. Glues addon + field + addon into one frame.',
    },
  ],
  'input-number': [
    {
      title: 'TaoInputNumber',
      rows: [
        r('v-model', 'number | null', 'null', 'A number. An empty field is null, not 0 and not a string'),
        r('min / max', 'number', '—', 'The bounds. If not set — no limit'),
        r('step', 'number', '1', 'The step of ± and the arrows'),
        r('precision', 'number', '—', 'Digits after the decimal point'),
        r('@commit', 'number | null', '—', 'Edit finished: blur, Enter, ±, arrow key (once per action; v-model fires per keystroke).'),
        r('controls', 'boolean', 'true', '± buttons on the right'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('placeholder', 'string', "''", 'The hint when null'),
      ],
    },
  ],
  quantity: [
    {
      title: 'TaoQuantity',
      rows: [
        r('v-model', 'number', '1', 'A whole quantity. Never empty'),
        r('min', 'number', '1', 'The lower bound'),
        r('max', 'number', '—', 'Stock. If not set — no ceiling'),
        r('allowRemove', 'boolean', 'true', 'The minus at min stays alive and fires dec — the parent may remove the row'),
        r('forceMaxLimit', 'boolean', 'true', 'Clamp the input to max on blur and when more than the stock arrives'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
      ],
      slots: '#decrement-icon / #increment-icon — the button icons.',
    },
  ],
  textarea: [
    {
      title: 'TaoTextarea',
      rows: [
        r('v-model', 'string', "''", 'Text'),
        r('placeholder', 'string', "''", 'Hint'),
        r('rows', 'number', '3', 'The initial height'),
        r('maxlength', 'number', '—', 'Cuts the input'),
        r('count', 'boolean', 'false', 'Show “typed / maximum” (together with maxlength)'),
        r('resize', 'boolean', 'true', 'Can be dragged by the corner'),
        r('variant', "'bar' | 'outline' | 'filled' | 'plain'", "'bar'", 'A stripe on the left / a frame like TaoInput / a fill only / nothing'),
        r('readonly', 'boolean', 'false', 'Can be read and selected, but not edited'),
        r('noSpace', 'boolean', 'false', 'A space cannot be typed — neither from the keyboard nor by pasting'),
        r('align', "'start' | 'center' | 'end'", "'start'", 'Text alignment'),
        r('autofocus', 'boolean', 'false', 'Focus on mount'),
        r('blurOnEnter', 'boolean', 'false', 'Enter drops the focus instead of inserting a line break (Shift+Enter inserts it); keydown goes out first'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border'),
      ],
    },
  ],
  checklist: [
    {
      title: 'TaoChecklist',
      rows: [
        r('items', 'TaoChecklistItem[]', '—', '{ value, label, description?, disabled? }'),
        r('v-model', '(string | number)[]', '[]', 'The checked values, in the order of the items'),
        r('legend', 'string', '—', 'The group caption (legend). In a TaoFormField the field gives it'),
        r('selectAll', 'boolean', 'false', '«Select all» on top: mixed when some are checked; toggles every enabled item'),
        r('counter', 'boolean', 'false', '«3 of 5» next to the caption, announced politely'),
        r('strike', 'boolean', 'false', 'Strike the checked items through (a to-do list). A look only: the checkbox tells the state'),
        r('disabled', 'boolean', 'false', 'The whole group is disabled'),
        r('error', 'boolean', 'false', 'Red frames; the message goes to error of TaoFormField'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size of the checkboxes'),
        r('selectAllLabel', 'string', "'Select all'", 'The «Select all» label'),
        r('counterText', 'string', "'{checked} of {total}'", 'The counter text'),
      ],
      slots: '#item — { item, checked }: your own item text. Events update:modelValue, change. «Select all» leaves a disabled item alone. A fieldset: in a TaoFormField the group takes the id, the label and the error of the field, the checkboxes inside keep ids of their own.',
    },
  ],
  checkbox: [
    {
      title: 'TaoCheckbox',
      rows: [
        r('v-model', 'boolean', '—', 'Checked / not'),
        r('checked', 'boolean', '—', 'The state without v-model'),
        r('label', 'string', "''", 'The caption on the right'),
        r('indeterminate', 'boolean', 'false', 'A dash instead of the tick. A click sets checked, the parent works out the mixed state'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'A 14 / 18 / 22 square and the caption font size. Without it — the size of the ancestors'),
        r('error', 'boolean', 'false', 'A red accent. The error text goes through TaoFormField'),
      ],
    },
  ],
  select: [
    {
      title: 'TaoSelect',
      rows: [
        r('v-model', 'string | number | null', 'null', 'value of the selected option. Clearing → null'),
        r('options', 'TaoSelectOption[]', '[]', '{ value, label, disabled? }'),
        r('placeholder', 'string', "'Choose'", 'When the model is null'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, as TaoButton; also scales the opened list. Without it — the size of the ancestors'),
        r('clearable', 'boolean', 'true', 'Clear row and Delete / Backspace. Turn off when null is not valid.'),
        r('clearText', 'string', "'Clear'", 'Label of the clear row.'),
      ],
      slots: '#clear: content of the clear row (icon, markup), replaces clearText. #chevron: custom arrow.',
    },
    {
      title: 'TaoSwitch',
      rows: [
        r('v-model', 'boolean', 'false', 'On / off. role="switch"'),
        r('label', 'string', "''", 'The caption on the right'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The track is 28 / 36 / 44 px wide, and the caption font size. Without it — the size of the ancestors'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('loading', 'boolean', 'false', 'The change is being applied: a spinner on the thumb, a click does nothing, not greyed out; aria-busy'),
      ],
    },
    {
      title: 'TaoRadio / TaoRadioGroup',
      rows: [
        r('value', 'string | number | boolean', '—', 'Radio: the value of this point. Required'),
        r('v-model', 'the same', '—', 'Group holds the selection. A Radio without a group holds its own'),
        r('legend', 'string', '—', 'Group: the group caption'),
        r('direction', "'row' | 'column'", "'row'", 'Group: in a row or in a column'),
        r('disabled', 'boolean', 'false', 'A single point or the whole group'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'A 14 / 18 / 22 circle and the caption font size. On a group — for all the radios inside'),
        r('label / name', 'string', "''", 'Radio: the caption and name, if there is no group'),
      ],
    },
    {
      title: 'TaoFormField',
      rows: [
        r('label', 'string', '—', 'A shared caption above the control'),
        r('hint', 'string', '—', 'A hint under the field'),
        r('error', 'string', '—', 'The error text; if present, the field is invalid'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The size of the control inside'),
      ],
      slots: 'default — the control itself (Input, Select, Switch…).',
    },
  ],
  segmented: [
    {
      title: 'TaoSegmented',
      rows: [
        r('v-model', 'string | number | boolean', '—', 'value of the selected option'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The segment height, the same scale as TaoButton. Without it — the size of the ancestors'),
        r('block', 'boolean', 'false', 'Stretch to the parent width'),
        r('minWidth', 'number | string', '—', 'Minimum width of every option (number = px); the --tao-segmented-option-min-width variable'),
        r('legend', 'string', '—', 'The accessible name of the group'),
        r('disabled', 'boolean', 'false', 'The whole group'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('name', 'string', 'auto', 'name for the radio inputs inside'),
      ],
      slots: 'default — a set of TaoSegmentedOption.',
    },
    {
      title: 'TaoSegmentedOption',
      rows: [
        r('value', 'string | number | boolean', '—', 'The option value. Required'),
        r('label', 'string', "''", 'The text. Or the default slot'),
        r('icon', 'string', "''", 'A TaoIcon name on the left'),
        r('count', 'number | string', '—', 'A number on the right (a badge)'),
        r('disabled', 'boolean', 'false', 'This option'),
      ],
    },
  ],
  combobox: [
    {
      title: 'TaoCombobox',
      rows: [
        r('v-model', 'string | number | null', 'null', 'value of an option, or an arbitrary string with allow-create'),
        r('options', 'TaoSelectOption[]', '[]', '{ value, label, disabled? }. The list is not mutated by the component'),
        r('placeholder', 'string', "'Start typing'", 'The empty field'),
        r('allowCreate', 'boolean', 'false', 'A value that is not in the list can be kept'),
        r('emptyText', 'string', "'Nothing found'", 'An empty filter'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, as TaoButton and TaoSelect; also scales the opened list. Without it — the size of the ancestors'),
        r('clearable', 'boolean', 'true', 'Clear row in the list. Turn off when null is not valid.'),
        r('clearText', 'string', "'Clear'", 'Label of the clear row; slot #clear replaces it.'),
        r('disabled / error', 'boolean', 'false', 'Disabled / a red border'),
      ],
      slots: 'create — an event when a new value is typed: the parent extends options itself.',
    },
  ],
  typeahead: [
    {
      title: 'TypeaheadPlayground',
      rows: [
        r('v-model', 'object | null', 'null', 'The selected hit { id, name, city, role } or null'),
      ],
      slots: '#item="{ hit, active }" — a list row. #empty — nothing found. Not part of the npm package, lives in showcase/demo.',
    },
  ],
  date: [
    {
      title: 'TaoDate',
      rows: [
        r('v-model', 'string | null', 'null', 'A single day YYYY-MM-DD, with no time and no time zone'),
        r('min / max', 'string', '—', 'The bounds in the same format'),
        r('placeholder', 'string', "'Date'", 'The empty field'),
        r('locale', 'string', 'the app locale', 'The calendar captions and the order of day and month; without it the language of setTaoLocale'),
        r('editable', 'boolean', 'false', 'A text field you type the date into, the calendar on the button next to it or ↓. In the locale\'s order of day and month: 5 is the 5th of this month, 5.3 the 5th of March (3/5 in en-US), 05.03.26, 0503, ISO. Enter or leaving the field applies it; a text that is not a date or is outside min / max puts the value back; Esc drops the typing; an empty field is null'),
        r('parse / format', '(text, { locale, reference }) => string | null / (iso, locale) => string', '—', 'Your own reading of the typed text («tomorrow») and your own text in the field; reference is the current value or today'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled / error', 'boolean', 'false', 'Disabled / a red border'),
        r('todayText / clearText', 'string', "'Today' / 'Clear'", 'The buttons at the bottom of the popup'),
        r('calendarLabel', 'string', "'Choose a date'", 'aria-label of the calendar button of an editable field'),
      ],
      slots: '#icon, #prev-icon, #next-icon — the icons of the field and of the month arrows.',
    },
    {
      title: 'TaoDateRange',
      rows: [
        r('v-model', '{ start, end } | null', 'null', 'A period YYYY-MM-DD. An incomplete choice is not written to the model'),
        r('min / max', 'string', '—', 'The bounds'),
        r('placeholder', 'string', "'Period'", 'While null'),
        r('locale', 'string', 'the app locale', 'The calendar captions; without it the language of setTaoLocale'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size, the same scale as TaoButton. Without it — the size of the ancestors (tao-size-* or size on FormField / InputGroup), otherwise medium'),
        r('disabled / error', 'boolean', 'false', 'Disabled / a red border'),
      ],
      slots: 'The first click is start, the second is end (they swap if end is earlier).',
    },
  ],
  pincode: [
    {
      title: 'TaoPinCode',
      rows: [
        r('length', 'number', '—', 'The number of cells. Not needed with format: it is counted from the mask'),
        r('format', 'string', '—', 'A mask with separators: # is a cell, the rest is a separator (#-##-## gives 0-00-00). Separators are not part of the value'),
        r('v-model', 'string', "''", 'The cells glued into a string'),
        r('numbersOnly', 'boolean', 'false', 'Digits only'),
        r('masked', 'boolean', 'false', 'Dots instead of characters'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Cells 40×46 / 50×56 / 58×64. Without it — the size of the ancestors'),
        r('clearOn', "'focus' | 'input'", "'focus'", 'focus — a click clears the cell and everything to the right; input — changes only on typing'),
        r('status', "'idle' | 'success' | 'error'", "'idle'", 'The result of the check, set by the app (on complete): error shakes the cells and paints them red, success runs a glow and paints them green; a screen reader hears it. Set idle again when the user edits; play() repeats the animation'),
        r('successText / errorText', 'string', "'The code is correct' / 'Wrong code'", 'What a screen reader hears'),
        r('placeholder', 'string', "''", 'The character in an empty cell'),
      ],
      slots: 'The complete event — the last cell was typed (it blurs).',
    },
  ],
  slider: [
    {
      title: 'TaoProgress',
      rows: [
        r('progress', 'number', '0', 'The fill 0–100, not the bar width'),
        r('minWidth / maxWidth', 'number', '200 / —', 'The bar width in px'),
        r('height', 'number', '8', 'The thickness in px'),
        r('showPercentage', "boolean | 'top' | 'right'", 'true', 'true/top — above the bar, right — on the right, false — hide'),
        r('animated', 'boolean', 'true', 'Smooth filling'),
      ],
      slots: '#left / #right — captions. If #right is present, the percentage goes on the right in brackets.',
    },
    {
      title: 'TaoSlider',
      rows: [
        r('v-model', 'number', '—', 'The current value. Required. Two handles: TaoRangeSlider with a [from, to] pair'),
        r('min / max / step', 'number', '0 / 100 / 1', 'The range and the step'),
        r('marks', "boolean | (number | { value, label? })[]", '—', 'Scale marks: true — automatic divisions, an array of numbers or objects with a caption. A click on a caption moves the handle'),
        r('marksSide', "'start' | 'end'", "'end'", 'The marks side: end — under a horizontal slider and to the right of a vertical one, start — above and to the left'),
        r('discrete', 'boolean', 'false', 'The value only on the marks (a stepped scale); the arrows follow the marks'),
        r('format', '(value: number) => string', '—', 'Number text: the captions of automatic marks and the value on the bar'),
        r('flat', 'boolean', 'false', 'No round handles: a flat bar with a fill. Keyboard and focus work'),
        r('vertical', 'boolean', 'false', 'Vertical: the maximum on top, marks on the right. Length — --tao-slider-length (10rem)'),
        r('variant', "'bar' | 'thin'", "'bar'", 'bar — a thick track, a form control; thin — a thin one (seek / volume). It used to be size="small"'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The scale of the track and the thumb (the thumb is 16 / 20 / 24). Without it — the size of the ancestors'),
        r('showValue', 'boolean', 'false', 'The value over the bar'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('error', 'boolean', 'false', 'A red outline of the track. The error text is error on TaoFormField'),
        r('wheel', 'number', '0', 'The change step for the mouse wheel (a single handle). 0 — disabled'),
        r('@change', 'value', '—', 'Finished changing: released, a key, the wheel, a click on a mark. v-model fires on every move'),
        r('#mark', '{ mark, active }', '—', 'A custom mark caption'),

      ],
    },
    {
      title: 'TaoRangeSlider',
      rows: [
        r('v-model', '[number, number]', '—', 'A [from, to] pair. Required'),
        r('minGap', 'number', '0', 'The smallest distance between the handles; the handles do not jump over each other'),
        r('…', '', '', 'The rest as in TaoSlider: min / max / step, marks, discrete, format, vertical, variant, size, showValue, disabled, error'),
      ],
    },
    {
      title: 'TaoScrubber',
      rows: [
        r('v-model', 'number', '—', 'The current time. Required'),
        r('v-model:playing', 'boolean', 'false', 'Whether playback is running (the look of the button). The component does not keep time itself'),
        r('length', 'number', '—', 'The length; the slider goes from 0 to it. Required'),
        r('step', 'number', '0.01', 'The slider step'),
        r('marks', '(number | { value, label? })[]', '—', 'Event marks on the scale'),
        r('marksSide', "'start' | 'end'", "'end'", 'The marks above the slider or below it'),
        r('format', '(time: number) => string', 'toFixed(2)', 'The time text in the marks and the caption'),
        r('pauseOnScrub', 'boolean', 'true', 'Pause while the user holds the slider'),
        r('showRestart / showTime', 'boolean', 'true', 'The “to the start” button; the “time / length” caption'),
        r('variant', "'bar' | 'thin'", "'thin'", 'The track thickness'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Size; without it — the size of the ancestors'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('playLabel / pauseLabel / restartLabel', 'string', 'from the locale', 'Button captions for screen readers'),
        r('@restart', '—', '—', 'The “to the start” button (the time is already set to 0)'),
        r('@seek', 'time', '—', 'Finished seeking: the slider was released or a key was pressed'),
        r('#mark / #time', '{ mark, active } / { time, length, text }', '—', 'A custom mark caption; a custom time caption'),
      ],
    },
  ],
  color: [
    {
      title: 'TaoColorPicker',
      rows: [
        r('v-model', 'string', '—', 'The colour as a hex string: #rrggbb, with alpha also #rrggbbaa. rgb()/rgba() is accepted on input too. Required'),
        r('alpha', 'boolean', 'false', 'The opacity bar and #rrggbbaa'),
        r('swatches', 'string[]', '—', 'Ready colours under the palette; the selected one is marked'),
        r('modes', "('hex' | 'rgb' | 'hsl')[]", "['hex', 'rgb', 'hsl']", 'Colour input modes; a single mode hides the switch'),
        r('v-model:mode', "'hex' | 'rgb' | 'hsl'", 'the first of modes', 'The current input mode; v-model:mode remembers the choice between openings'),
        r('eyedropper', 'boolean', 'true', 'An eyedropper (only where the browser supports EyeDropper)'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The field size; without it — the size of the ancestors'),
        r('areaLabel / hueLabel / alphaLabel / hexLabel / swatchesLabel / eyedropperLabel', 'string', 'from the locale', 'Captions for screen readers (the colorPicker locale)'),
        r('@change', 'hex', '—', 'Finished editing: the square or a bar was released, a key, the hex field, a swatch. v-model fires on every move'),
      ],
    },
    {
      title: 'TaoColorInput',
      rows: [
        r('v-model', 'string', '—', 'The colour as a hex string. Required'),
        r('alpha / swatches / modes / v-model:mode / eyedropper / size', '', '', 'As in TaoColorPicker'),
        r('placement', 'TaoPlacement', "'bottom-start'", 'Side and alignment: top / bottom / left / right and -start / -end. Flips at the screen edge'),
        r('error', 'boolean', 'false', 'A red border. The error text is error on TaoFormField'),
        r('disabled', 'boolean', 'false', 'Disabled'),
      ],
    },
    {
      title: 'colorModel(source, options)',
      rows: [
        r('source', 'Ref<T>', '—', 'Your colour storage. Returns a writable hex string for v-model'),
        r('format', "'object' | 'array' | 'css'", "'object'", '{ r, g, b, a }, [r, g, b, a] or an rgb(r g b / a) string'),
        r('range', '255 | 1', '255', 'The range of r, g, b; opacity is always 0…1'),
        r('space', "'srgb' | 'linear'", "'srgb'", 'The space of r, g, b; linear only with range: 1 (rendering, the TaoFX gradient)'),
        r('alpha', 'boolean', 'false', 'Store opacity; without it a hex #rrggbb'),
        r('precision', 'number', '5', 'Digits of fractional values (range 1); for a linear colour fewer give steps in the dark'),
      ],
    },
  ],
  filedrop: [
    {
      title: 'TaoFileDrop',
      rows: [
        r('v-model', 'File[]', '[]', 'The list of files. The component does not accumulate it — only what the parent gave'),
        r('multiple', 'boolean', 'false', 'Several files'),
        r('accept', 'string', "'*'", 'As in <input type="file">'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The height of the zone and of the file rows. Without it — the size of the ancestors'),
        r('list', 'boolean', 'true', 'Names under the zone. Removing a file goes straight to v-model'),
        r('showClear', 'boolean', 'false', 'The “clear all” button. It does not clear by itself — it fires clear-request'),
      ],
      slots: 'default — the zone text. The change event — files were added or removed. clear-request: the parent decides whether to reset at once or after confirm().',
    },
  ],
  charts: [
    {
      title: 'TaoSparkline',
      rows: [
        r('values', '(number | null)[]', '—', 'The series; null is a gap that splits the line'),
        r('label', 'string', '—', 'What it shows, for a screen reader («Visits, 12 weeks, growing»). Without it the line is decoration (aria-hidden)'),
        r('tone', "'accent' | 'neutral' | 'success' | 'danger' | 'warning' | 'info'", "'accent'", 'The colour'),
        r('area', 'boolean', 'false', 'A soft fill under the line'),
        r('dot', 'boolean', 'false', 'A dot on the last value'),
        r('min / max', 'number', 'the data', 'A fixed range (values outside are clamped): to compare several sparklines'),
        r('height', 'number | string', '32', 'Height (number = px). The width is the width of the container'),
      ],
      slots: 'A trend without axes or a tooltip: for a card, a table cell, a line of text.',
    },
    {
      title: 'TaoMeter',
      rows: [
        r('value', 'number', '—', 'The measured value'),
        r('min / max', 'number', '0 / 100', 'The range'),
        r('low / high', 'number', '—', 'The bounds of the low and the high region. Without them the meter is the accent colour'),
        r('optimum', 'number', 'the middle', 'The best value. Its region is success, the next one warning, the far one danger, as the HTML <meter>: optimum 0 for disk space used, max for a battery'),
        r('label', 'string', '—', 'Shown above the bar, the accessible name'),
        r('valueText', 'string | boolean', 'false', 'The value right of the label: true is the number, a string your own text (read as aria-valuetext)'),
        r('tone', 'TaoToneName', '—', 'A fixed colour instead of low / high'),
      ],
      slots: 'role="meter". A measured value in a range (disk, battery, a score), not the progress of a task: that is TaoProgress.',
    },
    {
      title: 'TaoDonut',
      rows: [
        r('segments', 'TaoDonutSegment[]', '—', '{ label, value, tone?, color? }. The parts take --tao-color-chart-1…6 in order; a tone or a CSS colour wins. 3–5 parts read well'),
        r('value / max', 'number', '0 / 100', 'Without segments: a single ring, value of max'),
        r('tone', 'TaoToneName', "'accent'", 'The colour of the single ring'),
        r('label', 'string', '—', 'The accessible name; the parts and their shares are read after it'),
        r('size / thickness', 'number', '120 / 12', 'The outer size and the ring width, px'),
        r('legend', 'boolean', 'false', 'A list of the parts with their shares next to the ring'),
      ],
      slots: 'default — the middle of the ring (a number, a word). taoChartTheme(el?) returns the theme colours as rgb() for a chart library: colors (6 series), text, textMuted, grid, axis, background, tooltip, tooltipText, danger / success / warning, fontFamily; watchTaoChartTheme(apply, el?) calls it now and on every theme, mode or palette change, and returns stop().',
    },
  ],
  table: [
    {
      title: 'TaoTable',
      rows: [
        r('columns', 'TaoTableColumn[]', '—', 'Required. { key, label, sortable?, align?, width? }'),
        r('rows', 'object[]', '[]', 'The data'),
        r('v-model:sort', '{ key, dir } | null', 'null', 'Sorting. dir: asc | desc'),
        r('loading', 'boolean', 'false', 'The loading overlay'),
        r('emptyText', 'string', "'No data'", 'If rows is empty and not loading'),
        r('striped', "boolean | 'odd' | 'even'", 'false', 'Zebra. true/odd — from the first row, even — from the second'),
        r('hover', 'boolean', 'true', 'Highlight the row on hover'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Paddings and text of cells (small = the former compact), and the size of controls in cells too'),
        r('head', 'boolean', 'true', 'Highlight the header'),
        r('lines', 'boolean', 'true', 'Lines between rows'),
        r('sticky', 'boolean', 'false', 'A sticky header (needs maxHeight)'),
        r('rowKey', 'string | fn', "'id'", 'The row key'),
        r('maxHeight', 'number | string', '—', 'Scroll. A number is px'),
      ],
      slots: 'Cell: #cell-{key}="{ row, value }". Events: change — the sorting changed, row-click, if clickable.',
    },
  ],
  pagination: [
    {
      title: 'TaoPagination',
      rows: [
        r('v-model:page', 'number', '1', 'The current page'),
        r('total', 'number', '0', 'Total records (not pages)'),
        r('pageSize', 'number', '10', 'Records per page'),
        r('jump', 'number', '5', 'A click on “…” jumps this many pages. 0 — “…” is decorative'),
        r('pageInput', 'boolean | number', 'false', 'A field to type a page in: true — always, a number — from this many pages on. Enter or leaving the field goes there (clamped to the range), Esc drops it'),
        r('siblingCount', 'number', '1', 'How many numbers around the current one'),
        r('showTotal', 'boolean', 'true', 'The “1–10 of N” caption'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Buttons 26 / 36 / 44, like TaoButton. Without it — the size of the ancestors'),
        r('disabled', 'boolean', 'false', 'Disabled'),
      ],
    },
  ],
  empty: [
    {
      title: 'TaoEmpty',
      rows: [
        r('title', 'string', "'Nothing here'", 'The empty state title'),
      ],
      slots: 'default — an explanation. #icon — a picture/icon. #action — a button.',
    },
  ],
  tree: [
    {
      title: 'TaoTree',
      rows: [
        r('nodes', 'TaoTreeNode[]', '—', '{ id, label, icon?, children?, hasChildren?, disabled? }. hasChildren without children — the children come from load when it opens'),
        r('v-model:expanded', 'string[]', 'own', 'Ids of the expanded nodes. Without a model the tree keeps them itself'),
        r('selection', "'none' | 'single' | 'multiple'", "'single'", 'Selection mode. none — a click on a folder toggles it'),
        r('v-model:selected', 'string | string[] | null', 'own', 'An id (single) or a list of ids (multiple)'),
        r('checkable', 'boolean', 'false', 'Checkboxes. A parent is checked, unchecked or mixed by its leaves; a click on a parent toggles the whole branch'),
        r('v-model:checked', 'string[]', 'own', 'Ids of the checked nodes without children (leaves and folders not loaded yet). A checked lazy folder hands its check to its children once loaded'),
        r('load', '(node) => Promise<TaoTreeNode[]>', '—', 'Loads the children of a node with hasChildren; a spinner and aria-busy meanwhile'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Row height, as for the controls; the density works too'),
        r('ariaLabel', 'string', "'Tree'", 'Accessible name of the tree'),
        r('loadingLabel', 'string', "'Loading…'", 'The hint of the spinner'),
      ],
      slots: '#icon, #label, #actions — { node, level, expanded, selected }; the actions show on hover and focus (always on a touch screen). Events: update:expanded / selected / checked, select(node) — a click, Enter, Space without checkboxes; load-error(node, error) — the node stays closed. Keys: ↑ ↓, → opens or goes in, ← closes or goes to the parent, Home / End, * opens the siblings, letters search, Enter selects, Space checks.',
    },
  ],
  list: [
    {
      title: 'TaoList',
      rows: [
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Row height 26 / 36 / 44. An Item without its own size takes it from here'),
        r('bordered', 'boolean', 'true', 'A border around the list'),
        r('divided', 'boolean', 'true', 'Lines between rows'),
        r('maxHeight', 'number | string', '—', 'Scroll. A number is pixels'),
        r('empty', 'boolean', 'false', 'Show #empty instead of rows'),
        r('ariaLabel', 'string', "''", 'The list name'),
      ],
      slots: 'default — TaoListItem. #empty — if empty.',
    },
    {
      title: 'TaoListItem',
      rows: [
        r('title', 'string', "''", 'The title. The default slot replaces it'),
        r('description', 'string', "''", 'A caption under the title'),
        r('selected', 'boolean', 'false', 'The selected row'),
        r('disabled', 'boolean', 'false', 'Disabled'),
        r('active', 'boolean', 'false', 'Highlight without selected'),
        r('clickable', 'boolean', 'false', 'A button row, fires click'),
        r('size', "'small' | 'medium' | 'large'", 'from the list', 'Override the list size'),
        r('actionAlways', 'boolean', 'false', '#action is always visible, not only on hover'),
      ],
      slots: 'default — the title. #prefix, #description, #suffix, #action (on hover; always on touch).',
    },
  ],
  timeline: [
    {
      title: 'TaoTimeline',
      rows: [
        r('items', 'TaoTimelineItem[]', '—', '{ id, title, time?, datetime?, description?, icon?, tone? }. time is shown, datetime goes to <time datetime>'),
        r('active', 'string', '—', 'The id of the current event: the line is filled up to it, the next ones wait, it gets aria-current="step". Without active the feed is a log of the past'),
        r('align', "'start' | 'alternate'", "'start'", 'alternate — the events on both sides of the line; below 480px of its own width it folds into start'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The marker and the text on the control scale; the density works too'),
      ],
      slots: '#marker, #title, #content — { item, index, state, active }; state: done / current / upcoming. A marker tone: success / danger / warning / info / neutral, the accent without one. An <ol>: a screen reader hears the order, the line and the markers are hidden from it.',
    },
  ],
  stages: [
    {
      title: 'TaoStages',
      rows: [
        r('items', 'TaoStageItem[]', '[]', '{ key, label?, status?: wait | work | ok | bad }'),
        r('direction', "'row' | 'column'", "'column'", 'column — top to bottom, row — in a row. As in TaoFlex'),
        r('ariaLabel', 'string', "'Stages'", 'The list name'),
      ],
      slots: 'default / #icon="{ item, index, status }" — replace the step text or icon.',
    },
  ],
  skeleton: [
    {
      title: 'TaoSkeleton',
      rows: [
        r('variant', "'text' | 'title' | 'circle' | 'rect'", "'text'", 'The placeholder shape'),
        r('lines', 'number', '1', 'How many lines (text)'),
        r('width / height', 'string', "''", 'A CSS size, if it has to be set explicitly'),
      ],
    },
  ],
  counter: [
    {
      title: 'TaoCounter',
      rows: [
        r('value', 'number', '0', 'A number on display. Not an input'),
        r('maxDigits', 'number', '9', 'The minimum width in digits (leading zeros are hidden visually)'),
      ],
    },
  ],
  carousel: [
    {
      title: 'TaoCarousel',
      rows: [
        r('v-model', 'number', '0', 'The index of the current snap'),
        r('perView', 'number', '1', 'How many slides are in the frame. 5 — a product strip'),
        r('peek', 'number', '0', 'How many px of the next card are visible on the right'),
        r('autoplay', 'number', '0', 'Time per slide in ms. 0 — off. The current indicator fills over this time and the slide changes when it is full (the clock is a CSS animation). Pauses on hover / keyboard focus / touch and drag / a hidden tab; off with prefers-reduced-motion'),
        r('loop', 'boolean', 'false', 'Loop round in a circle'),
        r('indicator', "'dots' | 'bars' | 'progress'", '—', 'Marks under the strip: dots (the current one stretches into a pill) / equal bars / one bar (the fill of the slide, the position without autoplay)'),
        r('pausable', 'boolean', 'true', 'With autoplay: a button that stops and resumes it (autoplay that moves for more than 5 seconds must be stoppable)'),
        r('pauseLabel / playLabel', 'string', "'Pause autoplay' / 'Start autoplay'", 'aria-label of the button'),
        r('controls', 'boolean', 'true', 'Arrows. false hides both'),
      ],
      slots: 'default — slides. #prev / #next="{ go, disabled }" — custom buttons. #prev-icon / #next-icon — the icon only. #dots="{ index, count, go }" — your own indicator as a whole (an invisible fill then keeps the time), #dot — your own mark.',
    },
  ],
  container: [
    {
      title: 'TaoContainer',
      rows: [
        r('width', "'wide' | 'slim' | 'ultra-slim'", "'wide'", 'max-width: 1120 / 500 / 400'),
        r('free', 'boolean', 'false', 'No horizontal auto-centring'),
      ],
      slots: 'default — the content.',
    },
  ],
  flex: [
    {
      title: 'TaoFlex',
      rows: [
        r('justify', 'flex justify-content', "'flex-start'", 'flex-start, center, space-between, space-around, space-evenly, flex-end, normal'),
        r('align', 'flex align-items', "'stretch'", 'stretch, flex-start, center, flex-end, baseline'),
        r('direction', 'flex-direction', "'row'", 'row, column and reverse'),
        r('wrap', 'flex-wrap', "'nowrap'", 'nowrap, wrap, wrap-reverse'),
        r('gap', 'number | string', "'0px'", 'The gap. A number is px, a string is CSS'),
        r('tag', 'string', "'div'", 'Which HTML tag to render'),
      ],
    },
    {
      title: 'TaoSpace',
      rows: [
        r('direction', "'row' | 'column'", "'row'", 'As in TaoFlex'),
        r('block', 'boolean', 'false', 'display: flex without wrap'),
        r('expand', 'boolean', 'false', '100% width'),
      ],
      slots: 'default — children with an even gap.',
    },
  ],
  grid: [
    {
      title: 'TaoGrid',
      rows: [
        r('min', 'string', "'220px'", 'The minimum tile width (auto-fill). A catalogue. Ignored with cols'),
        r('cols', 'number | { compact, medium, expanded }', '0', 'Fixed columns (bento). A number: one column on compact, the number from medium on. An object: per width class of the grid itself (compact < 600px, medium < 840px, expanded), a missing class takes the smaller one. 0 — the min mode'),
        r('gap', 'number | string', 'token space-4', 'The gap between cells. A number is px, a string is CSS'),
        r('rowHeight', 'number | string', '—', 'The height of every row, as a mosaic wants: the grid keeps its proportions, a picture in a tile is cropped. Without it the rows follow the content'),
      ],
      slots: 'default — cards or TaoGridItem. Not masonry: the row follows the tallest. The width classes follow the width of the grid, not of the window (inside a TaoSplit pane too).',
    },
    {
      title: 'TaoGridItem',
      rows: [
        r('col', "number | 'full' | { compact, medium, expanded }", '1', "How many columns to take; 'full' is the whole row. Never more than there are. For cols, not for min"),
        r('row', 'number | { compact, medium, expanded }', '1', 'How many rows to take. A number: 1 on compact, the number from medium on'),
        r('order', 'number | { compact, medium, expanded }', '0', 'The place in the flow: { compact: 9 } sends a side block to the end on a phone'),
      ],
      slots: 'default — a tile. In a catalogue it can go without the wrapper.',
    },
  ],
  divider: [
    {
      title: 'TaoDivider',
      rows: [
        r('variant', "'solid' | 'dashed' | 'colored' | 'gap'", "'solid'", 'solid — a regular border, dashed — dashes, colored — accent, gap — a gap'),
        r('text', 'string', "''", 'An optional caption in the middle. Works with any variant'),
        r('fade', 'boolean', 'false', 'Soft line edges. Does not affect gap'),
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'For gap only — the height of the gap. Not inherited.'),
      ],
      slots: 'default — the same as text. If there is a slot, it wins over the prop.',
    },
  ],
  split: [
    {
      title: 'TaoSplit',
      rows: [
        r('v-model', 'number', '50', 'The size of the start pane in unit'),
        r('direction', "'row' | 'column'", "'row'", 'As in Flex'),
        r('unit', "'%' | 'px'", "'%'", 'Percent or pixels'),
        r('min / max', 'number', '0 / —', 'The bounds of the start pane'),
        r('minEnd', 'number', '0', 'The minimum of the second pane'),
        r('resizable', 'boolean', 'true', 'false — the bar is there, but cannot be dragged'),
        r('step', 'number', '1% or 8px', 'The arrow step when the bar is focused'),
        r('@change', 'value', '—', 'Finished dragging or an arrow was pressed. v-model fires on every move'),

      ],
      slots: '#start and #end — the two panes. Three columns = two nested splits.',
    },
  ],
  fieldset: [
    {
      title: 'TaoFieldset',
      rows: [
        r('legend', 'string', "''", 'A caption on the top frame'),
        r('align', "'start' | 'center' | 'end'", "'start'", 'Where to shift the legend'),
      ],
      slots: 'default — the fields. #legend — if the caption is not a string.',
    },
  ],
  'animated-border': [
    {
      title: 'TaoAnimatedBorder',
      rows: [
        r('variant', "'rainbow' | 'tone'", "'rainbow'", 'What the border is made of: the rainbow or the colours of a tone'),
        r('tone', 'TaoToneName', "'accent'", 'The tone for variant="tone"; the theme accent without it'),
        r('colors', 'string[]', '—', 'Your own colours (any CSS colour), they win over variant'),
        r('radius', 'number | string', 'var(--tao-radius-panel)', 'Corner radius of the content; the border outside is that plus its width'),
        r('borderWidth', 'number', '3', 'The outline thickness in px'),
        r('speed', 'number', '6', 'The duration of one turn in seconds'),
        r('light', 'boolean', 'false', 'A soft glow around the frame'),
        r('glow', 'number', '16', 'The glow radius in px. Makes sense with light'),
      ],
      slots: 'default — the content inside the frame. With prefers-reduced-motion the gradient stands still.',
    },
  ],
  modal: [
    {
      title: 'TaoModal',
      rows: [
        r('v-model', 'boolean', '—', 'Open. Required'),
        r('title', 'string', "''", 'The title in the header'),
        r('closable', 'boolean', 'true', 'The cross, Esc, a click on the backdrop'),
        r('closeLabel', 'string', "'Close'", 'aria-label of the cross'),
        r('fullscreen', "boolean | 'narrow'", 'false', 'true — the whole screen: square corners, the header and the footer stay while the content scrolls, the safe areas kept. narrow — only on a screen narrower than 600px: a dialog on a computer, a page on a phone'),
      ],
      slots: 'default — the body. #footer — buttons. #close-icon — the cross icon.',
    },
  ],
  drawer: [
    {
      title: 'TaoDrawer',
      rows: [
        r('v-model', 'boolean', '—', 'Open. Required'),
        r('title', 'string', "''", 'The title'),
        r('side', "'left' | 'right' | 'bottom'", "'right'", 'Where it slides in from. bottom is a sheet: as wide as the screen up to 640px, as tall as its content up to 90% of the screen, rounded top, a grip, above the safe area'),
        r('closable', 'boolean', 'true', 'Esc, the backdrop, the cross'),
        r('closeLabel', 'string', "'Close'", 'aria-label of the cross'),
      ],
      slots: 'default — the body. #footer — buttons. #close-icon — the cross icon.',
    },
  ],
  confirm: [
    {
      title: 'confirm()',
      kind: 'api',
      rows: [
        r('confirm()', '() => Promise<boolean>', '', 'A chain in a single tick. true — ok, false — cancel / Esc / backdrop'),
        r('confirm(message)', '(string) => Promise<boolean>', '', 'A short call with a text'),
        r('.title / .message', '(string) => builder', '', 'The title and text'),
        r('.ok / .cancel', '(label) => builder', '', 'Button captions'),
        r('.danger()', '() => builder', '', 'A red confirm button'),
        r('confirm.defaults', '({ ok, cancel })', '', 'Default captions for the whole app'),
      ],
    },
  ],
  tooltip: [
    {
      title: 'TaoTooltip',
      rows: [
        r('content', 'string', '—', 'The hint text. Required'),
        r('placement', 'TaoPlacement', "'top'", 'Side and alignment: top / bottom / left / right and -start / -end. Flips at the screen edge'),
      ],
      slots: 'default — the trigger (a button, an icon…).',
    },
  ],
  popover: [
    {
      title: 'TaoPopover',
      rows: [
        r('v-model', 'boolean', 'uncontrolled', 'Open state. Without v-model it holds its own'),
        r('placement', 'TaoPlacement', "'bottom-start'", 'Side and alignment of the panel: top / bottom / left / right and -start / -end. Flips at the edge'),
        r('disabled', 'boolean', 'false', 'Does not open'),
      ],
      slots: '#trigger — the button. default — the panel content. Not a tooltip and not an action menu.',
    },
  ],
  dropdown: [
    {
      title: 'TaoDropdownMenu',
      rows: [
        r('items', 'TaoMenuItem[]', '[]', 'Entries: plain { id, label, icon?, shortcut?, disabled?, items? }, checkboxes { type: "checkbox", checked }, radios { type: "radio", group, checked }, { type: "label" }, { type: "separator" }. items inside an entry is a submenu'),
        r('placement', 'TaoPlacement', "'bottom-end'", 'Where the list opens. Flips at the screen edge'),
        r('menuLabel', 'string', "'Menu'", 'aria-label of the button and of the menu'),
        r('closeOnScroll', 'boolean', 'false', 'Close when the page scrolls. Off: the menu follows its button'),
      ],
      slots: '#icon — the trigger icon, #button — the whole button content, #item="{ item, id, label, icon }" — your own item face. The select event — the item id. shortcut is a ready string to show: the menu neither parses nor listens to it.',
    },
    {
      title: 'TaoMenu',
      rows: [
        r('items', 'TaoMenuItem[]', '', 'The same entries'),
        r('open', 'boolean', '', 'Whether it is open. The owner closes it on the close event'),
        r('anchor', 'HTMLElement | null', '', 'What the panel hangs from'),
        r('placement', 'TaoPlacement', "'bottom-end'", 'Side and alignment'),
        r('label', 'string', '—', 'Accessible name of the menu'),
      ],
      slots: 'Event select — the item id, close(reason) — the menu asks to be closed (escape / select / outside / tab). The panel for your own shells: a button, a context menu, a menu bar.',
    },
  ],
  toolbar: [
    {
      title: 'TaoToolbar',
      rows: [
        r('label', 'string', '—', 'Accessible name of the bar: Formatting, Tools'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The size of the controls inside'),
        r('orientation', "'horizontal' | 'vertical'", "'horizontal'", 'Which arrows walk it (← → or ↑ ↓); the separators lie across'),
        r('variant', "'panel' | 'plain'", "'panel'", 'panel — a raised bar of its own with concentric corners; plain — only the layout, for a toolbar inside a header'),
      ],
      slots: 'default — any controls: TaoButton (toggles with v-model:pressed), TaoSegmented, a select, TaoToolbarGroup, TaoToolbarSeparator. Keys: the bar is one Tab stop and remembers the last item; ← → (↑ ↓ when vertical) walk it and wrap, Home / End go to the ends, disabled items are skipped. Inside a radio group (TaoSegmented) the arrows pick the option and go on from its edge; a text field keeps its arrows. The items wrap onto a new line on a narrow screen.',
    },
    {
      title: 'TaoToolbarGroup',
      rows: [
        r('label', 'string', '—', 'Accessible name of the group: Text style, Alignment'),
        r('inset', 'boolean', 'false', 'A sunken pill behind the group: its buttons read as one set'),
      ],
      slots: 'default — the tools of one kind. role="group".',
    },
    {
      title: 'TaoToolbarSeparator',
      rows: [],
      slots: 'A thin line between the groups, across the bar: vertical in a horizontal toolbar. role="separator".',
    },
  ],
  menubar: [
    {
      title: 'TaoMenubar',
      rows: [
        r('items', 'TaoMenuItem[]', '—', 'The top entries: { id, label, items } is a menu, { id, label } a plain action. Inside a menu, everything TaoMenu can do (submenus, checkboxes, radios, shortcuts). Separators and labels at the top level are ignored'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The height of the bar, as for the controls'),
        r('ariaLabel', 'string', "'Menu bar'", 'Accessible name of the bar'),
        r('closeOnScroll', 'boolean', 'false', 'Close an open menu when the page scrolls. Off: it follows its entry'),
      ],
      slots: 'The select event — the id of the picked item (in a menu or a plain top entry). #item — your own item face in the menus. Keys: Tab enters the bar, ← → walk it, Home / End, ↓ / Enter / Space open, with a menu open ← → move to the neighbour menu, Esc closes and gives the focus back. No folding of entries into “…” on a narrow bar yet.',
    },
    {
      title: 'TaoContextMenu',
      rows: [
        r('items', 'TaoMenuItem[]', '—', 'The entries, as in TaoMenu'),
        r('disabled', 'boolean', 'false', 'Leave the browser menu alone'),
        r('menuLabel', 'string', "'Context menu'", 'Accessible name of the menu'),
        r('closeOnScroll', 'boolean', 'true', 'Close when the page or a scroll container scrolls (the point moves away from under the menu). false keeps it at the screen point. Scrolling inside the menu never closes it'),
      ],
      slots: 'default — the area where the right click (or the Menu key / Shift+F10) opens the menu; the wrapper does not take part in the layout (display: contents). #item — your own item face. Events select — the item id, open({ x, y }) — where it opened. On iOS a long press sends no contextmenu: give it a button there.',
    },
  ],
  spoiler: [
    {
      title: 'TaoSpoiler',
      rows: [
        r('v-model', 'boolean', 'uncontrolled', 'Open / closed. Without a model — defaultOpen'),
        r('title', 'string', "''", 'The button title'),
        r('name', 'string | number', '—', 'The panel key inside TaoSpoilerGroup'),
        r('defaultOpen', 'boolean', 'false', 'The initial state, if there is no v-model'),
        r('@change', 'value', '—', 'The user opened or closed it'),

      ],
      slots: 'default — the body. Neighbours do not close each other.',
    },
    {
      title: 'TaoSpoilerGroup',
      rows: [
        r('v-model', 'string | number | null', 'uncontrolled', 'The key of the open panel. null — all closed. Without a model the group remembers the key itself'),
      ],
      slots: 'default — a set of TaoSpoiler with name.',
    },
  ],
  'tao-nav': [
    {
      title: 'TaoNav',
      rows: [
        r('items', 'TaoNavItem[]', '—', '{ id, label, icon?, href?, badge?, disabled? }. With href the item is an <a> link, without it a button. badge: a number or a string is a count, true a dot'),
        r('v-model', 'string', '—', 'The id of the current section: aria-current="page" and the active look'),
        r('layout', "'auto' | 'bar' | 'rail' | 'drawer'", "'auto'", 'bar — a bottom bar, rail — a rail with icons, drawer — a side panel with labels. auto — by the width of TaoNav itself: bar below 600px, rail below 840px, drawer from 840px (container queries, no JS)'),
        r('maxBarItems', 'number', '5', 'How many fit the bar. With more items maxBarItems − 1 stay, the rest go into «More» with a menu'),
        r('ariaLabel', 'string', "'Navigation'", 'Accessible name of the navigation'),
        r('moreLabel', 'string', "'More'", 'The label of «More»'),
        r('floating', 'boolean', 'false', 'In the bar look, a detached pill above the page: inset from the edges and above the safe area, round, with a shadow; the active item is a pill too. The rail and the side panel do not change. The main action of the screen goes beside it as your own round button, not into the bar'),
      ],
      slots: 'default — the page: TaoNav lays it out next to the navigation (the bar sticks to the bottom, on the side the list sticks to the top; env(safe-area-inset-bottom) is kept). Without the slot it is a standalone panel with a border. #label — your own item label ({ item, active }). #action — the main action of the screen: a TaoButton with icon and its text in <span class="tao-nav__action-label">; the bar puts it round above itself at the end side (above the pill with floating), the rail round at the top, the side panel extended with the text at the top; in the round looks the text is hidden but stays the name of the button. Events: update:modelValue, select(id, event) — event.preventDefault() keeps a link from navigating, to route it yourself.',
    },
  ],
  tabs: [
    {
      title: 'TaoTabs',
      rows: [
        r('v-model', 'string', '—', 'value of the active tab. Required'),
        r('items', 'TaoTabItem[]', '—', '{ value, label, disabled? } — like Select options'),
        r('@change', 'value', '—', 'The user picked another tab'),

        r('justify', 'TaoJustify', '—', 'Where the tabs sit in the row, as in TaoFlex: flex-start, center, flex-end, space-between, space-around, space-evenly. Without it, at the left'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'The tab height as TaoButton (26 / 36 / 44). Without it — the size of the ancestors'),
      ],
      slots: 'default="{ key }" — the content of the active panel.',
    },
  ],
  breadcrumb: [
    {
      title: 'TaoBreadcrumb',
      rows: [
        r('items', '{ label, to? }[]', '—', 'The crumbs. The last one is the current page, without a link. Required'),
        r('ariaLabel', 'string', "'Breadcrumb'", 'The navigation name'),
      ],
    },
  ],
  link: [
    {
      title: 'TaoLink',
      rows: [
        r('to', 'string | object', '—', 'The address. NuxtLink → RouterLink → <a>'),
        r('newTab', 'boolean', 'false', 'target=_blank + rel=noopener'),
        r('private', 'boolean', 'false', 'rel=noopener noreferrer'),
        r('exactPath', 'boolean', 'false', 'An exact path match for active (vue-router)'),
      ],
      slots: 'default — the link text.',
    },
  ],
  scrolltop: [
    {
      title: 'TaoScrollTop',
      rows: [
        r('variant', "'solid' | 'ghost' | 'text'", "'solid'", 'The look: a filled circle, a light circle or a caption with an arrow'),
        r('side', "'left' | 'right'", "'right'", 'Which edge of the page the button sits on'),
        r('offset', 'number | string', '24', 'The offset from that edge (older name: right)'),
        r('label', 'string', '—', 'The caption: on mouse hover (not touch) for solid / ghost, always visible for text (the locale text by default); an empty string hides it'),
        r('labelSide', "'left' | 'right'", '—', 'Which side the caption goes; opposite to side by default'),
        r('boundary', 'number', '300', 'The threshold in px: it appears on a reverse scroll after it'),
        r('size', 'number', '40', 'The button size in px'),
        r('bottom', 'number | string', '24', 'The offset from the bottom edge'),
        r('zIndex', 'number', '1000', 'The layer'),
        r('ariaLabel', 'string', "'Back to top'", 'The accessible name'),
        r('outline', 'boolean', 'true', 'The focus outline'),
      ],
    },
  ],
  toast: [
    {
      title: 'toast()',
      kind: 'api',
      rows: [
        r('toast()', '() => builder', '', 'A chain in a single tick, shown on the next one'),
        r('toast.success(msg)', '(string, options?) => builder', '', 'A short call. Also error / warning / info / show'),
        r('.success() / .danger() / …', '() => builder', '', 'The type. show() is neutral'),
        r('.title / .message', '(string) => builder', '', 'The title and text'),
        r('.short() / .timeout(ms)', '() => builder', '', '1 s or your own time'),
        r('.byBottomRight() / …', '() => builder', '', 'The corner: top/bottom + left/right/center'),
        r('.action(label, fn)', '(string, fn) => builder', '', 'A button in the toast'),
        r('toast.defaults', '(partial) => toast', '', 'Position, timeout, closeLabel for the whole app'),
      ],
    },
  ],
  alert: [
    {
      title: 'TaoAlert',
      rows: [
        r('tone', "'success' | 'danger' | 'warning' | 'info' | 'neutral'", "'info'", 'The status colour, as TaoButton'),
        r('title', 'string', "''", 'The title. Can be omitted'),
        r('closable', 'boolean', 'false', 'The cross. It does not unmount itself — it fires close'),
        r('closeLabel', 'string', "'Close'", 'aria-label of the cross'),
        r('collapsible', 'boolean', 'false', 'The body folds under the title (the title is the toggle, aria-expanded); the tone stays. Folded text stays in the DOM, find-in-page opens it'),
        r('v-model:collapsed', 'boolean', 'own', 'Folded or not; v-model:collapsed="true" starts folded. Better open for an error'),
        r('detailsLabel', 'string', "'Details'", 'The toggle text when there is no title'),
      ],
      slots: 'default — the text. #close-icon. v-if + @close — to hide it.',
    },
  ],
  tag: [
    {
      title: 'TaoTag',
      rows: [
        r('tone', "'neutral' | 'success' | 'danger' | 'warning' | 'info' | ''", "''", 'The status colour, as TaoButton'),
        r('flat', 'boolean', 'false', 'No border, the fill stays'),
        r('size', "'small' | 'medium' | 'large'", 'inherited', 'Height 18 / 20 / 24. Without it — the size of the ancestors'),
        r('closable', 'boolean', 'false', 'The cross. Fires close, does not touch the array itself'),
        r('clickable', 'boolean', 'false', 'A pointer cursor (a clickable chip), as TaoListItem / TaoTable'),
        r('color / background / borderColor', 'string', '—', 'Override the tokens by hand'),
      ],
      slots: 'default — the text. #prefix — an avatar or an icon on the left.',
    },
  ],
  loader: [
    {
      title: 'TaoLoader',
      rows: [
        r('size', 'number | string', '80', 'The size. A number is px'),
        r('color', 'string', 'accent token', 'The dot colour'),
        r('inline', 'boolean', 'false', 'Inline, without block centring'),
      ],
    },
  ],
  image: [
    {
      title: 'TaoImage',
      rows: [
        r('src', 'string', "''", 'The image address'),
        r('alt', 'string', "''", 'The alternative text'),
        r('lazy', 'boolean', 'false', 'The native loading="lazy"'),
        r('pixelated', 'boolean', 'false', 'image-rendering: pixelated'),
        r('placeholderText', 'string', "'No image available'", 'The text if src is empty or fails'),
      ],
    },
  ],
  avatar: [
    {
      title: 'TaoAvatar',
      rows: [
        r('src', 'string', "''", 'A photo. If empty — initials from name'),
        r('name', 'string', "''", 'For the initials and alt'),
        r('size', "'small' | 'medium' | 'large'", "'medium'", '24 / 32 / 48px. Content, does not inherit the size of ancestors.'),
        r('dot', 'boolean | tone', 'false', 'The status dot. true = success'),
        r('count', 'number | string', '—', 'A badge. 0 and empty are not drawn, >99 → 99+'),
      ],
    },
  ],
  icon: [
    {
      title: 'TaoIcon',
      rows: [
        r('name', 'string', '—', 'tao-… is a built-in SVG; a name from registerTaoIcons; any other name is the class icon-{name} of your font. Required'),
        r('size', 'number', '—', 'Pixels. Without it an SVG icon is 1em (follows the font size)'),
        r('margin', 'string', "'0px'", 'The outer margin'),
        r('invert', 'boolean', 'false', 'Invert the colour'),
      ],
      slots: '#prefix / #postfix — next to the icon. registerTaoIcons({ name: { body, viewBox? } }) adds your own SVGs; the prefix tao- is reserved.',
    },
  ],
}
