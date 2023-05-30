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
  keyword: string;
  serviceName: Token;
  serviceBody: ServiceBody;
}

export interface ServiceBody {
  type: 'service-body';
  bracketOpen: Token;
  statements: ServiceBodyStatement[];
  bracketClose: Token;
}

export type ServiceBodyStatement = Option | Rpc | Empty;

export interface Rpc extends StatementBase {
  type: 'rpc';
  keyword: string;
  rpcName: Token;
  reqType: RpcType;
  returns: Token;
  resType: RpcType;
  semiOrRpcBody: Semi | RpcBody;
}

export interface RpcBody {
  type: 'rpc-body';
  bracketOpen: Token;
  statements: RpcBodyStatement[];
  bracketClose: Token;
}

export type RpcBodyStatement =
  | Option
  | Empty;

export interface RpcType {
  bracketOpen: Token;
  stream?: string;
  messageType: Type;
  bracketClose: Token;
}
