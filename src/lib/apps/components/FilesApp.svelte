<script lang="ts">
  import {
    exists,
    joinPath,
    listDir,
    listDrives,
    mkdir,
    openVfsPath,
    parentPath,
    remove,
    rename,
    sanitizeName,
    uploadBrowserFiles,
    vfsRevision,
    type VfsMeta,
  } from '../../vfs'
  import { windowManager } from '../../stores/windowManager'

  interface Props {
    windowId: string
    path?: string
  }

  let { windowId, path }: Props = $props()

  let cwd = $state('C:/')
  let entries = $state<VfsMeta[]>([])
  let selected = $state<string | null>(null)
  let status = $state('')
  let error = $state('')
  let showNewFolder = $state(false)
  let newFolderName = $state('New Folder')
  let renaming = $state<string | null>(null)
  let renameValue = $state('')
  let fileInput: HTMLInputElement | undefined = $state()

  // Sync external path payload (e.g. open folder from desktop drop)
  $effect(() => {
    if (path && path !== cwd) {
      void navigate(path)
    }
  })

  // Refresh listing when VFS mutates
  $effect(() => {
    void $vfsRevision
    void refresh()
  })

  async function refresh() {
    try {
      error = ''
      if (cwd === '' || cwd === '/') {
        entries = await listDrives()
        status = 'Drives'
      } else {
        entries = await listDir(cwd)
        status = `${entries.length} object(s)`
      }
      windowManager.setPayload(windowId, { path: cwd || undefined })
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to list'
      entries = []
    }
  }

  async function navigate(next: string) {
    cwd = next
    selected = null
    showNewFolder = false
    renaming = null
    await refresh()
  }

  function goUp() {
    if (!cwd || cwd === '/') {
      void navigate('')
      return
    }
    const parent = parentPath(cwd)
    if (parent === null) {
      void navigate('')
    } else {
      void navigate(parent)
    }
  }

  function goComputer() {
    void navigate('')
  }

  async function activate(entry: VfsMeta) {
    if (entry.kind === 'dir' || entry.kind === 'drive') {
      await navigate(entry.path)
      return
    }
    await openVfsPath(entry.path)
  }

  function onRowDblClick(entry: VfsMeta) {
    void activate(entry)
  }

  function onRowClick(entry: VfsMeta) {
    selected = entry.path
  }

  function glyph(entry: VfsMeta): string {
    if (entry.kind === 'drive') return 'D'
    if (entry.kind === 'dir') return 'F'
    const n = entry.name.toLowerCase()
    if (n.endsWith('.txt')) return 'T'
    if (/\.(png|jpe?g|gif|webp|bmp)$/i.test(n)) return 'I'
    if (n.endsWith('.exe')) return '!'
    return '·'
  }

  async function doNewFolder() {
    const name = sanitizeName(newFolderName.trim() || 'New Folder')
    const dest = joinPath(cwd || 'C:/', name)
    try {
      if (await exists(dest)) {
        error = `Already exists: ${name}`
        return
      }
      await mkdir(dest)
      showNewFolder = false
      newFolderName = 'New Folder'
      selected = dest
    } catch (e) {
      error = e instanceof Error ? e.message : 'mkdir failed'
    }
  }

  async function doDelete() {
    if (!selected) return
    const meta = entries.find((e) => e.path === selected)
    if (!meta) return
    if (meta.kind === 'drive') {
      error = 'Cannot delete a drive'
      return
    }
    const label = meta.kind === 'dir' ? `folder "${meta.name}" and its contents` : `"${meta.name}"`
    if (!confirm(`Delete ${label}?`)) return
    try {
      await remove(meta.path)
      selected = null
    } catch (e) {
      error = e instanceof Error ? e.message : 'Delete failed'
    }
  }

  function startRename() {
    if (!selected) return
    const meta = entries.find((e) => e.path === selected)
    if (!meta || meta.kind === 'drive') return
    renaming = meta.path
    renameValue = meta.name
  }

  async function commitRename() {
    if (!renaming) return
    const name = sanitizeName(renameValue.trim())
    if (!name) {
      renaming = null
      return
    }
    try {
      const newPath = await rename(renaming, name)
      selected = newPath
      renaming = null
    } catch (e) {
      error = e instanceof Error ? e.message : 'Rename failed'
      renaming = null
    }
  }

  async function onUploadChange(e: Event) {
    const input = e.target as HTMLInputElement
    if (!input.files?.length) return
    const dest = cwd && cwd !== '' ? cwd : 'C:/Documents'
    try {
      const results = await uploadBrowserFiles(input.files, dest)
      status = `Uploaded ${results.length} file(s)`
      if (results[0]) selected = results[0].path
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed'
    }
    input.value = ''
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer?.files
    if (!files?.length) return
    const dest = cwd && cwd !== '' && !cwd.match(/^[A-Z]:\/$/) ? cwd : 'C:/Documents'
    void uploadBrowserFiles(files, dest).then((results) => {
      status = `Uploaded ${results.length} file(s)`
      if (results[0]) selected = results[0].path
    })
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="files" ondragover={onDragOver} ondrop={onDrop}>
  <div class="files-toolbar" role="toolbar">
    <button type="button" class="v2k-btn" onclick={goUp} title="Up one level">Up</button>
    <button type="button" class="v2k-btn" onclick={goComputer} title="Drives">Drives</button>
    <button
      type="button"
      class="v2k-btn"
      onclick={() => {
        showNewFolder = !showNewFolder
      }}
      disabled={!cwd || cwd === ''}
    >
      New Folder
    </button>
    <button type="button" class="v2k-btn" onclick={startRename} disabled={!selected}>Rename</button>
    <button type="button" class="v2k-btn" onclick={() => void doDelete()} disabled={!selected}
      >Delete</button
    >
    <button type="button" class="v2k-btn" onclick={() => fileInput?.click()}>Upload…</button>
    <input
      bind:this={fileInput}
      type="file"
      multiple
      hidden
      onchange={(e) => void onUploadChange(e)}
    />
  </div>

  <div class="files-address">
    <span class="addr-label">Address</span>
    <input
      class="v2k-input addr"
      value={cwd === '' ? 'Drives' : cwd}
      readonly
      aria-label="Current folder"
    />
  </div>

  {#if showNewFolder}
    <div class="files-inline">
      <input class="v2k-input" bind:value={newFolderName} aria-label="New folder name" />
      <button type="button" class="v2k-btn" onclick={() => void doNewFolder()}>Create</button>
      <button type="button" class="v2k-btn" onclick={() => (showNewFolder = false)}>Cancel</button>
    </div>
  {/if}

  {#if error}
    <div class="files-error">{error}</div>
  {/if}

  <div class="files-list" role="listbox" aria-label="Folder contents">
    {#each entries as entry (entry.path)}
      <button
        type="button"
        class="files-row"
        class:selected={selected === entry.path}
        role="option"
        aria-selected={selected === entry.path}
        onclick={() => onRowClick(entry)}
        ondblclick={() => onRowDblClick(entry)}
      >
        <span class="files-glyph" aria-hidden="true">{glyph(entry)}</span>
        {#if renaming === entry.path}
          <!-- svelte-ignore a11y_autofocus -->
          <input
            class="v2k-input rename"
            bind:value={renameValue}
            autofocus
            onclick={(e) => e.stopPropagation()}
            onblur={() => void commitRename()}
            onkeydown={(e) => {
              e.stopPropagation()
              if (e.key === 'Enter') void commitRename()
              if (e.key === 'Escape') renaming = null
            }}
          />
        {:else}
          <span class="files-name">{entry.name}{entry.kind === 'drive' ? '/' : ''}</span>
        {/if}
        <span class="files-meta">
          {#if entry.kind === 'file'}
            {(entry.size ?? 0).toLocaleString()} B
          {:else if entry.kind === 'dir'}
            Folder
          {:else}
            Local Disk
          {/if}
        </span>
      </button>
    {:else}
      <div class="files-empty">This folder is empty. Drop files here or use Upload.</div>
    {/each}
  </div>

  <div class="files-status v2k-status">{status}</div>
</div>

<style>
  .files {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
    min-height: 0;
    background: #fff;
  }
  .files-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 4px;
    background: var(--v2k-face, #d4d0c8);
    border-bottom: 1px solid var(--v2k-face-dark, #808080);
    flex-shrink: 0;
  }
  .files-address {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    background: var(--v2k-face, #d4d0c8);
    border-bottom: 1px solid var(--v2k-face-dark, #808080);
    flex-shrink: 0;
  }
  .addr-label {
    font-size: 11px;
  }
  .addr {
    flex: 1;
  }
  .v2k-input {
    font-family: Tahoma, sans-serif;
    font-size: 11px;
    padding: 2px 4px;
    border: 2px solid;
    border-color: #808080 #fff #fff #808080;
    background: #fff;
  }
  .files-inline {
    display: flex;
    gap: 4px;
    padding: 4px 6px;
    background: #ece9d8;
    flex-shrink: 0;
  }
  .files-error {
    padding: 4px 8px;
    background: #ffe0e0;
    color: #800;
    font-size: 11px;
    flex-shrink: 0;
  }
  .files-list {
    flex: 1;
    overflow: auto;
    min-height: 60px;
  }
  .files-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 3px 8px;
    cursor: default;
    font-size: 11px;
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    font-family: inherit;
    color: inherit;
  }
  .files-row:hover {
    background: #f0f0f0;
  }
  .files-row.selected {
    background: #0a246a;
    color: #fff;
  }
  .files-glyph {
    width: 18px;
    height: 16px;
    text-align: center;
    flex-shrink: 0;
    background: var(--v2k-face, #d4d0c8);
    border: 1px solid var(--v2k-face-darker, #404040);
    font-size: 9px;
    font-weight: bold;
    color: #0a246a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  .files-row.selected .files-glyph {
    background: #fff;
    color: #0a246a;
  }
  .files-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .files-meta {
    flex-shrink: 0;
    color: #555;
    font-size: 10px;
  }
  .files-row.selected .files-meta,
  .files-row.selected .files-meta {
    color: #cde;
  }
  .rename {
    flex: 1;
  }
  .files-empty {
    padding: 16px;
    color: #666;
    font-size: 11px;
  }
  .files-status {
    flex-shrink: 0;
    padding: 2px 6px;
    background: var(--v2k-face, #d4d0c8);
    border-top: 1px solid var(--v2k-face-light, #fff);
    font-size: 10px;
  }
</style>
