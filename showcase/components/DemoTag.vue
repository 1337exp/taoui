<script setup>
import { computed, ref } from 'vue'
import { TaoTag, TaoAvatar, TaoIcon } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoTag' })

const tagPeople = ref([{ id: 'anna' }, { id: 'boris' }, { id: 'kira' }])
const tagFilters = ref(['moscow', 'pro', 'new'])
const tagPersonNames = computed(() => ({
  anna: tr('Anna Kozlova', 'Анна Козлова'),
  boris: tr('Boris Volkov', 'Борис Волков'),
  kira: tr('Kira', 'Кира'),
}))
const tagFilterLabels = computed(() => ({
  moscow: tr('Moscow', 'Москва'),
  pro: 'Pro',
  new: tr('New', 'Новые'),
}))

function removeTagPerson(index) {
  tagPeople.value.splice(index, 1)
}

function removeTagFilter(index) {
  tagFilters.value.splice(index, 1)
}
</script>

<template>
  <ShowcaseSection id="tag" :tables="propTables['tag']">
    <h2>TaoTag</h2>
          <Tr>
            <template #en>
              <p>
                A tag / badge. <code>#prefix</code> — an avatar or an icon on the left, <code>closable</code> — a cross.
                <code>flat</code> removes the border, the fill stays. The cross does not bubble out.
              </p>
            </template>
            <template #ru>
              <p>
                Тег / бейдж. <code>#prefix</code> — аватар или иконка слева, <code>closable</code> — крестик.
                <code>flat</code> снимает рамку, заливка остаётся. Крестик не всплывает наружу.
              </p>
            </template>
          </Tr>
    
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag>default</TaoTag>
            <TaoTag tone="neutral">neutral</TaoTag>
            <TaoTag tone="success">success</TaoTag>
            <TaoTag tone="danger">danger</TaoTag>
            <TaoTag tone="warning">warning</TaoTag>
            <TaoTag tone="info">info</TaoTag>
            <TaoTag clickable>{{ tr('clickable', 'кликабельный') }}</TaoTag>
          </div>
    
          <h3>Flat</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag flat>default</TaoTag>
            <TaoTag tone="neutral" flat>neutral</TaoTag>
            <TaoTag tone="success" flat>success</TaoTag>
            <TaoTag tone="danger" flat>danger</TaoTag>
            <TaoTag tone="warning" flat>warning</TaoTag>
            <TaoTag tone="info" flat>info</TaoTag>
          </div>
    
          <h3>{{ tr('Closing and people', 'Закрытие и люди') }}</h3>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;">
            <TaoTag
              v-for="(filter, index) in tagFilters"
              :key="filter"
              tone="neutral"
              closable
              @close="removeTagFilter(index)"
            >
              {{ tagFilterLabels[filter] }}
            </TaoTag>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <TaoTag
              v-for="(person, index) in tagPeople"
              :key="person.id"
              tone="neutral"
              closable
              :close-label="tr(`Remove ${tagPersonNames[person.id]}`, `Убрать ${tagPersonNames[person.id]}`)"
              @close="removeTagPerson(index)"
            >
              <template #prefix>
                <TaoAvatar :name="tagPersonNames[person.id]" size="small" />
              </template>
              {{ tagPersonNames[person.id] }}
            </TaoTag>
          </div>
    
          <h3>{{ tr('An icon alone', 'Только иконка') }}</h3>
          <Tr>
            <template #en>
              <p>
                No text, only <code>#prefix</code>: the tag becomes a square of its height by itself. An icon in the default slot asks for
                <code>square</code>. It has no text, so give it an <code>aria-label</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Нет текста, только <code>#prefix</code>: тег сам становится квадратом своей высоты. Иконка в основном слоте просит
                <code>square</code>. Текста нет, поэтому нужен <code>aria-label</code>.
              </p>
            </template>
          </Tr>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <TaoTag tone="success" :aria-label="tr('Verified', 'Проверено')"><template #prefix><TaoIcon name="tao-check" /></template></TaoTag>
            <TaoTag tone="danger" :aria-label="tr('Blocked', 'Заблокировано')"><template #prefix><TaoIcon name="tao-alert-triangle" /></template></TaoTag>
            <TaoTag tone="neutral" flat square :aria-label="tr('Settings', 'Настройки')"><TaoIcon name="tao-settings" /></TaoTag>
            <TaoTag tone="info" :aria-label="tr('Info', 'Сведения')"><template #prefix><TaoIcon name="tao-info" /></template></TaoTag>
            <TaoTag tone="success"><template #prefix><TaoIcon name="tao-check" /></template>{{ tr('With text', 'С текстом') }}</TaoTag>
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoTag tone="success"&gt;{{ tr('Active', 'Активен') }}&lt;/TaoTag&gt;
&lt;TaoTag tone="success" flat&gt;{{ tr('Active', 'Активен') }}&lt;/TaoTag&gt;

&lt;TaoTag tone="neutral" closable close-label="Remove" @close="remove"&gt;
  &lt;template #close-icon&gt;&lt;TaoIcon name="close" /&gt;&lt;/template&gt;
  {{ tr('Moscow', 'Москва') }}
&lt;/TaoTag&gt;

&lt;TaoTag tone="neutral" closable @close="remove"&gt;
  &lt;template #prefix&gt;
    &lt;TaoAvatar name="{{ tr('Anna Kozlova', 'Анна Козлова') }}" size="small" /&gt;
  &lt;/template&gt;
  {{ tr('Anna Kozlova', 'Анна Козлова') }}
&lt;/TaoTag&gt;

&lt;TaoTag tone="success" aria-label="Verified"&gt;
  &lt;template #prefix&gt;&lt;TaoIcon name="tao-check" /&gt;&lt;/template&gt;
&lt;/TaoTag&gt;
&lt;TaoTag square aria-label="Settings"&gt;&lt;TaoIcon name="tao-settings" /&gt;&lt;/TaoTag&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
