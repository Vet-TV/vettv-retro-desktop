import { writable, get } from 'svelte/store'
import type {
  AppId,
  OpenAppOptions,
  PersistedWindow,
  WindowPayload,
  WindowState,
} from '../types'
import { APP_REGISTRY } from '../apps/registry'
import { baseName } from '../vfs/paths'

const STORAGE_KEY = 'vettv-retro-desktop-session-v1'

function genId(): string {
  return `win-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function titleFor(appId: AppId, payload?: WindowPayload, override?: string): string {
  if (override) return override
  if (payload?.title) return payload.title
  const def = APP_REGISTRY[appId]
  if (payload?.path) {
    const name = baseName(payload.path)
    if (appId === 'notepad') return `${name} — Notepad`
    if (appId === 'imageViewer') return `${name} — Image Viewer`
    if (appId === 'files') return `Files — ${payload.path}`
  }
  return def?.title ?? 'App'
}

function loadPersisted(): PersistedWindow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PersistedWindow[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (w) =>
        w &&
        typeof w.id === 'string' &&
        typeof w.title === 'string' &&
        typeof w.appId === 'string' &&
        APP_REGISTRY[w.appId as AppId],
    )
  } catch {
    return []
  }
}

function persist(windows: WindowState[]) {
  const payload: PersistedWindow[] = windows.map((w) => ({
    id: w.id,
    title: w.title,
    appId: w.appId,
    x: w.x,
    y: w.y,
    w: w.w,
    h: w.h,
    minimized: w.minimized,
    maximized: w.maximized,
    restoreX: w.restoreX,
    restoreY: w.restoreY,
    restoreW: w.restoreW,
    restoreH: w.restoreH,
    payload: w.payload,
  }))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode — ignore */
  }
}

function hydrate(persisted: PersistedWindow[]): WindowState[] {
  let z = 10
  return persisted.map((p) => ({
    ...p,
    zIndex: ++z,
  }))
}

function createWindowManager() {
  const initial = hydrate(loadPersisted())
  const { subscribe, update, set } = writable<WindowState[]>(initial)

  let nextZ = initial.reduce((m, w) => Math.max(m, w.zIndex), 10) + 1
  let openOffset = 0

  function commit(mutator: (wins: WindowState[]) => WindowState[]) {
    update((wins) => {
      const next = mutator(wins)
      persist(next)
      return next
    })
  }

  return {
    subscribe,

    openApp(appId: AppId, opts: OpenAppOptions = {}) {
      const def = APP_REGISTRY[appId]
      if (!def) return

      const multi = opts.multi || opts.forceNew || def.multiInstance
      const payload = opts.payload

      if (!multi) {
        const existing = get({ subscribe }).find((w) => w.appId === appId)
        if (existing) {
          commit((wins) =>
            wins.map((w) =>
              w.id === existing.id
                ? {
                    ...w,
                    payload: payload ?? w.payload,
                    title: titleFor(appId, payload ?? w.payload, opts.title),
                    minimized: false,
                    zIndex: nextZ++,
                  }
                : w,
            ),
          )
          return
        }
      } else if (payload?.path && appId !== 'alert') {
        // Reuse window already showing this path
        const existing = get({ subscribe }).find(
          (w) => w.appId === appId && w.payload?.path === payload.path,
        )
        if (existing) {
          this.focus(existing.id)
          if (existing.minimized) this.restore(existing.id)
          return
        }
      }

      openOffset = (openOffset + 1) % 8
      const cascade = openOffset * 24
      const win: WindowState = {
        id: genId(),
        title: titleFor(appId, payload, opts.title),
        appId,
        x: 80 + cascade,
        y: 60 + cascade,
        w: def.defaultW,
        h: def.defaultH,
        minimized: false,
        maximized: false,
        zIndex: nextZ++,
        payload,
      }
      commit((wins) => [...wins, win])
    },

    /** Update payload/title on an open window (e.g. Notepad Save As). */
    setPayload(id: string, payload: WindowPayload, title?: string) {
      commit((wins) =>
        wins.map((w) => {
          if (w.id !== id) return w
          return {
            ...w,
            payload,
            title: title ?? titleFor(w.appId, payload),
          }
        }),
      )
    },

    setTitle(id: string, title: string) {
      commit((wins) => wins.map((w) => (w.id === id ? { ...w, title } : w)))
    },

    focus(id: string) {
      commit((wins) =>
        wins.map((w) =>
          w.id === id ? { ...w, zIndex: nextZ++, minimized: false } : w,
        ),
      )
    },

    close(id: string) {
      commit((wins) => wins.filter((w) => w.id !== id))
    },

    minimize(id: string) {
      commit((wins) =>
        wins.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      )
    },

    restore(id: string) {
      commit((wins) =>
        wins.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: nextZ++ } : w,
        ),
      )
    },

    toggleMaximize(id: string) {
      commit((wins) =>
        wins.map((w) => {
          if (w.id !== id) return w
          if (w.maximized) {
            return {
              ...w,
              maximized: false,
              x: w.restoreX ?? w.x,
              y: w.restoreY ?? w.y,
              w: w.restoreW ?? w.w,
              h: w.restoreH ?? w.h,
              zIndex: nextZ++,
            }
          }
          return {
            ...w,
            maximized: true,
            restoreX: w.x,
            restoreY: w.y,
            restoreW: w.w,
            restoreH: w.h,
            zIndex: nextZ++,
          }
        }),
      )
    },

    move(id: string, x: number, y: number) {
      commit((wins) =>
        wins.map((w) => {
          if (w.id !== id || w.maximized) return w
          return { ...w, x: Math.max(0, x), y: Math.max(0, y) }
        }),
      )
    },

    resize(id: string, w: number, h: number, x?: number, y?: number) {
      commit((wins) =>
        wins.map((win) => {
          if (win.id !== id || win.maximized) return win
          return {
            ...win,
            w: Math.max(180, w),
            h: Math.max(100, h),
            x: x !== undefined ? Math.max(0, x) : win.x,
            y: y !== undefined ? Math.max(0, y) : win.y,
          }
        }),
      )
    },

    /** Taskbar button: restore if minimized, else focus or minimize if already focused */
    taskbarClick(id: string) {
      const wins = get({ subscribe })
      const win = wins.find((w) => w.id === id)
      if (!win) return
      if (win.minimized) {
        this.restore(id)
        return
      }
      const topZ = Math.max(
        ...wins.filter((w) => !w.minimized).map((w) => w.zIndex),
        0,
      )
      if (win.zIndex === topZ) {
        this.minimize(id)
      } else {
        this.focus(id)
      }
    },

    clearSession() {
      set([])
      persist([])
    },
  }
}

export const windowManager = createWindowManager()
