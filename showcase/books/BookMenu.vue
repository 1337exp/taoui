<script setup>
// The menu of a book: the search, the groups and the pages. On a wide page it is the sticky column; on a phone the same
// menu is the content of a bottom sheet (books/BookView.vue). It owns no state: the book does.
// Меню книги: поиск, группы и страницы. На широкой странице это липкая колонка; на телефоне то же меню — содержимое
// нижнего листа (books/BookView.vue). Своего состояния нет: оно у книги.
import { TaoIcon, TaoInput } from '@1337exp/taoui'
import { tr } from '../i18n.js'
import { groupVisible, itemVisible } from './match.js'

defineProps({
  groups: { type: Array, required: true },
  label: { type: String, required: true },
  activeGroup: { type: String, required: true },
  activeSection: { type: String, default: '' },
  sheet: { type: Boolean, default: false },
})

const query = defineModel('query', { type: String, default: '' })
defineEmits(['go', 'all', 'group'])
</script>

<template>
  <nav class="showcase-nav" :class="{ 'showcase-nav--sheet': sheet }" :aria-label="label">
    <TaoInput
      v-model="query"
      class="showcase-nav__search"
      :placeholder="tr('Find a page…', 'Найти страницу…')"
      :aria-label="tr('Find a page', 'Найти страницу')"
    >
      <template #prefix><TaoIcon name="tao-search" /></template>
    </TaoInput>

    <button type="button" class="showcase-nav__all" :class="{ active: activeGroup === 'all' && !query }" @click="$emit('all')">
      {{ tr('All', 'Все') }}
    </button>

    <div v-for="group in groups" v-show="groupVisible(group, query)" :key="group.id" class="showcase-nav__group">
      <button type="button" class="showcase-nav__group-title" :class="{ active: activeGroup === group.id }" @click="$emit('group', group.id)">
        {{ tr(group.title) }}
      </button>
      <a
        v-for="item in group.items"
        v-show="itemVisible(group, item, query)"
        :key="item.id"
        class="showcase-nav__link"
        :class="{ active: activeSection === item.id }"
        :href="'#' + item.id"
        @click.prevent="$emit('go', group.id, item.id)"
      >
        {{ tr(item.label) }}
      </a>
    </div>
  </nav>
</template>
