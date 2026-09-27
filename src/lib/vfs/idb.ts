import type { VfsEntry } from './types'

const DB_NAME = 'vettv-vfs-v1'
const DB_VERSION = 1
const STORE = 'entries'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'path' })
        store.createIndex('parent', 'parent', { unique: false })
        store.createIndex('kind', 'kind', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
  return dbPromise
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

export async function idbGet(path: string): Promise<VfsEntry | undefined> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(path)
    req.onsuccess = () => resolve(req.result as VfsEntry | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function idbPut(entry: VfsEntry): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put(entry)
  await txDone(tx)
}

export async function idbPutMany(entries: VfsEntry[]): Promise<void> {
  if (entries.length === 0) return
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  for (const e of entries) store.put(e)
  await txDone(tx)
}

export async function idbDelete(path: string): Promise<void> {
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).delete(path)
  await txDone(tx)
}

export async function idbDeleteMany(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const db = await openDb()
  const tx = db.transaction(STORE, 'readwrite')
  const store = tx.objectStore(STORE)
  for (const p of paths) store.delete(p)
  await txDone(tx)
}

export async function idbListByParent(parent: string | null): Promise<VfsEntry[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const idx = tx.objectStore(STORE).index('parent')
    const req = idx.getAll(parent)
    req.onsuccess = () => resolve((req.result as VfsEntry[]) ?? [])
    req.onerror = () => reject(req.error)
  })
}

export async function idbCount(): Promise<number> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbGetAll(): Promise<VfsEntry[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as VfsEntry[]) ?? [])
    req.onerror = () => reject(req.error)
  })
}
