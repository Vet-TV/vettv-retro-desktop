import type { AppHost, AppId, BeforeCloseHandler, WindowPayload } from '../types'
import * as vfs from '../vfs'
import { windowManager } from '../stores/windowManager'
import { shellConfirm, shellPickFile } from './dialogs'

const guards = new Map<string, Set<BeforeCloseHandler>>()

/** Run a window's onBeforeClose guards; true if close may proceed. */
export async function canClose(windowId: string): Promise<boolean> {
  for (const fn of guards.get(windowId) ?? []) {
    try {
      if (!(await fn())) return false
    } catch (e) {
      console.error('[host] onBeforeClose threw', e)
    }
  }
  return true
}

/** Close a window after its guards approve (used by close button, taskbar, host.close). */
export async function requestClose(windowId: string): Promise<boolean> {
  if (!(await canClose(windowId))) return false
  guards.delete(windowId)
  windowManager.close(windowId)
  return true
}

export function createHost(windowId: string, appId: AppId): AppHost {
  return {
    windowId,
    appId,
    openWindow(id: AppId, payload?: WindowPayload) {
      windowManager.openApp(id, { payload })
    },
    close: async () => {
      await requestClose(windowId)
    },
    setTitle: (t) => windowManager.setTitle(windowId, t),
    setFilePath: (p) => windowManager.setFilePath(windowId, p),
    setPayload: (patch) => windowManager.patchPayload(windowId, patch),
    alert(message, title) {
      windowManager.openApp('alert', { payload: { message, title }, forceNew: true })
    },
    confirm: (m, t) => shellConfirm(m, t),
    vfs,
    onBeforeClose(fn) {
      let set = guards.get(windowId)
      if (!set) guards.set(windowId, (set = new Set()))
      set.add(fn)
      return () => set!.delete(fn)
    },
    pickFile: (opts) => shellPickFile(opts),
  }
}
