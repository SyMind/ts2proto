import * as ts from 'typescript'
import * as ast from '../ast'
import type { Plugin } from '..'

const PRIMITIVE_TYPE_MAPPING: Record<string, string> = {
  string: 'string',
  number: 'double',
  bigint: 'int64',
  boolean: 'bool',
}

const propertyTypeSymbols = new Set<ts.Symbol>()

let fieldNumber = 0

function isNodeExported(node: ts.Node): boolean {
  return (ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export) !== 0
}

export const classPlugin: Plugin = () => ({
  Program: {
    enter(program, state) {
      state.proto.statements.push(ast.syntax('proto3'))
    },
    exit(program, state) {
      for (const propertyTypeSymbol of propertyTypeSymbols) {
        state.strictInsertMessage = true
        state.context.visitClassDeclaration(propertyTypeSymbol)
        delete state.strictInsertMessage
      }
    }
  },
  ClassDeclaration: {
    enter(declaration, state) {
      if (state.strictInsertMessage || isNodeExported(declaration.valueDeclaration!)) {
        state.messageBody = ast.messageBody()
        state.message = ast.message(declaration.escapedName.toString(), state.messageBody)
  
        fieldNumber = 0
      }
    },
    exit(declaration, state) {
      if (state.message) {
        state.proto.statements.push(state.message)
      }
    }
  },
  ClassPrototypeProperty: {
    enter(property, state) {
      let type: string | undefined
      let name: string | undefined
      let label: string | undefined

      let propertyType = state.typeChecker.getTypeOfSymbol(property)
      let propertyTypeString = state.typeChecker.typeToString(propertyType)

      if (propertyType.flags & ts.TypeFlags.Union) {
        const { types } = propertyType as ts.UnionType
        // like `number | undefined`
        if (types.length === 2 && types.some(type => state.typeChecker.typeToString(type) === 'undefined')) {
          label = 'optional'

          propertyType = types.find(type => state.typeChecker.typeToString(type) !== 'undefined')!
          propertyTypeString = state.typeChecker.typeToString(propertyType)
        } else {
          throw new Error(`This union type is not supported: ${propertyTypeString}`)
        }
      } else if (property.flags & ts.SymbolFlags.Optional) {
        label = 'optional'
      }

      if (PRIMITIVE_TYPE_MAPPING[propertyTypeString]) {
        type = PRIMITIVE_TYPE_MAPPING[propertyTypeString]
      } else if (state.typeChecker.isArrayType(propertyType)) {
        label = 'repeated'

        const { typeArguments } = propertyType as ts.TypeReference
        if (typeArguments && typeArguments.length !== 1) {
          throw new Error(`This tuple type is not supported: ${propertyTypeString}`)
        }

        const arrayItemType = (propertyType as any).typeArguments[0]

        type = state.typeChecker.typeToString(arrayItemType)

        propertyTypeSymbols.add(arrayItemType.symbol)
      } else if (propertyType.flags & ts.TypeFlags.Object) {
        type = propertyTypeString

        propertyTypeSymbols.add(propertyType.symbol)
      } else {
        throw new Error(`This type is not supported: ${propertyTypeString}`)
      }

      name = property.escapedName.toString()

      state.field = ast.field(type, name, fieldNumber)
      state.field.fieldLabel = label

      if (state.messageBody) {
        state.messageBody.statements.push(state.field)
      }

      fieldNumber += 1
    }
  }
})
