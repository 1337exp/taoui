// The recommendations of the Guide, as data: what to use when, and why. One source for two readers: the page
// (showcase/guide/DemoPatterns.vue draws it, with the examples live) and the AI assistants (scripts/generate-patterns.mjs
// writes skills/taoui/references/patterns.md from it, English only). The examples are real Vue files next to this one:
// `<id>.good.vue` and `<id>.bad.vue`; the code shown is their <template>. A new rule is added after something broke,
// not in advance: the Guide grows by scars, like CONTRIBUTING.
// Рекомендации Guide как данные: что, когда и почему. Один источник для двух читателей: страница (DemoPatterns.vue рисует
// её с живыми примерами) и ИИ-ассистенты (scripts/generate-patterns.mjs пишет из неё skills/taoui/references/patterns.md,
// только по-английски). Примеры — настоящие Vue-файлы рядом: `<id>.good.vue` и `<id>.bad.vue`; показан их <template>.
// Новое правило добавляется после поломки, а не впрок: Guide растёт шрамами, как CONTRIBUTING.

/** The accent budget: the rules every screen follows. / Бюджет акцента: правила для каждого экрана. */
export const accentBudget = {
  title: { en: 'The accent budget', ru: 'Бюджет акцента' },
  lead: {
    en: 'The accent colour (amber by default) is a signal, and a signal that is on everywhere says nothing. Spend it on three things only: the one main action of a region, the current or selected item, the focus ring.',
    ru: 'Акцентный цвет (по умолчанию янтарь) — это сигнал, а сигнал, который горит везде, ничего не говорит. Тратить его только на три вещи: главное действие области, текущий или выбранный пункт, кольцо фокуса.',
  },
  rules: [
    {
      en: 'One filled accent button (`variant="primary"`) per region. Next to it: `secondary`, or `ghost` with `tone="neutral"`, or `text`.',
      ru: 'Одна залитая акцентная кнопка (`variant="primary"`) на область. Рядом с ней — `secondary`, либо `ghost` с `tone="neutral"`, либо `text`.',
    },
    {
      en: 'Quiet tools (a toolbar, the actions of a row, icon buttons in a header) are `variant="ghost" tone="neutral"`. A `ghost` or `text` button without `tone` is accent-coloured: use it only for an action that really is the main one in its place.',
      ru: 'Тихие инструменты (панель инструментов, действия строки, иконки в шапке) — `variant="ghost" tone="neutral"`. `ghost` или `text` без `tone` окрашены акцентом: брать их только для действия, которое на своём месте и правда главное.',
    },
    {
      en: 'Status is `tone` (`success`, `danger`, `warning`, `info`), always with words, never colour alone. A destructive action is `tone="danger"` on the button that destroys; the safe button stays quiet.',
      ru: 'Статус — это `tone` (`success`, `danger`, `warning`, `info`), всегда со словами, не одним цветом. Разрушающее действие — `tone="danger"` на кнопке, которая разрушает; безопасная кнопка остаётся тихой.',
    },
    {
      en: 'Colours come from roles (`var(--tao-color-…)`), never a hex or an `rgba()` in app CSS.',
      ru: 'Цвета берутся из ролей (`var(--tao-color-…)`), не hex и не `rgba()` в CSS приложения.',
    },
  ],
}

/**
 * Choosing a size: what each size is for, what it costs, and how to decide. The numbers are the tokens of the kit
 * (src/styles/tokens/primitives.css: --tao-control-height-*, --tao-control-font-size-*, --tao-button-padding-x-*,
 * --tao-density-height-*); tests/showcase.patterns.test.ts holds them equal to the CSS.
 * Выбор размера: для чего каждый размер, чего он стоит и как решать. Числа — токены набора; тест держит их равными CSS.
 */
export const sizeGuide = {
  title: { en: 'Choosing a size', ru: 'Выбор размера' },
  lead: {
    en: 'Medium is the default, and the right answer unless there is a reason. A size is a decision about a region of the screen, not about a button: how many controls sit close together, how much they matter, and what presses them (a mouse or a finger).',
    ru: 'Medium — значение по умолчанию и верный ответ, пока нет причины. Размер — решение про область экрана, а не про кнопку: сколько контролов стоит рядом, насколько они важны и чем их нажимают (мышью или пальцем).',
  },
  sizes: [
    {
      size: 'small',
      height: 26,
      font: 12,
      padding: 12,
      use: {
        en: 'Only where a lot sits close together and a mouse is the pointer: the actions in a row of a dense table or list, a power-user tool with dozens of controls. Not a toolbar or an editor panel, not a filter or settings bar, not a popover or a menu: an editor that people use all day, above all one for clients, stays medium, or it grows small buttons that are hard to hit.',
        ru: 'Только там, где много всего рядом и указатель — мышь: действия в строке плотной таблицы или списка, профессиональный инструмент с десятками контролов. Не панель инструментов или редактора, не панель фильтров и настроек, не поповер и не меню: редактор, которым пользуются каждый день, тем более клиентский, остаётся medium, иначе он обрастает мелкими кнопками, в которые трудно попасть.',
      },
      cost: {
        en: 'A small hit area (26px: above the 24px WCAG 2.2 minimum, below the 44px a finger needs) and 12px text. Not for the main action of a screen, not where the only pointer is a finger.',
        ru: 'Малая зона нажатия (26px: выше минимума WCAG 2.2 в 24px, ниже 44px, которые нужны пальцу) и текст в 12px. Не для главного действия экрана и не там, где единственный указатель — палец.',
      },
    },
    {
      size: 'medium',
      height: 36,
      font: 14,
      padding: 16,
      use: {
        en: 'Forms and the content of the page. The default: do not set `size` at all.',
        ru: 'Формы и содержимое страницы. Значение по умолчанию: `size` не задавать вовсе.',
      },
      cost: {
        en: 'None; it is the scale everything else is drawn for.',
        ru: 'Никакой; под эту шкалу нарисовано всё остальное.',
      },
    },
    {
      size: 'large',
      height: 44,
      font: 16,
      padding: 24,
      use: {
        en: 'The one thing the screen is for: a sign-in or checkout button, a call to action on a landing page, a kiosk, a form people fill in on a phone, a reader who needs bigger targets.',
        ru: 'Единственное, ради чего экран: кнопка входа или оплаты, призыв на лендинге, киоск, форма, которую заполняют на телефоне, читатель, которому нужны цели покрупнее.',
      },
      cost: {
        en: 'Takes room and is loud: in a dense panel it pushes the rest out.',
        ru: 'Занимает место и громкий: в плотной панели вытесняет остальное.',
      },
    },
  ],
  // density: added on top of the size, not the font / плотность: прибавляется к размеру, шрифт не меняет
  density: [
    { name: 'compact', heights: [22, 32, 40], note: { en: 'dense tools and tables', ru: 'плотные инструменты и таблицы' } },
    { name: 'default', heights: [26, 36, 44], note: { en: 'the default', ru: 'по умолчанию' } },
    { name: 'comfortable', heights: [34, 44, 52], note: { en: 'a touch-sized row', ru: 'строка под палец' } },
  ],
  rules: [
    {
      en: 'Do not change the size unless you know exactly why. Leave medium: it is the scale everything is drawn for. A small control is a deliberate choice for a dense region, and you should be able to name the region and what is crowded in it; "it looks big" is not a reason, and neither is "it is a utility thing".',
      ru: 'Не менять размер, если точно не знаете, зачем. Оставьте medium: под него нарисовано всё. Small — осознанный выбор для плотной области, и вы должны суметь назвать область и что в ней тесно; «выглядит крупно» — не причина, как и «это служебное».',
    },
    {
      en: 'Decide for a region, with one class on the container (`class="tao-size-small"`), never for a control (see "Controls side by side").',
      ru: 'Решать для области, одним классом на контейнере (`class="tao-size-small"`), а не для контрола (см. «Контролы рядом: один размер»).',
    },
    {
      en: 'Importance is `variant` and `tone`, not size. Inside one region the main action is as tall as its neighbours; a bigger control belongs to a different region (a hero block), not to emphasis in a row.',
      ru: 'Важность — это `variant` и `tone`, а не размер. Внутри одной области главное действие той же высоты, что соседи; крупнее — это уже другая область (hero-блок), а не выделение в ряду.',
    },
    {
      en: 'Small is for the supporting cast. If the control is why the person came to the screen, it is medium or large.',
      ru: 'Small — для массовки. Если контрол — причина, по которой человек пришёл на экран, он medium или large.',
    },
    {
      en: 'A phone is a question of density, not of size: put `tao-density-auto` on `<html>`. The same medium becomes 44px under a finger and stays 36px with a mouse; the font does not change. `large` on a phone is for the hero action only.',
      ru: 'Телефон — вопрос плотности, а не размера: `tao-density-auto` на `<html>`. Тот же medium под пальцем станет 44px, а с мышью останется 36px; шрифт не меняется. `large` на телефоне — только для главного действия блока.',
    },
    {
      en: 'Do not shrink to fit. If it does not fit, wrap, scroll or move the rest into a menu: small controls that are cramped are still cramped.',
      ru: 'Не уменьшать, чтобы влезло. Не влезает — переносить, прокручивать или убирать остальное в меню: тесные мелкие контролы всё равно тесные.',
    },
    {
      en: 'Where did the small come from? The size is inherited. In DevTools read the computed `--tao-size` and `--tao-density` on the element, then walk up to the ancestor that sets `tao-size-*` / `tao-density-*` (or a `size` on a `TaoFormField` / `TaoInputGroup`, or a pinned `--tao-control-height`). Nothing else changes the size of a control.',
      ru: 'Откуда взялся маленький? Размер наследуется. В DevTools смотрите вычисленные `--tao-size` и `--tao-density` у элемента, потом поднимайтесь к предку, который задаёт `tao-size-*` / `tao-density-*` (или `size` у `TaoFormField` / `TaoInputGroup`, или прибитый `--tao-control-height`). Больше размер контрола ничто не меняет.',
    },
  ],
}

/**
 * The text contract: which step of the text ladder says what. The values are the dark theme's; the light theme mirrors
 * the order (strong is the darkest). A quiet control at rest takes `text`, and hover moves it one step up.
 * Контракт текста: какая ступень лестницы что говорит. Значения тёмной темы; светлая повторяет порядок (strong — самая
 * тёмная). Тихий контрол в покое берёт `text`, а наведение поднимает его на одну ступень.
 */
export const textContract = {
  title: { en: 'The text ladder', ru: 'Лестница текста' },
  lead: {
    en: 'Text has five steps, from `text-strong` to `text-disabled`, and each says one thing. Body copy and quiet controls sit on `text` (a soft grey, easy on a dark page); white is kept for what must stand out, so it still does. This is the order in the kit: pick the step by the job of the text, never by taste, and never write a colour of your own.',
    ru: 'У текста пять ступеней, от `text-strong` до `text-disabled`, и каждая говорит одно. Основной текст и тихие контролы стоят на `text` (мягкий серый, не слепит на тёмной странице); белый остаётся тому, что должно выделяться, поэтому оно выделяется. Таков порядок в наборе: ступень выбирают по работе текста, не по вкусу, и своего цвета не пишут.',
  },
  steps: [
    {
      role: 'text-strong',
      dark: '#ffffff',
      use: { en: 'Headings, titles of a card, a modal or an alert, the value that is the point (a figure, a slider value), and the hover of a quiet control. Never a control at rest.', ru: 'Заголовки, названия карточки, модалки и алерта, значение, ради которого всё (цифра, значение слайдера), и наведение на тихий контрол. Не контрол в покое.' },
    },
    {
      role: 'text',
      dark: '#bfbfbf',
      use: { en: 'Body copy and every control at rest: buttons (`secondary`, `ghost` and `text` with `tone="neutral"`), field values, form labels, menu items, table cells.', ru: 'Основной текст и каждый контрол в покое: кнопки (`secondary`, `ghost` и `text` с `tone="neutral"`), значения полей, подписи форм, пункты меню, ячейки таблицы.' },
    },
    {
      role: 'text-subtle',
      dark: '#999999',
      use: { en: 'The option that is not chosen in a group: idle tabs and segments.', ru: 'Невыбранный вариант в группе: вкладки и сегменты в покое.' },
    },
    {
      role: 'text-muted',
      dark: '#8a8a8a',
      use: { en: 'Captions, hints, descriptions, table headers, placeholders, breadcrumb links, icons that do nothing.', ru: 'Подписи, подсказки, описания, шапки таблиц, placeholder, ссылки хлебных крошек, значки без действия.' },
    },
    {
      role: 'text-disabled',
      dark: '#444444',
      use: { en: 'What cannot be used now.', ru: 'То, чем сейчас нельзя пользоваться.' },
    },
  ],
  rules: [
    {
      en: 'Hover moves one step up the ladder: `muted` to `text`, `text` to `strong`. A control never gets dimmer under the pointer.',
      ru: 'Наведение поднимает на одну ступень: `muted` до `text`, `text` до `strong`. Под курсором контрол не тускнеет.',
    },
    {
      en: 'The accent is not a step of the ladder. It is for the main action, what is selected or current, the focus and a link in running text. A quiet tool is never accent-coloured at rest.',
      ru: 'Акцент — не ступень лестницы. Он для главного действия, выбранного или текущего, фокуса и ссылки в тексте. Тихий инструмент в покое не бывает акцентным.',
    },
    {
      en: 'Status colours (`success`, `danger`, `warning`, `info`) say a status, with words beside them. They are not a way to make text louder.',
      ru: 'Цвета статуса (`success`, `danger`, `warning`, `info`) говорят о состоянии, со словами рядом. Это не способ сделать текст громче.',
    },
    {
      en: 'Your own markup takes the same roles: `color: var(--tao-color-text)` for body, `var(--tao-color-text-strong)` for a heading, `var(--tao-color-text-muted)` for a hint. Do not paint a whole block `strong` to make it important: when everything is white, nothing is.',
      ru: 'Своя разметка берёт те же роли: `color: var(--tao-color-text)` для основного, `var(--tao-color-text-strong)` для заголовка, `var(--tao-color-text-muted)` для подсказки. Не красьте весь блок в `strong`, чтобы он был важным: когда всё белое, важного нет.',
    },
  ],
}

/** The patterns: a situation, the rule, why, and a good and a bad example. / Шаблоны: ситуация, правило, почему, пример «так» и «не так». */
export const patterns = [
  {
    id: 'toolbar',
    title: { en: 'A toolbar of tools', ru: 'Панель инструментов' },
    when: {
      en: 'A bar of formatting or editing tools: text style toggles, undo and redo, a few actions.',
      ru: 'Полоса инструментов форматирования или правки: переключатели начертания, отмена и возврат, пара действий.',
    },
    rule: {
      en: 'Every button is `variant="ghost" tone="neutral"`, an icon with an `aria-label`. A toggle is `v-model:pressed`. Group related tools with `TaoToolbarGroup` and split the groups with `TaoToolbarSeparator`. Leave the size medium: a small toolbar is hard to hit (see "Choosing a size"). If it has to stay one row (a phone), add `overflow` to the toolbar instead of making the buttons smaller: the groups that do not fit go under «⋮», and `pinned` keeps a group (undo and redo) in sight.',
      ru: 'Каждая кнопка — `variant="ghost" tone="neutral"`, иконка с `aria-label`. Переключатель — `v-model:pressed`. Связанные инструменты — в `TaoToolbarGroup`, группы разделяет `TaoToolbarSeparator`. Размер оставить medium: в мелкую панель трудно попасть (см. «Выбор размера»). Если панель должна остаться в одну строку (телефон), включить `overflow` у панели, а не уменьшать кнопки: группы, которые не влезли, уходят под «⋮», а `pinned` оставляет группу (отмену и возврат) на виду.',
    },
    wrong: {
      en: 'No `tone`: every tool is amber.',
      ru: 'Без `tone`: каждый инструмент янтарный.',
    },
    why: {
      en: 'In a toolbar every button is a tool and none is the main one, so none may take the accent. Left amber, the bar shouts, and the one thing that must stand out, which toggles are on, is lost: it is the same colour as the rest. In neutral the pressed toggle is the only lit thing.',
      ru: 'В панели инструментов каждая кнопка — инструмент, и ни одна не главная, поэтому акцент не принадлежит ни одной. Оставишь янтарь — панель кричит, а то единственное, что должно выделяться, — какие переключатели включены, — теряется: оно того же цвета, что и остальное. В нейтральной панели включённый переключатель — единственное, что подсвечено.',
    },
  },
  {
    id: 'text-steps',
    title: { en: 'A block of text and a quiet action', ru: 'Блок текста и тихое действие' },
    when: {
      en: 'A panel with a title, a few lines of copy, a hint and one quiet action: a settings block, an info card.',
      ru: 'Панель с названием, парой строк текста, подсказкой и одним тихим действием: блок настроек, информационная карточка.',
    },
    rule: {
      en: 'Title `text-strong`, copy `text`, hint `text-muted`, and the action `variant="ghost" tone="neutral"`. Every step does its own job, and the colours are roles, not hex.',
      ru: 'Название `text-strong`, текст `text`, подсказка `text-muted`, действие `variant="ghost" tone="neutral"`. Каждая ступень делает свою работу, а цвета — роли, не hex.',
    },
    wrong: {
      en: 'The copy is `text-strong`, the hint is accent, the action has no `tone`: three colours, no order.',
      ru: 'Текст в `text-strong`, подсказка акцентная, у действия нет `tone`: три цвета и никакого порядка.',
    },
    why: {
      en: 'The eye reads the colour as rank. With the copy as bright as the title the title no longer leads; an accent hint and an amber action look like two main things on one panel. With the ladder the title leads, the copy reads, the hint steps back, and the one quiet action is found when it is needed.',
      ru: 'Глаз читает цвет как ранг. Когда текст так же ярок, как название, название перестаёт вести; акцентная подсказка и янтарное действие выглядят как две главные вещи на одной панели. С лестницей название ведёт, текст читается, подсказка отходит назад, а единственное тихое действие находится, когда нужно.',
    },
  },
  {
    id: 'form-footer',
    title: { en: 'The footer of a form or dialog', ru: 'Подвал формы или диалога' },
    when: {
      en: 'The buttons at the bottom of a form, a modal or a drawer: confirm and cancel.',
      ru: 'Кнопки внизу формы, модального окна или шторки: подтвердить и отменить.',
    },
    rule: {
      en: 'The confirming action is the one primary button, at the end. Cancel is `secondary` (or `ghost` with `tone="neutral"`), before it.',
      ru: 'Подтверждающее действие — единственная primary-кнопка, в конце. Отмена — `secondary` (или `ghost` с `tone="neutral"`), перед ней.',
    },
    wrong: {
      en: 'Two filled accent buttons: Cancel looks as important as Save.',
      ru: 'Две залитые акцентные кнопки: «Отмена» выглядит такой же важной, как «Сохранить».',
    },
    why: {
      en: 'Two filled accent buttons side by side make the eye choose between them. The footer has one answer the user is expected to give; the other button is the way out, and it looks like one.',
      ru: 'Две залитые акцентные кнопки рядом заставляют глаз выбирать между ними. У подвала один ответ, который от пользователя ждут; вторая кнопка — выход, и выглядеть она должна как выход.',
    },
  },
  {
    id: 'sizes',
    title: { en: 'Controls side by side: one size', ru: 'Контролы рядом: один размер' },
    when: {
      en: 'A row or a panel with several controls: a segmented switch, a select, buttons, inputs. Also the content of a popover.',
      ru: 'Ряд или панель из нескольких контролов: переключатель, select, кнопки, поля. И содержимое поповера.',
    },
    rule: {
      en: 'Put one context class on the container: `class="tao-size-small"` (and `tao-density-*`). Do not pass `size` to some of the controls, and do not pin a height (`--tao-control-height: 32px`, `height: 32px`) on one of them. An explicit `size` is for the one control that must stand out. A `TaoPopover` panel, a select list and a combobox list carry the size and the density of where they hang from.',
      ru: 'Один контекстный класс на контейнер: `class="tao-size-small"` (и `tao-density-*`). Не передавать `size` части контролов и не прибивать высоту (`--tao-control-height: 32px`, `height: 32px`) одному из них. Явный `size` — для единственного контрола, который должен выделяться. Панель `TaoPopover`, список select и список combobox несут размер и плотность того места, откуда висят.',
    },
    wrong: {
      en: 'On purpose: `size="small"` on the switch only, so it is shorter than the select and the button beside it.',
      ru: 'Нарочно: `size="small"` только у переключателя, поэтому он ниже select и кнопки рядом.',
    },
    why: {
      en: '`size` is a prop with a default of medium. Set it on the controls you remember and the rest stay medium: the row comes out uneven, a small switch beside a tall select. A pinned height is the same thing by hand. The class makes them one by construction, also for the controls added later and for a panel in the body.',
      ru: '`size` — это проп со значением по умолчанию medium. Задашь его тем контролам, которые вспомнил, — остальные останутся medium: ряд выходит неровным, мелкий переключатель рядом с высоким select. Прибитая высота — то же самое руками. Класс делает их одним целым по построению, в том числе для контролов, добавленных потом, и для панели в body.',
    },
  },
  {
    id: 'destructive',
    title: { en: 'A destructive action', ru: 'Разрушающее действие' },
    when: {
      en: 'Delete, discard, reset: something that cannot be taken back.',
      ru: 'Удалить, отбросить, сбросить: то, что не вернуть.',
    },
    rule: {
      en: '`tone="danger"` on the button that destroys, the safe choice quiet (`secondary`). For a question in its own window use `await confirm().title(…).message(…).danger()`: it resolves to a boolean.',
      ru: '`tone="danger"` на кнопке, которая разрушает, безопасный выбор тихий (`secondary`). Для вопроса в отдельном окне — `await confirm().title(…).message(…).danger()`: он возвращает boolean.',
    },
    wrong: {
      en: 'Red on the safe button, the accent on the one that deletes.',
      ru: 'Красный на безопасной кнопке, акцент на той, что удаляет.',
    },
    why: {
      en: 'The accent says "the normal main thing", and a delete wearing it looks like any other action. Red on the safe button inverts the warning: the colour then points at the wrong choice.',
      ru: 'Акцент говорит «обычное главное», и удаление в нём выглядит как любое другое действие. Красный на безопасной кнопке переворачивает предупреждение: цвет тогда указывает на неверный выбор.',
    },
  },
]

/** The <template> of a single-file component, trimmed: the code the page shows and the reference prints. / <template> компонента: показанный код. */
export function templateOf(source) {
  const text = String(source).replace(/\r\n/g, '\n')
  const start = text.indexOf('<template>')
  const end = text.lastIndexOf('</template>')
  if (start < 0 || end < 0) return text.trim()
  const body = text.slice(start + '<template>'.length, end).replace(/^\n+|\s+$/g, '')
  const indent = Math.min(...body.split('\n').filter((line) => line.trim()).map((line) => line.match(/^ */)[0].length))
  return body
    .split('\n')
    .map((line) => line.slice(indent))
    .join('\n')
}
