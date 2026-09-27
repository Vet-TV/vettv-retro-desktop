<script lang="ts">
  import { onMount } from 'svelte'

  type Op = '+' | '-' | '*' | '/' | null

  let display = $state('0')
  let accumulator = $state<number | null>(null)
  let pendingOp = $state<Op>(null)
  let freshEntry = $state(true)
  let error = $state(false)
  let rootEl: HTMLDivElement | undefined = $state()

  function formatNumber(n: number): string {
    if (!Number.isFinite(n)) return 'Error'
    let s = String(n)
    if (/e/i.test(s)) {
      s = n.toPrecision(10)
    }
    if (s.length > 16) {
      s = n.toPrecision(12)
    }
    if (s.includes('.') && !/e/i.test(s)) {
      s = s.replace(/\.?0+$/, '')
    }
    return s || '0'
  }

  function currentValue(): number {
    const n = Number(display)
    return Number.isFinite(n) ? n : 0
  }

  function setDisplayFromNumber(n: number) {
    if (!Number.isFinite(n)) {
      display = 'Error'
      error = true
      accumulator = null
      pendingOp = null
      freshEntry = true
      return
    }
    display = formatNumber(n)
    error = false
  }

  function clearAll() {
    display = '0'
    accumulator = null
    pendingOp = null
    freshEntry = true
    error = false
  }

  function clearEntry() {
    display = '0'
    freshEntry = true
    error = false
  }

  function backspace() {
    if (error || freshEntry) return
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      display = '0'
      freshEntry = true
      return
    }
    display = display.slice(0, -1)
  }

  function inputDigit(d: string) {
    if (error) clearAll()
    if (freshEntry) {
      display = d
      freshEntry = false
      return
    }
    if (display === '0' && d !== '.') {
      display = d
      return
    }
    if (display.replace('-', '').replace('.', '').length >= 15) return
    display += d
  }

  function inputDecimal() {
    if (error) clearAll()
    if (freshEntry) {
      display = '0.'
      freshEntry = false
      return
    }
    if (!display.includes('.')) display += '.'
  }

  function applyOp(a: number, op: Op, b: number): number {
    if (!op) return b
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        return b === 0 ? NaN : a / b
      default:
        return b
    }
  }

  function chooseOp(op: Op) {
    if (error) return
    const value = currentValue()
    if (accumulator !== null && pendingOp && !freshEntry) {
      const result = applyOp(accumulator, pendingOp, value)
      setDisplayFromNumber(result)
      if (error) return
      accumulator = result
    } else {
      accumulator = value
    }
    pendingOp = op
    freshEntry = true
  }

  function equals() {
    if (error) return
    if (pendingOp === null || accumulator === null) return
    const value = currentValue()
    const result = applyOp(accumulator, pendingOp, value)
    setDisplayFromNumber(result)
    accumulator = null
    pendingOp = null
    freshEntry = true
  }

  function negate() {
    if (error) return
    if (freshEntry && display === '0') return
    if (display.startsWith('-')) {
      display = display.slice(1)
    } else if (display !== '0') {
      display = '-' + display
    }
  }

  function press(key: string) {
    switch (key) {
      case 'C':
        clearAll()
        break
      case 'CE':
        clearEntry()
        break
      case 'BS':
        backspace()
        break
      case '±':
        negate()
        break
      case '.':
        inputDecimal()
        break
      case '=':
        equals()
        break
      case '+':
      case '-':
      case '*':
      case '/':
        chooseOp(key)
        break
      default:
        if (/^\d$/.test(key)) inputDigit(key)
    }
  }

  function isActiveWindow(): boolean {
    const winEl = rootEl?.closest('.v2k-window')
    return !!winEl?.classList.contains('active')
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!isActiveWindow()) return
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
      return
    }

    const k = e.key
    if (k >= '0' && k <= '9') {
      e.preventDefault()
      press(k)
    } else if (k === '.') {
      e.preventDefault()
      press('.')
    } else if (k === '+' || k === '-' || k === '*' || k === '/') {
      e.preventDefault()
      press(k)
    } else if (k === 'Enter' || k === '=') {
      e.preventDefault()
      press('=')
    } else if (k === 'Escape') {
      e.preventDefault()
      press('C')
    } else if (k === 'Backspace') {
      e.preventDefault()
      press('BS')
    } else if (k === 'Delete') {
      e.preventDefault()
      press('CE')
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  const keys: { label: string; key: string; cls?: string }[] = [
    { label: 'C', key: 'C', cls: 'fn' },
    { label: 'CE', key: 'CE', cls: 'fn' },
    { label: 'BS', key: 'BS', cls: 'fn' },
    { label: '÷', key: '/', cls: 'op' },
    { label: '7', key: '7' },
    { label: '8', key: '8' },
    { label: '9', key: '9' },
    { label: '×', key: '*', cls: 'op' },
    { label: '4', key: '4' },
    { label: '5', key: '5' },
    { label: '6', key: '6' },
    { label: '−', key: '-', cls: 'op' },
    { label: '1', key: '1' },
    { label: '2', key: '2' },
    { label: '3', key: '3' },
    { label: '+', key: '+', cls: 'op' },
    { label: '±', key: '±', cls: 'fn' },
    { label: '0', key: '0' },
    { label: '.', key: '.' },
    { label: '=', key: '=', cls: 'eq' },
  ]
</script>

<div class="calc" bind:this={rootEl} role="group" aria-label="Calculator">
  <div class="calc-display" aria-live="polite" aria-atomic="true">{display}</div>
  <div class="calc-pad">
    {#each keys as k}
      <button
        type="button"
        class="v2k-btn calc-key"
        class:fn={k.cls === 'fn'}
        class:op={k.cls === 'op'}
        class:eq={k.cls === 'eq'}
        onclick={() => press(k.key)}
      >
        {k.label}
      </button>
    {/each}
  </div>
  <div class="calc-hint">Keys: 0–9 · + − * / · Enter · Esc · Backspace</div>
</div>

<style>
  .calc {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    padding: 8px;
    gap: 8px;
    background: var(--v2k-face, #d4d0c8);
    box-sizing: border-box;
    user-select: none;
  }
  .calc-display {
    border: 2px solid;
    border-color: var(--v2k-face-darker, #404040) var(--v2k-face-light, #fff)
      var(--v2k-face-light, #fff) var(--v2k-face-darker, #404040);
    background: #fff;
    padding: 8px 10px;
    text-align: right;
    font-family: 'Courier New', Courier, monospace;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.5px;
    min-height: 32px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #000;
    flex-shrink: 0;
  }
  .calc-pad {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    flex: 1;
    min-height: 0;
  }
  .calc-key {
    min-height: 28px;
    padding: 4px 6px;
    font-size: 12px;
    font-weight: bold;
    width: 100%;
  }
  .calc-key.fn {
    color: #600;
  }
  .calc-key.op {
    color: #0a246a;
  }
  .calc-key.eq {
    background: #ece9d8;
  }
  .calc-hint {
    font-size: 9px;
    color: #555;
    text-align: center;
    flex-shrink: 0;
    line-height: 1.2;
  }
</style>
