# Brainfuck IDE

A browser-based IDE for Brainfuck, built with React + Vite.

## Quick start

```bash
cd web
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # produces dist/index.html (single self-contained file)
```

The build output (`dist/index.html`) is a **single file** with no external dependencies, suitable for offline use.

## Project structure

```
web/
├── index.html              Vite HTML entry
├── vite.config.js          vite-plugin-singlefile → single file output
├── package.json
└── src/
    ├── main.jsx            React entry point
    ├── App.jsx             Root component; all interpreter state lives here
    ├── index.css           Global styles, CSS custom properties (theming)
    ├── theme.js            DARK_THEME / LIGHT_THEME constants, applySettings()
    ├── examples.js         Built-in example programs
    ├── BFInterpreter.js    Brainfuck interpreter class
    ├── highlight.js        Syntax highlighting helpers, gutter data builder
    └── components/
        ├── Editor.jsx      Code editor (textarea + pre overlay, gutter, breakpoints)
        ├── Tape.jsx        Memory tape visualiser
        ├── Controls.jsx    Run / Step / Continue / Stop / Reset buttons + status bar
        ├── IOPanel.jsx     stdin input + stdout output (ASCII / decimal / hex)
        ├── ExamplesMenu.jsx  Examples dropdown
        └── SettingsModal.jsx  Full settings dialog (colors, fonts, interpreter options)

src/main/brainfuck/         Original BF example files
src/main/java/              Java BF interpreter (legacy)
dist/                       Build output (generated, not committed)
```

## Features

| Feature | Details |
|---|---|
| Syntax highlighting | `>< +-` `[]` `.,` each colored; non-BF chars are comments |
| Debugger | Step (F10), Continue to breakpoint (F8), visual PC indicator |
| Breakpoints | Click gutter line or press F9 at cursor; red ● indicator |
| Memory tape | Scrollable cells showing index / decimal / ASCII around current pointer |
| I/O | stdin textarea; stdout in ASCII, decimal, or hex mode |
| Themes | Dark & light presets; every color is individually configurable |
| Fonts | Editor and UI font family + size configurable separately |
| Interpreter options | Tape size, max steps (step limit prevents infinite loop UI freeze) |
| Persistence | All settings saved to `localStorage` |
| Single-file build | `npm run build` → `dist/index.html` via `vite-plugin-singlefile` |

## Keyboard shortcuts

| Key | Action |
|---|---|
| F5  | Run program |
| F8  | Continue to next breakpoint |
| F9  | Toggle breakpoint at cursor |
| F10 | Step one instruction |

## Architecture notes

### Interpreter loop
`BFInterpreter` is stored in a `useRef` (mutable, outside React render cycle).
Execution runs in `setTimeout` chunks of 50 000 steps to keep the UI responsive.
After each chunk a `snapshot()` (deep copy of tape + scalar state) is written to React state, triggering a re-render of Tape and status elements.

### Editor overlay
The editor uses a `<textarea>` (transparent text, visible caret) on top of a `<pre>` containing syntax-highlighted HTML spans. On every scroll event the `<pre>` is translated with CSS `transform: translate(x, y)` to stay in sync.

### Theming
All colors are CSS custom properties on `:root`.
`applySettings()` writes properties directly to `document.documentElement.style`, giving instant live preview in the settings modal.

## Adding examples

Edit `src/examples.js`. Each entry:

```js
{
  name: 'My example',
  desc: 'Short description shown in dropdown',
  input: '',       // pre-filled stdin
  code: `...`,    // BF source (comments allowed)
}
```
