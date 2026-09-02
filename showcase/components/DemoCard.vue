<script setup>
import { ref } from 'vue'
import { TaoCard, TaoButton, TaoCarousel } from '@tao/ui'
import { stubPhoto } from '../stubPhoto.js'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoCard' })

const cardPhotos = [stubPhoto('1'), stubPhoto('2'), stubPhoto('3')]
const cardGallery = ref(0)
</script>

<template>
  <ShowcaseSection id="card" :tables="propTables['card']">
    <h2>TaoCard</h2>
          <p>
            Карточка со слотами cover / header / footer. Обложка — любой контент: фото или карусель.
            Проп <code>hover</code> даёт обводку акцентом при наведении — у товаров ниже он выключен.
          </p>
          
          <TaoCard :padding="20" :radius="12">
            <template #cover>
              <div class="card-cover"></div>
            </template>
            <template #header>
              <h3 style="margin: 0;">Заголовок карточки</h3>
            </template>
            <p>Основное содержимое карточки. Здесь можно разместить описание, изображение или любой другой контент.</p>
            <template #footer>
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <TaoButton size="small" variant="secondary">Отмена</TaoButton>
                <TaoButton size="small" variant="primary">Действие</TaoButton>
              </div>
            </template>
          </TaoCard>
    
          <h3>Товар</h3>
          <p class="carousel-note">
            Ширина 220px — в витрине, сам Card на 100%. Одно фото — <code>TaoImage</code> в <code>#cover</code>.
            Несколько — <code>TaoCarousel</code> туда же: без стрелок, точки, свайп.
          </p>
          <div class="product-cards">
            <div class="product-card">
              <TaoCard :padding="12" :radius="12">
                <template #cover>
                  <img class="product-card__photo" :src="cardPhotos[0]" alt="Кроссовки Nova" />
                </template>
                <template #title>Nova</template>
                <template #sub>Кроссовки</template>
                <template #footer>8 990 ₽</template>
              </TaoCard>
            </div>
            <div class="product-card product-card--gallery">
              <TaoCard :padding="12" :radius="12">
                <template #cover>
                  <TaoCarousel v-model="cardGallery" :controls="false" dots aria-label="Фото товара">
                    <img
                      v-for="(src, index) in cardPhotos"
                      :key="index"
                      class="product-card__photo"
                      :src="src"
                      :alt="'Фото ' + (index + 1)"
                      draggable="false"
                    />
                  </TaoCarousel>
                </template>
                <template #title>Drift</template>
                <template #sub>3 фото, листайте</template>
                <template #footer>12 400 ₽</template>
              </TaoCard>
            </div>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #cover&gt;
    &lt;img src="photo.jpg" alt="Товар" /&gt;
  &lt;/template&gt;
  &lt;template #title&gt;Nova&lt;/template&gt;
  &lt;template #sub&gt;Кроссовки&lt;/template&gt;
  &lt;template #footer&gt;8 990 ₽&lt;/template&gt;
&lt;/TaoCard&gt;

&lt;TaoCard :padding="12" :radius="12"&gt;
  &lt;template #cover&gt;
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
