import DemoSizes from '../guide/DemoSizes.vue'
import DemoPatterns from '../guide/DemoPatterns.vue'
import { h } from 'vue'
import DemoStarters from '../guide/DemoStarters.vue'
import DemoLayers from '../guide/DemoLayers.vue'
import DemoTypography from '../guide/DemoTypography.vue'
import DemoSurface from '../guide/DemoSurface.vue'
import DemoBackgrounds from '../guide/DemoBackgrounds.vue'
import DemoLocale from '../guide/DemoLocale.vue'
import DemoHarmony from '../guide/DemoHarmony.vue'
import DemoA11y from '../guide/DemoA11y.vue'

// one page per starter: the same page component, told which starter it shows
// по странице на каркас: один компонент страницы, ему говорят, какой каркас показать
const starterPage = (id) => ({ name: `DemoStarter-${id}`, render: () => h(DemoStarters, { id }) })
const DemoStarterAppShell = starterPage('app-shell')
const DemoStarterListDetail = starterPage('list-detail')

export const demoById = {
  'size-choice': DemoSizes,
  'patterns': DemoPatterns,
  'starter-app-shell': DemoStarterAppShell,
  'starter-list-detail': DemoStarterListDetail,
  'layers': DemoLayers,
  'typography': DemoTypography,
  'surface': DemoSurface,
  'backgrounds': DemoBackgrounds,
  'locale': DemoLocale,
  'harmony': DemoHarmony,
  'a11y': DemoA11y,
}
