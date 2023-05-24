import {
  CommentGroup,
  Constant,
  Dot,
  Empty,
  FullIdent,
  Keyword,
  Semi,
  StrLit,
} from './lexical-elements';
import {
  Enum,
  EnumBodyStatement,
  Extend,
  ExtendBodyStatement,
  Message,
  MessageBodyStatement,
  RpcBodyStatement,
  Service,
  ServiceBodyStatement,
} from './top-level-definitions';

import * as extensionsAndReserved from './extensions-and-reserved';
import * as fields from './fields';
import * as lexicalElements from './lexical-elements';
import * as textproto from './textproto';
import * as topLevelDefinitions from './top-level-definitions';

export * from './extensions-and-reserved';
export * from './fields';
export * from './lexical-elements';
export * from './textproto';
export * from './top-level-definitions';

export interface Token {
  text: string;
}

export interface Proto {
  statements: TopLevelStatement[];
}

export type Node =
  | index_Node
  | extensionsAndReserved.Node
  | fields.Node
  | lexicalElements.Node
  | textproto.Node
  | topLevelDefinitions.Node;

type index_Node =
  | Syntax
  | Import
  | Package
  | Option
  | OptionName
  | OptionNameSegment;

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
  | RpcBodyStatement;

export type TopLevelStatement =
  | Syntax
  | Import
  | Package
  | Option
  | TopLevelDef
  | Empty;

export type TopLevelDef = Message | Enum | Extend | Service;

export interface StatementBase {
  leadingComments: CommentGroup[];
  trailingComments: CommentGroup[];
  leadingDetachedComments: CommentGroup[];
}

export interface Syntax extends StatementBase {
  type: 'syntax';
  keyword: Keyword;
  eq: Token;
  quoteOpen: Token;
  syntax: Token;
  quoteClose: Token;
  semi: Semi;
}

export interface Import extends StatementBase {
  type: 'import';
  keyword: Keyword;
  weakOrPublic?: Token;
  strLit: StrLit;
  semi: Semi;
}

export interface Package extends StatementBase {
  type: 'package';
  keyword: Keyword;
  fullIdent: FullIdent;
  semi: Semi;
}

export interface Option extends StatementBase {
  type: 'option';
  keyword: Keyword;
  optionName: OptionName;
  eq: Token;
  constant: Constant;
  semi: Semi;
}

export interface OptionName {
  type: 'option-name';
  optionNameSegmentOrDots: (OptionNameSegment | Dot)[];
}

export interface OptionNameSegment {
  type: 'option-name-segment';
  bracketOpen?: Token;
  name: FullIdent;
  bracketClose?: Token;
}
