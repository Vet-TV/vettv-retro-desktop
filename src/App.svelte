<script lang="ts">
  import Desktop from './lib/components/Desktop.svelte'
  import { windowManager } from './lib/stores/windowManager'
</script>

<Desktop windows={$windowManager} />
