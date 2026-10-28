import { allApps, getApp } from '../apps/registry'
import { appsForPath } from '../shell/associations'
import type { AppManifest } from '../types'

export { allApps }

/** Manifests that declare this file's extension. */
export function appsFor(path: string): AppManifest[] {
  return appsForPath(path)
    .map((id) => getApp(id))
    .filter((a): a is AppManifest => !!a)
}
