import type { AppManifest } from '../../types'
import { v2kIcon } from '../icons'

export default {
  id: 'about',
  title: 'About VetTV Retro Desktop',
  icon: v2kIcon('v2k-icon-about', 'i'),
  window: { w: 440, h: 420 },
  startMenu: { order: 90 },
  desktop: { label: 'About VetTV', order: 90 },
  load: () => import('../components/AboutApp.svelte'),
} satisfies AppManifest
