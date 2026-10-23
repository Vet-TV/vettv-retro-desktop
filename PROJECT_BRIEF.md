# VetTV Retro Desktop — Project brief

Status: 1.0.0 released; 1.1.0 adds local x86 ISO booting in Vintage Lab
Owner bot: VetTV Retro Desktop  
Brand: VetTV / VetTV Studios / Retro TV Archive

## Pitch
Browser nostalgia desktop inspired by classic PCs, with an optional browser-based x86 emulator for user-provided retro OS images. Not affiliated with Microsoft.

## Non-negotiables
- Original VetTV chrome; no Microsoft trademarks/assets as if official.
- No shipping Windows ISOs; no claiming arbitrary `.exe` games run.
- User-selected OS images are read locally in the browser and are never uploaded or bundled.
- Vintage Lab emulates legacy 16/32-bit x86 only; unsupported architectures and systems are not promised to boot.
- Client-side first (IndexedDB/OPFS); user data stays in the browser unless they opt into a future account sync.

## Stack (locked)
- **Svelte + Vite** — stick for the whole product

## Eras (skins)
1. **Vet2000** — Win2000-inspired — 1.0 release skin
2. Vet98 — 98SE-inspired — post-1.0 idea
3. VetXP — XP-inspired colors with original art — post-1.0 idea

## Session
- **Restart: restore last session** (reopen windows/apps/layout; VFS unchanged) — locked
- Window layout: `localStorage` (`vettv-retro-desktop-session-v1`)
- VFS: IndexedDB (`vettv-vfs-v1`) — survives refresh independently

## 1.0 release scope
- Boot → desktop for **Vet2000**
- Window manager + taskbar/Start
- VFS with Documents + drag-drop upload
- Apps: Files, Notepad, Calculator (working), Image Viewer, About
- Session restore on reload
- GitHub Pages static site; dependency audit, type-check, and production build in CI
- No executable or remote app execution

The previously proposed Vet98/VetXP themes, iframe-based App Market, web remake games, and local profiles are not part of 1.0. Revisit them as separate, scoped post-1.0 work.

## 1.1 feature
- Vintage Lab uses v86 to boot user-selected, bootable x86 ISO files in the browser.
- No operating-system image is redistributed; a blank optional install disk is temporary browser memory.
- 16/32-bit legacy x86 only; no x86-64, ARM, or universal OS compatibility claim.

## Stretch
- Separate Vintage Lab page; the first BYO x86 ISO boot flow is now part of the desktop app
- js-dos panel for BYO DOS zips

## Sibling product
- VetTV Vintage PC = paid native emulator frontend (real guests, BYO ISO)

## Host
- **GitHub Pages**; custom domain can be considered later

## Live preview
- https://vet-tv.github.io/vettv-retro-desktop/
- Repo: https://github.com/Vet-TV/vettv-retro-desktop
- Deploy: GitHub Actions from `main` (`.github/workflows/deploy-pages.yml`); `gh-pages` was the interim branch
