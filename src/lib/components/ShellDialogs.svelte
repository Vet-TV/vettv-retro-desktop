<script lang="ts">
  import { dialogs, dismiss, type ShellDialog } from '../shell/dialogs'
  import FilePickerDialog from './FilePickerDialog.svelte'
  import { allApps, appsFor } from './shellDialogHelpers'
  import { appGlyph, appIcon } from '../apps/registry'
  import { baseName, extName } from '../vfs/paths'

  function finish<T>(d: ShellDialog, value: T) {
    dismiss(d.id)
    ;(d.resolve as (v: T) => void)(value)
  }

  let openWithChoice = $state<string | null>(null)
  let remember = $state(false)

  function onKey(e: KeyboardEvent, d: ShellDialog) {
    if (e.key !== 'Escape') return
    e.stopPropagation()
    if (d.kind === 'confirm') finish(d, false)
    else finish(d, null)
  }
</script>

{#each $dialogs as d, i (d.id)}
  <div class="rd-modal-backdrop" style={`z-index:${200000 + i}`}>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="v2k-window active rd-modal"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onkeydown={(e) => onKey(e, d)}
    >
      {#if d.kind === 'confirm'}
        <div class="v2k-titlebar"><span class="v2k-titlebar-text">{d.title}</span></div>
        <div class="v2k-window-body rd-modal-body">
          <pre class="rd-modal-msg">{d.message}</pre>
          <div class="rd-modal-actions">
            <!-- svelte-ignore a11y_autofocus -->
            <button type="button" class="rd-button" autofocus onclick={() => finish(d, true)}>OK</button>
            <button type="button" class="rd-button" onclick={() => finish(d, false)}>Cancel</button>
          </div>
        </div>
      {:else if d.kind === 'pickFile'}
        <div class="v2k-titlebar">
          <span class="v2k-titlebar-text"
            >{d.opts.title ?? (d.opts.mode === 'save' ? 'Save As' : 'Open')}</span
          >
        </div>
        <div class="v2k-window-body rd-modal-body flush">
          <FilePickerDialog opts={d.opts} onresult={(p) => finish(d, p)} />
        </div>
      {:else if d.kind === 'openWith'}
        {@const candidates = appsFor(d.path)}
        <div class="v2k-titlebar"><span class="v2k-titlebar-text">Open with…</span></div>
        <div class="v2k-window-body rd-modal-body">
          <p>Choose an app to open <strong>{baseName(d.path)}</strong>:</p>
          <div class="rd-field rd-openwith-list" role="listbox" aria-label="Apps">
            {#each candidates.length ? candidates : allApps() as app (app.id)}
              <button
                type="button"
                role="option"
                aria-selected={openWithChoice === app.id}
                class="rd-openwith-item"
                class:sel={openWithChoice === app.id}
                onclick={() => (openWithChoice = app.id)}
                ondblclick={() => finish(d, { appId: app.id, remember })}
              >
                <span class="glyph"
                  >{#if appIcon(app.id, 16)}<img src={appIcon(app.id, 16)} alt="" width="16" height="16" />{:else}{appGlyph(app.id)}{/if}</span
                >
                {app.title}
              </button>
            {/each}
          </div>
          {#if extName(d.path)}
            <label class="rd-remember">
              <input type="checkbox" bind:checked={remember} />
              Always use this app for {extName(d.path)} files
            </label>
          {/if}
          <div class="rd-modal-actions">
            <button
              type="button"
              class="rd-button"
              disabled={!openWithChoice}
              onclick={() => {
                const id = openWithChoice
                openWithChoice = null
                const r = remember
                remember = false
                finish(d, id ? { appId: id, remember: r } : null)
              }}>OK</button
            >
            <button
              type="button"
              class="rd-button"
              onclick={() => {
                openWithChoice = null
                remember = false
                finish(d, null)
              }}>Cancel</button
            >
          </div>
        </div>
      {/if}
    </div>
  </div>
{/each}

<style>
  .rd-modal-backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.12);
  }
  .rd-modal {
    position: relative;
    min-width: 300px;
    max-width: min(560px, 92vw);
    max-height: 86vh;
  }
  .rd-modal-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--rd-face);
  }
  .rd-modal-msg {
    margin: 0;
    white-space: pre-wrap;
    font-family: var(--rd-font);
    font-size: var(--rd-font-size);
  }
  .rd-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
  .rd-openwith-list {
    display: flex;
    flex-direction: column;
    max-height: 180px;
    overflow: auto;
    padding: 2px;
  }
  .rd-openwith-item {
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    text-align: left;
    padding: 2px 4px;
    font-family: var(--rd-font);
    font-size: var(--rd-font-size);
    color: var(--rd-text);
  }
  .rd-openwith-item.sel {
    background: var(--rd-highlight);
    color: var(--rd-highlight-text);
  }
  .glyph {
    width: 16px;
    display: inline-flex;
    justify-content: center;
  }
  .rd-remember {
    display: flex;
    gap: 6px;
    align-items: center;
  }
</style>
