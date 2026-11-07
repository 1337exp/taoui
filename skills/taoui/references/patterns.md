# TaoUI patterns: what to use when, and why

Generated from the Guide of the showcase (`showcase/guide/patterns/`) by `npm run skill`; do not edit by hand.
Read it before you compose a screen. The page with the live examples: showcase `#patterns` (the Guide book).
The examples use your own icons (`bold`, `italic`) registered with `registerTaoIcons`; `tao-*` icons are built in.

## The accent budget

The accent colour (amber by default) is a signal, and a signal that is on everywhere says nothing. Spend it on three things only: the one main action of a region, the current or selected item, the focus ring.

1. One filled accent button (`variant="primary"`) per region. Next to it: `secondary`, or `ghost` with `tone="neutral"`, or `text`.
2. Quiet tools (a toolbar, the actions of a row, icon buttons in a header) are `variant="ghost" tone="neutral"`. A `ghost` or `text` button without `tone` is accent-coloured: use it only for an action that really is the main one in its place.
3. Status is `tone` (`success`, `danger`, `warning`, `info`), always with words, never colour alone. A destructive action is `tone="danger"` on the button that destroys; the safe button stays quiet.
4. Colours come from roles (`var(--tao-color-…)`), never a hex or an `rgba()` in app CSS.

## A toolbar of tools

**When.** A bar of formatting or editing tools: text style toggles, undo and redo, a few actions.

**Rule.** Every button is `variant="ghost" tone="neutral"`, an icon with an `aria-label`. A toggle is `v-model:pressed`. Group related tools with `TaoToolbarGroup` and split the groups with `TaoToolbarSeparator`.

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

**Don't:**

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

**Don't:**

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
  <TaoSelect v-model="palette" :options="palettes" :clearable="false" aria-label="Palette" />
  <TaoButton variant="secondary">Apply</TaoButton>
</TaoFlex>
```

**Don't:**

```vue
<TaoFlex align="center" :gap="8">
  <TaoSegmented v-model="mode" size="small" aria-label="Mode">
    <TaoSegmentedOption value="grid">Grid</TaoSegmentedOption>
    <TaoSegmentedOption value="list">List</TaoSegmentedOption>
  </TaoSegmented>
  <TaoSelect v-model="palette" :options="palettes" :clearable="false" aria-label="Palette" />
  <TaoButton variant="secondary">Apply</TaoButton>
</TaoFlex>
```

**Why.** `size` is a prop with a default of medium. Set it on the controls you remember and the rest stay medium: the row comes out uneven, a small switch beside a tall select. A pinned height is the same thing by hand. The class makes them one by construction, also for the controls added later and for a panel in the body.

## A destructive action

**When.** Delete, discard, reset: something that cannot be taken back.

**Rule.** `tone="danger"` on the button that destroys, the safe choice quiet (`secondary`). For a question in its own window use `await confirm().title(…).message(…).danger()`: it resolves to a boolean.

**Do:**

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary">Keep</TaoButton>
  <TaoButton tone="danger" icon="tao-trash">Delete</TaoButton>
</TaoFlex>
```

**Don't:**

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary" tone="danger">Keep</TaoButton>
  <TaoButton icon="tao-trash">Delete</TaoButton>
</TaoFlex>
```

**Why.** The accent says "the normal main thing", and a delete wearing it looks like any other action. Red on the safe button inverts the warning: the colour then points at the wrong choice.
