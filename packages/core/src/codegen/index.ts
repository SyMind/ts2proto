import * as ast from '../ast'
import { Writer } from '../writer'

export class CodeGenerator {
  writer = new Writer()

  emitProto(node: ast.Proto): void {
    for (const statement of node.statements) {
      this.emitTopLevelStatement(statement)
    }
  }

  emitTopLevelStatement(node: ast.TopLevelStatement): void {
    switch (node.type) {
      case 'syntax':
        return this.emitSyntax(node)
      case 'import':
        return this.emitImport(node)
      case 'package':
        return this.emitPackage(node)
      case 'option':
        return this.emitOption(node)
      case 'message':
      case 'enum':
      case 'extend':
      case 'service':
        return this.emitTopLevelDef(node)
      case 'empty':
        return this.emitEmpty(node)
    }
  }

  emitSyntax(node: ast.Syntax): void {
    this.writer.writeRaw(`syntax = '${node.syntax}'`)
    this.writer.writeNewline()
  }

  emitImport(node: ast.Import): void {

  }

  emitPackage(node: ast.Package): void {

  }

  emitOption(node: ast.Option): void {
    
  }

  emitTopLevelDef(node: ast.TopLevelDef): void {
    switch (node.type) {
      case 'message':
        return this.emitMessage(node)
      case 'enum':
        return this.emitEnum(node)
      case 'extend':
        return this.emitExtend(node)
      case 'service':
        return this.emitService(node)
    }
  }

  emitEmpty(node: ast.Empty): void {

  }

  emitMessage(node: ast.Message): void {

  }

  emitEnum(node: ast.Enum): void {

  }

  emitExtend(node: ast.Extend): void {

  }

  emitService(node: ast.Service): void {

  }
}
