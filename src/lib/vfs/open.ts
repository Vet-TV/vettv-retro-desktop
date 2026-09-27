import { windowManager } from '../stores/windowManager'
import { isExeExt, isImageExt, isTextExt } from './mime'
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
          `VetTV Retro Desktop does not run .exe or other native programs.\n` +
          `This is a browser desktop shell — not a Windows emulator.\n\n` +
          `For real guest OS / BYO-ISO use, see VetTV Vintage PC.`,
      },
      forceNew: true,
    })
    return
  }

  if (isTextExt(name) || meta.mime?.startsWith('text/')) {
    windowManager.openApp('notepad', { payload: { path: meta.path } })
    return
  }

  if (isImageExt(name) || meta.mime?.startsWith('image/')) {
    windowManager.openApp('imageViewer', {
      payload: { path: meta.path },
      multi: true,
    })
    return
  }

  windowManager.openApp('alert', {
    payload: {
      title: 'Cannot open file',
      message:
        `No app is registered for "${name}" (${extName(name) || 'unknown type'}).\n\n` +
        `Supported in Milestone 2: .txt in Notepad, images (.png/.jpg/.webp/.gif) in Image Viewer.`,
    },
    forceNew: true,
  })
}
