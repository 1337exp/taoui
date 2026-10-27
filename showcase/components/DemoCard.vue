<script setup>
import { ref } from 'vue'
import { TaoCard, TaoButton, TaoCarousel, TaoTag } from '@1337exp/taoui'
import { stubPhoto } from '../stubPhoto.js'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCard' })

const cardPhotos = [stubPhoto('1'), stubPhoto('2'), stubPhoto('3')]
const cardGallery = ref(0)
const closed = ref(false)
</script>

<template>
  <ShowcaseSection id="card" :tables="propTables['card']">
    <h2>TaoCard</h2>
          <Tr>
            <template #en>
              <p>
                A card with media / header / title / footer slots and a corner. The media is any content: a photo or a carousel; the corner takes a tag or a menu button, <code>closable</code> adds a cross.
                The <code>hover</code> prop gives an accent outline on hover — it is off for the products below.
                For a tile in a grid — <code>flush</code> and the <code>#overlay</code> slot (a gradient over the photo).
              </p>
            </template>
            <template #ru>
              <p>
                Карточка со слотами media / header / title / footer и углом. Media — любой контент: фото или карусель; в угол — тег или кнопка меню, <code>closable</code> добавляет крестик.
                Проп <code>hover</code> даёт обводку акцентом при наведении — у товаров ниже он выключен.
                Для плитки в сетке — <code>flush</code> и слот <code>#overlay</code> (градиент поверх фото).
              </p>
            </template>
          </Tr>
          
          <TaoCard :padding="20" :radius="12">
            <template #media>
              <div class="card-cover"></div>
            </template>
            <template #header>
              <h3 style="margin: 0;">{{ tr('Card title', 'Заголовок карточки') }}</h3>
            </template>
            <p>{{ tr('The main content of the card. Put a description, an image or any other content here.', 'Основное содержимое карточки. Здесь можно разместить описание, изображение или любой другой контент.') }}</p>
            <template #footer>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <TaoButton size="small" variant="secondary">{{ tr('Cancel', 'Отмена') }}</TaoButton>
                <TaoButton size="small" variant="primary">{{ tr('Action', 'Действие') }}</TaoButton>
              </div>
            </template>
          </TaoCard>
    
          <h3>{{ tr('Corner and closable', 'Угол и closable') }}</h3>
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));">
            <TaoCard v-if="!closed">
              <template #corner><TaoTag tone="info">{{ tr('new', 'новое') }}</TaoTag></template>
              <template #title>{{ tr('A tag in the corner', 'Тег в углу') }}</template>
              <template #sub>{{ tr('The title keeps out of its way', 'Заголовок обходит его') }}</template>
              {{ tr('Long titles do not run under the tag.', 'Длинные заголовки не заезжают под тег.') }}
            </TaoCard>
            <TaoCard v-if="!closed" closable @close="closed = true">
              <template #title>{{ tr('Closable', 'Закрываемая') }}</template>
              <template #sub>{{ tr('The parent removes it on close', 'Убирает родитель по close') }}</template>
              {{ tr('Press the cross.', 'Нажмите на крестик.') }}
            </TaoCard>
            <TaoButton v-else variant="secondary" @click="closed = false">{{ tr('Bring the cards back', 'Вернуть карточки') }}</TaoButton>
          </div>

          <h3>{{ tr('Product', 'Товар') }}</h3>
          <Tr>
            <template #en>
              <p class="carousel-note">
                220px wide is the showcase wrapper; the Card itself is 100%. One photo — a <code>TaoImage</code> in <code>#media</code>.
                Several — a <code>TaoCarousel</code> in the same slot: no arrows, dots, swipe.
              </p>
            </template>
            <template #ru>
              <p class="carousel-note">
                Ширина 220px — в витрине, сам Card на 100%. Одно фото — <code>TaoImage</code> в <code>#media</code>.
                Несколько — <code>TaoCarousel</code> туда же: без стрелок, точки, свайп.
              </p>
            </template>
          </Tr>
          <div class="product-cards">
            <div class="product-card">
              <TaoCard :padding="12" :radius="12">
                <template #media>
                  <img class="product-card__photo" :src="cardPhotos[0]" :alt="tr('Nova sneakers', 'Кроссовки Nova')" />
                </template>
                <template #title>Nova</template>
                <template #sub>{{ tr('Sneakers', 'Кроссовки') }}</template>
                <template #footer>8 990 ₽</template>
              </TaoCard>
            </div>
            <div class="product-card product-card--gallery">
              <TaoCard :padding="12" :radius="12">
                <template #media>
                  <TaoCarousel v-model="cardGallery" :controls="false" dots :aria-label="tr('Product photos', 'Фото товара')">
                    <img
                      v-for="(src, index) in cardPhotos"
                      :key="index"
                      class="product-card__photo"
                      :src="src"
                      :alt="tr('Photo ', 'Фото ') + (index + 1)"
                      draggable="false"
                    />
                  </TaoCarousel>
                </template>
                <template #title>Drift</template>
                <template #sub>{{ tr('3 photos, swipe', '3 фото, листайте') }}</template>
                <template #footer>12 400 ₽</template>
              </TaoCard>
            </div>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #media&gt;
    &lt;img src="photo.jpg" alt="{{ tr('Product', 'Товар') }}" /&gt;
  &lt;/template&gt;
  &lt;template #title&gt;Nova&lt;/template&gt;
  &lt;template #sub&gt;{{ tr('Sneakers', 'Кроссовки') }}&lt;/template&gt;
  &lt;template #footer&gt;8 990 ₽&lt;/template&gt;
&lt;/TaoCard&gt;

&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #media&gt;
    &lt;TaoCarousel :controls="false" dots&gt;
      &lt;img v-for="src in photos" :src="src" draggable="false" /&gt;
    &lt;/TaoCarousel&gt;
  &lt;/template&gt;
&lt;/TaoCard&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.card-cover {
  height: 150px;
  background: linear-gradient(135deg, var(--tao-color-accent) 0%, var(--tao-color-accent-active) 100%);
  border-radius: 12px 12px 0 0;
}

.product-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.product-card {
  width: 220px;
  max-width: 220px;
  min-width: 0;
  flex-shrink: 0;
  overflow: hidden;
}

.product-card :deep(.tao-card),
.product-card :deep(.tao-carousel),
.product-card :deep(.tao-carousel__row),
.product-card :deep(.tao-carousel__track) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.product-card :deep(.tao-card__title) {
  font-size: 16px;
}

.product-card :deep(.tao-card__footer) {
  font-weight: 600;
}

.product-card--gallery :deep(.tao-carousel) {
  position: relative;
}

.product-card--gallery :deep(.tao-carousel__track) {
  gap: 0;
}

.product-card--gallery :deep(.tao-carousel__dots) {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  z-index: 1;
}
</style>
