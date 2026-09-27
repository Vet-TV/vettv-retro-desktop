# VetTV Retro Desktop — Project brief

Status: M2 complete (VFS + Files / Notepad / Image Viewer) (2026-09-26 PT)  
Owner bot: VetTV Retro Desktop  
Brand: VetTV / VetTV Studios / Retro TV Archive

## Pitch
Browser “web OS” shells inspired by Windows 98SE, Windows 2000, and Windows XP — nostalgia desktop in a tab. Not real Windows. Not a replacement for VetTV Vintage PC (native BYO-ISO emulator).

## Non-negotiables
- Original VetTV chrome; no Microsoft trademarks/assets as if official.
- No shipping Windows ISOs; no claiming arbitrary `.exe` games run.
- Client-side first (IndexedDB/OPFS); user data stays in the browser unless they opt into a future account sync.

## Stack (locked)
- **Svelte + Vite** — stick for the whole product

## Eras (skins)
1. **Vet2000** — Win2000-inspired — **MVP launch skin (locked)**
2. Vet98 — 98SE-inspired — V1 theme pack
3. VetXP — XP-inspired (Luna-like colors, original art) — V1 theme pack

## Session
- **Restart: restore last session** (reopen windows/apps/layout; VFS unchanged) — locked
- Window layout: `localStorage` (`vettv-retro-desktop-session-v1`)
- VFS: IndexedDB (`vettv-vfs-v1`) — survives refresh independently

## MVP
- Boot → desktop for **Vet2000**
- Window manager + taskbar/Start
- VFS with Documents + drag-drop upload
- Apps: Files, Notepad, Calculator (Calculator stub until M3)
- Image Viewer for common image types
- Session restore on reload
- Deploy static site

## V1
- All three era themes (add Vet98 + VetXP)
- App Market (iframe web apps + postMessage API)
- 1–2 web remake games
- Multi-user local profiles (optional)

## Stretch
- Separate “Vintage Lab” page embedding v86 + BYO images only (stretch-only; not MVP)
- js-dos panel for BYO DOS zips

## Sibling product
- VetTV Vintage PC = paid native emulator frontend (real guests, BYO ISO)

## Host (locked)
- **GitHub Pages** for MVP; custom VetTV domain can alias later

## Live preview
- https://vet-tv.github.io/vettv-retro-desktop/
- Repo: https://github.com/Vet-TV/vettv-retro-desktop
- Deploy path: `gh-pages` branch (Actions workflow needs `workflow` OAuth scope to push later)
