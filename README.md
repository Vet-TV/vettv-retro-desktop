# VetTV Retro Desktop

Browser-based classic desktop shell for **VetTV / Retro TV Archive**.  
Desktop skin: **Vet2000** (Win2000-inspired gray corporate chrome — original VetTV art only).

Not affiliated with Microsoft. The desktop shell is a browser nostalgia toy; the optional **Vintage Lab** emulates a limited x86 PC to boot your own retro OS image.

**Version 1.1.0 adds Vintage Lab:** boot a locally selected, bootable x86 ISO in the browser. No OS image is included or uploaded.

See `PROJECT_BRIEF.md` for the 1.0 release scope and post-1.0 ideas.
See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## Stack

- **Svelte + TypeScript + Vite** (locked)
- **v86** x86-to-WebAssembly emulator for Vintage Lab

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
npm audit        # check dependencies for known vulnerabilities
```

## Boot your own retro OS

1. Open **Vintage Lab** from the Start menu or double-click its desktop icon.
2. Choose a bootable `.iso` image that you have the right to use.
3. Select **Boot ISO** and click the virtual screen to send keyboard input.
4. Optionally attach a temporary blank 512 MB disk for installers. Its contents are discarded when the emulator closes.

The ISO is read locally by your browser and is not sent to the site or stored by the app. Browser memory and device performance limit the image size; images over 2 GiB are not accepted. v86 emulates a single-core, legacy x86 PC: 16/32-bit bootable systems such as DOS, Windows 95/98/2000, and compatible Linux or hobby OS images may work. It does **not** support 64-bit x86, ARM, every OS, or every installer. Some systems need their own boot options or setup steps. A local virtual disk is temporary and does not survive closing the emulator or refreshing the page.

No operating-system ISO is bundled. You are responsible for providing images that you are legally entitled to use. This does not make the desktop shell a Windows emulator or allow host `.exe` files to run.

## Milestone 1 — done criteria

- [x] Vet2000 desktop (CRT/broadcast wallpaper from art batch 1; no copyrighted wallpapers)
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

**Out of scope for M3 (deferred):** App Market, Vet98 / VetXP themes, custom domain, media playback.

## Post-1.0 ideas

- Vet98 + VetXP theme packs
- App Market (iframe web apps + postMessage API)
- Optional media playback stubs / 1–2 web remake games
- Multi-user local profiles

## Deploy — GitHub Pages

Hosting is **GitHub Pages**. A custom VetTV domain remains deferred.

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

**Live preview:** https://vet-tv.github.io/vettv-retro-desktop/

### Expected URL shape

| Site type | URL |
|-----------|-----|
| Project site | `https://<user-or-org>.github.io/<repo-name>/` |
| User/org root site | `https://<user-or-org>.github.io/` |

Custom VetTV domain: configure later; leave Pages default hostname until then.

## Legal / brand

- Original VetTV / Retro TV Archive naming and chrome only
- No Microsoft logos, Bliss wallpaper, official Luna assets, or Windows trademarks as affiliation
- Window titles / Start menu say **VetTV Retro Desktop** or **Vet2000** — never “Windows”
- Do not ship or promise `.exe` / Win32 compatibility
- About dialog states clearly: nostalgia toy / fake OS shell; not affiliated with Microsoft

## Art — Vet2000 batch 1 (2026-09-26 PT)

Curated chrome under `public/themes/vet2000/` (incoming packs stay in `art-incoming/`, gitignored):

- **Wallpaper:** `v2k-wallpaper-crt.png` (CRT/broadcast; locked default)
- **Start:** SVG V mark + stripe wordmark **Vet2000**
- **Icons:** Files / Notepad / Calculator / About (SVG preferred; PNG 16/32 fallbacks)
- **Favicon:** `public/favicon.svg` (matches theme mark)
- No MS marks / Bliss / Start orb

## Layout (key paths)

```
public/
  favicon.svg
  themes/vet2000/      # art batch 1 wallpaper + SVG/PNG chrome
  v86/                 # v86 WebAssembly runtime + licensed BIOS firmware (no OS images)
src/
  App.svelte
  main.ts
  app.css
  themes/vet2000.css
  lib/
    types.ts
    apps/registry.ts
    apps/icons.ts      # Vet2000 asset URLs
    apps/components/   # About, Notepad, Files, ImageViewer, Calculator, Vintage Lab, Alert
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

Third-party emulator and firmware license notices are in `public/v86/THIRD_PARTY_NOTICES.md`.

## Manual verify (1.0)

1. `npm run dev` → open desktop.
2. Double-click **Calculator** (or Start → Calculator) → try `7 + 3 =` → `10`; divide by zero → Error; Esc clears.
3. Refresh → Calculator window restores if left open.
4. Start → About → read legal disclaimer (not affiliated with Microsoft).
5. Vintage Lab → choose a bootable x86 ISO → Boot ISO; verify that the guest begins booting and Pause/Start/Restart work.
6. Verify the ISO stays local and that unsupported 64-bit or non-x86 guests are identified as out of scope.
7. Files / Notepad still open/save; host `.exe` files still show the unsupported alert.

## Package

`package.json` name: `vettv-retro-desktop`
