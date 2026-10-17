const r = (name, type, def, note) => ({ name, type, default: def, note })

export const propTables = {
  block: [
    {
      title: 'TaoBlock',
      rows: [
        r('padding', 'number | string | (…)[]', '16', 'Внутренний отступ. Число — px, строка — любая CSS-длина. Массив — как CSS padding (1–4 значения)'),
        r('radius', 'number | string', '8', 'Скругление. Число — px, строка — CSS'),
        r('shadow', 'boolean', 'true', 'Тень панели'),
        r('hover', 'boolean', 'false', 'Усилить тень при наведении, курсор pointer'),
        r('surface', "'flat' | 'grain' | 'glass'", "'flat'", 'Из чего сделан блок: заливка / зерно / стекло. См. «Поверхности»'),
      ],
      slots: 'default — содержимое блока.',
    },
  ],
  button: [
    {
      title: 'TaoButton',
      rows: [
        r('type', "'button' | 'submit' | 'reset'", "'button'", 'Нативный type кнопки'),
        r('variant', "'primary' | 'secondary' | 'ghost' | 'text' | 'danger'", "'primary'", 'Форма. Залитый красный — danger, не tone'),
        r('tone', "'danger' | 'success' | 'warning' | 'info' | 'neutral' | ''", "''", 'Красит ghost и text. neutral — тёмный текст, только подсветка при наведении цветом темы; для тихого действия рядом с основным. Не вместо variant'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер. Без него — размер предков (класс tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled', 'boolean', 'false', 'Неактивна'),
        r('loading', 'boolean', 'false', 'Спиннер, клик глушится'),
        r('block', 'boolean', 'false', 'Ширина 100%'),
        r('icon', 'string', "''", 'Символ слева от текста'),
      ],
      slots: 'default — подпись кнопки.',
    },
  ],
  surface: [
    {
      title: 'Классы и токены',
      rows: [
        r('.tao-surface-grain', 'class', '—', 'Статичное плёночное зерно. Любой элемент'),
        r('.tao-surface-glass', 'class', '—', 'Полупрозрачная заливка + размытие фона. Без поддержки blur или при prefers-reduced-transparency — сплошная'),
        r('--tao-surface-grain-image / -size', 'image / length', 'SVG / 160px', 'Своя текстура зерна'),
        r('--tao-glass-fill / -border / -blur', 'color / color / length', '55% / white 8% / 16px', 'Стекло'),
      ],
      slots: 'Поверхность принадлежит одному элементу: вложенные панели её не наследуют. Toast и confirm стеклянные по умолчанию: toast.defaults({ surface: \'flat\' }) / confirm.defaults({ surface: \'flat\' }) выключают.',
    },
  ],
  card: [
    {
      title: 'TaoCard',
      rows: [
        r('padding', 'number | string | (…)[]', '20', 'Отступ тела карточки. Число — px, строка — CSS. У flush — 0'),
        r('radius', 'number | string', '8', 'Скругление. Число — px, строка — CSS'),
        r('shadow', 'boolean', 'true', 'Обычная тень. У flush выключена'),
        r('shadowBottomOnly', 'boolean', 'false', 'Линия снизу карточки, не scrim на фото'),
        r('flush', 'boolean', 'false', 'Плитка: без padding и тени, cover/body на всю ячейку'),
        r('hover', 'boolean', 'false', 'Обводка акцентом при наведении'),
        r('surface', "'flat' | 'grain' | 'glass'", "'flat'", 'Из чего сделана карточка: заливка / зерно / стекло. См. «Поверхности»'),
        r('active', 'boolean', 'false', 'Выделенное состояние'),
        r('overflow', 'boolean', 'false', 'Не обрезать содержимое (cover/карусель)'),
      ],
      slots: 'default — тело. #cover, #overlay (scrim поверх cover или всей плитки), #header, #title, #sub, #footer.',
    },
  ],
  copy: [
    {
      title: 'TaoCopy',
      rows: [
        r('text', 'string', '—', 'Строка в буфер. Обязательный'),
        r('successText', 'string', "'Скопировано!'", 'Текст тултипа после клика'),
        r('successMessage', 'string', '—', 'Устарел: successText (видимые тексты — *Text, aria — *Label)'),
        r('copyLabel', 'string', "'Копировать'", 'aria-label кнопки'),
        r('tip', 'boolean', 'true', 'Показать тултип над кнопкой после копирования'),
      ],
    },
  ],
  input: [
    {
      title: 'TaoInput',
      rows: [
        r('v-model', 'string | number', "''", 'Значение поля'),
        r('type', "'text' | 'password' | 'email' | 'number' | 'tel'", "'text'", 'Тип native input'),
        r('placeholder', 'string', "''", 'Подсказка внутри'),
        r('label', 'string', "''", 'Устарел: подпись — label у TaoFormField, как у всех полей'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('errorMessage', 'string', "''", 'Устарел: текст ошибки — error у TaoFormField'),
        r('id', 'string', 'auto', 'id инпута; иначе из FormField или useId'),
      ],
      slots: '#prefix и #suffix — внутри рамки слева/справа (иконка, текст).',
    },
    {
      title: 'TaoInputGroup',
      rows: [
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер всей группы: аддоны, поле и кнопки внутри'),
      ],
      slots: 'default — само поле (TaoInput и т.п.). #before / #after — протокол, единица, кнопка. Склеивает аддон + поле + аддон в одну рамку.',
    },
  ],
  'input-number': [
    {
      title: 'TaoInputNumber',
      rows: [
        r('v-model', 'number | null', 'null', 'Число. Пустое поле — null, не 0 и не строка'),
        r('min / max', 'number', '—', 'Границы. Не заданы — без ограничения'),
        r('step', 'number', '1', 'Шаг ± и стрелок'),
        r('precision', 'number', '—', 'Знаков после запятой'),
        r('@commit', 'number | null', '—', 'Edit finished: blur, Enter, ±, arrow key (once per action; v-model fires per keystroke). / Правка закончена: blur, Enter, ±, стрелка (один раз на действие, v-model обновляется на каждую клавишу)'),
        r('controls', 'boolean', 'true', 'Кнопки ± справа'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('placeholder', 'string', "''", 'Подсказка, когда null'),
      ],
    },
  ],
  quantity: [
    {
      title: 'TaoQuantity',
      rows: [
        r('v-model', 'number', '1', 'Целое количество. Пустым не бывает'),
        r('min', 'number', '1', 'Нижняя граница'),
        r('max', 'number', '—', 'Сток. Не задан — без потолка'),
        r('allowRemove', 'boolean', 'true', 'Минус на min живой и шлёт dec — родитель может убрать строку'),
        r('forceMaxLimit', 'boolean', 'true', 'Прижать ввод к max на blur и если пришло больше стока'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
      ],
      slots: '#decrement-icon / #increment-icon — иконки кнопок.',
    },
  ],
  textarea: [
    {
      title: 'TaoTextarea',
      rows: [
        r('v-model', 'string', "''", 'Текст'),
        r('placeholder', 'string', "''", 'Подсказка'),
        r('rows', 'number', '3', 'Стартовая высота'),
        r('maxlength', 'number', '—', 'Режет ввод'),
        r('count', 'boolean', 'false', 'Показать «введено / максимум» (вместе с maxlength)'),
        r('resize', 'boolean', 'true', 'Можно тянуть за угол'),
        r('variant', "'bar' | 'outline' | 'filled' | 'plain'", "'bar'", 'Полоса слева / рамка как у TaoInput / только заливка / ничего'),
        r('readonly', 'boolean', 'false', 'Читается и выделяется, но не правится'),
        r('noSpace', 'boolean', 'false', 'Пробел не вводится — ни с клавиатуры, ни вставкой'),
        r('noBorder / noBackground / borderInverse', 'boolean', 'false', 'Устарели: variant="filled" / variant="plain" / полоса справа'),
        r('dummy', 'boolean', 'false', 'Устарел: readonly'),
        r('align', "'start' | 'center' | 'end'", "'start'", 'Выравнивание текста'),
        r('autofocus', 'boolean', 'false', 'Фокус при монтировании'),
        r('blurOnEnter', 'boolean', 'false', 'Enter снимает фокус вместо переноса (Shift+Enter переносит); keydown уходит раньше'),
        r('textCenter / autoFocus / submitOnEnter', 'boolean', 'false', 'Устарели: align="center" / autofocus / blurOnEnter'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка'),
      ],
    },
  ],
  checkbox: [
    {
      title: 'TaoCheckbox',
      rows: [
        r('v-model', 'boolean', '—', 'Отмечен / нет'),
        r('checked', 'boolean', '—', 'Состояние без v-model'),
        r('value', 'boolean', '—', 'Устарел: checked. value станет значением опции, как у TaoRadio'),
        r('label', 'string', "''", 'Подпись справа'),
        r('indeterminate', 'boolean', 'false', 'Черта вместо галочки. Клик ставит checked, смешанное считает родитель'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Квадрат 14 / 18 / 22 и кегль подписи. Без него — размер предков'),
        r('error', 'boolean', 'false', 'Красный акцент. Текст ошибки — через TaoFormField'),
      ],
    },
  ],
  select: [
    {
      title: 'TaoSelect',
      rows: [
        r('v-model', 'string | number | null', 'null', 'value выбранной опции. Очистка → null'),
        r('options', 'TaoSelectOption[]', '[]', '{ value, label, disabled? }'),
        r('placeholder', 'string', "'Выберите'", 'Когда модель null'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
        r('error', 'boolean', 'false', 'Красная рамка'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, как у TaoButton; масштабирует и раскрытый список. Без него — размер предков'),
        r('clearable', 'boolean', 'true', 'Clear row and Delete / Backspace. Turn off when null is not valid. / Пункт сброса и Delete / Backspace. Выключите, когда null не допустим'),
        r('clearText', 'string', "'Очистить'", 'Label of the clear row. / Подпись пункта сброса'),
      ],
      slots: '#clear: content of the clear row (icon, markup), replaces clearText. / Содержимое пункта сброса (иконка, разметка), заменяет clearText. #chevron: custom arrow. / Своя стрелка.',
    },
    {
      title: 'TaoSwitch',
      rows: [
        r('v-model', 'boolean', 'false', 'Вкл / выкл. role="switch"'),
        r('label', 'string', "''", 'Подпись справа'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Дорожка 28 / 36 / 44 px в ширину и кегль подписи. Без него — размер предков'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
      ],
    },
    {
      title: 'TaoRadio / TaoRadioGroup',
      rows: [
        r('value', 'string | number | boolean', '—', 'Radio: значение этой точки. Обязательный'),
        r('v-model', 'то же', '—', 'Group держит выбранное. Radio без группы — сам'),
        r('legend', 'string', '—', 'Group: подпись группы'),
        r('direction', "'row' | 'column'", "'row'", 'Group: в ряд или столбиком'),
        r('disabled', 'boolean', 'false', 'Точка или вся группа'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Круг 14 / 18 / 22 и кегль подписи. У группы — для всех радио внутри'),
        r('label / name', 'string', "''", 'Radio: подпись и name, если нет группы'),
      ],
    },
    {
      title: 'TaoFormField',
      rows: [
        r('label', 'string', '—', 'Общая подпись над контролом'),
        r('hint', 'string', '—', 'Подсказка под полем'),
        r('error', 'string', '—', 'Текст ошибки; если есть — поле invalid'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер контрола внутри'),
      ],
      slots: 'default — сам контрол (Input, Select, Switch…).',
    },
  ],
  segmented: [
    {
      title: 'TaoSegmented',
      rows: [
        r('v-model', 'string | number | boolean', '—', 'value выбранной опции'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Высота сегментов, шкала как у TaoButton. Без него — размер предков'),
        r('block', 'boolean', 'false', 'Растянуть на ширину родителя'),
        r('legend', 'string', '—', 'Доступное имя группы'),
        r('disabled', 'boolean', 'false', 'Вся группа'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('name', 'string', 'auto', 'name для radio-input внутри'),
      ],
      slots: 'default — набор TaoSegmentedOption.',
    },
    {
      title: 'TaoSegmentedOption',
      rows: [
        r('value', 'string | number | boolean', '—', 'Значение опции. Обязательный'),
        r('label', 'string', "''", 'Текст. Или слот default'),
        r('icon', 'string', "''", 'Символ слева'),
        r('count', 'number | string', '—', 'Цифра справа (бейдж)'),
        r('disabled', 'boolean', 'false', 'Эта опция'),
      ],
    },
  ],
  combobox: [
    {
      title: 'TaoCombobox',
      rows: [
        r('v-model', 'string | number | null', 'null', 'value опции или произвольная строка при allow-create'),
        r('options', 'TaoSelectOption[]', '[]', '{ value, label, disabled? }. Список не мутирует сам'),
        r('placeholder', 'string', "'Начните вводить'", 'Пустое поле'),
        r('allowCreate', 'boolean', 'false', 'Можно оставить то, чего нет в списке'),
        r('emptyText', 'string', "'Ничего не найдено'", 'Пустой фильтр'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, как у TaoButton и TaoSelect; масштабирует и раскрытый список. Без него — размер предков'),
        r('clearable', 'boolean', 'true', 'Clear row in the list. Turn off when null is not valid. / Пункт сброса в списке. Выключите, когда null не допустим'),
        r('clearText', 'string', "'Очистить'", 'Label of the clear row; slot #clear replaces it. / Подпись пункта сброса; слот #clear заменяет её'),
        r('disabled / error', 'boolean', 'false', 'Неактивен / красная рамка'),
      ],
      slots: 'create — событие, когда ввели новое: родитель сам дополняет options.',
    },
  ],
  typeahead: [
    {
      title: 'TypeaheadPlayground',
      rows: [
        r('v-model', 'object | null', 'null', 'Выбранный hit { id, name, city, role } или null'),
      ],
      slots: '#item="{ hit, active }" — строка списка. #empty — ничего не нашлось. Не часть npm-пакета, лежит в showcase/demo.',
    },
  ],
  date: [
    {
      title: 'TaoDate',
      rows: [
        r('v-model', 'string | null', 'null', 'Один день YYYY-MM-DD, без времени и пояса'),
        r('min / max', 'string', '—', 'Границы в том же формате'),
        r('placeholder', 'string', "'Дата'", 'Пустое поле'),
        r('locale', 'string', "'ru-RU'", 'Подписи календаря'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled / error', 'boolean', 'false', 'Неактивен / красная рамка'),
        r('todayText / clearText', 'string', "'Сегодня' / 'Очистить'", 'Кнопки внизу попапа'),
      ],
      slots: '#icon, #prev-icon, #next-icon — иконки поля и стрелок месяца.',
    },
    {
      title: 'TaoDateRange',
      rows: [
        r('v-model', '{ start, end } | null', 'null', 'Период YYYY-MM-DD. Неполный выбор в модель не пишется'),
        r('min / max', 'string', '—', 'Границы'),
        r('placeholder', 'string', "'Период'", 'Пока null'),
        r('locale', 'string', "'ru-RU'", 'Подписи календаря'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер, шкала как у TaoButton. Без него — размер предков (tao-size-* или size у FormField / InputGroup), иначе medium'),
        r('disabled / error', 'boolean', 'false', 'Неактивен / красная рамка'),
      ],
      slots: 'Первый клик — start, второй — end (меняются местами, если end раньше).',
    },
  ],
  pincode: [
    {
      title: 'TaoPinCode',
      rows: [
        r('length', 'number', '—', 'Число ячеек. С format не нужен: считается по маске'),
        r('format', 'string', '—', 'Маска с разделителями: # ячейка, остальное разделитель (#-##-## даёт 0-00-00). Разделители не входят в значение'),
        r('v-model', 'string', "''", 'Склеенная строка из ячеек'),
        r('numbersOnly', 'boolean', 'false', 'Только цифры'),
        r('masked', 'boolean', 'false', 'Точки вместо символов'),
        r('hidden', 'boolean', 'false', 'Устарел: masked (hidden — нативный атрибут)'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Ячейки 40×46 / 50×56 / 58×64. Без него — размер предков'),
        r('clearOn', "'focus' | 'input'", "'focus'", 'focus — клик сбрасывает ячейку и всё справа; input — меняет только при вводе'),
        r('placeholder', 'string', "''", 'Символ в пустой ячейке'),
      ],
      slots: 'Событие complete — набрали последнюю ячейку (она блюрится).',
    },
  ],
  slider: [
    {
      title: 'TaoProgress',
      rows: [
        r('progress', 'number', '0', 'Заполнение 0–100, не ширина полосы'),
        r('minWidth / maxWidth', 'number', '200 / —', 'Ширина бара в px'),
        r('height', 'number', '8', 'Толщина в px'),
        r('showPercentage', "boolean | 'top' | 'right'", 'true', 'true/top — над полосой, right — справа, false — скрыть'),
        r('animated', 'boolean', 'true', 'Плавное заполнение'),
      ],
      slots: '#left / #right — подписи. Если есть #right, процент справа в скобках.',
    },
    {
      title: 'TaoSlider',
      rows: [
        r('v-model', 'number', '—', 'Текущее значение. Обязательный. Две ручки: TaoRangeSlider с парой [от, до]'),
        r('min / max / step', 'number', '0 / 100 / 1', 'Диапазон и шаг'),
        r('marks', "boolean | (number | { value, label? })[]", '—', 'Метки шкалы: true — автоматические деления, массив чисел или объекты с подписью. Клик по подписи переносит ручку'),
        r('marksSide', "'start' | 'end'", "'end'", 'Сторона меток: end — под горизонтальным и справа от вертикального, start — над и слева'),
        r('discrete', 'boolean', 'false', 'Значение только на метках (ступенчатая шкала); стрелки идут по меткам'),
        r('format', '(value: number) => string', '—', 'Текст чисел: подписи автоматических меток и значение на полосе'),
        r('flat', 'boolean', 'false', 'Без круглых ручек: плоская полоса с заливкой. Клавиатура и фокус работают'),
        r('vertical', 'boolean', 'false', 'Вертикальный: максимум сверху, метки справа. Длина — --tao-slider-length (10rem)'),
        r('variant', "'bar' | 'thin'", "'bar'", 'bar — толстый трек, форм-контрол; thin — тонкий (seek / громкость). Раньше это был size="small"'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Масштаб трека и бегунка (бегунок 16 / 20 / 24). Без него — размер предков'),
        r('showValue', 'boolean', 'false', 'Значение поверх полосы'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
        r('error', 'boolean', 'false', 'Красная обводка трека. Текст ошибки — error у TaoFormField'),
        r('wheel', 'number', '0', 'Шаг изменения при прокрутке колёсика (одна ручка). 0 — отключено'),
        r('@change', 'value', '—', 'Закончили менять: отпустили, клавиша, колёсико, клик по метке. v-model — на каждое движение'),
        r('#mark', '{ mark, active }', '—', 'Своя подпись метки'),

      ],
    },
    {
      title: 'TaoRangeSlider',
      rows: [
        r('v-model', '[number, number]', '—', 'Пара [от, до]. Обязательный'),
        r('minGap', 'number', '0', 'Наименьшее расстояние между ручками; ручки не перепрыгивают друг друга'),
        r('…', '', '', 'Остальное как у TaoSlider: min / max / step, marks, discrete, format, vertical, variant, size, showValue, disabled, error'),
      ],
    },
    {
      title: 'TaoTimeline',
      rows: [
        r('v-model', 'number', '—', 'Текущее время. Обязательный'),
        r('v-model:playing', 'boolean', 'false', 'Идёт ли воспроизведение (вид кнопки). Время компонент сам не ведёт'),
        r('length', 'number', '—', 'Длина; слайдер идёт от 0 до неё. Обязательный'),
        r('step', 'number', '0.01', 'Шаг слайдера'),
        r('marks', '(number | { value, label? })[]', '—', 'Метки событий на шкале'),
        r('marksSide', "'start' | 'end'", "'end'", 'Метки над слайдером или под ним'),
        r('format', '(time: number) => string', 'toFixed(2)', 'Текст времени в метках и подписи'),
        r('pauseOnScrub', 'boolean', 'true', 'Пауза, когда пользователь взялся за слайдер'),
        r('showRestart / showTime', 'boolean', 'true', 'Кнопка «в начало»; подпись «время / длина»'),
        r('variant', "'bar' | 'thin'", "'thin'", 'Толщина трека'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер; без него — размер предков'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
        r('playLabel / pauseLabel / restartLabel', 'string', 'из локали', 'Подписи кнопок для скринридеров'),
        r('@restart', '—', '—', 'Кнопка «в начало» (время уже поставлено в 0)'),
        r('@seek', 'time', '—', 'Закончили перемотку: отпустили слайдер или клавиша'),
        r('#mark / #time', '{ mark, active } / { time, length, text }', '—', 'Своя подпись метки; своя подпись времени'),
      ],
    },
  ],
  color: [
    {
      title: 'TaoColorPicker',
      rows: [
        r('v-model', 'string', '—', 'Цвет строкой hex: #rrggbb, с alpha ещё #rrggbbaa. Понимает и rgb()/rgba() на входе. Обязательный'),
        r('alpha', 'boolean', 'false', 'Полоса прозрачности и #rrggbbaa'),
        r('swatches', 'string[]', '—', 'Готовые цвета под палитрой; выбранный отмечен'),
        r('modes', "('hex' | 'rgb' | 'hsl')[]", "['hex', 'rgb', 'hsl']", 'Способы ввода цвета; один способ скрывает переключатель'),
        r('v-model:mode', "'hex' | 'rgb' | 'hsl'", 'первый из modes', 'Текущий способ ввода; v-model:mode запоминает выбор между открытиями'),
        r('eyedropper', 'boolean', 'true', 'Пипетка (только где браузер умеет EyeDropper)'),
        r('disabled', 'boolean', 'false', 'Неактивна'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Размер полей; без него — размер предков'),
        r('areaLabel / hueLabel / alphaLabel / hexLabel / swatchesLabel / eyedropperLabel', 'string', 'из локали', 'Подписи для скринридеров (локаль colorPicker)'),
        r('@change', 'hex', '—', 'Закончили правку: отпустили квадрат или полосу, клавиша, поле hex, образец. v-model — на каждое движение'),
      ],
    },
    {
      title: 'TaoColorInput',
      rows: [
        r('v-model', 'string', '—', 'Цвет строкой hex. Обязательный'),
        r('alpha / swatches / modes / v-model:mode / eyedropper / size', '', '', 'Как у TaoColorPicker'),
        r('position', "'top' | 'bottom' | 'left' | 'right'", "'bottom'", 'С какой стороны открывается палитра'),
        r('error', 'boolean', 'false', 'Красная рамка. Текст ошибки — error у TaoFormField'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
      ],
    },
    {
      title: 'colorModel(source, options)',
      rows: [
        r('source', 'Ref<T>', '—', 'Ваше хранилище цвета. Возвращает записываемую строку hex для v-model'),
        r('format', "'object' | 'array' | 'css'", "'object'", '{ r, g, b, a }, [r, g, b, a] или строка rgb(r g b / a)'),
        r('range', '255 | 1', '255', 'Диапазон r, g, b; прозрачность всегда 0…1'),
        r('space', "'srgb' | 'linear'", "'srgb'", 'Пространство r, g, b; linear только с range: 1 (рендер, градиент TaoFX)'),
        r('alpha', 'boolean', 'false', 'Хранить прозрачность; без неё hex #rrggbb'),
        r('precision', 'number', '5', 'Знаков у дробных значений (range 1); у линейного цвета меньше даёт ступени в тёмном'),
      ],
    },
  ],
  filedrop: [
    {
      title: 'TaoFileDrop',
      rows: [
        r('v-model', 'File[]', '[]', 'Список файлов. Компонент сам его не копит — только то, что дал родитель'),
        r('multiple', 'boolean', 'false', 'Несколько файлов'),
        r('accept', 'string', "'*'", 'Как у <input type="file">'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Высота зоны и строк файлов. Без него — размер предков'),
        r('list', 'boolean', 'true', 'Имена под зоной. Снять файл — сразу в v-model'),
        r('showClear', 'boolean', 'false', 'Кнопка «очистить всё». Сама не чистит — шлёт clear-request'),
      ],
      slots: 'default — текст зоны. Событие change — добавили или убрали файлы (files — устаревший алиас). clear-request: родитель решает, обнулить сразу или после confirm().',
    },
  ],
  table: [
    {
      title: 'TaoTable',
      rows: [
        r('columns', 'TaoTableColumn[]', '—', 'Обязательный. { key, label, sortable?, align?, width? }'),
        r('rows', 'object[]', '[]', 'Данные'),
        r('v-model:sort', '{ key, dir } | null', 'null', 'Сортировка. dir: asc | desc'),
        r('loading', 'boolean', 'false', 'Оверлей загрузки'),
        r('emptyText', 'string', "'Нет данных'", 'Если rows пустой и не loading'),
        r('striped', "boolean | 'odd' | 'even'", 'false', 'Зебра. true/odd — с первой строки, even — со второй'),
        r('hover', 'boolean', 'true', 'Подсветка ряда при наведении'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Отступы и текст ячеек (small = бывший compact), заодно размер контролов в ячейках'),
        r('compact', 'boolean', 'false', 'Устарел: то же, что size="small"'),
        r('head', 'boolean', 'true', 'Подсветка шапки'),
        r('lines', 'boolean', 'true', 'Линии между рядами'),
        r('sticky', 'boolean', 'false', 'Липкая шапка (нужен maxHeight)'),
        r('rowKey', 'string | fn', "'id'", 'Ключ ряда'),
        r('maxHeight', 'number | string', '—', 'Скролл. Число — px'),
      ],
      slots: 'Ячейка: #cell-{key}="{ row, value }". События: change — сменили сортировку (sort — устаревший алиас), row-click, если clickable.',
    },
  ],
  pagination: [
    {
      title: 'TaoPagination',
      rows: [
        r('v-model:page', 'number', '1', 'Текущая страница'),
        r('total', 'number', '0', 'Всего записей (не страниц)'),
        r('pageSize', 'number', '10', 'Записей на страницу'),
        r('jump', 'number', '5', 'Клик «…» прыгает на столько страниц. 0 — «…» декоративная'),
        r('siblingCount', 'number', '1', 'Сколько номеров вокруг текущей'),
        r('showTotal', 'boolean', 'true', 'Подпись «1–10 из N»'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Кнопки 26 / 36 / 44, как TaoButton. Без него — размер предков'),
        r('disabled', 'boolean', 'false', 'Неактивна'),
      ],
    },
  ],
  empty: [
    {
      title: 'TaoEmpty',
      rows: [
        r('title', 'string', "'Ничего нет'", 'Заголовок пустого состояния'),
      ],
      slots: 'default — пояснение. #icon — картинка/иконка. #action — кнопка.',
    },
  ],
  list: [
    {
      title: 'TaoList',
      rows: [
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Высота строк 26 / 36 / 44. Item без своего size берёт отсюда'),
        r('bordered', 'boolean', 'true', 'Рамка вокруг списка'),
        r('divided', 'boolean', 'true', 'Линии между строками'),
        r('maxHeight', 'number | string', '—', 'Скролл. Число — пиксели'),
        r('empty', 'boolean', 'false', 'Показать #empty вместо строк'),
        r('ariaLabel', 'string', "''", 'Имя списка'),
      ],
      slots: 'default — TaoListItem. #empty — если empty.',
    },
    {
      title: 'TaoListItem',
      rows: [
        r('title', 'string', "''", 'Заголовок. Слот default его подменяет'),
        r('description', 'string', "''", 'Подпись под заголовком'),
        r('selected', 'boolean', 'false', 'Выбранная строка'),
        r('disabled', 'boolean', 'false', 'Неактивна'),
        r('active', 'boolean', 'false', 'Подсветка без selected'),
        r('clickable', 'boolean', 'false', 'Строка-кнопка, шлёт click'),
        r('size', "'small' | 'medium' | 'large'", 'из списка', 'Перебить size списка'),
        r('actionAlways', 'boolean', 'false', '#action всегда виден, не только по ховеру'),
      ],
      slots: 'default — заголовок. #prefix, #description, #suffix, #action (по ховеру; на таче всегда).',
    },
  ],
  stages: [
    {
      title: 'TaoStages',
      rows: [
        r('items', 'TaoStageItem[]', '[]', '{ key, label?, status?: wait | work | ok | bad }'),
        r('direction', "'row' | 'column'", "'column'", 'column — сверху вниз, row — в ряд. Как у TaoFlex'),
        r('vertical', 'boolean', '—', 'Устарел: direction'),
        r('ariaLabel', 'string', "'Стадии'", 'Имя списка'),
      ],
      slots: 'default / #icon="{ item, index, status }" — подменить текст или иконку шага.',
    },
  ],
  skeleton: [
    {
      title: 'TaoSkeleton',
      rows: [
        r('variant', "'text' | 'title' | 'circle' | 'rect'", "'text'", 'Форма плейсхолдера'),
        r('lines', 'number', '1', 'Сколько полосок (text)'),
        r('width / height', 'string', "''", 'CSS-размер, если нужно задать явно'),
      ],
    },
  ],
  counter: [
    {
      title: 'TaoCounter',
      rows: [
        r('value', 'number', '0', 'Число на витрине. Не поле ввода'),
        r('maxDigits', 'number', '9', 'Минимальная ширина в цифрах (ведущие нули скрыты визуально)'),
      ],
    },
  ],
  carousel: [
    {
      title: 'TaoCarousel',
      rows: [
        r('v-model', 'number', '0', 'Индекс текущего снапа'),
        r('perView', 'number', '1', 'Сколько слайдов в кадре. 5 — товарная полоса'),
        r('peek', 'number', '0', 'Сколько px следующей карточки видно справа'),
        r('autoplay', 'number', '0', 'Интервал в мс. 0 — выкл. Пауза на hover/фокус/drag'),
        r('loop', 'boolean', 'false', 'Крутить по кругу'),
        r('dots', 'boolean', 'false', 'Точки под лентой'),
        r('controls', 'boolean', 'true', 'Стрелки. false прячет обе'),
      ],
      slots: 'default — слайды. #prev / #next="{ go, disabled }" — свои кнопки. #prev-icon / #next-icon — только иконка.',
    },
  ],
  container: [
    {
      title: 'TaoContainer',
      rows: [
        r('width', "'wide' | 'slim' | 'ultra-slim'", "'wide'", 'max-width: 1120 / 500 / 400'),
        r('size', "'wide' | 'slim' | 'ultra-slim'", '—', 'Устарел: то же, что width'),
        r('free', 'boolean', 'false', 'Без авто-центровки по горизонтали'),
      ],
      slots: 'default — контент.',
    },
  ],
  flex: [
    {
      title: 'TaoFlex',
      rows: [
        r('justify', 'flex justify-content', "'flex-start'", 'flex-start, center, space-between, space-around, space-evenly, flex-end, normal'),
        r('align', 'flex align-items', "'stretch'", 'stretch, flex-start, center, flex-end, baseline'),
        r('direction', 'flex-direction', "'row'", 'row, column и reverse'),
        r('wrap', 'flex-wrap', "'nowrap'", 'nowrap, wrap, wrap-reverse'),
        r('gap', 'number | string', "'0px'", 'Просвет. Число — px, строка — CSS'),
        r('tag', 'string', "'div'", 'Какой HTML-тег рендерить'),
      ],
    },
    {
      title: 'TaoSpace',
      rows: [
        r('direction', "'row' | 'column'", "'row'", 'Как у TaoFlex'),
        r('vertical', 'boolean', 'false', 'Устарел: direction="column"'),
        r('block', 'boolean', 'false', 'display: flex без wrap'),
        r('expand', 'boolean', 'false', 'Ширина 100%'),
      ],
      slots: 'default — дети с равномерным gap.',
    },
  ],
  grid: [
    {
      title: 'TaoGrid',
      rows: [
        r('min', 'string', "'220px'", 'Минимальная ширина плитки (auto-fill). Каталог. Игнорируется, если cols > 0'),
        r('cols', 'number', '0', 'Фиксированные колонки (bento). 0 — режим min'),
        r('gap', 'number | string', 'token space-4', 'Просвет между ячейками. Число — px, строка — CSS'),
      ],
      slots: 'default — карточки или TaoGridItem. Не masonry: ряд по самой высокой. Уже ~560px cols → 1 колонка, span → 1.',
    },
    {
      title: 'TaoGridItem',
      rows: [
        r('col', 'number', '1', 'Сколько колонок занять. Для cols, не для min'),
        r('row', 'number', '1', 'Сколько рядов занять'),
      ],
      slots: 'default — плитка. В каталоге можно без обёртки.',
    },
  ],
  divider: [
    {
      title: 'TaoDivider',
      rows: [
        r('variant', "'solid' | 'dashed' | 'colored' | 'gap'", "'solid'", 'solid — обычный border, dashed — пунктир, colored — акцент, gap — отступ'),
        r('text', 'string', "''", 'Опциональная подпись посередине. Работает с любым variant'),
        r('fade', 'boolean', 'false', 'Плавные края линии. Не влияет на gap'),
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Только для gap — высота отступа. Не наследуется. big — устаревший алиас large'),
      ],
      slots: 'default — то же, что text. Если есть слот, он важнее пропа.',
    },
  ],
  split: [
    {
      title: 'TaoSplit',
      rows: [
        r('v-model', 'number', '50', 'Размер start-панели в unit'),
        r('direction', "'row' | 'column'", "'row'", 'Как у Flex'),
        r('unit', "'%' | 'px'", "'%'", 'Проценты или пиксели'),
        r('min / max', 'number', '0 / —', 'Границы start-панели'),
        r('minEnd', 'number', '0', 'Минимум второй панели'),
        r('resizable', 'boolean', 'true', 'false — полоса есть, тянуть нельзя'),
        r('step', 'number', '1% или 8px', 'Шаг стрелок, когда полоса в фокусе'),
        r('@change', 'value', '—', 'Закончили тянуть или нажали стрелку. v-model — на каждое движение'),

      ],
      slots: '#start и #end — две панели. Три колонки = два вложенных сплита.',
    },
  ],
  fieldset: [
    {
      title: 'TaoFieldset',
      rows: [
        r('legend', 'string', "''", 'Подпись на верхней рамке'),
        r('align', "'start' | 'center' | 'end'", "'start'", 'Куда сдвинуть legend'),
      ],
      slots: 'default — поля. #legend — если подпись не строка.',
    },
  ],
  'animated-border': [
    {
      title: 'TaoAnimatedBorder',
      rows: [
        r('borderWidth', 'number', '3', 'Толщина контура в px'),
        r('speed', 'number', '6', 'Длительность оборота в секундах'),
        r('light', 'boolean', 'false', 'Мягкое свечение вокруг рамки'),
        r('glow', 'number', '16', 'Радиус glow в px. Имеет смысл при light'),
      ],
      slots: 'default — содержимое внутри рамки.',
    },
  ],
  modal: [
    {
      title: 'TaoModal',
      rows: [
        r('v-model', 'boolean', '—', 'Открыто. Обязательный'),
        r('title', 'string', "''", 'Заголовок в шапке'),
        r('closable', 'boolean', 'true', 'Крестик, Esc, клик по фону'),
        r('closeLabel', 'string', "'Закрыть'", 'aria-label крестика'),
      ],
      slots: 'default — тело. #footer — кнопки. #close-icon — иконка крестика.',
    },
  ],
  drawer: [
    {
      title: 'TaoDrawer',
      rows: [
        r('v-model', 'boolean', '—', 'Открыто. Обязательный'),
        r('title', 'string', "''", 'Заголовок'),
        r('side', "'left' | 'right'", "'right'", 'Откуда выезжает'),
        r('closable', 'boolean', 'true', 'Esc, фон, крестик'),
        r('closeLabel', 'string', "'Закрыть'", 'aria-label крестика'),
      ],
      slots: 'default — тело. #footer — кнопки. #close-icon — иконка крестика.',
    },
  ],
  confirm: [
    {
      title: 'confirm()',
      kind: 'api',
      rows: [
        r('confirm()', '() => Promise<boolean>', '', 'Цепочка в одном тике. true — ок, false — отмена / Esc / фон'),
        r('confirm(message)', '(string) => Promise<boolean>', '', 'Короткий вызов с текстом'),
        r('.title / .message', '(string) => builder', '', 'Заголовок и текст'),
        r('.ok / .cancel', '(label) => builder', '', 'Подписи кнопок'),
        r('.danger()', '() => builder', '', 'Красная кнопка подтверждения'),
        r('confirm.defaults', '({ ok, cancel })', '', 'Подписи по умолчанию на всё приложение'),
      ],
    },
  ],
  tooltip: [
    {
      title: 'TaoTooltip',
      rows: [
        r('content', 'string', '—', 'Текст подсказки. Обязательный'),
        r('position', "'top' | 'bottom' | 'left' | 'right'", "'top'", 'Сторона. У края экрана переворачивается'),
      ],
      slots: 'default — триггер (кнопка, иконка…).',
    },
  ],
  popover: [
    {
      title: 'TaoPopover',
      rows: [
        r('v-model', 'boolean', 'uncontrolled', 'Открытость. Без v-model живёт сам'),
        r('position', "'top' | 'bottom' | 'left' | 'right'", "'bottom'", 'Сторона панели, у края переворачивается'),
        r('disabled', 'boolean', 'false', 'Не открывается'),
      ],
      slots: '#trigger — кнопка. default — содержимое панели. Не тултип и не меню действий.',
    },
  ],
  dropdown: [
    {
      title: 'TaoDropdownMenu',
      rows: [
        r('actions', '{ id, name, ico? }[]', '[]', 'Пункты меню'),
        r('menuLabel', 'string', "'Меню'", 'aria-label кнопки'),
      ],
      slots: '#icon — иконка триггера. Событие select — id пункта (selected — устаревший алиас).',
    },
  ],
  spoiler: [
    {
      title: 'TaoSpoiler',
      rows: [
        r('v-model', 'boolean', 'uncontrolled', 'Открыт / закрыт. Без модели — defaultOpen'),
        r('title', 'string', "''", 'Заголовок кнопки'),
        r('name', 'string | number', '—', 'Ключ панели внутри TaoSpoilerGroup'),
        r('defaultOpen', 'boolean', 'false', 'Стартовое, если нет v-model'),
        r('@change', 'value', '—', 'Пользователь открыл или закрыл'),

      ],
      slots: 'default — тело. Соседи сами друг друга не закрывают.',
    },
    {
      title: 'TaoSpoilerGroup',
      rows: [
        r('v-model', 'string | number | null', 'uncontrolled', 'Ключ открытой панели. null — все закрыты. Без модели группа помнит ключ сама'),
      ],
      slots: 'default — набор TaoSpoiler с name.',
    },
  ],
  tabs: [
    {
      title: 'TaoTabs',
      rows: [
        r('v-model', 'string', '—', 'value активной вкладки. Обязательный'),
        r('items', 'TaoTabItem[]', '—', '{ value, label, disabled? } — как опции Select'),
        r('tabs', '{ key, label, disabled? }[]', '—', 'Устарел: items, key → value'),
        r('@change', 'value', '—', 'Пользователь выбрал другую вкладку'),

        r('justify', 'string', "''", 'CSS justify-content для выравнивания вкладок (center, flex-end, space-between и т.д.)'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Высота вкладки как у TaoButton (26 / 36 / 44). Без него — размер предков'),
      ],
      slots: 'default="{ key }" — содержимое активной панели.',
    },
  ],
  breadcrumb: [
    {
      title: 'TaoBreadcrumb',
      rows: [
        r('items', '{ label, to? }[]', '—', 'Крошки. Последняя — текущая страница, без ссылки. Обязательный'),
        r('ariaLabel', 'string', "'Хлебные крошки'", 'Имя навигации'),
      ],
    },
  ],
  link: [
    {
      title: 'TaoLink',
      rows: [
        r('to', 'string | object', '—', 'Адрес. NuxtLink → RouterLink → <a>'),
        r('newTab', 'boolean', 'false', 'target=_blank + rel=noopener'),
        r('asNewTab', 'boolean', 'false', 'Устарел: newTab'),
        r('private', 'boolean', 'false', 'rel=noopener noreferrer'),
        r('exactPath', 'boolean', 'false', 'Точное совпадение пути для active (vue-router)'),
      ],
      slots: 'default — текст ссылки.',
    },
  ],
  scrolltop: [
    {
      title: 'TaoScrollTop',
      rows: [
        r('boundary', 'number', '300', 'Порог в px: появляется при обратном скролле после него'),
        r('size', 'number', '40', 'Размер кнопки в px'),
        r('right / bottom', 'number | string', '24', 'Отступ от края'),
        r('zIndex', 'number', '1000', 'Слой'),
        r('ariaLabel', 'string', "'Наверх'", 'Доступное имя'),
        r('outline', 'boolean', 'true', 'Обводка фокуса'),
        r('hasOutline / tabindex', '—', '—', 'Устарели: outline / tabindex как обычный атрибут'),
      ],
    },
  ],
  toast: [
    {
      title: 'toast()',
      kind: 'api',
      rows: [
        r('toast()', '() => builder', '', 'Цепочка в одном тике, показ на следующем'),
        r('toast.success(msg)', '(string, options?) => builder', '', 'Короткий вызов. Также error / warning / info / show'),
        r('.success() / .error() / …', '() => builder', '', 'Тип. show() — нейтральный'),
        r('.title / .message', '(string) => builder', '', 'Заголовок и текст'),
        r('.short() / .timeout(ms)', '() => builder', '', '1 с или своё время'),
        r('.byBottomRight() / …', '() => builder', '', 'Угол: top/bottom + left/right/center'),
        r('.action(label, fn)', '(string, fn) => builder', '', 'Кнопка в тосте'),
        r('toast.defaults', '(partial) => toast', '', 'Позиция, timeout, closeLabel на всё приложение'),
      ],
    },
  ],
  alert: [
    {
      title: 'TaoAlert',
      rows: [
        r('tone', "'success' | 'danger' | 'warning' | 'info' | 'neutral'", "'info'", 'Цвет статуса, как у TaoButton. error = danger'),
        r('type', '—', '—', 'Устарел: tone'),
        r('title', 'string', "''", 'Заголовок. Можно без него'),
        r('closable', 'boolean', 'false', 'Крестик. Сам не размонтируется — шлёт close'),
        r('closeLabel', 'string', "'Закрыть'", 'aria-label крестика'),
      ],
      slots: 'default — текст. #close-icon. v-if + @close — чтобы спрятать.',
    },
  ],
  tag: [
    {
      title: 'TaoTag',
      rows: [
        r('tone', "'neutral' | 'success' | 'danger' | 'warning' | 'info' | ''", "''", 'Цвет статуса, как у TaoButton. error = danger'),
        r('type', '—', '—', 'Устарел: tone'),
        r('flat', 'boolean', 'false', 'Без рамки, заливка остаётся'),
        r('size', "'small' | 'medium' | 'large'", 'от предков', 'Высота 18 / 20 / 24. Без него — размер предков'),
        r('closable', 'boolean', 'false', 'Крестик. Шлёт close, сам массив не трогает'),
        r('clickable', 'boolean', 'false', 'Курсор pointer (кликабельный чип), как у TaoListItem / TaoTable'),
        r('pointer', 'boolean', 'false', 'Устарел: clickable'),
        r('color / background / borderColor', 'string', '—', 'Перебить токены вручную'),
      ],
      slots: 'default — текст. #prefix — аватар или иконка слева.',
    },
  ],
  loader: [
    {
      title: 'TaoLoader',
      rows: [
        r('size', 'number | string', '80', 'Размер. Число — px'),
        r('color', 'string', 'accent token', 'Цвет точек'),
        r('inline', 'boolean', 'false', 'В строке, без центрирования блоком'),
      ],
    },
  ],
  image: [
    {
      title: 'TaoImage',
      rows: [
        r('src', 'string', "''", 'Адрес картинки'),
        r('alt', 'string', "''", 'Альтернативный текст'),
        r('lazy', 'boolean', 'false', 'Нативный loading="lazy"'),
        r('pixelated', 'boolean', 'false', 'image-rendering: pixelated'),
        r('placeholderText', 'string', "'No image available'", 'Текст, если src пустой или ошибка'),
      ],
    },
  ],
  avatar: [
    {
      title: 'TaoAvatar',
      rows: [
        r('src', 'string', "''", 'Фото. Пусто — инициалы из name'),
        r('name', 'string', "''", 'Для инициалов и alt'),
        r('size', "'small' | 'medium' | 'large'", "'medium'", '24 / 32 / 48px. Контент, не наследует размер предков. s / m / l устарели'),
        r('dot', 'boolean | tone', 'false', 'Точка статуса. true = success'),
        r('count', 'number | string', '—', 'Бейдж. 0 и пустое не рисуются, >99 → 99+'),
      ],
    },
  ],
  icon: [
    {
      title: 'TaoIcon',
      rows: [
        r('name', 'string', '—', 'Класс icon-{name}. Шрифт подключаете сами. Обязательный'),
        r('size', 'number', '—', 'font-size в px'),
        r('margin', 'string', "'0px'", 'Внешний отступ'),
        r('invert', 'boolean', 'false', 'Инвертировать цвет'),
      ],
      slots: '#prefix / #postfix — рядом с глифом.',
    },
  ],
}
