import { TopLevelStatement, Proto, Syntax, Option } from './proto'
import {
  Message,
  MessageBody,
  MessageBodyStatement,
  Service,
  ServiceBody,
  ServiceBodyStatement,
  Rpc,
  RpcBody,
} from './top-level-definitions';
import { Field } from './fields';
import { SinglelineComment, Constant, StrLit } from './lexical-elements';

export * from './proto';
export * from './extensions-and-reserved';
export * from './fields';
export * from './lexical-elements';
export * from './textproto';
export * from './top-level-definitions';

export function proto(statements: TopLevelStatement[] = []): Proto {
  return {
    statements
  }
}

export function message(name: string, messageBody: MessageBody): Message {
  return {
    type: 'message',
    messageName: name,
    messageBody,
    leadingComments: [],
    trailingComments: [],
  }
}

export function messageBody(statements: MessageBodyStatement[] = []): MessageBody {
  return {
    type: 'message-body',
    statements
  }
}

export function singlelineComment(text: string): SinglelineComment {
  return {
    type: 'singleline-comment',
    text
  }
}

export function field(type: string, name: string, number: number): Field {
  return {
    type: 'field',
    fieldType: type,
    fieldName: name,
    fieldNumber: number,
    leadingComments: [],
    trailingComments: [],
  }
}

export function syntax(syntax: string): Syntax {
  return {
    type: 'syntax',
    syntax,
  }
}

export function service(serviceName: string, serviceBody: ServiceBody): Service {
  return {
    type: 'service',
    serviceName,
    serviceBody,
    leadingComments: [],
    trailingComments: [],
  }
}

export function serviceBody(statements: ServiceBodyStatement[] = []): ServiceBody {
  return {
    type: 'service-body',
    statements
  }
}

export function rpc(rpcName: string, reqType: string, resType: string, rpcBody?: RpcBody): Rpc {
  return {
    type: 'rpc',
    rpcName,
    reqType,
    resType,
    rpcBody,
    leadingComments: [],
    trailingComments: [],
  }
}

export function rpcBody(statements: Option[] = []): RpcBody {
  return {
    type: 'rpc-body',
    statements,
  }
}

export function option(optionName: string, constant: Constant): Option {
  return {
    type: 'option',
    optionName,
    constant,
    leadingComments: [],
    trailingComments: [],
  }
}

export function strLit(text: string): StrLit {
  return {
    type: 'str-lit',
    text,
  }
}
