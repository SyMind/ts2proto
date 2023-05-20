import * as ts from 'typescript'
import { Writer } from './writer'

const TYPE_MAPPING: Record<string, string> = {
    'string': 'string',
    'number': 'double',
    'bigint': 'int64',
    'boolean': 'bool',
}

export function transform(rootNames: readonly string[]): string | undefined {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(rootNames, {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS
    })

    // Get the checker, we will use it to find more about classes
    const checker = program.getTypeChecker()
    let output: string | undefined

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
        if (!sourceFile.isDeclarationFile) {
            // Walk the tree to search for classes
            ts.forEachChild(sourceFile, visit)
        }
    }

    /** visit nodes finding exported classes */
    function visit(node: ts.Node) {
        // Only consider exported nodes
        if (!isNodeExported(node)) {
            return
        }

        if (ts.isClassDeclaration(node) && node.name) {
            // This is a top level class, get its symbol
            const symbol = checker.getSymbolAtLocation(node.name)
            if (symbol) {
                output = generateProto(symbol)
            }
            // No need to walk any further, class expressions/inner declarations
            // cannot be exported
        } else if (ts.isModuleDeclaration(node)) {
            // This is a namespace, visit its children
            ts.forEachChild(node, visit)
        }
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
        return (
            (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0 ||
            (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
        )
    }

    function generateProto(symbol: ts.Symbol): string {
        const writer = new Writer()
        let fieldNumber = 0

        writer.writeRaw('syntax = "proto3";')
        writer.writeNewline()
        writer.writeNewline()

        writer.writeRaw(`message ${symbol.escapedName} {`)
        writer.writeNewline()

        writer.increaseIndent()

        symbol.members!.forEach(member => {
            const optional = member.flags & ts.SymbolFlags.Optional
            if (optional) {
                writer.writeRaw('optional')
                writer.writeSpace()
            }
            const type = checker.typeToString(checker.getTypeOfSymbolAtLocation(member, member.valueDeclaration!))

            if (TYPE_MAPPING[type]) {
                writer.writeRaw(TYPE_MAPPING[type])
                writer.writeSpace()
            } else {
                throw new Error('unsupported type')
            }

            writer.writeRaw(member.escapedName.toString())
            writer.writeSpace()

            writer.writeRaw('=')
            writer.writeSpace()
            writer.writeRaw(fieldNumber.toString())
            fieldNumber += 1

            writer.writeRaw(';')

            writer.writeNewline()
        })

        writer.decreaseIndent()

        writer.writeRaw('}')

        return writer.toString()
    }

    return output
}
