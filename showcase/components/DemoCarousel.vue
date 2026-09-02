<script setup>
import { ref } from 'vue'
import { TaoCarousel } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCarousel' })

const carouselHero = ref(0)
const carouselPeek = ref(0)
const carouselStrip = ref(0)
const carouselBare = ref(0)
const carouselCustom = ref(0)
const carouselExample = [
  '<TaoCarousel :autoplay="4000" loop dots>',
  '  <article v-for="item in banners" :key="item.id" class="hero">',
  '    <strong>{{ item.title }}</strong>',
  '    <span>{{ item.text }}</span>',
  '  </article>',
  '</TaoCarousel>',
  '',
  '<TaoCarousel prev-label="Previous" next-label="Next">',
  '  <template #prev-icon><TaoIcon name="arrow-left" /></template>',
  '  <template #next-icon><TaoIcon name="arrow-right" /></template>',
  '  …',
  '</TaoCarousel>',
  '',
  '/* вид слайда — ваш article, не карусель */',
  '.hero {',
  '  display: flex;',
  '  flex-direction: column;',
  '  justify-content: flex-end;',
  '  gap: 8px;',
  '  min-height: 180px;',
  '  padding: 20px;',
  '  border-radius: var(--tao-radius-panel);',
  '  background: linear-gradient(135deg, var(--tao-color-accent-subtle), var(--tao-color-surface-sunken));',
  '}',
].join('\n')
const carouselBanners = [
  { id: 1, title: 'Осенняя коллекция', text: 'Новые фактуры и спокойные цвета' },
  { id: 2, title: 'Скидка 20%', text: 'На вторую пару обуви' },
  { id: 3, title: 'Только что поступило', text: 'Куртки Drift и рюкзаки Field' },
  { id: 4, title: 'Бесплатная доставка', text: 'От 5 000 ₽ по городу' },
]
const carouselProducts = [
  { id: 1, name: 'Nova', price: '8 990 ₽' },
  { id: 2, name: 'Drift', price: '12 400 ₽' },
  { id: 3, name: 'Field', price: '4 350 ₽' },
  { id: 4, name: 'Arc', price: '15 200 ₽' },
  { id: 5, name: 'Halo', price: '3 190 ₽' },
  { id: 6, name: 'Pike', price: '6 750 ₽' },
  { id: 7, name: 'Moss', price: '9 100 ₽' },
  { id: 8, name: 'Volt', price: '2 490 ₽' },
  { id: 9, name: 'Dune', price: '11 300 ₽' },
  { id: 10, name: 'Flint', price: '5 620 ₽' },
  { id: 11, name: 'Reef', price: '7 840 ₽' },
  { id: 12, name: 'Ash', price: '13 050 ₽' },
  { id: 13, name: 'Glow', price: '1 990 ₽' },
  { id: 14, name: 'Nori', price: '4 880 ₽' },
  { id: 15, name: 'Bolt', price: '10 200 ₽' },
  { id: 16, name: 'Yarn', price: '3 640 ₽' },
]
</script>

<template>
  <ShowcaseSection id="carousel" :tables="propTables['carousel']">
    <h2>TaoCarousel</h2>
          <p>
            Три режима одной ленты: целый слайд с автопрокруткой, карточка с краешком следующей,
            полоса из пяти квадратов. Стрелки и точки можно спрятать или подменить слотами.
          </p>
    
          <h3 class="carousel-heading">Целый слайд</h3>
          <p class="carousel-note">Каждые 4 секунды вперёд. Наведи курсор или сфокусируй — пауза. <code>loop</code> крутит по кругу. <code>dots</code> — сколько слайдов и где вы.</p>
          <TaoCarousel v-model="carouselHero" :autoplay="4000" loop dots aria-label="Баннеры">
            <article v-for="item in carouselBanners" :key="item.id" class="carousel-hero">
              <strong>{{ item.title }}</strong>
              <span>{{ item.text }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">Одна карточка + краешек</h3>
          <p class="carousel-note"><code>per-view="1"</code> и <code>peek</code> — видно, что справа ещё есть товар.</p>
          <TaoCarousel v-model="carouselPeek" :peek="72" aria-label="Карточка с краем">
            <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">Полоса из пяти</h3>
          <p class="carousel-note">Палец пролистывает пачку. Стрелки тоже прыгают на пять.</p>
          <TaoCarousel v-model="carouselStrip" :per-view="5" :peek="28" aria-label="Товары">
            <article v-for="item in carouselProducts" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">Без стрелок</h3>
          <p class="carousel-note">
            <code>:controls="false"</code> прячет обе. Пустой <code>#prev</code> или <code>#next</code> — только одну сторону.
            Здесь вместо стрелок — <code>dots</code>.
          </p>
          <TaoCarousel v-model="carouselBare" :peek="72" :controls="false" dots aria-label="Без стрелок">
            <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">Свои стрелки</h3>
          <p class="carousel-note">
            Слоты <code>#prev</code> / <code>#next</code> подменяют кнопки целиком. В слот приходят <code>go</code> и <code>disabled</code>.
          </p>
          <TaoCarousel v-model="carouselCustom" :peek="72" aria-label="Свои стрелки">
            <template #prev="{ go, disabled }">
              <button type="button" class="carousel-nav" :disabled="disabled" @click="go">назад</button>
            </template>
            <template #next="{ go, disabled }">
              <button type="button" class="carousel-nav" :disabled="disabled" @click="go">вперёд</button>
            </template>
            <article v-for="item in carouselProducts.slice(0, 8)" :key="'custom-' + item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <div class="code-block">
            <pre><code>{{ carouselExample }}</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.carousel-hero {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 8px;
  min-height: 180px;
  padding: 20px;
  border-radius: var(--tao-radius-panel);
  background: linear-gradient(135deg, var(--tao-color-accent-subtle) 0%, var(--tao-color-surface-sunken) 100%);
}

.carousel-hero span {
  color: var(--tao-color-text-muted);
  font-size: 14px;
}

.carousel-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.carousel-card__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  border-radius: var(--tao-radius-control);
  background: linear-gradient(135deg, var(--tao-color-accent-subtle) 0%, var(--tao-color-surface-sunken) 100%);
  color: var(--tao-color-text-muted);
  font-size: 22px;
  font-weight: 700;
}

.carousel-card span {
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.carousel-nav {
  margin: 0;
  padding: 8px 12px;
  border: 1px solid var(--tao-color-border-strong);
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-text);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.carousel-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
