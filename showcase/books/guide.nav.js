// The Guide: what to use when, and why. Pages about the ground the components stand on (layers, type, surfaces, language,
// accessibility); recommendations and ready templates join them here as their own group.
// Руководство: что, когда и почему. Страницы про основу, на которой стоят компоненты (слои, шрифт, поверхности, язык,
// доступность); рекомендации и готовые шаблоны добавятся сюда отдельной группой.
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
    id: 'foundations',
    title: { en: 'Foundations', ru: 'Основа' },
    items: [
      { id: 'layers', label: { en: 'Layers & theming', ru: 'Слои и темизация' }, aliases: ['layers', 'theme', 'theming', 'tokens', 'primitives', 'semantic', 'contexts', 'data-tao-theme', 'слои', 'тема', 'темизация', 'токены'] },
      { id: 'typography', label: { en: 'Typography', ru: 'Типографика' }, aliases: ['prose', 'heading', 'tao-prose', 'заголовки', 'текст'] },
      { id: 'surface', label: { en: 'Surfaces', ru: 'Поверхности' }, aliases: ['glass', 'grain', 'lit', 'surface'] },
      { id: 'backgrounds', label: { en: 'Backgrounds', ru: 'Фоны' }, aliases: ['background', 'gradient', 'noise', 'atmosphere', 'glow', 'фон', 'градиент', 'шум'] },
      { id: 'locale', label: { en: 'Localization', ru: 'Локализация' }, aliases: ['locale', 'language', 'i18n', 'translation', 'setTaoLocale', 'provideTaoLocale', 'localeRu', 'localeEn', 'язык', 'перевод', 'локаль', 'интернационализация'] },
      { id: 'a11y', label: { en: 'Contrast & keyboard', ru: 'Контраст и клавиатура' }, aliases: ['contrast', 'wcag', 'apca', 'keyboard', 'keys', 'focus', 'palette', 'applyTaoPalette', 'contrastRatio', 'apcaContrast', 'a11y', 'accessibility', 'контраст', 'клавиатура', 'клавиши', 'доступность', 'палитра'] },
    ],
  },
]
