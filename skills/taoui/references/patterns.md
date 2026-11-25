# TaoUI patterns: what to use when, and why

Generated from the Guide of the showcase (`showcase/guide/patterns/`) by `npm run skill`; do not edit by hand.
Read it before you compose a screen. The page with the live examples: showcase `#patterns` (the Guide book).
The examples use your own icons (`bold`, `italic`) registered with `registerTaoIcons`; `tao-*` icons are built in.

## The accent budget

The accent colour (amber by default) is a signal, and a signal that is on everywhere says nothing. Spend it on three things only: the one main action of a region, the current or selected item, the focus ring.

1. One filled accent button (`variant="primary"`) per region. Next to it: `secondary`, or `ghost` with `tone="neutral"`, or `text`.
2. Quiet tools (a toolbar, the actions of a row, icon buttons in a header) are `variant="ghost" tone="neutral"`. A `ghost` or `text` button without `tone` is accent-coloured: use it only for an action that really is the main one in its place.
3. Hover, the row under the arrows and a pressed toggle are neutral: the wash behind them is the text colour at a low alpha (`--tao-tone-wash`, `--tao-color-hover`), and the text goes up to `text-strong`. A wash or a fill is never the accent. The accent appears when a thing is chosen, not when the pointer is over it. A component must not tint its hover with the accent, and your own styles must not either.
4. Status is `tone` (`success`, `danger`, `warning`, `info`), always with words, never colour alone. A destructive action is `tone="danger"` on the button that destroys; the safe button stays quiet.
5. Colours come from roles (`var(--tao-color-…)`), never a hex or an `rgba()` in app CSS.

## The text ladder

Text has five steps, from `text-strong` to `text-disabled`, and each says one thing. Body copy and quiet controls sit on `text` (a soft grey, easy on a dark page); white is kept for what must stand out, so it still does. This is the order in the kit: pick the step by the job of the text, never by taste, and never write a colour of your own.

| Role | Dark theme | Use it for |
|---|---|---|
| `--tao-color-text-strong` | #ffffff | Headings, titles of a card, a modal or an alert, the value that is the point (a figure, a slider value), and the hover of a quiet control. Never a control at rest. |
| `--tao-color-text` | #bfbfbf | Body copy and every control at rest: buttons (`secondary`, `ghost` and `text` with `tone="neutral"`), field values, form labels, menu items, table cells. |
| `--tao-color-text-subtle` | #999999 | The option that is not chosen in a group: idle tabs and segments. |
| `--tao-color-text-muted` | #8a8a8a | Captions, hints, descriptions, table headers, placeholders, breadcrumb links, icons that do nothing. |
| `--tao-color-text-disabled` | #444444 | What cannot be used now. |

1. Hover moves one step up the ladder: `muted` to `text`, `text` to `strong`. A control never gets dimmer under the pointer.
2. The accent is not a step of the ladder. It is for the main action, what is selected or current, the focus and a link in running text. A quiet tool is never accent-coloured at rest.
3. Status colours (`success`, `danger`, `warning`, `info`) say a status, with words beside them. They are not a way to make text louder.
4. Your own markup takes the same roles: `color: var(--tao-color-text)` for body, `var(--tao-color-text-strong)` for a heading, `var(--tao-color-text-muted)` for a hint. Do not paint a whole block `strong` to make it important: when everything is white, nothing is.

## Choosing a size

Medium is the default, and the right answer unless there is a reason. A size is a decision about a region of the screen, not about a button: how many controls sit close together, how much they matter, and what presses them (a mouse or a finger).

| Size | Height | Text | Side padding | Use it for | What it costs |
|---|---|---|---|---|---|
| `small` | 26px | 12px | 12px | Only where a lot sits close together and a mouse is the pointer: the actions in a row of a dense table or list, a power-user tool with dozens of controls. Not a toolbar or an editor panel, not a filter or settings bar, not a popover or a menu: an editor that people use all day, above all one for clients, stays medium, or it grows small buttons that are hard to hit. | A small hit area (26px: above the 24px WCAG 2.2 minimum, below the 44px a finger needs) and 12px text. Not for the main action of a screen, not where the only pointer is a finger. |
| `medium` | 36px | 14px | 16px | Forms and the content of the page. The default: do not set `size` at all. | None; it is the scale everything else is drawn for. |
| `large` | 44px | 16px | 24px | The one thing the screen is for: a sign-in or checkout button, a call to action on a landing page, a kiosk, a form people fill in on a phone, a reader who needs bigger targets. | Takes room and is loud: in a dense panel it pushes the rest out. |

Density is added on top of the size (the height and the padding, not the font), as a class on a container or on `<html>`:

| Density | small | medium | large | |
|---|---|---|---|---|
| `tao-density-compact` | 22px | 32px | 40px | dense tools and tables |
| `tao-density-default` | 26px | 36px | 44px | the default |
| `tao-density-comfortable` | 34px | 44px | 52px | a touch-sized row |
| `tao-density-auto` | comfortable under a finger (`pointer: coarse`), default with a mouse | | | |

1. Do not change the size unless you know exactly why. Leave medium: it is the scale everything is drawn for. A small control is a deliberate choice for a dense region, and you should be able to name the region and what is crowded in it; "it looks big" is not a reason, and neither is "it is a utility thing".
2. Decide for a region, with one class on the container (`class="tao-size-small"`), never for a control (see "Controls side by side").
3. Importance is `variant` and `tone`, not size. Inside one region the main action is as tall as its neighbours; a bigger control belongs to a different region (a hero block), not to emphasis in a row.
4. Small is for the supporting cast. If the control is why the person came to the screen, it is medium or large.
5. A phone is a question of density, not of size: put `tao-density-auto` on `<html>`. The same medium becomes 44px under a finger and stays 36px with a mouse; the font does not change. `large` on a phone is for the hero action only.
6. Do not shrink to fit. If it does not fit, wrap, scroll or move the rest into a menu: small controls that are cramped are still cramped.
7. Where did the small come from? The size is inherited. In DevTools read the computed `--tao-size` and `--tao-density` on the element, then walk up to the ancestor that sets `tao-size-*` / `tao-density-*` (or a `size` on a `TaoFormField` / `TaoInputGroup`, or a pinned `--tao-control-height`). Nothing else changes the size of a control.

## A toolbar of tools

**When.** A bar of formatting or editing tools: text style toggles, undo and redo, a few actions.

**Rule.** Every button is `variant="ghost" tone="neutral"`, an icon with an `aria-label`. A toggle is `v-model:pressed`. Group related tools with `TaoToolbarGroup` and split the groups with `TaoToolbarSeparator`. Leave the size medium: a small toolbar is hard to hit (see "Choosing a size"). If it has to stay one row (a phone), add `overflow` to the toolbar instead of making the buttons smaller: the groups that do not fit go under «⋮», and `pinned` keeps a group (undo and redo) in sight.

**Do:**

```vue
<TaoToolbar label="Formatting">
  <TaoToolbarGroup label="Text style">
    <TaoButton v-model:pressed="bold" variant="ghost" tone="neutral" icon="bold" aria-label="Bold" />
    <TaoButton v-model:pressed="italic" variant="ghost" tone="neutral" icon="italic" aria-label="Italic" />
  </TaoToolbarGroup>
  <TaoToolbarSeparator />
  <TaoButton variant="ghost" tone="neutral" icon="tao-undo" aria-label="Undo" />
  <TaoButton variant="ghost" tone="neutral" icon="tao-redo" aria-label="Redo" />
</TaoToolbar>
```

**Don't** (No `tone`: every tool is amber):

```vue
<TaoToolbar label="Formatting">
  <TaoToolbarGroup label="Text style">
    <TaoButton v-model:pressed="bold" variant="ghost" icon="bold" aria-label="Bold" />
    <TaoButton v-model:pressed="italic" variant="ghost" icon="italic" aria-label="Italic" />
  </TaoToolbarGroup>
  <TaoToolbarSeparator />
  <TaoButton variant="ghost" icon="tao-undo" aria-label="Undo" />
  <TaoButton variant="ghost" icon="tao-redo" aria-label="Redo" />
</TaoToolbar>
```

**Why.** In a toolbar every button is a tool and none is the main one, so none may take the accent. Left amber, the bar shouts, and the one thing that must stand out, which toggles are on, is lost: it is the same colour as the rest. In neutral the pressed toggle is the only lit thing.

## A block of text and a quiet action

**When.** A panel with a title, a few lines of copy, a hint and one quiet action: a settings block, an info card.

**Rule.** Title `text-strong`, copy `text`, hint `text-muted`, and the action `variant="ghost" tone="neutral"`. Every step does its own job, and the colours are roles, not hex.

**Do:**

```vue
<div class="tao-panel" style="padding: 16px; display: grid; gap: 6px; justify-items: start">
  <strong style="color: var(--tao-color-text-strong)">Billing</strong>
  <span style="color: var(--tao-color-text)">Your plan renews on 1 December.</span>
  <small style="color: var(--tao-color-text-muted)">Invoices go to the owner of the account.</small>
  <TaoButton variant="ghost" tone="neutral">Change plan</TaoButton>
</div>
```

**Don't** (The copy is `text-strong`, the hint is accent, the action has no `tone`: three colours, no order):

```vue
<div class="tao-panel" style="padding: 16px; display: grid; gap: 6px; justify-items: start">
  <strong style="color: var(--tao-color-text-muted)">Billing</strong>
  <span style="color: var(--tao-color-text-strong)">Your plan renews on 1 December.</span>
  <small style="color: var(--tao-color-accent)">Invoices go to the owner of the account.</small>
  <TaoButton variant="ghost">Change plan</TaoButton>
</div>
```

**Why.** The eye reads the colour as rank. With the copy as bright as the title the title no longer leads; an accent hint and an amber action look like two main things on one panel. With the ladder the title leads, the copy reads, the hint steps back, and the one quiet action is found when it is needed.

## The footer of a form or dialog

**When.** The buttons at the bottom of a form, a modal or a drawer: confirm and cancel.

**Rule.** The confirming action is the one primary button, at the end. Cancel is `secondary` (or `ghost` with `tone="neutral"`), before it.

**Do:**

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary">Cancel</TaoButton>
  <TaoButton>Save</TaoButton>
</TaoFlex>
```

**Don't** (Two filled accent buttons: Cancel looks as important as Save):

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton>Cancel</TaoButton>
  <TaoButton>Save</TaoButton>
</TaoFlex>
```

**Why.** Two filled accent buttons side by side make the eye choose between them. The footer has one answer the user is expected to give; the other button is the way out, and it looks like one.

## Controls side by side: one size

**When.** A row or a panel with several controls: a segmented switch, a select, buttons, inputs. Also the content of a popover.

**Rule.** Put one context class on the container: `class="tao-size-small"` (and `tao-density-*`). Do not pass `size` to some of the controls, and do not pin a height (`--tao-control-height: 32px`, `height: 32px`) on one of them. An explicit `size` is for the one control that must stand out. A `TaoPopover` panel, a select list and a combobox list carry the size and the density of where they hang from.

**Do:**

```vue
<TaoFlex class="tao-size-small" align="center" :gap="8">
  <TaoSegmented v-model="mode" aria-label="Mode">
    <TaoSegmentedOption value="grid">Grid</TaoSegmentedOption>
    <TaoSegmentedOption value="list">List</TaoSegmentedOption>
  </TaoSegmented>
  <TaoSelect v-model="palette" :items="palettes" :clearable="false" aria-label="Palette" />
  <TaoButton variant="secondary">Apply</TaoButton>
</TaoFlex>
```

**Don't** (On purpose: `size="small"` on the switch only, so it is shorter than the select and the button beside it):

```vue
<TaoFlex align="center" :gap="8">
  <TaoSegmented v-model="mode" size="small" aria-label="Mode">
    <TaoSegmentedOption value="grid">Grid</TaoSegmentedOption>
    <TaoSegmentedOption value="list">List</TaoSegmentedOption>
  </TaoSegmented>
  <TaoSelect v-model="palette" :items="palettes" :clearable="false" aria-label="Palette" />
  <TaoButton variant="secondary">Apply</TaoButton>
</TaoFlex>
```

**Why.** `size` is a prop with a default of medium. Set it on the controls you remember and the rest stay medium: the row comes out uneven, a small switch beside a tall select. A pinned height is the same thing by hand. The class makes them one by construction, also for the controls added later and for a panel in the body.

## A segmented switch: short captions

**When.** A short choice with every option in view: a period, a mode, a view of a list, how often.

**Rule.** `TaoSegmented` takes 2 to 5 options (about five on a phone), each a single word or a short noun phrase, and of a similar length. What needs explaining goes into the `legend` or a hint of the field, not into a caption. A caption that is a sentence, or more than five options, is a `TaoRadioGroup` (or a `TaoSelect` for many). Test with your longest language: a Russian or a German caption is usually longer than the English one. Since 5.49.2 a caption that still does not fit wraps to a second line and ends in an ellipsis, with the full text in `title`: that is a safety net for the unforeseen, not a layout to design for.

**Do:**

```vue
<div style="width: 240px">
  <TaoSegmented v-model="every" legend="How often will we charge you?" block>
    <TaoSegmentedOption value="month">Monthly</TaoSegmentedOption>
    <TaoSegmentedOption value="once">Once</TaoSegmentedOption>
  </TaoSegmented>
</div>
```

**Don't** (Whole sentences as captions in a narrow column: they wrap, and the switch turns into two blocks of text):

```vue
<div style="width: 240px">
  <TaoSegmented v-model="every" legend="Billing" block>
    <TaoSegmentedOption value="month">Charge me every month until I cancel</TaoSegmentedOption>
    <TaoSegmentedOption value="once">Charge me once, at the end of the year</TaoSegmentedOption>
  </TaoSegmented>
</div>
```

**Why.** A segmented switch is a row of equal-width buttons that you compare at a glance, and that only works when the options are short and alike. Apple's Human Interface Guidelines ask for no more than about five segments on iPhone, for segments of similar size ("it doesn't look good if content fills some segments but not others") and for nouns as labels; the GitLab Pajamas design system wants 2 or 3 options, never over 5, with a one-word label, and sends longer lists to a select. One long caption has two bad outcomes: it widens every segment (all are equal) until the control no longer fits, or it wraps, and then the user reads the options instead of seeing them, which is the job of a radio list. The cause is almost always in the design, not in the component, so the cheap fix is a shorter word and a legend, before any code.

## Switching the language

**When.** The person can change the language of the interface: a header, the footer of a side panel, a settings page.

**Rule.** Use `TaoLanguageSwitch`: a globe (`tao-globe`) that opens a list of the languages, each under its own name (`Русский`, `Deutsch`, `日本語`), the current one checked. Beside the globe it shows the name of the current language where there is room, and `icon-only` where there is not (a phone). Put it next to the theme toggle: the two are switches of the whole interface, not settings of a screen. The switch writes `<html lang>` and says the code in `v-model`; the texts, where the choice is stored and `setTaoLocale` for the built-in texts are the app's. Not flags, not codes in a `TaoSegmented`.

**Do:**

```vue
<TaoFlex align="center" :gap="8">
  <TaoLanguageSwitch v-model="lang" :languages="['en', 'ru', 'de', 'fr', 'ja']" />
  <TaoThemeToggle :apply="false" />
</TaoFlex>
```

**Don't** (Five two-letter codes in a segmented control: it fills the bar and grows with every new language):

```vue
<TaoFlex align="center" :gap="8">
  <TaoSegmented v-model="lang" aria-label="Language">
    <TaoSegmentedOption value="en">EN</TaoSegmentedOption>
    <TaoSegmentedOption value="ru">RU</TaoSegmentedOption>
    <TaoSegmentedOption value="de">DE</TaoSegmentedOption>
    <TaoSegmentedOption value="fr">FR</TaoSegmentedOption>
    <TaoSegmentedOption value="ja">JA</TaoSegmentedOption>
  </TaoSegmented>
  <TaoThemeToggle :apply="false" />
</TaoFlex>
```

**Why.** Each language is named in itself because a person who cannot read the current one must still find theirs: «Deutsch» is found by a German speaker on a page in any language, «German» only by someone who reads the page already. The W3C Internationalization guidance says the same, and adds why not flags: a flag is a country, and a language is not (many countries share one, and many have several). A code (`RU`, `JA`) is a name for programmers. A segmented control is for 2 to 5 short options that are compared at a glance (see «A segmented switch: short captions»), and a list of languages only grows, so it is a menu from the start. The globe is the sign everyone has learned for it, and `<html lang>` is what the browser, a screen reader and hyphenation read: it is easy to forget by hand, so the switch writes it.

## A destructive action

**When.** Delete, discard, reset: something that cannot be taken back.

**Rule.** `tone="danger"` on the button that destroys, the safe choice quiet (`secondary`). For a question in its own window use `await confirm({ title, message, tone: "danger" })`: it resolves to a boolean.

**Do:**

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary">Keep</TaoButton>
  <TaoButton tone="danger" icon="tao-trash">Delete</TaoButton>
</TaoFlex>
```

**Don't** (Red on the safe button, the accent on the one that deletes):

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary" tone="danger">Keep</TaoButton>
  <TaoButton icon="tao-trash">Delete</TaoButton>
</TaoFlex>
```

**Why.** The accent says "the normal main thing", and a delete wearing it looks like any other action. Red on the safe button inverts the warning: the colour then points at the wrong choice.
