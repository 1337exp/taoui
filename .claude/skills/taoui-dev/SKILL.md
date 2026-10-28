---
name: taoui-dev
description: Work inside the TaoUI repository (E:\job\git\taoui) — how a change is made, checked, documented and merged here, the scripts that generate files, the sibling repos that consume TaoUI, and what never to do without the owner. Use for any edit to TaoUI's components, styles, tokens, palettes, showcase or docs.
---

# Working in the TaoUI repository

TaoUI is a Vue 3 kit on design tokens; 5.0.0 is a breaking major, not yet published. The user-facing guide is
[skills/taoui/SKILL.md](../../../skills/taoui/SKILL.md): read it for how the library is meant to be used.
`CONTRIBUTING.md` has the code rules (tokens, never literals; texts in `src/locale/` for `en` and `ru`; pure logic in
`src/*.ts` with a unit test).

## Never without the owner saying so

- `npm publish`, `git push`, tags, and merging into a sibling repo's `main` when it would break its build.
- Committing `docs/menubar-architecture.md` and `docs/theming-architecture.md`: the owner's own notes, untracked on
  purpose. Stage with `git add -A -- . ':!docs/menubar-architecture.md' ':!docs/theming-architecture.md'`.
- Linking `node_modules` into a worktree with a junction (`git worktree remove --force` once wiped the real folder).

## How a change goes

1. A short branch per change (`git checkout -b <topic>` from `master`).
2. The code, the test, the showcase section (`showcase/components/Demo*.vue`), the prop tables.
3. The docs, all of them: `README.md` and `README.ru.md` (same line in both), `CHANGELOG.md` (the 5.0.0 section, under the
   right heading), `MIGRATION-5.md` when something visible changes (a table row, or the «New:» line), and the status log
   at the end of `docs/v5-plan.md` (Russian).
4. The full check (below), then commit with the trailer
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`, then merge locally:
   `git checkout master && git merge --no-ff <topic>` (a one-commit fix may be `--ff-only`).

## The full check

```bash
npm run type-check                 # vue-tsc
npx vitest run                     # all tests
npm run build                      # dist/ (the CSS layer files are checked by tests too)
npm run lint:package               # publint + attw (the CJS warning is expected: ESM-only)
npm --prefix showcase run build    # the showcase compiles
npm run smoke                      # the packed tarball in a fresh Vite app
```

## Generated files: edit the source, run the script

| File | Source | Script | Guarded by |
|---|---|---|---|
| `src/styles/palettes/*.css` | `src/palettes.ts` + `src/palette.ts` | `npm run palettes` | `tests/palette.test.ts` |
| `skills/taoui/references/components.md` | `showcase/propTables.en.js` | `npm run skill` | `tests/skill.test.ts` |

## Conventions that are easy to miss

- **Comments in English and Russian**, the English first, in the style of the file you are in.
- **Prop tables:** change `showcase/propTables.js` (Russian, the source) first, then mirror it in `propTables.en.js`
  (same names, types, defaults); `tests/showcase.propTables.test.ts` holds them in step. Then `npm run skill`.
- **A new component:** register it in `src/index.ts` (import, the `components` list, the named export), add its props to
  `tests/ssr.test.ts`, a demo in `showcase/sections.js` + `showcase/nav.js` (with aliases, EN and RU), prop tables, a
  line in both READMEs, `skills/taoui/SKILL.md` names it (the skill test fails otherwise).
- **Tokens:** a role in `themes/dark.css` must exist in `light.css`; contexts (`contexts/*.css`) are classes that set
  private `--_tao-*` variables. A custom property is computed where it is declared: a context that combines two axes
  (size × density) must recompute on every class of both axes.
- **Container queries cannot ask an element about its own width**: measure on an outer element, lay out on an inner one.
- **Floating panels** go through `src/floating.ts` (`useFloating`: absolute in document coordinates, writes the position
  to the element at once), `src/dismiss.ts`, `src/layers.ts`; focus a panel with `{ preventScroll: true }`.
- **Generated palettes stay LF** (`.gitattributes`); the pin test compares content, not line endings.
- **A script a test imports has no shebang** (`scripts/generate-skill.mjs`): git checks files out with CRLF on Windows,
  and Vitest fails on a `#!` line ending in `` with a SyntaxError that points at the wrong line.

## Checking in a browser

The showcase dev server is the preview named `showcase` (port 5179, `.claude/launch.json`); it reads `src/` directly.
- After a change in `<script setup>` imports, HMR can keep a stale module: navigate with `force: true`, or restart.
- Screenshots of the pane are downscaled (about 945 → 800px): judge sharpness by measuring (computed styles, or render
  into a canvas and count soft pixels), not by eye.
- A real check uses real input where it matters (wheel, right click); `window.find` does not fire `beforematch`, a
  `#:~:text=` link does.

## Tests and happy-dom

- happy-dom has no layout: mock `getBoundingClientRect` / `clientWidth` for measuring components.
- It does not inherit custom properties from an ancestor: set the variable on the element the code reads.
- CSS rules are tested as text (`?raw` imports): parse rules with a splitter that ignores commas inside `:where(...)`.

## The sibling repos

`E:\job\git\taoux` (TaoUX, behaviour modules; its `theme/taoui.css` bridge maps `--tx-*` to 13 contract tokens),
`E:\job\git\taofx` (an editor, the best acceptance test for a TaoUI major), `E:\job\git\home` (the owner's home page).
All three follow 5.0 on a branch `taoui-5`. To test one against unpublished TaoUI: `npm pack --pack-destination <dir>`
here, then `npm install --no-save <tgz>` there (TaoUX's `npm run smoke` takes `TAOUI_TARBALL=<tgz>`).
