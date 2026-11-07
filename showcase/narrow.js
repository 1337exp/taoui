// A phone-width page (the same 860px the stylesheet switches at): the shell and the books read it to change the structure,
// not only the look: the page menu becomes a bottom sheet, the rare settings fold into one popover.
// Страница шириной с телефон (те же 860px, на которых переключается стиль): оболочка и книги читают это, чтобы менять
// устройство, а не только вид: меню страниц становится нижним листом, редкие настройки складываются в один поповер.
import { ref } from 'vue'

export const NARROW_QUERY = '(max-width: 860px)'

export const narrow = ref(false)

if (typeof window !== 'undefined' && window.matchMedia) {
  const mq = window.matchMedia(NARROW_QUERY)
  narrow.value = mq.matches
  mq.addEventListener('change', (event) => {
    narrow.value = event.matches
  })
}
