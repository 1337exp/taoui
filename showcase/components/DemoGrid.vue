<script setup>
import { TaoGrid, TaoGridItem, TaoCard } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
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
    <h2>TaoGrid / TaoGridItem</h2>
    <p>
      Плитки на CSS Grid, без JS и без masonry. <code>min</code> — сколько колонок влезет (каталог).
      <code>cols</code> — фиксированные колонки (bento). <code>TaoGridItem</code> с <code>col</code> /
      <code>row</code> — только для span; в каталоге карточки можно класть напрямую.
      Уже контейнера ~560px span сбрасывается в 1, <code>cols</code> складывается в одну колонку.
    </p>

    <h3>Каталог, min="220px"</h3>
    <p class="carousel-note">Сузь окно — колонок станет меньше. Карточки тянутся на ширину ячейки.</p>
    <TaoGrid min="220px">
      <TaoCard v-for="item in gridProducts" :key="item.id" :padding="12" :radius="12">
        <template #cover>
          <img class="product-card__photo" :src="stubPhoto(item.id)" :alt="item.title" />
        </template>
        <template #title>{{ item.title }}</template>
        <template #sub>{{ item.sub }}</template>
        <template #footer>{{ item.price }}</template>
      </TaoCard>
    </TaoGrid>

    <h3>cols="3" — ряд по самой высокой</h3>
    <p class="carousel-note">
      Разный объём текста не даёт «водопад»: сосед в ряду тянется. Настоящий masonry сюда не кладём.
    </p>
    <TaoGrid :cols="3">
      <TaoCard v-for="note in gridNotes" :key="note.id" :padding="12" :radius="12">
        <template #title>{{ note.title }}</template>
        <p>{{ note.text }}</p>
      </TaoCard>
    </TaoGrid>

    <h3>Bento, cols="4"</h3>
    <p class="carousel-note">
      <code>TaoGridItem</code> занимает несколько клеток. На узкой колонке span гасится.
    </p>
    <TaoGrid :cols="4">
      <TaoGridItem :col="2" :row="2">
        <TaoCard :padding="12" :radius="12">
          <template #cover>
            <img class="product-card__photo" :src="stubPhoto('1')" alt="Gel Shine" />
          </template>
          <template #title>Gel Shine</template>
          <template #sub>Топ 15 мл</template>
          <template #footer>490 ₽</template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem v-for="item in gridProducts.slice(1, 5)" :key="item.id">
        <TaoCard :padding="12" :radius="12">
          <template #title>{{ item.title }}</template>
          <template #sub>{{ item.sub }}</template>
          <template #footer>{{ item.price }}</template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem :col="2">
        <TaoCard :padding="12" :radius="12">
          <template #title>Matte Coat</template>
          <p>Широкая плитка на две колонки.</p>
        </TaoCard>
      </TaoGridItem>
    </TaoGrid>

    <div class="code-block">
      <pre><code>&lt;TaoGrid min="220px"&gt;
  &lt;TaoCard v-for="item in products" :key="item.id" :padding="12" :radius="12"&gt;
    &lt;template #cover&gt;&lt;img :src="item.photo" alt="" /&gt;&lt;/template&gt;
    &lt;template #title&gt;Gel Shine&lt;/template&gt;
    &lt;template #footer&gt;490 ₽&lt;/template&gt;
  &lt;/TaoCard&gt;
&lt;/TaoGrid&gt;

&lt;TaoGrid :cols="4"&gt;
  &lt;TaoGridItem :col="2" :row="2"&gt;…&lt;/TaoGridItem&gt;
  &lt;TaoGridItem&gt;…&lt;/TaoGridItem&gt;
&lt;/TaoGrid&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
:deep(.tao-card) {
  height: 100%;
}

:deep(.tao-card__title) {
  font-size: var(--tao-font-size-lg);
}

:deep(.tao-card__footer) {
  font-weight: 600;
}
</style>
