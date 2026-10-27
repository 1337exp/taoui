# Contributing to Tao UI

Thanks for helping. This page is the short version of how the project works.

## Setup

```bash
git clone https://github.com/1337exp/taoui.git
cd taoui
npm install
cd showcase && npm install   # the live showcase
```

| Command | What it does |
| --- | --- |
| `npm run type-check` | `vue-tsc --noEmit` |
| `npm test` | Vitest |
| `npm run build` | library build into `dist/` |
| `npm run showcase` | showcase dev server (reads `src/` directly) |
| `npm run media` | regenerate screenshots and clips, see [docs/media](docs/media/README.md) |

## Layout

```
src/            the library: components/, styles/ (tokens), locale/, plain .ts helpers
tests/          Vitest; pure logic lives in src/*.ts so it can be tested without a DOM
showcase/       the demo app that becomes the public sandbox page
docs/media/     screenshots and clips used by the READMEs and the website
scripts/        repo tooling (media capture)
```

## Rules the code follows

The API rules are listed in the README under **Conventions** — one size scale
(`small` / `medium` / `large`), tones, `v-model` + `change`, `*Text` for visible
strings and `*Label` for screen readers, booleans without `is`/`has`. A new
component should look like its neighbours.

- Colours, radii and spacing come from design tokens (`src/styles/`), never literals.
- Built-in texts go to `src/locale/` (both `en` and `ru`).
- A renamed prop may keep its old name as a deprecated alias until the next major (`src/deprecate.ts` warns in
  development and names the version that removes it); the major deletes it. Do not leave aliases behind.
- Put logic that can be pure into a `src/*.ts` file with a unit test.

## Colour tokens

Colours come in three layers, and a component reads **only the middle one**:

| Layer | Where | Example | Rule |
| --- | --- | --- | --- |
| Primitives | `src/styles/primitives.css` | `--tao-gray-600`, `--tao-pink-500` | raw scales; never used by a component |
| Semantic roles | `src/styles/semantic.css` (dark) and `themes/*.css` | `--tao-color-danger`, `--tao-color-on-danger` | the public theming API |
| Component hooks | the component's own CSS, with a fallback | `var(--tao-button-primary-text-shadow, none)` | one-off tweaks that do not deserve a role |

Why: a theme is one file that re-points roles at primitives, so a new theme (or the light one) can never leave a
component behind. Name tokens after the **role** (`danger`, `text-muted`), never after the place that uses them
(`avatar-count-text`): roles are few, places are endless, and two components needing the same thing share one token.

Rules:

1. **A role with a solid fill has an `on-<role>` partner** (`accent` / `on-accent`, `danger` / `on-danger`): the text colour for that fill.
   Never put `text`, `text-strong` or any other text token on a coloured fill: in another theme it can turn dark on dark.
   (This is why a danger button once showed black text on red in the light theme.)
2. Every status has its `on-<status>` (`on-success`, `on-warning`, `on-info`, `on-danger`): a toned Button puts text on any of
   them. Warning is yellow and wants dark text, which is exactly why one shared "text on fill" token does not work.
3. Text roles keep their order in every theme: `text-strong` ≥ `text` ≥ `text-subtle` ≥ `text-muted` ≥ `text-disabled` in emphasis.
   `subtle` is for idle controls (Segmented, Tabs), `muted` for captions and hints.
4. **Status colour as text uses `<status>-text`, as a fill uses `<status>`.** One shade cannot do both: the fill is picked for white text on top of it, the text for contrast against the page.
5. A theme file sets every colour role explicitly, even when the value equals the dark one. It must not invent roles.
6. No literal colours in components (the rainbow border is the one deliberate exception).
7. A component takes its colour from the **tone context** (`styles/tone.css`): put `toneClass(tone)` on the root and read
   `--tao-tone`, `--tao-tone-on`, `--tao-tone-text`, … Never map `success` / `danger` to colours inside a component.
8. Accent or status colour as **text** uses the `-text` token (`accent-text`, `danger-text`, …), as a fill the plain one; the tests hold both to 4.5:1.
10. A floating panel (popup, menu, tooltip) positions itself with `useFloating`, closes with `useDismiss` / `useLayer`, and moves with `useListNav`; never with its own `getBoundingClientRect` and listeners.
9. Layers and transitions come from tokens (`--tao-z-*`, `--tao-transition-base`): no literal `z-index` above content, no `transition: all`.

`tests/tokens.test.ts` enforces the mechanical part: a theme only overrides roles that exist, sets every colour role, and every
`on-*` colour has at least 3:1 contrast on its fill in both themes. Adding a role? Add it to `semantic.css` **and** every file in `themes/`.

## Pull requests

1. Branch from `master`.
2. Run `npm run type-check && npm test`.
3. Update both READMEs, the showcase section and `CHANGELOG.md`.
4. Describe the *why* in the PR.

By contributing you agree that your work is licensed under the [MIT License](LICENSE).
