import { windowManager } from '../stores/windowManager'
import { isExeExt } from './mime'
import { appForPath } from '../shell/associations'
import { getApp } from '../apps/registry'
import { baseName, extName } from './paths'
import { getMeta } from './vfs'

/**
 * Open a VFS path with the appropriate app.
 * `.exe` never executes — shows an unsupported message.
 */
export async function openVfsPath(path: string): Promise<void> {
  const meta = await getMeta(path)
  if (!meta) {
    windowManager.openApp('alert', {
      payload: {
        message: `File not found:\n${path}`,
        title: 'VetTV Retro Desktop',
      },
      forceNew: true,
    })
    return
  }

  if (meta.kind === 'dir' || meta.kind === 'drive') {
    windowManager.openApp('files', { payload: { path: meta.path } })
    return
  }

  const name = baseName(meta.path)

  if (isExeExt(name)) {
    windowManager.openApp('alert', {
      payload: {
        title: 'Unsupported file type',
        message:
          `"${name}" cannot be opened.\n\n` +
          `The desktop shell does not run host .exe or other native programs.\n` +
          `To boot a legally obtained, bootable 16/32-bit x86 OS image, open Vintage Lab from Start.`,
      },
      forceNew: true,
    })
    return
  }

  const appId = appForPath(meta.path)
  if (appId) {
    openPathWith(meta.path, appId)
    return
  }

  windowManager.openApp('alert', {
    payload: {
      title: 'Cannot open file',
      message:
        `No app is registered for "${name}" (${extName(name) || 'unknown type'}).\n\n` +
        `Use "Open with…" in Files to pick an app.`,
    },
    forceNew: true,
  })
}

/** Open a file path in a specific app (Files "Open with…"). */
export function openPathWith(path: string, appId: string): void {
  const app = getApp(appId)
  if (!app) return
  windowManager.openApp(appId, {
    payload: { path },
    multi: app.window.multiInstance,
  })
}
