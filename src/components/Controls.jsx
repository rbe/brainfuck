export function Controls({ status, onRun, onStep, onContinue, onStop, onReset, onToggleBP, onClearBPs, bpCount }) {
  const running = status === 'running'
  const stopped = status === 'idle' || status === 'done' || status === 'error'
  const canStep = !running && !stopped
  // Also allow stepping from idle (creates a fresh interpreter in debug mode)
  const canStepOrDebug = !running && status !== 'done' && status !== 'error'

  return (
    <>
      <div className="controls">
        <button
          className="btn-primary"
          onClick={onRun}
          disabled={running}
          title="Run program (F5)"
        >
          ▶ Run
        </button>
        <button
          onClick={onStep}
          disabled={running || status === 'done' || status === 'error'}
          title="Step one instruction (F10)"
        >
          ⏭ Step
        </button>
        <button
          onClick={onContinue}
          disabled={running || stopped}
          title="Continue to next breakpoint (F8)"
        >
          ⏩ Continue
        </button>

        <div className="controls-sep" />

        <button
          onClick={onStop}
          disabled={!running}
          title="Pause execution"
        >
          ⏸ Pause
        </button>
        <button
          onClick={onReset}
          disabled={running}
          title="Reset interpreter"
        >
          ↺ Reset
        </button>

        <div className="controls-sep" />

        <button
          onClick={onToggleBP}
          title="Toggle breakpoint at cursor (F9)"
        >
          ● BP
        </button>
        <button
          onClick={onClearBPs}
          disabled={bpCount === 0}
          title="Clear all breakpoints"
          className={bpCount > 0 ? 'btn-danger' : ''}
        >
          ✕ BPs
        </button>
      </div>
    </>
  )
}

export function StatusBar({ status, steps, currentPos, errorMsg }) {
  const label = {
    idle:    'Ready — F5 run · F10 step · F9 breakpoint · F8 continue',
    running: `Running…  ${steps.toLocaleString()} steps`,
    paused:  `Paused at char ${currentPos}  (${steps.toLocaleString()} steps)`,
    done:    `Done — ${steps.toLocaleString()} steps`,
    error:   `Error: ${errorMsg}`,
  }[status] ?? status

  return (
    <div className={`status-bar ${status}`}>
      <span className="status-text">{label}</span>
    </div>
  )
}
