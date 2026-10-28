# VetTV Retro Desktop — App API (v1)

For app authors (parody apps, small web games). The shell owns the window manager,
theme engine and skins; apps plug in through a **manifest** and talk to the shell only
through the **`host`** prop. Original art only — no Microsoft assets, never claim to be Windows.

## 1. Register an app

Create `src/lib/apps/<app>/manifest.ts` with a default export. The registry
(`src/lib/apps/registry.ts`) picks up every `./*/manifest.ts` via `import.meta.glob` —
no edits to shell files needed.

```ts
import type { AppManifest } from '../../types'

export default {
  id: 'textEditor',                    // unique, stable (persisted in sessions)
  title: 'VetPad',                     // default window title / Start label
  icon: {
    svg: `${import.meta.env.BASE_URL}apps/text-editor/vetpad.svg`,
    png16: undefined, png32: undefined, // optional raster fallbacks
    glyph: 'V',                        // 1-char fallback when no image
  },
  window: {
    w: 520, h: 380,                    // default size
    minW: 240, minH: 160,              // optional (default 180 × 100)
    resizable: true,                   // false hides resize handles + maximize
    multiInstance: true,               // false → re-opening focuses the existing window
    flushBody: true,                   // no 8px padding / white inset; app draws its own chrome
  },
  startMenu: { folder: 'Accessories', order: 25 }, // omit to hide from Start (folder reserved, flat for now)
  desktop: { label: 'VetPad', order: 25 },         // optional desktop icon
  fileTypes: ['.txt', '.md'],          // extensions this app can open (dot optional)
  titleForPath: (p) => `${p.split('/').pop()} - VetPad`, // optional; default "name — title"
  load: () => import('../text-editor/VetPad.svelte'),     // lazy; own chunk
} satisfies AppManifest
```

Put app code + assets in your own folder (`src/lib/apps/<app>/`, `public/apps/<app>/`).

## 2. Props every app receives

| prop | type | notes |
|---|---|---|
| `host` | `AppHost` | the only way to talk to the shell |
| `windowId` | `string` | |
| `payload` | `WindowPayload \| undefined` | persisted JSON (`path`, `message`, `title`, any extra keys) |
| `path` | `string \| undefined` | shorthand for `payload.path` — **reactive**: changes when Files/Open with/`setFilePath` change it |
| `message`, `title` | `string \| undefined` | used by `alert` |

Declare only what you use: `let { host, path }: { host: AppHost; path?: string } = $props()`.

## 3. `host` (AppHost)

```ts
host.windowId / host.appId
host.openWindow(appId, payload?)        // open another app, e.g. ('files', { path: 'C:/Documents' })
await host.close()                      // close this window (runs onBeforeClose guards)
host.setTitle('Custom title')           // free-form title
host.setFilePath(path | null)           // sets persisted payload.path + recomputes title (manifest.titleForPath)
host.setPayload({ scroll: 120 })        // merge extra JSON into the persisted payload (title untouched)
host.alert(message, title?)             // shell alert window
await host.confirm(message, title?)     // shell modal OK/Cancel → boolean
host.vfs                                // the VFS module: readText, readFile, writeFile, listDir, exists, mkdir, ...
const off = host.onBeforeClose(fn)      // fn: () => boolean | Promise<boolean>; false cancels close
await host.pickFile({ mode: 'open' | 'save', extensions?, defaultPath?, title? }) // → path | null
```

* **Close guards** run for the titlebar ×, taskbar right-click → Close, taskbar middle-click and
  `host.close()`. Register in an `$effect` so it's cleaned up:
  ```ts
  $effect(() => host.onBeforeClose(async () =>
    !dirty || host.confirm('Discard unsaved changes?', 'VetPad')))
  ```
* **pickFile** is a real modal dialog over the VFS (folder nav, extension filter, file-name box).
  In `save` mode it appends the first extension if missing and asks before overwriting, so you
  don't need your own overwrite prompt. It does not write — you write with `host.vfs.writeFile`.
* Session restore: windows persist `{appId, geometry, payload}`. Anything you need to restore
  must live in `payload` (via `setFilePath`/`setPayload`). Treat `path` as the source of truth on mount.
* Don't import `stores/windowManager` from apps; use `host`.

## 4. File associations

* Default ext → app comes from manifests' `fileTypes` (first by app id if two claim one ext;
  today: Notepad = text types, Image Viewer = images).
* User overrides live in `localStorage['vettv-retro-desktop-assoc-v1']`; Files → **Open with…**
  lists apps declaring that ext (or all apps if none) with "Always use this app".
* `openVfsPath(path)` (desktop drop, Files double-click) uses the association; `.exe` never runs.
* API: `src/lib/shell/associations.ts` — `appForPath`, `appsForPath`, `setAssociation(ext, appId|null)`.

## 5. Theme tokens (use these, not `--v2k-*`)

Each skin maps neutral `--rd-*` tokens; apps using only these look right in every skin.

| token | Vet2000 value |
|---|---|
| `--rd-face` / `--rd-face-light` / `--rd-face-shadow` / `--rd-face-dark-shadow` | #d4d0c8 / #fff / #808080 / #404040 |
| `--rd-text` / `--rd-text-disabled` | #000 / #808080 |
| `--rd-highlight` / `--rd-highlight-text` | #0a246a / #fff |
| `--rd-font` / `--rd-font-size` | Tahoma stack / 11px |
| `--rd-border-raised` / `--rd-border-sunken` (+ `-thin`) | 4-colour `border-color` values |
| `--rd-input-bg` / `--rd-window-bg` | #fff / #fff |
| `--rd-title-active-start/end`, `--rd-title-inactive-start/end`, `--rd-title-text`, `--rd-title-text-inactive` | titlebar gradient |

Shared classes: `.rd-button`, `.rd-field` (inputs/textarea/list boxes), `.rd-panel` (raised box,
e.g. menus). Usage: `border: 2px solid; border-color: var(--rd-border-sunken);`.
The window frame/titlebar now render from `--rd-*` too. Older `.v2k-btn`/`.v2k-input` still work
but are Vet2000-only — prefer `.rd-*`.

## 6. Rules

* Branches: `apps/<name>`, `games/<name>`. No pushes/PRs/deploys without Vet's OK.
* Don't edit shell files: `src/lib/components/*`, `src/lib/shell/*`, `src/lib/stores/*`,
  `src/lib/types.ts`, `src/lib/apps/registry.ts`, `src/themes/*`. Need a host feature? Ask the shell lane.
* Original assets only; put them under `public/apps/<app>/`.
