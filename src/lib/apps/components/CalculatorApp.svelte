<div class="calc-stub">
  <h2>Calculator</h2>
  <p class="muted">Stub window — real calculator logic arrives in Milestone 3.</p>
  <div class="calc-display" aria-hidden="true">0</div>
  <div class="calc-pad" aria-hidden="true">
    {#each ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'] as k}
      <button type="button" class="v2k-btn" disabled>{k}</button>
    {/each}
  </div>
</div>

<style>
  .calc-stub h2 {
    margin: 0 0 6px;
    font-size: 14px;
  }
  .calc-stub .muted {
    color: #555;
    margin: 0 0 10px;
  }
  .calc-display {
    border: 2px solid;
    border-color: #808080 #fff #fff #808080;
    background: #fff;
    padding: 6px 8px;
    text-align: right;
    font-family: 'Courier New', monospace;
    font-size: 16px;
    margin-bottom: 8px;
  }
  .calc-pad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
  }
  .calc-pad .v2k-btn:disabled {
    opacity: 0.85;
  }
</style>
