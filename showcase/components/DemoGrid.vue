<script setup>
import { computed } from 'vue'
import { TaoGrid, TaoGridItem, TaoCard } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'
import { stubPhoto } from '../stubPhoto.js'

defineOptions({ name: 'DemoGrid' })

const gridProducts = computed(() => [
  { id: '1', title: 'Gel Shine', sub: tr('Top coat 15 ml', 'Топ 15 мл'), price: '490 ₽' },
  { id: '2', title: 'Rose Quartz', sub: tr('Gel polish', 'Гель-лак'), price: '320 ₽' },
  { id: '3', title: 'Noir', sub: tr('Base', 'База'), price: '410 ₽' },
  { id: '4', title: 'Milk Foam', sub: tr('Camouflage', 'Камуфляж'), price: '380 ₽' },
  { id: '5', title: 'Citrus', sub: tr('Gel polish', 'Гель-лак'), price: '320 ₽' },
  { id: '6', title: 'Soft File', sub: tr('Nail file 180/240', 'Пилка 180/240'), price: '90 ₽' },
  { id: '7', title: 'Brush Duo', sub: tr('Brushes', 'Кисти'), price: '540 ₽' },
  { id: '8', title: 'Matte Coat', sub: tr('Matte top coat', 'Топ матовый'), price: '490 ₽' },
])
const gridNotes = computed(() => [
  { id: 'a', title: tr('Short', 'Коротко'), text: tr('A single line.', 'Одна строка.') },
  {
    id: 'b',
    title: tr('Longer', 'Длиннее'),
    text: tr(
      'Several sentences, so you can see that in a grid the row is levelled to the tallest card. This is not masonry — gaps are not filled.',
      'Несколько предложений, чтобы было видно: в сетке ряд выравнивается по самой высокой карточке. Это не masonry — дырки не заполняются.',
    ),
  },
  { id: 'c', title: tr('Medium', 'Средне'), text: tr('Two or three lines of text in the card body.', 'Две-три строки текста в теле карточки.') },
  { id: 'd', title: tr('One more', 'Ещё одна'), text: tr('The fourth one moves to the next row.', 'Четвёртая уезжает на следующий ряд.') },
])
</script>

<template>
  <ShowcaseSection id="grid" :tables="propTables['grid']">
    <h2>TaoGrid / TaoGridItem</h2>
    <Tr>
      <template #en>
        <p>
          Tiles on CSS Grid, with no JS and no masonry. <code>min</code> — how many columns fit (a catalogue).
          <code>cols</code> — fixed columns (bento). <code>TaoGridItem</code> with <code>col</code> /
          <code>row</code> is only for spans; in a catalogue you can put cards in directly.
          Below a container width of ~560px a span resets to 1, and <code>cols</code> collapses into one column.
        </p>
      </template>
      <template #ru>
        <p>
          Плитки на CSS Grid, без JS и без masonry. <code>min</code> — сколько колонок влезет (каталог).
          <code>cols</code> — фиксированные колонки (bento). <code>TaoGridItem</code> с <code>col</code> /
          <code>row</code> — только для span; в каталоге карточки можно класть напрямую.
          Уже контейнера ~560px span сбрасывается в 1, <code>cols</code> складывается в одну колонку.
        </p>
      </template>
    </Tr>

    <h3>{{ tr('Catalogue', 'Каталог') }}, min="220px"</h3>
    <Tr>
      <template #en><p class="carousel-note">Narrow the window — there will be fewer columns. The cards stretch to the cell width.</p></template>
      <template #ru><p class="carousel-note">Сузь окно — колонок станет меньше. Карточки тянутся на ширину ячейки.</p></template>
    </Tr>
    <TaoGrid min="220px">
      <TaoCard v-for="item in gridProducts" :key="item.id" :padding="12" :radius="12">
        <template #media>
          <img class="product-card__photo" :src="stubPhoto(item.id)" :alt="item.title" />
        </template>
        <template #title>{{ item.title }}</template>
        <template #sub>{{ item.sub }}</template>
        <template #footer>{{ item.price }}</template>
      </TaoCard>
    </TaoGrid>

    <h3>cols="3" — {{ tr('the row follows the tallest', 'ряд по самой высокой') }}</h3>
    <Tr>
      <template #en>
        <p class="carousel-note">
          Different amounts of text do not produce a “waterfall”: the neighbour in the row stretches. We do not put real masonry here.
        </p>
      </template>
      <template #ru>
        <p class="carousel-note">
          Разный объём текста не даёт «водопад»: сосед в ряду тянется. Настоящий masonry сюда не кладём.
        </p>
      </template>
    </Tr>
    <TaoGrid :cols="3">
      <TaoCard v-for="note in gridNotes" :key="note.id" :padding="12" :radius="12">
        <template #title>{{ note.title }}</template>
        <p>{{ note.text }}</p>
      </TaoCard>
    </TaoGrid>

    <h3>Bento, cols="4"</h3>
    <Tr>
      <template #en>
        <p class="carousel-note">
          <code>TaoGridItem</code> takes several cells. In a narrow column the span is dropped.
        </p>
      </template>
      <template #ru>
        <p class="carousel-note">
          <code>TaoGridItem</code> занимает несколько клеток. На узкой колонке span гасится.
        </p>
      </template>
    </Tr>
    <TaoGrid :cols="4">
      <TaoGridItem :col="2" :row="2">
        <TaoCard :padding="12" :radius="12">
          <template #media>
            <img class="product-card__photo" :src="stubPhoto('1')" alt="Gel Shine" />
          </template>
          <template #title>Gel Shine</template>
          <template #sub>{{ tr('Top coat 15 ml', 'Топ 15 мл') }}</template>
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
          <p>{{ tr('A wide tile spanning two columns.', 'Широкая плитка на две колонки.') }}</p>
        </TaoCard>
      </TaoGridItem>
    </TaoGrid>

    <h3>{{ tr('Mosaic: cover / fill / gradient at the bottom', 'Мозаика: обложка / заливка / градиент снизу') }}</h3>
    <Tr>
      <template #en>
        <p class="carousel-note">
          On the left a tall A, top right a wide D, under it four cells, at the bottom two 50/50 blocks.
          The “shadow” on the big A is <code>#overlay</code> + <code>mosaic-mega-gradient</code> (from 35%).
          The four small ones have <code>mosaic-tile-gradient</code> (from 55%). Tiles use <code>flush</code>.
          The bottom left one is a fill like <code>mosaic-stigma</code>.
        </p>
      </template>
      <template #ru>
        <p class="carousel-note">
          Слева высокий A, справа сверху широкий D, под ним четыре клетки, внизу два блока 50/50.
          «Тень» на большом A — <code>#overlay</code> + <code>mosaic-mega-gradient</code> (с 35%).
          У четырёх мелких — <code>mosaic-tile-gradient</code> (с 55%). Плитки через <code>flush</code>.
          Нижний левый — заливка как <code>mosaic-stigma</code>.
        </p>
      </template>
    </Tr>
    <TaoGrid class="mosaic" :cols="4" gap="12px">
      <TaoGridItem :col="2" :row="3">
        <TaoCard flush :radius="6">
          <template #media>
            <img :src="stubPhoto('A', '#5c5346')" alt="" />
          </template>
          <template #overlay>
            <div class="mosaic-mega-gradient" aria-hidden="true" />
            <span class="mosaic-caption">North Paper Mill</span>
          </template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem :col="2">
        <TaoCard flush :radius="6">
          <template #media>
            <img :src="stubPhoto('D', '#4a4558')" alt="" />
          </template>
          <template #overlay>
            <span class="mosaic-caption">Glass Harbor</span>
          </template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem>
        <TaoCard flush :radius="6">
          <template #media>
            <img :src="stubPhoto('B', '#6a4a3a')" alt="" />
          </template>
          <template #overlay>
            <div class="mosaic-tile-gradient" aria-hidden="true" />
            <span class="mosaic-caption">Quiet Kettle</span>
          </template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem>
        <TaoCard flush :radius="6">
          <div class="mosaic-fill mosaic-fill--compact mosaic-fill--gold">
            <div class="mosaic-tile-gradient" aria-hidden="true" />
            <span>PR Breaks</span>
            <strong>854.6K</strong>
          </div>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem>
        <TaoCard flush :radius="6">
          <div class="mosaic-fill mosaic-fill--compact mosaic-fill--crimson">
            <div class="mosaic-tile-gradient" aria-hidden="true" />
            <span>HEX</span>
            <strong>Shuffle</strong>
          </div>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem>
        <TaoCard flush :radius="6">
          <template #media>
            <img :src="stubPhoto('C', '#3f4a55')" alt="" />
          </template>
          <template #overlay>
            <div class="mosaic-tile-gradient" aria-hidden="true" />
            <span class="mosaic-caption">Second Floor</span>
          </template>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem :col="2">
        <TaoCard flush :radius="6">
          <div class="mosaic-fill mosaic-stigma">
            <span>Osaka</span>
            <strong>Est. 2019</strong>
          </div>
        </TaoCard>
      </TaoGridItem>
      <TaoGridItem :col="2">
        <TaoCard flush :radius="6">
          <div class="mosaic-fill mosaic-fill--champagne">
            <span>Spotify</span>
            <strong>Listen ↗</strong>
          </div>
        </TaoCard>
      </TaoGridItem>
    </TaoGrid>

    <div class="code-block">
      <pre><code>&lt;TaoGrid min="220px"&gt;
  &lt;TaoCard v-for="item in products" :key="item.id" :padding="12" :radius="12"&gt;
    &lt;template #media&gt;&lt;img :src="item.photo" alt="" /&gt;&lt;/template&gt;
    &lt;template #title&gt;Gel Shine&lt;/template&gt;
    &lt;template #footer&gt;490 ₽&lt;/template&gt;
  &lt;/TaoCard&gt;
&lt;/TaoGrid&gt;

&lt;TaoGrid :cols="4"&gt;
  &lt;TaoGridItem :col="2" :row="2"&gt;…&lt;/TaoGridItem&gt;
  &lt;TaoGridItem&gt;…&lt;/TaoGridItem&gt;
&lt;/TaoGrid&gt;

&lt;TaoCard flush :radius="6"&gt;
  &lt;template #media&gt;&lt;img src="cover.jpg" alt="" /&gt;&lt;/template&gt;
  &lt;template #overlay&gt;
    &lt;div class="mosaic-mega-gradient" /&gt;
    &lt;span class="mosaic-caption"&gt;North Paper Mill&lt;/span&gt;
  &lt;/template&gt;
&lt;/TaoCard&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
:deep(.tao-card__title) {
  font-size: var(--tao-font-size-lg);
}

:deep(.tao-card__footer) {
  font-weight: 600;
}

.mosaic {
  grid-auto-rows: unset;
  grid-template-rows: 130px 130px 130px 270px;
}

@media (max-width: 700px) {
  .mosaic {
    grid-template-rows: none;
    grid-auto-rows: minmax(140px, auto);
  }
}

.mosaic-caption {
  position: absolute;
  z-index: 1;
  right: 12px;
  bottom: 10px;
  left: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.mosaic-mega-gradient,
.mosaic-tile-gradient {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.mosaic-mega-gradient {
  background: linear-gradient(180deg, transparent 35%, rgb(0 0 0 / 0.92));
}

.mosaic-tile-gradient {
  background: linear-gradient(180deg, transparent 55%, rgb(0 0 0 / 0.92));
}

.mosaic-fill {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 0;
  width: 100%;
  padding: 14px 16px;
  overflow: hidden;
}

.mosaic-fill span,
.mosaic-fill strong {
  position: relative;
  z-index: 1;
}

.mosaic-fill span {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.75;
}

.mosaic-fill strong {
  margin-top: 4px;
  font-size: clamp(14px, 2.4vw, 22px);
  font-weight: 700;
  line-height: 1.1;
}

.mosaic-fill--compact {
  padding: 8px 12px;
}

.mosaic-fill--compact strong {
  margin-top: 2px;
  font-size: clamp(12px, 1.8vw, 16px);
}

.mosaic-stigma {
  justify-content: space-between;
  padding: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, oklch(0.2 0.12 22) 0%, var(--tao-color-bg) 100%);
  color: var(--tao-color-text);
}

.mosaic-fill--gold {
  background: color-mix(in srgb, var(--tao-color-warning) 82%, #1a1408);
  color: #fff;
}

.mosaic-fill--crimson {
  background: color-mix(in srgb, var(--tao-color-danger) 78%, #140808);
  color: #fff;
}

.mosaic-fill--champagne {
  background: color-mix(in srgb, var(--tao-color-accent) 28%, var(--tao-color-surface-raised));
  color: var(--tao-color-text-strong);
}
</style>
