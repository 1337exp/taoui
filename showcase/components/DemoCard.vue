<script setup>
import { ref } from 'vue'
import { TaoAnimatedBorder, TaoBlock, TaoCard, TaoButton, TaoCarousel, TaoTag } from '@1337exp/taoui'
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

          <h3>{{ tr('Stripe', 'Полоса') }}</h3>
          <p class="card-stripe-note">{{ tr('stripe="top | left | bottom" with a role colour: the accent, a status tone or the palette gradient. The corners of the card clip it, over a picture too. A colour alone is not a message: say the status in the text as well.', 'stripe="top | left | bottom" цветом из роли: акцент, тон статуса или градиент палитры. Углы карточки её обрезают, поверх картинки тоже. Один цвет — не сообщение: статус стоит сказать и текстом.') }}</p>
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <TaoCard stripe="top">
              <template #title>{{ tr('Accent', 'Акцент') }}</template>
              <template #sub>stripe="top"</template>
            </TaoCard>
            <TaoCard stripe="left" stripe-tone="success">
              <template #title>{{ tr('Paid', 'Оплачено') }}</template>
              <template #sub>stripe="left" stripe-tone="success"</template>
            </TaoCard>
            <TaoCard stripe="left" stripe-tone="danger" surface="glass">
              <template #title>{{ tr('Payment failed', 'Оплата не прошла') }}</template>
              <template #sub>stripe-tone="danger", glass</template>
            </TaoCard>
            <TaoCard stripe="top" stripe-tone="gradient" :radius="16">
              <template #title>{{ tr('Gradient', 'Градиент') }}</template>
              <template #sub>stripe-tone="gradient", radius 16</template>
            </TaoCard>
            <TaoCard stripe="top" stripe-tone="warning" :padding="0">
              <template #media>
                <img class="product-card__photo" :src="cardPhotos[0]" alt="" />
              </template>
              <template #title><span style="padding: 0 12px;">{{ tr('Over the media', 'Поверх media') }}</span></template>
            </TaoCard>
            <TaoBlock stripe="bottom" stripe-tone="info">
              <b>TaoBlock</b>
              <div style="color: var(--tao-color-text-muted); font-size: 13px;">stripe="bottom" stripe-tone="info"</div>
            </TaoBlock>
          </div>

          <h3>{{ tr('Sharp corners', 'Прямые углы') }}</h3>
          <Tr>
            <template #en>
              <p class="card-stripe-note">
                <code>radius</code> takes the corners one by one: an array of 1 to 4 lengths in the order of CSS
                <code>border-radius</code> (<code>[top-left, top-right, bottom-right, bottom-left]</code>; two values are the
                diagonals), or the same as a string, <code>"0 0 12px 12px"</code>. A stripe on a sharp side stays straight, the
                layer takes the corners of the panel. The inner radius for children (<code>--tao-radius-inner</code>) stays one
                length; a child in a corner reads <code>--tao-radius-inner-tl / -tr / -br / -bl</code>, as the close button of the
                card does. <code>:radius="0"</code> makes every corner sharp.
              </p>
              <p class="card-stripe-note">
                To keep the radius as it is (the token of the theme, a <code>radius</code>, a <code>--tao-radius</code> of your own
                class) and only make some corners sharp, use <code>square</code>: a side (<code>top</code>, <code>bottom</code>,
                <code>left</code>, <code>right</code>), a corner (<code>top-left</code>, <code>top-right</code>,
                <code>bottom-right</code>, <code>bottom-left</code>), several as an array or a string with spaces.
              </p>
            </template>
            <template #ru>
              <p class="card-stripe-note">
                <code>radius</code> принимает углы по отдельности: массив из 1–4 длин в порядке CSS
                <code>border-radius</code> (<code>[верх-лево, верх-право, низ-право, низ-лево]</code>; два значения — диагонали)
                или то же строкой, <code>"0 0 12px 12px"</code>. Полоса на прямой стороне остаётся прямой: слой берёт углы панели.
                Внутренний радиус для детей (<code>--tao-radius-inner</code>) остаётся одной длиной; ребёнок в углу читает
                <code>--tao-radius-inner-tl / -tr / -br / -bl</code>, как кнопка закрытия карточки. <code>:radius="0"</code> —
                все углы прямые.
              </p>
              <p class="card-stripe-note">
                Чтобы оставить радиус как есть (токен темы, <code>radius</code>, <code>--tao-radius</code> вашего класса) и сделать
                прямыми только часть углов, используйте <code>square</code>: сторона (<code>top</code>, <code>bottom</code>,
                <code>left</code>, <code>right</code>), угол (<code>top-left</code>, <code>top-right</code>,
                <code>bottom-right</code>, <code>bottom-left</code>), несколько массивом или строкой через пробел.
              </p>
            </template>
          </Tr>
          <div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
            <TaoCard stripe="top" :radius="[0, 0, 12, 12]">
              <template #title>{{ tr('A sharp top', 'Прямой верх') }}</template>
              <template #sub>stripe="top" :radius="[0, 0, 12, 12]"</template>
            </TaoCard>
            <TaoCard stripe="left" stripe-tone="success" :radius="[0, 12, 12, 0]">
              <template #title>{{ tr('A sharp left side', 'Прямая левая сторона') }}</template>
              <template #sub>stripe="left" :radius="[0, 12, 12, 0]"</template>
            </TaoCard>
            <TaoCard stripe="bottom" stripe-tone="info" :radius="[12, 12, 0, 0]">
              <template #title>{{ tr('A sharp bottom', 'Прямой низ') }}</template>
              <template #sub>stripe="bottom" :radius="[12, 12, 0, 0]"</template>
            </TaoCard>
            <TaoCard stripe="top" stripe-tone="warning" :radius="0">
              <template #title>{{ tr('All sharp', 'Все прямые') }}</template>
              <template #sub>stripe="top" :radius="0"</template>
            </TaoCard>
            <TaoCard :radius="[0, 24, 0, 24]" closable>
              <template #title>{{ tr('Diagonals', 'Диагонали') }}</template>
              <template #sub>:radius="[0, 24]", closable</template>
              {{ tr('The cross is round to the corner it sits in.', 'Крестик скруглён по углу, в котором стоит.') }}
            </TaoCard>
            <TaoBlock :radius="'12px 0'" stripe="left" stripe-tone="danger">
              <b>TaoBlock</b>
              <div style="color: var(--tao-color-text-muted); font-size: 13px;">radius="12px 0", {{ tr('a string', 'строкой') }}</div>
            </TaoBlock>
            <TaoCard stripe="top" square="top">
              <template #title>{{ tr('square: keeps the radius', 'square: радиус как есть') }}</template>
              <template #sub>stripe="top" square="top"</template>
            </TaoCard>
            <TaoCard class="demo-own-radius" square="bottom-right top-left">
              <template #title>{{ tr('Your own CSS radius', 'Радиус из вашего CSS') }}</template>
              <template #sub>.demo-own-radius { --tao-radius: 28px } + square="bottom-right top-left"</template>
            </TaoCard>
            <TaoAnimatedBorder :radius="[0, 0, 16, 16]">
              <div style="padding: 16px;">
                <b>TaoAnimatedBorder</b>
                <div style="color: var(--tao-color-text-muted); font-size: 13px;">:radius="[0, 0, 16, 16]"</div>
              </div>
            </TaoAnimatedBorder>
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
                  <TaoCarousel v-model="cardGallery" :controls="false" indicator="dots" :label="tr('Product photos', 'Фото товара')">
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
    &lt;TaoCarousel :controls="false" indicator="dots"&gt;
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

.product-card--gallery :deep(.tao-carousel__footer) {
  position: absolute;
  right: 0;
  bottom: 8px;
  left: 0;
  z-index: 1;
}
/* a radius of the page's own: `square` keeps it for the corners that stay round */
.demo-own-radius {
  --tao-radius: 28px;
}
.card-stripe-note {
  margin: -4px 0 12px;
  font-size: 13px;
  color: var(--tao-color-text-muted);
}
</style>
