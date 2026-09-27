/** App identifiers */
export type AppId =
  | 'about'
  | 'notepad'
  | 'calculator'
  | 'files'
  | 'imageViewer'
  | 'alert'

/** Optional per-window payload (file path, alert message, etc.) */
export interface WindowPayload {
  path?: string
  message?: string
  title?: string
}

export interface WindowState {
  id: string
  title: string
  appId: AppId
  x: number
  y: number
  w: number
  h: number
  minimized: boolean
  maximized: boolean
  /** Saved geometry before maximize */
  restoreX?: number
  restoreY?: number
  restoreW?: number
  restoreH?: number
  zIndex: number
  payload?: WindowPayload
}

export interface PersistedWindow {
  id: string
  title: string
  appId: AppId
  x: number
  y: number
  w: number
  h: number
  minimized: boolean
  maximized: boolean
  restoreX?: number
  restoreY?: number
  restoreW?: number
  restoreH?: number
  payload?: WindowPayload
}

export interface AppDefinition {
  id: AppId
  title: string
  defaultW: number
  defaultH: number
  /** Allow multiple windows of this app */
  multiInstance?: boolean
}

export interface OpenAppOptions {
  payload?: WindowPayload
  /** Force a new window even for single-instance apps */
  forceNew?: boolean
  /** Prefer multi-instance for this open (e.g. image viewer) */
  multi?: boolean
  title?: string
}
