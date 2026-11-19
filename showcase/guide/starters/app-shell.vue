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
