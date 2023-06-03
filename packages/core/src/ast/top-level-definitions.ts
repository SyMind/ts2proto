import { Token, Option, StatementBase } from './proto';
import { Extensions, Reserved } from './extensions-and-reserved';
import {
  Field,
  FieldOptions,
  Group,
  MapField,
  Oneof,
} from './fields';
import {
  Empty,
  Semi,
  SignedIntLit,
  Type,
} from './lexical-elements';

export interface Enum extends StatementBase {
  type: 'enum';
  keyword: string;
  enumName: Token;
  enumBody: EnumBody;
}

export interface EnumBody {
  type: 'enum-body';
  bracketOpen: Token;
  statements: EnumBodyStatement[];
  bracketClose: Token;
}

export type EnumBodyStatement =
  | Option
  | Reserved
  | EnumField
  | Empty;

export interface EnumField extends StatementBase {
  type: 'enum-field';
  fieldName: Token;
  eq: Token;
  fieldNumber: SignedIntLit;
  fieldOptions?: FieldOptions;
  semi: Semi;
}

export interface Message extends StatementBase {
  type: 'message';
  messageName: string;
  messageBody: MessageBody;
}

export interface MessageBody {
  type: 'message-body';
  statements: MessageBodyStatement[];
}

export type MessageBodyStatement =
  | Field
  | Enum
  | Message
  | Extend
  | Extensions
  | Group
  | Option
  | Oneof
  | MapField
  | Reserved
  | Empty;

export interface Extend extends StatementBase {
  type: 'extend';
  keyword: string;
  messageType: Type;
  extendBody: ExtendBody;
}

export interface ExtendBody {
  type: 'extend-body';
  bracketOpen: Token;
  statements: ExtendBodyStatement[];
  bracketClose: Token;
}

export type ExtendBodyStatement =
  | Field
  | Group
  | Empty;

export interface Service extends StatementBase {
  type: 'service';
  serviceName: string;
  serviceBody: ServiceBody;
}

export interface ServiceBody {
  type: 'service-body';
  statements: ServiceBodyStatement[];
}

export type ServiceBodyStatement = Option | Rpc | Empty;

export interface Rpc extends StatementBase {
  type: 'rpc';
  rpcName: string;
  reqType: string;
  resType: string;
  rpcBody?: RpcBody;
}

export interface RpcBody {
  type: 'rpc-body';
  statements: Option[];
}

export interface RpcType {
  bracketOpen: Token;
  stream?: string;
  messageType: Type;
  bracketClose: Token;
}
