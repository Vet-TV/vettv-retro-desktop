import type { AppManifest } from '../../types'

export default {
  id: 'imageViewer',
  title: 'Image Viewer',
  icon: { glyph: 'I' },
  window: { w: 480, h: 400, multiInstance: true, flushBody: true },
  fileTypes: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'],
  load: () => import('../components/ImageViewerApp.svelte'),
} satisfies AppManifest
