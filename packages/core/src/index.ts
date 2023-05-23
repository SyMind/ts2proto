import * as ts from 'typescript'
import { Writer } from './writer'

const TYPE_MAPPING: Record<string, string> = {
  string: 'string',
  number: 'double',
  bigint: 'int64',
  boolean: 'bool',
}

abstract class Visitor {
  constructor(protected checker: ts.TypeChecker, protected writer: Writer) {
  }

  protected isNodeExported(node: ts.Node): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
  }

  visitProgram(program: ts.Program): void {
    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, node => this.visit(node))
      }
    }
  }

  visit(node: ts.Node): void {
    // Only consider exported nodes
    if (!this.isNodeExported(node)) {
      return
    }

    if (ts.isClassDeclaration(node) && node.name) {
      // This is a top level class, get its symbol
      const symbol = this.checker.getSymbolAtLocation(node.name)
      if (symbol) {
        this.visitClassDeclaration(symbol)
      }
      // No need to walk any further, class expressions/inner declarations
      // cannot be exported
    } else if (ts.isModuleDeclaration(node)) {
      // This is a namespace, visit its children
      ts.forEachChild(node, this.visit)
    }
  }

  abstract visitClassDeclaration(symbol: ts.Symbol): void
}

class TypeVisitor extends Visitor {
  private propertyTypeSymbols = new Set<ts.Symbol>()

  visitProgram(program: ts.Program): void {
    super.visitProgram(program)

    for (const propertyTypeSymbol of this.propertyTypeSymbols) {
      this.generateProtoMessage(propertyTypeSymbol)
    }
  }

  visitClassDeclaration(symbol: ts.Symbol): void {
    this.generateProtoMessage(symbol)
  }

  private generateProtoMessage(symbol: ts.Symbol): void {
    const { checker, writer} = this

    writer.writeNewline()

    let fieldNumber = 0

    writer.writeRaw(`message ${symbol.escapedName} {`)
    writer.writeNewline()

    writer.increaseIndent()

    const classType = checker.getTypeOfSymbol(symbol)
    const prototypeSymbol = checker.getPropertyOfType(classType, 'prototype')!
    const prototypeType = checker.getTypeOfSymbol(prototypeSymbol)

    checker.getPropertiesOfType(prototypeType).forEach((property) => {
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

        this.propertyTypeSymbols.add(arrayItemType.symbol)
      } else if (propertyType.flags & ts.TypeFlags.Object) {
        writer.writeRaw(propertyTypeString)
        writer.writeSpace()

        this.propertyTypeSymbols.add(propertyType.symbol)
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
    writer.writeNewline()
  }
}

export function transform(rootNames: readonly string[]): string | undefined {
  // Build a program using the set of root file names in fileNames
  const program = ts.createProgram(rootNames, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  })

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker()
  const writer = new Writer()

  writer.writeRaw('syntax = "proto3";')
  writer.writeNewline()

  const typeVisitor = new TypeVisitor(checker, writer)
  typeVisitor.visitProgram(program)

  return writer.toString()
}
