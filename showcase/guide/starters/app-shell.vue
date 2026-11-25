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
