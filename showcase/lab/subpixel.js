// Lab: do the floating parts of the kit stand on whole pixels? A panel that stands on a fraction of a pixel draws its text one way and
// snaps it to whole pixels when something under the pointer repaints, so a button seems to jump. This page opens each suspect part, measures
// the text and the buttons in it, and says which stand on a fraction, and which would in a window of the other parity (a centred panel whose
// room left over is odd). Open it at /lab/subpixel.html; "Check all" runs every case.
// Лаборатория: стоят ли плавающие части набора на целых пикселях? Панель на доле пикселя рисует текст по-одному и прижимает к целым,
// когда что-то под указателем перерисовывается, поэтому кнопка «прыгает». Страница открывает каждую подозрительную часть, меряет текст и
// кнопки в ней и говорит, что стоит на доле, а что встало бы на неё в окне другой чётности (у отцентрованной панели нечётное оставшееся место).
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue'
import { TaoButton, TaoDrawer, TaoModal, TaoPopover, TaoTooltip, confirm, toast } from '@1337exp/taoui'
import '../../src/styles/index.css'
import '../../src/styles/palettes/index.css'

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const frac = (n) => +(Math.abs(n - Math.round(n))).toFixed(3)

// the things in a panel whose position matters: buttons, headings, lines of text / то, чья позиция важна: кнопки, заголовки, строки
function measure(root) {
  if (!root) return null
  const items = [...root.querySelectorAll('button, h1, h2, h3, p, [role="menuitem"], [class*="title"], [class*="message"]')].filter((e) => e.getClientRects().length)
  const rows = items.map((e) => {
    const r = e.getBoundingClientRect()
    return { el: `${e.tagName.toLowerCase()}${e.className ? '.' + String(e.className).split(' ')[0] : ''}`, text: e.textContent.trim().slice(0, 18), top: +r.top.toFixed(3), left: +r.left.toFixed(3), fy: frac(r.top), fx: frac(r.left) }
  })
  const rr = root.getBoundingClientRect()
  return { panel: { top: +rr.top.toFixed(3), height: +rr.height.toFixed(3), fy: frac(rr.top), fh: frac(rr.height) }, rows, badY: rows.filter((x) => x.fy > 0.01).length }
}

const state = reactive({ modal: false, drawer: false, drawerSide: 'right', results: [], busy: false })
const tip = ref(null)

const cases = [
  {
    name: 'confirm()',
    box: '.tao-confirm',
    root: '.tao-confirm__panel',
    open: () => { confirm('Save the changes?').ok('Save').cancel('Not now'); },
    close: () => document.querySelector('[data-tao-confirm-cancel]')?.click(),
  },
  {
    name: 'confirm() with a message, danger',
    box: '.tao-confirm',
    root: '.tao-confirm__panel',
    open: () => { confirm().title('Delete the file?').message('This cannot be undone.').ok('Delete').danger(); },
    close: () => document.querySelector('[data-tao-confirm-cancel]')?.click(),
  },
  {
    name: 'confirm() with a long message',
    box: '.tao-confirm',
    root: '.tao-confirm__panel',
    open: () => { confirm().title('Leave the page?').message('You have unsaved changes in three documents. If you leave now, the changes in all of them are lost and cannot be brought back.').ok('Leave').danger(); },
    close: () => document.querySelector('[data-tao-confirm-cancel]')?.click(),
  },
  {
    name: 'TaoModal',
    box: '.tao-modal-overlay',
    root: '.tao-modal',
    open: () => { state.modal = true },
    close: () => { state.modal = false },
  },
  {
    name: 'TaoDrawer (right)',
    box: null,
    root: '.tao-drawer',
    open: () => { state.drawerSide = 'right'; state.drawer = true },
    close: () => { state.drawer = false },
  },
  {
    name: 'TaoDrawer (bottom)',
    box: null,
    root: '.tao-drawer',
    open: () => { state.drawerSide = 'bottom'; state.drawer = true },
    close: () => { state.drawer = false },
  },
  {
    name: 'toast()',
    box: null,
    root: '.tao-toast',
    open: () => { toast.success('Saved') },
    close: () => {},
  },
  {
    name: 'TaoTooltip',
    box: null,
    root: '.tao-tooltip',
    // mouseenter does not bubble: the wrapper of the tooltip hears it / mouseenter не всплывает: его слышит обёртка подсказки
    open: () => { tip.value?.closest('.tao-tooltip-wrapper')?.dispatchEvent(new MouseEvent('mouseenter')) },
    close: () => { tip.value?.closest('.tao-tooltip-wrapper')?.dispatchEvent(new MouseEvent('mouseleave')) },
  },
]

async function run(c) {
  c.open()
  await wait(1400)
  const root = document.querySelector(c.root)
  const m = measure(root)
  let parity = null
  if (c.box && root) {
    const box = document.querySelector(c.box)
    const room = Math.round(box.clientHeight) - Math.round(root.getBoundingClientRect().height)
    parity = room % 2 === 0 ? 'even' : 'odd'
  }
  c.close()
  await wait(700)
  return { name: c.name, found: !!root, ...m, parity }
}

async function checkAll() {
  state.busy = true
  state.results = []
  for (const c of cases) {
    state.results.push(await run(c))
    await nextTick()
  }
  state.busy = false
}

async function checkOne(c) {
  state.busy = true
  const r = await run(c)
  state.results = [...state.results.filter((x) => x.name !== r.name), r]
  state.busy = false
}

const App = defineComponent({
  setup() {
    return () => h('div', { style: 'padding:16px;background:var(--tao-color-bg);color:var(--tao-color-text);min-height:100vh;font:13px system-ui,sans-serif' }, [
      h('h2', { style: 'margin:0 0 4px' }, 'Whole pixels'),
      h('p', { style: 'margin:0 0 12px;color:var(--tao-color-text-muted)' }, `Window ${innerWidth} x ${innerHeight}. A row is bad when its top is on a fraction (fy). "Room left over" is the parity of a centred panel: odd means a half pixel unless the panel is nudged.`),
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px' }, [
        h(TaoButton, { disabled: state.busy, onClick: checkAll }, () => 'Check all'),
        ...cases.map((c) => h(TaoButton, { variant: 'secondary', size: 'small', disabled: state.busy, onClick: () => checkOne(c) }, () => c.name)),
        h(TaoTooltip, { content: 'A tooltip', placement: 'top' }, () => h('span', { ref: tip, style: 'display:inline-block;padding:4px 8px;border:1px dashed var(--tao-color-border-strong)' }, 'tooltip target')),
      ]),
      h('table', { style: 'border-collapse:collapse;width:100%' }, [
        h('thead', h('tr', ['case', 'found', 'panel top / height', 'fraction (top, height)', 'rows off the grid', 'room left over'].map((t) => h('th', { style: 'text-align:start;padding:4px 8px;border-bottom:1px solid var(--tao-color-border);color:var(--tao-color-text-muted)' }, t)))),
        h('tbody', state.results.flatMap((r) => [
          h('tr', { style: 'vertical-align:top' }, [
            h('td', { style: 'padding:4px 8px;font-weight:600' }, r.name),
            h('td', { style: 'padding:4px 8px' }, r.found ? 'yes' : 'NO'),
            h('td', { style: 'padding:4px 8px' }, r.panel ? `${r.panel.top} / ${r.panel.height}` : '-'),
            h('td', { style: 'padding:4px 8px' }, r.panel ? `${r.panel.fy}, ${r.panel.fh}` : '-'),
            h('td', { style: `padding:4px 8px;color:${r.badY ? 'var(--tao-color-danger-text)' : 'var(--tao-color-success-text)'}` }, r.rows ? `${r.badY} of ${r.rows.length}` : '-'),
            h('td', { style: 'padding:4px 8px' }, r.parity ?? 'not centred'),
          ]),
          ...(r.rows ?? []).filter((x) => x.fy > 0.01).map((x) => h('tr', { style: 'color:var(--tao-color-text-muted)' }, [h('td'), h('td'), h('td', { colspan: 4, style: 'padding:0 8px 2px' }, `${x.el} "${x.text}": top ${x.top}, left ${x.left}`)])),
        ])),
      ]),
      h(TaoModal, { modelValue: state.modal, 'onUpdate:modelValue': (v) => (state.modal = v), title: 'Modal title' }, { default: () => h('p', 'The text of a modal with a button below it.'), footer: () => h(TaoButton, { onClick: () => (state.modal = false) }, () => 'Close') }),
      h(TaoDrawer, { modelValue: state.drawer, 'onUpdate:modelValue': (v) => (state.drawer = v), side: state.drawerSide, title: 'Drawer title' }, () => [h('p', 'The text of a drawer.'), h(TaoButton, { variant: 'secondary' }, () => 'A button')]),
    ])
  },
})

document.documentElement.setAttribute('data-tao-mode', 'dark')
createApp(App).mount('#app')
void TaoPopover
