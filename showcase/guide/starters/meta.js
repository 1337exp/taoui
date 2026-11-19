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
        en: 'Counters are `badge-tone="neutral"`: grey on every item, the accent only on the current one, so the eye is not pulled round the menu.',
        ru: 'Счётчики `badge-tone="neutral"`: серые у всех пунктов, акцент только у текущего, чтобы внимание не бегало по меню.',
      },
      {
        en: 'The language and the theme are quiet tools in `#footer`, at the bottom of the side panel (`fill` puts it there). The bar has no room for a footer, so on a phone the same tools go up into a thin header, shown by a container query on `tao-nav`, the same 600px as the bar: no JavaScript, no second breakpoint to keep in step.',
        ru: 'Язык и тема — тихие инструменты в `#footer`, внизу боковой панели (туда его ставит `fill`). В нижней панели места для подвала нет, поэтому на телефоне те же инструменты поднимаются в тонкую шапку, её показывает container query по `tao-nav` на тех же 600px, что и панель: без JavaScript и без второй границы, которую надо держать в ногу.',
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
]
