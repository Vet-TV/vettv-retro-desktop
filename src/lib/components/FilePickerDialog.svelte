<script lang="ts">
  import type { PickFileOptions } from '../types'
  import {
    baseName,
    exists,
    extName,
    getMeta,
    joinPath,
    listDir,
    listDrives,
    parentPath,
    sanitizeName,
    type VfsMeta,
  } from '../vfs'
  import { normExt } from '../apps/registry'
  import { shellConfirm } from '../shell/dialogs'

  interface Props {
    opts: PickFileOptions
    onresult: (path: string | null) => void
  }
  let { opts, onresult }: Props = $props()

  const exts = $derived((opts.extensions ?? []).map(normExt))
  let cwd = $state('C:/Documents')
  let entries = $state<VfsMeta[]>([])
  let selected = $state<string | null>(null)
  let name = $state('')
  let error = $state('')
  let ready = false

  async function init() {
    const d = opts.defaultPath
    if (d) {
      const meta = await getMeta(d)
      if (meta && (meta.kind === 'dir' || meta.kind === 'drive')) cwd = meta.path
      else {
        const parent = parentPath(d)
        if (parent && (await exists(parent))) cwd = parent
        name = baseName(d)
      }
    }
    if (!(await exists(cwd))) cwd = 'C:/'
    ready = true
    await refresh()
  }

  $effect(() => {
    void init()
  })

  function allowed(e: VfsMeta): boolean {
    if (e.kind !== 'file') return true
    return exts.length === 0 || exts.includes(extName(e.name).toLowerCase())
  }

  async function refresh() {
    if (!ready) return
    error = ''
    try {
      const list = cwd === '' ? await listDrives() : await listDir(cwd)
      entries = list.filter(allowed)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to list'
      entries = []
    }
  }

  async function navigate(p: string) {
    cwd = p
    selected = null
    await refresh()
  }

  function up() {
    const p = cwd ? parentPath(cwd) : null
    void navigate(p ?? '')
  }

  function click(e: VfsMeta) {
    selected = e.path
    if (e.kind === 'file') name = e.name
  }

  function dbl(e: VfsMeta) {
    if (e.kind !== 'file') void navigate(e.path)
    else void accept()
  }

  async function accept() {
    error = ''
    if (opts.mode === 'open') {
      const target = selected && entries.find((e) => e.path === selected)
      if (target && target.kind === 'file') return onresult(target.path)
      if (name && cwd) {
        const p = joinPath(cwd, sanitizeName(name))
        const m = await getMeta(p)
        if (m?.kind === 'file') return onresult(p)
      }
      error = 'Select a file to open.'
      return
    }
    // save
    if (!cwd) {
      error = 'Choose a folder first.'
      return
    }
    let n = sanitizeName(name.trim())
    if (!n) {
      error = 'Type a file name.'
      return
    }
    if (exts.length && !exts.includes(extName(n).toLowerCase())) n = `${n}${exts[0]}`
    const dest = joinPath(cwd, n)
    const m = await getMeta(dest)
    if (m?.kind !== undefined && m.kind !== 'file') {
      error = `"${n}" is a folder.`
      return
    }
    if (m && !(await shellConfirm(`"${n}" already exists.\nReplace it?`, 'Confirm Save As'))) return
    onresult(dest)
  }
</script>

<div class="rd-picker">
  <div class="rd-picker-bar">
    <span>Look in:</span>
    <input class="rd-field addr" readonly value={cwd === '' ? 'Drives' : cwd} aria-label="Folder" />
    <button type="button" class="rd-button" onclick={up} disabled={cwd === ''}>Up</button>
  </div>
  <div class="rd-field rd-picker-list" role="listbox" aria-label="Files">
    {#each entries as e (e.path)}
      <button
        type="button"
        role="option"
        aria-selected={selected === e.path}
        class="rd-picker-item"
        class:sel={selected === e.path}
        onclick={() => click(e)}
        ondblclick={() => dbl(e)}
      >
        <span class="k">{e.kind === 'file' ? '·' : e.kind === 'drive' ? 'D' : 'F'}</span>
        {e.name || e.path}
      </button>
    {:else}
      <div class="empty">(empty)</div>
    {/each}
  </div>
  <div class="rd-picker-bar">
    <span>File name:</span>
    <input
      class="rd-field addr"
      bind:value={name}
      aria-label="File name"
      onkeydown={(e) => {
        if (e.key === 'Enter') void accept()
      }}
    />
  </div>
  {#if exts.length}
    <div class="types">Files of type: {exts.join(', ')}</div>
  {/if}
  {#if error}<div class="err" role="alert">{error}</div>{/if}
  <div class="rd-picker-actions">
    <button type="button" class="rd-button" onclick={() => void accept()}
      >{opts.mode === 'save' ? 'Save' : 'Open'}</button
    >
    <button type="button" class="rd-button" onclick={() => onresult(null)}>Cancel</button>
  </div>
</div>

<style>
  .rd-picker {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    width: 440px;
    max-width: 88vw;
    background: var(--rd-face);
  }
  .rd-picker-bar {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .addr {
    flex: 1;
  }
  .rd-picker-list {
    height: 200px;
    overflow: auto;
    display: flex;
    flex-direction: column;
    padding: 2px;
  }
  .rd-picker-item {
    display: flex;
    gap: 6px;
    border: none;
    background: transparent;
    text-align: left;
    padding: 1px 4px;
    font-family: var(--rd-font);
    font-size: var(--rd-font-size);
    color: var(--rd-text);
  }
  .rd-picker-item.sel {
    background: var(--rd-highlight);
    color: var(--rd-highlight-text);
  }
  .k {
    width: 12px;
    font-weight: bold;
  }
  .empty,
  .types {
    color: #555;
    padding: 2px 4px;
  }
  .err {
    color: #a00;
  }
  .rd-picker-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
</style>
