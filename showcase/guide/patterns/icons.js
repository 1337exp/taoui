// The glyphs the examples use that the kit does not ship (it has only the alignment ones for text): the app's own icons.
// Значки, которые нужны примерам и которых нет в наборе: свои иконки приложения.
import { registerTaoIcons } from '@1337exp/taoui'

registerTaoIcons({
  bold: { body: '<path d="M7.5 5h5.5a3.5 3.5 0 010 7H7.5zM7.5 12h6.5a3.5 3.5 0 010 7H7.5z"/>' },
  italic: { body: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>' },
})
