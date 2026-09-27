<script lang="ts">
  import { windowManager } from '../../stores/windowManager'

  interface Props {
    windowId: string
    message?: string
    title?: string
  }

  let { windowId, message = 'Something went wrong.', title }: Props = $props()
</script>

<div class="app-alert">
  <div class="app-alert-icon" aria-hidden="true">!</div>
  <div class="app-alert-body">
    {#if title}
      <strong class="app-alert-title">{title}</strong>
    {/if}
    <pre class="app-alert-msg">{message}</pre>
  </div>
  <div class="app-alert-actions">
    <button type="button" class="v2k-btn" onclick={() => windowManager.close(windowId)}>
      OK
    </button>
  </div>
</div>

<style>
  .app-alert {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 100%;
    padding: 4px;
    box-sizing: border-box;
  }
  .app-alert-icon {
    width: 28px;
    height: 28px;
    border: 2px solid #808080;
    background: #fff8c6;
    color: #a00;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: flex-start;
  }
  .app-alert-body {
    flex: 1;
    overflow: auto;
  }
  .app-alert-title {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
  }
  .app-alert-msg {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: Tahoma, 'MS Sans Serif', sans-serif;
    font-size: 11px;
    line-height: 1.4;
  }
  .app-alert-actions {
    display: flex;
    justify-content: flex-end;
  }
</style>
