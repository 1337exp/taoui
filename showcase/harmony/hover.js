// Reading the look of an element under the pointer, with no pointer. A page cannot set `:hover` on an element, so the style
// sheets are read, every rule that mentions `:hover` is copied with `[data-harmony-hover]` in its place (an attribute and a
// pseudo-class weigh the same, so the cascade stays as it is), and the attribute is put on the element and its ancestors, as
// the pointer does.
// Как выглядит элемент под указателем, без указателя. Страница не может поставить `:hover` на элемент, поэтому читаются таблицы
// стилей: каждое правило с `:hover` копируется с `[data-harmony-hover]` на его месте (атрибут и псевдокласс весят одинаково,
// каскад не меняется), а атрибут ставится на элемент и его предков, как это делает указатель.

const ATTRIBUTE = 'data-harmony-hover'
const FREEZE = 'harmony-freeze'

// the grouping rules that wrap a style rule and have to be kept around its copy / правила-обёртки, которые надо сохранить вокруг копии
const WRAPPERS = [
  ['CSSMediaRule', (rule) => `@media ${rule.conditionText}`],
  ['CSSSupportsRule', (rule) => `@supports ${rule.conditionText}`],
  ['CSSLayerBlockRule', (rule) => `@layer ${rule.name}`],
  ['CSSContainerRule', (rule) => `@container ${rule.conditionText}`],
]

/** The copies of the rules with `:hover`, as CSS text. / Копии правил с `:hover` текстом CSS. */
export function hoverCopies(rules) {
  const out = []
  for (const rule of rules) {
    if (rule.selectorText !== undefined) {
      if (rule.selectorText.includes(':hover')) {
        out.push(`${rule.selectorText.replaceAll(':hover', `[${ATTRIBUTE}]`)} { ${rule.style.cssText} }`)
      }
      continue
    }
    const wrapper = WRAPPERS.find(([name]) => rule.constructor.name === name)
    if (wrapper && rule.cssRules) {
      const inner = hoverCopies(rule.cssRules)
      if (inner.length) out.push(`${wrapper[1](rule)} { ${inner.join('\n')} }`)
    }
  }
  return out
}

function allHoverCss() {
  const out = []
  for (const sheet of document.styleSheets) {
    let rules
    try {
      rules = sheet.cssRules
    } catch {
      continue // a sheet of another origin (a font) can not be read / таблицу с другого источника (шрифт) прочесть нельзя
    }
    out.push(...hoverCopies(rules))
  }
  return out.join('\n')
}

/**
 * Runs `read()` while `el` is hovered. Transitions are frozen for the moment, so the colours are the ones the hover ends
 * with, not the ones half way.
 * Выполняет `read()`, пока `el` под указателем. Переходы на этот момент заморожены: цвета те, которыми заканчивается hover.
 */
export function whileHovered(el, read) {
  const sheet = document.createElement('style')
  sheet.textContent = `${allHoverCss()}\n*, *::before, *::after { transition: none !important; } /* ${FREEZE} */`
  document.head.appendChild(sheet)
  const chain = []
  for (let node = el; node && node !== document.documentElement; node = node.parentElement) {
    node.setAttribute(ATTRIBUTE, '')
    chain.push(node)
  }
  try {
    return read()
  } finally {
    for (const node of chain) node.removeAttribute(ATTRIBUTE)
    sheet.remove()
  }
}
