# Tao UI

[English](README.md) · **Русский**

Библиотека Vue 3 компонентов для Nuxt/Vue проектов с системой дизайн-токенов:
поменял несколько CSS-переменных — поменялась тема всего набора компонентов.

## Компоненты

### Базовые

- **TaoBlock** — базовый контейнер с настраиваемыми отступами и скруглением
- **TaoButton** — кнопка: `primary` / `secondary` / `ghost` / `text` / `danger`. `tone` красит ghost и text (danger, success, warning, info)
- **TaoCard** — карточка со слотами cover / header / footer. В `#cover` — фото или `TaoCarousel`
- **TaoCopy** — иконка копирования в буфер. После клика сверху тултип «Скопировано»; если кнопку убрали — тултип тоже
- **TaoInput** — поле ввода с поддержкой v-model, валидации и слотов `#prefix` / `#suffix` (иконка или текст внутри рамки)
- **TaoInputGroup** — склейка снаружи: `#before` | поле | `#after` (протокол, единица, кнопка)
- **TaoModal** — модальное окно с анимацией и слотами
- **TaoDrawer** — боковая панель (фильтры, настройки). Esc, клик по фону, ловушка фокуса — как у модалки
- **TaoSpoiler** — раскрывающийся блок. `v-model` и `aria-expanded`. Несколько подряд сами друг друга не закрывают
- **TaoSpoilerGroup** — аккордеон: `v-model` — ключ открытой панели (`null` — все закрыты), у спойлера `name`. Без `v-model` группа помнит ключ сама
- **TaoTabs** — вкладки для переключения между секциями контента
- **TaoTooltip** — всплывающая подсказка при наведении. `top` / `bottom` / `left` / `right`, у края экрана переворачивается
- **TaoPopover** — панель по клику: слот с любым контентом, Esc и клик снаружи. Не тултип и не меню действий

### Layout

- **TaoContainer** — контейнер с ограничением ширины (wide/slim/ultra-slim) и авто-центровкой
- **TaoFlex** — обёртка над flexbox с пропами justify/align/direction/wrap/gap
- **TaoSpace** — авто-расстановка дочерних элементов с равномерным gap
- **TaoDivider** — разделитель: line (тонкая линия), text (линия с текстом), gap (пустой отступ, size: small/medium/large)
- **TaoSplit** — две панели и полоса. `row` / `column` как у Flex. `v-model` — размер start в `%` или `px`; `resizable="false"` фиксирует полосу. Не Divider.
- **TaoFieldset** — рамка-группа: `legend` сидит на верхней границе, `align` — start / center / end
- **TaoAnimatedBorder** — контейнер с анимированной радужной рамкой (декоративный, не завязан на тему)

### Формы и ввод

- **TaoCheckbox** — чекбокс с v-model, слотами pre/post и `indeterminate` (частично выбран)
- **TaoSwitch** — переключатель для булевых настроек (`role="switch"`)
- **TaoRadio** / **TaoRadioGroup** — классические радиокнопки: длинные подписи, можно столбиком
- **TaoSegmented** / **TaoSegmentedOption** — компактный выбор из 2–5 коротких вариантов. Не вкладки
- **TaoSelect** — выпадающий список с клавиатурой, тот же визуал, что у Input. Сброс — «Очистить» в списке или Delete
- **TaoCombobox** — Select с полем: фильтр по вводу, `allow-create` пишет своё в `v-model`, `create` — чтобы родитель дополнил список
- **TaoDate** — один день: `YYYY-MM-DD`, без часов и пояса. Календарь как у Select
- **TaoDateRange** — период: `v-model` — `{ start, end }` или `null`. Первый клик — начало, второй — конец (если конец раньше — меняются местами). Неполный выбор в модель не пишется
- **TaoFormField** — общие label / hint / error для полей формы
- **TaoInputNumber** — число с min/max/step и кнопками ± справа. Пустое значение — `null`
- **TaoQuantity** — количество в корзине: `− | поле | +`, целые штуки, сток, минус на минимуме может убрать строку
- **TaoTextarea** — многострочное поле с авто-высотой. `maxlength` ограничивает ввод, `count` показывает «введено / максимум»
- **TaoPinCode** — пин-код из N полей. По умолчанию клик стирает ячейку и все справа (`clear-on="focus"`); `clear-on="input"` заменяет цифру только при вводе. Последняя ячейка снимает фокус и эмитит `complete`
- **TaoSlider** — слайдер: мышь, тач и стрелки. Опциональный точный ввод по правому клику. `size="small"` — тонкий трек для seek / громкости
- **TaoFileDrop** — зона загрузки (drag & drop + клик). Список имён под зоной, `v-model` — `File[]`. Очистку всей пачки решает родитель (`clear-request`)

### Отображение данных

- **TaoTable** — простая таблица: колонки, empty, loading, сортировка через `v-model:sort`. Не datagrid.
- **TaoPagination** — страницы с многоточием. Клик по «…» прыгает на `jump` страниц (5 по умолчанию)
- **TaoEmpty** — пустой список, нет результатов, нет прав
- **TaoStages** — список стадий: `wait` / `work` / `ok` / `bad`. Не линейный степпер
- **TaoSkeleton** — плейсхолдер загрузки (text / title / circle / rect)
- **TaoCounter** — витрина числа с переворотом цифр (не инпут)
- **TaoCarousel** — лента: целый слайд с `autoplay`, карточка с `peek`, полоса с `per-view`. Стрелки через `controls` или `#prev` / `#next`, точки — `dots`
- **TaoAvatar** — фото или инициалы, размеры `small` / `medium` / `large`. Точка `dot` и счётчик `count`
- **TaoTag** — тег/бейдж со статусами. `#prefix` (аватар), `closable` убирает чип, `flat` — без рамки
- **TaoAlert** — инлайн-баннер страницы или ошибки формы (success / error / warning / info)
- **TaoProgress** — статичная полоса (`progress` в %). Проценты сверху по центру или `showPercentage="right"` справа; слоты `#left` / `#right` — подписи, тогда процент справа в скобках. `false` прячет. Ширина — `minWidth` / `maxWidth`, не диапазон значения
- **TaoLoader** — анимированный лоадер (четыре точки)
- **TaoImage** — обёртка над `<img>`: fade-in и плейсхолдер. `lazy` включает нативный `loading="lazy"`
- **TaoIcon** — обёртка для icon-шрифта (см. раздел «Иконки» ниже)

### Навигация и взаимодействие

- **TaoLink** — `<NuxtLink>` в Nuxt, `<RouterLink>` при vue-router, иначе обычный `<a>` — без дополнительной настройки
- **TaoBreadcrumb** — крошки: последний пункт — текущая страница
- **TaoDropdownMenu** — выпадающее меню с авто-позиционированием у края экрана
- **TaoScrollTop** — плавающая кнопка «наверх» с ripple. Появляется при обратном скролле после `boundary`

### Обратная связь

- **toast()** — fluent-уведомления: `toast().success().message('Сохранено')`
- **confirm()** — вопрос с оверлеем: тот же fluent + `await`. Не тост — ждёт ответ, не исчезает сам.
- **TaoToastViewport** / **TaoConfirmHost** — контейнеры; если их нет в разметке, первый вызов сам монтирует их в `body`

## Соглашения

Тоны визуала: `success` | `danger` | `warning` | `info` | `neutral`.
`error` у Alert, Tag и `toast()` — синоним `danger`. Button уже `danger`.
Stages — это процесс, не тон: `wait` / `work` / `ok` / `bad` (`danger` принимается как `bad`).

Размеры контролов: `small` | `medium` | `large`.
Avatar понимает и короткие `s` / `m` / `l`. Divider `gap` раньше называл крупный размер `big` — это алиас `large`.
Container живёт на другой оси: `wide` / `slim` / `ultra-slim`.

## Иконки

`TaoIcon` не поставляет собственный набор иконок — он рендерит класс `icon-<name>`
по соглашению, рассчитанному на подключение внешнего icon-шрифта (например,
собранного через IcoMoon/Fontello). Чтобы иконки отображались, подключите
свой шрифт с классами вида `.icon-arrow-up { ... }` в проекте.

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

### Использование отдельных компонентов

```vue
<script setup>
import { TaoButton, TaoInput, TaoModal } from '@1337exp/taoui'
import '@1337exp/taoui/styles.css'
</script>

<template>
  <TaoButton variant="primary">Нажми меня</TaoButton>
  <TaoInput v-model="text" label="Введите текст" />
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
toast().error().title('Сеть').timeout(5000).message('Нет соединения')
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

<TaoAlert type="warning" title="Черновик">Сохраните, прежде чем уйти.</TaoAlert>
```

`TaoSegmented` — короткий взаимоисключающий выбор, все варианты видны сразу. Не для навигации по страницам: это `TaoTabs`. Длинные подписи или больше 5–6 пунктов — `TaoRadioGroup` или `TaoSelect`.

`TaoSelect` открывается с клавиатуры (стрелки, Enter, Esc), список переворачивается у края экрана. Delete или «Очистить» внизу списка сбрасывает значение в `null`.

`TaoCombobox` — то же меню, но с полем. Печатаете — варианты режутся. `allow-create` пишет введённое в `v-model`, если точного совпадения нет. Список сам не меняется: слушайте `create` и добавьте option снаружи.

`TaoFormField` также оборачивает `TaoTextarea` и `TaoCheckbox` — id, hint и error прокидываются сами.

`TaoTag` может быть чипом: `#prefix` слева (обычно `TaoAvatar`), `closable` рисует крестик и эмитит `close`. Клик по крестику наружу не всплывает. `flat` снимает рамку, заливка остаётся.

```vue
<TaoTag type="neutral" closable @close="remove">
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
    <TaoTag :type="row.status === 'active' ? 'success' : 'neutral'">
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
- `--tao-color-on-accent` — текст на акцентном фоне (`--tao-color-text-on-accent` — алиас)
- `--tao-color-selection`, `--tao-color-selection-text` — выделение текста (`::selection`)
- `--tao-color-surface*` — фоны контейнеров (обычный / приподнятый / утопленный / hover)
- `--tao-color-border*` — границы
- `--tao-color-text*` — текст (обычный / усиленный / приглушённый / disabled)
- `--tao-color-danger*`, `--tao-color-success*`, `--tao-color-warning*`, `--tao-color-info*` — статусные цвета
- `--tao-color-input-*` — поля ввода отдельно, т.к. фон/текст полей часто не совпадают с surface/text
- `--tao-radius-control`, `--tao-radius-panel` — скругления (мелкие контролы vs крупные панели)
- `--tao-shadow-panel`, `--tao-shadow-overlay` — тени

Полный список — в `src/styles/semantic.css`, он же единственный файл,
который стоит открыть, чтобы понять весь доступный API темизации.

### Если нужна тема с нуля, без primitives

```javascript
import '@1337exp/taoui/styles/primitives.css' // шкалы можно оставить
import './my-semantic.css'              // свой семантический слой вместо @1337exp/taoui/styles/semantic.css
import '@1337exp/taoui/styles/base.css'
```

## Демонстрация

Для просмотра всех компонентов запустите showcase:

```bash
cd showcase
npm install
npm run dev
```

В showcase есть переключатель темы (dark / light) в шапке — так виден
эффект переопределения токенов без правок кода компонентов.

Showcase смотрит прямо в `src/`, поэтому правки компонентов видны без
`npm run build`. Сборка `dist/` нужна для публикации и для чужих проектов,
которые ставят пакет.

## Разработка

```bash
# Сборка библиотеки
npm run build

# Режим разработки (watch)
npm run dev

# Проверка типов
npm run type-check
```

## Публикация в npm

Публикуется только `dist/` (собранная библиотека) и `src/styles/` (сырые
токены — чтобы можно было подключить `primitives.css` отдельно при
кастомной теме). Исходники компонентов (`src/components/*.vue`),
конфиги сборки и `showcase/` в пакет не попадают — они остаются в
репозитории; чтобы их получить, репозиторий клонируют.

`npm publish` **сам** прогоняет проверку типов и полную пересборку перед
публикацией (хук `prepublishOnly` в `package.json`) — так в реестр не
уедет пакет со старым или отсутствующим `dist/`. Собирать вручную перед
`npm publish` не нужно.

Проверить, что именно попадёт в пакет, без реальной публикации:

```bash
npm pack --dry-run
```

## Лицензия

MIT
