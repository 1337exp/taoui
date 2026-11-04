<script setup>
import { computed } from 'vue'
import { localeEn, localeRu } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import LocaleBox from './LocaleBox.vue'
import LocaleSpecimen from './LocaleSpecimen.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'DemoLocale' })

// A third language made of a few keys on top of English: the rest stays English. `code` also decides how dates read.
// Третий язык из нескольких ключей поверх английского: остальное остаётся английским. `code` решает и как читаются даты.
const german = {
  code: 'de-DE',
  select: { placeholder: 'Auswählen' },
  combobox: { placeholder: 'Tippen…', emptyText: 'Nichts gefunden' },
  date: { placeholder: 'Datum', todayText: 'Heute' },
  dateRange: { placeholder: 'Zeitraum' },
  checklist: { selectAllLabel: 'Alle auswählen', counterText: '{checked} von {total}' },
  pagination: { perPageText: 'Pro Seite', totalText: '{from}–{to} von {total}' },
  table: { emptyText: 'Keine Daten' },
  empty: { title: 'Hier ist nichts' },
  fileDrop: { zoneText: 'Datei hierher ziehen oder klicken' },
}

// What is translated: the sections of the locale and how many texts each has / что переводится: разделы локали и сколько в каждом текстов
const count = (value) => (value && typeof value === 'object' ? Object.values(value).reduce((sum, v) => sum + count(v), 0) : 1)
const sections = Object.entries(localeEn)
  .filter(([key]) => key !== 'code')
  .map(([key, value]) => ({ key, texts: count(value) }))
const total = sections.reduce((sum, s) => sum + s.texts, 0)

const codeApp = `import TaoUI, { localeRu } from '@1337exp/taoui'

app.use(TaoUI, { locale: localeRu })                      // a whole language
app.use(TaoUI, { locale: { select: { placeholder: 'Pick one' } } })   // a few texts on top of English`

const codeLive = `import { setTaoLocale, localeEn, localeRu } from '@1337exp/taoui'

setTaoLocale(lang === 'ru' ? localeRu : localeEn)      // at any moment: what is on the page updates, nothing is lost
document.documentElement.lang = lang                    // and tell the browser too`

const codeSubtree = `<script setup>
import { provideTaoLocale, localeRu } from '@1337exp/taoui'
provideTaoLocale(localeRu)        // everything below this component speaks Russian
<\/script>`

const codeOwn = `import { localeEn, type TaoLocale } from '@1337exp/taoui'

const german: TaoLocale = { ...localeEn, code: 'de-DE', select: { placeholder: 'Auswählen', clearText: 'Leeren' } /* … */ }
// or a few keys only: setTaoLocale({ code: 'de-DE', select: { placeholder: 'Auswählen' } })`

const codeProp = computed(() => `<TaoSelect :options="options" placeholder="${tr('Pick a city', 'Выберите город')}" />   // ${tr('a prop in hand always wins', 'проп, переданный руками, главнее локали')}`)
</script>

<template>
  <ShowcaseSection id="locale">
    <h2>{{ tr('Localization', 'Локализация') }}</h2>
    <Tr>
      <template #en>
        <p>
          Every built-in text (placeholders, “Clear”, the names a screen reader hears, the calendar) comes from a locale. English is the default,
          Russian ships with the library, any other language is one object. The language switches at any moment, without a reload and without
          losing what was typed; a block of the page may have a language of its own. The EN / RU switch of this page is exactly
          <code>setTaoLocale</code>.
        </p>
      </template>
      <template #ru>
        <p>
          Каждый встроенный текст (подсказки в полях, «Очистить», имена, которые слышит скринридер, календарь) берётся из локали. По умолчанию
          английская, русская идёт в комплекте, любой другой язык — один объект. Язык переключается в любой момент, без перезагрузки и без потери
          введённого; у блока страницы может быть свой язык. Переключатель EN / RU у этой страницы — это ровно <code>setTaoLocale</code>.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('One page, three languages', 'Одна страница, три языка') }}</h3>
    <Tr>
      <template #en>
        <p>
          The same components with no text given by hand. Each column has its own language (<code>provideTaoLocale</code>); the third is only a
          few German keys on top of English, and its <code>code</code> is <code>de-DE</code>, so the date reads the German way. What it lacks stays English
          (for example the names a screen reader hears).
        </p>
      </template>
      <template #ru>
        <p>
          Те же компоненты без единого текста, заданного руками. У каждой колонки свой язык (<code>provideTaoLocale</code>); третий — всего
          несколько немецких ключей поверх английского, а его <code>code</code> — <code>de-DE</code>, поэтому дата читается по-немецки. Чего в нём нет,
          остаётся английским (например, имена для скринридера).
        </p>
      </template>
    </Tr>
    <div class="locale-columns">
      <LocaleBox :locale="localeEn" title="English" code="localeEn">
        <LocaleSpecimen />
      </LocaleBox>
      <LocaleBox :locale="localeRu" title="Русский" code="localeRu">
        <LocaleSpecimen />
      </LocaleBox>
      <LocaleBox :locale="german" title="Deutsch" :code="tr('a few keys', 'несколько ключей')">
        <LocaleSpecimen />
      </LocaleBox>
    </div>

    <h3>{{ tr('How to set it', 'Как задать') }}</h3>
    <div class="code-block"><pre><code>{{ codeApp }}</code></pre></div>
    <div class="code-block"><pre><code>{{ codeLive }}</code></pre></div>
    <div class="code-block"><pre><code>{{ codeSubtree }}</code></pre></div>

    <h3>{{ tr('Your own language, one text, a prop', 'Свой язык, один текст, проп') }}</h3>
    <Tr>
      <template #en>
        <p>
          Copy <code>localeEn</code> (or <code>localeRu</code>), translate, pass it the same way (type <code>TaoLocale</code>). The keys repeat the names of
          the props: <code>locale.select.placeholder</code> is the default of <code>placeholder</code> of TaoSelect. A text you pass by hand always wins.
        </p>
      </template>
      <template #ru>
        <p>
          Скопируйте <code>localeEn</code> (или <code>localeRu</code>), переведите, передайте так же (тип <code>TaoLocale</code>). Ключи повторяют имена
          пропсов: <code>locale.select.placeholder</code> — значение по умолчанию для <code>placeholder</code> у TaoSelect. Текст, переданный руками, главнее.
        </p>
      </template>
    </Tr>
    <div class="code-block"><pre><code>{{ codeOwn }}</code></pre></div>
    <div class="code-block"><pre><code>{{ codeProp }}</code></pre></div>

    <h3>{{ tr('What is translated', 'Что переводится') }}</h3>
    <p class="locale-note">
      {{ tr(`${total} texts in ${sections.length} sections (the sections repeat the components):`, `${total} текстов в ${sections.length} разделах (разделы повторяют компоненты):`) }}
    </p>
    <ul class="locale-sections">
      <li v-for="s in sections" :key="s.key"><code>{{ s.key }}</code><span>{{ s.texts }}</span></li>
    </ul>

    <h3>{{ tr('Good to know', 'Что ещё важно') }}</h3>
    <Tr>
      <template #en>
        <ul>
          <li>The date helpers and the date components follow <code>code</code> (<code>en-US</code> by default, <code>ru-RU</code> in <code>localeRu</code>).</li>
          <li>Set <code>&lt;html lang&gt;</code> yourself with the language: it is what a screen reader and the browser use to choose a voice and a dictionary.</li>
          <li>The templates know <code>{n}</code>, <code>{count}</code> and the like, not plural forms: “1 file / 2 files” is for your own text.</li>
          <li>Texts of TaoUX modules come from your app (labels, <code>i18n</code>), not from this locale.</li>
        </ul>
      </template>
      <template #ru>
        <ul>
          <li>Даты и компоненты дат идут за <code>code</code> (по умолчанию <code>en-US</code>, в <code>localeRu</code> — <code>ru-RU</code>).</li>
          <li><code>&lt;html lang&gt;</code> ставьте сами вместе с языком: по нему скринридер и браузер выбирают голос и словарь.</li>
          <li>Шаблоны знают <code>{n}</code>, <code>{count}</code> и подобные, а множественных форм нет: «1 файл / 2 файла» — дело вашего текста.</li>
          <li>Тексты модулей TaoUX приходят из вашего приложения (подписи, <code>i18n</code>), а не из этой локали.</li>
        </ul>
      </template>
    </Tr>
  </ShowcaseSection>
</template>

<style scoped>
.locale-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 12px 0 8px;
}

.locale-note {
  margin: 4px 0 8px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.locale-sections {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}

.locale-sections li {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 2px 10px;
  border: 1px solid var(--tao-color-border);
  border-radius: 999px;
  font-size: 12px;
}

.locale-sections span {
  color: var(--tao-color-text-muted);
}
</style>
