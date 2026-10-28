import type { AppManifest } from '../../types'

export default {
  id: 'vintageLab',
  title: 'Vintage Lab — Boot an OS image',
  icon: { glyph: 'V' },
  window: { w: 900, h: 640, flushBody: true, keepAliveWhenMinimized: true },
  startMenu: { order: 35 },
  desktop: { label: 'Vintage Lab', order: 15 },
  load: () => import('../components/VintageLabApp.svelte'),
} satisfies AppManifest
