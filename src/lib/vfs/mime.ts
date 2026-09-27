import { extName } from './paths'

const EXT_MIME: Record<string, string> = {
  '.txt': 'text/plain',
  '.md': 'text/markdown',
  '.json': 'application/json',
  '.html': 'text/html',
  '.htm': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.ts': 'text/plain',
  '.csv': 'text/csv',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.pdf': 'application/pdf',
  '.exe': 'application/vnd.microsoft.portable-executable',
}

export function mimeFromName(name: string, fallback = 'application/octet-stream'): string {
  const ext = extName(name)
  return EXT_MIME[ext] ?? fallback
}

export function isTextExt(pathOrName: string): boolean {
  const ext = extName(pathOrName)
  return ['.txt', '.md', '.json', '.html', '.htm', '.css', '.js', '.ts', '.csv', '.log'].includes(
    ext,
  )
}

export function isImageExt(pathOrName: string): boolean {
  const ext = extName(pathOrName)
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].includes(ext)
}

export function isAudioExt(pathOrName: string): boolean {
  const ext = extName(pathOrName)
  return ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].includes(ext)
}

export function isExeExt(pathOrName: string): boolean {
  return extName(pathOrName) === '.exe'
}

/** Suggest a VFS destination folder for an uploaded browser File. */
export function suggestUploadFolder(file: File): string {
  const name = file.name
  if (isImageExt(name) || (file.type && file.type.startsWith('image/'))) {
    return 'C:/Media/Pictures'
  }
  if (isAudioExt(name) || (file.type && file.type.startsWith('audio/'))) {
    return 'C:/Media/Music'
  }
  return 'C:/Documents'
}
