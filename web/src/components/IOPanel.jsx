const MODES = ['ascii', 'decimal', 'hex']

function renderOutput(bytes, mode) {
  if (!bytes.length) return ''
  if (mode === 'decimal') {
    return bytes.map(b => `<span title="${b >= 32 && b < 127 ? String.fromCharCode(b) : '\\x' + b.toString(16).padStart(2,'0')}">${b}</span>`).join(' ')
  }
  if (mode === 'hex') {
    return bytes.map(b => `<span title="${b}">${b.toString(16).padStart(2,'0').toUpperCase()}</span>`).join(' ')
  }
  // ascii mode
  let html = ''
  for (const b of bytes) {
    if (b === 10) {
      html += '\n'
    } else if (b >= 32 && b < 127) {
      html += b === 60 ? '&lt;' : b === 62 ? '&gt;' : b === 38 ? '&amp;' : String.fromCharCode(b)
    } else {
      html += `<span class="out-ctrl">\\x${b.toString(16).padStart(2,'0').toUpperCase()}</span>`
    }
  }
  return html
}

export function IOPanel({ input, onInputChange, output, outputMode, onOutputModeChange, onClearOutput }) {
  const nextMode = MODES[(MODES.indexOf(outputMode) + 1) % MODES.length]

  return (
    <div className="io-section">
      {/* Input */}
      <div className="io-half">
        <div className="io-header">
          <span className="io-header-title">Input (stdin)</span>
          <button onClick={() => onInputChange('')}>Clear</button>
        </div>
        <textarea
          className="io-textarea"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          placeholder="Program input here…"
          spellCheck={false}
        />
      </div>

      {/* Output */}
      <div className="io-half">
        <div className="io-header">
          <span className="io-header-title">Output (stdout)</span>
          <button
            onClick={onOutputModeChange}
            title={`Switch to ${nextMode} mode`}
          >
            {outputMode.toUpperCase()}
          </button>
          <button onClick={onClearOutput}>Clear</button>
        </div>
        <div
          className="output-display"
          dangerouslySetInnerHTML={{ __html: renderOutput(output, outputMode) }}
        />
      </div>
    </div>
  )
}
