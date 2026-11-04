# Handoff: VetTV Retro Desktop Apps -> VetTV Retro Desktop

Date: 2026-11-04. Nothing from this lane has been pushed, PR'd or deployed.

## Local branches owned
- `apps/text-editor` @ `633e97a` (worktree `/workspace/vrd-text-editor`), based on `shell/app-api` @ `8431447`. **Unpushed.**
  - `8720007` Add VetPad parody text editor
  - `c390c5f` Menu hover-toggle fix, Escape closes menus/dialogs
  - `633e97a` Migrate to manifest API (host prop, pickFile, close guard)
  - This HANDOFF.md commit
- No other branches. (`shell/app-api` belongs to the shell agent and is also unpushed.)

## VetPad
Original VetTV-branded parody text editor. Files (only its own):
`src/lib/apps/text-editor/{manifest.ts,VetPad.svelte,editor.ts,gags.ts}`,
`src/lib/apps/components/TextEditorApp.svelte`, `public/apps/text-editor/vetpad.svg`.
- Manifest: id `textEditor`, 520x380, multi-instance, flushBody, startMenu order 25, fileTypes .txt/.md/.log, lazy-loaded.
- File New/Open/Save/Save As via `host.pickFile` + `host.vfs`; Edit Undo/Cut/Copy/Paste/Select All/Time-Date; Format word wrap + 10-24pt; Help joke About box.
- Shortcuts Ctrl+N/O/S, Ctrl+Shift+S, Ctrl+Z, F5. Status bar with file, modified flag, line/col, size; joke "autosave" quip every 90s when dirty.
- `host.onBeforeClose` unsaved-changes guard; title via `host.setTitle`/`setFilePath`.
- Styling: only `--rd-*` tokens (with fallbacks) and `.rd-button/.rd-field/.rd-panel`.
- `npm run check` 0/0, `npm run build` passes. Screenshots: `/workspace/screens/text-editor/v2/`.
- Worktree's `node_modules` is an untracked symlink to the main checkout.

## Left to do
1. Vet's approval to push `apps/text-editor` and merge after `shell/app-api`.
2. Shell API wishes: `host.setDirty` (setFilePath overwrites `*` title), 3-way Save/Don't Save/Cancel confirm, document `untrack` for path effects.
3. `.v2k-*` classes still in ShellDialogs and FilesApp.
4. `.txt` default stays Notepad (id tie-break); VetPad via Open with.
5. Set `startMenu.folder: 'Accessories'` once folders work.
6. Other planned parody apps/games (mine-sweeper, paint, joke popups) not started.
