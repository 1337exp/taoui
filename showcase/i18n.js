import { ref, watch } from 'vue'
import { setTaoLocale, localeEn, localeRu } from '@1337exp/taoui'

/**
 * Showcase language (not to be confused with the library's own locale, although the
 * two are kept in step: the built-in texts of the components switch with the page).
 *
 * Picked in this order: `?lang=ru` in the URL, the saved choice, the browser language.
 * English is the default.
 */
export const LANGS = ['en', 'ru']

const STORAGE_KEY = 'taoui-showcase-lang'

function detect() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (LANGS.includes(fromUrl)) return fromUrl
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    // storage can be blocked: fall through to the browser language
  }
  return (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export const lang = ref(detect())

watch(
  lang,
  (value) => {
    document.documentElement.setAttribute('lang', value)
    setTaoLocale(value === 'ru' ? localeRu : localeEn)
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // not worth failing over
    }
  },
  { immediate: true },
)

/**
 * A text in the current language. A missing translation falls back to the other
 * language, so a half-translated section never shows an empty hole.
 *
 *   tr('Search…', 'Поиск…')
 *   tr({ en: 'Search…', ru: 'Поиск…' })
 */
export function tr(en, ru) {
  if (en && typeof en === 'object') return tr(en.en, en.ru)
  const value = lang.value === 'ru' ? (ru ?? en) : (en ?? ru)
  return value ?? ''
}
