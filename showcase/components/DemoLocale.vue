<script setup>
import { computed, ref } from 'vue'
import { detectTaoLanguage, formatTaoText, localeEn, localeRu, matchTaoLanguage, TaoCopy, TaoInput, TaoInputNumber } from '@1337exp/taoui'
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

// the keys of one section with both languages, from the real objects, so the page cannot differ from the library
// ключи одного раздела с обоими языками, из настоящих объектов: страница не может разойтись с библиотекой
const picked = ref('')
const flat = (value, path = []) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? Object.entries(value).flatMap(([k, v]) => flat(v, [...path, k]))
    : [{ key: path.join('.'), text: JSON.stringify(value) }]
const rows = computed(() => {
  if (!picked.value) return []
  const ru = Object.fromEntries(flat(localeRu[picked.value], [picked.value]).map((r) => [r.key, r.text]))
  return flat(localeEn[picked.value], [picked.value]).map((r) => ({ key: r.key, en: r.text, ru: ru[r.key] ?? '' }))
})
const template = JSON.stringify(localeEn, null, 2)

const codeConsole = `import { localeEn } from '@1337exp/taoui'

console.log(localeEn)                 // the whole object
console.table(localeEn.select)        // one section: placeholder, clearText
// in an editor: type a locale as TaoLocale and the keys complete themselves`

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

// plural forms: the same number, three languages / формы числа: одно число, три языка
const qty = ref(1)
const forms = {
  en: { code: 'en-US', text: { one: '{count} file', other: '{count} files' } },
  ru: { code: 'ru-RU', text: { one: '{count} файл', few: '{count} файла', many: '{count} файлов', other: '{count} файла' } },
  ar: { code: 'ar', text: { zero: 'لا ملفات', one: 'ملف واحد', two: 'ملفان', few: '{count} ملفات', many: '{count} ملفًا', other: '{count} ملف' } },
}
const pluralLines = computed(() => Object.entries(forms).map(([lang, f]) => ({ lang, text: formatTaoText(f.text, { count: qty.value }, f.code) })))

// the language of the user: what the browser says, and a field to try other wishes / язык пользователя: что говорит браузер и поле для других пожеланий
const supported = ['en', 'ru', 'de']
const browserLanguages = typeof navigator === 'undefined' ? '' : navigator.languages.join(', ')
const detected = detectTaoLanguage(supported)
const wishes = ref('ru-RU, en')
const matched = computed(() => matchTaoLanguage(wishes.value.split(',').map((s) => s.trim()).filter(Boolean), supported, 'en'))

const codePlural = `// a locale: a plain string, or one form per category of the language (only \`other\` is required)
setTaoLocale({
  avatar: { notificationsLabel: { one: '{count} уведомление', few: '{count} уведомления', many: '{count} уведомлений', other: '{count} уведомления' } },
  checklist: { counterText: '{checked} из {total}' },     // a plain string works for every number, as it always did
})

// and in your own code, the same rules:
formatTaoText(forms, { count: 5 }, 'ru-RU')            // '5 файлов'`

const codeDetect = `import { detectTaoLanguage, parseAcceptLanguage, setTaoLocale, localeRu, localeEn } from '@1337exp/taoui'

const lang = localStorage.getItem('lang') ?? detectTaoLanguage(['en', 'ru'])   // saved, else the language of the browser
setTaoLocale(lang === 'ru' ? localeRu : localeEn)

// on the server (Nuxt): there is no navigator, give the wishes of the request
detectTaoLanguage(['en', 'ru'], { requested: parseAcceptLanguage(headers['accept-language']) })`

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

    <h3>{{ tr('Numbers: plural forms', 'Числа: формы множественного числа') }}</h3>
    <Tr>
      <template #en>
        <p>
          A text that depends on a number may be written as forms, one per plural category of the language (<code>one</code>, <code>few</code>, <code>many</code>,
          <code>other</code>…): the library picks one by the number and the <code>code</code> of the locale (<code>Intl.PluralRules</code>, so every language the
          browser knows). Only <code>other</code> is required, and a plain string still works: it is the same for every number. So nobody has to write forms; the
          built-in texts that count (the badge of an avatar, the jump of a pager) already have them in English and Russian.
        </p>
      </template>
      <template #ru>
        <p>
          Текст, зависящий от числа, можно написать формами, по одной на категорию множественного числа языка (<code>one</code>, <code>few</code>,
          <code>many</code>, <code>other</code>…): библиотека выберет нужную по числу и <code>code</code> локали (<code>Intl.PluralRules</code>, то есть любой язык, который знает
          браузер). Обязательна только <code>other</code>, а обычная строка по-прежнему работает: она одна на любое число. Так что писать формы никого не заставляют;
          встроенные тексты, где есть счёт (бейдж аватара, прыжок пагинации), уже с формами на английском и русском.
        </p>
      </template>
    </Tr>
    <div class="locale-try">
      <TaoInputNumber v-model="qty" :min="0" :max="1000" />
      <ul>
        <li v-for="line in pluralLines" :key="line.lang"><code>{{ line.lang }}</code> {{ line.text }}</li>
      </ul>
    </div>
    <div class="code-block"><pre><code>{{ codePlural }}</code></pre></div>

    <h3>{{ tr('The language of the user', 'Язык пользователя') }}</h3>
    <Tr>
      <template #en>
        <p>
          <code>detectTaoLanguage(['en', 'ru'])</code> answers with the one of your languages that the user would like most (<code>navigator.languages</code>;
          <code>ru-RU</code> fits <code>ru</code>). It only answers: it neither sets the language nor remembers it, so the usual order is “saved choice, else this”.
          On a server pass the wishes of the request. Try other wishes below.
        </p>
      </template>
      <template #ru>
        <p>
          <code>detectTaoLanguage(['en', 'ru'])</code> отвечает тем из ваших языков, который пользователь хотел бы больше всего (<code>navigator.languages</code>;
          <code>ru-RU</code> подойдёт к <code>ru</code>). Только отвечает: язык не ставит и не запоминает, поэтому обычный порядок — «сохранённый выбор, иначе это».
          На сервере передайте пожелания запроса. Ниже можно попробовать другие пожелания.
        </p>
      </template>
    </Tr>
    <div class="locale-try">
      <div class="locale-note">
        {{ tr('Your browser says', 'Ваш браузер говорит') }}: <code>{{ browserLanguages }}</code><br />
        <code>detectTaoLanguage(['en', 'ru', 'de'])</code> → <code>{{ detected }}</code>
      </div>
      <div class="locale-try__field">
        <TaoInput v-model="wishes" :aria-label="tr('Wishes, the most wanted first', 'Пожелания, самое желаемое первым')" />
        <span>→ <code>{{ matched }}</code></span>
      </div>
    </div>
    <div class="code-block"><pre><code>{{ codeDetect }}</code></pre></div>

    <h3>{{ tr('What is translated', 'Что переводится') }}</h3>
    <Tr>
      <template #en>
        <p>
          The names of the keys are in the library itself: <code>localeEn</code> and <code>localeRu</code> are exported objects (the source is
          <code>src/locale/en.ts</code>, the type with every key is <code>TaoLocale</code> in <code>src/locale/types.ts</code>). This list is built from those
          very objects, so it cannot differ from the library. Press a section to see its keys in both languages.
        </p>
      </template>
      <template #ru>
        <p>
          Имена ключей лежат в самой библиотеке: <code>localeEn</code> и <code>localeRu</code> — экспортируемые объекты (исходник —
          <code>src/locale/en.ts</code>, тип со всеми ключами — <code>TaoLocale</code> в <code>src/locale/types.ts</code>). Этот список построен из тех же самых
          объектов, поэтому разойтись с библиотекой не может. Нажмите на раздел, чтобы увидеть его ключи на обоих языках.
        </p>
      </template>
    </Tr>
    <p class="locale-note">
      {{ tr(`${total} texts in ${sections.length} sections (the sections repeat the components):`, `${total} текстов в ${sections.length} разделах (разделы повторяют компоненты):`) }}
    </p>
    <ul class="locale-sections">
      <li v-for="s in sections" :key="s.key">
        <button type="button" :class="{ on: picked === s.key }" :aria-pressed="picked === s.key" @click="picked = picked === s.key ? '' : s.key">
          <code>{{ s.key }}</code><span>{{ s.texts }}</span>
        </button>
      </li>
    </ul>
    <table v-if="rows.length" class="locale-keys">
      <thead><tr><th>{{ tr('Key', 'Ключ') }}</th><th>English</th><th>Русский</th></tr></thead>
      <tbody>
        <tr v-for="r in rows" :key="r.key"><td><code>{{ r.key }}</code></td><td>{{ r.en }}</td><td>{{ r.ru }}</td></tr>
      </tbody>
    </table>
    <div class="locale-tools">
      <span>{{ tr('A template to translate: the whole English locale as JSON', 'Заготовка для перевода: вся английская локаль как JSON') }}</span>
      <TaoCopy :text="template" />
    </div>
    <div class="code-block"><pre><code>{{ codeConsole }}</code></pre></div>

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

.locale-try {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 16px;
  margin: 8px 0 12px;
}

.locale-try ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.locale-try li {
  padding: 2px 0;
}

.locale-try__field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 260px;
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

.locale-sections button {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 2px 10px;
  border: 1px solid var(--tao-color-border);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.locale-sections button:hover {
  border-color: var(--tao-color-border-strong);
}

.locale-sections button.on {
  border-color: var(--tao-color-accent);
  color: var(--tao-color-accent);
}

.locale-sections button:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: 2px;
}

.locale-keys {
  width: 100%;
  margin: 0 0 12px;
  border-collapse: collapse;
  font-size: 13px;
}

.locale-keys th,
.locale-keys td {
  padding: 4px 10px;
  border-bottom: 1px solid var(--tao-color-border);
  text-align: start;
  vertical-align: top;
}

.locale-keys th {
  color: var(--tao-color-text-muted);
  font-weight: 600;
}

.locale-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.locale-sections span {
  color: var(--tao-color-text-muted);
}
</style>
