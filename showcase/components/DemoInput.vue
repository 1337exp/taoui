<script setup>
import { ref } from 'vue'
import { TaoInput, TaoFormField, TaoInputGroup, TaoButton, toast } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoInput' })

const inputValue = ref('')
const searchQuery = ref('')
const amountText = ref('1490')
const siteHost = ref('taoui.dev')
const formEmail = ref('')
const formPassword = ref('')
const formSaving = ref(false)

function onDemoSubmit() {
  formSaving.value = true
  window.setTimeout(() => {
    formSaving.value = false
    toast().success().message('Сохранено')
  }, 700)
}
</script>

<template>
  <ShowcaseSection id="input" :tables="propTables['input']">
    <h2>TaoInput</h2>
          <p>Поле ввода с v-model. Иконка или единица — слоты <code>#prefix</code> / <code>#suffix</code> внутри рамки. Склейка снаружи — <code>TaoInputGroup</code>.</p>
          
          <div class="demo-stack">
            <TaoInput 
              v-model="inputValue" 
              label="Текстовое поле" 
              placeholder="Введите текст" 
            />
            
            <TaoInput 
              type="email" 
              label="Email" 
              placeholder="example@mail.com" 
            />
            
            <TaoInput 
              type="password" 
              label="Пароль" 
              placeholder="••••••••" 
            />
            
            <TaoInput 
              label="С ошибкой" 
              error 
              error-message="Некорректное значение" 
              model-value="Невалидное значение"
            />
            
            <TaoInput 
              label="Отключенное поле" 
              disabled 
              model-value="Нельзя редактировать"
            />
    
            <TaoFormField label="Поиск" hint="Иконка и крестик живут внутри поля">
              <TaoInput v-model="searchQuery" placeholder="Найти…">
                <template #prefix>
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.5" />
                    <path d="M10.5 10.5 14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                  </svg>
                </template>
                <template #suffix>
                  <button v-if="searchQuery" type="button" aria-label="Очистить" @click="searchQuery = ''">×</button>
                </template>
              </TaoInput>
            </TaoFormField>
    
            <TaoFormField label="Сумма">
              <TaoInput v-model="amountText" placeholder="0">
                <template #suffix>₽</template>
              </TaoInput>
            </TaoFormField>
    
            <TaoFormField label="Сайт" hint="https:// и кнопка — снаружи, это уже группа">
              <TaoInputGroup>
                <template #before>https://</template>
                <TaoInput v-model="siteHost" placeholder="example.com" />
                <template #after>
                  <TaoButton @click="toast().info().message('Проверяем ' + siteHost)">Проверить</TaoButton>
                </template>
              </TaoInputGroup>
            </TaoFormField>
          </div>
    
          <h3 class="carousel-heading">Форма и submit</h3>
          <p class="carousel-note">Отдельного TaoForm нет: обычный <code>&lt;form&gt;</code>, Enter в поле отправляет, кнопка с <code>type="submit"</code>. В SPA — <code>@submit.prevent</code>.</p>
          <form class="demo-stack" @submit.prevent="onDemoSubmit">
            <TaoFormField label="Email">
              <TaoInput v-model="formEmail" type="email" placeholder="you@mail.com" />
            </TaoFormField>
            <TaoFormField label="Пароль">
              <TaoInput v-model="formPassword" type="password" placeholder="••••••••" />
            </TaoFormField>
            <TaoButton type="submit" :loading="formSaving">Войти</TaoButton>
          </form>
    
          <div class="code-block">
            <pre><code>&lt;TaoInput v-model="q" placeholder="Найти…"&gt;
  &lt;template #prefix&gt;…&lt;/template&gt;
  &lt;template #suffix&gt;₽&lt;/template&gt;
&lt;/TaoInput&gt;

&lt;TaoInputGroup&gt;
  &lt;template #before&gt;https://&lt;/template&gt;
  &lt;TaoInput v-model="host" /&gt;
  &lt;template #after&gt;
    &lt;TaoButton&gt;Проверить&lt;/TaoButton&gt;
  &lt;/template&gt;
&lt;/TaoInputGroup&gt;

&lt;form @submit.prevent="onSave"&gt;
  &lt;TaoFormField label="Email"&gt;
    &lt;TaoInput v-model="email" type="email" /&gt;
  &lt;/TaoFormField&gt;
  &lt;TaoButton type="submit"&gt;Сохранить&lt;/TaoButton&gt;
&lt;/form&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
