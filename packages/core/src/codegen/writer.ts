export class Writer {
  indentLevel: number = 0
  lineStart: boolean = true

  buffer: string[] = []

  private writeIndent(): void {
    for (let i = 0; i < this.indentLevel; i++) {
      this.buffer.push('  ')
    }
  }

  writeSpace(): void {
    this.buffer.push(' ')
  }

  writeNewline(): void {
    this.lineStart = true
    this.buffer.push('\n')
  }

  writeRaw(text: string): void {
    if (this.lineStart) {
      this.writeIndent()
      this.lineStart = false
    }

    this.buffer.push(text)
  }

  increaseIndent(): void {
    this.indentLevel += 1
  }

  decreaseIndent(): void {
    this.indentLevel -= 1
  }

  toString(): string {
    return this.buffer.join('')
  }
}
