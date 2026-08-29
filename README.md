# Tao UI

Библиотека Vue 3 компонентов для Nuxt/Vue проектов с системой дизайн-токенов:
поменял несколько CSS-переменных — поменялась тема всего набора компонентов.

## Компоненты

### Базовые

- **TaoBlock** — базовый контейнер с настраиваемыми отступами и скруглением
- **TaoButton** — кнопка с вариантами (primary, secondary, ghost, danger), размерами и состояниями
- **TaoCard** — карточка с поддержкой слотов (cover, headerTitle, header/headerSecondary, title/sub, footer)
- **TaoCopy** — кнопка копирования текста в буфер обмена
- **TaoInput** — поле ввода с поддержкой v-model, валидации и различных типов
- **TaoModal** — модальное окно с анимацией и слотами
- **TaoSpoiler** — раскрывающийся блок (аккордеон)
- **TaoTabs** — вкладки для переключения между секциями контента
- **TaoTooltip** — всплывающая подсказка при наведении

### Layout

- **TaoContainer** — контейнер с ограничением ширины (wide/slim/ultra-slim) и авто-центровкой
- **TaoFlex** — обёртка над flexbox с пропами justify/align/direction/wrap/gap
- **TaoSpace** — авто-расстановка дочерних элементов с равномерным gap
- **TaoDivider** — разделитель: line (тонкая линия), text (линия с текстом), gap (пустой отступ)
- **TaoAnimatedBorder** — контейнер с анимированной радужной рамкой (декоративный, не завязан на тему)

### Формы и ввод

- **TaoCheckbox** — чекбокс с поддержкой v-model и слотов pre/post
- **TaoTextarea** — многострочное поле с авто-высотой и модификаторами (noBorder, noBackground, textCenter, submitOnEnter)
- **TaoPinCode** — пин-код из N полей с авто-переходом фокуса между ними
- **TaoSlider** — интерактивный слайдер (drag + клик), с опциональным точным вводом значения по правому клику
- **TaoFileDrop** — зона загрузки файлов (drag & drop + клик)

### Отображение данных

- **TaoTag** — тег/бейдж со статусами (neutral, success, danger)
- **TaoProgress** — статичная полоса прогресса, опционально с shimmer-анимацией
- **TaoLoader** — анимированный лоадер (четыре точки)
- **TaoImage** — обёртка над `<img>` с плавным fade-in при загрузке и плейсхолдером
- **TaoIcon** — обёртка для icon-шрифта (см. раздел «Иконки» ниже)

### Навигация и взаимодействие

- **TaoLink** — ссылка, использующая `<NuxtLink>` в Nuxt-проекте и обычный `<a>` вне его — без дополнительной настройки
- **TaoDropdownMenu** — выпадающее меню с авто-позиционированием у края экрана
- **TaoScrollTop** — плавающая кнопка «наверх» с ripple-эффектом, появляется при обратном скролле

## Иконки

`TaoIcon` не поставляет собственный набор иконок — он рендерит класс `icon-<name>`
по соглашению, рассчитанному на подключение внешнего icon-шрифта (например,
собранного через IcoMoon/Fontello). Чтобы иконки отображались, подключите
свой шрифт с классами вида `.icon-arrow-up { ... }` в проекте.

## Установка

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
- `--tao-color-surface*` — фоны контейнеров (обычный / приподнятый / утопленный / hover)
- `--tao-color-border*` — границы
- `--tao-color-text*` — текст (обычный / усиленный / приглушённый / disabled)
- `--tao-color-danger*`, `--tao-color-success*` — статусные цвета
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
