import { Token, Option, OptionName, StatementBase } from './proto';
import {
  Comma,
  Constant,
  Empty,
  Semi,
  Type,
} from './lexical-elements';
import { MessageBody } from './top-level-definitions';

export interface Field extends StatementBase {
  type: 'field';
  fieldLabel?: string;
  fieldType: string;
  fieldName: string;
  fieldNumber: number;
  fieldOptions?: FieldOptions;
}

export interface FieldOptions {
  type: 'field-options';
  bracketOpen: Token;
  fieldOptionOrCommas: (FieldOption | Comma)[];
  bracketClose: Token;
}

export interface FieldOption {
  type: 'field-option';
  optionName: OptionName;
  eq: Token;
  constant: Constant;
}

export interface Group extends StatementBase {
  type: 'group';
  groupLabel: string;
  keyword: string;
  groupName: Token;
  eq: Token;
  fieldNumber: number;
  fieldOptions?: FieldOptions;
  messageBody: MessageBody;
}

export interface Oneof extends StatementBase {
  type: 'oneof';
  keyword: string;
  oneofName: string;
  oneofBody: OneofBody;
}

export interface OneofBody {
  type: 'oneof-body';
  bracketOpen: Token;
  statements: OneofBodyStatement[];
  bracketClose: Token;
}

export type OneofBodyStatement =
  | Option
  | OneofField
  | OneofGroup
  | Empty;

export interface OneofField extends StatementBase {
  type: 'oneof-field';
  fieldType: Type;
  fieldName: Token;
  eq: Token;
  fieldNumber: number;
  fieldOptions?: FieldOptions;
  semi: Semi;
}

export interface OneofGroup extends StatementBase {
  type: 'oneof-group';
  keyword: string;
  groupName: Token;
  eq: Token;
  fieldNumber: number;
  messageBody: MessageBody;
}

export interface MapField extends StatementBase {
  type: 'map-field';
  keyword: string;
  typeBracketOpen: Token;
  keyType: Type;
  typeSep: Token;
  valueType: Type;
  typeBracketClose: Token;
  mapName: Token;
  eq: Token;
  fieldNumber: number;
  fieldOptions?: FieldOptions;
  semi: Semi;
}
