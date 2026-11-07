# Tao UI showcase

The live demo of `@1337exp/taoui`: every component with examples, prop tables and copy-ready snippets.
It reads the library straight from `src/` (no `npm run build` first) and imports it under its published name,
so each example can be pasted into a real project as is.

## Run

```bash
cd showcase
npm install
npm run dev          # http://localhost:5173 (or the next free port)
npm run build        # static site in showcase/dist, relative paths: drop it into any folder
npm run preview
```

From the repo root: `npm run showcase` and `npm run showcase:build`.

The header switches **language** (EN / RU) and **theme** (dark / light). `?lang=ru` in the URL pins the language;
otherwise the saved choice, then the browser language, then English.

## Layout

The showcase is three books under one shell. A page lives in exactly one of them; `tests/showcase.books.test.ts` keeps ids
unique and every menu entry wired to a page.

| Book | What goes in | Where the pages are |
|---|---|---|
| **Components** | one page per component: variants, states, props. A page about several components is a demo | `components/` |
| **Demos** | complex scenes made of several components, on the public API only; each says what it proves | `demo/` |
| **Guide** | what to use when and why: the foundations (layers, type, surfaces, language, contrast), recommendations and templates | `guide/` (the helper blocks of its pages stay in `layers/` and `a11y/`) |

- `App.vue` — shell: header, settings bar with the book tabs, the open book. The address says the book (`#/guide`) or a section (`#button` opens the book that holds it)
- `books/index.js` — the three books (title, rule, menu, lazy `load` of the pages)
- `books/<book>.nav.js` — the menu groups of a book (titles and labels are `{ en, ru }`)
- `books/<book>.sections.js` — which page file goes where; fetched only when the book is opened
- `books/BookView.vue` — the menu, the search and the pages of one book
- `i18n.js` — the showcase language: `lang`, `tr(en, ru)`
- `propTables.js` — prop tables, Russian (the original); `propTables.en.js` — English overlay, same shape
- `styles.css` — page chrome
- `components/` — one section per library component (`DemoButton.vue`, ...), plus the shared `Tr.vue`, `ShowcaseSection.vue`, `PropsTable.vue`
- `demo/` — playgrounds that are *not* part of the npm package (`TypeaheadPlayground.vue` can be copied into a project)
- `guide/` — the pages of the Guide (`DemoLayers.vue`, `DemoA11y.vue`, ...)
- `guide/patterns/` — the recommendations of the Guide as data: `meta.js` (the accent budget, and per pattern the situation, the
  rule, why; EN and RU) and `<id>.good.vue` / `<id>.bad.vue` (the do and the don't: rendered live on the page, their
  `<template>` is the code shown). `npm run skill` writes `skills/taoui/references/patterns.md` from the same files for AI
  assistants (`tests/showcase.patterns.test.ts` holds it). A new rule is added after something broke, not in advance

A new page: put the file in its book's folder, add the menu entry to `books/<book>.nav.js` and the line to
`books/<book>.sections.js` (the section `id` is the same in both, and in the address).

## Writing a section in two languages

Short strings go through `tr(en, ru)`; blocks of markup go through `<Tr>`:

```vue
<script setup>
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
</script>

<template>
  <ShowcaseSection id="copy" :tables="propTables['copy']">
    <h2>TaoCopy</h2>
    <Tr>
      <template #en><p>English text with <code>markup</code>.</p></template>
      <template #ru><p>Русский текст с <code>разметкой</code>.</p></template>
    </Tr>
    <TaoInput :placeholder="tr('Search…', 'Поиск…')" />
  </ShowcaseSection>
</template>
```

A missing language falls back to the other one, so a half-translated section never breaks. Prop tables: add the
section to `propTables.en.js` (copy the block, translate `note`, `slots` and Russian `title` / `default` text only).
Built-in component texts follow the page language automatically (`setTaoLocale`).

## Media

Screenshots and clips for the READMEs and the website are captured from this app: see [`docs/media`](../docs/media/README.md).
Section ids and the classes they use (`#color .tao-color-picker`, ...) are what `scripts/media.manifest.mjs` looks for.
