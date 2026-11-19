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
        en: 'One `TaoNav` with `layout="auto"` (the default) makes three looks from one list: a side panel with labels from 840px, a rail of icons below, a bar at the bottom under 600px. It measures its own width, not the window: a split view or an embedded frame gets the right look too.',
        ru: 'Один `TaoNav` с `layout="auto"` (по умолчанию) даёт три вида из одного списка: боковую панель с подписями от 840px, рейку иконок уже, панель снизу до 600px. Он мерит свою ширину, а не окно: в разделённом экране или во фрейме вид тоже верный.',
      },
      {
        en: '`fill`: the app takes the window and the page scrolls inside its own box, not as a document. The navigation never moves, a list and an editor side by side can each scroll on their own, and no page scrollbar comes and goes between a short section and a long one, so nothing shifts sideways.',
        ru: '`fill`: приложение занимает окно, а страница прокручивается внутри своего блока, а не документом. Навигация не двигается, список и редактор рядом прокручиваются каждый сам, и полоса страницы не появляется и не исчезает между коротким и длинным разделом, поэтому ничего не сдвигается вбок.',
      },
      {
        en: 'The main action (`#action`) is one filled button above the items: it follows the navigation, round above the bar on a phone, round on the rail, wide with its text on the side panel. Its text is in `tao-nav__action-label`, so it stays the name of the round button. One accent action per screen: the rest of the shell is quiet.',
        ru: 'Главное действие (`#action`) — одна залитая кнопка над пунктами: она идёт за навигацией, круглая над панелью на телефоне, круглая на рейке, широкая с текстом в боковой панели. Текст в `tao-nav__action-label`, поэтому он остаётся именем круглой кнопки. Одно акцентное действие на экран: остальная оболочка тихая.',
      },
      {
        en: 'The project the app works in (a workspace, a portfolio, an account) is a chip under the main action: the folder, the name, a chevron, and a menu of the projects with the current one checked and «New project». The whole chip is the button of a `TaoDropdownMenu block`, so the hover and the focus ring go round it; on the rail it folds to a round icon by `--tao-nav-compact`, on a phone it moves up into the header. Its name for a screen reader is «Project: Home», with the word hidden (`tao-sr-only`).',
        ru: 'Проект, в котором работает приложение (пространство, портфель, аккаунт), — фишка под главным действием: папка, название, стрелка и меню проектов с отмеченным текущим и «Новым проектом». Вся фишка — кнопка `TaoDropdownMenu block`, поэтому наведение и рамка фокуса обходят её; на рейке она сворачивается в круглую иконку по `--tao-nav-compact`, на телефоне поднимается в шапку. Для скринридера её имя — «Project: Home», слово скрыто (`tao-sr-only`).',
      },
      {
        en: 'Counters are `badge-tone="neutral"`: grey on every item, the accent only on the current one, so the eye is not pulled round the menu.',
        ru: 'Счётчики `badge-tone="neutral"`: серые у всех пунктов, акцент только у текущего, чтобы внимание не бегало по меню.',
      },
      {
        en: 'The language and the theme are quiet tools in `#footer`, at the bottom of the side panel (`fill` puts it there). The language shows its name on the side panel and folds to the globe on the rail by itself (it reads `--tao-nav-compact`), so no `icon-only` there. The bar has no room for a footer, so on a phone the same tools go up into a thin header, shown by a container query on `tao-nav`, the same 600px as the bar: no JavaScript, no second breakpoint to keep in step.',
        ru: 'Язык и тема — тихие инструменты в `#footer`, внизу боковой панели (туда его ставит `fill`). Язык показывает своё название в боковой панели и сам сворачивается до глобуса на рейке (он читает `--tao-nav-compact`), поэтому `icon-only` там не нужен. В нижней панели места для подвала нет, поэтому на телефоне те же инструменты поднимаются в тонкую шапку, её показывает container query по `tao-nav` на тех же 600px, что и панель: без JavaScript и без второй границы, которую надо держать в ногу.',
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
