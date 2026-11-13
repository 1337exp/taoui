<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoCommandList, TaoCommandPalette, TaoPopover } from '@1337exp/taoui'
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
const panelOpen = ref(false)
const picked = ref('')
const popoverOpen = ref(false)

// the same list in a popover: the pick is the app's, and the popover is closed by the app too
// тот же список в поповере: выбор за приложением, и поповер закрывает тоже оно
function pickInPopover(item) {
  picked.value = item.id
  popoverOpen.value = false
}
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
        <p>
          By default it is a modal dialog, and on a screen narrower than 600px it takes the whole screen (<code>fullscreen</code>:
          <code>'narrow'</code>, as on <code>TaoModal</code>; <code>true</code> always, <code>false</code> never). With
          <code>:modal="false"</code> it is a panel over a living page, as in VS Code: no dimming, no scroll lock, and a press
          outside the panel closes it.
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
        <p>
          По умолчанию это модальное окно, а на экране уже 600px оно занимает весь экран (<code>fullscreen</code>:
          <code>'narrow'</code>, как у <code>TaoModal</code>; <code>true</code> всегда, <code>false</code> никогда). С
          <code>:modal="false"</code> это панель поверх живой страницы, как в VS Code: без затемнения и запрета прокрутки, а
          нажатие вне панели закрывает её.
        </p>
      </template>
    </Tr>

    <div class="palette-row">
      <TaoButton variant="primary" @click="open = true">{{ tr('Open the palette', 'Открыть палитру') }}</TaoButton>
      <TaoButton variant="secondary" @click="panelOpen = true">{{ tr('As a panel, no dimming', 'Панелью, без затемнения') }}</TaoButton>
      <span class="palette-note">{{ picked ? tr('Picked: ', 'Выбрано: ') + picked : tr('nothing picked yet', 'пока ничего не выбрано') }}</span>
    </div>
    <TaoCommandPalette v-model="open" :items="items" @select="(item) => (picked = item.id)" />
    <TaoCommandPalette v-model="panelOpen" :items="items" :modal="false" @select="(item) => (picked = item.id)" />

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

    <h3>TaoCommandList</h3>
    <Tr>
      <template #en>
        <p>
          The field and the list of the palette with no window around them, for a place that is not a dialog: a block of a page,
          a side panel, a popover. It searches and walks exactly as the palette does; <code>@select</code> picks, and it closes
          nothing, so closing is yours. Its parent gives it a height, and the list scrolls inside it.
        </p>
      </template>
      <template #ru>
        <p>
          Поле и список палитры без окна вокруг, для места, которое не диалог: блок страницы, боковая панель, поповер. Он ищет и
          ходит по строкам так же, как палитра; <code>@select</code> выбирает и ничего не закрывает, закрывать вам. Высоту ему
          даёт родитель, а список прокручивается внутри.
        </p>
      </template>
    </Tr>
    <div class="palette-row">
      <div class="palette-inline">
        <TaoCommandList :items="items" @select="(item) => (picked = item.id)" />
      </div>
      <TaoPopover v-model="popoverOpen">
        <template #trigger>
          <TaoButton variant="secondary">{{ tr('In a popover', 'В поповере') }}</TaoButton>
        </template>
        <div class="palette-popover">
          <TaoCommandList :items="items" autofocus @select="pickInPopover" @escape="popoverOpen = false" />
        </div>
      </TaoPopover>
    </div>

    <div class="code-block">
      <pre><code>&lt;!-- in a page: the parent gives the height --&gt;
&lt;div style="height: 320px"&gt;
  &lt;TaoCommandList :items="items" @select="(item) =&gt; commands.run(item.id)" /&gt;
&lt;/div&gt;

&lt;!-- in a popover: the app closes it --&gt;
&lt;TaoPopover v-model="open"&gt;
  &lt;template #trigger&gt;&lt;TaoButton&gt;Commands&lt;/TaoButton&gt;&lt;/template&gt;
  &lt;div style="width: 360px; height: 320px"&gt;
    &lt;TaoCommandList :items="items" autofocus @select="pick" @escape="open = false" /&gt;
  &lt;/div&gt;
&lt;/TaoPopover&gt;</code></pre>
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

.palette-inline,
.palette-popover {
  box-sizing: border-box;
  width: min(360px, 100%);
  height: 320px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
}

.palette-popover {
  border: 0;
}

.palette-note {
  color: var(--tao-color-text-muted);
  font-size: var(--tao-font-size-sm);
}
</style>
