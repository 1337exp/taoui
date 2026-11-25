# TaoUI starters: whole screens to begin a project from

Generated from the Guide of the showcase (`showcase/guide/starters/`) by `npm run skill`; do not edit by hand.
Start a new app from the starter that fits instead of composing the shell from scratch, and keep its decisions unless
the app has a reason not to. Each starter is live on its own page of the showcase, `#starter-<id>` (the Guide book).
A starter uses the public API only: no `:deep(.tao-…)`, no private `--_…` variables of a component.

## App shell with a side menu

**When.** An app of a few sections that people keep open: notes, a tracker, a planner, an admin. The model is Axis and NextUp.

**Why it is built this way:**

1. One `TaoShell` is the whole shell: it puts a `TaoNav` with `layout="auto"` on the list `items` and makes three looks from it, a side panel with labels from 840px, a rail of icons below, a bar at the bottom under 600px. It measures its own width, not the window: a split view or an embedded frame gets the right look too. Do not build the shell by hand: the project chip, the phone header and the footer are in it already.
2. The shell fills the window and the page scrolls inside its own box, not as a document: the navigation never moves, and no page scrollbar comes and goes between a short section and a long one. The page is the `<main>` landmark, and the first stop of the tab order is a «Skip to content» link to it. `<TaoHosts />` is inside, so `toast()` and `confirm()` work without anything else.
3. The main action is the prop `action` (`{ label, icon?, shortcut? }`) and the event `action`: one filled button above the items, round above the bar on a phone and on the rail, wide with its text on the side panel. One accent action per screen: the rest of the shell is quiet.
4. The project the app works in (a workspace, a portfolio, an account) is `projects` and `v-model:project`: a chip under the main action with a menu of the projects, the current one checked, and «New project» (the event `new-project`). The shell draws it and folds it to a round icon on the rail; the app keeps the list.
5. The mode, the palette and the language are one call, `createKitPrefs({ key })` (it reads what was saved, puts it on `<html>`, follows the system, saves), and the shell takes the result as `prefs`: the language switch and the theme toggle are bound to it. On a phone they go up into a thin header, shown by a container query on the same 600px as the bar: no JavaScript, no second breakpoint.
6. Settings are a section of the menu with their own page, in a column one can read (560px), not a modal and not a drawer from the far edge: on a wide screen the menu is where the eye already is.
7. An empty section says what lands in it and offers the action (`TaoEmpty`), instead of a blank page.

**The file.** Copy it as `App.vue` and give its parent the height of the window: `html, body, #app { height: 100%; margin: 0; }`.

```vue
<script setup>
// The shell of an app: a side panel with labels on a wide window, a rail of icons on a narrower one, a bar at the bottom
// on a phone. Copy it as App.vue and give its parent the height of the window:
//   html, body, #app { height: 100%; margin: 0; }
// Оболочка приложения: боковая панель с подписями на широком окне, рейка иконок на узком, панель снизу на телефоне.
// Скопируйте её как App.vue и дайте родителю высоту окна (html, body, #app { height: 100%; margin: 0; }).
import { computed, ref } from 'vue'
import { TaoButton, TaoEmpty, TaoShell, TaoSwitch, createKitPrefs } from '@1337exp/taoui'

// the mode, the palette and the language of the product: read, put on <html>, followed, saved
const prefs = createKitPrefs({ key: 'myapp' })

const section = ref('inbox')
const compactList = ref(false)

const items = computed(() => [
  { id: 'inbox', label: 'Inbox', icon: 'tao-file', badge: 3 },
  { id: 'projects', label: 'Projects', icon: 'tao-folder' },
  { id: 'calendar', label: 'Calendar', icon: 'tao-calendar' },
  { id: 'settings', label: 'Settings', icon: 'tao-settings' },
])
const title = computed(() => items.value.find((item) => item.id === section.value)?.label ?? '')

// the project the app works in: the shell shows the chip and the menu, the app keeps the list
const projects = ref([
  { id: 'home', title: 'Home' },
  { id: 'work', title: 'Work' },
])
const project = ref('home')

function create() {
  section.value = 'inbox'
}
</script>

<template>
  <TaoShell
    v-model="section"
    v-model:project="project"
    :items="items"
    :projects="projects"
    :action="{ label: 'New', shortcut: 'N' }"
    :languages="['en', 'ru']"
    :prefs="prefs"
    label="Sections"
    @action="create"
  >
    <div class="app-page">
      <section v-if="section === 'settings'" class="app-settings">
        <h1 class="tao-heading-4">Settings</h1>
        <TaoSwitch v-model="compactList" label="Compact list" />
      </section>
      <template v-else>
        <h1 class="tao-heading-4">{{ title }}</h1>
        <TaoEmpty :title="`Nothing in ${title.toLowerCase()} yet`">
          New things land here.
          <template #action>
            <TaoButton icon="tao-plus" @click="create">New</TaoButton>
          </template>
        </TaoEmpty>
      </template>
    </div>
  </TaoShell>
</template>

<style scoped>
/* the shell already scrolls the page inside its own box and is the <main> landmark: the page only needs its padding */
.app-page {
  padding: var(--tao-space-6);
}

.app-page h1 {
  margin: 0 0 var(--tao-space-5);
}

/* settings are a section: a column of a width one can read, not a form across the whole screen */
.app-settings {
  display: grid;
  gap: var(--tao-space-4);
  max-width: 560px;
}
</style>
```

## The frame of an editor (an IDE layout)

**When.** An editor of something that has a workspace in the middle and tools around it: a level editor, a scene, a document, a node graph, a code editor. The model is WebStorm; Deck of Bones stage 2 is the first user.

**Why it is built this way:**

1. One `TaoWorkbench` is the whole frame: a top bar, a left and a right rail, a status bar at the bottom, the workspace in the middle. Do not build it from splits by hand: the dividers, the gaps, the landmarks (`header`, two `nav`, `main`, `footer`, each named), the skip link and `F6` between the regions are in it already.
2. Every bar has a start and an end: the slots `top-start` / `top-end`, `left-start` / `left-end`, `right-start` / `right-end`, `bottom-start` / `bottom-end`. The menu goes to `top-start`, the theme toggle to `top-end`, the caret and the encoding to `bottom-end`. A rail puts its tools before `start`.
3. The tools are data: `leftTools`, `rightTools`, `bottomTools` of `{ id, label, icon, shortcut?, badge?, badgeLabel? }`. The button gets its hint with the key, a pressed state and the badge for free, a press opens the panel (`v-model:left`, `v-model:right`, `v-model:bottom` hold the id of the open tool), and the next press closes it. A closed panel is not drawn and its divider is gone.
4. The content of a panel is a slot per side (`left-panel`, `right-panel`, `bottom-panel`) that gets the open `tool`, so one slot serves every tool of the side. The sizes of the panels are `v-model:left-size` and friends, in pixels: the app keeps them, so a window comes back as it was left.
5. The panels and the workspace are darker rounded blocks over a soft glow in the top left corner (the colour of the palette; `glow` turns it off). The blocks are divided by `TaoSplit`, the right and the bottom panel are anchored to their own edge (`anchor="end"`), so resizing the window changes the workspace and not the panels.

**The file.** Copy it as `App.vue` and give its parent the height of the window: `html, body, #app { height: 100%; margin: 0; }`. Put your editor where the workspace text is.

```vue
<script setup>
// The frame of an editor, as in an IDE: a top bar with the menu, a left and a right rail of tools, a status bar at the bottom, tool windows
// that the rails open, and the workspace in the middle. Copy it as App.vue and give its parent the height of the window:
//   html, body, #app { height: 100%; margin: 0; }
// Рамка редактора, как в IDE: верхняя полоса с меню, левая и правая рейки инструментов, внизу строка состояния, окна инструментов, которые
// открывают рейки, и рабочая область посередине. Скопируйте её как App.vue и дайте родителю высоту окна (html, body, #app { height: 100%; margin: 0; }).
import { computed, ref } from 'vue'
import { TaoKbd, TaoMenubar, TaoTag, TaoThemeToggle, TaoWorkbench, createKitPrefs } from '@1337exp/taoui'

const prefs = createKitPrefs({ key: 'myeditor' })

// which tool is open on each side (null: none), and the sizes of the panels, px: keep them in storage if you want them back next time
const left = ref('files')
const right = ref(null)
const bottom = ref(null)
const leftSize = ref(260)
const rightSize = ref(260)
const bottomSize = ref(200)

const leftTools = [
  { id: 'files', label: 'Files', icon: 'tao-folder', shortcut: 'Alt+1' },
  { id: 'search', label: 'Search', icon: 'tao-search', shortcut: 'Alt+2' },
]
const rightTools = [{ id: 'inspector', label: 'Inspector', icon: 'tao-settings', shortcut: 'Alt+3' }]
const bottomTools = [
  { id: 'output', label: 'Output', icon: 'tao-monitor', shortcut: 'Alt+4' },
  { id: 'problems', label: 'Problems', icon: 'tao-alert-triangle', badge: 2, badgeLabel: '2 problems' },
]

const menu = computed(() => [
  { id: 'file', label: 'File', items: [{ id: 'new', label: 'New' }, { id: 'open', label: 'Open…' }] },
  { id: 'edit', label: 'Edit', items: [{ id: 'undo', label: 'Undo' }, { id: 'redo', label: 'Redo' }] },
  { id: 'view', label: 'View', items: [{ id: 'panels', label: 'Panels' }] },
])
const line = ref(12)
</script>

<template>
  <TaoWorkbench
    v-model:left="left"
    v-model:right="right"
    v-model:bottom="bottom"
    v-model:left-size="leftSize"
    v-model:right-size="rightSize"
    v-model:bottom-size="bottomSize"
    :left-tools="leftTools"
    :right-tools="rightTools"
    :bottom-tools="bottomTools"
  >
    <template #top-start>
      <TaoMenubar :items="menu" bordered />
    </template>
    <template #top-end>
      <TaoThemeToggle v-model="prefs.mode.value" system :apply="false" />
    </template>

    <template #bottom-start>
      <span>main</span>
    </template>
    <template #bottom-end>
      <TaoTag size="small">UTF-8</TaoTag>
      <TaoKbd>Ln {{ line }}</TaoKbd>
    </template>

    <template #left-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}: your tree, your search.</p>
    </template>
    <template #right-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}: the properties of the selection.</p>
    </template>
    <template #bottom-panel="{ tool }">
      <p class="pane-text">{{ tool.label }}</p>
    </template>

    <p class="pane-text">The workspace: your editor, a scene or a canvas.</p>
  </TaoWorkbench>
</template>

<style scoped>
.pane-text {
  margin: 0;
  padding: var(--tao-space-4);
  color: var(--tao-color-text-muted);
}
</style>
```

## A list and the open item

**When.** A section of records people go through one by one: notes, mail, tasks, clients. The model is the notes of NextUp.

**Why it is built this way:**

1. Side by side when there is room, one at a time when there is not: the list, then the item with a back button. The width is the room of the starter, measured on an outer box by a container query (`list-detail`), not the window: in the shell beside a side panel it switches later than the window would say. A container query cannot ask an element about its own width, so the outer box measures and the inner grid lays out.
2. Each pane scrolls by itself (`overflow: auto` on both, `min-height: 0` so a grid row can be shorter than its content): the list keeps its place while the item is read.
3. The list is `TaoList roving` with `clickable` rows: one Tab stop, the arrows move between the rows, Tab comes back to the open one. The open row is `selected` (a tint and `aria-current`), not an accent text.
4. The focus follows the eye in the single pane: opening an item moves it to the item heading (`tabindex="-1"`), Back and Escape bring it to the row it came from. Side by side the focus stays in the list, so the arrows keep walking it.
5. The actions of the item are quiet icon buttons (`variant="ghost" tone="neutral"`, each with an `aria-label`); the one that destroys is `tone="danger"`. The accent of the screen stays for the main action of the shell.
6. Nothing open on a wide screen is a `TaoEmpty` that says what opens there; a search with no match says so in the `#empty` slot of the list, with the query.
7. The text of the item is a column one can read (640px), not a line across a wide screen.

**The file.** Put it in the page of the app shell (or any box with a height): it fills its parent and lays itself out by the room it gets.

```vue
<script setup>
// A list and the open item: side by side when there is room, one at a time when there is not (the list, then the item
// with a way back). Put it in the page of the app shell, or anywhere with a height: it fills its parent.
// Список и открытая запись: рядом, когда есть место, по одному, когда нет (список, потом запись с возвратом). Кладите
// в страницу оболочки приложения или в любой блок с высотой: каркас занимает родителя.
import { computed, nextTick, ref } from 'vue'
import { TaoButton, TaoEmpty, TaoIcon, TaoInput, TaoList, TaoListItem } from '@1337exp/taoui'

const notes = ref([
  { id: 1, title: 'Plan the week', date: 'Mon', text: 'Three things that matter, the rest can wait.' },
  { id: 2, title: 'Call the bank', date: 'Tue', text: 'Ask about the rate of the deposit and the fee for an early close.' },
  { id: 3, title: 'Ideas for the trip', date: 'Wed', text: 'A train instead of a plane; two nights by the lake.' },
  { id: 4, title: 'Books to read', date: 'Thu', text: 'One novel, one book about design, one about money.' },
  { id: 5, title: 'Fix the bike', date: 'Fri', text: 'The back brake squeaks; new pads, check the chain.' },
])

const query = ref('')
const openId = ref(null)
const list = ref(null)
const heading = ref(null)
const back = ref(null)

const shown = computed(() => {
  const q = query.value.trim().toLowerCase()
  return q ? notes.value.filter((n) => n.title.toLowerCase().includes(q)) : notes.value
})
const open = computed(() => notes.value.find((n) => n.id === openId.value) ?? null)

// one pane at a time when the back button is shown (the container query below decides, not the window)
const single = () => back.value?.$el && getComputedStyle(back.value.$el).display !== 'none'

async function choose(id) {
  openId.value = id
  await nextTick()
  // the list is gone in the single pane: the focus goes to the item, so a screen reader hears where it is
  if (single()) heading.value?.focus()
}

async function close() {
  const from = openId.value
  openId.value = null
  await nextTick()
  // back to the row it came from (its button is the stop of the row)
  list.value?.querySelector(`[data-note="${from}"] button`)?.focus()
}

function remove() {
  notes.value = notes.value.filter((n) => n.id !== openId.value)
  openId.value = null
}
</script>

<template>
  <div class="ld-room">
    <div class="ld" :class="{ 'ld--open': open }" @keydown.esc="open && single() && close()">
      <section ref="list" class="ld__list" aria-label="Notes">
        <TaoInput v-model="query" placeholder="Search" aria-label="Search notes">
          <template #prefix><TaoIcon name="tao-search" /></template>
        </TaoInput>
        <TaoList :bordered="false" roving label="Notes" :empty="shown.length === 0">
          <TaoListItem
            v-for="note in shown"
            :key="note.id"
            :data-note="note.id"
            clickable
            :selected="note.id === openId"
            :title="note.title"
            :description="note.text"
            @click="choose(note.id)"
          >
            <template #suffix><span class="ld__date">{{ note.date }}</span></template>
          </TaoListItem>
          <template #empty>Nothing found for “{{ query }}”.</template>
        </TaoList>
      </section>
  
      <section class="ld__item">
        <template v-if="open">
          <header class="ld__head">
            <TaoButton ref="back" class="ld__back" variant="ghost" tone="neutral" icon="tao-chevron-left" aria-label="Back to the list" @click="close" />
            <h2 ref="heading" class="tao-heading-5" tabindex="-1">{{ open.title }}</h2>
            <TaoButton variant="ghost" tone="neutral" icon="tao-edit" aria-label="Edit" />
            <TaoButton variant="ghost" tone="danger" icon="tao-trash" aria-label="Delete" @click="remove" />
          </header>
          <p class="ld__meta">{{ open.date }}</p>
          <p>{{ open.text }}</p>
        </template>
        <TaoEmpty v-else class="ld__none" title="Pick a note">Its text opens here.</TaoEmpty>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* the room is measured on the outer box and the layout is done on the inner one (a container query cannot ask an
   element about its own width): the layout follows the room it is given, not the window */
.ld-room {
  container: list-detail / inline-size;
  height: 100%;
}

.ld {
  display: grid;
  grid-template-columns: minmax(260px, 360px) minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

/* each pane scrolls by itself: the list keeps its place while the item is read */
.ld__list,
.ld__item {
  min-height: 0;
  overflow: auto;
}

.ld__list {
  display: flex;
  flex-direction: column;
  gap: var(--tao-space-3);
  padding: var(--tao-space-4);
  border-inline-end: 1px solid var(--tao-color-border);
}

.ld__item {
  padding: var(--tao-space-4) var(--tao-space-6);
}

.ld__head {
  display: flex;
  align-items: center;
  gap: var(--tao-space-1);
}

.ld__head h2 {
  flex: 1;
  min-width: 0;
  margin: 0;
}

.ld__head h2:focus {
  outline: none;
}

/* the item is a column one can read, not a line across a wide screen */
.ld__item p {
  max-width: 640px;
}

.ld__meta,
.ld__date {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-xs);
}

.ld__back {
  display: none;
}

.ld__none {
  height: 100%;
}

/* no room for two: the list, or the open item with a way back */
@container list-detail (width < 640px) {
  .ld {
    grid-template-columns: minmax(0, 1fr);
  }

  .ld__list {
    border-inline-end: 0;
  }

  .ld__item {
    padding: var(--tao-space-3) var(--tao-space-4);
  }

  .ld--open .ld__list,
  .ld:not(.ld--open) .ld__item {
    display: none;
  }

  .ld__back {
    display: inline-flex;
  }
}
</style>
```
