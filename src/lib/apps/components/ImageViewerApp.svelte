<script lang="ts">
  import { onDestroy } from 'svelte'
  import { readFile } from '../../vfs'

  interface Props {
    path?: string
  }

  let { path }: Props = $props()

  let objectUrl = $state<string | null>(null)
  let error = $state<string | null>(null)
  let loading = $state(false)

  async function load(p: string | undefined) {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      objectUrl = null
    }
    error = null
    if (!p) {
      error = 'No image path.'
      return
    }
    loading = true
    try {
      const blob = await readFile(p)
      objectUrl = URL.createObjectURL(blob)
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load image'
    } finally {
      loading = false
    }
  }

  $effect(() => {
    void load(path)
  })

  onDestroy(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  })
</script>

<div class="img-viewer">
  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="err">{error}</p>
  {:else if objectUrl}
    <img src={objectUrl} alt={path ?? 'Image'} />
  {:else}
    <p class="muted">No image selected.</p>
  {/if}
</div>

<style>
  .img-viewer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 120px;
    background: #1a1a1a;
    overflow: auto;
  }
  .img-viewer img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    image-rendering: auto;
  }
  .muted {
    color: #aaa;
  }
  .err {
    color: #f88;
    padding: 12px;
  }
</style>
