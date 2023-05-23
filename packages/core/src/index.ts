import * as ts from 'typescript'
import { Writer } from './writer'

const PRIMITIVE_TYPE_MAPPING: Record<string, string> = {
  string: 'string',
  number: 'double',
  bigint: 'int64',
  boolean: 'bool',
}

class Visitor {
  constructor(protected checker: ts.TypeChecker, protected writer: Writer) {
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

  visitClassDeclaration(symbol: ts.Symbol): void {
    const classType = this.checker.getTypeOfSymbol(symbol)
    const prototypeSymbol = this.checker.getPropertyOfType(classType, 'prototype')!
    const prototypeType = this.checker.getTypeOfSymbol(prototypeSymbol)
    
    this.checker.getPropertiesOfType(prototypeType).forEach(property => this.visitClassProperty(property))
  }

  visitClassProperty(symbol: ts.Symbol): void {
  }

  private isNodeExported(node: ts.Node): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
  }
}

class TypeVisitor extends Visitor {
  private propertyTypeSymbols = new Set<ts.Symbol>()

  private fieldNumber = 0

  visitProgram(program: ts.Program): void {
    super.visitProgram(program)

    for (const propertyTypeSymbol of this.propertyTypeSymbols) {
      this.visitClassDeclaration(propertyTypeSymbol)
    }
  }

  visitClassDeclaration(symbol: ts.Symbol): void {
    this.writer.writeNewline()

    this.fieldNumber = 0

    this.writer.writeRaw(`message ${symbol.escapedName} {`)
    this.writer.writeNewline()
    this.writer.increaseIndent()

    super.visitClassDeclaration(symbol)

    this.writer.decreaseIndent()
    this.writer.writeRaw('}')
    this.writer.writeNewline()
  }

  visitClassProperty(symbol: ts.Symbol): void {
    let propertyType = this.checker.getTypeOfSymbol(symbol)
    let propertyTypeString = this.checker.typeToString(propertyType)

    if (propertyType.flags & ts.TypeFlags.Union) {
      const { types } = propertyType as ts.UnionType
      // like `number | undefined`
      if (types.length === 2 && types.some(type => this.checker.typeToString(type) === 'undefined')) {
        this.writer.writeRaw('optional')
        this.writer.writeSpace()

        propertyType = types.find(type => this.checker.typeToString(type) !== 'undefined')!
        propertyTypeString = this.checker.typeToString(propertyType)
      } else {
        throw new Error(`This union type is not supported: ${propertyTypeString}`)
      }
    } else if (symbol.flags & ts.SymbolFlags.Optional) {
      this.writer.writeRaw('optional')
      this.writer.writeSpace()
    }

    if (PRIMITIVE_TYPE_MAPPING[propertyTypeString]) {
      this.writer.writeRaw(PRIMITIVE_TYPE_MAPPING[propertyTypeString])
      this.writer.writeSpace()
    } else if (this.checker.isArrayType(propertyType)) {
      this.writer.writeRaw('repeated')
      this.writer.writeSpace()

      const { typeArguments } = propertyType as ts.TypeReference
      if (typeArguments && typeArguments.length !== 1) {
        throw new Error(`This tuple type is not supported: ${propertyTypeString}`)
      }

      const arrayItemType = (propertyType as any).typeArguments[0]

      this.writer.writeRaw(this.checker.typeToString(arrayItemType))
      this.writer.writeSpace()

      this.propertyTypeSymbols.add(arrayItemType.symbol)
    } else if (propertyType.flags & ts.TypeFlags.Object) {
      this.writer.writeRaw(propertyTypeString)
      this.writer.writeSpace()

      this.propertyTypeSymbols.add(propertyType.symbol)
    } else {
      throw new Error(`This type is not supported: ${propertyTypeString}`)
    }

    this.writer.writeRaw(symbol.escapedName.toString())
    this.writer.writeSpace()

    this.writer.writeRaw('=')
    this.writer.writeSpace()
    this.writer.writeRaw(this.fieldNumber.toString())
    this.fieldNumber += 1

    this.writer.writeRaw(';')
    this.writer.writeNewline()

    super.visitClassProperty(symbol)
  }
}

class JSDocVisitor extends TypeVisitor {
  visitClassProperty(symbol: ts.Symbol): void {
    const comments = symbol.getDocumentationComment(this.checker)
    for (const comment of comments) {
      if (comment.kind === 'text') {
        this.writer.writeRaw('//')
        this.writer.writeSpace()
        this.writer.writeRaw(comment.text)
        this.writer.writeNewline()
      }
    }
    super.visitClassProperty(symbol)
  }
}

export function transform(rootNames: readonly string[]): string | undefined {
  // Build a program using the set of root file names in fileNames
  const program = ts.createProgram(rootNames, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
    strict: true
  })

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker()
  const writer = new Writer()

  writer.writeRaw('syntax = "proto3";')
  writer.writeNewline()

  const visitor = new JSDocVisitor(checker, writer)
  visitor.visitProgram(program)

  return writer.toString()
}
