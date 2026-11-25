<script setup>
import { ref } from 'vue'
import { TaoShell } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoShell' })

const section = ref('inbox')
const project = ref('home')
const look = ref('drawer')
const clicks = ref(0)
const items = () => [
  { id: 'inbox', label: tr('Inbox', 'Входящие'), icon: 'tao-file', badge: 3 },
  { id: 'projects', label: tr('Projects', 'Проекты'), icon: 'tao-folder' },
  { id: 'settings', label: tr('Settings', 'Настройки'), icon: 'tao-settings' },
]
const projects = [
  { id: 'home', title: 'Home' },
  { id: 'work', title: 'Work' },
]
</script>

<template>
  <ShowcaseSection id="shell" :tables="propTables['shell']">
    <h2>TaoShell</h2>
    <Tr>
      <template #en>
        <p>
          The shell of an app in one component: the navigation (a side panel, a rail, a bar by its own width), the main action, the
          project the app works in, the language and the theme, and the page. On a phone, where the bar has no room for the project and
          the tools, they go up into a thin header by a container query. Bind it to <code>createKitPrefs</code> and the theme and the
          language are saved and applied by the product's one object. Give the parent the height of the window.
        </p>
      </template>
      <template #ru>
        <p>
          Оболочка приложения одним компонентом: навигация (боковая панель, рейка или нижняя панель по своей ширине), главное
          действие, проект, в котором работает приложение, язык и тема, и страница. На телефоне, где в нижней панели нет места для
          проекта и инструментов, они уходят в тонкую шапку по container query. Свяжите её с <code>createKitPrefs</code>, и тема и
          язык сохраняются и применяются одним объектом продукта. Дайте родителю высоту окна.
        </p>
      </template>
    </Tr>

    <div class="demo-shell-box">
      <TaoShell
        v-model="section"
        v-model:project="project"
        v-model:look="look"
        :items="items()"
        :projects="projects"
        :action="{ label: tr('New', 'Создать') }"
        :languages="['en', 'ru']"
        @action="clicks++"
      >
        <div class="demo-shell-page">
          <strong>{{ section }}</strong> · {{ project }} · {{ look }} · {{ tr('action clicks', 'нажатий действия') }}: {{ clicks }}
        </div>
      </TaoShell>
    </div>

    <div class="code-block">
      <pre><code>&lt;TaoShell v-model="section" v-model:project="project" :items="items" :projects="projects"
  :action="{ label: 'New' }" :languages="['en', 'ru']" :prefs="prefs" @action="create"&gt;
  &lt;RouterView /&gt;
&lt;/TaoShell&gt;

// {{ tr('the mode, the palette and the language of the product', 'режим, палитра и язык продукта') }}
const prefs = createKitPrefs({ key: 'myapp' })</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.demo-shell-box {
  position: relative;
  height: 380px;
  overflow: hidden;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-lg);
}

.demo-shell-page {
  padding: var(--tao-space-5);
}
</style>
