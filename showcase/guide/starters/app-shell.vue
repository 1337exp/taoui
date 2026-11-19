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
