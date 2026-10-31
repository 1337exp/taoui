// What the keys do, one card per key. Every line is held by a test of the component it names (tests/toolbar, menubar,
// tree, menu, list-roving, overlays) or by its source; add a line only for what a test or the code shows.
// Что делают клавиши, карточка на клавишу. Каждая строка подтверждена тестом названного компонента или его кодом:
// добавляйте строку только для того, что показывают тест или код.
export const KEYS = [
  {
    keys: ['Tab'],
    en: 'one stop per group: a toolbar, a menu bar, a tree, a list with roving; the group remembers where you were',
    ru: 'один останов на группу: тулбар, меню-бар, дерево, список с roving; группа помнит, где вы были',
  },
  {
    keys: ['←', '→'],
    en: 'walk inside a group (a toolbar and a menu bar wrap); in a menu → opens a submenu and ← closes it; in a tree → opens a branch and goes into it, ← closes it and goes out to the parent',
    ru: 'ход внутри группы (тулбар и меню-бар замыкаются в круг); в меню → открывает подменю, ← закрывает; в дереве → открывает ветку и входит в неё, ← закрывает и выходит к родителю',
  },
  {
    keys: ['↑', '↓'],
    en: 'the rows of a list, the items of a menu (disabled ones are skipped), the rows of a tree; ↓ opens a menu from its button',
    ru: 'строки списка, пункты меню (недоступные пропускаются), строки дерева; ↓ открывает меню с его кнопки',
  },
  {
    keys: ['Enter', 'Space'],
    en: 'open a menu, pick an item, press a toggle (aria-pressed says the state)',
    ru: 'открыть меню, выбрать пункт, нажать переключатель (aria-pressed говорит о состоянии)',
  },
  {
    keys: ['Home', 'End'],
    en: 'the first and the last item; in a slider the minimum and the maximum',
    ru: 'первый и последний пункт; в слайдере минимальное и максимальное значение',
  },
  {
    keys: ['Esc'],
    en: 'close a popup, a menu (a submenu first, the menu on the next press), a modal, a panel; in confirm() it is a refusal',
    ru: 'закрыть попап, меню (сначала подменю, потом меню), модалку, панель; в confirm() это отказ',
  },
  {
    keys: ['a–z'],
    en: 'type-ahead: a letter jumps to the first item that starts with it, in a menu and in a tree (* in a tree opens every sibling branch)',
    ru: 'type-ahead: буква прыгает к первому пункту на неё, в меню и в дереве (* в дереве открывает все соседние ветки)',
  },
  {
    keys: ['Delete', '⌫'],
    en: 'clear the value of a Select, unless clearable is off',
    ru: 'сбросить значение у Select, если clearable не выключен',
  },
]
