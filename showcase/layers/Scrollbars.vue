<script setup>
import { computed, ref } from 'vue'
import { TaoButton, TaoColorInput, TaoCopy, TaoSegmented, TaoSegmentedOption, TaoSlider, TaoSwitch } from '@1337exp/taoui'
import A11yPanel from '../a11y/A11yPanel.vue'
import { tr } from '../i18n.js'

defineOptions({ name: 'Scrollbars' })

// The scrollbars of the kit are thin (5px) and wear the accent. Four hooks change that, on the page or on one block; a class gives the
// browser's own back. The sample below wears the hooks on itself, so only it changes; the code is what you would write.
// Полосы прокрутки набора тонкие (5px) и носят акцент. Четыре крючка это меняют, на странице или на одном блоке; класс возвращает
// родные. Образец носит крючки на себе, поэтому меняется только он; код — то, что вы бы написали.
const DEFAULT_SIZE = 5
const size = ref(DEFAULT_SIZE)
const thumb = ref('')
const track = ref(false)
const native = ref(false)
const firefox = ref('thin')

const TRACK = 'rgba(128, 128, 128, 0.25)'

const style = computed(() => ({
  '--tao-scrollbar-size': `${size.value}px`,
  '--tao-scrollbar-width': firefox.value,
  ...(thumb.value ? { '--tao-scrollbar-thumb': thumb.value } : {}),
  ...(track.value ? { '--tao-scrollbar-track': TRACK } : {}),
}))

const changed = computed(() => size.value !== DEFAULT_SIZE || thumb.value || track.value || firefox.value !== 'thin')

const css = computed(() => {
  if (native.value) {
    return '<html class="tao-native-scrollbars">   /* or any block: the browser\'s own scrollbars inside it */'
  }
  const lines = []
  if (size.value !== DEFAULT_SIZE) lines.push(`  --tao-scrollbar-size: ${size.value}px;`)
  if (thumb.value) lines.push(`  --tao-scrollbar-thumb: ${thumb.value};`)
  if (track.value) lines.push(`  --tao-scrollbar-track: ${TRACK};`)
  if (firefox.value !== 'thin') lines.push(`  --tao-scrollbar-width: ${firefox.value};   /* Firefox: thin | auto | none */`)
  return lines.length ? `:root {\n${lines.join('\n')}\n}` : tr('/* nothing: these are the defaults */', '/* ничего: это значения по умолчанию */')
})

function reset() {
  size.value = DEFAULT_SIZE
  thumb.value = ''
  track.value = false
  native.value = false
  firefox.value = 'thin'
}
</script>

<template>
  <A11yPanel icon="tao-settings" :title="tr('Scrollbars: thin by default, yours in one line', 'Полосы прокрутки: тонкие по умолчанию, ваши в одну строку')">
    <template #hint>{{ tr('four hooks and a class; the sample wears them on itself', 'четыре крючка и класс; образец носит их на себе') }}</template>

    <div class="scrollbars">
      <div class="scrollbars__controls">
        <div class="scrollbars__field">
          <span>{{ tr('Thickness', 'Толщина') }}: {{ size }}px <small>--tao-scrollbar-size</small></span>
          <TaoSlider v-model="size" :min="2" :max="32" :disabled="native" :aria-label="tr('Thickness', 'Толщина')" />
        </div>
        <div class="scrollbars__field">
          <span>{{ tr('Thumb (empty: the accent)', 'Бегунок (пусто: акцент)') }} <small>--tao-scrollbar-thumb</small></span>
          <TaoColorInput v-model="thumb" :disabled="native" :aria-label="tr('Thumb colour', 'Цвет бегунка')" />
        </div>
        <TaoSwitch v-model="track" :disabled="native" :label="tr('Show the track', 'Показать дорожку')" />
        <div class="scrollbars__field">
          <span>Firefox <small>--tao-scrollbar-width</small></span>
          <TaoSegmented v-model="firefox" size="small" :disabled="native" :aria-label="tr('Firefox width', 'Ширина в Firefox')">
            <TaoSegmentedOption value="thin" label="thin" />
            <TaoSegmentedOption value="auto" label="auto" />
          </TaoSegmented>
        </div>
        <TaoSwitch v-model="native" :label="tr('The browser’s own scrollbars', 'Родные полосы браузера')" />
        <TaoButton size="small" variant="secondary" :disabled="!changed && !native" @click="reset">{{ tr('Reset', 'Сбросить') }}</TaoButton>
      </div>

      <!-- keyed: a scroll container that drops its custom scrollbar for the native one in the same frame can keep the old one until it is laid out anew -->
      <div :key="native" class="scrollbars__sample" :class="{ 'tao-native-scrollbars': native }" :style="style" tabindex="0" :aria-label="tr('A box to scroll', 'Блок для прокрутки')">
        <div class="scrollbars__content">
          <p v-for="n in 18" :key="n">{{ tr('A line of text that is long enough to scroll sideways as well, so both scrollbars show. ', 'Строка текста, достаточно длинная, чтобы прокручиваться и вбок, поэтому видны обе полосы. ') }}{{ n }}</p>
        </div>
      </div>

      <div class="scrollbars__code">
        <div class="scrollbars__code-head">
          <span>{{ tr('What you would write', 'Что вы бы написали') }}</span>
          <TaoCopy :text="css" />
        </div>
        <pre tabindex="0" :aria-label="tr('The code', 'Код')"><code>{{ css }}</code></pre>
        <p class="scrollbars__note">
          {{ tr('The kit’s 5px is thin for a mouse (a thumb is hard to catch), so a thicker one is a fair wish; the default stays 5px. The hooks work on the page, on a block and on a component; the colours are read where the scroll is, so a block with another theme gets its own accent. In Firefox only the width (thin or auto) and the colours apply: it has no pixels.', 'Пятипиксельная полоса набора тонкая для мыши (бегунок трудно поймать), поэтому толще — справедливое желание; по умолчанию остаётся 5px. Крючки работают на странице, на блоке и на компоненте; цвета читаются там, где прокрутка, поэтому блок с другой темой получает свой акцент. В Firefox применяются только ширина (thin или auto) и цвета: пикселей там нет.') }}
        </p>
      </div>
    </div>
  </A11yPanel>
</template>

<style scoped>
.scrollbars {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.scrollbars__code {
  grid-column: 1 / -1;
}

@container (max-width: 760px) {
  .scrollbars {
    grid-template-columns: minmax(0, 1fr);
  }
}

.scrollbars__controls {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: 12px;
}

.scrollbars__field {
  display: grid;
  gap: 6px;
  width: 100%;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.scrollbars__field small {
  margin-inline-start: 6px;
  font-family: var(--tao-font-family-mono, monospace);
  font-size: 11px;
}

.scrollbars__sample {
  height: 220px;
  overflow: auto;
  padding: 12px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-bg);
  color: var(--tao-color-text);
  font-size: 13px;
}

.scrollbars__sample:focus-visible {
  outline: 2px solid var(--tao-color-accent);
  outline-offset: 2px;
}

.scrollbars__content {
  width: 720px;
}

.scrollbars__content p {
  margin: 0 0 8px;
  white-space: nowrap;
}

.scrollbars__code-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.scrollbars__code pre {
  margin: 4px 0 8px;
  padding: 12px;
  overflow: auto;
  border-radius: var(--tao-radius-control);
  background: var(--tao-color-surface-sunken);
  font-size: 12px;
}

.scrollbars__note {
  margin: 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}
</style>
