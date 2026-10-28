<script lang="ts">
  import type { WindowState } from '../types'
  import { windowManager } from '../stores/windowManager'
  import { appGlyph, appIcon, getApp } from '../apps/registry'
  import { createHost, requestClose } from '../shell/host'
  import type { Component } from 'svelte'

  interface Props {
    win: WindowState
    active: boolean
  }

  let { win, active }: Props = $props()

  const TASKBAR_H = 30
  const manifest = $derived(getApp(win.appId))
  const MIN_W = $derived(manifest?.window.minW ?? 180)
  const MIN_H = $derived(manifest?.window.minH ?? 100)
  const resizable = $derived(manifest?.window.resizable !== false)
  const host = $derived(createHost(win.id, win.appId))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loaded = $derived<Promise<Component<any> | null>>(
    manifest ? manifest.load().then((m) => m.default) : Promise.resolve(null),
  )

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
    if (!resizable) return
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

  const flushBody = $derived(manifest?.window.flushBody === true)

  const style = $derived.by(() => {
    if (win.maximized) {
      return `left:0;top:0;width:100%;height:calc(100% - ${TASKBAR_H}px);z-index:${win.zIndex}`
    }
    return `left:${win.x}px;top:${win.y}px;width:${win.w}px;height:${win.h}px;z-index:${win.zIndex}`
  })
</script>

{#if !win.minimized || manifest?.window.keepAliveWhenMinimized}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="v2k-window"
    class:active
    class:maximized={win.maximized}
    class:minimized={win.minimized}
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
        {#if appIcon(win.appId, 16)}
          <img src={appIcon(win.appId, 16)} alt="" width="16" height="16" draggable="false" />
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
        {#if resizable}
        <button
          type="button"
          class="v2k-title-btn"
          aria-label={win.maximized ? 'Restore' : 'Maximize'}
          onclick={(e) => {
            e.stopPropagation()
            windowManager.toggleMaximize(win.id)
          }}>{win.maximized ? '❐' : '□'}</button
        >
        {/if}
        <button
          type="button"
          class="v2k-title-btn close"
          aria-label="Close"
          onclick={(e) => {
            e.stopPropagation()
            void requestClose(win.id)
          }}>×</button
        >
      </div>
    </div>

    <div class="v2k-window-body" class:flush={flushBody}>
      {#await loaded}
        <p class="v2k-app-loading">Loading…</p>
      {:then AppComponent}
        {#if AppComponent}
          <AppComponent
            {host}
            windowId={win.id}
            payload={win.payload}
            path={win.payload?.path}
            message={win.payload?.message}
            title={win.payload?.title}
          />
        {:else}
          <p>Unknown app.</p>
        {/if}
      {:catch err}
        <p>Failed to load app: {err instanceof Error ? err.message : String(err)}</p>
      {/await}
    </div>

    {#if !win.maximized && resizable}
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
