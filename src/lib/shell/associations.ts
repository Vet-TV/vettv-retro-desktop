import { writable, get } from 'svelte/store'
import type { AppId } from '../types'
import { allApps, getApp, normExt } from '../apps/registry'
import { extName } from '../vfs/paths'

const STORAGE_KEY = 'vettv-retro-desktop-assoc-v1'

/** Default ext → appId from manifests' fileTypes (first manifest wins, sorted by id). */
export function defaultAssociations(): Record<string, AppId> {
  const map: Record<string, AppId> = {}
  for (const app of [...allApps()].sort((a, b) => a.id.localeCompare(b.id))) {
    for (const ext of app.fileTypes ?? []) {
      const e = normExt(ext)
      if (!map[e]) map[e] = app.id
    }
  }
  return map
}

function loadOverrides(): Record<string, AppId> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, AppId>) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** User overrides (persisted in localStorage). */
export const associationOverrides = writable<Record<string, AppId>>(loadOverrides())
associationOverrides.subscribe((v) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
})

export function setAssociation(ext: string, appId: AppId | null) {
  const e = normExt(ext)
  associationOverrides.update((o) => {
    const next = { ...o }
    if (appId) next[e] = appId
    else delete next[e]
    return next
  })
}

/** App that opens `path` by default, or null. */
export function appForPath(path: string): AppId | null {
  const ext = extName(path).toLowerCase()
  if (!ext) return null
  const o = get(associationOverrides)[ext]
  if (o && getApp(o)) return o
  return defaultAssociations()[ext] ?? null
}

/** Apps that declare support for this file's extension (for "Open with…"). */
export function appsForPath(path: string): AppId[] {
  const ext = extName(path).toLowerCase()
  return allApps()
    .filter((a) => (a.fileTypes ?? []).some((t) => normExt(t) === ext))
    .map((a) => a.id)
}
