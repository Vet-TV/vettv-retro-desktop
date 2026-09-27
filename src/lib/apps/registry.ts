import type { AppDefinition, AppId } from '../types'

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  about: {
    id: 'about',
    title: 'About VetTV Retro Desktop',
    defaultW: 400,
    defaultH: 280,
  },
  notepad: {
    id: 'notepad',
    title: 'Notepad',
    defaultW: 480,
    defaultH: 360,
  },
  calculator: {
    id: 'calculator',
    title: 'Calculator',
    defaultW: 280,
    defaultH: 340,
  },
  files: {
    id: 'files',
    title: 'Files',
    defaultW: 520,
    defaultH: 380,
  },
  imageViewer: {
    id: 'imageViewer',
    title: 'Image Viewer',
    defaultW: 480,
    defaultH: 400,
    multiInstance: true,
  },
  alert: {
    id: 'alert',
    title: 'VetTV Retro Desktop',
    defaultW: 420,
    defaultH: 220,
    multiInstance: true,
  },
}

export const START_MENU_APPS: AppId[] = [
  'files',
  'notepad',
  'calculator',
  'about',
]

export function appGlyph(appId: AppId | string): string {
  switch (appId) {
    case 'about':
      return 'i'
    case 'notepad':
      return 'N'
    case 'calculator':
      return '#'
    case 'files':
      return 'F'
    case 'imageViewer':
      return 'I'
    case 'alert':
      return '!'
    default:
      return 'A'
  }
}
