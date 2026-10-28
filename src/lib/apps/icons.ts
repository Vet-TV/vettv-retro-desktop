/** Vet2000 art batch 1 — public theme asset URLs (SVG preferred). */
import type { AppIcon } from '../types'

const BASE = import.meta.env.BASE_URL

export function themeUrl(rel: string): string {
  return `${BASE}themes/vet2000/${rel}`
}

export const V2K_WALLPAPER = themeUrl('v2k-wallpaper-crt.png')
export const V2K_START_V = themeUrl('svg/v2k-start-v.svg')
export const V2K_START_WORDMARK = 'Vet2000'

/** Build an AppIcon from a Vet2000 asset stem, e.g. 'v2k-icon-files'. */
export function v2kIcon(stem: string, glyph?: string): AppIcon {
  return {
    svg: themeUrl(`svg/${stem}.svg`),
    png16: themeUrl(`png16/${stem}-16.png`),
    png32: themeUrl(`png32/${stem}-32.png`),
    glyph,
  }
}
