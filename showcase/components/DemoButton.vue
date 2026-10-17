<script setup>
import { TaoButton } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoButton' })

const buttonVariants = ['primary', 'secondary', 'ghost', 'text', 'danger']
const buttonTones = ['danger', 'success', 'warning', 'info']
const buttonSizes = ['small', 'medium', 'large']
</script>

<template>
  <ShowcaseSection id="button" :tables="propTables['button']">
    <h2>TaoButton</h2>
          <Tr>
            <template #en>
              <p>
                Shape — <code>variant</code>, colour — <code>tone</code>.
                A red text button: <code>variant="text" tone="danger"</code>, not <code>:deep</code>.
                The filled red one is still <code>variant="danger"</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Форма — <code>variant</code>, цвет — <code>tone</code>.
                Красная текстовая кнопка: <code>variant="text" tone="danger"</code>, не <code>:deep</code>.
                Залитый красный — по-прежнему <code>variant="danger"</code>.
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
    
          <h3>{{ tr('Text and tone', 'Текст и тон') }}</h3>
          <div class="button-row" style="align-items: center;">
            <TaoButton variant="text">{{ tr('Cancel', 'Отмена') }}</TaoButton>
            <TaoButton
              v-for="tone in buttonTones"
              :key="tone"
              variant="text"
              :tone="tone"
            >
              {{ tone }}
            </TaoButton>
            <TaoButton variant="ghost" tone="danger">{{ tr('Delete', 'Удалить') }}</TaoButton>
          </div>
    
          <h3>{{ tr('States', 'Состояния') }}</h3>
          <div class="button-row">
            <TaoButton variant="primary" loading>Loading</TaoButton>
            <TaoButton variant="primary" disabled>Disabled</TaoButton>
            <TaoButton variant="primary" block>Block (100% width)</TaoButton>
          </div>
    
          <h3>{{ tr('With an icon', 'С иконкой') }}</h3>
          <div class="button-row">
            <TaoButton variant="primary" icon="★">{{ tr('With an icon', 'С иконкой') }}</TaoButton>
            <TaoButton variant="secondary" icon="⚡">{{ tr('Action', 'Действие') }}</TaoButton>
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

&lt;TaoButton variant="primary" icon="★"&gt;
  {{ tr('With an icon', 'С иконкой') }}
&lt;/TaoButton&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
