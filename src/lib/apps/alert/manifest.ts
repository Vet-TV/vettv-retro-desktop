import type { AppManifest } from '../../types'

export default {
  id: 'alert',
  title: 'VetTV Retro Desktop',
  icon: { glyph: '!' },
  window: { w: 420, h: 220, multiInstance: true, resizable: false },
  load: () => import('../components/AlertApp.svelte'),
} satisfies AppManifest
