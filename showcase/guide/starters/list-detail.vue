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
