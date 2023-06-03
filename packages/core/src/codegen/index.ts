import * as ast from '../ast'
import { Writer } from './writer'

export class CodeGenerator {
  writer = new Writer()

  toString(): string {
    return this.writer.toString()
  }

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
    this.writer.writeRaw('syntax = "')
    this.writer.writeRaw(node.syntax)
    this.writer.writeRaw('";')
    this.writer.writeNewline()
  }

  emitImport(node: ast.Import): void {

  }

  emitPackage(node: ast.Package): void {

  }

  emitOption(node: ast.Option): void {
    this.writer.writeRaw('option')
    this.writer.writeSpace()

    this.writer.writeRaw('(')
    this.writer.writeRaw(node.optionName)
    this.writer.writeRaw(')')

    this.writer.writeSpace()
    this.writer.writeRaw('=')
    this.writer.writeSpace()

    this.emitConstant(node.constant)

    this.writer.writeRaw(';')
  }

  emitConstant(node: ast.Constant) {
    switch(node.type) {
      case 'str-lit':
        this.emitStrLit(node)
        break
    }
  }

  emitStrLit(node: ast.StrLit) {
    this.writer.writeRaw('"')
    this.writer.writeRaw(node.text)
    this.writer.writeRaw('"')
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
    this.writer.writeNewline()
    this.writer.writeRaw('message')
    this.writer.writeSpace()
    this.writer.writeRaw(node.messageName)
    this.writer.writeSpace()

    this.emitMessageBody(node.messageBody)
  }

  emitMessageBody(node: ast.MessageBody): void {
    this.writer.writeRaw('{')
    this.writer.writeNewline()
    this.writer.increaseIndent()

    for (const statement of node.statements) {
      this.emitMessageBodyStatement(statement)
    }

    this.writer.decreaseIndent()
    this.writer.writeRaw('}')
    this.writer.writeNewline()
  }

  emitMessageBodyStatement(node: ast.MessageBodyStatement): void {
    this.emitComments(node.leadingComments)

    switch (node.type) {
      case 'field':
        this.emitField(node)
        break
      case 'enum':
        this.emitEnum(node)
        break
      case 'message':
        this.emitMessage(node)
        break
      case 'extend':
        this.emitExtend(node)
        break
      case 'extensions':
        this.emitExtensions(node)
        break
      case 'group':
        this.emitGroup(node)
        break
      case 'option':
        this.emitOption(node)
        break
      case 'oneof':
        this.emitOneof(node)
        break
      case 'map-field':
        this.emitMapField(node)
        break
      case 'reserved':
        this.emitReserved(node)
        break
      case 'empty':
        this.emitEmpty(node)
        break
    }
  }

  emitComments(comments: ast.Comment[]): void {
    for (const comment of comments) {
      switch(comment.type) {
        case 'singleline-comment':
          this.emitSinglelineComment(comment)
          break
        case 'multiline-comment':
          this.emitMultilineComment(comment)
          break
      }
    }
  }

  emitSinglelineComment(comment: ast.SinglelineComment): void {
    this.writer.writeRaw('//')
    this.writer.writeSpace()
    this.writer.writeRaw(comment.text)
    this.writer.writeNewline()
  }

  emitMultilineComment(comment: ast.MultilineComment): void {

  }

  emitEnum(node: ast.Enum): void {

  }

  emitExtend(node: ast.Extend): void {

  }

  emitService(node: ast.Service): void {
    this.writer.writeNewline()

    this.writer.writeRaw('service')
    this.writer.writeSpace()
    this.writer.writeRaw(node.serviceName)

    this.writer.writeSpace()
    this.emitServiceBody(node.serviceBody)
  }

  emitServiceBody(node: ast.ServiceBody): void {
    this.writer.writeRaw('{')
    this.writer.writeNewline()
    this.writer.increaseIndent()

    for (const statement of node.statements) {
      this.emitServiceBodyStatement(statement)
      this.writer.writeNewline()
    }

    this.writer.decreaseIndent()
    this.writer.writeRaw('}')
    this.writer.writeNewline()
  }

  emitServiceBodyStatement(node: ast.ServiceBodyStatement): void {
    switch(node.type) {
      case 'rpc':
        this.emitRpc(node)
        break
    }
  }

  emitRpc(node: ast.Rpc): void {
    this.writer.writeRaw('rpc')
    this.writer.writeSpace()

    this.writer.writeRaw(node.rpcName)

    this.writer.writeRaw('(')
    this.writer.writeRaw(node.reqType)
    this.writer.writeRaw(')')

    this.writer.writeSpace()
    this.writer.writeRaw('returns')
    this.writer.writeSpace()
  
    this.writer.writeRaw('(')
    this.writer.writeRaw(node.resType)
    this.writer.writeRaw(')')

    if (node.rpcBody) {
      this.writer.writeSpace()
      this.emitRpcBody(node.rpcBody)
    } else {
      this.writer.writeRaw(';')
    }
  }

  emitRpcBody(node: ast.RpcBody): void {
    this.writer.writeRaw('{')
    this.writer.increaseIndent()
    this.writer.writeNewline()

    for (const statement of node.statements) {
      this.emitOption(statement)
      this.writer.writeNewline()
    }

    this.writer.decreaseIndent()
    this.writer.writeRaw('}')
  }

  emitField(node: ast.Field): void {
    if (node.fieldLabel) {
      this.writer.writeRaw(node.fieldLabel)
      this.writer.writeSpace()
    }

    this.writer.writeRaw(node.fieldType)
    this.writer.writeSpace()

    this.writer.writeRaw(node.fieldName)
    this.writer.writeSpace()

    this.writer.writeRaw('=')
    this.writer.writeSpace()

    this.writer.writeRaw(node.fieldNumber.toString())
    this.writer.writeRaw(';')

    this.writer.writeNewline()
  }

  emitExtensions(node: ast.Extensions): void {

  }

  emitGroup(node: ast.Group): void {

  }

  emitOneof(node: ast.Oneof): void {
    this.writer.writeRaw('oneof')
    this.writer.writeSpace()

    this.writer.writeRaw(node.oneofName)
    this.writer.writeSpace()

    this.emitOneofBody(node.oneofBody)
  }

  emitMapField(node: ast.MapField): void {

  }

  emitReserved(node: ast.Reserved): void {

  }

  emitType(node: ast.Type): void {
    for (const identOrDot of node.identOrDots) {
      this.writer.writeRaw(identOrDot.text)
    }
  }

  emitOneofBody(node: ast.OneofBody): void {
  }
}
