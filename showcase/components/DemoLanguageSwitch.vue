<script setup>
import { ref } from 'vue'
import { TaoLanguageSwitch } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoLanguageSwitch' })

// each on its own and `apply` off: the demos must not change the language of this page
// каждый сам по себе и `apply` выключен: демо не должны менять язык этой страницы
const one = ref('ru')
const two = ref('en')
const three = ref('de')
</script>

<template>
  <ShowcaseSection id="language-switch" :tables="propTables['language-switch']">
    <h2>TaoLanguageSwitch</h2>
    <Tr>
      <template #en>
        <p>
          The language of the interface: a globe that opens a list of the languages, each under its own name (<code>Русский</code>,
          <code>English</code>, <code>Deutsch</code>), so a person finds theirs without reading the others. The names come from the
          engine (<code>Intl.DisplayNames</code>), there is no table to keep. The switch writes the language to
          <code>&lt;html lang&gt;</code> (turn it off with <code>:apply="false"</code>) and says the code in <code>v-model</code>;
          the texts of your app, where the choice is stored and <code>setTaoLocale</code> for the built-in texts stay yours.
          Where there is no room (a phone, a narrow rail) it is <code>icon-only</code>: the name stays in the accessible name.
          Not <code>TaoSegmented</code> with <code>RU | EN</code>: that is a row of codes that grows with every language.
        </p>
      </template>
      <template #ru>
        <p>
          Язык интерфейса: глобус, который открывает список языков, каждый под своим названием (<code>Русский</code>,
          <code>English</code>, <code>Deutsch</code>), поэтому человек находит свой, не читая остальные. Названия берутся у
          движка (<code>Intl.DisplayNames</code>), таблицу вести не нужно. Переключатель пишет язык в
          <code>&lt;html lang&gt;</code> (выключается <code>:apply="false"</code>) и говорит код в <code>v-model</code>;
          тексты приложения, место, где хранится выбор, и <code>setTaoLocale</code> для встроенных текстов остаются вашими.
          Где тесно (телефон, узкая рейка), он <code>icon-only</code>: название остаётся в доступном имени.
          Не <code>TaoSegmented</code> с <code>RU | EN</code>: это ряд кодов, который растёт с каждым языком.
        </p>
      </template>
    </Tr>

    <div class="language-preview">
      <TaoLanguageSwitch v-model="one" :languages="['ru', 'en']" :apply="false" />
      <TaoLanguageSwitch v-model="two" :languages="['en', 'ru', 'de', 'fr', 'ja']" :apply="false" />
      <TaoLanguageSwitch v-model="three" :languages="['en', 'ru', 'de']" :apply="false" icon-only />
      <TaoLanguageSwitch v-model="one" :languages="['ru', 'en']" :apply="false" size="small" />
      <TaoLanguageSwitch v-model="two" :languages="['en', { code: 'ru', label: 'Русский (RU)' }]" :apply="false" size="large" />
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoLanguageSwitch v-model="lang" :languages="['ru', 'en']" /&gt;

&lt;!-- a phone: only the globe --&gt;
&lt;TaoLanguageSwitch v-model="lang" :languages="['ru', 'en']" icon-only /&gt;

&lt;!-- your own name for a language --&gt;
&lt;TaoLanguageSwitch v-model="lang" :languages="['en', { code: 'pt-BR', label: 'Português' }]" /&gt;

&lt;!-- the app owns the texts and the storage --&gt;
&lt;TaoLanguageSwitch v-model="lang" :languages="['ru', 'en']" @change="(code) =&gt; { localStorage.lang = code; setTaoLocale(code === 'ru' ? localeRu : localeEn) }" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.language-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
</style>
