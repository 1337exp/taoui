const r = (name, type, def, note) => ({ name, type, default: def, note })

export const propTables = {
  block: [
    {
      title: 'TaoBlock',
      rows: [
        r('padding', 'number | number[]', '16', 'Внутренний отступ в px. Массив — как CSS padding (1–4 значения)'),
        r('radius', 'number', '8', 'Скругление углов в px'),
        r('shadow', 'boolean', 'true', 'Тень панели'),
        r('hover', 'boolean', 'false', 'Усилить тень при наведении, курсор pointer'),
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
        r('tone', "'danger' | 'success' | 'warning' | 'info' | ''", "''", 'Красит ghost и text. Не вместо variant'),
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Размер'),
        r('disabled', 'boolean', 'false', 'Неактивна'),
        r('loading', 'boolean', 'false', 'Спиннер, клик глушится'),
        r('block', 'boolean', 'false', 'Ширина 100%'),
        r('icon', 'string', "''", 'Символ слева от текста'),
      ],
      slots: 'default — подпись кнопки.',
    },
  ],
  card: [
    {
      title: 'TaoCard',
      rows: [
        r('padding', 'number | number[]', '20', 'Отступ тела карточки в px. У flush — 0'),
        r('radius', 'number', '8', 'Скругление в px'),
        r('shadow', 'boolean', 'true', 'Обычная тень. У flush выключена'),
        r('shadowBottomOnly', 'boolean', 'false', 'Линия снизу карточки, не scrim на фото'),
        r('flush', 'boolean', 'false', 'Плитка: без padding и тени, cover/body на всю ячейку'),
        r('hover', 'boolean', 'false', 'Обводка акцентом при наведении'),
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
        r('successMessage', 'string', "'Скопировано!'", 'Текст тултипа после клика'),
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
        r('label', 'string', "''", 'Подпись над полем (если нет TaoFormField)'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
        r('error', 'boolean', 'false', 'Красная рамка. Сообщение — errorMessage или TaoFormField'),
        r('errorMessage', 'string', "''", 'Текст ошибки под полем'),
        r('id', 'string', 'auto', 'id инпута; иначе из FormField или useId'),
      ],
      slots: '#prefix и #suffix — внутри рамки слева/справа (иконка, текст).',
    },
    {
      title: 'TaoInputGroup',
      rows: [
        r('—', 'нет пропсов', '—', 'Только слоты. Склеивает аддон + поле + аддон в одну рамку'),
      ],
      slots: 'default — само поле (TaoInput и т.п.). #before / #after — протокол, единица, кнопка.',
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
        r('controls', 'boolean', 'true', 'Кнопки ± справа'),
        r('disabled', 'boolean', 'false', 'Неактивно'),
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
        r('disabled', 'boolean', 'false', 'Неактивно'),
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
        r('label', 'string', "''", 'Подпись справа'),
        r('indeterminate', 'boolean', 'false', 'Черта вместо галочки. Клик ставит checked, смешанное считает родитель'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
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
        r('clearText', 'string', "'Очистить'", 'Пункт сброса в списке'),
      ],
    },
    {
      title: 'TaoSwitch',
      rows: [
        r('v-model', 'boolean', 'false', 'Вкл / выкл. role="switch"'),
        r('label', 'string', "''", 'Подпись справа'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
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
        r('label / name', 'string', "''", 'Radio: подпись и name, если нет группы'),
      ],
    },
    {
      title: 'TaoFormField',
      rows: [
        r('label', 'string', '—', 'Общая подпись над контролом'),
        r('hint', 'string', '—', 'Подсказка под полем'),
        r('error', 'string', '—', 'Текст ошибки; если есть — поле invalid'),
      ],
      slots: 'default — сам контрол (Input, Select, Switch…).',
    },
  ],
  segmented: [
    {
      title: 'TaoSegmented',
      rows: [
        r('v-model', 'string | number | boolean', '—', 'value выбранной опции'),
        r('size', "'small' | 'medium'", "'medium'", 'Высота сегментов'),
        r('block', 'boolean', 'false', 'Растянуть на ширину родителя'),
        r('legend', 'string', '—', 'Доступное имя группы'),
        r('disabled', 'boolean', 'false', 'Вся группа'),
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
        r('clearText', 'string', "'Очистить'", 'Сброс в списке'),
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
        r('disabled / error', 'boolean', 'false', 'Неактивен / красная рамка'),
      ],
      slots: 'Первый клик — start, второй — end (меняются местами, если end раньше).',
    },
  ],
  pincode: [
    {
      title: 'TaoPinCode',
      rows: [
        r('length', 'number', '—', 'Число ячеек. Обязательный'),
        r('v-model', 'string', "''", 'Склеенная строка из ячеек'),
        r('numbersOnly', 'boolean', 'false', 'Только цифры'),
        r('hidden', 'boolean', 'false', 'Маскировать ввод'),
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
        r('v-model', 'number | string', '—', 'Текущее значение. Обязательный'),
        r('min / max / step', 'number', '0 / 100 / 1', 'Диапазон и шаг'),
        r('size', "'small' | 'medium'", "'medium'", 'medium — форм-контрол, small — тонкий трек (seek / громкость)'),
        r('showValue', 'boolean', 'false', 'Число рядом. ПКМ — точный ввод'),
        r('disabled', 'boolean', 'false', 'Неактивен'),
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
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Высота зоны'),
        r('list', 'boolean', 'true', 'Имена под зоной. Снять файл — сразу в v-model'),
        r('showClear', 'boolean', 'false', 'Кнопка «очистить всё». Сама не чистит — шлёт clear-request'),
      ],
      slots: 'default — текст зоны. clear-request: родитель решает, обнулить сразу или после confirm().',
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
        r('hover / compact', 'boolean', 'true / false', 'Подсветка ряда при наведении, плотнее'),
        r('head', 'boolean', 'true', 'Подсветка шапки'),
        r('lines', 'boolean', 'true', 'Линии между рядами'),
        r('sticky', 'boolean', 'false', 'Липкая шапка (нужен maxHeight)'),
        r('rowKey', 'string | fn', "'id'", 'Ключ ряда'),
      ],
      slots: 'Ячейка: #cell-{key}="{ row, value }". Событие row-click, если clickable.',
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
        r('size', "'small' | 'medium'", "'medium'", 'Размер кнопок'),
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
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Высота строк. Item без своего size берёт отсюда'),
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
        r('size', "'small' | 'medium' | 'large'", 'из списка', 'Перебить size родителя'),
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
        r('vertical', 'boolean', 'true', 'Столбик. false — в ряд'),
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
        r('size', "'wide' | 'slim' | 'ultra-slim'", "'wide'", 'max-width: 1120 / 720 / 400'),
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
        r('gap', 'string', "'0px'", 'CSS gap'),
        r('tag', 'string', "'div'", 'Какой HTML-тег рендерить'),
      ],
    },
    {
      title: 'TaoSpace',
      rows: [
        r('vertical', 'boolean', 'false', 'Столбик вместо ряда'),
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
        r('gap', 'string', 'token space-4', 'Просвет между ячейками'),
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
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Только для gap — высота отступа'),
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
      slots: '#icon — иконка триггера. Событие selected — id пункта.',
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
        r('v-model', 'string', '—', 'key активной вкладки. Обязательный'),
        r('tabs', '{ key, label, disabled? }[]', '—', 'Список вкладок. Обязательный'),
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
        r('asNewTab', 'boolean', 'false', 'target=_blank + rel=noopener'),
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
        r('type', "'success' | 'error' | 'warning' | 'info' | 'neutral'", "'info'", 'Тон. danger = error'),
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
        r('type', "'neutral' | 'success' | 'danger' | 'warning' | 'info' | ''", "''", 'Тон. error = danger'),
        r('flat', 'boolean', 'false', 'Без рамки, заливка остаётся'),
        r('closable', 'boolean', 'false', 'Крестик. Шлёт close, сам массив не трогает'),
        r('pointer', 'boolean', 'false', 'Курсор pointer (кликабельный чип)'),
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
        r('size', "'small' | 'medium' | 'large'", "'medium'", 'Также s / m / l'),
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
