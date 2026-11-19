// The Guide: what to use when, and why. Pages about the ground the components stand on (layers, type, surfaces, language,
// accessibility); recommendations and the starters (whole screens to begin a project from) are their own groups.
// Руководство: что, когда и почему. Страницы про основу, на которой стоят компоненты (слои, шрифт, поверхности, язык,
// доступность); рекомендации и каркасы (целые экраны, с которых начинают проект) — свои группы.
export const navGroups = [
  {
    id: 'recommendations',
    title: { en: 'Recommendations', ru: 'Рекомендации' },
    items: [
      { id: 'size-choice', label: { en: 'Choosing a size', ru: 'Выбор размера' }, aliases: ['size', 'sizes', 'small', 'medium', 'large', 'density', 'compact', 'comfortable', 'touch', 'height', 'размер', 'размеры', 'маленький', 'плотность', 'высота', 'кнопка'] },
      { id: 'patterns', label: { en: 'Patterns', ru: 'Шаблоны' }, aliases: ['patterns', 'recommendations', 'design', 'accent', 'toolbar', 'form', 'footer', 'destructive', 'delete', 'ghost', 'neutral', 'шаблоны', 'рекомендации', 'дизайн', 'акцент', 'панель', 'подвал', 'удаление'] },
    ],
  },
  {
    id: 'starters',
    title: { en: 'Starters', ru: 'Каркасы' },
    items: [
      { id: 'starter-app-shell', label: { en: 'App shell', ru: 'Оболочка приложения' }, aliases: ['starters', 'starter', 'templates', 'template', 'shell', 'app shell', 'layout', 'sidebar', 'side menu', 'scaffold', 'boilerplate', 'fill', 'каркас', 'каркасы', 'заготовка', 'оболочка', 'меню слева', 'боковое меню', 'начать проект'] },
      { id: 'starter-list-detail', label: { en: 'List and item', ru: 'Список и запись' }, aliases: ['starters', 'starter', 'master detail', 'list detail', 'list', 'detail', 'notes', 'mail', 'inbox', 'split', 'каркас', 'каркасы', 'список', 'запись', 'карточка', 'заметки', 'почта'] },
    ],
  },
  {
    id: 'foundations',
    title: { en: 'Foundations', ru: 'Основа' },
    items: [
      { id: 'layers', label: { en: 'Layers & theming', ru: 'Слои и темизация' }, aliases: ['layers', 'theme', 'theming', 'tokens', 'primitives', 'semantic', 'contexts', 'data-tao-theme', 'слои', 'тема', 'темизация', 'токены'] },
      { id: 'typography', label: { en: 'Typography', ru: 'Типографика' }, aliases: ['prose', 'heading', 'tao-prose', 'заголовки', 'текст'] },
      { id: 'surface', label: { en: 'Surfaces', ru: 'Поверхности' }, aliases: ['glass', 'grain', 'lit', 'surface'] },
      { id: 'backgrounds', label: { en: 'Backgrounds', ru: 'Фоны' }, aliases: ['background', 'gradient', 'noise', 'atmosphere', 'glow', 'фон', 'градиент', 'шум'] },
      { id: 'locale', label: { en: 'Localization', ru: 'Локализация' }, aliases: ['locale', 'language', 'i18n', 'translation', 'setTaoLocale', 'provideTaoLocale', 'localeRu', 'localeEn', 'язык', 'перевод', 'локаль', 'интернационализация'] },
      { id: 'harmony', label: { en: 'Controls side by side', ru: 'Контролы рядом' }, aliases: ['harmony', 'bench', 'controls', 'row', 'weight', 'ladder', 'text ladder', 'sunken', 'raised', 'surface', 'стенд', 'контролы', 'ряд', 'вес', 'лестница', 'сочетание'] },
      { id: 'a11y', label: { en: 'Contrast & keyboard', ru: 'Контраст и клавиатура' }, aliases: ['contrast', 'wcag', 'apca', 'keyboard', 'keys', 'focus', 'palette', 'applyTaoPalette', 'contrastRatio', 'apcaContrast', 'a11y', 'accessibility', 'контраст', 'клавиатура', 'клавиши', 'доступность', 'палитра'] },
    ],
  },
]
