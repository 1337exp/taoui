<script setup>
import { TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoButton' })

const buttonVariants = ['primary', 'secondary', 'ghost', 'text']
const buttonTones = ['accent', 'neutral', 'success', 'danger', 'warning', 'info']
const buttonSizes = ['small', 'medium', 'large']
</script>

<template>
  <ShowcaseSection id="button" :tables="propTables['button']">
    <h2>TaoButton</h2>
          <Tr>
            <template #en>
              <p>
                Shape — <code>variant</code>, colour — <code>tone</code>.
                The tone works on every variant: <code>variant="primary" tone="danger"</code> is the filled red one,
                <code>variant="text" tone="danger"</code> the red text one. Without a tone the button takes the theme accent.
              </p>
            </template>
            <template #ru>
              <p>
                Форма — <code>variant</code>, цвет — <code>tone</code>.
                Тон работает на любом варианте: <code>variant="primary" tone="danger"</code> — залитый красный,
                <code>variant="text" tone="danger"</code> — красный текстовый. Без тона кнопка берёт акцент темы.
              </p>
            </template>
          </Tr>
          
          <h3>{{ tr('Variants (variant)', 'Варианты (variant)') }}</h3>
          <div class="button-row">
            <TaoButton
              v-for="variant in buttonVariants"
              :key="variant"
              :variant="variant"
            >
              {{ variant }}
            </TaoButton>
          </div>
    
          <h3>{{ tr('Sizes (size)', 'Размеры (size)') }}</h3>
          <div class="button-row">
            <TaoButton
              v-for="size in buttonSizes"
              :key="size"
              :size="size"
              variant="primary"
            >
              {{ size }}
            </TaoButton>
          </div>
    
          <h3>{{ tr('Tone (tone) on every variant', 'Тон (tone) на каждом варианте') }}</h3>
          <div v-for="variant in buttonVariants" :key="variant" class="button-row" style="align-items: center;">
            <TaoButton v-for="tone in buttonTones" :key="tone" :variant="variant" :tone="tone">
              {{ tone }}
            </TaoButton>
          </div>
    
          <h3>{{ tr('States', 'Состояния') }}</h3>
          <div class="button-row">
            <TaoButton variant="primary" loading>Loading</TaoButton>
            <TaoButton variant="primary" disabled>Disabled</TaoButton>
            <TaoButton variant="primary" block>Block (100% width)</TaoButton>
          </div>
    
          <h3>{{ tr('With an icon', 'С иконкой') }}</h3>
          <div class="button-row">
            <TaoButton variant="primary" icon="tao-plus">{{ tr('Add', 'Добавить') }}</TaoButton>
            <TaoButton variant="secondary" icon-end="tao-chevron-right">{{ tr('Next', 'Далее') }}</TaoButton>
            <TaoButton variant="ghost" icon="tao-copy">{{ tr('Copy', 'Копировать') }}</TaoButton>
            <TaoButton variant="primary" icon="tao-plus" aria-label="Add" />
            <TaoButton variant="secondary" icon="tao-search" aria-label="Search" />
            <TaoButton variant="ghost" tone="danger" icon="tao-close" aria-label="Remove" />
          </div>

          <h3>{{ tr('With a shortcut (shortcut)', 'С клавишей (shortcut)') }}</h3>
          <Tr>
            <template #en><p><code>shortcut</code> shows the key at the end of the button and gives it as <code>aria-keyshortcuts</code>. It only shows the key: listening to it is the app's job. In a wide button the key goes to the far edge.</p></template>
            <template #ru><p><code>shortcut</code> показывает клавишу в конце кнопки и отдаёт её в <code>aria-keyshortcuts</code>. Только показывает: слушать клавишу — дело приложения. В широкой кнопке клавиша уходит к дальнему краю.</p></template>
          </Tr>
          <div class="button-row">
            <TaoButton icon="tao-plus" shortcut="N">{{ tr('New note', 'Новая заметка') }}</TaoButton>
            <TaoButton variant="secondary" icon="tao-search" shortcut="Ctrl+K">{{ tr('Search', 'Поиск') }}</TaoButton>
            <TaoButton variant="ghost" shortcut="Esc">{{ tr('Cancel', 'Отмена') }}</TaoButton>
          </div>
          <div style="max-width: 240px; margin-top: 12px">
            <TaoButton icon="tao-plus" shortcut="N" block size="large">{{ tr('New note', 'Новая заметка') }}</TaoButton>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoButton variant="primary" size="medium"&gt;
  {{ tr('Button', 'Кнопка') }}
&lt;/TaoButton&gt;

&lt;TaoButton variant="secondary" loading&gt;
  {{ tr('Loading...', 'Загрузка...') }}
&lt;/TaoButton&gt;

&lt;TaoButton variant="text" tone="danger"&gt;
  {{ tr('Delete', 'Удалить') }}
&lt;/TaoButton&gt;

&lt;TaoButton icon="tao-plus"&gt;{{ tr('Add', 'Добавить') }}&lt;/TaoButton&gt;

&lt;!-- {{ tr('only an icon: a square, and it needs aria-label', 'только иконка: квадрат, нужен aria-label') }} --&gt;
&lt;TaoButton icon="tao-close" aria-label="Close" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
