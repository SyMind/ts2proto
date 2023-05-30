import { TopLevelStatement, Proto, Syntax } from './proto'
import { Message, MessageBodyStatement } from './top-level-definitions';
import { Field } from './fields';
import { SinglelineComment } from './lexical-elements';

export * from './proto';
export * from './extensions-and-reserved';
export * from './fields';
export * from './lexical-elements';
export * from './textproto';
export * from './top-level-definitions';

export function proto(statements: TopLevelStatement[]): Proto {
  return {
    statements
  }
}

export function message(name: string, statements: MessageBodyStatement[] = []): Message {
  return {
    type: 'message',
    messageName: name,
    messageBody: {
      type: 'message-body',
      statements
    },
    leadingComments: [],
    trailingComments: [],
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
