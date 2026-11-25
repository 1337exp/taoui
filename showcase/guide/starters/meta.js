// The starters of the Guide: whole screens to begin a project from, each with the decisions it makes and why. One source for
// two readers, as the patterns: the page (showcase/guide/DemoStarters.vue renders the file live and shows it whole) and the
// AI assistants (scripts/generate-starters.mjs writes skills/taoui/references/starters.md, English only). A starter is a real
// Vue file next to this one, `<id>.vue`, copied as is: it uses the public API only (no `:deep(.tao-…)`, no private `--_…`
// variables), and when it cannot, the kit gets the missing piece first.
// Каркасы Guide: целые экраны, с которых начинают проект, и решения каждого с причинами. Один источник для двух читателей,
// как у рекомендаций: страница (DemoStarters.vue рисует файл вживую и показывает его целиком) и ИИ-ассистенты
// (scripts/generate-starters.mjs пишет skills/taoui/references/starters.md, только по-английски). Каркас — настоящий
// Vue-файл рядом, `<id>.vue`, копируется как есть: только публичный API (без `:deep(.tao-…)` и приватных `--_…`), а когда
// без них не выходит, сначала недостающее получает набор.

export const starters = [
  {
    id: 'app-shell',
    title: { en: 'App shell with a side menu', ru: 'Оболочка приложения с меню сбоку' },
    when: {
      en: 'An app of a few sections that people keep open: notes, a tracker, a planner, an admin. The model is Axis and NextUp.',
      ru: 'Приложение из нескольких разделов, которое держат открытым: заметки, трекер, планировщик, админка. Образец — Axis и NextUp.',
    },
    file: {
      en: 'Copy it as `App.vue` and give its parent the height of the window: `html, body, #app { height: 100%; margin: 0; }`.',
      ru: 'Скопируйте его как `App.vue` и дайте родителю высоту окна: `html, body, #app { height: 100%; margin: 0; }`.',
    },
    decisions: [
      {
        en: 'One `TaoShell` is the whole shell: it puts a `TaoNav` with `layout="auto"` on the list `items` and makes three looks from it, a side panel with labels from 840px, a rail of icons below, a bar at the bottom under 600px. It measures its own width, not the window: a split view or an embedded frame gets the right look too. Do not build the shell by hand: the project chip, the phone header and the footer are in it already.',
        ru: 'Один `TaoShell` это вся оболочка: он ставит `TaoNav` с `layout="auto"` на список `items` и даёт три вида: боковую панель с подписями от 840px, рейку иконок уже, панель снизу до 600px. Он мерит свою ширину, а не окно: в разделённом экране или во фрейме вид тоже верный. Оболочку руками не собирают: фишка проекта, шапка телефона и подвал в нём уже есть.',
      },
      {
        en: 'The shell fills the window and the page scrolls inside its own box, not as a document: the navigation never moves, and no page scrollbar comes and goes between a short section and a long one. The page is the `<main>` landmark, and the first stop of the tab order is a «Skip to content» link to it. `<TaoHosts />` is inside, so `toast()` and `confirm()` work without anything else.',
        ru: 'Оболочка занимает окно, а страница прокручивается внутри своего блока, а не документом: навигация не двигается, и полоса страницы не появляется и не исчезает между коротким и длинным разделом. Страница это ориентир `<main>`, а первая точка табуляции — ссылка «К содержимому». `<TaoHosts />` внутри, поэтому `toast()` и `confirm()` работают без лишнего.',
      },
      {
        en: 'The main action is the prop `action` (`{ label, icon?, shortcut? }`) and the event `action`: one filled button above the items, round above the bar on a phone and on the rail, wide with its text on the side panel. One accent action per screen: the rest of the shell is quiet.',
        ru: 'Главное действие это проп `action` (`{ label, icon?, shortcut? }`) и событие `action`: одна залитая кнопка над пунктами, круглая над панелью на телефоне и на рейке, широкая с текстом в боковой панели. Одно акцентное действие на экран: остальная оболочка тихая.',
      },
      {
        en: 'The project the app works in (a workspace, a portfolio, an account) is `projects` and `v-model:project`: a chip under the main action with a menu of the projects, the current one checked, and «New project» (the event `new-project`). The shell draws it and folds it to a round icon on the rail; the app keeps the list.',
        ru: 'Проект, в котором работает приложение (пространство, портфель, аккаунт), это `projects` и `v-model:project`: фишка под главным действием с меню проектов, отмеченным текущим и «Новым проектом» (событие `new-project`). Оболочка рисует её и сворачивает в круглую иконку на рейке; список хранит приложение.',
      },
      {
        en: 'The mode, the palette and the language are one call, `createKitPrefs({ key })` (it reads what was saved, puts it on `<html>`, follows the system, saves), and the shell takes the result as `prefs`: the language switch and the theme toggle are bound to it. On a phone they go up into a thin header, shown by a container query on the same 600px as the bar: no JavaScript, no second breakpoint.',
        ru: 'Режим, палитра и язык это один вызов `createKitPrefs({ key })` (читает сохранённое, ставит на `<html>`, идёт за системой, сохраняет), а оболочка берёт результат как `prefs`: переключатель языка и тема привязаны к нему. На телефоне они поднимаются в тонкую шапку, её показывает container query на тех же 600px, что и панель: без JavaScript и без второй границы.',
      },
      {
        en: 'Settings are a section of the menu with their own page, in a column one can read (560px), not a modal and not a drawer from the far edge: on a wide screen the menu is where the eye already is.',
        ru: 'Настройки — раздел меню со своей страницей, колонкой удобной для чтения ширины (560px), а не окно и не панель с дальнего края: на широком экране меню там, где уже взгляд.',
      },
      {
        en: 'An empty section says what lands in it and offers the action (`TaoEmpty`), instead of a blank page.',
        ru: 'Пустой раздел говорит, что в него попадёт, и предлагает действие (`TaoEmpty`), а не показывает белый лист.',
      },
    ],
  },
  {
    id: 'list-detail',
    title: { en: 'A list and the open item', ru: 'Список и открытая запись' },
    when: {
      en: 'A section of records people go through one by one: notes, mail, tasks, clients. The model is the notes of NextUp.',
      ru: 'Раздел записей, которые просматривают по одной: заметки, почта, задачи, клиенты. Образец — заметки NextUp.',
    },
    file: {
      en: 'Put it in the page of the app shell (or any box with a height): it fills its parent and lays itself out by the room it gets.',
      ru: 'Положите его в страницу оболочки приложения (или в любой блок с высотой): он занимает родителя и раскладывается по месту, которое ему дали.',
    },
    decisions: [
      {
        en: 'Side by side when there is room, one at a time when there is not: the list, then the item with a back button. The width is the room of the starter, measured on an outer box by a container query (`list-detail`), not the window: in the shell beside a side panel it switches later than the window would say. A container query cannot ask an element about its own width, so the outer box measures and the inner grid lays out.',
        ru: 'Рядом, когда есть место, по одному, когда нет: список, потом запись с кнопкой «назад». Ширина — это место самого каркаса, его мерит container query (`list-detail`) на внешнем блоке, а не окно: в оболочке рядом с боковой панелью он переключается позже, чем сказало бы окно. Container query не может спросить элемент о его же ширине, поэтому мерит внешний блок, а раскладывает внутренняя сетка.',
      },
      {
        en: 'Each pane scrolls by itself (`overflow: auto` on both, `min-height: 0` so a grid row can be shorter than its content): the list keeps its place while the item is read.',
        ru: 'Каждая панель прокручивается сама (`overflow: auto` у обеих, `min-height: 0`, чтобы строка сетки могла быть короче содержимого): список не теряет места, пока читают запись.',
      },
      {
        en: 'The list is `TaoList roving` with `clickable` rows: one Tab stop, the arrows move between the rows, Tab comes back to the open one. The open row is `selected` (a tint and `aria-current`), not an accent text.',
        ru: 'Список — `TaoList roving` с `clickable` строками: одна остановка Tab, стрелки ходят по строкам, Tab возвращается к открытой. Открытая строка — `selected` (подложка и `aria-current`), а не акцентный текст.',
      },
      {
        en: 'The focus follows the eye in the single pane: opening an item moves it to the item heading (`tabindex="-1"`), Back and Escape bring it to the row it came from. Side by side the focus stays in the list, so the arrows keep walking it.',
        ru: 'В одной панели фокус идёт за взглядом: открытие записи ставит его на её заголовок (`tabindex="-1"`), «Назад» и Escape возвращают к строке, с которой пришли. Когда панели рядом, фокус остаётся в списке, и стрелки продолжают по нему ходить.',
      },
      {
        en: 'The actions of the item are quiet icon buttons (`variant="ghost" tone="neutral"`, each with an `aria-label`); the one that destroys is `tone="danger"`. The accent of the screen stays for the main action of the shell.',
        ru: 'Действия записи — тихие кнопки-иконки (`variant="ghost" tone="neutral"`, у каждой `aria-label`); та, что удаляет, — `tone="danger"`. Акцент экрана остаётся главному действию оболочки.',
      },
      {
        en: 'Nothing open on a wide screen is a `TaoEmpty` that says what opens there; a search with no match says so in the `#empty` slot of the list, with the query.',
        ru: 'Пустое место справа на широком экране — `TaoEmpty`, который говорит, что там откроется; поиск без совпадений говорит об этом в слоте `#empty` списка, вместе с запросом.',
      },
      {
        en: 'The text of the item is a column one can read (640px), not a line across a wide screen.',
        ru: 'Текст записи — колонка удобной для чтения ширины (640px), а не строка через весь широкий экран.',
      },
    ],
  },
]
