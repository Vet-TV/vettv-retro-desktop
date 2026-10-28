import type { Component } from 'svelte'

/** App identifiers — any string id declared by a manifest. */
export type AppId = string

/** Optional per-window payload (file path, alert message, etc.). Must be JSON-serializable. */
export interface WindowPayload {
  path?: string
  message?: string
  title?: string
  [key: string]: unknown
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

export type PersistedWindow = Omit<WindowState, 'zIndex'>

export interface AppIcon {
  /** Preferred scalable icon URL */
  svg?: string
  png16?: string
  png32?: string
  /** One-character fallback when no image exists */
  glyph?: string
}

export interface AppWindowOptions {
  w: number
  h: number
  minW?: number
  minH?: number
  resizable?: boolean
  multiInstance?: boolean
  /** Body has no padding / white inset (app draws its own chrome) */
  flushBody?: boolean
  /** Keep the app mounted (hidden) while minimized, e.g. a running emulator */
  keepAliveWhenMinimized?: boolean
}

export interface PickFileOptions {
  mode: 'open' | 'save'
  /** Allowed extensions, e.g. ['.txt', 'md'] — filter only */
  extensions?: string[]
  /** Starting folder or full file path (save mode pre-fills the name) */
  defaultPath?: string
  title?: string
}

export type BeforeCloseHandler = () => boolean | Promise<boolean>

/** Context the shell passes to every app as the `host` prop. */
export interface AppHost {
  readonly windowId: string
  readonly appId: AppId
  openWindow(appId: AppId, payload?: WindowPayload): void
  /** Close this window (runs onBeforeClose guards). */
  close(): Promise<void>
  setTitle(title: string): void
  /** Update persisted payload.path and the window title. Pass null to clear. */
  setFilePath(path: string | null): void
  /** Merge extra keys into the persisted payload. */
  setPayload(patch: Partial<WindowPayload>): void
  alert(message: string, title?: string): void
  /** Shell confirm dialog (modal over this window). */
  confirm(message: string, title?: string): Promise<boolean>
  vfs: typeof import('./vfs')
  /** Register a guard; return false to cancel close. Returns an unregister fn. */
  onBeforeClose(fn: BeforeCloseHandler): () => void
  pickFile(opts: PickFileOptions): Promise<string | null>
}

/** Props every app component receives. */
export interface AppProps {
  host: AppHost
  windowId: string
  payload?: WindowPayload
  path?: string
  message?: string
  title?: string
}

export interface AppManifest {
  id: AppId
  title: string
  icon: AppIcon
  window: AppWindowOptions
  /** Omit to hide from Start menu */
  startMenu?: { folder?: string; order?: number }
  /** Show on desktop with this label */
  desktop?: { label: string; order?: number }
  /** File extensions this app can open, e.g. ['.txt'] */
  fileTypes?: string[]
  /** Title for a window showing `path`; default `${name} — ${title}` */
  titleForPath?: (path: string) => string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: () => Promise<{ default: Component<any> }>
}

export interface OpenAppOptions {
  payload?: WindowPayload
  /** Force a new window even for single-instance apps */
  forceNew?: boolean
  /** Prefer multi-instance for this open (e.g. image viewer) */
  multi?: boolean
  title?: string
}
