<script lang="ts">
  // Thin shell adapter; real app lives in ../text-editor/ for manifest migration.
  import { windowManager } from '../../stores/windowManager'
  import VetPad from '../text-editor/VetPad.svelte'
  let { windowId, path }: { windowId: string; path?: string } = $props()
</script>

<VetPad {path}
  setTitle={(t) => windowManager.setTitle(windowId, t)}
  setPath={(p) => windowManager.setPayload(windowId, p ? { path: p } : {})} />
