// The controls on the bench, and what each is expected to be at rest. The expectations are the Guide's text ladder:
// a control at rest is `text`, a chosen one is the accent, an option that is not chosen is `subtle`; one weight for
// the labels of controls; one height for the controls of a size; a fill that can be seen on its surface.
// Контролы стенда и то, чем каждый должен быть в покое. Ожидания — лестница текста из Guide: контрол в покое — `text`,
// выбранный — акцент, невыбранная опция — `subtle`; один вес для подписей контролов; одна высота на размер; заливка,
// которую видно на своей поверхности.
//
// `text`: where to read the colour, the size and the weight; `fill`: what to compare with the surface; `box`: what to
// measure the height of. Selectors are searched inside the cell of the control (`cell`: the id of the cell when one cell
// serves two rows, a chosen and a not chosen tab).
// `hover`: what to put under the pointer (the colour of the text and the fill are read again, see hover.js).
// `hover` — что поставить под указатель (цвет текста и заливка читаются заново, см. hover.js).
// `on`: what the fill stands on when that is not the surface itself (a thumb on its track).
// `on` — на чём стоит заливка, если это не сама поверхность (бегунок на дорожке).
// `text` — где читать цвет, размер и вес; `fill` — что сравнивать с поверхностью; `box` — что мерить по высоте.

export const CONTROLS = [
  { id: 'button-primary', en: 'Button primary', ru: 'Кнопка primary', text: '.tao-button', fill: '.tao-button', box: '.tao-button', hover: '.tao-button', expect: { step: 'on-accent', weight: true, height: true } },
  { id: 'button-secondary', en: 'Button secondary', ru: 'Кнопка secondary', text: '.tao-button', fill: '.tao-button', box: '.tao-button', hover: '.tao-button', expect: { step: 'text', weight: true, height: true } },
  { id: 'button-ghost', en: 'Button ghost, neutral', ru: 'Кнопка ghost, neutral', text: '.tao-button', fill: null, box: '.tao-button', hover: '.tao-button', expect: { step: 'text', weight: true, height: true } },
  { id: 'input', en: 'Input', ru: 'Поле ввода', text: 'input', fill: '.tao-input__field', box: '.tao-input__field', expect: { step: 'text', weight: false, height: true } },
  { id: 'select', en: 'Select', ru: 'Выбор из списка', text: '.tao-select__value', fill: '.tao-select__control', box: '.tao-select__control', expect: { step: 'text', weight: true, height: true } },
  { id: 'input-number', en: 'Number input', ru: 'Числовое поле', text: 'input', fill: '.tao-input-number__field', box: '.tao-input-number__field', expect: { step: 'text', weight: false, height: true } },
  { id: 'segmented-idle', cell: 'segmented', en: 'Segmented, not chosen', ru: 'Сегмент, не выбран', text: '.tao-segmented-option:not(.tao-segmented-option--checked) .tao-segmented-option__label', fill: '.tao-segmented__track', box: '.tao-segmented__track', hover: '.tao-segmented-option:not(.tao-segmented-option--checked)', expect: { step: 'subtle', weight: true, height: true } },
  { id: 'segmented-chosen', cell: 'segmented', en: 'Segmented, chosen', ru: 'Сегмент, выбран', text: '.tao-segmented-option--checked .tao-segmented-option__label', fill: '.tao-segmented__thumb', on: '.tao-segmented__track', box: '.tao-segmented__track', expect: { step: 'accent-text', weight: true, height: false } },
  { id: 'tabs-idle', cell: 'tabs', en: 'Tab, not chosen', ru: 'Вкладка, не выбрана', text: '.tao-tabs__tab[aria-selected="false"]', fill: null, box: '.tao-tabs__tab', hover: '.tao-tabs__tab[aria-selected="false"]', expect: { step: 'subtle', weight: true, height: false } },
  { id: 'tabs-chosen', cell: 'tabs', en: 'Tab, chosen', ru: 'Вкладка, выбрана', text: '.tao-tabs__tab[aria-selected="true"]', fill: null, box: '.tao-tabs__tab', expect: { step: 'accent-text', weight: true, height: false } },
  { id: 'dropdown', en: 'Dropdown menu button', ru: 'Кнопка меню', text: '.tao-dropdown-menu__button', fill: null, box: '.tao-dropdown-menu__button', hover: '.tao-dropdown-menu__button', expect: { step: 'text', weight: false, height: true } },
  { id: 'theme-toggle', en: 'Theme toggle', ru: 'Переключатель темы', text: '.tao-theme-toggle', fill: null, box: '.tao-theme-toggle', hover: '.tao-theme-toggle', expect: { step: 'text', weight: false, height: true } },
  { id: 'menu-link', cell: 'menu', en: 'Menu link (the sidebar of this page)', ru: 'Ссылка меню (боковая панель этой страницы)', text: '.showcase-nav__link:not(.active)', fill: null, box: null, hover: '.showcase-nav__link:not(.active)', expect: { step: 'text', weight: false, height: false } },
  { id: 'menu-current', cell: 'menu', en: 'Menu link, current', ru: 'Ссылка меню, текущая', text: '.showcase-nav__link.active', fill: null, box: null, hover: '.showcase-nav__link.active', expect: { step: 'accent-text', weight: false, height: false } },
  { id: 'link', en: 'Link in text', ru: 'Ссылка в тексте', text: 'a', fill: null, box: null, hover: 'a', expect: { step: null, weight: false, height: false } },
  { id: 'checkbox', en: 'Checkbox label', ru: 'Подпись чекбокса', text: '.tao-checkbox__label', fill: null, box: null, expect: { step: 'text', weight: false, height: false } },
  { id: 'tag', en: 'Tag', ru: 'Тег', text: '.tao-tag', fill: null, box: null, expect: { step: 'accent-text', weight: false, height: false } },
]
