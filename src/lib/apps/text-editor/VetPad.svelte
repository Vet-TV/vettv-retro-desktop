<script lang="ts">
  import { onDestroy, onMount, untrack } from 'svelte'
  import type { AppHost } from '../../types'
  import { APP_NAME, DEFAULT_DIR, FILE_TYPES, FONT_SIZES, lineCol, timeDate, titleFor } from './editor'
  import { ABOUT_LINES, randomQuip } from './gags'

  let { host, path }: { host: AppHost; path?: string } = $props()

  let ta: HTMLTextAreaElement
  let text = $state('')
  let current = $state<string | undefined>(undefined)
  let dirty = $state(false)
  let wrap = $state(true)
  let fontSize = $state(14)
  let caret = $state(0)
  let menu = $state<string | null>(null)
  let about = $state(false)
  let toast = $state('')
  let hovered = false
  let history: string[] = []
  let quipTimer: ReturnType<typeof setInterval> | undefined
  let toastTimer: ReturnType<typeof setTimeout> | undefined

  const pos = $derived(lineCol(text, caret))
  $effect(() => host.setTitle(titleFor(current, dirty)))
  $effect(() =>
    host.onBeforeClose(() => !dirty || host.confirm('You have unsaved changes. Close anyway and let them drift into the static?', APP_NAME)),
  )
  // path is reactive (Files / Open with / setFilePath)
  $effect(() => {
    const p = path
    if (p) untrack(() => { if (p !== current) void open(p) })
  })

  function say(msg: string) {
    toast = msg
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast = ''), 4000)
  }

  async function open(p: string) {
    if (p !== current && dirty && !(await host.confirm('Discard unsaved changes?', APP_NAME))) return
    try {
      text = await host.vfs.readText(p); current = p; dirty = false; history = []
      host.setFilePath(p)
    } catch (e) { say(e instanceof Error ? e.message : 'Could not open') }
  }

  async function writeTo(p: string) {
    try {
      await host.vfs.writeFile(p, text, 'text/plain')
      current = p; dirty = false; host.setFilePath(p); say(`Saved ${p}`)
    } catch (e) { say(e instanceof Error ? e.message : 'Save failed') }
  }

  function track() { caret = ta?.selectionStart ?? 0 }
  function onInput() {
    history.push(text); if (history.length > 200) history.shift()
    text = ta.value; dirty = true; track()
  }

  function insert(s: string) {
    const a = ta.selectionStart, b = ta.selectionEnd
    history.push(text)
    text = text.slice(0, a) + s + text.slice(b); dirty = true
    queueMicrotask(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = a + s.length; track() })
  }

  const actions: Record<string, () => void | Promise<void>> = {
    new: async () => {
      if (dirty && !(await host.confirm('Discard unsaved changes?', APP_NAME))) return
      text = ''; current = undefined; dirty = false; history = []; host.setFilePath(null)
    },
    open: async () => {
      const p = await host.pickFile({ mode: 'open', extensions: FILE_TYPES, defaultPath: current ?? DEFAULT_DIR, title: 'Open — VetPad' })
      if (p) await open(p)
    },
    save: async () => (current ? writeTo(current) : actions.saveAs()),
    saveAs: async () => {
      const p = await host.pickFile({ mode: 'save', extensions: FILE_TYPES, defaultPath: current ?? `${DEFAULT_DIR}/Untitled.txt`, title: 'Save As — VetPad' })
      if (p) await writeTo(p)
    },
    undo: () => { if (history.length) { text = history.pop()!; dirty = true } },
    cut: async () => { await navigator.clipboard?.writeText(sel()); insert('') },
    copy: async () => { await navigator.clipboard?.writeText(sel()) },
    paste: async () => { const t = await navigator.clipboard?.readText(); if (t) insert(t) },
    selectAll: () => { ta.focus(); ta.select() },
    timeDate: () => insert(timeDate()),
    wrap: () => { wrap = !wrap },
    about: () => { about = true },
  }
  const sel = () => text.slice(ta.selectionStart, ta.selectionEnd)

  function run(k: string) { menu = null; void actions[k]() }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') { menu = null; about = false; return }
    if (!(e.ctrlKey || e.metaKey)) { if (e.key === 'F5') { e.preventDefault(); run('timeDate') } return }
    const map: Record<string, string> = { n: 'new', o: 'open', s: e.shiftKey ? 'saveAs' : 'save', z: 'undo' }
    const k = map[e.key.toLowerCase()]
    if (k) { e.preventDefault(); run(k) }
  }

  onMount(() => {
    quipTimer = setInterval(() => { if (dirty) say(randomQuip()) }, 90_000)
  })
  onDestroy(() => { clearInterval(quipTimer); clearTimeout(toastTimer) })

  const MENUS: Record<string, [string, string, string?][]> = {
    File: [['New', 'new', 'Ctrl+N'], ['Open…', 'open', 'Ctrl+O'], ['Save', 'save', 'Ctrl+S'], ['Save As…', 'saveAs']],
    Edit: [['Undo', 'undo', 'Ctrl+Z'], ['Cut', 'cut'], ['Copy', 'copy'], ['Paste', 'paste'], ['Select All', 'selectAll'], ['Time/Date', 'timeDate', 'F5']],
    Format: [['Word Wrap', 'wrap']],
    Help: [[`About ${APP_NAME}`, 'about']],
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="vp" onkeydown={onKey}>
  <div class="vp-menubar rd-panel" role="menubar">
    {#each Object.entries(MENUS) as [label, items]}
      <div class="vp-menu">
        <button class="vp-top" class:open={menu === label} role="menuitem"
          onclick={() => { menu = menu === label && !hovered ? null : label; hovered = false }}
          onmouseenter={() => { if (menu && menu !== label) { menu = label; hovered = true } }}>{label}</button>
        {#if menu === label}
          <div class="vp-drop rd-panel" role="menu">
            {#each items as [name, key, hint]}
              <button role="menuitem" onclick={() => run(key)}>
                <span>{key === 'wrap' && wrap ? '✓ ' : ''}{name}</span><span class="hint">{hint ?? ''}</span>
              </button>
            {/each}
            {#if label === 'Format'}
              <div class="sep"></div>
              {#each FONT_SIZES as s}
                <button role="menuitemradio" aria-checked={fontSize === s}
                  onclick={() => { fontSize = s; menu = null }}>
                  <span>{fontSize === s ? '● ' : ''}{s} pt</span><span class="hint"></span>
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <textarea bind:this={ta} class="vp-text rd-field" class:nowrap={!wrap} spellcheck="false"
    style="font-size:{fontSize}px" value={text} oninput={onInput}
    onkeyup={track} onclick={track} onfocus={() => (menu = null)}
    aria-label="{APP_NAME} document"></textarea>

  <div class="vp-status rd-panel">
    <span class="grow">{toast || (current ?? 'Untitled')}{dirty && !toast ? ' (modified)' : ''}</span>
    <span class="cell">Ln {pos.line}, Col {pos.col}</span>
    <span class="cell">{fontSize} pt</span>
  </div>

  {#if about}
    <div class="vp-scrim">
      <div class="vp-dialog rd-panel" role="dialog" aria-modal="true" aria-label="About {APP_NAME}">
        <div class="about">
          <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="5" y="3" width="22" height="26" fill="var(--rd-input-bg, #fff)" stroke="var(--rd-text, #000)"/>
            <path d="M9 9h14M9 13h14M9 17h10" stroke="var(--rd-highlight, #1a4fa0)" stroke-width="2"/>
            <text x="16" y="27" font-size="8" text-anchor="middle" fill="var(--rd-text, #000)" font-family="monospace">VTV</text>
          </svg>
          <div>{#each ABOUT_LINES as l, i}<p class:b={i === 0}>{l}</p>{/each}</div>
        </div>
        <div class="row"><button class="rd-button" onclick={() => (about = false)}>Groan, OK</button></div>
      </div>
    </div>
  {/if}
</div>

<style>
  .vp {
    --face: var(--rd-face, #c3c3c3);
    --light: var(--rd-face-light, #fff);
    --shadow: var(--rd-face-shadow, #808080);
    --txt: var(--rd-text, #000);
    --hi: var(--rd-highlight, #1a4fa0);
    --hitxt: var(--rd-highlight-text, #fff);
        position: relative; display: flex; flex-direction: column; height: 100%; min-height: 0;
    background: var(--face); color: var(--txt);
    font-family: var(--rd-font, Tahoma, Verdana, sans-serif);
    font-size: var(--rd-font-size, 12px);
  }
  button { font: inherit; color: inherit; background: none; border: 0; cursor: default; }
  .vp-menubar { display: flex; padding: 1px 2px; background: var(--face); border-bottom: 1px solid var(--shadow); }
  .vp-menu { position: relative; }
  .vp-top { padding: 2px 8px; }
  .vp-top:hover, .vp-top.open { background: var(--hi); color: var(--hitxt); }
  .vp-drop { position: absolute; top: 100%; left: 0; z-index: 10; min-width: 170px; padding: 2px;
    background: var(--face); border: 2px solid; border-color: var(--rd-border-raised, var(--light) var(--shadow) var(--shadow) var(--light)); box-shadow: 2px 2px 0 var(--shadow); }
  .vp-drop button { display: flex; justify-content: space-between; gap: 16px; width: 100%; padding: 3px 10px; text-align: left; }
  .vp-drop button:hover { background: var(--hi); color: var(--hitxt); }
  .hint { opacity: .7; }
  .sep { border-top: 1px solid var(--shadow); border-bottom: 1px solid var(--light); margin: 3px 2px; }
  .vp-text { flex: 1; min-height: 0; resize: none; margin: 0; padding: 4px 6px; outline: none;
    background: var(--rd-input-bg, #fff); color: var(--txt); border: 2px solid; border-color: var(--rd-border-sunken, var(--shadow) var(--light) var(--light) var(--shadow));
    font-family: 'Lucida Console', 'Courier New', monospace; white-space: pre-wrap; }
  .vp-text.nowrap { white-space: pre; overflow-x: auto; }
  .vp-status { display: flex; background: var(--face); border-top: 1px solid var(--light); padding: 2px; gap: 2px; }
  .vp-status span { padding: 1px 6px; border: 2px solid; border-color: var(--rd-border-sunken, var(--shadow) var(--light) var(--light) var(--shadow)); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .grow { flex: 1; }
  .cell { min-width: 64px; }
  .vp-scrim { position: absolute; inset: 0; display: grid; place-items: center; background: rgb(0 0 0 / .15); z-index: 20; }
  .vp-dialog { width: min(340px, 90%); padding: 12px; background: var(--face); border: 2px solid; border-color: var(--rd-border-raised, var(--light) var(--shadow) var(--shadow) var(--light)); box-shadow: 3px 3px 0 var(--shadow); }
  .about { display: flex; gap: 12px; }
  .about p { margin: 0 0 6px; }
  .b { font-weight: bold; }
  .row { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
  .row .rd-button { min-width: 72px; padding: 3px 10px; background: var(--face); border: 2px solid; border-color: var(--rd-border-raised, var(--light) var(--shadow) var(--shadow) var(--light)); }
</style>
