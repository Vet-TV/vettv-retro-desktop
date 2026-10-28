/** Pure VetPad helpers (no shell or VFS imports). */
export const APP_NAME = 'VetPad'
export const DEFAULT_DIR = 'C:/Documents'
export const FILE_TYPES = ['.txt', '.md', '.log']
export const FONT_SIZES = [10, 12, 14, 16, 20, 24]

export function titleFor(path: string | undefined, dirty: boolean): string {
  const name = path ? path.split('/').pop() : 'Untitled'
  return `${dirty ? '*' : ''}${name} — ${APP_NAME}`
}

export function lineCol(text: string, caret: number): { line: number; col: number } {
  const before = text.slice(0, caret)
  return { line: before.split('\n').length, col: caret - before.lastIndexOf('\n') }
}

export function timeDate(d = new Date()): string {
  return `${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} ${d.toLocaleDateString()}`
}
