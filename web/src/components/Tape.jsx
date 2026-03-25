function asciiLabel(v) {
  if (v === 0)   return 'NUL'
  if (v === 8)   return 'BS'
  if (v === 9)   return 'TAB'
  if (v === 10)  return 'LF'
  if (v === 13)  return 'CR'
  if (v === 27)  return 'ESC'
  if (v === 32)  return 'SPC'
  if (v === 127) return 'DEL'
  if (v < 32)    return 'CTL'
  return String.fromCharCode(v)
}

export function Tape({ tape, dp, steps, tapeCellsShown = 20 }) {
  const half  = Math.floor(tapeCellsShown / 2)
  const start = Math.max(0, dp - half)
  const end   = Math.min(tape.length, start + tapeCellsShown)
  const cells = []
  for (let i = start; i < end; i++) cells.push(i)

  const val = tape[dp] ?? 0
  const hex = '0x' + val.toString(16).toUpperCase().padStart(2, '0')

  return (
    <div className="tape-section">
      <div className="tape-meta">
        <span>Ptr: <strong>{dp}</strong></span>
        <span>Val: <strong>{val}</strong></span>
        <span>Hex: <strong>{hex}</strong></span>
        <span>ASCII: <strong>{asciiLabel(val)}</strong></span>
        <span>Steps: <strong>{steps.toLocaleString()}</strong></span>
      </div>
      <div className="tape-scroll">
        {cells.map(i => {
          const v = tape[i] ?? 0
          const active  = i === dp
          const nonzero = v !== 0
          return (
            <div
              key={i}
              className={`tape-cell${active ? ' active' : ''}${nonzero && !active ? ' nonzero' : ''}`}
              title={`[${i}] = ${v} (0x${v.toString(16).toUpperCase().padStart(2,'0')})`}
            >
              <div className="tape-idx">[{i}]</div>
              <div className="tape-val">{v}</div>
              <div className="tape-char">{asciiLabel(v)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
