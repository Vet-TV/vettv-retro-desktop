import { writable } from 'svelte/store'
import {
  idbCount,
  idbDeleteMany,
  idbGet,
  idbGetAll,
  idbListByParent,
  idbPut,
  idbPutMany,
} from './idb'
import { isAudioExt, isImageExt, mimeFromName, suggestUploadFolder } from './mime'
import {
  baseName,
  joinPath,
  normalizePath,
  parentPath,
  sanitizeName,
} from './paths'
import type { UploadResult, VfsEntry, VfsMeta } from './types'

/** Bumps whenever VFS mutates so UI can refresh. */
export const vfsRevision = writable(0)

function bump() {
  vfsRevision.update((n) => n + 1)
}

function toMeta(e: VfsEntry): VfsMeta {
  const { data: _data, ...meta } = e
  return meta
}

function now(): number {
  return Date.now()
}

const SEED_README = `Welcome to VetTV Retro Desktop

This is your Documents folder on the virtual C: drive.
Files you save in Notepad or drag onto the desktop live here
(or under C:/Media for pictures and music).

VFS data is stored in this browser (IndexedDB) and survives refresh.
Window layout is restored separately from the VFS.

— VetTV / Vet2000
`

let ready: Promise<void> | null = null

async function seedIfEmpty(): Promise<void> {
  const count = await idbCount()
  if (count > 0) return

  const t = now()
  const entries: VfsEntry[] = [
    { path: 'C:/', name: 'C:', parent: null, kind: 'drive', modified: t },
    { path: 'D:/', name: 'D:', parent: null, kind: 'drive', modified: t },
    { path: 'C:/Documents', name: 'Documents', parent: 'C:/', kind: 'dir', modified: t },
    { path: 'C:/Media', name: 'Media', parent: 'C:/', kind: 'dir', modified: t },
    {
      path: 'C:/Media/Pictures',
      name: 'Pictures',
      parent: 'C:/Media',
      kind: 'dir',
      modified: t,
    },
    { path: 'C:/Media/Music', name: 'Music', parent: 'C:/Media', kind: 'dir', modified: t },
  ]

  const readmeBlob = new Blob([SEED_README], { type: 'text/plain' })
  entries.push({
    path: 'C:/Documents/Welcome.txt',
    name: 'Welcome.txt',
    parent: 'C:/Documents',
    kind: 'file',
    mime: 'text/plain',
    size: readmeBlob.size,
    modified: t,
    data: readmeBlob,
  })

  await idbPutMany(entries)
}

export function initVfs(): Promise<void> {
  if (!ready) {
    ready = seedIfEmpty().then(() => {
      bump()
    })
  }
  return ready
}

export async function listDrives(): Promise<VfsMeta[]> {
  await initVfs()
  const all = await idbListByParent(null)
  return all
    .filter((e) => e.kind === 'drive')
    .map(toMeta)
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function listDir(path: string): Promise<VfsMeta[]> {
  await initVfs()
  const p = normalizePath(path)
  const children = await idbListByParent(p)
  return children
    .map(toMeta)
    .sort((a, b) => {
      if (a.kind !== b.kind) {
        const order = { drive: 0, dir: 1, file: 2 } as const
        return order[a.kind] - order[b.kind]
      }
      return a.name.localeCompare(b.name)
    })
}

export async function exists(path: string): Promise<boolean> {
  await initVfs()
  const e = await idbGet(normalizePath(path))
  return !!e
}

export async function getMeta(path: string): Promise<VfsMeta | null> {
  await initVfs()
  const e = await idbGet(normalizePath(path))
  return e ? toMeta(e) : null
}

export async function readFile(path: string): Promise<Blob> {
  await initVfs()
  const e = await idbGet(normalizePath(path))
  if (!e || e.kind !== 'file') throw new Error(`Not a file: ${path}`)
  if (!e.data) return new Blob([])
  return e.data
}

export async function readText(path: string): Promise<string> {
  const blob = await readFile(path)
  return blob.text()
}

async function ensureParentDirs(path: string): Promise<void> {
  const parent = parentPath(path)
  if (!parent) return
  const existing = await idbGet(parent)
  if (existing) {
    if (existing.kind === 'file') throw new Error(`Parent is a file: ${parent}`)
    return
  }
  await ensureParentDirs(parent)
  const name = baseName(parent)
  await idbPut({
    path: parent,
    name: isDriveLike(parent) ? name : name,
    parent: parentPath(parent),
    kind: isDriveLike(parent) ? 'drive' : 'dir',
    modified: now(),
  })
}

function isDriveLike(path: string): boolean {
  return /^[A-Z]:\/$/.test(path)
}

export async function mkdir(path: string): Promise<void> {
  await initVfs()
  const p = normalizePath(path)
  if (isDriveLike(p)) throw new Error('Cannot mkdir a drive root')
  const existing = await idbGet(p)
  if (existing) {
    if (existing.kind === 'file') throw new Error(`Path is a file: ${p}`)
    return
  }
  await ensureParentDirs(p)
  await idbPut({
    path: p,
    name: baseName(p),
    parent: parentPath(p),
    kind: 'dir',
    modified: now(),
  })
  bump()
}

export async function writeFile(
  path: string,
  data: Blob | string,
  mime?: string,
): Promise<void> {
  await initVfs()
  const p = normalizePath(path)
  if (isDriveLike(p)) throw new Error('Cannot write to a drive root')
  const existing = await idbGet(p)
  if (existing && existing.kind !== 'file') {
    throw new Error(`Path is a directory: ${p}`)
  }
  await ensureParentDirs(p)
  const blob =
    typeof data === 'string'
      ? new Blob([data], { type: mime || 'text/plain' })
      : data
  const resolvedMime = mime || blob.type || mimeFromName(baseName(p))
  await idbPut({
    path: p,
    name: baseName(p),
    parent: parentPath(p),
    kind: 'file',
    mime: resolvedMime,
    size: blob.size,
    modified: now(),
    data: blob,
  })
  bump()
}

/** Collect path + all descendants (for recursive delete). */
async function collectTree(root: string): Promise<string[]> {
  const result: string[] = [root]
  const queue = [root]
  while (queue.length) {
    const cur = queue.shift()!
    const kids = await idbListByParent(cur)
    for (const k of kids) {
      result.push(k.path)
      if (k.kind !== 'file') queue.push(k.path)
    }
  }
  return result
}

export async function remove(path: string): Promise<void> {
  await initVfs()
  const p = normalizePath(path)
  if (isDriveLike(p)) throw new Error('Cannot delete a drive')
  const e = await idbGet(p)
  if (!e) return
  const paths = e.kind === 'file' ? [p] : await collectTree(p)
  // Delete deepest first (optional with key delete)
  paths.sort((a, b) => b.length - a.length)
  await idbDeleteMany(paths)
  bump()
}

export async function rename(path: string, newName: string): Promise<string> {
  await initVfs()
  const p = normalizePath(path)
  if (isDriveLike(p)) throw new Error('Cannot rename a drive')
  const e = await idbGet(p)
  if (!e) throw new Error(`Not found: ${p}`)
  const parent = parentPath(p)
  if (!parent) throw new Error('No parent')
  const safe = sanitizeName(newName)
  const dest = joinPath(parent, safe)
  if (dest === p) return p
  if (await idbGet(dest)) throw new Error(`Already exists: ${dest}`)

  if (e.kind === 'file') {
    await idbPut({ ...e, path: dest, name: safe, parent, modified: now() })
    await idbDeleteMany([p])
    bump()
    return dest
  }

  // Directory: move entire tree
  const tree = await collectTree(p)
  const all = await idbGetAll()
  const byPath = new Map(all.map((x) => [x.path, x]))
  const updates: VfsEntry[] = []
  const deletes: string[] = []

  for (const oldPath of tree) {
    const node = byPath.get(oldPath)
    if (!node) continue
    const suffix = oldPath.slice(p.length)
    const newPath = dest + suffix
    updates.push({
      ...node,
      path: newPath,
      name: oldPath === p ? safe : node.name,
      parent: parentPath(newPath),
      modified: now(),
    })
    deletes.push(oldPath)
  }

  await idbPutMany(updates)
  await idbDeleteMany(deletes)
  bump()
  return dest
}

/** Unique name if conflict: file.txt → file (1).txt */
export async function uniqueChildPath(folder: string, name: string): Promise<string> {
  const safe = sanitizeName(name)
  let candidate = joinPath(folder, safe)
  if (!(await idbGet(candidate))) return candidate

  const dot = safe.lastIndexOf('.')
  const stem = dot > 0 ? safe.slice(0, dot) : safe
  const ext = dot > 0 ? safe.slice(dot) : ''
  for (let i = 1; i < 1000; i++) {
    candidate = joinPath(folder, `${stem} (${i})${ext}`)
    if (!(await idbGet(candidate))) return candidate
  }
  return joinPath(folder, `${stem} (${Date.now()})${ext}`)
}

export async function uploadBrowserFiles(
  files: File[] | FileList,
  destFolder?: string,
): Promise<UploadResult[]> {
  await initVfs()
  const list = Array.from(files)
  const results: UploadResult[] = []

  for (const file of list) {
    const folder = destFolder ? normalizePath(destFolder) : suggestUploadFolder(file)
    await mkdir(folder).catch(() => {
      /* may already exist */
    })
    // ensure folder exists even if mkdir no-op
    const folderMeta = await idbGet(folder)
    if (!folderMeta) {
      await ensureParentDirs(joinPath(folder, 'x'))
      await idbPut({
        path: folder,
        name: baseName(folder),
        parent: parentPath(folder),
        kind: 'dir',
        modified: now(),
      })
    }

    const path = await uniqueChildPath(folder, file.name)
    const mime = file.type || mimeFromName(file.name)
    await writeFile(path, file, mime)
    results.push({ path, name: baseName(path), mime })
  }

  return results
}

export { suggestUploadFolder, isImageExt, isAudioExt, mimeFromName }
