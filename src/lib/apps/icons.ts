/** Vet2000 art batch 1 — public theme asset URLs (SVG preferred). */

const BASE = import.meta.env.BASE_URL

function themeUrl(rel: string): string {
  return `${BASE}themes/vet2000/${rel}`
}

export const V2K_WALLPAPER = themeUrl('v2k-wallpaper-crt.png')
export const V2K_START_V = themeUrl('svg/v2k-start-v.svg')
export const V2K_START_WORDMARK = 'Vet2000'

const APP_ICONS: Record<string, string> = {
  files: themeUrl('svg/v2k-icon-files.svg'),
  notepad: themeUrl('svg/v2k-icon-notepad.svg'),
  calculator: themeUrl('svg/v2k-icon-calculator.svg'),
  about: themeUrl('svg/v2k-icon-about.svg'),
}

/** SVG chrome icon for desktop / Start / titlebar / taskbar; null → glyph fallback. */
export function appIcon(appId: string): string | null {
  return APP_ICONS[appId] ?? null
}
