<script lang="ts">
  import { APP_REGISTRY, START_MENU_APPS, appGlyph } from '../apps/registry'
  import type { AppId } from '../types'
  import { windowManager } from '../stores/windowManager'

  interface Props {
    open: boolean
    onclose: () => void
  }

  let { open, onclose }: Props = $props()

  function launch(id: AppId) {
    windowManager.openApp(id)
    onclose()
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose()
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="v2k-start-menu"
    role="menu"
    aria-label="Start menu"
    tabindex="-1"
    onkeydown={onKey}
  >
    <div class="v2k-start-stripe" aria-hidden="true">VetTV</div>
    <ul class="v2k-start-items">
      {#each START_MENU_APPS as appId}
        {@const def = APP_REGISTRY[appId]}
        <li>
          <button
            type="button"
            class="v2k-start-item"
            role="menuitem"
            onclick={() => launch(appId)}
          >
            <span class="glyph" aria-hidden="true">{appGlyph(appId)}</span>
            <span>{def.title}</span>
          </button>
        </li>
      {/each}
      <li class="v2k-start-sep" aria-hidden="true"></li>
      <li class="v2k-start-footer">Vet2000 · not affiliated with Microsoft</li>
    </ul>
  </div>
{/if}
