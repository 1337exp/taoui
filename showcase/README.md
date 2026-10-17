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

- `App.vue` — shell: header, navigation, section list
- `nav.js` — menu groups (titles and labels are `{ en, ru }`)
- `sections.js` — which demo file goes where
- `i18n.js` — the showcase language: `lang`, `tr(en, ru)`
- `propTables.js` — prop tables, Russian (the original); `propTables.en.js` — English overlay, same shape
- `styles.css` — page chrome
- `components/` — one section per library component (`DemoButton.vue`, ...), plus `Tr.vue`, `ShowcaseSection.vue`, `PropsTable.vue`
- `demo/` — playgrounds that are *not* part of the npm package (`TypeaheadPlayground.vue` can be copied into a project)

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
