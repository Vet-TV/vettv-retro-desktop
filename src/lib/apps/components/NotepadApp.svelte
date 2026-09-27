<script lang="ts">
  import { windowManager } from '../../stores/windowManager'
  import {
    exists,
    joinPath,
    readText,
    sanitizeName,
    writeFile,
  } from '../../vfs'

  interface Props {
    windowId: string
    path?: string
  }

  let { windowId, path }: Props = $props()

  let content = $state('')
  let currentPath = $state<string | undefined>(undefined)
  let dirty = $state(false)
  let status = $state('')
  let showSaveAs = $state(false)
  let saveAsName = $state('Untitled.txt')
  let loading = $state(false)

  async function loadPath(p: string | undefined) {
    if (!p) {
      currentPath = undefined
      content = ''
      dirty = false
      status = 'Untitled'
      return
    }
    if (p === currentPath && !dirty) return
    loading = true
    status = 'Loading…'
    try {
      content = await readText(p)
      currentPath = p
      dirty = false
      status = p
      windowManager.setPayload(windowId, { path: p })
    } catch (e) {
      status = e instanceof Error ? e.message : 'Failed to open'
    } finally {
      loading = false
    }
  }

  $effect(() => {
    void loadPath(path)
  })

  function onInput(e: Event) {
    content = (e.target as HTMLTextAreaElement).value
    dirty = true
  }

  async function save() {
    if (!currentPath) {
      openSaveAs()
      return
    }
    try {
      await writeFile(currentPath, content, 'text/plain')
      dirty = false
      status = `Saved ${currentPath}`
      windowManager.setPayload(windowId, { path: currentPath })
    } catch (e) {
      status = e instanceof Error ? e.message : 'Save failed'
    }
  }

  function openSaveAs() {
    const base = currentPath?.split('/').pop() || 'Untitled.txt'
    saveAsName = base.endsWith('.txt') ? base : `${base}.txt`
    showSaveAs = true
  }

  async function confirmSaveAs() {
    let name = sanitizeName(saveAsName.trim() || 'Untitled.txt')
    if (!/\.[^.]+$/.test(name)) name = `${name}.txt`
    const dest = joinPath('C:/Documents', name)
    try {
      if ((await exists(dest)) && dest !== currentPath) {
        const ok = confirm(`"${name}" already exists. Overwrite?`)
        if (!ok) return
      }
      await writeFile(dest, content, 'text/plain')
      currentPath = dest
      dirty = false
      showSaveAs = false
      status = `Saved ${dest}`
      windowManager.setPayload(windowId, { path: dest })
    } catch (e) {
      status = e instanceof Error ? e.message : 'Save As failed'
    }
  }

  function newDoc() {
    if (dirty && !confirm('Discard unsaved changes?')) return
    currentPath = undefined
    content = ''
    dirty = false
    status = 'Untitled'
    windowManager.setPayload(windowId, {})
    windowManager.setTitle(windowId, 'Notepad')
  }
</script>

<div class="notepad">
  <div class="notepad-menu" role="toolbar" aria-label="Notepad">
    <button type="button" class="v2k-btn" onclick={newDoc}>New</button>
    <button type="button" class="v2k-btn" onclick={() => void save()} disabled={loading}>
      Save
    </button>
    <button type="button" class="v2k-btn" onclick={openSaveAs}>Save As…</button>
    {#if dirty}
      <span class="dirty" title="Unsaved changes">●</span>
    {/if}
  </div>

  {#if showSaveAs}
    <div class="save-as">
      <label>
        Save to C:/Documents/
        <input
          class="v2k-input"
          bind:value={saveAsName}
          onkeydown={(e) => {
            if (e.key === 'Enter') void confirmSaveAs()
            if (e.key === 'Escape') showSaveAs = false
          }}
        />
      </label>
      <button type="button" class="v2k-btn" onclick={() => void confirmSaveAs()}>Save</button>
      <button type="button" class="v2k-btn" onclick={() => (showSaveAs = false)}>Cancel</button>
    </div>
  {/if}

  <textarea
    class="notepad-editor"
    value={content}
    oninput={onInput}
    spellcheck="false"
    aria-label="Document text"
    disabled={loading}
  ></textarea>

  <div class="notepad-status v2k-status">{status}{dirty ? ' (modified)' : ''}</div>
</div>

<style>
  .notepad {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 0;
    min-height: 0;
  }
  .notepad-menu {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: var(--v2k-face, #d4d0c8);
    border-bottom: 1px solid var(--v2k-face-dark, #808080);
    flex-shrink: 0;
  }
  .dirty {
    color: #a00;
    font-size: 14px;
    margin-left: 4px;
  }
  .save-as {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 6px;
    background: #ece9d8;
    border-bottom: 1px solid #808080;
    flex-wrap: wrap;
    flex-shrink: 0;
  }
  .save-as label {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    min-width: 160px;
  }
  .v2k-input {
    flex: 1;
    font-family: Tahoma, sans-serif;
    font-size: 11px;
    padding: 2px 4px;
    border: 2px solid;
    border-color: #808080 #fff #fff #808080;
  }
  .notepad-editor {
    flex: 1;
    width: 100%;
    border: none;
    resize: none;
    padding: 6px 8px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 13px;
    line-height: 1.35;
    outline: none;
    min-height: 80px;
    box-sizing: border-box;
  }
  .notepad-status {
    flex-shrink: 0;
    padding: 2px 6px;
    background: var(--v2k-face, #d4d0c8);
    border-top: 1px solid var(--v2k-face-light, #fff);
    font-size: 10px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
