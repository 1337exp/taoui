# TaoUI starters: whole screens to begin a project from

Generated from the Guide of the showcase (`showcase/guide/starters/`) by `npm run skill`; do not edit by hand.
Start a new app from the starter that fits instead of composing the shell from scratch, and keep its decisions unless
the app has a reason not to. The page with the starters live: showcase `#starters` (the Guide book).
A starter uses the public API only: no `:deep(.tao-…)`, no private `--_…` variables of a component.

## App shell with a side menu

**When.** An app of a few sections that people keep open: notes, a tracker, a planner, an admin. The model is Axis and NextUp.

**Why it is built this way:**

1. One `TaoNav` with `layout="auto"` (the default) makes three looks from one list: a side panel with labels from 840px, a rail of icons below, a bar at the bottom under 600px. It measures its own width, not the window: a split view or an embedded frame gets the right look too.
2. `fill`: the app takes the window and the page scrolls inside its own box, not as a document. The navigation never moves, a list and an editor side by side can each scroll on their own, and no page scrollbar comes and goes between a short section and a long one, so nothing shifts sideways.
3. The main action (`#action`) is one filled button above the items: it follows the navigation, round above the bar on a phone, round on the rail, wide with its text on the side panel. Its text is in `tao-nav__action-label`, so it stays the name of the round button. One accent action per screen: the rest of the shell is quiet.
4. Counters are `badge-tone="neutral"`: grey on every item, the accent only on the current one, so the eye is not pulled round the menu.
5. The language and the theme are quiet tools in `#footer`, at the bottom of the side panel (`fill` puts it there). The bar has no room for a footer, so on a phone the same tools go up into a thin header, shown by a container query on `tao-nav`, the same 600px as the bar: no JavaScript, no second breakpoint to keep in step.
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
import { TaoButton, TaoEmpty, TaoLanguageSwitch, TaoNav, TaoSwitch, TaoThemeToggle } from '@1337exp/taoui'

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

function create() {
  section.value = 'inbox'
}
</script>

<template>
  <TaoNav v-model="section" fill badge-tone="neutral" :items="items" aria-label="Sections">
    <template #action>
      <TaoButton icon="tao-plus" shortcut="N" @click="create"><span class="tao-nav__action-label">New</span></TaoButton>
    </template>

    <template #footer>
      <div class="shell-tools">
        <TaoLanguageSwitch v-model="lang" :languages="['en', 'ru']" icon-only placement="top-start" />
        <TaoThemeToggle />
      </div>
    </template>

    <div class="shell-page">
      <!-- a phone: the bar has no footer, so the tools go up into a thin header -->
      <header class="shell-top">
        <strong>My app</strong>
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
