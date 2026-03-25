import { useState, useRef, useEffect, useCallback } from 'react'
import { Editor }              from './components/Editor.jsx'
import { Tape }                from './components/Tape.jsx'
import { Controls, StatusBar } from './components/Controls.jsx'
import { IOPanel }             from './components/IOPanel.jsx'
import { SettingsModal }       from './components/SettingsModal.jsx'
import { ExamplesMenu }        from './components/ExamplesMenu.jsx'
import { BFInterpreter }       from './BFInterpreter.js'
import { nearestBFOp }         from './highlight.js'
import { EXAMPLES }            from './examples.js'
import { DARK_THEME, LIGHT_THEME, loadSettings, saveSettings, applySettings } from './theme.js'

const CHUNK = 50000  // instructions per setTimeout tick

const IDLE_VIEW = {
  tape: new Uint8Array(30000),
  dp: 0,
  currentPos: -1,
  steps: 0,
  output: [],
  status: 'idle',
  errorMsg: null,
}

function snapshot(interp) {
  return {
    tape: interp.tape.slice(),
    dp: interp.dp,
    currentPos: interp.currentPos,
    steps: interp.steps,
    output: [...interp.output],
    status: interp.state,
    errorMsg: interp.error,
  }
}

const OUTPUT_MODES = ['ascii', 'decimal', 'hex']

export default function App() {
  // ── Settings ──────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(() => loadSettings())
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    applySettings(settings)
    saveSettings(settings)
  }, [settings])

  // ── Editor state ──────────────────────────────────────────────────────
  const [code, setCode] = useState(EXAMPLES[0].code)
  const [input, setInput] = useState(EXAMPLES[0].input ?? '')
  const [breakpoints, setBreakpoints] = useState(new Set())
  const [outputModeIdx, setOutputModeIdx] = useState(0)

  // ── Interpreter render state ──────────────────────────────────────────
  const [view, setView] = useState(IDLE_VIEW)

  // ── Mutable refs ──────────────────────────────────────────────────────
  const interpRef   = useRef(null)    // BFInterpreter instance
  const timerRef    = useRef(null)    // setTimeout id
  const bpRef       = useRef(new Set()) // breakpoints (for use inside timers)
  const editorTaRef = useRef(null)    // textarea element (for F9 cursor pos)

  useEffect(() => { bpRef.current = breakpoints }, [breakpoints])

  // ── Stop any running timer ────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ── Create interpreter ────────────────────────────────────────────────
  const createInterp = useCallback(() => {
    try {
      return new BFInterpreter({
        code,
        input,
        tapeSize: settings.tapeSize  || 30000,
        maxSteps:  settings.maxSteps  || 1000000,
      })
    } catch (e) {
      setView(v => ({ ...v, status: 'error', errorMsg: e.message }))
      return null
    }
  }, [code, input, settings])

  // ── Run loop helpers ──────────────────────────────────────────────────
  const scheduleChunk = useCallback((interp) => {
    timerRef.current = setTimeout(() => {
      if (interpRef.current !== interp) return
      for (let i = 0; i < CHUNK; i++) {
        if (i > 0 && bpRef.current.has(interp.currentPos)) {
          interp.state = 'paused'; break
        }
        if (!interp.step()) break
      }
      setView(snapshot(interp))
      if (interp.state === 'running') scheduleChunk(interp)
    }, 0)
  }, [])

  // ── Public actions ────────────────────────────────────────────────────
  const doRun = useCallback(() => {
    stopTimer()
    const interp = createInterp()
    if (!interp) return
    interpRef.current = interp
    interp.state = 'running'
    setView(snapshot(interp))
    scheduleChunk(interp)
  }, [stopTimer, createInterp, scheduleChunk])

  const doStep = useCallback(() => {
    stopTimer()
    let interp = interpRef.current
    if (!interp || interp.state === 'done' || interp.state === 'error') {
      interp = createInterp()
      if (!interp) return
      interpRef.current = interp
    }
    if (interp.state === 'ready') interp.state = 'paused'
    if (interp.state !== 'paused') return
    interp.step()
    if (interp.state === 'running') interp.state = 'paused'
    setView(snapshot(interp))
  }, [stopTimer, createInterp])

  const doContinue = useCallback(() => {
    stopTimer()
    const interp = interpRef.current
    if (!interp || interp.state === 'done' || interp.state === 'error' || interp.state === 'running') return
    const startPos = interp.currentPos
    let skipped = false
    interp.state = 'running'

    const tick = () => {
      if (interpRef.current !== interp) return
      for (let i = 0; i < CHUNK; i++) {
        if (bpRef.current.has(interp.currentPos) && (skipped || interp.currentPos !== startPos)) {
          interp.state = 'paused'; break
        }
        skipped = true
        if (!interp.step()) break
      }
      setView(snapshot(interp))
      if (interp.state === 'running') timerRef.current = setTimeout(tick, 0)
    }
    timerRef.current = setTimeout(tick, 0)
  }, [stopTimer])

  const doStop = useCallback(() => {
    stopTimer()
    const interp = interpRef.current
    if (interp?.state === 'running') { interp.state = 'paused'; setView(snapshot(interp)) }
  }, [stopTimer])

  const doReset = useCallback(() => {
    stopTimer()
    interpRef.current = null
    setView(IDLE_VIEW)
  }, [stopTimer])

  const doToggleBP = useCallback(() => {
    const ta = editorTaRef.current
    const pos = ta ? ta.selectionStart : 0
    const bpPos = nearestBFOp(code, pos)
    if (bpPos < 0) return
    setBreakpoints(prev => {
      const next = new Set(prev)
      if (next.has(bpPos)) next.delete(bpPos); else next.add(bpPos)
      return next
    })
  }, [code])

  const doClearBPs = useCallback(() => setBreakpoints(new Set()), [])

  const handleToggleTheme = useCallback(() => {
    setSettings(prev => prev.theme === 'dark'
      ? { ...prev, theme: 'light', colors: { ...LIGHT_THEME } }
      : { ...prev, theme: 'dark',  colors: { ...DARK_THEME  } }
    )
  }, [])

  // ── Global keyboard shortcuts ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'F5')  { e.preventDefault(); doRun() }
      if (e.key === 'F8')  { e.preventDefault(); doContinue() }
      if (e.key === 'F9')  { e.preventDefault(); doToggleBP() }
      if (e.key === 'F10') { e.preventDefault(); doStep() }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [doRun, doContinue, doToggleBP, doStep])

  // ── Expose textarea ref to Editor via callback ref ────────────────────
  const handleEditorTA = useCallback((el) => { editorTaRef.current = el }, [])

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <h1>&#129504; <span>Brainfuck</span> IDE</h1>
        <ExamplesMenu onSelect={ex => {
          doReset()
          setCode(ex.code)
          setInput(ex.input ?? '')
        }} />
        <div className="header-space" />
        <button onClick={handleToggleTheme} title="Toggle light/dark">
          {settings.theme === 'dark' ? '☀' : '☾'}
        </button>
        <button onClick={() => setSettingsOpen(true)}>⚙ Settings</button>
      </header>

      {/* ── Main ── */}
      <div className="app-main">

        {/* Left: editor + controls */}
        <div className="left-panel">
          <div className="section-label">
            Editor
            {breakpoints.size > 0 && (
              <span className="bp-count">
                ● {breakpoints.size} breakpoint{breakpoints.size !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <Editor
            code={code}
            onChange={v => { doReset(); setCode(v) }}
            breakpoints={breakpoints}
            onBreakpointsChange={setBreakpoints}
            currentPos={view.currentPos}
            status={view.status}
            onTAReady={handleEditorTA}
          />
          <Controls
            status={view.status}
            onRun={doRun}
            onStep={doStep}
            onContinue={doContinue}
            onStop={doStop}
            onReset={doReset}
            onToggleBP={doToggleBP}
            onClearBPs={doClearBPs}
            bpCount={breakpoints.size}
          />
          <StatusBar
            status={view.status}
            steps={view.steps}
            currentPos={view.currentPos}
            errorMsg={view.errorMsg}
          />
        </div>

        {/* Right: tape + I/O */}
        <div className="right-panel">
          <div className="section-label">Memory Tape</div>
          <Tape
            tape={view.tape}
            dp={view.dp}
            steps={view.steps}
            tapeCellsShown={settings.tapeCellsShown || 20}
          />
          <IOPanel
            input={input}
            onInputChange={v => { setInput(v); doReset() }}
            output={view.output}
            outputMode={OUTPUT_MODES[outputModeIdx]}
            onOutputModeChange={() => setOutputModeIdx(i => (i + 1) % OUTPUT_MODES.length)}
            onClearOutput={() => {
              if (interpRef.current) interpRef.current.output = []
              setView(v => ({ ...v, output: [] }))
            }}
          />
        </div>
      </div>

      {/* Settings dialog */}
      <SettingsModal
        settings={settings}
        onUpdate={setSettings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
