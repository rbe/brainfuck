import { useState, useEffect, useRef } from 'react'
import { EXAMPLES } from '../examples.js'

export function ExamplesMenu({ onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="dropdown" ref={ref}>
      <button onClick={() => setOpen(v => !v)}>Examples ▾</button>
      {open && (
        <div className="dropdown-menu">
          {EXAMPLES.map((ex, i) => (
            <div
              key={i}
              className="dropdown-item"
              onClick={() => { onSelect(ex); setOpen(false) }}
            >
              {ex.name}
              <small>{ex.desc}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
