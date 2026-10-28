<script lang="ts">
  import type { AppHost } from '../../types'

  interface Props {
    host: AppHost
    path?: string
  }

  let { host, path }: Props = $props()
  const vfs = $derived(host.vfs)

  let content = $state('')
  let currentPath = $state<string | undefined>(undefined)
  let dirty = $state(false)
  let status = $state('')
  let loading = $state(false)

  $effect(() =>
    host.onBeforeClose(async () => {
      if (!dirty) return true
      const name = currentPath?.split('/').pop() ?? 'Untitled'
      return host.confirm(`"${name}" has unsaved changes.\nClose without saving?`, 'Notepad')
    }),
  )

  async function loadPath(p: string | undefined) {
    if (!p) {
      currentPath = undefined
      content = ''
      dirty = false
      status = 'Untitled'
      return
    }
    if (p === currentPath) return
    loading = true
    status = 'Loading…'
    try {
      content = await vfs.readText(p)
      currentPath = p
      dirty = false
      status = p
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

  async function writeTo(dest: string) {
    try {
      await vfs.writeFile(dest, content, 'text/plain')
      currentPath = dest
      dirty = false
      status = `Saved ${dest}`
      host.setFilePath(dest)
    } catch (e) {
      status = e instanceof Error ? e.message : 'Save failed'
    }
  }

  async function save() {
    if (!currentPath) return saveAs()
    await writeTo(currentPath)
  }

  async function saveAs() {
    const dest = await host.pickFile({
      mode: 'save',
      extensions: ['.txt'],
      defaultPath: currentPath ?? 'C:/Documents/Untitled.txt',
    })
    if (dest) await writeTo(dest)
  }

  async function openDoc() {
    if (dirty && !(await host.confirm('Discard unsaved changes?', 'Notepad'))) return
    const p = await host.pickFile({ mode: 'open', defaultPath: currentPath ?? 'C:/Documents' })
    if (!p) return
    currentPath = undefined
    host.setFilePath(p)
  }

  async function newDoc() {
    if (dirty && !(await host.confirm('Discard unsaved changes?', 'Notepad'))) return
    currentPath = undefined
    content = ''
    dirty = false
    status = 'Untitled'
    host.setFilePath(null)
  }
</script>

<div class="notepad">
  <div class="notepad-menu" role="toolbar" aria-label="Notepad">
    <button type="button" class="v2k-btn" onclick={() => void newDoc()}>New</button>
    <button type="button" class="v2k-btn" onclick={() => void openDoc()}>Open…</button>
    <button type="button" class="v2k-btn" onclick={() => void save()} disabled={loading}>
      Save
    </button>
    <button type="button" class="v2k-btn" onclick={() => void saveAs()}>Save As…</button>
    {#if dirty}
      <span class="dirty" title="Unsaved changes">●</span>
    {/if}
  </div>

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
