<script lang="ts">
  // Thin adapter; app lives in ../text-editor/.
  import type { AppHost } from '../../types'
  import VetPad from '../text-editor/VetPad.svelte'
  let { host, path }: { host: AppHost; path?: string } = $props()
</script>

<VetPad {host} {path} />
