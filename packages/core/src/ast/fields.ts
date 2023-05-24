import { Token, MalformedBase, Option, OptionName, StatementBase } from '.';
import {
  Comma,
  Constant,
  Empty,
  IntLit,
  Keyword,
  Semi,
  Type,
} from './lexical-elements';
import { MessageBody } from './top-level-definitions';

export type Node =
  | Field
  | MalformedField
  | FieldOptions
  | FieldOption
  | Group
  | Oneof
  | OneofBody
  | OneofField
  | OneofGroup
  | MapField;

export interface Field extends StatementBase {
  type: 'field';
  fieldLabel?: Keyword;
  fieldType: Type;
  fieldName: Token;
  eq: Token;
  fieldNumber: IntLit;
  fieldOptions?: FieldOptions;
  semi: Semi;
}
export type MalformedField = MalformedBase<
  Field,
  'malformed-field',
  | 'fieldLabel'
  | 'fieldType'
>;

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
  groupLabel: Keyword;
  keyword: Keyword;
  groupName: Token;
  eq: Token;
  fieldNumber: IntLit;
  fieldOptions?: FieldOptions;
  messageBody: MessageBody;
}

export interface Oneof extends StatementBase {
  type: 'oneof';
  keyword: Keyword;
  oneofName: Token;
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
  fieldNumber: IntLit;
  fieldOptions?: FieldOptions;
  semi: Semi;
}

export interface OneofGroup extends StatementBase {
  type: 'oneof-group';
  keyword: Keyword;
  groupName: Token;
  eq: Token;
  fieldNumber: IntLit;
  messageBody: MessageBody;
}

export interface MapField extends StatementBase {
  type: 'map-field';
  keyword: Keyword;
  typeBracketOpen: Token;
  keyType: Type;
  typeSep: Token;
  valueType: Type;
  typeBracketClose: Token;
  mapName: Token;
  eq: Token;
  fieldNumber: IntLit;
  fieldOptions?: FieldOptions;
  semi: Semi;
}
