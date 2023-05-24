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
    this.writer.writeRaw(`message ${node.keyword.text} {`)
    this.writer.writeNewline()
    this.writer.increaseIndent()

    this.emitMessageBody(node.messageBody)

    this.writer.decreaseIndent()
    this.writer.writeRaw('}')
    this.writer.writeNewline()
    this.writer.writeNewline()
  }

  emitMessageBody(node: ast.MessageBody): void {
    for (const statement of node.statements) {
      this.emitMessageBodyStatement(statement)
    }
  }

  emitMessageBodyStatement(node: ast.MessageBodyStatement): void {
    switch (node.type) {
      case 'field':
        return this.emitField(node)
      case 'malformed-field':
        return this.emitMalformedField(node)
      case 'enum':
        return this.emitEnum(node)
      case 'message':
        return this.emitMessage(node)
      case 'extend':
        return this.emitExtend(node)
      case 'extensions':
        return this.emitExtensions(node)
      case 'group':
        return this.emitGroup(node)
      case 'option':
        return this.emitOption(node)
      case 'oneof':
        return this.emitOneof(node)
      case 'map-field':
        return this.emitMapField(node)
      case 'reserved':
        return this.emitReserved(node)
      case 'empty':
        return this.emitEmpty(node)
    }
  }

  emitEnum(node: ast.Enum): void {

  }

  emitExtend(node: ast.Extend): void {

  }

  emitService(node: ast.Service): void {

  }

  emitField(node: ast.Field): void {

  }

  emitMalformedField(node: ast.MalformedField): void {

  }

  emitExtensions(node: ast.Extensions): void {

  }

  emitGroup(node: ast.Group): void {

  }

  emitOneof(node: ast.Oneof): void {

  }

  emitMapField(node: ast.MapField): void {

  }

  emitReserved(node: ast.Reserved): void {

  }
}
