<script lang="ts">
  import { onMount } from 'svelte'
  import type { WindowState } from '../types'
  import { windowManager } from '../stores/windowManager'
  import { appGlyph } from '../apps/registry'
  import StartMenu from './StartMenu.svelte'

  interface Props {
    windows: WindowState[]
    focusedId: string | null
  }

  let { windows, focusedId }: Props = $props()

  let startOpen = $state(false)
  let clock = $state('')

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

  function onDocPointer(e: PointerEvent) {
    if (!startOpen) return
    const t = e.target as HTMLElement
    if (t.closest('.v2k-start-menu') || t.closest('.v2k-start-btn')) return
    closeStart()
  }
</script>

<svelte:window onpointerdown={onDocPointer} />

<StartMenu open={startOpen} onclose={closeStart} />

<div class="v2k-taskbar" role="toolbar" aria-label="Taskbar">
  <button
    type="button"
    class="v2k-start-btn"
    class:open={startOpen}
    aria-haspopup="menu"
    aria-expanded={startOpen}
    onclick={toggleStart}
  >
    <span class="v2k-start-logo" aria-hidden="true">V</span>
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
      >
        <span class="glyph" aria-hidden="true">{appGlyph(win.appId)}</span>
        <span>{win.title}</span>
      </button>
    {/each}
  </div>

  <div class="v2k-tray" title="Clock">
    <time>{clock}</time>
  </div>
</div>
