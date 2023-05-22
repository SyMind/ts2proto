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
        return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
    }

    function generateProto(symbol: ts.Symbol): string {
        const writer = new Writer()

        writer.writeRaw('syntax = "proto3";')
        writer.writeNewline()
        writer.writeNewline()

        generateProtoMessage(symbol)

        function generateProtoMessage(symbol: ts.Symbol) {
            let fieldNumber = 0

            const propertyTypeSymbols = new Set<ts.Symbol>()

            writer.writeRaw(`message ${symbol.escapedName} {`)
            writer.writeNewline()
    
            writer.increaseIndent()
    
            const classType = checker.getTypeOfSymbol(symbol)
            const prototypeSymbol = checker.getPropertyOfType(classType, 'prototype')!
            const prototypeType = checker.getTypeOfSymbol(prototypeSymbol)
    
            checker.getPropertiesOfType(prototypeType).forEach(property => {
                const optional = property.flags & ts.SymbolFlags.Optional
                if (optional) {
                    writer.writeRaw('optional')
                    writer.writeSpace()
                }
    
                const propertyType = checker.getTypeOfSymbol(property)
                const propertyTypeString = checker.typeToString(propertyType)
    
                if (TYPE_MAPPING[propertyTypeString]) {
                    writer.writeRaw(TYPE_MAPPING[propertyTypeString])
                    writer.writeSpace()
                } else if (checker.isArrayType(propertyType)) {
                    writer.writeRaw('repeated')
                    writer.writeSpace()

                    if ((propertyType as any).typeArguments.length !== 1) {
                        throw new Error('unsupported type')
                    }

                    const arrayItemType = (propertyType as any).typeArguments[0]

                    writer.writeRaw(checker.typeToString(arrayItemType))
                    writer.writeSpace()

                    propertyTypeSymbols.add(arrayItemType.symbol)
                } else if (propertyType.flags & ts.TypeFlags.Object) {
                    writer.writeRaw(propertyTypeString)
                    writer.writeSpace()

                    propertyTypeSymbols.add(propertyType.symbol)
                } else {
                    throw new Error('unsupported type')
                }
    
                writer.writeRaw(property.escapedName.toString())
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

            for (const propertyTypeSymbol of propertyTypeSymbols) {
                writer.writeNewline()
                writer.writeNewline()
                generateProtoMessage(propertyTypeSymbol)
            }
        }

        return writer.toString()
    }

    return output
}
