import { useRef, useEffect, useCallback } from 'react'
import { buildHighlight, buildGutterData, BF_OPS } from '../highlight.js'

export function Editor({ code, onChange, breakpoints, onBreakpointsChange, currentPos, status, onTAReady }) {
  const taRef = useRef(null)
  const hlPreRef = useRef(null)
  const gutterInnerRef = useRef(null)

  // Sync highlight + gutter scroll to match textarea scroll
  const syncScroll = useCallback(() => {
    const ta = taRef.current
    const hl = hlPreRef.current
    const gi = gutterInnerRef.current
    if (!ta) return
    if (hl) hl.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`
    if (gi) gi.style.transform = `translateY(${-ta.scrollTop}px)`
  }, [])

  // Scroll textarea to show the current PC position
  useEffect(() => {
    const ta = taRef.current
    if (!ta || currentPos < 0 || status !== 'paused') return
    let line = 0
    for (let i = 0; i < currentPos; i++) {
      if (code[i] === '\n') line++
    }
    const lineH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--line-height-editor')
    ) || 21
    const target = line * lineH - ta.clientHeight / 2 + lineH
    ta.scrollTop = Math.max(0, target)
    syncScroll()
  }, [currentPos, status, code, syncScroll])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.target
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const next = code.substring(0, start) + '  ' + code.substring(end)
      onChange(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
  }, [code, onChange])

  // Click in gutter → toggle breakpoint for that line
  const handleGutterClick = useCallback((lineIdx) => {
    const lines = code.split('\n')
    let charStart = 0
    for (let i = 0; i < lineIdx; i++) charStart += lines[i].length + 1
    const charEnd = charStart + (lines[lineIdx]?.length ?? 0)

    const next = new Set(breakpoints)
    // Remove any existing BP on this line
    let removed = false
    for (const bp of breakpoints) {
      if (bp >= charStart && bp < charEnd) { next.delete(bp); removed = true }
    }
    if (!removed) {
      // Add BP at first BF op on the line
      for (let i = charStart; i < charEnd; i++) {
        if (BF_OPS.has(code[i])) { next.add(i); break }
      }
    }
    onBreakpointsChange(next)
  }, [code, breakpoints, onBreakpointsChange])

  const highlighted = buildHighlight(code, currentPos, breakpoints)
  const gutterData  = buildGutterData(code, breakpoints, currentPos)

  return (
    <div className="editor-section">
      <div className="editor-container">
        {/* Gutter */}
        <div className="editor-gutter">
          <div className="gutter-inner" ref={gutterInnerRef}>
            {gutterData.map((g, i) => (
              <div
                key={i}
                className={`gutter-line${g.hasBP ? ' has-bp' : ''}${g.isCurrent ? ' current-line' : ''}`}
                onClick={() => handleGutterClick(i)}
                title={g.hasBP ? 'Remove breakpoint' : 'Add breakpoint'}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Editor area */}
        <div className="editor-wrap">
          {/* Syntax-highlighted overlay */}
          <div className="hl-container">
            <pre
              ref={hlPreRef}
              className="hl-pre"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </div>

          {/* Actual editable textarea */}
          <textarea
            ref={el => { taRef.current = el; onTAReady?.(el) }}
            className="editor-ta"
            value={code}
            onChange={e => onChange(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="Brainfuck source code"
          />
        </div>
      </div>
    </div>
  )
}
