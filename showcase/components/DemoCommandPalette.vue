<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoCommandPalette } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCommandPalette' })

// the commands of an imaginary editor; the palette only searches them, the app runs the picked one
// команды воображаемого редактора; палитра только ищет, выбранную запускает приложение
const items = computed(() => [
  { id: 'new', label: tr('New project', 'Новый проект'), group: tr('File', 'Файл'), shortcut: 'Ctrl+N' },
  { id: 'open', label: tr('Open…', 'Открыть…'), group: tr('File', 'Файл'), shortcut: 'Ctrl+O' },
  { id: 'save', label: tr('Save', 'Сохранить'), group: tr('File', 'Файл'), shortcut: 'Ctrl+S', keywords: ['write', 'disk', 'записать'] },
  { id: 'export', label: tr('Export JSON', 'Экспорт JSON'), group: tr('File', 'Файл'), description: tr('The file the game reads', 'Файл, который читает игра') },
  { id: 'undo', label: tr('Undo', 'Отменить'), group: tr('Edit', 'Правка'), shortcut: 'Ctrl+Z' },
  { id: 'redo', label: tr('Redo', 'Повторить'), group: tr('Edit', 'Правка'), shortcut: 'Ctrl+Y', disabled: true },
  { id: 'fit', label: tr('Zoom to fit', 'Показать всё'), group: tr('View', 'Вид'), shortcut: 'Shift+1' },
  { id: 'grid', label: tr('Toggle grid', 'Показать сетку'), group: tr('View', 'Вид'), icon: 'tao-info' },
])

const open = ref(false)
const picked = ref('')
</script>

<template>
  <ShowcaseSection id="command-palette" :tables="propTables['command-palette']">
    <h2>TaoCommandPalette</h2>
    <Tr>
      <template #en>
        <p>
          A dialog that searches a list of commands, as <kbd>Ctrl</kbd> + <kbd>K</kbd> does in an editor. It only searches
          and shows: the commands are <code>items</code>, and running the picked one is the app's business (<code>@select</code>).
          The palette closes itself after a pick. Open it from a key of your own (the palette does not listen to any).
        </p>
        <p>
          Every word of the query must fit, in any order: the start of the label scores highest, then the start of a word
          in it, then any place, then the letters in order (<code>sv</code> finds «Save»). The group, the description and
          <code>keywords</code> find a command too, and a disabled one is shown but cannot be picked. With an empty query
          the list goes under captions of its groups, with a query each row names its group. Keys: <kbd>↑</kbd> <kbd>↓</kbd>
          walk the rows (a disabled one is skipped, the ends join), <kbd>Home</kbd> <kbd>End</kbd>, <kbd>Enter</kbd> picks,
          <kbd>Esc</kbd> closes; the focus never leaves the field. The search itself is exported as
          <code>matchCommands</code>, for any list you filter by typing.
        </p>
      </template>
      <template #ru>
        <p>
          Окно поиска по списку команд, как <kbd>Ctrl</kbd> + <kbd>K</kbd> в редакторе. Оно только ищет и показывает: команды
          это <code>items</code>, а запуск выбранной дело приложения (<code>@select</code>). После выбора палитра закрывается
          сама. Открывать её нужно своей клавишей (сама палитра никаких не слушает).
        </p>
        <p>
          Подойти должно каждое слово запроса, в любом порядке: выше всего начало подписи, потом начало слова в ней, потом
          любое место, потом буквы по порядку (<code>св</code> найдёт «Сохранить»). Команду находят и по группе, описанию и
          <code>keywords</code>, а недоступная показана, но выбрать её нельзя. При пустом запросе список идёт под подписями
          групп, при запросе у каждой строки названа группа. Клавиши: <kbd>↑</kbd> <kbd>↓</kbd> ходят по строкам
          (недоступная пропускается, концы замкнуты), <kbd>Home</kbd> <kbd>End</kbd>, <kbd>Enter</kbd> выбирает,
          <kbd>Esc</kbd> закрывает; фокус из поля не уходит. Сам поиск вынесен как <code>matchCommands</code>, для любого
          списка, который фильтруют набором.
        </p>
      </template>
    </Tr>

    <div class="palette-row">
      <TaoButton variant="primary" @click="open = true">{{ tr('Open the palette', 'Открыть палитру') }}</TaoButton>
      <span class="palette-note">{{ picked ? tr('Picked: ', 'Выбрано: ') + picked : tr('nothing picked yet', 'пока ничего не выбрано') }}</span>
    </div>
    <TaoCommandPalette v-model="open" :items="items" @select="(item) => (picked = item.id)" />

    <div class="code-block">
      <pre><code>&lt;script setup&gt;
const items = [
  { id: 'save', label: 'Save', group: 'File', shortcut: 'Ctrl+S', keywords: ['write', 'disk'] },
  { id: 'redo', label: 'Redo', group: 'Edit', disabled: true },
]
const open = ref(false)
&lt;/script&gt;

&lt;!-- the palette does not listen to a key: open it from yours --&gt;
&lt;TaoCommandPalette v-model="open" :items="items" @select="(item) =&gt; commands.run(item.id)" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.palette-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tao-space-3);
  margin: var(--tao-space-2) 0;
}

.palette-note {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}
</style>
