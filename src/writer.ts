export class Writer {
    indentLevel: number = 0
    lineStart: boolean = true

    data: string = ''

    private writeIndent(): void {
        for(let i = 0; i < this.indentLevel; i++) {
            this.data += '  '
        }
    }

    writeSpace(): void {
        this.data += ' '
    }

    writeNewline(): void {
        this.lineStart = true
        this.data += '\n'
    }

    writeRaw(text: string): void {
        if (this.lineStart) {
            this.writeIndent()
            this.lineStart = false
        }

        this.data += text
    }

    increaseIndent(): void {
        this.indentLevel += 1
    }

    decreaseIndent(): void {
        this.indentLevel -= 1
    }

    toString(): string {
        return this.data
    }
}
