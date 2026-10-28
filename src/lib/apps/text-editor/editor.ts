/** Self-contained VetPad logic (no shell imports) for easy manifest migration. */
import { exists, joinPath, readText, sanitizeName, writeFile } from '../../vfs'

export const APP_NAME = 'VetPad'
export const DEFAULT_DIR = 'C:/Documents'
export const FONT_SIZES = [10, 12, 14, 16, 20, 24]

export function titleFor(path: string | undefined, dirty: boolean): string {
  const name = path ? path.split('/').pop() : 'Untitled'
  return `${dirty ? '*' : ''}${name} — ${APP_NAME}`
}

export function lineCol(text: string, caret: number): { line: number; col: number } {
  const before = text.slice(0, caret)
  const line = before.split('\n').length
  const col = caret - before.lastIndexOf('\n')
  return { line, col }
}

export function timeDate(d = new Date()): string {
  return `${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ${d.toLocaleDateString()}`
}

export function resolveSaveName(raw: string): string {
  let name = sanitizeName(raw.trim() || 'Untitled.txt')
  if (!/\.[^.]+$/.test(name)) name += '.txt'
  return name
}

export function toPath(nameOrPath: string): string {
  return nameOrPath.includes(':/') ? nameOrPath : joinPath(DEFAULT_DIR, resolveSaveName(nameOrPath))
}

export const loadDoc = (p: string) => readText(p)
export const saveDoc = (p: string, text: string) => writeFile(p, text, 'text/plain')
export const docExists = (p: string) => exists(p)
