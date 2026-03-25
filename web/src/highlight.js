export const BF_OPS = new Set('+-><[].,')

const OP_CLASS = {
  '>': 'syn-ptr', '<': 'syn-ptr',
  '+': 'syn-val', '-': 'syn-val',
  '[': 'syn-loop', ']': 'syn-loop',
  '.': 'syn-io',  ',': 'syn-io',
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Build an HTML string for the syntax-highlighted editor overlay.
 * @param {string} code
 * @param {number} currentPos  - original char index of the PC (-1 = none)
 * @param {Set<number>} breakpoints
 */
export function buildHighlight(code, currentPos, breakpoints) {
  if (!code) return ''
  let html = ''
  for (let i = 0; i < code.length; i++) {
    const ch = code[i]
    if (ch === '\n') { html += '\n'; continue }

    const base = OP_CLASS[ch] || 'syn-comment'
    const isPC = i === currentPos
    const isBP = breakpoints.has(i)

    let cls = base
    if (isPC && isBP) cls += ' syn-bp-pc'
    else if (isPC)    cls += ' syn-pc'
    else if (isBP)    cls += ' syn-bp'

    html += `<span class="${cls}">${esc(ch)}</span>`
  }
  return html
}

/**
 * Build per-line metadata for the gutter.
 * @returns {{ hasBP: boolean, isCurrent: boolean }[]}
 */
export function buildGutterData(code, breakpoints, currentPos) {
  const lines = code.split('\n')
  const result = []
  let charStart = 0
  for (const line of lines) {
    const charEnd = charStart + line.length
    const hasBP = [...breakpoints].some(bp => bp >= charStart && bp < charEnd)
    const isCurrent = currentPos >= charStart && currentPos < charEnd && currentPos >= 0
    result.push({ hasBP, isCurrent })
    charStart = charEnd + 1  // +1 for the \n
  }
  return result
}

/**
 * Scroll the textarea so the character at `pos` is centered vertically.
 */
export function scrollEditorToPos(ta, pos, code) {
  if (!ta || pos < 0 || pos >= code.length) return
  let line = 0
  for (let i = 0; i < pos; i++) {
    if (code[i] === '\n') line++
  }
  const lineH = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--line-height-editor')
  ) || 21
  const target = line * lineH - ta.clientHeight / 2 + lineH
  ta.scrollTop = Math.max(0, target)
}

/** Find the position of the nearest BF op at or after `pos`. */
export function nearestBFOp(code, pos) {
  for (let i = pos; i < code.length; i++) {
    if (BF_OPS.has(code[i])) return i
  }
  return -1
}
