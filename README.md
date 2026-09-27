# VetTV Retro Desktop

Browser-based classic desktop shell for **VetTV / Retro TV Archive**.  
MVP launch skin: **Vet2000** (Win2000-inspired gray corporate chrome — original VetTV art only).

Not real Windows. Not affiliated with Microsoft. Sibling product **VetTV Vintage PC** owns native BYO-ISO emulation — this repo stays a web shell.

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
- [x] Start menu launches stub apps: About, Notepad, Calculator
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
- [x] Calculator remains a stub (M3)
- [x] `npm run build` and `npm run check` succeed

**Out of scope for M2 (deferred):** real Calculator, App Market, Vet98 / VetXP themes, custom domain, Vintage Lab / v86.

## What’s next (M3)

- Real Calculator
- Polish Files / Notepad UX
- Optional media playback stubs

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

**No public deploy URL is configured in this workspace** (no GitHub remote / Pages site wired here).

## Legal / brand

- Original VetTV / Retro TV Archive naming and chrome only
- No Microsoft logos, Bliss wallpaper, official Luna assets, or Windows trademarks as affiliation
- Window titles / Start menu say **VetTV Retro Desktop** or **Vet2000** — never “Windows”
- Do not ship or promise `.exe` / Win32 compatibility

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

## Manual verify (M2)

1. `npm run dev` → open desktop.
2. Start → Files → see `C:/`, `D:/`; open `C:/Documents` → `Welcome.txt`.
3. Double-click `Welcome.txt` → Notepad; edit; **Save**; refresh page → Files still lists the file.
4. Drag a `.png` onto the desktop → lands in `C:/Media/Pictures` and opens in Image Viewer.
5. In Files, create a dummy `.exe` (or upload one) and open it → unsupported message (no execution).
6. Refresh → VFS contents remain; window layout restores separately.

## Package

`package.json` name: `vettv-retro-desktop`
