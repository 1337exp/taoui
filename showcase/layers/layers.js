// The style layers of the kit, in the order src/styles/index.css imports them. The code shown is the real file (a `?raw`
// import), so the page cannot drift from the library; tests/showcase.layers.test.ts keeps the order equal to index.css.
// Слои стилей набора в том порядке, в котором их подключает src/styles/index.css. Показан настоящий файл (импорт `?raw`),
// поэтому страница не разойдётся с библиотекой; tests/showcase.layers.test.ts держит порядок равным index.css.
import primitives from '../../src/styles/tokens/primitives.css?raw'
import semantic from '../../src/styles/tokens/semantic.css?raw'
import dark from '../../src/styles/themes/dark.css?raw'
import light from '../../src/styles/themes/light.css?raw'
import size from '../../src/styles/contexts/size.css?raw'
import tone from '../../src/styles/contexts/tone.css?raw'
import surface from '../../src/styles/contexts/surface.css?raw'
import frames from '../../src/styles/contexts/frames.css?raw'
import atmosphere from '../../src/styles/contexts/atmosphere.css?raw'
import typography from '../../src/styles/typography.css?raw'
import base from '../../src/styles/base.css?raw'

/** `touch`: no (leave it), rare (a good reason), yes (this is the API). / no — не трогать, rare — по причине, yes — это API. */
export const LAYERS = [
  {
    id: 'primitives',
    touch: 'no',
    files: [{ name: 'tokens/primitives.css', source: primitives }],
    en: { role: 'the raw palette and the scales of space, radius, shadow and type', hint: 'usually no', note: 'Raw values with no meaning attached. A component never reads them; they are what the roles below are made from.' },
    ru: { role: 'сырая палитра и шкалы пространства, скруглений, теней и кегля', hint: 'обычно нет', note: 'Сырые значения без смысла. Компонент их не читает; из них сделаны роли ниже.' },
  },
  {
    id: 'semantic',
    touch: 'rare',
    files: [{ name: 'tokens/semantic.css', source: semantic }],
    en: { role: 'roles that do not depend on the theme: radii, shadows, font, motion', hint: 'rarely', note: 'Radii, shadows, type and motion by role. A component reads these and the colour roles, never the primitives.' },
    ru: { role: 'роли, не зависящие от темы: скругления, тени, шрифт, движение', hint: 'редко', note: 'Скругления, тени, шрифт и движение по ролям. Компонент читает их и цветовые роли, но не примитивы.' },
  },
  {
    id: 'themes',
    touch: 'yes',
    files: [
      { name: 'themes/dark.css', source: dark },
      { name: 'themes/light.css', source: light },
    ],
    en: { role: 'the colour roles of a theme: accent, surface, text, border, statuses', hint: 'yes: this is the theming API', note: 'Every role is declared here and again in light.css. Your own theme is a file like these under its own [data-tao-theme] name.' },
    ru: { role: 'цветовые роли темы: accent, surface, text, border, статусы', hint: 'да: это API темизации', note: 'Каждая роль объявлена здесь и ещё раз в light.css. Своя тема — такой же файл под своим именем [data-tao-theme].' },
  },
  {
    id: 'contexts',
    touch: 'rare',
    files: [
      { name: 'contexts/size.css', source: size },
      { name: 'contexts/tone.css', source: tone },
      { name: 'contexts/surface.css', source: surface },
      { name: 'contexts/frames.css', source: frames },
      { name: 'contexts/atmosphere.css', source: atmosphere },
    ],
    en: { role: 'what a control reads to learn its size, density, tone, material and how loud its frames are', hint: 'rarely', note: 'Classes that set private --_tao-* variables. A context that combines two axes recomputes on every class of both.' },
    ru: { role: 'что читает контрол, чтобы узнать свой размер, плотность, тон, материал и насколько громки его рамки', hint: 'редко', note: 'Классы, которые задают приватные переменные --_tao-*. Контекст на двух осях пересчитывается на каждом классе обеих.' },
  },
  {
    id: 'base',
    touch: 'rare',
    files: [
      { name: 'typography.css', source: typography },
      { name: 'base.css', source: base },
    ],
    en: { role: 'the global reset and the opt-in prose classes', hint: 'rarely', note: 'The reset is box-sizing, links, scrollbar and the tap flash, all through tokens, so a theme switch reaches it too.' },
    ru: { role: 'глобальный сброс и классы типографики по выбору', hint: 'редко', note: 'Сброс — это box-sizing, ссылки, скроллбар и вспышка касания, всё через токены, так что смена темы доходит и сюда.' },
  },
]
