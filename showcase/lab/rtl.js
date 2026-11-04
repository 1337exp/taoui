// Lab: the same components twice, left to right and right to left (a container with dir="rtl"), to see what mirrors and what does not.
// Лаборатория: одни и те же компоненты дважды, слева направо и справа налево (контейнер с dir="rtl"), чтобы видеть, что зеркалится, а что нет.
// Open it at /lab/rtl.html. The panels of Select, Popover and the like are teleported to <body>, so they follow the dir of <html>:
// the switch below sets it there too. / Панели Select, Popover и подобных телепортируются в <body>, поэтому идут за dir у <html>: переключатель ставит и его.
import { createApp, h, ref, reactive } from 'vue'
import {
  TaoAlert, TaoBreadcrumb, TaoButton, TaoCheckbox, TaoCombobox, TaoDate, TaoInput, TaoInputNumber, TaoPagination, TaoProgress,
  TaoRadio, TaoSegmented, TaoSegmentedOption, TaoSelect, TaoSlider, TaoSpoiler, TaoStages, TaoSwitch, TaoTabs, TaoTag, TaoTable,
  TaoTooltip, TaoDropdownMenu, TaoTimeline, TaoCarousel, TaoNav,
} from '@1337exp/taoui'
import '../../src/styles/index.css'
import '../../src/styles/palettes/index.css'

const App = {
  setup() {
    const s = reactive({ text: 'שלום', num: 3, sel: 'a', combo: '', date: '2026-11-05', tab: 'one', seg: 'a', page: 3, slider: 40, on: true, chk: true, radio: 'a', htmlRtl: false })
    const options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }]
    const tabs = [{ value: 'one', label: 'One' }, { value: 'two', label: 'Two' }, { value: 'three', label: 'Three' }]
    const crumbs = [{ label: 'Home', to: '#' }, { label: 'Users', to: '#' }, { label: 'Profile' }]
    const stages = [{ key: 'a', label: 'Paid', status: 'ok' }, { key: 'b', label: 'Packing', status: 'work' }, { key: 'c', label: 'Shipped', status: 'wait' }]
    const menu = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]
    const cols = [{ key: 'a', label: 'Name' }, { key: 'b', label: 'Qty', align: 'right' }]
    const rows = [{ id: 1, a: 'Apples', b: 12 }, { id: 2, a: 'Pears', b: 7 }]

    const specimen = () => h('div', { style: 'display:flex;flex-direction:column;gap:12px' }, [
      h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' }, [
        h(TaoButton, { icon: 'tao-plus' }, () => 'Icon start'),
        h(TaoButton, { variant: 'secondary', iconEnd: 'tao-chevron-right' }, () => 'Icon end'),
        h(TaoTag, { closable: true }, () => 'Tag'),
      ]),
      h(TaoInput, { modelValue: s.text, 'onUpdate:modelValue': (v) => (s.text = v), placeholder: 'Input' }, { prefix: () => h('span', '$'), suffix: () => h('span', 'kg') }),
      h(TaoInputNumber, { modelValue: s.num, 'onUpdate:modelValue': (v) => (s.num = v) }),
      h(TaoSelect, { modelValue: s.sel, 'onUpdate:modelValue': (v) => (s.sel = v), options }),
      h(TaoCombobox, { modelValue: s.combo, 'onUpdate:modelValue': (v) => (s.combo = v), options }),
      h(TaoDate, { modelValue: s.date, 'onUpdate:modelValue': (v) => (s.date = v) }),
      h(TaoTabs, { modelValue: s.tab, 'onUpdate:modelValue': (v) => (s.tab = v), items: tabs }),
      h(TaoSegmented, { modelValue: s.seg, 'onUpdate:modelValue': (v) => (s.seg = v) }, () => [h(TaoSegmentedOption, { value: 'a', label: 'One' }), h(TaoSegmentedOption, { value: 'b', label: 'Two' }), h(TaoSegmentedOption, { value: 'c', label: 'Three' })]),
      h('div', { style: 'display:flex;gap:16px;align-items:center;flex-wrap:wrap' }, [
        h(TaoCheckbox, { modelValue: s.chk, 'onUpdate:modelValue': (v) => (s.chk = v), label: 'Checkbox' }),
        h(TaoSwitch, { modelValue: s.on, 'onUpdate:modelValue': (v) => (s.on = v), label: 'Switch' }),
        h(TaoRadio, { modelValue: s.radio, 'onUpdate:modelValue': (v) => (s.radio = v), value: 'a', label: 'Radio' }),
      ]),
      h(TaoSlider, { modelValue: s.slider, 'onUpdate:modelValue': (v) => (s.slider = v), showValue: true }),
      h(TaoProgress, { progress: 65 }),
      h(TaoPagination, { page: s.page, 'onUpdate:page': (v) => (s.page = v), total: 120, pageSize: 10, size: 'small' }),
      h(TaoBreadcrumb, { items: crumbs }),
      h(TaoStages, { items: stages, direction: 'row' }),
      h(TaoAlert, { closable: true, tone: 'info', title: 'Alert' }, () => 'Text of the alert with a close button'),
      h(TaoTable, { columns: cols, rows }),
      h(TaoSpoiler, { title: 'Spoiler' }, () => 'Hidden text'),
      h('div', { style: 'display:flex;gap:12px' }, [
        h(TaoTooltip, { content: 'Hint on the right', placement: 'right' }, () => h(TaoButton, { variant: 'secondary' }, () => 'Tooltip right')),
        h(TaoDropdownMenu, { items: menu }, { trigger: () => h(TaoButton, { variant: 'secondary' }, () => 'Menu') }),
      ]),
    ])

    return () => h('div', { style: 'padding:16px;background:var(--tao-color-bg);color:var(--tao-color-text);min-height:100vh' }, [
      h('div', { style: 'margin-bottom:12px;font:13px sans-serif' }, [
        h('label', [h('input', { type: 'checkbox', checked: s.htmlRtl, onChange: (e) => { s.htmlRtl = e.target.checked; document.documentElement.dir = s.htmlRtl ? 'rtl' : 'ltr' } }), ' dir="rtl" on <html> too (for teleported panels)']),
      ]),
      h('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:24px' }, [
        h('div', { dir: 'ltr' }, [h('h3', 'LTR'), specimen()]),
        h('div', { dir: 'rtl' }, [h('h3', 'RTL'), specimen()]),
      ]),
    ])
  },
}

document.documentElement.setAttribute('data-tao-mode', 'dark')
createApp(App).mount('#app')
