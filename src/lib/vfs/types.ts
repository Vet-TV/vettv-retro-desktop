/** Virtual filesystem node kinds */
export type VfsKind = 'drive' | 'dir' | 'file'

/** Metadata for any VFS entry (drives, folders, files) */
export interface VfsEntry {
  /** Normalized absolute path, e.g. "C:/Documents/note.txt" or "C:/" */
  path: string
  name: string
  /** Parent path; null for drive roots */
  parent: string | null
  kind: VfsKind
  mime?: string
  size?: number
  modified: number
  /** File payload only — stored in IndexedDB */
  data?: Blob
}

export type VfsMeta = Omit<VfsEntry, 'data'>

export interface UploadResult {
  path: string
  name: string
  mime: string
}
