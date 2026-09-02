<script setup>
import { TaoButton } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoButton' })

const buttonVariants = ['primary', 'secondary', 'ghost', 'text', 'danger']
const buttonTones = ['danger', 'success', 'warning', 'info']
const buttonSizes = ['small', 'medium', 'large']
</script>

<template>
  <ShowcaseSection id="button" :tables="propTables['button']">
    <h2>TaoButton</h2>
          <p>
            Форма — <code>variant</code>, цвет — <code>tone</code>.
            Красная текстовая кнопка: <code>variant="text" tone="danger"</code>, не <code>:deep</code>.
            Залитый красный — по-прежнему <code>variant="danger"</code>.
          </p>
          
          <h3>Варианты (variant)</h3>
          <div class="button-row">
            <TaoButton
              v-for="variant in buttonVariants"
              :key="variant"
              :variant="variant"
            >
              {{ variant }}
            </TaoButton>
          </div>
    
          <h3>Размеры (size)</h3>
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
    
          <h3>Текст и тон</h3>
          <div class="button-row" style="align-items: center;">
            <TaoButton variant="text">Отмена</TaoButton>
            <TaoButton
              v-for="tone in buttonTones"
              :key="tone"
              variant="text"
              :tone="tone"
            >
              {{ tone }}
            </TaoButton>
            <TaoButton variant="ghost" tone="danger">Удалить</TaoButton>
          </div>
    
          <h3>Состояния</h3>
          <div class="button-row">
            <TaoButton variant="primary" loading>Loading</TaoButton>
            <TaoButton variant="primary" disabled>Disabled</TaoButton>
            <TaoButton variant="primary" block>Block (100% width)</TaoButton>
          </div>
    
          <h3>С иконкой</h3>
          <div class="button-row">
            <TaoButton variant="primary" icon="★">С иконкой</TaoButton>
            <TaoButton variant="secondary" icon="⚡">Действие</TaoButton>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoButton variant="primary" size="medium"&gt;
      Кнопка
    &lt;/TaoButton&gt;
    
    &lt;TaoButton variant="secondary" loading&gt;
      Загрузка...
    &lt;/TaoButton&gt;
    
    &lt;TaoButton variant="text" tone="danger"&gt;
      Удалить
    &lt;/TaoButton&gt;
    
    &lt;TaoButton variant="primary" icon="★"&gt;
      С иконкой
    &lt;/TaoButton&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
