import { Token, StatementBase } from './proto';
import { TextprotoMessageStatement } from './textproto';

export type Comment = SinglelineComment | MultilineComment;

export interface SinglelineComment {
  type: 'singleline-comment';
  text: string;
}

export interface MultilineComment {
  type: 'multiline-comment';
  text: string;
}

export interface Type {
  type: 'type';
  identOrDots: (Ident | Dot)[];
}

export interface FullIdent {
  type: 'full-ident';
  identOrDots: (Ident | Dot)[];
}

export interface Ident extends Token {
  type: 'ident';
}

export interface Dot extends Token {
  type: 'dot';
}

export interface Comma extends Token {
  type: 'comma';
}

export interface Semi extends Token {
  type: 'semi';
}

export interface IntLit extends Token {
  type: 'int-lit';
}

export interface SignedIntLit {
  type: 'signed-int-lit';
  sign?: Token;
  value: IntLit;
}

export interface FloatLit extends Token {
  type: 'float-lit';
}

export interface SignedFloatLit {
  type: 'signed-float-lit';
  sign?: Token;
  value: FloatLit;
}

export interface BoolLit extends Token {
  type: 'bool-lit';
}

export interface StrLit {
  type: 'str-lit';
  tokens: Token[];
}

export interface Aggregate {
  type: 'aggregate';
  bracketOpen: Token;
  statements: TextprotoMessageStatement[];
  bracketClose: Token;
}

export interface Empty extends StatementBase {
  type: 'empty';
  semi: Semi;
}

export type Constant =
  | FullIdent
  | SignedIntLit
  | SignedFloatLit
  | StrLit
  | BoolLit
  | Aggregate;
