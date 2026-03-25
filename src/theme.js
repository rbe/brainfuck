export const DARK_THEME = {
  '--bg': '#1e1e1e',
  '--surface': '#252526',
  '--surface2': '#2d2d2d',
  '--border': '#3c3c3c',
  '--fg': '#d4d4d4',
  '--fg-dim': '#858585',
  '--fg-bright': '#ffffff',
  '--accent': '#007acc',
  '--accent-hover': '#005f9e',
  '--error-color': '#f44747',
  '--warn-color': '#d7ba7d',
  '--success-color': '#4ec9b0',
  '--btn-bg': '#3c3c3c',
  '--btn-hover': '#4c4c4c',
  '--syn-ptr': '#9cdcfe',
  '--syn-val': '#4ec9b0',
  '--syn-loop': '#c586c0',
  '--syn-io': '#ce9178',
  '--syn-comment': '#4a4a4a',
  '--syn-pc-bg': '#264f78',
  '--syn-pc-fg': '#ffffff',
  '--syn-bp-bg': '#8b0000',
  '--syn-bp-fg': '#ff6b6b',
  '--tape-cell': '#2d2d2d',
  '--tape-active': '#007acc',
  '--tape-active-fg': '#ffffff',
  '--tape-nonzero': '#1e4a1e',
  '--scrollbar': '#4c4c4c',
  '--scrollbar-hover': '#6c6c6c',
}

export const LIGHT_THEME = {
  '--bg': '#f5f5f5',
  '--surface': '#ffffff',
  '--surface2': '#f0f0f0',
  '--border': '#d0d0d0',
  '--fg': '#1e1e1e',
  '--fg-dim': '#6c6c6c',
  '--fg-bright': '#000000',
  '--accent': '#0066b3',
  '--accent-hover': '#004d86',
  '--error-color': '#c91d00',
  '--warn-color': '#795e26',
  '--success-color': '#267f99',
  '--btn-bg': '#e0e0e0',
  '--btn-hover': '#d0d0d0',
  '--syn-ptr': '#0070c1',
  '--syn-val': '#267f99',
  '--syn-loop': '#7b3fb5',
  '--syn-io': '#a0522d',
  '--syn-comment': '#c0c0c0',
  '--syn-pc-bg': '#add8e6',
  '--syn-pc-fg': '#000000',
  '--syn-bp-bg': '#ffe0e0',
  '--syn-bp-fg': '#c91d00',
  '--tape-cell': '#f0f0f0',
  '--tape-active': '#0066b3',
  '--tape-active-fg': '#ffffff',
  '--tape-nonzero': '#e0ffe0',
  '--scrollbar': '#c0c0c0',
  '--scrollbar-hover': '#a0a0a0',
}

export const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontEditor: "'Courier New', Consolas, monospace",
  fontSizeEditor: 14,
  fontUI: 'system-ui, -apple-system, sans-serif',
  fontSizeUI: 13,
  tapeSize: 30000,
  maxSteps: 1000000,
  tapeCellsShown: 20,
  colors: { ...DARK_THEME },
}

export function applySettings(settings) {
  const root = document.documentElement
  for (const [k, v] of Object.entries(settings.colors || {})) {
    root.style.setProperty(k, v)
  }
  root.style.setProperty('--font-editor', settings.fontEditor || "'Courier New', monospace")
  root.style.setProperty('--font-size-editor', (settings.fontSizeEditor || 14) + 'px')
  root.style.setProperty('--line-height-editor', Math.round((settings.fontSizeEditor || 14) * 1.5) + 'px')
  root.style.setProperty('--font-ui', settings.fontUI || 'system-ui, sans-serif')
  root.style.setProperty('--font-size-ui', (settings.fontSizeUI || 13) + 'px')
  root.dataset.theme = settings.theme || 'dark'
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem('bf-ide-settings')
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        colors: { ...DEFAULT_SETTINGS.colors, ...parsed.colors },
      }
    }
  } catch (_) {}
  return { ...DEFAULT_SETTINGS, colors: { ...DARK_THEME } }
}

export function saveSettings(settings) {
  try { localStorage.setItem('bf-ide-settings', JSON.stringify(settings)) } catch (_) {}
}
