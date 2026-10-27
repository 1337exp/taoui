<h1 align="center">Tao UI</h1>

<p align="center">
  <b>Библиотека Vue 3 компонентов на дизайн-токенах.</b><br>
  Поменял несколько CSS-переменных — поменялась тема всего набора.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@1337exp/taoui"><img src="https://img.shields.io/npm/v/@1337exp/taoui?color=cb3837&logo=npm" alt="npm"></a>
  <a href="https://github.com/1337exp/taoui/actions/workflows/ci.yml"><img src="https://github.com/1337exp/taoui/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/1337exp/taoui/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@1337exp/taoui" alt="license"></a>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/types-included-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <a href="https://github.com/1337exp/taoui/blob/master/README.md">English</a> · <b>Русский</b> ·
  <a href="#установка">Установка</a> ·
  <a href="#демонстрация">Демонстрация</a> ·
  <a href="CHANGELOG.md">Список изменений</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/screenshots/overview-dark.webp" alt="Компоненты Tao UI в тёмной теме" width="860">
</p>

## Почему Tao UI

- **Сначала токены.** Цвета, радиусы, отступы и шрифты — CSS-переменные в три слоя (примитивы, семантика, тема). Перекрасить набор или одну панель можно, не трогая компоненты.
- **Одна шкала, один API.** `small` / `medium` / `large` везде, одинаковые правила `v-model` / `change` / `*Text` / `*Label` для всех полей, тона вместо случайных цветов.
- **Тёмная и светлая темы** из коробки и поверхности (`flat` / `grain` / `glass`) для HUD и лендингов.
- **Встроенные языки.** Плейсхолдеры, даты и aria-подписи на русском и английском, переключаются на лету без перезагрузки.
- **Nuxt и чистый Vue.** `TaoLink` сам выбирает `NuxtLink`, `RouterLink` или `<a>`. Полные типы, ES и CJS сборки.
- **Клавиатура.** Ловушки фокуса, `role` / `aria-*` на контролах.

<table>
  <tr>
    <td width="50%"><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/color-picker.webp" alt="TaoColorPicker: квадрат, полоса тона, режимы HEX / RGB / HSL"><br><sub><b>TaoColorPicker</b> — HEX / RGB / HSL, пипетка, <code>v-model</code> — строка hex</sub></td>
    <td width="50%"><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/themes.webp" alt="Переключение тёмной и светлой тем"><br><sub><b>Темы</b> — один атрибут, все компоненты следуют</sub></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/clips/slider.webp" alt="TaoRangeSlider с метками"><br><sub><b>TaoSlider / TaoRangeSlider</b> — метки, дискретные шкалы, вертикаль</sub></td>
    <td><img src="https://raw.githubusercontent.com/1337exp/taoui/master/docs/media/screenshots/surfaces-dark.webp" alt="Поверхности flat, grain и glass"><br><sub><b>Поверхности</b> — flat, grain, glass</sub></td>
  </tr>
</table>

## Компоненты

### Базовые

- **TaoBlock** — базовый контейнер с настраиваемыми отступами и скруглением
- **TaoButton** — кнопка. `variant`: `primary` / `secondary` / `ghost` / `text`; `tone` красит любой из них (по умолчанию акцент, neutral, success, danger, warning, info)
- **TaoCard** — карточка со слотами cover / header / footer. В `#cover` — фото или `TaoCarousel`. `flush` — плитка без padding/тени на всю ячейку; `#overlay` — scrim на обложке
- **TaoCopy** — иконка копирования в буфер. После клика сверху тултип «Скопировано»; если кнопку убрали — тултип тоже
- **TaoInput** — поле ввода с поддержкой v-model, валидации и слотов `#prefix` / `#suffix` (иконка или текст внутри рамки)
- **TaoInputGroup** — склейка снаружи: `#before` | поле | `#after` (протокол, единица, кнопка)
- **TaoModal** — модальное окно с анимацией и слотами
- **TaoDrawer** — боковая панель (фильтры, настройки). Esc, клик по фону, ловушка фокуса — как у модалки
- **TaoSpoiler** — раскрывающийся блок. `v-model` и `aria-expanded`. Несколько подряд сами друг друга не закрывают
- **TaoSpoilerGroup** — аккордеон: `v-model` — ключ открытой панели (`null` — все закрыты), у спойлера `name`. Без `v-model` группа помнит ключ сама
- **TaoTabs** — вкладки для переключения между секциями контента
- **TaoTooltip** — всплывающая подсказка при наведении. `placement`: `top` / `bottom` / `left` / `right`, у каждого `-start` / `-end`; у края экрана переворачивается
- **TaoPopover** — панель по клику: слот с любым контентом, Esc и клик снаружи; `placement` как у Tooltip. Не тултип и не меню действий

### Layout

- **TaoContainer** — контейнер с ограничением ширины (wide/slim/ultra-slim) и авто-центровкой
- **TaoFlex** — обёртка над flexbox с пропами justify/align/direction/wrap/gap
- **TaoSpace** — авто-расстановка дочерних элементов с равномерным gap
- **TaoGrid** / **TaoGridItem** — плитки: `min` — каталог (auto-fill), `cols` — bento. У item `col` / `row`; уже ~560px span сбрасывается. Не masonry
- **TaoDivider** — `solid` (обычный border) / `dashed` / `colored` (акцент) / `gap`. Подпись — опциональный `text` на любом варианте; `fade` — плавные края линии; `size` только у `gap` (small / medium / large)
- **TaoSplit** — две панели и полоса. `row` / `column` как у Flex. `v-model` — размер start в `%` или `px`; `resizable="false"` фиксирует полосу. Не Divider.
- **TaoFieldset** — рамка-группа: `legend` сидит на верхней границе, `align` — start / center / end
- **TaoAnimatedBorder** — контейнер с анимированной рамкой: радуга, цвета `tone` (следует теме) или свои `colors`; при `prefers-reduced-motion` градиент стоит на месте

### Формы и ввод

- **TaoCheckbox** — чекбокс с v-model, слотами pre/post и `indeterminate` (частично выбран)
- **TaoSwitch** — переключатель для булевых настроек (`role="switch"`)
- **TaoRadio** / **TaoRadioGroup** — классические радиокнопки: длинные подписи, можно столбиком
- **TaoSegmented** / **TaoSegmentedOption** — компактный выбор из 2–5 коротких вариантов. Не вкладки
- **TaoSelect** — выпадающий список с клавиатурой, тот же визуал, что у Input. `size` (`small` / `medium` / `large`, та же шкала, что у Button). Сброс — «Очистить» в списке или Delete; `clearable="false"` отключает сброс, слот `#clear` заменяет содержимое строки
- **TaoCombobox** — Select с полем: фильтр по вводу, `allow-create` пишет своё в `v-model`, `create` — чтобы родитель дополнил список. Те же `size`, `clearable` и `#clear`, что у `TaoSelect`
- **TaoDate** — один день: `YYYY-MM-DD`, без часов и пояса. Календарь как у Select
- **TaoDateRange** — период: `v-model` — `{ start, end }` или `null`. Первый клик — начало, второй — конец (если конец раньше — меняются местами). Неполный выбор в модель не пишется
- **TaoCalendar** — сам календарь на месяц, встроенный (без всплывающего окна): `mode="single"` (`YYYY-MM-DD`) или `"range"` (`{ start, end }`), `min` / `max`, стрелки / PageUp / PageDown / Home / End. `TaoDate` и `TaoDateRange` — поле с этим календарём во всплывающем окне
- **TaoFormField** — общие label / hint / error для полей формы
- **TaoInputNumber** — число с min/max/step и кнопками ± справа. Пустое значение — `null`. `@commit` срабатывает один раз, когда правка закончена (blur, Enter, ±, стрелка), в отличие от `v-model`, который обновляется на каждую клавишу
- **TaoQuantity** — количество в корзине: `− | поле | +`, целые штуки, сток, минус на минимуме может убрать строку
- **TaoTextarea** — многострочное поле с авто-высотой. `maxlength` ограничивает ввод, `count` показывает «введено / максимум». `variant`: `bar` (по умолчанию) / `outline` (рамка как у Input) / `filled` / `plain`; `readonly`; `align`; `blurOnEnter`
- **TaoPinCode** — пин-код из N полей. По умолчанию клик стирает ячейку и все справа (`clear-on="focus"`); `clear-on="input"` заменяет цифру только при вводе. `format="#-##-##"` рисует визуальные разделители (в значение не входят; вставка в таком виде или чистым кодом раскладывается по ячейкам). Последняя ячейка снимает фокус и эмитит `complete`
- **TaoSlider** / **TaoRangeSlider** — один бегунок (`v-model` — число) или два (`[от, до]`, `minGap`). Мышь, тач, стрелки. `marks` (деления, числа, `{ value, label }`), `discrete` для ступенчатых шкал, `vertical`, `flat`, `format`; `variant="thin"` — тонкий трек для seek / громкости
- **TaoColorPicker** — квадрат насыщенности и яркости, полосы тона и прозрачности, образцы, пипетка (где есть `EyeDropper`), режимы ввода HEX / RGB / HSL. `v-model` — строка hex; `colorModel()` подключает ваше собственное хранилище цвета
- **TaoColorInput** — поле с образцом и hex-текстом; палитра открывается в поповере
- **TaoFileDrop** — зона загрузки (drag & drop + клик). Список имён под зоной, `v-model` — `File[]`. Очистку всей пачки решает родитель (`clear-request`)

### Отображение данных

- **TaoTable** — простая таблица: колонки, empty, loading, сортировка через `v-model:sort`. `head` — подсветка шапки, `lines` — линии между рядами (оба по умолчанию включены). `striped` — зебра с первой строки, `striped="even"` — со второй. Не datagrid.
- **TaoPagination** — страницы с многоточием. Клик по «…» прыгает на `jump` страниц (5 по умолчанию)
- **TaoEmpty** — пустой список, нет результатов, нет прав
- **TaoList** / **TaoListItem** — строка списка: иконка, заголовок, подпись, действие по ховеру. Не Select и не таблица
- **TaoStages** — список стадий: `wait` / `work` / `ok` / `bad`. Не линейный степпер
- **TaoSkeleton** — плейсхолдер загрузки (text / title / circle / rect)
- **TaoCounter** — витрина числа с переворотом цифр (не инпут)
- **TaoCarousel** — лента: целый слайд с `autoplay`, карточка с `peek`, полоса с `per-view`. Стрелки через `controls` или `#prev` / `#next`, точки — `dots`
- **TaoAvatar** — фото или инициалы, размеры `small` / `medium` / `large`. Точка `dot` и счётчик `count`
- **TaoTag** — тег/бейдж со статусами. `#prefix` (аватар), `closable` убирает чип, `flat` — без рамки
- **TaoAlert** — инлайн-баннер страницы или ошибки формы (success / error / warning / info)
- **TaoProgress** — статичная полоса (`progress` в %). Проценты сверху по центру или `showPercentage="right"` справа; слоты `#left` / `#right` — подписи, тогда процент справа в скобках. `false` прячет. Ширина — `minWidth` / `maxWidth`, не диапазон значения
- **TaoScrubber** — play / pause, слайдер по времени с метками событий, подпись «время / длина». Время сама не двигает: ведите `v-model` своими часами
- **TaoLoader** — анимированный лоадер (четыре точки)
- **TaoImage** — обёртка над `<img>`: fade-in и плейсхолдер. `lazy` включает нативный `loading="lazy"`
- **TaoIcon** — SVG-иконки (27 встроенных, свои через `registerTaoIcons`) или icon-шрифт (см. раздел «Иконки» ниже)

### Навигация и взаимодействие

- **TaoLink** — `<NuxtLink>` в Nuxt, `<RouterLink>` при vue-router, иначе обычный `<a>` — без дополнительной настройки
- **TaoBreadcrumb** — крошки: последний пункт — текущая страница
- **TaoDropdownMenu** / **TaoMenu** — меню из простого дерева данных `items`: подменю, чекбоксы, радио, разделители, подписи групп, сочетания для показа, недоступные пункты. Стрелки, Home / End, быстрый поиск по букве, `→` / `←` для подменю, Esc закрывает верхний уровень первым. `TaoMenu` — сама панель для своих оболочек (полоса меню, контекстное меню); у края экрана переворачивается
- **TaoScrollTop** — плавающая кнопка «наверх»: виды `solid` / `ghost` / `text`, `side`, подпись `label` при наведении мыши. Появляется при обратном скролле после `boundary`

### Обратная связь

- **toast()** — fluent-уведомления: `toast().success().message('Сохранено')`
- **confirm()** — вопрос с оверлеем: тот же fluent + `await`. Не тост — ждёт ответ, не исчезает сам.
- **TaoToastViewport** / **TaoConfirmHost** — контейнеры; если их нет в разметке, первый вызов сам монтирует их в `body`

## Соглашения

Тоны визуала: `success` | `danger` | `warning` | `info` | `neutral` (тип `TaoTone`), всегда через проп `tone`: Button, Alert, Tag (`toast.danger()` для тостов). Акцент — тоже тон и тон по умолчанию. Тон — контекстный класс, как размер: `.tao-tone-danger` на любом элементе выставляет `--tao-tone`, `--tao-tone-on`, `--tao-tone-text`, … (см. `styles/tone.css`). В отличие от размера, он **не** наследуется: кнопка внутри красного alert остаётся акцентной.
Stages — это процесс, не тон: `wait` / `work` / `ok` / `bad` (`danger` принимается как `bad`).

Размеры контролов: `small` | `medium` | `large` (тип `TaoSize`). Одна шкала для Button, Input, InputNumber, Quantity, Textarea, Select, Combobox, Date, DateRange, Segmented, InputGroup и FormField — контролы одного размера встают в ряд ровно. Checkbox, Radio / RadioGroup и Switch масштабируют индикатор (14 / 18 / 22px) и подпись; Tag — высоту (18 / 20 / 24px); Tabs, кнопки Pagination и строки List берут высоту Button; Table масштабирует отступы ячеек (`size="small"` для плотной); FileDrop — зону и строки файлов; Slider — трек и бегунок.
Без `size` контрол берёт размер предков, в корне — `medium`. На целый блок размер задаётся классом `tao-size-small` / `-medium` / `-large` на любом элементе или `size` у `TaoFormField` / `TaoInputGroup`. Явный `size` у контрола главнее.

```vue
<div class="tao-size-small">
  <TaoInput v-model="q" />
  <TaoButton>Найти</TaoButton>
</div>
```

Контент и раскладка держат свою шкалу и не наследуют: Avatar (24 / 32 / 48px), Divider `gap`, Loader / Icon / ScrollTop (пиксели).
Container живёт на другой оси — ширина: `width="wide" | "slim" | "ultra-slim"`.

Поверхности — из чего «сделана» панель: `flat` — заливка (по умолчанию), `grain` — статичное плёночное зерно, `glass` —
полупрозрачное стекло с размытием того, что позади. Проп `surface` у TaoCard / TaoBlock или класс `tao-surface-grain` /
`-glass` на любом элементе — HUD в игре, секция лендинга, сайдбар. Вид настраивается один раз токенами темы
(`--tao-surface-grain-image` / `-size`, `--tao-glass-fill` / `-border` / `-blur`). Поверхность принадлежит одному элементу:
вложенные панели её не наследуют. Стеклу нужно что-то позади — используйте его для того, что лежит поверх контента; над
ровным фоном это просто серая заливка, над анимацией размытие пересчитывается каждый кадр. Toast и confirm стеклянные по
умолчанию, с оттенком своего тона; `toast.defaults({ surface: 'flat' })` и `confirm.defaults({ surface: 'flat' })`
выключают стекло, `.surface('flat')` — для одного. Без поддержки размытия или при `prefers-reduced-transparency` стекло
становится сплошной панелью.

Шкала кегля (примитивы): `xs` 12 … `xl` 18 для контролов; `2xl` 24, `3xl` 32, `4xl` 36 для заголовков и прозы.
Отдельного компонента заголовка нет — `h1 { font-size: var(--tao-font-size-3xl) }`.

Правила API — им следуют все компоненты:

- **Поля** принимают `v-model`, `disabled`, `error` (красная рамка) и `size`. Подпись, подсказка и текст ошибки — через `TaoFormField`.
- **События**: `update:X` для v-model плюс `change`, когда пользователь закончил изменение (Slider, Split — по отпусканию). Остальные события — глаголы в настоящем времени: `select`, `close`, `create`.
- **Тексты**: видимые — `*Text` (`clearText`, `successText`), для скринридера — `*Label` (`closeLabel`).
- **Списки**: массивы данных — `items`; выбираемые элементы несут `value` + `label` (`TaoSelectOption`, `TaoTabItem`). Идентификаторы обычных данных (колонки таблицы, стадии) остаются `key`.
- **Булевы** — прилагательные без `is` / `has` / `as`: `closable`, `clickable`, `masked`, `newTab`. Ось раскладки — `direction: 'row' | 'column'`, не `vertical`.
- **Длины** (`padding`, `radius`, `gap`, `maxHeight`): число — пиксели, строка уходит в CSS как есть (тип `TaoLength`).

## Иконки

Библиотека поставляет **27 SVG-иконок** (галочка, крестик, плюс, минус, шевроны, стрелки, поиск, глаз, «ещё», ручка,
play, pause, skip-back, копия, календарь, info, alert, кружки). Они рисуются через `currentColor`: иконка берёт цвет и
размер текста. Имена с зарезервированной приставкой `tao-`: `<TaoIcon name="tao-check" />`, список — `taoIconNames`.

```vue
<TaoIcon name="tao-check" />            <!-- встроенная -->
<TaoIcon name="rocket" />               <!-- из registerTaoIcons или `icon-rocket` вашего шрифта -->
<TaoButton icon="tao-plus">Добавить</TaoButton>
<TaoButton icon="tao-close" aria-label="Закрыть" />   <!-- только иконка: квадрат, aria-label обязателен -->
```

```ts
registerTaoIcons({ rocket: { body: '<path d="M12 3l4 8-4 10-4-10z"/>' } }); // сетка 24x24, если не задан viewBox
```

Имя без приставки `tao-` ищется среди зарегистрированных вами иконок, а затем рендерится классом `icon-<name>` для
внешнего icon-шрифта (IcoMoon / Fontello и т. п.), который приложение подключает само. Все встроенные части (крестики,
степперы, стрелки пагинации, тосты…) используют встроенные иконки, а слоты `#…-icon` позволяют заменить их чем угодно.

## Установка

```bash
npm install @1337exp/taoui
```

Или локально из папки:

```bash
npm install ../path-to-tao-ui
```

## Использование

### Подключение в Nuxt 3

Создайте плагин `plugins/tao-ui.ts`:

```typescript
import { defineNuxtPlugin } from '#app'
import TaoUI from '@1337exp/taoui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(TaoUI)
})
```

Импортируйте стили в `app.vue` или layout:

```vue
<script setup>
import '@1337exp/taoui/styles.css'
</script>
```

### Подключение в Vue 3 проекте

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import TaoUI from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'

const app = createApp(App)
app.use(TaoUI)
app.mount('#app')
```

### Язык

Встроенные тексты (плейсхолдеры, «Очистить», aria-подписи, даты) по умолчанию английские. Русский идёт в комплекте:

```javascript
import TaoUI, { localeRu } from '@1337exp/taoui'

app.use(TaoUI, { locale: localeRu })
```

Поменять отдельные тексты — остальное останется от локали по умолчанию:

```javascript
app.use(TaoUI, { locale: { select: { placeholder: 'Выберите город' } } })
```

Другой язык: скопируйте `localeEn` (или `localeRu`), переведите и передайте так же (тип `TaoLocale`). Ключи повторяют имена пропсов —
`locale.select.placeholder` — значение по умолчанию для `placeholder` у TaoSelect, а переданный руками проп всегда главнее.

Язык можно переключать в любой момент — из настроек, переключателя языка, по маршруту. Уже показанные компоненты
обновятся сразу, без перезагрузки и без потери введённого:

```javascript
import { setTaoLocale, localeEn, localeRu } from '@1337exp/taoui'

function onLanguageChange(lang) {
  setTaoLocale(lang === 'ru' ? localeRu : localeEn)
}
```

Без плагина (отдельные компоненты) достаточно одного вызова `setTaoLocale()`.

### Переход на 5.0

5.0 удаляет все имена, которые устарели в 2.0 (и алиас тона `error`), таблица «старое → новое» в [MIGRATION-5.md](MIGRATION-5.md).

### Переход с 3.x

В 4.0 поменялся один умолчательный параметр: встроенные тексты теперь английские (раньше были русские). Чтобы остаться
на русском, передайте локаль один раз: `app.use(TaoUI, { locale: localeRu })`, а без плагина — `setTaoLocale(localeRu)`.
Хелперы дат и компоненты дат следуют локали и по умолчанию тоже `en-US`.

### Переход с 1.x

Смотрите запись 2.0.0 в [CHANGELOG.md](CHANGELOG.md): что сломалось. Старые имена удалены в 5.0.

### Использование отдельных компонентов

```vue
<script setup>
import { TaoButton, TaoFormField, TaoInput, TaoModal } from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'
</script>

<template>
  <TaoButton variant="primary">Нажми меня</TaoButton>
  <TaoFormField label="Введите текст">
    <TaoInput v-model="text" />
  </TaoFormField>
  <TaoModal v-model="isOpen" title="Заголовок">
    Содержимое модального окна
  </TaoModal>
</template>
```

## Split

`TaoSplit` — две панели и полоса между ними. Это не `TaoDivider` (там только линия) и не раскладка на N панелей: три колонки — два вложенных сплита.

`direction` как у Flex: `row` (start | end) или `column` (start над end). Слоты `#start` / `#end`.

`v-model` — размер панели start. `unit` — `%` (по умолчанию, доля живёт при ресайзе контейнера) или `px` (сайдбар; вторая панель забирает остаток). Для `px` размер нужно задать явно: дефолт `50` — это 50px. `min` / `max` ограничивают start, `min-end` — минимум второй панели, все в той же единице. `resizable="false"` оставляет полосу, но без перетаскивания.

Сплит заполняет родителя (`width` / `height: 100%`). Родитель должен ограничить размер по оси сплита: у `column` без высоты не из чего считать `%`. Панели с `min-width` / `min-height: 0` и `overflow: hidden`, чтобы контент не мешал сжатию. Скролл — на внутренней обёртке (`overflow: auto; height: 100%; min-height: 0`). Вложенный `TaoSplit` прямым ребёнком панели растягивается сам.

```vue
<TaoSplit v-model="side" unit="px" :min="160" :max="480" :min-end="240">
  <template #start>Навигация</template>
  <template #end>Основное</template>
</TaoSplit>
```

## Toast

Вызов — цепочка в одном тике, `setTimeout(0)` отправляет уведомление.

```javascript
import { toast } from '@1337exp/taoui'

toast().success().message('Сохранено')
toast().danger().title('Сеть').timeout(5000).message('Нет соединения')
toast.success('Сохранено')
toast.warning('Черновик', { timeout: 1000 })
```

Позиция по умолчанию — `topCenter`. Глобально:

```javascript
toast.defaults({ position: 'bottomRight' })
toast.byBottomRight()
```

`question` с оверлеем в kit нет — это confirm, не toast. Кнопки в тосте, если нужны:

```javascript
toast().info().message('Удалить файл?').action('Удалить', onRemove)
```

Viewport можно не вставлять: первый вызов сам создаст его. Если нужен явный контроль (тесты, свой layout):

```vue
<TaoToastViewport />
```

## Confirm

Вопрос с оверлеем: всплывает по центру и спрашивает. Это не toast — нет прогресс-бара и автозакрытия, есть `await`, Esc и клик по оверлею = отмена.

```javascript
import { confirm } from '@1337exp/taoui'

if (await confirm().title('Удалить файл?').message('Это нельзя отменить').danger()) {
  remove()
}

const ok = await confirm('Выйти без сохранения?', {
  ok: 'Выйти',
  cancel: 'Остаться',
})
```

Очередь: второй `confirm()`, пока открыт первый, подождёт. Подписи по умолчанию — «ОК» / «Отмена»:

```javascript
confirm.defaults({ ok: 'Yes', cancel: 'No' })
```

## Формы

`TaoFormField` вешает общий label / hint / error и прокидывает `id` во вложенный контрол.

```vue
<TaoFormField label="Город" hint="Необязательно">
  <TaoSelect v-model="city" :options="cities" />
</TaoFormField>

<TaoSwitch v-model="dark" label="Тёмная тема" />

<TaoRadioGroup v-model="plan" legend="Тариф">
  <TaoRadio value="free" label="Free" />
  <TaoRadio value="pro" label="Pro" />
</TaoRadioGroup>

<TaoSegmented v-model="period" legend="Период">
  <TaoSegmentedOption value="week">Неделя</TaoSegmentedOption>
  <TaoSegmentedOption value="month">Месяц</TaoSegmentedOption>
  <TaoSegmentedOption value="year">Год</TaoSegmentedOption>
</TaoSegmented>

<TaoAlert tone="warning" title="Черновик">Сохраните, прежде чем уйти.</TaoAlert>
```

`TaoSegmented` — короткий взаимоисключающий выбор, все варианты видны сразу. Не для навигации по страницам: это `TaoTabs`. Длинные подписи или больше 5–6 пунктов — `TaoRadioGroup` или `TaoSelect`.

`TaoSelect` открывается с клавиатуры (стрелки, Enter, Esc), список переворачивается у края экрана. Delete или «Очистить» внизу списка сбрасывает значение в `null`.

Если `null` не допустим (шаг сетки, порядок сортировки), передайте `:clearable="false"`: строка сброса и Delete / Backspace пропадут. Подпись строки сброса — `clear-text`, для иконки или своей разметки есть слот `#clear`. `size` — `small` / `medium` / `large` (без него — от предков), масштабирует и раскрытый список.

```vue
<TaoSelect v-model="step" :options="steps" size="small" :clearable="false" />

<TaoSelect v-model="city" :options="cities">
  <template #clear><TaoIcon name="close" /> Сбросить</template>
</TaoSelect>
```

`TaoCombobox` — то же меню, но с полем. Печатаете — варианты режутся. `allow-create` пишет введённое в `v-model`, если точного совпадения нет. Список сам не меняется: слушайте `create` и добавьте option снаружи.

Подпись, подсказка и текст ошибки всегда идут через `TaoFormField`. `TaoFormField` также оборачивает `TaoTextarea`, `TaoCheckbox`, `TaoSwitch`, `TaoRadioGroup` и `TaoSegmented` — id, hint и error прокидываются сами.

`TaoTag` может быть чипом: `#prefix` слева (обычно `TaoAvatar`), `closable` рисует крестик и эмитит `close`. Клик по крестику наружу не всплывает. `flat` снимает рамку, заливка остаётся.

```vue
<TaoTag tone="neutral" closable @close="remove">
  <template #prefix>
    <TaoAvatar name="Анна Козлова" size="small" />
  </template>
  Анна Козлова
</TaoTag>
```

## Таблица и пагинация

Таблица рендерит то, что передали: сама данные не режет и не сортирует. Это удобно и для серверной выборки, и для клиентской — страница режется снаружи.

```vue
<TaoTable
  :columns="columns"
  :rows="pageRows"
  v-model:sort="sort"
  empty-text="Пока нет записей"
>
  <template #cell-status="{ row }">
    <TaoTag :tone="row.status === 'active' ? 'success' : 'neutral'">
      {{ row.status }}
    </TaoTag>
  </template>
</TaoTable>

<TaoPagination v-model:page="page" :total="rows.length" :page-size="8" />
```

```javascript
const columns = [
  { key: 'name', label: 'Имя', sortable: true },
  { key: 'city', label: 'Город' },
  { key: 'status', label: 'Статус' },
]
```

Слот `cell-<ключ>` перекрывает ячейку. `loading` показывает оверлей, пустой список — текст или слот `#empty`. Клик по шапке с `sortable` крутит `asc → desc → сброс`.

## Пустые состояния и загрузка

```vue
<TaoEmpty title="Ничего не нашлось">
  Измените фильтр или сбросьте поиск.
  <template #action>
    <TaoButton variant="secondary">Сбросить</TaoButton>
  </template>
</TaoEmpty>

<TaoSkeleton variant="title" />
<TaoSkeleton :lines="3" />
<TaoSkeleton variant="circle" />

<TaoStages :items="[
  { key: 'pay', label: 'Оплата', status: 'ok' },
  { key: 'pack', label: 'Сборка', status: 'work' },
  { key: 'ship', label: 'Доставка', status: 'wait' },
]" />

<TaoList>
  <TaoListItem
    title="Анна Козлова"
    description="Дизайн · Москва"
    clickable
    :selected="picked === 'anna'"
    @click="picked = 'anna'"
  >
    <template #prefix>
      <TaoAvatar name="Анна Козлова" size="small" />
    </template>
  </TaoListItem>
</TaoList>
```

```vue
<TaoInput v-model="q" placeholder="Найти…">
  <template #prefix>⌕</template>
</TaoInput>

<TaoInputGroup>
  <template #before>https://</template>
  <TaoInput v-model="host" placeholder="example.com" />
  <template #after>
    <TaoButton>Проверить</TaoButton>
  </template>
</TaoInputGroup>

<form @submit.prevent="onSave">
  <TaoFormField label="Email">
    <TaoInput v-model="email" type="email" />
  </TaoFormField>
  <TaoButton type="submit">Сохранить</TaoButton>
</form>

<TaoFormField label="Количество">
  <TaoInputNumber v-model="qty" :min="1" :max="99" />
</TaoFormField>

<TaoQuantity v-model="qty" :max="12" @dec="onDec" />

<TaoFormField label="День доставки" hint="В модели всегда YYYY-MM-DD">
  <TaoDate v-model="day" min="2026-09-01" max="2026-09-30" />
</TaoFormField>

<TaoFormField label="Даты поездки">
  <TaoDateRange v-model="stay" min="2026-09-01" max="2026-09-30" />
</TaoFormField>

<TaoCounter :value="score" :max-digits="6" />

<TaoCarousel :autoplay="4000" loop dots>
  <article v-for="item in banners" :key="item.id" class="hero">
    <strong>{{ item.title }}</strong>
    <span>{{ item.text }}</span>
  </article>
</TaoCarousel>
<TaoCarousel :peek="72" :controls="false" dots>…</TaoCarousel>
<TaoCarousel v-model="slide" :per-view="5" :peek="28">
  <template #prev></template>
  <template #next="{ go, disabled }">
    <button type="button" :disabled="disabled" @click="go">вперёд</button>
  </template>
  <article v-for="item in products" :key="item.id">…</article>
</TaoCarousel>
```

`TaoDrawer` — лист сбоку, не модалка по центру:

```vue
<TaoDrawer v-model="open" title="Фильтры">
  ...
</TaoDrawer>
```

## Дизайн-токены и темизация

Стили библиотеки построены в три слоя. Компоненты **никогда** не обращаются
к цветам/размерам напрямую — только через переменные из семантического слоя.
Это и есть механизм темизации: переопределяете 20-30 переменных — меняется
внешний вид всех компонентов сразу, без правок самих компонентов.

```
primitives.css   →   semantic.css   →   themes/*.css (опционально)
   сырые цвета         публичный API      готовые темы поверх
   и размеры,          темизации:         semantic — пример: light
   не трогать          вот что менять
```

### Слои

| Файл | Назначение | Трогать? |
|---|---|---|
| `primitives.css` | Сырая палитра, шкалы отступов/радиусов/теней (`--tao-orange-400`, `--tao-space-3`...) | Обычно нет |
| `semantic.css` | Токены темы по умолчанию (dark): `--tao-color-accent`, `--tao-color-surface`, `--tao-color-danger` и т.д. | **Да — это и есть API темизации** |
| `themes/light.css` | Пример альтернативной темы через `[data-tao-theme="light"]` | Да, как образец |
| `base.css` | Глобальный reset (скроллбар, ссылки, box-sizing) | Редко |

Все четыре подключаются одним файлом `@1337exp/taoui/styles.css`.

### Как сделать свою тему

Тема — это просто переопределение семантических токенов под своим селектором.
Ничего в компонентах менять не нужно:

```css
/* my-brand-theme.css */
[data-tao-theme="my-brand"] {
    --tao-color-accent: #6c5ce7;
    --tao-color-accent-hover: #5a4bd1;
    --tao-color-bg: #0f0f1a;
    --tao-color-surface: #0f0f1a;
    --tao-color-surface-raised: #1a1a2e;
    --tao-color-text: #d6d6e8;
    --tao-color-text-strong: #ffffff;
    /* остальные токены см. semantic.css */
}
```

```vue
<!-- app.vue -->
<template>
  <div data-tao-theme="my-brand">
    <NuxtPage />
  </div>
</template>
```

Или переключайте тему целиком на `<html>`, чтобы стилизовать модалки/тултипы,
которые телепортируются в `body`:

```javascript
document.documentElement.setAttribute('data-tao-theme', 'light')
```

### Ключевые группы токенов

- `--tao-color-accent*` — акцентный/брендовый цвет (кнопки primary, активные вкладки, ссылки)
- `--tao-color-on-accent` — текст на акцентном фоне
- `--tao-color-selection`, `--tao-color-selection-text` — выделение текста (`::selection`)
- `--tao-color-surface*` — фоны контейнеров (обычный / приподнятый / утопленный / hover)
- `--tao-color-border*` — границы
- `--tao-color-text*` — текст (обычный / усиленный / subtle / приглушённый / disabled)
- `--tao-color-danger*`, `--tao-color-success*`, `--tao-color-warning*`, `--tao-color-info*` — статусные цвета
- `--tao-color-input-*` — поля ввода отдельно, т.к. фон/текст полей часто не совпадают с surface/text
- `--tao-radius-control`, `--tao-radius-panel` — скругления (мелкие контролы vs крупные панели)
- `--tao-shadow-panel`, `--tao-shadow-overlay` — тени
- `--tao-font-size-*` — шкала кегля в `primitives.css`: `xs`–`xl` контролы, `2xl`–`4xl` заголовки / проза
- `--tao-control-height-*` (26 / 36 / 44px), `--tao-control-padding-x-*`, `--tao-control-padding-y-*`, `--tao-control-font-size-*`, `--tao-control-font-size-secondary-*`, `--tao-button-padding-x-*`, `--tao-indicator-size-*`, `--tao-tag-height-*` / `-padding-x-*` / `-font-size-*` — шкала размеров в `primitives.css`. Компоненты читают текущие значения из `size.css`: `--tao-control-height`, `--tao-control-padding-x` / `-y`, `--tao-control-font-size`, `--tao-control-font-size-secondary`, `--tao-button-padding-x`, `--tao-indicator-size`, `--tao-tag-height` / `-padding-x` / `-font-size`. Используйте их в своих контролах, чтобы попасть в размер окружения.

Полный список — в `src/styles/semantic.css`, он же единственный файл,
который стоит открыть, чтобы понять весь доступный API темизации.

### Если нужна тема с нуля, без primitives

```javascript
import '@1337exp/taoui/styles/primitives.css' // шкалы можно оставить
import './my-semantic.css'              // свой семантический слой вместо @1337exp/taoui/styles/semantic.css
import '@1337exp/taoui/styles/base.css'
```

## Демонстрация

Все компоненты с живыми примерами, таблицами пропсов и готовыми сниппетами. Язык (EN / RU) и тема (dark / light) переключаются в шапке.

```bash
cd showcase
npm install
npm run dev        # или из корня репозитория: npm run showcase
```

Showcase смотрит прямо в `src/`, поэтому правки компонентов видны без
`npm run build`. `npm run showcase:build` собирает статический сайт с относительными
путями — его можно положить в любую папку (например, `/sandbox/taoui/`).

Скриншоты и ролики в этом README сняты с showcase: см. [docs/media](docs/media/README.md).

## Разработка

```bash
# Сборка библиотеки
npm run build

# Режим разработки (watch)
npm run dev

# Проверка типов
npm run type-check

# Тесты (Vitest)
npm test
```

## Публикация в npm

Публикуется только `dist/` (собранная библиотека) и `src/styles/` (сырые
токены — чтобы можно было подключить `primitives.css` отдельно при
кастомной теме), плюс `README.md`, `LICENSE` и `CHANGELOG.md`. Исходники компонентов (`src/components/*.vue`),
конфиги сборки и `showcase/` в пакет не попадают — они остаются в
репозитории; чтобы их получить, репозиторий клонируют.

`npm publish` **сам** прогоняет проверку типов, тесты и полную пересборку перед
публикацией (хук `prepublishOnly` в `package.json`) — так в реестр не
уедет пакет со старым или отсутствующим `dist/`. Собирать вручную перед
`npm publish` не нужно.

Проверить, что именно попадёт в пакет, без реальной публикации:

```bash
npm pack --dry-run
```

Токен публикации не должен лежать в репозитории: в `.npmrc` ссылайтесь на него как
`//registry.npmjs.org/:_authToken=${NPM_TOKEN}` и задайте `NPM_TOKEN` в окружении.
`.npmrc` в любом случае в `.gitignore`.

## Участие в проекте

Issues и pull request'ы приветствуются — см. [CONTRIBUTING.md](CONTRIBUTING.md).
Об уязвимостях: [SECURITY.md](SECURITY.md).

## Лицензия

[MIT](LICENSE) © 2026 1337exp
