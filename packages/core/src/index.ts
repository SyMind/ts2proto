import * as ts from 'typescript'
import * as ast from './ast'
import { CodeGenerator } from './codegen'

const PRIMITIVE_TYPE_MAPPING: Record<string, string> = {
  string: 'string',
  number: 'double',
  bigint: 'int64',
  boolean: 'bool',
}

type WIP = ast.Message
  | ast.MessageBody
  | null

class Visitor {
  proto = ast.proto()

  wip: WIP = null

  constructor(protected checker: ts.TypeChecker) {
    this.proto.statements.push(ast.syntax('proto3'))
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
        const message = this.visitClassDeclaration(symbol)
        if (message) {
          this.proto.statements.push(message)
        }
      }
      // No need to walk any further, class expressions/inner declarations
      // cannot be exported
    } else if (ts.isModuleDeclaration(node)) {
      // This is a namespace, visit its children
      ts.forEachChild(node, this.visit)
    }
  }

  visitClassDeclaration(symbol: ts.Symbol): ast.Message | null {
    const classType = this.checker.getTypeOfSymbol(symbol)
    const prototypeSymbol = this.checker.getPropertyOfType(classType, 'prototype')!
    const prototypeType = this.checker.getTypeOfSymbol(prototypeSymbol)
    
    const messageBody = ast.messageBody()
    this.checker.getPropertiesOfType(prototypeType).forEach(property => {
      const statement = this.visitClassProperty(property)
      if (statement) {
        messageBody.statements.push(statement)
      }
    })

    return ast.message(symbol.escapedName.toString(), messageBody)
  }

  visitClassProperty(symbol: ts.Symbol): ast.MessageBodyStatement | null {
    return null
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
      const message = this.visitClassDeclaration(propertyTypeSymbol)
      if (message) {
        this.proto.statements.push(message)
      }
    }
  }

  visitClassDeclaration(symbol: ts.Symbol): ast.Message | null {
    this.fieldNumber = 0
    return super.visitClassDeclaration(symbol)
  }

  visitClassProperty(symbol: ts.Symbol): ast.Field | null {
    let type: string | undefined
    let name: string | undefined
    let label: string | undefined

    let propertyType = this.checker.getTypeOfSymbol(symbol)
    let propertyTypeString = this.checker.typeToString(propertyType)

    if (propertyType.flags & ts.TypeFlags.Union) {
      const { types } = propertyType as ts.UnionType
      // like `number | undefined`
      if (types.length === 2 && types.some(type => this.checker.typeToString(type) === 'undefined')) {
        label = 'optional'

        propertyType = types.find(type => this.checker.typeToString(type) !== 'undefined')!
        propertyTypeString = this.checker.typeToString(propertyType)
      } else {
        throw new Error(`This union type is not supported: ${propertyTypeString}`)
      }
    } else if (symbol.flags & ts.SymbolFlags.Optional) {
      label = 'optional'
    }

    if (PRIMITIVE_TYPE_MAPPING[propertyTypeString]) {
      type = PRIMITIVE_TYPE_MAPPING[propertyTypeString]
    } else if (this.checker.isArrayType(propertyType)) {
      label = 'repeated'

      const { typeArguments } = propertyType as ts.TypeReference
      if (typeArguments && typeArguments.length !== 1) {
        throw new Error(`This tuple type is not supported: ${propertyTypeString}`)
      }

      const arrayItemType = (propertyType as any).typeArguments[0]

      type = this.checker.typeToString(arrayItemType)

      this.propertyTypeSymbols.add(arrayItemType.symbol)
    } else if (propertyType.flags & ts.TypeFlags.Object) {
      type = propertyTypeString

      this.propertyTypeSymbols.add(propertyType.symbol)
    } else {
      throw new Error(`This type is not supported: ${propertyTypeString}`)
    }

    name = symbol.escapedName.toString()

    const field = ast.field(type, name, this.fieldNumber)
    field.fieldLabel = label

    this.fieldNumber += 1

    return field
  }

  toString() {
    const codegen = new CodeGenerator()
    codegen.emitProto(this.proto)
    return codegen.toString()
  }
}

class JSDocVisitor extends TypeVisitor {
  visitClassProperty(symbol: ts.Symbol): ast.Field | null {
    const field = super.visitClassProperty(symbol)
    if (field) {
      const comments = symbol.getDocumentationComment(this.checker)
      for (const comment of comments) {
        if (comment.kind === 'text') {
          field.leadingComments.push(
            ast.singlelineComment(comment.text)
          )
        }
      }
    }
    return field
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

  const visitor = new JSDocVisitor(checker)
  visitor.visitProgram(program)

  return visitor.toString()
}
