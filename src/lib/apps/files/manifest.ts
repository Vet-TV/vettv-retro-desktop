import type { AppManifest } from '../../types'
import { v2kIcon } from '../icons'

export default {
  id: 'files',
  title: 'Files',
  icon: v2kIcon('v2k-icon-files', 'F'),
  window: { w: 520, h: 380, flushBody: true },
  startMenu: { order: 10 },
  desktop: { label: 'Files', order: 10 },
  titleForPath: (p) => `Files — ${p}`,
  load: () => import('../components/FilesApp.svelte'),
} satisfies AppManifest
