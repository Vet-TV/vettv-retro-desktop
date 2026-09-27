<script lang="ts">
  import type { WindowState } from '../types'
  import { windowManager } from '../stores/windowManager'
  import { appGlyph } from '../apps/registry'
  import { appIcon } from '../apps/icons'
  import AboutApp from '../apps/components/AboutApp.svelte'
  import NotepadApp from '../apps/components/NotepadApp.svelte'
  import CalculatorApp from '../apps/components/CalculatorApp.svelte'
  import FilesApp from '../apps/components/FilesApp.svelte'
  import ImageViewerApp from '../apps/components/ImageViewerApp.svelte'
  import AlertApp from '../apps/components/AlertApp.svelte'

  interface Props {
    win: WindowState
    active: boolean
  }

  let { win, active }: Props = $props()

  const TASKBAR_H = 30
  const MIN_W = 180
  const MIN_H = 100

  type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

  function onTitlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest('.v2k-title-btn')) return

    windowManager.focus(win.id)
    if (win.maximized) return

    const startX = e.clientX
    const startY = e.clientY
    const origX = win.x
    const origY = win.y

    const onMove = (ev: PointerEvent) => {
      windowManager.move(win.id, origX + (ev.clientX - startX), origY + (ev.clientY - startY))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  function onTitleDblClick() {
    windowManager.toggleMaximize(win.id)
  }

  function startResize(edge: Edge, e: PointerEvent) {
    if (e.button !== 0 || win.maximized) return
    e.preventDefault()
    e.stopPropagation()
    windowManager.focus(win.id)

    const startX = e.clientX
    const startY = e.clientY
    const orig = { x: win.x, y: win.y, w: win.w, h: win.h }

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX
      const dy = ev.clientY - startY
      let x = orig.x
      let y = orig.y
      let w = orig.w
      let h = orig.h

      if (edge.includes('e')) w = orig.w + dx
      if (edge.includes('s')) h = orig.h + dy
      if (edge.includes('w')) {
        w = orig.w - dx
        x = orig.x + dx
      }
      if (edge.includes('n')) {
        h = orig.h - dy
        y = orig.y + dy
      }

      if (w < MIN_W) {
        if (edge.includes('w')) x = orig.x + orig.w - MIN_W
        w = MIN_W
      }
      if (h < MIN_H) {
        if (edge.includes('n')) y = orig.y + orig.h - MIN_H
        h = MIN_H
      }

      windowManager.resize(win.id, w, h, x, y)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const flushBody = $derived(
    win.appId === 'notepad' ||
      win.appId === 'files' ||
      win.appId === 'imageViewer' ||
      win.appId === 'calculator',
  )

  const style = $derived.by(() => {
    if (win.maximized) {
      return `left:0;top:0;width:100%;height:calc(100% - ${TASKBAR_H}px);z-index:${win.zIndex}`
    }
    return `left:${win.x}px;top:${win.y}px;width:${win.w}px;height:${win.h}px;z-index:${win.zIndex}`
  })
</script>

{#if !win.minimized}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="v2k-window"
    class:active
    class:maximized={win.maximized}
    style={style}
    onpointerdown={() => windowManager.focus(win.id)}
    role="dialog"
    tabindex="-1"
    aria-label={win.title}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="v2k-titlebar"
      onpointerdown={onTitlePointerDown}
      ondblclick={onTitleDblClick}
    >
      <span class="v2k-titlebar-icon" aria-hidden="true">
        {#if appIcon(win.appId)}
          <img src={appIcon(win.appId)} alt="" width="16" height="16" draggable="false" />
        {:else}
          {appGlyph(win.appId)}
        {/if}
      </span>
      <span class="v2k-titlebar-text">{win.title}</span>
      <div class="v2k-titlebar-controls">
        <button
          type="button"
          class="v2k-title-btn"
          aria-label="Minimize"
          onclick={(e) => {
            e.stopPropagation()
            windowManager.minimize(win.id)
          }}>_</button
        >
        <button
          type="button"
          class="v2k-title-btn"
          aria-label={win.maximized ? 'Restore' : 'Maximize'}
          onclick={(e) => {
            e.stopPropagation()
            windowManager.toggleMaximize(win.id)
          }}>{win.maximized ? '❐' : '□'}</button
        >
        <button
          type="button"
          class="v2k-title-btn close"
          aria-label="Close"
          onclick={(e) => {
            e.stopPropagation()
            windowManager.close(win.id)
          }}>×</button
        >
      </div>
    </div>

    <div class="v2k-window-body" class:flush={flushBody}>
      {#if win.appId === 'about'}
        <AboutApp />
      {:else if win.appId === 'notepad'}
        <NotepadApp windowId={win.id} path={win.payload?.path} />
      {:else if win.appId === 'calculator'}
        <CalculatorApp />
      {:else if win.appId === 'files'}
        <FilesApp windowId={win.id} path={win.payload?.path} />
      {:else if win.appId === 'imageViewer'}
        <ImageViewerApp path={win.payload?.path} />
      {:else if win.appId === 'alert'}
        <AlertApp
          windowId={win.id}
          message={win.payload?.message}
          title={win.payload?.title}
        />
      {:else}
        <p>Unknown app.</p>
      {/if}
    </div>

    {#if !win.maximized}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="v2k-resize n" onpointerdown={(e) => startResize('n', e)}></div>
      <div class="v2k-resize s" onpointerdown={(e) => startResize('s', e)}></div>
      <div class="v2k-resize e" onpointerdown={(e) => startResize('e', e)}></div>
      <div class="v2k-resize w" onpointerdown={(e) => startResize('w', e)}></div>
      <div class="v2k-resize ne" onpointerdown={(e) => startResize('ne', e)}></div>
      <div class="v2k-resize nw" onpointerdown={(e) => startResize('nw', e)}></div>
      <div class="v2k-resize se" onpointerdown={(e) => startResize('se', e)}></div>
      <div class="v2k-resize sw" onpointerdown={(e) => startResize('sw', e)}></div>
    {/if}
  </div>
{/if}
