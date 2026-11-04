// Lab: a bench for the look of an animation (here TaoLoader). Frames of it at chosen moments of its cycle, a scrubber, a
// slow-motion row, live samples at small sizes. It reads the library from src/, so a change of the CSS shows at once.
// Open it at /lab/loader.html, `?variant=ring` picks a look, `?marks=0,25,50,75` the frames. Not part of the built showcase.
// Лаборатория: стенд для вида анимации (здесь TaoLoader). Кадры на выбранных моментах цикла, ползунок, замедление,
// живые образцы мелких размеров. Читает библиотеку из src/, поэтому правка CSS видна сразу.
import { createApp, h, ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { TaoLoader } from '@1337exp/taoui'
import '../../src/styles/index.css'
import '../../src/styles/palettes/index.css'

const params = new URLSearchParams(location.search)
const variant = params.get('variant') || 'diamonds'
const DEFAULT_MARKS = '0 10 20 30 40 46 50 60 70 80 90 100'

const App = {
  setup() {
    const state = reactive({
      marks: (params.get('marks') || DEFAULT_MARKS).replace(/,/g, ' '),
      size: 150,
      scrub: 0,
      slow: 0.25,
      dark: true,
    })
    const root = ref(null)
    let raf = 0

    const cycle = (el) => {
      // the cycle is the longest duration among the animated parts / цикл — самая долгая длительность среди анимируемых частей
      let ms = 0
      el.querySelectorAll('*').forEach((n) => {
        const d = getComputedStyle(n).animationDuration
        d.split(',').forEach((x) => { ms = Math.max(ms, x.includes('ms') ? parseFloat(x) : parseFloat(x) * 1000) })
      })
      return ms || 1000
    }

    const apply = () => {
      root.value?.querySelectorAll('[data-at]').forEach((el) => {
        const at = parseFloat(el.dataset.at === 'scrub' ? state.scrub : el.dataset.at) / 100
        const ms = cycle(el)
        el.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = Math.min(at, 0.9999) * ms })
      })
      root.value?.querySelectorAll('[data-slow]').forEach((el) => {
        el.getAnimations({ subtree: true }).forEach((a) => { if (a.playbackRate !== state.slow) a.playbackRate = state.slow })
      })
      raf = requestAnimationFrame(apply)
    }

    onMounted(() => { raf = requestAnimationFrame(apply) })
    onBeforeUnmount(() => cancelAnimationFrame(raf))

    const marks = () => state.marks.split(/[\s,]+/).map(Number).filter((n) => Number.isFinite(n))
    const label = (text) => h('div', { style: 'font:11px sans-serif;color:#999;margin-top:6px' }, text)
    const panel = (children) => h('div', { style: 'border:1px solid #333;border-radius:8px;padding:14px 8px;display:flex;flex-direction:column;align-items:center' }, children)
    const field = (name, input) => h('label', { style: 'display:flex;gap:6px;align-items:center;font:12px sans-serif;color:#bbb' }, [name, input])

    return () => h('div', { ref: root, style: `padding:16px;background:${state.dark ? '#111' : '#f4f1ea'};min-height:100vh;color:#ccc` }, [
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin-bottom:12px' }, [
        field('frames %', h('input', { value: state.marks, style: 'width:330px', onInput: (e) => (state.marks = e.target.value) })),
        field(`size ${state.size}`, h('input', { type: 'range', min: 24, max: 260, value: state.size, onInput: (e) => (state.size = +e.target.value) })),
        field(`slow ×${state.slow}`, h('input', { type: 'range', min: 0.05, max: 1, step: 0.05, value: state.slow, onInput: (e) => (state.slow = +e.target.value) })),
        field('light bg', h('input', { type: 'checkbox', checked: !state.dark, onChange: (e) => { state.dark = !e.target.checked; document.documentElement.setAttribute('data-tao-mode', state.dark ? 'dark' : 'light') } })),
      ]),
      h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(' + (state.size + 40) + 'px,1fr));gap:8px' },
        marks().map((p) => panel([h('div', { 'data-at': p }, h(TaoLoader, { variant, size: state.size })), label(p + '%')]))),
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;align-items:stretch' }, [
        panel([h('div', { 'data-at': 'scrub' }, h(TaoLoader, { variant, size: state.size })), h('input', { type: 'range', min: 0, max: 100, step: 0.5, value: state.scrub, style: 'width:200px', onInput: (e) => (state.scrub = +e.target.value) }), label('scrub ' + state.scrub + '%')]),
        panel([h('div', { 'data-slow': 1 }, h(TaoLoader, { variant, size: state.size })), label('slow motion')]),
        panel([h(TaoLoader, { variant, size: 'large' }), label('live · large')]),
        panel([h(TaoLoader, { variant, size: 'medium' }), label('live · medium')]),
        panel([h(TaoLoader, { variant, size: 'small' }), label('live · small')]),
        panel([h(TaoLoader, { variant, size: 16 }), label('live · 16')]),
      ]),
    ])
  },
}

document.documentElement.setAttribute('data-tao-mode', 'dark')
createApp(App).mount('#app')
