<script setup>
import { computed, ref } from 'vue'
import { TaoCard, TaoMarquee, TaoSegmented, TaoSegmentedOption, TaoSwitch } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import Tr from './Tr.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoMarquee' })

const speed = ref('40')
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

    <div class="code-block">
      <pre><code>&lt;TaoMarquee :text="project.title" /&gt;

&lt;TaoMarquee :speed="60" :gap="64"&gt;
  Now playing: &lt;b&gt;Nils Frahm — Says&lt;/b&gt; · &lt;a href="…"&gt;open&lt;/a&gt;
&lt;/TaoMarquee&gt;</code></pre>
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

.marquee-demo__line {
  max-width: 420px;
  margin-bottom: 16px;
  padding: 10px 14px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}
</style>
