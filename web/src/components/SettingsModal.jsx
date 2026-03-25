import { useState, useEffect } from 'react'
import { DARK_THEME, LIGHT_THEME, DEFAULT_SETTINGS, applySettings } from '../theme.js'

const GENERAL_COLORS = [
  { v: '--bg',      label: 'Background' },
  { v: '--surface', label: 'Surface' },
  { v: '--surface2',label: 'Surface 2' },
  { v: '--border',  label: 'Border' },
  { v: '--fg',      label: 'Foreground' },
  { v: '--fg-dim',  label: 'Foreground dim' },
  { v: '--accent',  label: 'Accent' },
  { v: '--error-color', label: 'Error' },
]

const SYNTAX_COLORS = [
  { v: '--syn-ptr',    label: 'Pointer (> <)' },
  { v: '--syn-val',    label: 'Value (+ -)' },
  { v: '--syn-loop',   label: 'Loop ([ ])' },
  { v: '--syn-io',     label: 'I/O (. ,)' },
  { v: '--syn-comment',label: 'Comments' },
  { v: '--syn-pc-bg',  label: 'PC bg' },
  { v: '--syn-pc-fg',  label: 'PC fg' },
  { v: '--syn-bp-bg',  label: 'Breakpoint bg' },
  { v: '--syn-bp-fg',  label: 'Breakpoint fg' },
]

const TAPE_COLORS = [
  { v: '--tape-cell',      label: 'Cell background' },
  { v: '--tape-active',    label: 'Active cell' },
  { v: '--tape-active-fg', label: 'Active cell text' },
  { v: '--tape-nonzero',   label: 'Non-zero cell' },
]

function ColorRow({ label, value, onChange }) {
  return (
    <div className="setting-row">
      <label>{label}</label>
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

export function SettingsModal({ settings, onUpdate, isOpen, onClose }) {
  const [local, setLocal] = useState(settings)

  // Reset local state when modal opens
  useEffect(() => {
    if (isOpen) setLocal(settings)
  }, [isOpen, settings])

  function setColor(varName, value) {
    // Live preview
    document.documentElement.style.setProperty(varName, value)
    setLocal(prev => ({ ...prev, colors: { ...prev.colors, [varName]: value } }))
  }

  function set(key, value) {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  function applyPreset(theme) {
    const colors = theme === 'dark' ? { ...DARK_THEME } : { ...LIGHT_THEME }
    for (const [k, v] of Object.entries(colors)) {
      document.documentElement.style.setProperty(k, v)
    }
    document.documentElement.dataset.theme = theme
    setLocal(prev => ({ ...prev, theme, colors }))
  }

  function handleSave() {
    applySettings(local)
    onUpdate(local)
    onClose()
  }

  function handleReset() {
    const def = { ...DEFAULT_SETTINGS, colors: { ...DARK_THEME } }
    applySettings(def)
    setLocal(def)
    onUpdate(def)
  }

  if (!isOpen) return null

  const c = local.colors || {}

  return (
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-header-title">Settings</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Theme presets */}
          <div className="settings-group">
            <h3>Theme Preset</h3>
            <div className="preset-row">
              <button onClick={() => applyPreset('dark')}>Dark</button>
              <button onClick={() => applyPreset('light')}>Light</button>
            </div>
          </div>

          {/* General colors */}
          <div className="settings-group">
            <h3>General Colors</h3>
            <div className="color-grid">
              {GENERAL_COLORS.map(({ v, label }) => (
                <ColorRow key={v} label={label} value={c[v]} onChange={val => setColor(v, val)} />
              ))}
            </div>
          </div>

          {/* Syntax colors */}
          <div className="settings-group">
            <h3>Syntax Colors</h3>
            <div className="color-grid">
              {SYNTAX_COLORS.map(({ v, label }) => (
                <ColorRow key={v} label={label} value={c[v]} onChange={val => setColor(v, val)} />
              ))}
            </div>
          </div>

          {/* Tape colors */}
          <div className="settings-group">
            <h3>Tape Colors</h3>
            <div className="color-grid">
              {TAPE_COLORS.map(({ v, label }) => (
                <ColorRow key={v} label={label} value={c[v]} onChange={val => setColor(v, val)} />
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className="settings-group">
            <h3>Fonts</h3>
            <div className="setting-row">
              <label>Editor font</label>
              <input type="text" value={local.fontEditor || ''}
                onChange={e => set('fontEditor', e.target.value)}
                placeholder="'Courier New', monospace" />
            </div>
            <div className="setting-row">
              <label>Editor size (px)</label>
              <input type="number" min="8" max="32" value={local.fontSizeEditor || 14}
                onChange={e => set('fontSizeEditor', Number(e.target.value))} />
            </div>
            <div className="setting-row">
              <label>UI font</label>
              <input type="text" value={local.fontUI || ''}
                onChange={e => set('fontUI', e.target.value)}
                placeholder="system-ui, sans-serif" />
            </div>
            <div className="setting-row">
              <label>UI size (px)</label>
              <input type="number" min="8" max="24" value={local.fontSizeUI || 13}
                onChange={e => set('fontSizeUI', Number(e.target.value))} />
            </div>
          </div>

          {/* Interpreter */}
          <div className="settings-group">
            <h3>Interpreter</h3>
            <div className="setting-row">
              <label>Tape size (cells)</label>
              <input type="number" min="100" max="10000000" value={local.tapeSize || 30000}
                onChange={e => set('tapeSize', Number(e.target.value))} />
            </div>
            <div className="setting-row">
              <label>Max steps</label>
              <input type="number" min="1000" max="1000000000" value={local.maxSteps || 1000000}
                onChange={e => set('maxSteps', Number(e.target.value))} />
            </div>
            <div className="setting-row">
              <label>Tape cells shown</label>
              <input type="number" min="5" max="60" value={local.tapeCellsShown || 20}
                onChange={e => set('tapeCellsShown', Number(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleReset}>Reset to Defaults</button>
          <button className="btn-primary" onClick={handleSave}>Done</button>
        </div>
      </div>
    </div>
  )
}
