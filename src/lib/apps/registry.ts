import type { AppId, AppManifest } from '../types'

const modules = import.meta.glob<{ default: AppManifest }>('./*/manifest.ts', { eager: true })

export const APP_REGISTRY: Record<AppId, AppManifest> = {}
for (const [file, mod] of Object.entries(modules)) {
  const m = mod.default
  if (!m?.id) {
    console.warn(`[registry] ${file} has no default AppManifest export`)
    continue
  }
  if (APP_REGISTRY[m.id]) console.warn(`[registry] duplicate app id "${m.id}" in ${file}`)
  APP_REGISTRY[m.id] = m
}

export function getApp(id: AppId): AppManifest | undefined {
  return APP_REGISTRY[id]
}

export function allApps(): AppManifest[] {
  return Object.values(APP_REGISTRY)
}

export const START_MENU_APPS: AppId[] = allApps()
  .filter((a) => a.startMenu)
  .sort(
    (a, b) =>
      (a.startMenu!.order ?? 100) - (b.startMenu!.order ?? 100) || a.title.localeCompare(b.title),
  )
  .map((a) => a.id)

export const DESKTOP_APPS: AppManifest[] = allApps()
  .filter((a) => a.desktop)
  .sort((a, b) => (a.desktop!.order ?? 100) - (b.desktop!.order ?? 100))

/** Best icon URL for a pixel size; null → use appGlyph. */
export function appIcon(appId: AppId, size = 16): string | null {
  const i = APP_REGISTRY[appId]?.icon
  if (!i) return null
  return i.svg ?? (size > 16 ? i.png32 ?? i.png16 : i.png16 ?? i.png32) ?? null
}

export function appGlyph(appId: AppId): string {
  const m = APP_REGISTRY[appId]
  return m?.icon.glyph ?? m?.title.charAt(0).toUpperCase() ?? 'A'
}

/** Normalize '.TXT' / 'txt' → '.txt' */
export function normExt(ext: string): string {
  const e = ext.trim().toLowerCase()
  return e.startsWith('.') ? e : `.${e}`
}
