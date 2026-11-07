// The three books of the showcase. A page lives in exactly one of them; the rule of each is its `lead`.
// The menu data is light and loaded at once (search and addresses need it); the pages (`load`) are fetched when the
// book is opened. tests/showcase.books.test.ts keeps ids unique and every menu entry wired to a page.
// Три книги шоукейса. Страница живёт ровно в одной из них; правило каждой — её `lead`.
// Данные меню лёгкие и грузятся сразу (они нужны поиску и адресам); страницы (`load`) — когда книгу открывают.
// tests/showcase.books.test.ts держит id уникальными, а каждый пункт меню — связанным со страницей.
import { navGroups as componentsNav } from './components.nav.js'
import { navGroups as demosNav } from './demos.nav.js'
import { navGroups as guideNav } from './guide.nav.js'

export const books = [
  {
    id: 'components',
    title: { en: 'Components', ru: 'Компоненты' },
    lead: {
      en: 'What there is: one page per component, with its variants, states and props. A page about several components is a demo.',
      ru: 'Что есть: по странице на компонент, с вариантами, состояниями и пропсами. Страница про несколько компонентов — это демо.',
    },
    nav: componentsNav,
    load: () => import('./components.sections.js'),
  },
  {
    id: 'demos',
    title: { en: 'Demos', ru: 'Демо' },
    lead: {
      en: 'Complex scenes made of several components, on the public API only. Each one says what it proves.',
      ru: 'Сложные сцены из нескольких компонентов, только на публичном API. Каждая говорит, что доказывает.',
    },
    nav: demosNav,
    load: () => import('./demos.sections.js'),
  },
  {
    id: 'guide',
    title: { en: 'Guide', ru: 'Руководство' },
    lead: {
      en: 'What to use when, and why: the foundations the components stand on, recommendations and ready templates.',
      ru: 'Что, когда и почему: основа, на которой стоят компоненты, рекомендации и готовые шаблоны.',
    },
    nav: guideNav,
    load: () => import('./guide.sections.js'),
  },
]

export function bookById(id) {
  return books.find((book) => book.id === id)
}

// the book that holds a section id (an address like #button) / книга, в которой лежит раздел с таким id (адрес вида #button)
export function bookOfSection(id) {
  return books.find((book) => book.nav.some((group) => group.items.some((item) => item.id === id)))
}
