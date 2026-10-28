import type { AppManifest } from '../../types'
import { v2kIcon } from '../icons'

export default {
  id: 'calculator',
  title: 'Calculator',
  icon: v2kIcon('v2k-icon-calculator', '#'),
  window: { w: 260, h: 320, flushBody: true },
  startMenu: { order: 30 },
  desktop: { label: 'Calculator', order: 30 },
  load: () => import('../components/CalculatorApp.svelte'),
} satisfies AppManifest
