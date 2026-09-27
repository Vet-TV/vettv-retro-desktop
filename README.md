# VetTV Retro Desktop

Browser-based classic desktop shell for **VetTV / Retro TV Archive**.  
MVP launch skin: **Vet2000** (Win2000-inspired gray corporate chrome — original VetTV art only).

Not real Windows. **Not affiliated with Microsoft.** Sibling product **VetTV Vintage PC** owns native BYO-ISO emulation — this repo stays a web shell / nostalgia toy.

See `PROJECT_BRIEF.md` for product scope and eras (Vet2000 → Vet98 / VetXP later).

## Stack

- **Svelte + TypeScript + Vite** (locked)

## How to run (local)

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173/`).

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
npm run check    # svelte-check + tsc
```

## Milestone 1 — done criteria

- [x] Vet2000 desktop (CSS gradient / solid; no copyrighted wallpapers)
- [x] Taskbar with Start button, clock, open-window buttons
- [x] Start menu launches apps: About, Notepad, Calculator, Files
- [x] Window manager: open / focus / drag / resize / minimize / maximize / close / z-order
- [x] Modular theme CSS: `src/themes/vet2000.css`
- [x] Session restore via `localStorage` (window geometry + minimized/maximized)
- [x] `npm run build` succeeds
- [x] GitHub Pages deploy workflow + Vite `base` configured

## Milestone 2 — done criteria (VFS)

- [x] Virtual filesystem backed by **IndexedDB** (`vettv-vfs-v1`) with `C:/` and `D:/` drives
- [x] Seeded folders: `C:/Documents`, `C:/Media/Pictures`, `C:/Media/Music`, empty `D:/`
- [x] Create folders/files, list, read, write; rename + delete supported in Files
- [x] Drag-drop upload onto desktop or into Files → blobs stored under Documents/Media
- [x] VFS persists across refresh (independent of window session restore)
- [x] Opening `.exe` shows an unsupported dialog — never executes
- [x] **Notepad**: open/save/Save As text files in VFS (`C:/Documents`)
- [x] **Files**: browse drives/folders; open `.txt` in Notepad; open images in **Image Viewer**
- [x] Drag-drop `.png` → stored → opens in Image Viewer
- [x] `npm run build` and `npm run check` succeed

## Milestone 3 — done criteria (Calculator + polish + legal)

- [x] **Calculator**: real basic ops (+ − × ÷), clear / clear-entry / backspace / ± / decimal, keyboard support when window is active
- [x] Calculator opens from Start menu and desktop icon; session restore reopens Calculator windows
- [x] Vet2000 chrome polish: shared inputs/buttons/status, title-bar close hover, Start menu / taskbar consistency, Files ASCII glyphs (no emoji), “Drives” root label
- [x] **About**: clear language — browser nostalgia toy / fake OS shell; **not affiliated with Microsoft**; no Windows trademarks as official; original VetTV chrome; no `.exe` execution
- [x] README + PROJECT_BRIEF mark M3 done
- [x] `npm run build` and `npm run check` succeed

**Out of scope for M3 (deferred):** App Market, Vet98 / VetXP themes, custom domain, Vintage Lab / v86, media playback.

## What’s next (V1 / later)

- Vet98 + VetXP theme packs
- App Market (iframe web apps + postMessage API)
- Optional media playback stubs / 1–2 web remake games

## Deploy — GitHub Pages (MVP host)

MVP hosting is **GitHub Pages**. A custom VetTV domain is **post-MVP**.

### Vite `base`

`vite.config.ts` defaults to **relative** `base: './'` so assets work from any Pages path. Override if needed:

```bash
VITE_BASE=/vettv-retro-desktop/ npm run build
```

Use `/<repo-name>/` when the site is a **project** Pages site (`https://<user>.github.io/<repo>/`). Relative `./` is fine for most cases and is what CI uses.

### Enable Pages

1. Push this repo to GitHub (default branch `main`).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main` (or run **Actions → Deploy to GitHub Pages → Run workflow**).
4. Workflow: `.github/workflows/deploy-pages.yml` builds `dist` and deploys via `actions/upload-pages-artifact` + `actions/deploy-pages`.

**Live MVP preview:** https://vet-tv.github.io/vettv-retro-desktop/

### Expected URL shape

| Site type | URL |
|-----------|-----|
| Project site | `https://<user-or-org>.github.io/<repo-name>/` |
| User/org root site | `https://<user-or-org>.github.io/` |

Custom VetTV domain: configure later (post-MVP); leave Pages default hostname until then.

## Legal / brand

- Original VetTV / Retro TV Archive naming and chrome only
- No Microsoft logos, Bliss wallpaper, official Luna assets, or Windows trademarks as affiliation
- Window titles / Start menu say **VetTV Retro Desktop** or **Vet2000** — never “Windows”
- Do not ship or promise `.exe` / Win32 compatibility
- About dialog states clearly: nostalgia toy / fake OS shell; not affiliated with Microsoft

## Layout (key paths)

```
src/
  App.svelte
  main.ts
  app.css
  themes/vet2000.css
  lib/
    types.ts
    apps/registry.ts
    apps/components/   # About, Notepad, Files, ImageViewer, Calculator, Alert
    stores/windowManager.ts
    vfs/               # IndexedDB VFS (paths, idb, mime, open)
    components/
      Desktop.svelte
      Taskbar.svelte
      StartMenu.svelte
      Window.svelte
.github/workflows/deploy-pages.yml
PROJECT_BRIEF.md
```

## Manual verify (M3)

1. `npm run dev` → open desktop.
2. Double-click **Calculator** (or Start → Calculator) → try `7 + 3 =` → `10`; divide by zero → Error; Esc clears.
3. Refresh → Calculator window restores if left open.
4. Start → About → read legal disclaimer (not affiliated with Microsoft).
5. Files / Notepad still open/save; `.exe` still shows unsupported alert only.

## Package

`package.json` name: `vettv-retro-desktop`
