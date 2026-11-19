# TaoUI starters: whole screens to begin a project from

Generated from the Guide of the showcase (`showcase/guide/starters/`) by `npm run skill`; do not edit by hand.
Start a new app from the starter that fits instead of composing the shell from scratch, and keep its decisions unless
the app has a reason not to. Each starter is live on its own page of the showcase, `#starter-<id>` (the Guide book).
A starter uses the public API only: no `:deep(.tao-…)`, no private `--_…` variables of a component.

## App shell with a side menu

**When.** An app of a few sections that people keep open: notes, a tracker, a planner, an admin. The model is Axis and NextUp.

**Why it is built this way:**

1. One `TaoNav` with `layout="auto"` (the default) makes three looks from one list: a side panel with labels from 840px, a rail of icons below, a bar at the bottom under 600px. It measures its own width, not the window: a split view or an embedded frame gets the right look too.
2. `fill`: the app takes the window and the page scrolls inside its own box, not as a document. The navigation never moves, a list and an editor side by side can each scroll on their own, and no page scrollbar comes and goes between a short section and a long one, so nothing shifts sideways.
3. The main action (`#action`) is one filled button above the items: it follows the navigation, round above the bar on a phone, round on the rail, wide with its text on the side panel. Its text is in `tao-nav__action-label`, so it stays the name of the round button. One accent action per screen: the rest of the shell is quiet.
4. The project the app works in (a workspace, a portfolio, an account) is a chip under the main action: the folder, the name, a chevron, and a menu of the projects with the current one checked and «New project». The whole chip is the button of a `TaoDropdownMenu block`, so the hover and the focus ring go round it; on the rail it folds to a round icon by `--tao-nav-compact`, on a phone it moves up into the header. Its name for a screen reader is «Project: Home», with the word hidden (`tao-sr-only`).
5. Counters are `badge-tone="neutral"`: grey on every item, the accent only on the current one, so the eye is not pulled round the menu.
6. The language and the theme are quiet tools in `#footer`, at the bottom of the side panel (`fill` puts it there). The language shows its name on the side panel and folds to the globe on the rail by itself (it reads `--tao-nav-compact`), so no `icon-only` there. The bar has no room for a footer, so on a phone the same tools go up into a thin header, shown by a container query on `tao-nav`, the same 600px as the bar: no JavaScript, no second breakpoint to keep in step.
7. Settings are a section of the menu with their own page, in a column one can read (560px), not a modal and not a drawer from the far edge: on a wide screen the menu is where the eye already is.
8. An empty section says what lands in it and offers the action (`TaoEmpty`), instead of a blank page.

**The file.** Copy it as `App.vue` and give its parent the height of the window: `html, body, #app { height: 100%; margin: 0; }`.

```vue
<script setup>
// The shell of an app: a side panel with labels on a wide window, a rail of icons on a narrower one, a bar at the bottom
// on a phone. Copy it as App.vue and give its parent the height of the window:
//   html, body, #app { height: 100%; margin: 0; }
// Оболочка приложения: боковая панель с подписями на широком окне, рейка иконок на узком, панель снизу на телефоне.
// Скопируйте её как App.vue и дайте родителю высоту окна (html, body, #app { height: 100%; margin: 0; }).
import { computed, ref } from 'vue'
import { TaoButton, TaoDropdownMenu, TaoEmpty, TaoIcon, TaoLanguageSwitch, TaoNav, TaoSwitch, TaoThemeToggle } from '@1337exp/taoui'

const section = ref('inbox')
const lang = ref('en')
const compactList = ref(false)

const items = computed(() => [
  { id: 'inbox', label: 'Inbox', icon: 'tao-file', badge: 3 },
  { id: 'projects', label: 'Projects', icon: 'tao-folder' },
  { id: 'calendar', label: 'Calendar', icon: 'tao-calendar' },
  { id: 'settings', label: 'Settings', icon: 'tao-settings' },
])

const title = computed(() => items.value.find((item) => item.id === section.value)?.label ?? '')

// the project the app works in: a menu of the projects, the current one checked, and a way to make one
const projects = ref([
  { id: 'home', title: 'Home' },
  { id: 'work', title: 'Work' },
])
const projectId = ref('home')
const project = computed(() => projects.value.find((p) => p.id === projectId.value))
const projectItems = computed(() => [
  ...projects.value.map((p) => ({ type: 'radio', id: p.id, group: 'project', label: p.title, checked: p.id === projectId.value })),
  { type: 'separator' },
  { id: 'new-project', label: 'New project', icon: 'tao-plus' },
])

function onProject(id) {
  if (id !== 'new-project') projectId.value = id
}

function create() {
  section.value = 'inbox'
}
</script>

<template>
  <TaoNav v-model="section" fill badge-tone="neutral" :items="items" aria-label="Sections">
    <!-- the main action, then the project under it: on the rail both are round icons -->
    <template #action>
      <TaoButton icon="tao-plus" shortcut="N" @click="create"><span class="tao-nav__action-label">New</span></TaoButton>
      <TaoDropdownMenu class="shell-project" block :items="projectItems" menu-label="Projects" placement="bottom-start" @select="onProject">
        <template #button>
          <span class="shell-chip" :title="project.title">
            <TaoIcon name="tao-folder" />
            <span class="tao-sr-only">Project: </span>
            <span class="shell-chip__text">{{ project.title }}</span>
            <TaoIcon class="shell-chip__more" name="tao-chevron-down" />
          </span>
        </template>
      </TaoDropdownMenu>
    </template>

    <template #footer>
      <div class="shell-tools">
        <TaoLanguageSwitch v-model="lang" :languages="['en', 'ru']" placement="top-start" />
        <TaoThemeToggle />
      </div>
    </template>

    <div class="shell-page">
      <!-- a phone: the bar has no room for the project and no footer, so they go up into a thin header -->
      <header class="shell-top">
        <TaoDropdownMenu block :items="projectItems" menu-label="Projects" placement="bottom-start" @select="onProject">
          <template #button>
            <span class="shell-chip">
              <TaoIcon name="tao-folder" />
              <span class="tao-sr-only">Project: </span>
              <span class="shell-chip__text">{{ project.title }}</span>
              <TaoIcon class="shell-chip__more" name="tao-chevron-down" />
            </span>
          </template>
        </TaoDropdownMenu>
        <div class="shell-tools">
          <TaoLanguageSwitch v-model="lang" :languages="['en', 'ru']" icon-only />
          <TaoThemeToggle />
        </div>
      </header>

      <main class="shell-main">
        <section v-if="section === 'settings'" class="shell-settings">
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
      </main>
    </div>
  </TaoNav>
</template>

<style scoped>
/* the page beside the navigation: a header for the phone, then the content that scrolls by itself */
.shell-page {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.shell-top {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: var(--tao-space-2);
  padding: var(--tao-space-2) var(--tao-space-4);
  border-bottom: 1px solid var(--tao-color-border);
  background: var(--tao-color-surface);
}

/* the same breakpoint as the bar of TaoNav: the container is TaoNav itself, so it follows its width, not the window */
@container tao-nav (width < 600px) {
  .shell-top {
    display: flex;
  }

  /* doubled: the menu sets display: block with the same weight */
  .shell-project.shell-project {
    display: none;
  }
}

/*
 * The project chip: the whole of it is the button of a block TaoDropdownMenu. --tao-nav-compact is 1 on the rail and 0
 * on the side panel (and in the page), so on the rail the text and the chevron shrink to nothing and a round icon stays.
 * Фишка проекта: она вся — кнопка блочного TaoDropdownMenu. --tao-nav-compact 1 на рейке и 0 в боковой панели (и на
 * странице), поэтому на рейке текст и стрелка сжимаются в ничто и остаётся круглая иконка.
 */
.shell-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc((1 - var(--tao-nav-compact)) * var(--tao-space-2));
  box-sizing: border-box;
  min-height: var(--tao-control-height);
  padding-inline: calc((1 - var(--tao-nav-compact)) * var(--tao-space-3));
  border: calc((1 - var(--tao-nav-compact)) * 1px) solid var(--tao-color-border-strong);
  border-radius: inherit;
  /* on the rail no frame (a round box would cut its arcs), a faint fill instead */
  background: color-mix(in srgb, var(--tao-color-text) calc(var(--tao-nav-compact) * 8%), transparent);
  color: var(--tao-color-text);
  font-size: var(--tao-control-font-size);
}

.shell-chip__text {
  flex: 1;
  min-width: 0;
  max-width: calc((1 - var(--tao-nav-compact)) * 600px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shell-chip__more {
  flex: none;
  max-width: calc((1 - var(--tao-nav-compact)) * 24px);
  overflow: hidden;
  color: var(--tao-color-text-muted);
}

.shell-top .shell-chip {
  max-width: 220px;
}

.shell-main {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: var(--tao-space-6);
}

.shell-main h1 {
  margin: 0 0 var(--tao-space-5);
}

/* settings are a section: a column of a width one can read, not a form across the whole screen */
.shell-settings {
  display: grid;
  gap: var(--tao-space-4);
  max-width: 560px;
}

.shell-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--tao-space-1);
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
        <TaoList :bordered="false" roving aria-label="Notes" :empty="shown.length === 0">
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
