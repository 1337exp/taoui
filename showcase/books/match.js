// What the search of a book matches: the id, the label (both languages, whichever is on screen) and the aliases of a page,
// or the title of its group.
// Что находит поиск по книге: id, подпись (оба языка, какой бы ни был на экране) и синонимы страницы либо название её группы.
export const both = (text) => (text && typeof text === 'object' ? `${text.en ?? ''} ${text.ru ?? ''}` : (text ?? ''))

const needleOf = (query) => query.trim().toLowerCase()

function itemMatches(item, needle) {
  return [item.id, both(item.label), ...(item.aliases ?? [])].join(' ').toLowerCase().includes(needle)
}

export function itemVisible(group, item, query) {
  const needle = needleOf(query)
  if (!needle) return true
  return both(group.title).toLowerCase().includes(needle) || itemMatches(item, needle)
}

export function groupVisible(group, query) {
  const needle = needleOf(query)
  if (!needle) return true
  return both(group.title).toLowerCase().includes(needle) || group.items.some((item) => itemMatches(item, needle))
}

// a page is shown: found by the search, or in the group that is open ('all' shows every group) / страница показана: найдена поиском или в открытой группе
export function sectionVisible(group, item, query, activeGroup) {
  const needle = needleOf(query)
  if (needle) {
    const hay = [group.id, both(group.title), item.id, both(item.label), ...(item.aliases ?? [])].join(' ').toLowerCase()
    return hay.includes(needle)
  }
  return activeGroup === 'all' || activeGroup === group.id
}
