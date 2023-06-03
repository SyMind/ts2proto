import {
  Constant,
  Empty,
  FullIdent,
  Semi,
  StrLit,
  Comment,
} from './lexical-elements';
import {
  Enum,
  EnumBodyStatement,
  Extend,
  ExtendBodyStatement,
  Message,
  MessageBodyStatement,
  Service,
  ServiceBodyStatement,
} from './top-level-definitions';

export * as extensionsAndReserved from './extensions-and-reserved';
export * as fields from './fields';
export * as lexicalElements from './lexical-elements';
export * as textproto from './textproto';
export * as topLevelDefinitions from './top-level-definitions';

export interface Token {
  text: string;
}

export interface Proto {
  statements: TopLevelStatement[];
}

export type MalformedBase<
  T extends StatementBase,
  TType extends string,
  TKeep extends keyof T,
> =
  & Pick<T, TKeep | keyof StatementBase>
  & Partial<Omit<T, TKeep | keyof StatementBase | 'type'>>
  & { type: TType };

export type Statement =
  | TopLevelStatement
  | MessageBodyStatement
  | EnumBodyStatement
  | ExtendBodyStatement
  | ServiceBodyStatement
  | Option;

export type TopLevelStatement =
  | Syntax
  | Import
  | Package
  | Option
  | TopLevelDef
  | Empty;

export type TopLevelDef = Message | Enum | Extend | Service;

export interface StatementBase {
  leadingComments: Comment[];
  trailingComments: Comment[];
}

export interface Syntax {
  type: 'syntax';
  syntax: string;
}

export interface Import extends StatementBase {
  type: 'import';
  keyword: string;
  weakOrPublic?: Token;
  strLit: StrLit;
  semi: Semi;
}

export interface Package extends StatementBase {
  type: 'package';
  keyword: string;
  fullIdent: FullIdent;
  semi: Semi;
}

export interface Option extends StatementBase {
  type: 'option';
  optionName: string;
  constant: Constant;
}

