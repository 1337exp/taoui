<script setup>
import { ref } from 'vue'
import { TaoSpoiler, TaoSpoilerGroup } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSpoiler' })

const spoilerOpen = ref(false)
const spoilerFaq = ref('ship')
</script>

<template>
  <ShowcaseSection id="spoiler" :tables="propTables['spoiler']">
    <h2>TaoSpoiler</h2>
          <Tr>
            <template #en>
              <p>
                A collapsible block. <code>v-model</code> holds the open state.
                Several in a row do not close each other — for an accordion wrap them in
                <code>TaoSpoilerGroup</code>: the model is the panel key or <code>null</code>.
              </p>
            </template>
            <template #ru>
              <p>
                Раскрывающийся блок. <code>v-model</code> держит открытость.
                Несколько подряд сами друг друга не закрывают — для аккордеона оберните в
                <code>TaoSpoilerGroup</code>: в модели ключ панели или <code>null</code>.
              </p>
            </template>
          </Tr>
    
          <TaoSpoiler v-model="spoilerOpen" :title="tr('Click to expand', 'Нажмите, чтобы раскрыть')">
            <p>{{ tr('This is the hidden content of the spoiler. Put detailed information, extra settings or any other content that should be shown on demand here.', 'Это скрытое содержимое спойлера. Здесь можно разместить подробную информацию, дополнительные настройки или любой другой контент, который нужно показывать по требованию.') }}</p>
            <ul>
              <li>{{ tr('List item 1', 'Пункт списка 1') }}</li>
              <li>{{ tr('List item 2', 'Пункт списка 2') }}</li>
              <li>{{ tr('List item 3', 'Пункт списка 3') }}</li>
            </ul>
          </TaoSpoiler>
    
          <h3 style="margin: 24px 0 12px;">{{ tr('Group', 'Группа') }}</h3>
          <p class="carousel-note">{{ tr('Open one — the other closes. A second click on the open one collapses all.', 'Открыли одну — другая закрылась. Повторный клик по открытой сворачивает все.') }}</p>
          <TaoSpoilerGroup v-model="spoilerFaq">
            <TaoSpoiler name="pay" :title="tr('Payment', 'Оплата')">
              <p>{{ tr('The invoice and the receipt arrive by email after confirmation.', 'Счёт и чек приходят на почту после подтверждения.') }}</p>
            </TaoSpoiler>
            <TaoSpoiler name="ship" :title="tr('Delivery', 'Доставка')">
              <p>{{ tr('2–5 days, the tracking number is in your account.', 'Срок 2–5 дней, трек-номер в личном кабинете.') }}</p>
            </TaoSpoiler>
            <TaoSpoiler name="return" :title="tr('Returns', 'Возврат')">
              <p>{{ tr('14 days, if the item is in its original condition.', '14 дней, если сохранён товарный вид.') }}</p>
            </TaoSpoiler>
          </TaoSpoilerGroup>
    
          <h3 style="margin: 24px 0 12px;">{{ tr('Without v-model', 'Без v-model') }}</h3>
          <Tr>
            <template #en><p class="carousel-note">The group remembers the open panel itself — <code>v-model</code> is optional.</p></template>
            <template #ru><p class="carousel-note">Группа сама помнит открытую панель — <code>v-model</code> не обязателен.</p></template>
          </Tr>
          <TaoSpoilerGroup>
            <TaoSpoiler name="a" :title="tr('First', 'Первая')">
              <p>{{ tr('Clicks work without a bound model too.', 'Клики работают и без привязки модели.') }}</p>
            </TaoSpoiler>
            <TaoSpoiler name="b" :title="tr('Second', 'Вторая')">
              <p>{{ tr('Open this one — the first one closes.', 'Открыли эту — первая закрылась.') }}</p>
            </TaoSpoiler>
          </TaoSpoilerGroup>
    
          <div class="code-block">
            <pre><code>&lt;TaoSpoiler v-model="open" title="{{ tr('Title', 'Заголовок') }}"&gt;
  &lt;p&gt;{{ tr('Hidden content', 'Скрытое содержимое') }}&lt;/p&gt;
&lt;/TaoSpoiler&gt;

&lt;TaoSpoilerGroup v-model="faq"&gt;
  &lt;TaoSpoiler name="pay" title="{{ tr('Payment', 'Оплата') }}"&gt;…&lt;/TaoSpoiler&gt;
  &lt;TaoSpoiler name="ship" title="{{ tr('Delivery', 'Доставка') }}"&gt;…&lt;/TaoSpoiler&gt;
&lt;/TaoSpoilerGroup&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
