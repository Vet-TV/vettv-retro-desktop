import type { AppManifest } from '../../types'

export default {
  id: 'textEditor',
  title: 'VetPad',
  icon: { svg: `${import.meta.env.BASE_URL}apps/text-editor/vetpad.svg`, glyph: 'V' },
  window: { w: 520, h: 380, multiInstance: true, flushBody: true },
  startMenu: { order: 25 },
  fileTypes: ['.txt', '.md', '.log'],
  load: () => import('../components/TextEditorApp.svelte'),
} satisfies AppManifest
