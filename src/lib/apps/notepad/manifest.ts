import type { AppManifest } from '../../types'
import { v2kIcon } from '../icons'

export default {
  id: 'notepad',
  title: 'Notepad',
  icon: v2kIcon('v2k-icon-notepad', 'N'),
  window: { w: 480, h: 360, flushBody: true },
  startMenu: { order: 20 },
  desktop: { label: 'Notepad', order: 20 },
  fileTypes: ['.txt', '.md', '.json', '.html', '.htm', '.css', '.js', '.ts', '.csv', '.log'],
  load: () => import('../components/NotepadApp.svelte'),
} satisfies AppManifest
