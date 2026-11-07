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

**Rule.** Every button is `variant="ghost" tone="neutral"`, an icon with an `aria-label`. A toggle is `v-model:pressed`. Group related tools with `TaoToolbarGroup` and split the groups with `TaoToolbarSeparator`. Leave the size medium: a small toolbar is hard to hit (see "Choosing a size").

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
  <TaoSelect v-model="palette" :options="palettes" :clearable="false" aria-label="Palette" />
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

**Don't** (Red on the safe button, the accent on the one that deletes):

```vue
<TaoFlex justify="flex-end" :gap="8">
  <TaoButton variant="secondary" tone="danger">Keep</TaoButton>
  <TaoButton icon="tao-trash">Delete</TaoButton>
</TaoFlex>
```

**Why.** The accent says "the normal main thing", and a delete wearing it looks like any other action. Red on the safe button inverts the warning: the colour then points at the wrong choice.
