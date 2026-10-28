<script lang="ts">
  import { onMount } from 'svelte'
  import type { WindowState } from '../types'
  import { windowManager } from '../stores/windowManager'
  import { appGlyph, appIcon } from '../apps/registry'
  import { V2K_START_V } from '../apps/icons'
  import { requestClose } from '../shell/host'
  import StartMenu from './StartMenu.svelte'

  interface Props {
    windows: WindowState[]
    focusedId: string | null
  }

  let { windows, focusedId }: Props = $props()

  let startOpen = $state(false)
  let clock = $state('')
  /** Taskbar button context menu */
  let ctx = $state<{ id: string; x: number } | null>(null)

  function formatClock(d: Date): string {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }

  onMount(() => {
    clock = formatClock(new Date())
    const id = setInterval(() => {
      clock = formatClock(new Date())
    }, 15_000)
    return () => clearInterval(id)
  })

  function toggleStart() {
    startOpen = !startOpen
  }

  function closeStart() {
    startOpen = false
  }

  function ctxAction(action: 'restore' | 'minimize' | 'close') {
    const id = ctx?.id
    ctx = null
    if (!id) return
    if (action === 'restore') windowManager.restore(id)
    else if (action === 'minimize') windowManager.minimize(id)
    else void requestClose(id)
  }

  function onDocPointer(e: PointerEvent) {
    if (ctx && !(e.target as HTMLElement).closest('.rd-task-menu')) ctx = null
    if (!startOpen) return
    const t = e.target as HTMLElement
    if (t.closest('.v2k-start-menu') || t.closest('.v2k-start-btn')) return
    closeStart()
  }
</script>

<svelte:window onpointerdown={onDocPointer} />

<StartMenu open={startOpen} onclose={closeStart} />

{#if ctx}
  <div class="rd-task-menu rd-panel" role="menu" style={`left:${ctx.x}px`}>
    <button type="button" role="menuitem" class="v2k-start-item" onclick={() => ctxAction('restore')}>Restore</button>
    <button type="button" role="menuitem" class="v2k-start-item" onclick={() => ctxAction('minimize')}>Minimize</button>
    <button type="button" role="menuitem" class="v2k-start-item" onclick={() => ctxAction('close')}>Close</button>
  </div>
{/if}

<div class="v2k-taskbar" role="toolbar" aria-label="Taskbar">
  <button
    type="button"
    class="v2k-start-btn"
    class:open={startOpen}
    aria-haspopup="menu"
    aria-expanded={startOpen}
    onclick={toggleStart}
  >
    <span class="v2k-start-logo" aria-hidden="true">
      <img src={V2K_START_V} alt="" width="16" height="16" draggable="false" />
    </span>
    Start
  </button>

  <div class="v2k-task-buttons">
    {#each windows as win (win.id)}
      <button
        type="button"
        class="v2k-task-btn"
        class:active={focusedId === win.id && !win.minimized}
        title={win.title}
        onclick={() => windowManager.taskbarClick(win.id)}
        oncontextmenu={(e) => {
          e.preventDefault()
          ctx = { id: win.id, x: e.clientX }
        }}
        onauxclick={(e) => {
          if (e.button === 1) void requestClose(win.id)
        }}
      >
        <span class="glyph" aria-hidden="true">
          {#if appIcon(win.appId, 16)}
            <img src={appIcon(win.appId, 16)} alt="" width="14" height="14" draggable="false" />
          {:else}
            {appGlyph(win.appId)}
          {/if}
        </span>
        <span>{win.title}</span>
      </button>
    {/each}
  </div>

  <div class="v2k-tray" title="Clock">
    <time>{clock}</time>
  </div>
</div>

<style>
  .rd-task-menu {
    position: fixed;
    bottom: var(--v2k-taskbar-h, 30px);
    z-index: 100000;
    display: flex;
    flex-direction: column;
    min-width: 120px;
    padding: 2px;
    height: auto;
  }
</style>
