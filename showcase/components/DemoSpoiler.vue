<script setup>
import { ref } from 'vue'
import { TaoSpoiler, TaoSpoilerGroup } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSpoiler' })

const spoilerOpen = ref(false)
const spoilerFaq = ref('ship')
</script>

<template>
  <ShowcaseSection id="spoiler" :tables="propTables['spoiler']">
    <h2>TaoSpoiler</h2>
          <p>
            Раскрывающийся блок. <code>v-model</code> держит открытость.
            Несколько подряд сами друг друга не закрывают — для аккордеона оберните в
            <code>TaoSpoilerGroup</code>: в модели ключ панели или <code>null</code>.
          </p>
    
          <TaoSpoiler v-model="spoilerOpen" title="Нажмите, чтобы раскрыть">
            <p>Это скрытое содержимое спойлера. Здесь можно разместить подробную информацию, дополнительные настройки или любой другой контент, который нужно показывать по требованию.</p>
            <ul>
              <li>Пункт списка 1</li>
              <li>Пункт списка 2</li>
              <li>Пункт списка 3</li>
            </ul>
          </TaoSpoiler>
    
          <h3 style="margin: 24px 0 12px;">Группа</h3>
          <p class="carousel-note">Открыли одну — другая закрылась. Повторный клик по открытой сворачивает все.</p>
          <TaoSpoilerGroup v-model="spoilerFaq">
            <TaoSpoiler name="pay" title="Оплата">
              <p>Счёт и чек приходят на почту после подтверждения.</p>
            </TaoSpoiler>
            <TaoSpoiler name="ship" title="Доставка">
              <p>Срок 2–5 дней, трек-номер в личном кабинете.</p>
            </TaoSpoiler>
            <TaoSpoiler name="return" title="Возврат">
              <p>14 дней, если сохранён товарный вид.</p>
            </TaoSpoiler>
          </TaoSpoilerGroup>
    
          <h3 style="margin: 24px 0 12px;">Без v-model</h3>
          <p class="carousel-note">Группа сама помнит открытую панель — <code>v-model</code> не обязателен.</p>
          <TaoSpoilerGroup>
            <TaoSpoiler name="a" title="Первая">
              <p>Клики работают и без привязки модели.</p>
            </TaoSpoiler>
            <TaoSpoiler name="b" title="Вторая">
              <p>Открыли эту — первая закрылась.</p>
            </TaoSpoiler>
          </TaoSpoilerGroup>
    
          <div class="code-block">
            <pre><code>&lt;TaoSpoiler v-model="open" title="Заголовок"&gt;
  &lt;p&gt;Скрытое содержимое&lt;/p&gt;
&lt;/TaoSpoiler&gt;

&lt;TaoSpoilerGroup v-model="faq"&gt;
  &lt;TaoSpoiler name="pay" title="Оплата"&gt;…&lt;/TaoSpoiler&gt;
  &lt;TaoSpoiler name="ship" title="Доставка"&gt;…&lt;/TaoSpoiler&gt;
&lt;/TaoSpoilerGroup&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
