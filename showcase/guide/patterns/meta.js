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
        en: 'Tools that serve the content, not the task itself: a toolbar or an editor panel, a filter or settings bar, the actions in a table or list row, the controls inside a popover or a menu, a utility panel (the bar of this showcase). Many controls close together, a mouse first.',
        ru: 'Инструменты, которые служат содержимому, а не самой задаче: панель инструментов или редактора, панель фильтров и настроек, действия в строке таблицы или списка, контролы внутри поповера и меню, служебная панель (панель этого шоукейса). Много контролов рядом, прежде всего мышь.',
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
      en: 'Every button is `variant="ghost" tone="neutral"`, an icon with an `aria-label`. A toggle is `v-model:pressed`. Group related tools with `TaoToolbarGroup` and split the groups with `TaoToolbarSeparator`.',
      ru: 'Каждая кнопка — `variant="ghost" tone="neutral"`, иконка с `aria-label`. Переключатель — `v-model:pressed`. Связанные инструменты — в `TaoToolbarGroup`, группы разделяет `TaoToolbarSeparator`.',
    },
    why: {
      en: 'In a toolbar every button is a tool and none is the main one, so none may take the accent. Left amber, the bar shouts, and the one thing that must stand out, which toggles are on, is lost: it is the same colour as the rest. In neutral the pressed toggle is the only lit thing.',
      ru: 'В панели инструментов каждая кнопка — инструмент, и ни одна не главная, поэтому акцент не принадлежит ни одной. Оставишь янтарь — панель кричит, а то единственное, что должно выделяться, — какие переключатели включены, — теряется: оно того же цвета, что и остальное. В нейтральной панели включённый переключатель — единственное, что подсвечено.',
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
