<script setup>
import { TaoCard } from '@tao/ui'
import GridPlayground from './GridPlayground.vue'
import ShowcaseSection from '../components/ShowcaseSection.vue'
import { propTables } from '../propTables.js'
import { stubPhoto } from '../stubPhoto.js'

defineOptions({ name: 'DemoGrid' })

const gridProducts = [
  { id: '1', title: 'Gel Shine', sub: 'Топ 15 мл', price: '490 ₽' },
  { id: '2', title: 'Rose Quartz', sub: 'Гель-лак', price: '320 ₽' },
  { id: '3', title: 'Noir', sub: 'База', price: '410 ₽' },
  { id: '4', title: 'Milk Foam', sub: 'Камуфляж', price: '380 ₽' },
  { id: '5', title: 'Citrus', sub: 'Гель-лак', price: '320 ₽' },
  { id: '6', title: 'Soft File', sub: 'Пилка 180/240', price: '90 ₽' },
  { id: '7', title: 'Brush Duo', sub: 'Кисти', price: '540 ₽' },
  { id: '8', title: 'Matte Coat', sub: 'Топ матовый', price: '490 ₽' },
]
const gridNotes = [
  { id: 'a', title: 'Коротко', text: 'Одна строка.' },
  {
    id: 'b',
    title: 'Длиннее',
    text: 'Несколько предложений, чтобы было видно: в сетке ряд выравнивается по самой высокой карточке. Это не masonry — дырки не заполняются.',
  },
  { id: 'c', title: 'Средне', text: 'Две-три строки текста в теле карточки.' },
  { id: 'd', title: 'Ещё одна', text: 'Четвёртая уезжает на следующий ряд.' },
]
</script>

<template>
  <ShowcaseSection id="grid" :tables="propTables['grid']">
    <h2>Grid (демо, не в пакете)</h2>
          <p>
            Черновик только для showcase: сетка карточек на CSS Grid, без JS и без masonry.
            <code>min</code> — сколько колонок влезет (как <code>auto-fill</code> / старый
            <code>wrapByWidth</code>). <code>cols</code> — фиксированное число колонок.
            Файл можно скопировать в проект; в kit это не едет.
          </p>
    
          <h3>Каталог, min="220px"</h3>
          <p class="carousel-note">Сузь окно — колонок станет меньше. Карточки тянутся на ширину ячейки.</p>
          <GridPlayground min="220px">
            <TaoCard v-for="item in gridProducts" :key="item.id" :padding="12" :radius="12">
              <template #cover>
                <img class="product-card__photo" :src="stubPhoto(item.id)" :alt="item.title" />
              </template>
              <template #title>{{ item.title }}</template>
              <template #sub>{{ item.sub }}</template>
              <template #footer>{{ item.price }}</template>
            </TaoCard>
          </GridPlayground>
    
          <h3>cols="3" — ряд по самой высокой</h3>
          <p class="carousel-note">
            Разный объём текста не даёт «водопад»: сосед в ряду тянется. Настоящий masonry сюда не кладём.
          </p>
          <GridPlayground :cols="3">
            <TaoCard v-for="note in gridNotes" :key="note.id" :padding="12" :radius="12">
              <template #title>{{ note.title }}</template>
              <p>{{ note.text }}</p>
            </TaoCard>
          </GridPlayground>
    
          <div class="code-block">
            <pre><code>&lt;GridPlayground min="220px"&gt;
      &lt;TaoCard v-for="item in products" :key="item.id" :padding="12" :radius="12"&gt;
        &lt;template #cover&gt;&lt;img :src="item.photo" alt="" /&gt;&lt;/template&gt;
        &lt;template #title&gt;Gel Shine&lt;/template&gt;
        &lt;template #footer&gt;490 ₽&lt;/template&gt;
      &lt;/TaoCard&gt;
    &lt;/GridPlayground&gt;
    
    &lt;GridPlayground :cols="3"&gt;…&lt;/GridPlayground&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
:deep(.tao-card__title) {
  font-size: 16px;
}

:deep(.tao-card__footer) {
  font-weight: 600;
}
</style>
