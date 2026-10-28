import { writable } from 'svelte/store'
import type { AppId, PickFileOptions } from '../types'

export type ShellDialog =
  | { id: number; kind: 'confirm'; title: string; message: string; resolve: (v: boolean) => void }
  | { id: number; kind: 'pickFile'; opts: PickFileOptions; resolve: (v: string | null) => void }
  | {
      id: number
      kind: 'openWith'
      path: string
      resolve: (v: { appId: AppId; remember: boolean } | null) => void
    }

type NewDialog = ShellDialog extends infer D ? (D extends ShellDialog ? Omit<D, 'id'> : never) : never

let seq = 0
export const dialogs = writable<ShellDialog[]>([])

function push(d: NewDialog) {
  dialogs.update((list) => [...list, { ...d, id: ++seq } as ShellDialog])
}

export function dismiss(id: number) {
  dialogs.update((list) => list.filter((d) => d.id !== id))
}

export function shellConfirm(message: string, title = 'VetTV Retro Desktop'): Promise<boolean> {
  return new Promise((resolve) => push({ kind: 'confirm', title, message, resolve }))
}

export function shellPickFile(opts: PickFileOptions): Promise<string | null> {
  return new Promise((resolve) => push({ kind: 'pickFile', opts, resolve }))
}

export function shellOpenWith(path: string): Promise<{ appId: AppId; remember: boolean } | null> {
  return new Promise((resolve) => push({ kind: 'openWith', path, resolve }))
}
