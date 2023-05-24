import { Token } from '.';
import { Extensions, Reserved } from './extensions-and-reserved';
import {
  Field,
  FieldOptions,
  Group,
  MalformedField,
  MapField,
  Oneof,
} from './fields';
import { Option, StatementBase } from './index';
import {
  Empty,
  Keyword,
  Semi,
  SignedIntLit,
  Type,
} from './lexical-elements';

export type Node =
  | Enum
  | EnumBody
  | EnumField
  | Message
  | MessageBody
  | Extend
  | ExtendBody
  | Service
  | ServiceBody
  | Rpc
  | RpcBody;

export interface Enum extends StatementBase {
  type: 'enum';
  keyword: Keyword;
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
  keyword: Keyword;
  messageName: Token;
  messageBody: MessageBody;
}

export interface MessageBody {
  type: 'message-body';
  bracketOpen: Token;
  statements: MessageBodyStatement[];
  bracketClose: Token;
}

export type MessageBodyStatement =
  | Field
  | MalformedField
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
  keyword: Keyword;
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
  | MalformedField
  | Group
  | Empty;

export interface Service extends StatementBase {
  type: 'service';
  keyword: Keyword;
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
  keyword: Keyword;
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
  stream?: Keyword;
  messageType: Type;
  bracketClose: Token;
}
