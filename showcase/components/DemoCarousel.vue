<script setup>
import { computed, ref } from 'vue'
import { TaoCarousel } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCarousel' })

const carouselHero = ref(0)
const carouselPeek = ref(0)
const carouselStrip = ref(0)
const carouselBare = ref(0)
const carouselCustom = ref(0)
const carouselExample = computed(() => [
  '<TaoCarousel :autoplay="4000" loop indicator="dots">',
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
  tr('/* the slide look is your article, not the carousel */', '/* вид слайда — ваш article, не карусель */'),
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
].join('\n'))
const carouselBanners = computed(() => [
  { id: 1, title: tr('Autumn collection', 'Осенняя коллекция'), text: tr('New textures and calm colours', 'Новые фактуры и спокойные цвета') },
  { id: 2, title: tr('20% off', 'Скидка 20%'), text: tr('On a second pair of shoes', 'На вторую пару обуви') },
  { id: 3, title: tr('Just arrived', 'Только что поступило'), text: tr('Drift jackets and Field backpacks', 'Куртки Drift и рюкзаки Field') },
  { id: 4, title: tr('Free delivery', 'Бесплатная доставка'), text: tr('From 5 000 ₽ within the city', 'От 5 000 ₽ по городу') },
])
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
          <Tr>
            <template #en>
              <p>
                Three modes of one strip: a whole slide with autoplay, a card with a peek of the next one,
                a row of five squares. Arrows and dots can be hidden or replaced with slots.
              </p>
            </template>
            <template #ru>
              <p>
                Три режима одной ленты: целый слайд с автопрокруткой, карточка с краешком следующей,
                полоса из пяти квадратов. Стрелки и точки можно спрятать или подменить слотами.
              </p>
            </template>
          </Tr>
    
          <h3 class="carousel-heading">{{ tr('A whole slide', 'Целый слайд') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">Moves forward every 4 seconds: the current bar fills up, and the slide changes when it is full. Hover — it pauses, leave — it runs again; tabbing onto the strip, touching and dragging pause it too, and so does the button on the right (autoplay that moves for more than 5 seconds must be stoppable). <code>loop</code> goes round in a circle. <code>indicator</code> — how many slides there are and where you are.</p></template>
            <template #ru><p class="carousel-note">Каждые 4 секунды вперёд: текущая полоска заполняется, по заполнении слайд меняется. Наведи курсор — пауза, убери — снова едет; Tab на ленту, касание и перетаскивание тоже ставят на паузу, как и кнопка справа (автодвижение дольше 5 секунд должно останавливаться). <code>loop</code> крутит по кругу. <code>indicator</code> — сколько слайдов и где вы.</p></template>
          </Tr>
          <TaoCarousel v-model="carouselHero" :autoplay="4000" loop indicator="bars" :aria-label="tr('Banners', 'Баннеры')">
            <article v-for="item in carouselBanners" :key="item.id" class="carousel-hero">
              <strong>{{ item.title }}</strong>
              <span>{{ item.text }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">{{ tr('Indicators: dots, bars, progress', 'Индикаторы: точки, полоски, прогресс') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">With <code>autoplay</code> the current mark is the clock: it fills over the interval. Without autoplay <code>progress</code> shows the position. The fill is a CSS animation, so the colour, the thickness and the speed are yours to restyle.</p></template>
            <template #ru><p class="carousel-note">С <code>autoplay</code> текущая метка и есть часы: она заполняется за интервал. Без autoplay <code>progress</code> показывает позицию. Заливка — CSS-анимация, поэтому цвет, толщину и скорость можно переопределить.</p></template>
          </Tr>
          <div v-for="kind in ['dots', 'bars', 'progress']" :key="kind" class="carousel-indicator-demo">
            <code>indicator="{{ kind }}"</code>
            <TaoCarousel :autoplay="3000" loop :controls="false" :indicator="kind" :aria-label="kind">
              <article v-for="item in carouselBanners" :key="item.id" class="carousel-hero">
                <strong>{{ item.title }}</strong>
                <span>{{ item.text }}</span>
              </article>
            </TaoCarousel>
          </div>
          <TaoCarousel :controls="false" indicator="progress" :aria-label="tr('Without autoplay', 'Без autoplay')">
            <article v-for="item in carouselBanners" :key="item.id" class="carousel-hero">
              <strong>{{ item.title }}</strong>
              <span>{{ tr('no autoplay: the bar is the position', 'без autoplay: полоска — это позиция') }}</span>
            </article>
          </TaoCarousel>

          <h3 class="carousel-heading">{{ tr('One card + a peek', 'Одна карточка + краешек') }}</h3>
          <Tr>
            <template #en><p class="carousel-note"><code>per-view="1"</code> and <code>peek</code> — you can see there is another product on the right.</p></template>
            <template #ru><p class="carousel-note"><code>per-view="1"</code> и <code>peek</code> — видно, что справа ещё есть товар.</p></template>
          </Tr>
          <TaoCarousel v-model="carouselPeek" :peek="72" :aria-label="tr('Card with a peek', 'Карточка с краем')">
            <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">{{ tr('A row of five', 'Полоса из пяти') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">A swipe turns a whole batch. The arrows jump by five too.</p></template>
            <template #ru><p class="carousel-note">Палец пролистывает пачку. Стрелки тоже прыгают на пять.</p></template>
          </Tr>
          <TaoCarousel v-model="carouselStrip" :per-view="5" :peek="28" :aria-label="tr('Products', 'Товары')">
            <article v-for="item in carouselProducts" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">{{ tr('No arrows', 'Без стрелок') }}</h3>
          <Tr>
            <template #en>
              <p class="carousel-note">
                <code>:controls="false"</code> hides both. An empty <code>#prev</code> or <code>#next</code> — one side only.
                Here <code>indicator="dots"</code> stands in for the arrows.
              </p>
            </template>
            <template #ru>
              <p class="carousel-note">
                <code>:controls="false"</code> прячет обе. Пустой <code>#prev</code> или <code>#next</code> — только одну сторону.
                Здесь вместо стрелок — <code>indicator="dots"</code>.
              </p>
            </template>
          </Tr>
          <TaoCarousel v-model="carouselBare" :peek="72" :controls="false" indicator="dots" :aria-label="tr('No arrows', 'Без стрелок')">
            <article v-for="item in carouselProducts.slice(0, 8)" :key="item.id" class="carousel-card">
              <div class="carousel-card__cover">{{ item.id }}</div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.price }}</span>
            </article>
          </TaoCarousel>
    
          <h3 class="carousel-heading">{{ tr('Your own arrows', 'Свои стрелки') }}</h3>
          <Tr>
            <template #en>
              <p class="carousel-note">
                The <code>#prev</code> / <code>#next</code> slots replace the buttons entirely. The slot receives <code>go</code> and <code>disabled</code>.
              </p>
            </template>
            <template #ru>
              <p class="carousel-note">
                Слоты <code>#prev</code> / <code>#next</code> подменяют кнопки целиком. В слот приходят <code>go</code> и <code>disabled</code>.
              </p>
            </template>
          </Tr>
          <TaoCarousel v-model="carouselCustom" :peek="72" :aria-label="tr('Your own arrows', 'Свои стрелки')">
            <template #prev="{ go, disabled }">
              <button type="button" class="carousel-nav" :disabled="disabled" @click="go">{{ tr('back', 'назад') }}</button>
            </template>
            <template #next="{ go, disabled }">
              <button type="button" class="carousel-nav" :disabled="disabled" @click="go">{{ tr('forward', 'вперёд') }}</button>
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

.carousel-indicator-demo {
  display: grid;
  /* minmax(0, …): the slide track scrolls inside, it must not widen the page / лента слайдов не расширяет страницу */
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  margin-bottom: 16px;
}

.carousel-indicator-demo code {
  color: var(--tao-color-text-muted);
  font-size: 12px;
}
</style>
