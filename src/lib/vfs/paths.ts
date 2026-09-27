/** Normalize a VFS path to use `/`, collapse slashes, keep drive root as `X:/`. */
export function normalizePath(input: string): string {
  let p = input.replace(/\\/g, '/').trim()
  if (!p) return ''
  // Ensure drive letter form: C: or C:/...
  const driveMatch = /^([A-Za-z]):\/?(.*)$/.exec(p)
  if (driveMatch) {
    const letter = driveMatch[1].toUpperCase()
    let rest = driveMatch[2].replace(/\/+/g, '/').replace(/^\/+|\/+$/g, '')
    if (!rest) return `${letter}:/`
    return `${letter}:/${rest}`
  }
  // Already absolute-ish without drive — leave as-is after slash tidy
  p = p.replace(/\/+/g, '/').replace(/\/+$/g, '')
  return p
}

export function joinPath(parent: string, name: string): string {
  const base = normalizePath(parent)
  const n = name.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  if (!n) return base
  if (base.endsWith(':/')) return `${base}${n}`
  return `${base}/${n}`
}

export function parentPath(path: string): string | null {
  const p = normalizePath(path)
  if (/^[A-Z]:\/$/.test(p)) return null
  const idx = p.lastIndexOf('/')
  if (idx <= 0) return null
  const parent = p.slice(0, idx)
  // C:/Documents → parent C:/  (drive root keeps trailing slash)
  if (/^[A-Z]:$/.test(parent)) return `${parent}/`
  return parent
}

export function baseName(path: string): string {
  const p = normalizePath(path)
  if (/^[A-Z]:\/$/.test(p)) return p.slice(0, 2) // "C:"
  const idx = p.lastIndexOf('/')
  return idx >= 0 ? p.slice(idx + 1) : p
}

export function extName(path: string): string {
  const name = baseName(path)
  const idx = name.lastIndexOf('.')
  if (idx <= 0) return ''
  return name.slice(idx).toLowerCase()
}

export function isDriveRoot(path: string): boolean {
  return /^[A-Z]:\/$/.test(normalizePath(path))
}

/** Sanitize a user-supplied file/folder name (no path separators). */
export function sanitizeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'untitled'
}
