<script lang="ts">
  import { onMount } from 'svelte'
  import { windowManager } from '../stores/windowManager'
  import type { WindowState } from '../types'
  import { initVfs, openVfsPath, uploadBrowserFiles } from '../vfs'
  import Window from './Window.svelte'
  import Taskbar from './Taskbar.svelte'

  interface Props {
    windows: WindowState[]
  }

  let { windows }: Props = $props()

  let dropActive = $state(false)
  let dropStatus = $state('')
  let vfsReady = $state(false)

  const focusedId = $derived.by(() => {
    const visible = windows.filter((w) => !w.minimized)
    if (visible.length === 0) return null
    return visible.reduce((a, b) => (a.zIndex >= b.zIndex ? a : b)).id
  })

  onMount(() => {
    void initVfs().then(() => {
      vfsReady = true
    })
  })

  function openFiles() {
    windowManager.openApp('files')
  }

  function openNotepad() {
    windowManager.openApp('notepad')
  }

  function openAbout() {
    windowManager.openApp('about')
  }

  function isFileDrag(e: DragEvent): boolean {
    return Array.from(e.dataTransfer?.types ?? []).includes('Files')
  }

  function onDragOver(e: DragEvent) {
    if (!isFileDrag(e)) return
    e.preventDefault()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
    dropActive = true
  }

  function onDragLeave(e: DragEvent) {
    const t = e.relatedTarget as Node | null
    if (t && (e.currentTarget as HTMLElement).contains(t)) return
    dropActive = false
  }

  async function onDrop(e: DragEvent) {
    e.preventDefault()
    dropActive = false
    const files = e.dataTransfer?.files
    if (!files?.length) return
    try {
      await initVfs()
      const results = await uploadBrowserFiles(files)
      dropStatus = `Stored ${results.length} file(s) in VFS`
      setTimeout(() => {
        dropStatus = ''
      }, 3500)

      // Open first image / text for convenience
      const first = results[0]
      if (first) {
        const lower = first.name.toLowerCase()
        if (/\.(png|jpe?g|gif|webp)$/i.test(lower) || lower.endsWith('.txt')) {
          await openVfsPath(first.path)
        } else {
          windowManager.openApp('files', {
            payload: {
              path: first.path.includes('/Media/')
                ? first.path.startsWith('C:/Media/Music')
                  ? 'C:/Media/Music'
                  : 'C:/Media/Pictures'
                : 'C:/Documents',
            },
          })
        }
      }
    } catch (err) {
      dropStatus = err instanceof Error ? err.message : 'Upload failed'
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="v2k-desktop"
  class:drop-target={dropActive}
  data-theme="vet2000"
  role="application"
  aria-label="VetTV Retro Desktop"
  ondragover={onDragOver}
  ondragleave={onDragLeave}
  ondrop={(e) => void onDrop(e)}
>
  <div class="v2k-desktop-icons">
    <button
      type="button"
      class="v2k-desktop-icon"
      style="border:none;background:transparent"
      ondblclick={openFiles}
      title="Files"
    >
      <span class="glyph" aria-hidden="true">F</span>
      <span class="label">Files</span>
    </button>
    <button
      type="button"
      class="v2k-desktop-icon"
      style="border:none;background:transparent"
      ondblclick={openNotepad}
      title="Notepad"
    >
      <span class="glyph" aria-hidden="true">N</span>
      <span class="label">Notepad</span>
    </button>
    <button
      type="button"
      class="v2k-desktop-icon"
      style="border:none;background:transparent"
      ondblclick={openAbout}
      title="About VetTV Retro Desktop"
    >
      <span class="glyph" aria-hidden="true">i</span>
      <span class="label">About VetTV</span>
    </button>
  </div>

  {#if dropActive}
    <div class="v2k-drop-overlay" aria-hidden="true">
      Drop files to store in Documents / Media
    </div>
  {/if}

  {#if dropStatus}
    <div class="v2k-drop-toast" role="status">{dropStatus}</div>
  {/if}

  {#if !vfsReady}
    <div class="v2k-drop-toast" role="status">Starting VFS…</div>
  {/if}

  {#each windows as win (win.id)}
    <Window {win} active={focusedId === win.id} />
  {/each}

  <Taskbar {windows} {focusedId} />
</div>
