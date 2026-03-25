export class BFInterpreter {
  constructor({ code, input, tapeSize = 30000, maxSteps = 1000000 }) {
    this.originalCode = code

    // Build instruction list with original char positions
    this.instructions = []
    for (let i = 0; i < code.length; i++) {
      if ('+-><[].,'.includes(code[i])) {
        this.instructions.push({ op: code[i], pos: i })
      }
    }

    // Precompute bracket matching
    this.brackets = new Map()
    const stack = []
    for (let i = 0; i < this.instructions.length; i++) {
      const { op, pos } = this.instructions[i]
      if (op === '[') {
        stack.push(i)
      } else if (op === ']') {
        if (!stack.length) throw new Error(`Unmatched ] at char ${pos}`)
        const j = stack.pop()
        this.brackets.set(i, j)
        this.brackets.set(j, i)
      }
    }
    if (stack.length) {
      throw new Error(`Unmatched [ at char ${this.instructions[stack[0]].pos}`)
    }

    this.tape = new Uint8Array(tapeSize)
    this.tapeSize = tapeSize
    this.dp = 0  // data pointer
    this.ip = 0  // instruction pointer
    this.input = input
    this.inputPos = 0
    this.output = []
    this.steps = 0
    this.maxSteps = maxSteps
    this.state = 'ready'  // ready | running | paused | done | error
    this.error = null
  }

  /** Original code position of the current instruction, or -1 if finished. */
  get currentPos() {
    return this.instructions[this.ip]?.pos ?? -1
  }

  /** Execute one instruction. Returns false when finished (done/error). */
  step() {
    if (this.ip >= this.instructions.length) {
      this.state = 'done'
      return false
    }
    if (this.steps >= this.maxSteps) {
      this.state = 'error'
      this.error = `Step limit (${this.maxSteps.toLocaleString()}) reached`
      return false
    }

    const { op } = this.instructions[this.ip]

    switch (op) {
      case '>':
        if (++this.dp >= this.tapeSize) {
          this.state = 'error'
          this.error = 'Data pointer moved past end of tape'
          return false
        }
        break
      case '<':
        if (--this.dp < 0) {
          this.state = 'error'
          this.error = 'Data pointer moved before start of tape'
          return false
        }
        break
      case '+': this.tape[this.dp] = (this.tape[this.dp] + 1) & 0xFF; break
      case '-': this.tape[this.dp] = (this.tape[this.dp] - 1) & 0xFF; break
      case '.': this.output.push(this.tape[this.dp]); break
      case ',':
        this.tape[this.dp] = this.inputPos < this.input.length
          ? this.input.charCodeAt(this.inputPos++) & 0xFF
          : 0
        break
      case '[':
        if (!this.tape[this.dp]) this.ip = this.brackets.get(this.ip)
        break
      case ']':
        if (this.tape[this.dp]) this.ip = this.brackets.get(this.ip)
        break
    }

    this.ip++
    this.steps++
    if (this.ip >= this.instructions.length) this.state = 'done'
    return true
  }
}
