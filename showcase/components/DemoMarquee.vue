<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { TaoCard, TaoMarquee, TaoSegmented, TaoSegmentedOption, TaoSwitch } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoMarquee' })

const speed = ref('40')
const reverse = ref(false)

// a ticker of quotes: a short strip that is repeated to the whole width, and the prices change under it, with nobody asking
// the marquee to measure again
// биржевая лента: короткая полоса, повторённая на всю ширину, а цены меняются под ней, и перемерять строку никто не просит
const quotes = ref([
  { s: 'AAPL', p: 189.2, d: 0.4 },
  { s: 'TSLA', p: 241.0, d: -1.1 },
  { s: 'BTC', p: 61250, d: 2.3 },
  { s: 'EUR', p: 1.08, d: -0.1 },
])
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    for (const q of quotes.value) {
      const move = (Math.random() - 0.5) * 0.02
      q.p = Math.round(q.p * (1 + move) * 100) / 100
      q.d = Math.round((q.d + move * 100) * 10) / 10
    }
  }, 1500)
})
onBeforeUnmount(() => clearInterval(timer))
const paused = ref(false)
const cards = computed(() => [
  { id: 'a', title: 'Inktune' },
  { id: 'b', title: tr('PROTOCOL // VANGUARD: a tactical roguelike in the rain', 'PROTOCOL // VANGUARD: тактический рогалик под дождём') },
  { id: 'c', title: tr('A tool for curves, gradients and everything between', 'Инструмент для кривых, градиентов и всего между ними') },
])
</script>

<template>
  <ShowcaseSection id="marquee" :tables="propTables['marquee']">
    <h2>TaoMarquee</h2>
    <Tr>
      <template #en>
        <p>
          One line that never wraps. When it does not fit, it runs round with soft fading edges and a short pause at the
          start of every round; when it fits, it stands still. It stops on hover, on focus (Tab reaches a running line)
          and on a tap. With «reduce motion» it does not run, the line wraps. A screen reader reads it once.
        </p>
      </template>
      <template #ru>
        <p>
          Одна строка без переносов. Не помещается — бежит по кругу с мягко гаснущими краями и короткой паузой в начале
          каждого круга; помещается — стоит на месте. Останавливается при наведении, при фокусе (Tab доходит до бегущей
          строки) и по тапу. При «уменьшить движение» не бежит, а переносится. Скринридер читает её один раз.
        </p>
      </template>
    </Tr>

    <div class="marquee-demo__controls">
      <TaoSegmented v-model="speed" size="small">
        <TaoSegmentedOption value="20" :label="tr('slow', 'медленно')" />
        <TaoSegmentedOption value="40" label="40 px/s" />
        <TaoSegmentedOption value="80" :label="tr('fast', 'быстро')" />
      </TaoSegmented>
      <TaoSwitch v-model="paused" :label="tr('Paused by the app', 'Остановлена приложением')" />
    </div>

    <div class="marquee-demo__cards">
      <TaoCard v-for="card in cards" :key="card.id" :padding="16">
        <template #title>
          <TaoMarquee :text="card.title" :speed="Number(speed)" :paused="paused" />
        </template>
        <template #sub>{{ tr('The first title fits and stands still', 'Первый заголовок помещается и стоит') }}</template>
      </TaoCard>
    </div>

    <div class="marquee-demo__line">
      <TaoMarquee :speed="Number(speed)" :paused="paused">
        {{ tr('Now playing:', 'Сейчас играет:') }} <b>Nils Frahm — Says</b> ·
        <a href="#marquee">{{ tr('open in the player', 'открыть в плеере') }}</a> ·
        {{ tr('a link in the slot is one tab stop, its copies are inert', 'ссылка в слоте — одна остановка Tab, её копии неактивны') }}
      </TaoMarquee>
    </div>

    <Tr>
      <template #en>
        <p class="marquee-demo__note">
          A ticker: <code>fill</code> repeats a line that fits until the copies cover the whole width, so a short strip of
          quotes runs too, and <code>reverse</code> runs it the other way. The prices change under it every second and a half, and
          the marquee follows the content by itself.
        </p>
      </template>
      <template #ru>
        <p class="marquee-demo__note">
          Лента: <code>fill</code> повторяет помещающуюся строку, пока копии не закроют всю ширину, так что короткая полоса
          котировок тоже бежит, а <code>reverse</code> пускает её в другую сторону. Цены меняются под ней каждые полторы секунды,
          а марки следит за содержимым сам.
        </p>
      </template>
    </Tr>
    <div class="marquee-demo__controls">
      <TaoSwitch v-model="reverse" :label="tr('To the right', 'Вправо')" />
    </div>
    <div class="marquee-demo__line">
      <TaoMarquee fill :reverse="reverse" :speed="Number(speed)" :paused="paused" :gap="32">
        <span v-for="q in quotes" :key="q.s" class="marquee-demo__quote">
          <b>{{ q.s }}</b>
          <span class="marquee-demo__price">{{ q.p.toFixed(2) }}</span>
          <span :class="q.d >= 0 ? 'marquee-demo__up' : 'marquee-demo__down'">{{ q.d >= 0 ? '▲' : '▼' }} {{ Math.abs(q.d).toFixed(1) }}%</span>
        </span>
      </TaoMarquee>
    </div>

    <Tr>
      <template #en>
        <p class="marquee-demo__note">
          As a design feature, in the background: <code>decorative</code>. A ghost: hidden from a screen reader, not a tab stop, the
          cursor and a tap do nothing, the text cannot be selected, and it runs without a pause between rounds, like a looped
          picture. Only for text nobody needs to read. <code>:pause-on-hover="false"</code> alone just stops the stopping under
          the cursor.
        </p>
      </template>
      <template #ru>
        <p class="marquee-demo__note">
          Как приём дизайна, фоном: <code>decorative</code>. Призрак: скрыта от скринридера, не остановка Tab, курсор и тап ничего
          не делают, текст не выделяется, а между кругами нет паузы, как у зацикленной картинки. Только для текста, который
          никому не нужно читать. Один <code>:pause-on-hover="false"</code> лишь убирает остановку под курсором.
        </p>
      </template>
    </Tr>
    <div class="marquee-demo__line">
      <TaoMarquee :speed="Number(speed)" :paused="paused" decorative>
        TAOUI · TOKENS · THEMES · PALETTES · CONTEXTS · TAOUI · TOKENS · THEMES · PALETTES · CONTEXTS · TAOUI · TOKENS · THEMES
      </TaoMarquee>
    </div>

    <div class="code-block">
      <pre v-pre><code>&lt;TaoMarquee :text="project.title" /&gt;

&lt;TaoMarquee :speed="60" :gap="64"&gt;
  Now playing: &lt;b&gt;Nils Frahm — Says&lt;/b&gt; · &lt;a href="…"&gt;open&lt;/a&gt;
&lt;/TaoMarquee&gt;

&lt;!-- a ticker: a short strip is repeated to the whole width; the prices may change under it --&gt;
&lt;TaoMarquee fill :gap="32"&gt;
  &lt;span v-for="q in quotes" :key="q.s"&gt;&lt;b&gt;{{ q.s }}&lt;/b&gt; {{ q.p }}&lt;/span&gt;
&lt;/TaoMarquee&gt;

&lt;!-- a decorative line: a ghost, no pause between rounds --&gt;
&lt;TaoMarquee decorative text="…" /&gt;</code></pre>
    </div>
  </ShowcaseSection>
</template>

<style scoped>
.marquee-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.marquee-demo__cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

/* Every quote is a block of fixed width: the symbol, the price and the change each have their own column, so a price that
   gets longer or shorter changes nothing around it, and the strip does not twitch. The strip is as wide as its content:
   a width that changes moves everything after it. A gap after the block keeps the quotes apart.
   Каждая котировка — блок фиксированной ширины: у символа, цены и изменения своя колонка, поэтому цена, ставшая длиннее или
   короче, ничего вокруг не двигает, и лента не дёргается. Лента так же широка, как её содержимое: изменившаяся ширина сдвигает
   всё после неё. Отступ после блока не даёт котировкам слипнуться. */
.marquee-demo__quote {
  display: inline-grid;
  grid-template-columns: 5ch 10ch 8ch;
  column-gap: 0.75em;
  margin-inline-end: 2.5em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.marquee-demo__price {
  text-align: right;
}

.marquee-demo__up {
  color: var(--tao-color-success-text);
}

.marquee-demo__down {
  color: var(--tao-color-danger-text);
}

.marquee-demo__line {
  max-width: 420px;
  margin-bottom: 16px;
  /* the left fade takes `fade` (22px) to the left of the text: the box gives it that much room
     левое затухание занимает `fade` (22px) слева от текста: рамка даёт ему столько места */
  padding: 10px 22px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}
</style>
