<script lang="ts">
  import { onDestroy } from 'svelte'

  interface V86Options {
    wasm_path: string
    bios: { url: string }
    vga_bios: { url: string }
    cdrom: { buffer: ArrayBuffer }
    memory_size: number
    boot_order: number
    screen: { container: HTMLElement; scaling: number }
    autostart: boolean
    hda?: { buffer: ArrayBuffer }
  }

  interface V86Instance {
    add_listener(event: 'emulator-ready' | 'emulator-started' | 'emulator-stopped', listener: () => void): void
    add_listener(event: 'download-error', listener: (detail: { file_name: string }) => void): void
    destroy(): Promise<void>
    is_running(): boolean
    restart(): void
    run(): Promise<void>
    stop(): Promise<void>
  }

  type V86Constructor = new (options: V86Options) => V86Instance

  const BASE = import.meta.env.BASE_URL
  const MAX_ISO_BYTES = 2 * 1024 * 1024 * 1024

  let screenContainer: HTMLDivElement
  let selectedFile = $state<File | null>(null)
  let status = $state('Choose a bootable x86 ISO to start.')
  let loading = $state(false)
  let running = $state(false)
  let memoryMb = $state(256)
  let attachDisk = $state(false)
  let emulator = $state.raw<V86Instance | null>(null)
  let disposed = false
  let runtimePromise: Promise<V86Constructor> | null = null

  function getV86(): V86Constructor | undefined {
    return (window as Window & { V86?: V86Constructor }).V86
  }

  function loadV86(): Promise<V86Constructor> {
    const existingV86 = getV86()
    if (existingV86) return Promise.resolve(existingV86)
    if (runtimePromise) return runtimePromise

    runtimePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = `${BASE}v86/libv86.js`
      script.onload = () => {
        const V86 = getV86()
        if (V86) {
          resolve(V86)
        } else {
          runtimePromise = null
          reject(new Error('The emulator runtime did not initialize.'))
        }
      }
      script.onerror = () => {
        runtimePromise = null
        script.remove()
        reject(new Error('Could not load the local emulator runtime.'))
      }
      document.head.append(script)
    })

    return runtimePromise
  }

  function onIsoChange(event: Event) {
    const input = event.currentTarget
    if (!(input instanceof HTMLInputElement)) return
    selectedFile = input.files?.[0] ?? null
    if (selectedFile) {
      status = `${selectedFile.name} selected. Choose Boot ISO when ready.`
    } else {
      status = 'Choose a bootable x86 ISO to start.'
    }
  }

  async function bootIso() {
    const file = selectedFile
    if (!file || loading) return
    if (!file.name.toLowerCase().endsWith('.iso')) {
      status = 'Choose an ISO file.'
      return
    }
    if (file.size === 0 || file.size > MAX_ISO_BYTES) {
      status = file.size === 0
        ? 'The selected ISO is empty.'
        : 'This ISO is larger than the 2 GiB browser limit.'
      return
    }

    loading = true
    running = false
    status = `Reading ${file.name} in this browser…`

    try {
      const buffer = await file.arrayBuffer()
      if (disposed) return
      if (emulator) {
        await emulator.destroy()
        emulator = null
      }

      const V86 = await loadV86()
      if (disposed) return

      const options: V86Options = {
        wasm_path: `${BASE}v86/v86.wasm`,
        bios: { url: `${BASE}v86/seabios.bin` },
        vga_bios: { url: `${BASE}v86/vgabios.bin` },
        cdrom: { buffer },
        memory_size: memoryMb * 1024 * 1024,
        boot_order: 0x123,
        screen: { container: screenContainer, scaling: 1 },
        autostart: true,
      }

      if (attachDisk) {
        options.hda = { buffer: new ArrayBuffer(512 * 1024 * 1024) }
      }

      const instance = new V86(options)
      emulator = instance
      instance.add_listener('emulator-ready', () => {
        if (disposed) return
        loading = false
        running = instance.is_running()
        status = running
          ? `Booting ${file.name}…`
          : 'Emulator ready. Click Start if the guest is paused.'
      })
      instance.add_listener('emulator-started', () => {
        if (disposed) return
        loading = false
        running = true
        status = `Running ${file.name}`
      })
      instance.add_listener('emulator-stopped', () => {
        if (disposed) return
        running = false
        status = 'Paused'
      })
      instance.add_listener('download-error', (detail) => {
        if (disposed) return
        loading = false
        status = `Emulator asset failed to load: ${detail.file_name}`
      })
      status = 'Loading the virtual PC…'
    } catch (error) {
      loading = false
      running = false
      status = error instanceof Error ? `Could not start the emulator: ${error.message}` : 'Could not start the emulator.'
    }
  }

  async function toggleRun() {
    if (!emulator) return
    try {
      if (running) {
        await emulator.stop()
        running = false
        status = 'Paused'
      } else {
        await emulator.run()
        running = true
        status = selectedFile ? `Running ${selectedFile.name}` : 'Running'
      }
    } catch (error) {
      status = error instanceof Error ? `Emulator control failed: ${error.message}` : 'Emulator control failed.'
    }
  }

  function restart() {
    if (!emulator) return
    emulator.restart()
    status = selectedFile ? `Restarting ${selectedFile.name}…` : 'Restarting…'
  }

  async function closeVm() {
    const current = emulator
    emulator = null
    running = false
    if (current) {
      try {
        await current.destroy()
      } catch (error) {
        status = error instanceof Error ? `Could not close the emulator: ${error.message}` : 'Could not close the emulator.'
        return
      }
    }
    screenContainer.replaceChildren()
    status = 'Virtual PC closed. Choose an ISO to boot.'
  }

  onDestroy(() => {
    disposed = true
    const current = emulator
    emulator = null
    if (current) {
      void current.destroy().catch((error: unknown) => {
        console.error('Could not release the Vintage Lab emulator.', error)
      })
    }
  })
</script>

<section class="vintage-lab">
  <div class="lab-controls">
    <label class="iso-picker">
      <span>Retro OS boot image (.iso)</span>
      <input
        type="file"
        accept=".iso,application/x-iso9660-image,application/octet-stream"
        onchange={onIsoChange}
        aria-label="Choose a retro operating system ISO"
      />
    </label>

    <label>
      Memory
      <select bind:value={memoryMb} disabled={loading || Boolean(emulator)}>
        <option value={64}>64 MB</option>
        <option value={128}>128 MB</option>
        <option value={256}>256 MB</option>
        <option value={512}>512 MB</option>
      </select>
    </label>

    <label class="disk-option" title="Temporary disk; contents are discarded when the VM closes.">
      <input type="checkbox" bind:checked={attachDisk} disabled={loading || Boolean(emulator)} />
      Blank 512 MB install disk
    </label>

    <button class="v2k-btn" type="button" onclick={() => void bootIso()} disabled={!selectedFile || loading}>
      {loading ? 'Starting…' : 'Boot ISO'}
    </button>
    <button class="v2k-btn" type="button" onclick={() => void toggleRun()} disabled={!emulator || loading}>
      {running ? 'Pause' : 'Start'}
    </button>
    <button class="v2k-btn" type="button" onclick={restart} disabled={!emulator || loading}>
      Restart
    </button>
    <button class="v2k-btn" type="button" onclick={() => void closeVm()} disabled={!emulator || loading}>
      Close VM
    </button>
  </div>

  <div class="lab-message" role="note">
    Select a bootable, legally obtained x86 ISO. Your image stays in this browser and is not uploaded.
    Supports 16/32-bit x86 systems; 64-bit and ARM systems are not supported. A blank install disk is temporary.
  </div>

  <div class="vm-screen" bind:this={screenContainer} aria-label="Emulated computer screen"></div>

  <div class="lab-status" role="status" aria-live="polite">
    <span>{status}</span>
    {#if selectedFile}
      <span>{selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
    {/if}
  </div>
</section>

<style>
  .vintage-lab {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: #d4d0c8;
  }

  .lab-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 6px;
    padding: 6px;
    border-bottom: 1px solid #808080;
  }

  .lab-controls label {
    display: flex;
    flex-direction: column;
    gap: 3px;
    font-size: 10px;
  }

  .lab-controls .iso-picker {
    flex: 1 1 250px;
  }

  .lab-controls input[type='file'],
  .lab-controls select {
    min-width: 0;
    max-width: 100%;
    font: inherit;
  }

  .lab-controls .disk-option {
    flex-direction: row;
    align-items: center;
    min-height: 24px;
  }

  .lab-controls button {
    min-height: 24px;
  }

  .lab-message {
    padding: 5px 8px;
    color: #333;
    font-size: 10px;
    line-height: 1.4;
    border-bottom: 1px solid #aaa;
  }

  .vm-screen {
    flex: 1;
    min-width: 0;
    min-height: 180px;
    overflow: auto;
    background: #000;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }

  .vm-screen :global(canvas) {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: pixelated;
  }

  .lab-status {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 6px;
    color: #222;
    font-size: 10px;
    border-top: 1px solid #fff;
  }

  .lab-status span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .lab-status span + span {
      display: none;
    }
  }
</style>
