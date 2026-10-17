<script setup>
import { computed, ref } from 'vue'
import { TaoInput, TaoFormField, TaoInputGroup, TaoButton, TaoSelect, TaoInputNumber, TaoDate, TaoSegmented, TaoSegmentedOption, TaoCheckbox, TaoSwitch, TaoRadio, TaoTag, TaoTabs, TaoPagination, TaoSlider, toast } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoInput' })

const inputValue = ref('')
const searchQuery = ref('')
const amountText = ref('1490')
const siteHost = ref('taoui.dev')
const formEmail = ref('')
const formPassword = ref('')
const formSaving = ref(false)

const sizes = ['small', 'medium', 'large']
const sizeCities = computed(() => [
  { value: 'msk', label: tr('Moscow', 'Москва') },
  { value: 'spb', label: tr('Saint Petersburg', 'Санкт-Петербург') },
])
const sizeModel = ref({
  small: { text: '', city: 'msk', count: 2, date: null, view: 'list', check: true, on: true, pick: 'a', tab: 'one', page: 3, level: 40 },
  medium: { text: '', city: 'msk', count: 2, date: null, view: 'list', check: true, on: true, pick: 'a', tab: 'one', page: 3, level: 40 },
  large: { text: '', city: 'msk', count: 2, date: null, view: 'list', check: true, on: true, pick: 'a', tab: 'one', page: 3, level: 40 },
})
const groupHost = ref('taoui.dev')
const sizeTabs = computed(() => [
  { value: 'one', label: tr('Overview', 'Обзор') },
  { value: 'two', label: tr('Details', 'Детали') },
])

function onDemoSubmit() {
  formSaving.value = true
  window.setTimeout(() => {
    formSaving.value = false
    toast().success().message(tr('Saved', 'Сохранено'))
  }, 700)
}
</script>

<template>
  <ShowcaseSection id="input" :tables="propTables['input']">
    <h2>TaoInput</h2>
          <Tr>
            <template #en><p>An input with v-model. An icon or a unit — the <code>#prefix</code> / <code>#suffix</code> slots inside the frame. Gluing things on the outside — <code>TaoInputGroup</code>.</p></template>
            <template #ru><p>Поле ввода с v-model. Иконка или единица — слоты <code>#prefix</code> / <code>#suffix</code> внутри рамки. Склейка снаружи — <code>TaoInputGroup</code>.</p></template>
          </Tr>
          
          <div class="demo-stack">
            <TaoFormField :label="tr('Text field', 'Текстовое поле')">
              <TaoInput v-model="inputValue" :placeholder="tr('Enter text', 'Введите текст')" />
            </TaoFormField>

            <TaoFormField label="Email">
              <TaoInput type="email" placeholder="example@mail.com" />
            </TaoFormField>

            <TaoFormField :label="tr('Password', 'Пароль')">
              <TaoInput type="password" placeholder="••••••••" />
            </TaoFormField>

            <TaoFormField :label="tr('With an error', 'С ошибкой')" :error="tr('Invalid value', 'Некорректное значение')">
              <TaoInput :model-value="tr('Not a valid value', 'Невалидное значение')" />
            </TaoFormField>

            <TaoFormField :label="tr('Disabled field', 'Отключенное поле')">
              <TaoInput disabled :model-value="tr('Cannot be edited', 'Нельзя редактировать')" />
            </TaoFormField>

            <TaoFormField :label="tr('Search', 'Поиск')" :hint="tr('The icon and the cross live inside the field', 'Иконка и крестик живут внутри поля')">
              <TaoInput v-model="searchQuery" :placeholder="tr('Find…', 'Найти…')">
                <template #prefix>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
                    <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </template>
                <template #suffix>
                  <button v-if="searchQuery" type="button" :aria-label="tr('Clear', 'Очистить')" @click="searchQuery = ''">×</button>
                </template>
              </TaoInput>
            </TaoFormField>
    
            <TaoFormField :label="tr('Amount', 'Сумма')">
              <TaoInput v-model="amountText" placeholder="0">
                <template #suffix>₽</template>
              </TaoInput>
            </TaoFormField>
    
            <TaoFormField :label="tr('Website', 'Сайт')" :hint="tr('https:// and the button are outside — that is already a group', 'https:// и кнопка — снаружи, это уже группа')">
              <TaoInputGroup>
                <template #before>https://</template>
                <TaoInput v-model="siteHost" placeholder="example.com" />
                <template #after>
                  <TaoButton @click="toast().info().message(tr('Checking ', 'Проверяем ') + siteHost)">{{ tr('Check', 'Проверить') }}</TaoButton>
                </template>
              </TaoInputGroup>
            </TaoFormField>
          </div>
    
          <h3 class="carousel-heading">{{ tr('Sizes (size)', 'Размеры (size)') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">One <code>small</code> / <code>medium</code> / <code>large</code> scale for buttons and fields — everything in a row has the same height. Without <code>size</code> a control takes the size of its ancestors: the <code>tao-size-*</code> class on any wrapper, or <code>size</code> on TaoFormField / TaoInputGroup. Below, the size is set once — with a class on the row.</p></template>
            <template #ru><p class="carousel-note">Одна шкала <code>small</code> / <code>medium</code> / <code>large</code> для кнопок и полей — в одном ряду всё одной высоты. Без <code>size</code> контрол берёт размер предков: класс <code>tao-size-*</code> на любой обёртке или <code>size</code> у TaoFormField / TaoInputGroup. Ниже размер задан один раз — классом на строке.</p></template>
          </Tr>
          <div class="demo-stack">
            <div
              v-for="s in sizes"
              :key="s"
              :class="`tao-size-${s}`"
              style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center"
            >
              <div style="width: 160px"><TaoInput v-model="sizeModel[s].text" :placeholder="s" /></div>
              <div style="width: 150px"><TaoSelect v-model="sizeModel[s].city" :options="sizeCities" :clearable="false" /></div>
              <div style="width: 110px"><TaoInputNumber v-model="sizeModel[s].count" :min="0" /></div>
              <div style="width: 150px"><TaoDate v-model="sizeModel[s].date" /></div>
              <TaoSegmented v-model="sizeModel[s].view">
                <TaoSegmentedOption value="list" label="List" />
                <TaoSegmentedOption value="grid" label="Grid" />
              </TaoSegmented>
              <TaoButton>Button</TaoButton>
              <TaoCheckbox v-model="sizeModel[s].check" label="Checkbox" />
              <TaoRadio v-model="sizeModel[s].pick" value="a" label="Radio" />
              <TaoSwitch v-model="sizeModel[s].on" label="Switch" />
              <TaoTag tone="info">tag</TaoTag>
              <TaoTag tone="neutral" closable>closable</TaoTag>
              <div style="width: 100%"><TaoTabs v-model="sizeModel[s].tab" :items="sizeTabs" /></div>
              <div style="width: 100%"><TaoPagination v-model:page="sizeModel[s].page" :total="120" :show-total="false" /></div>
              <div style="width: 100%"><TaoSlider v-model="sizeModel[s].level" /></div>
            </div>
            <TaoInputGroup size="small">
              <template #before>https://</template>
              <TaoInput v-model="groupHost" />
              <template #after>
                <TaoButton>small group</TaoButton>
              </template>
            </TaoInputGroup>
          </div>

          <h3 class="carousel-heading">{{ tr('Form and submit', 'Форма и submit') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">There is no separate TaoForm: a plain <code>&lt;form&gt;</code>, Enter in a field submits, the button has <code>type="submit"</code>. In an SPA — <code>@submit.prevent</code>.</p></template>
            <template #ru><p class="carousel-note">Отдельного TaoForm нет: обычный <code>&lt;form&gt;</code>, Enter в поле отправляет, кнопка с <code>type="submit"</code>. В SPA — <code>@submit.prevent</code>.</p></template>
          </Tr>
          <form class="demo-stack" @submit.prevent="onDemoSubmit">
            <TaoFormField label="Email">
              <TaoInput v-model="formEmail" type="email" placeholder="you@mail.com" />
            </TaoFormField>
            <TaoFormField :label="tr('Password', 'Пароль')">
              <TaoInput v-model="formPassword" type="password" placeholder="••••••••" />
            </TaoFormField>
            <TaoButton type="submit" :loading="formSaving">{{ tr('Sign in', 'Войти') }}</TaoButton>
          </form>
    
          <div class="code-block">
            <pre><code>&lt;TaoInput v-model="q" placeholder="{{ tr('Find…', 'Найти…') }}"&gt;
  &lt;template #prefix&gt;…&lt;/template&gt;
  &lt;template #suffix&gt;₽&lt;/template&gt;
&lt;/TaoInput&gt;

&lt;TaoInputGroup&gt;
  &lt;template #before&gt;https://&lt;/template&gt;
  &lt;TaoInput v-model="host" /&gt;
  &lt;template #after&gt;
    &lt;TaoButton&gt;{{ tr('Check', 'Проверить') }}&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoInputGroup&gt;

&lt;!-- {{ tr('one size for a whole block', 'один размер на весь блок') }} --&gt;
&lt;div class="tao-size-small"&gt;
  &lt;TaoInput v-model="q" /&gt;
  &lt;TaoButton&gt;{{ tr('Find', 'Найти') }}&lt;/TaoButton&gt;
&lt;/div&gt;

&lt;TaoInputGroup size="large"&gt;…&lt;/TaoInputGroup&gt;
&lt;TaoInput size="small" /&gt;

&lt;form @submit.prevent="onSave"&gt;
  &lt;TaoFormField label="Email"&gt;
    &lt;TaoInput v-model="email" type="email" /&gt;
  &lt;/TaoFormField&gt;
  &lt;TaoButton type="submit"&gt;{{ tr('Save', 'Сохранить') }}&lt;/TaoButton&gt;
&lt;/form&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
