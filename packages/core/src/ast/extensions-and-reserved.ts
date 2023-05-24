import { Token, StatementBase } from '.';
import {
  Comma,
  Keyword,
  Semi,
  SignedIntLit,
  StrLit,
} from './lexical-elements';

export type Node =
  | Extensions
  | Ranges
  | Range
  | Max
  | Reserved
  | FieldNames;

export interface Extensions extends StatementBase {
  type: 'extensions';
  keyword: Keyword;
  ranges: Ranges;
  semi: Semi;
}

export interface Ranges {
  type: 'ranges';
  rangeOrCommas: (Range | Comma)[];
}

export interface Range {
  type: 'range';
  rangeStart: SignedIntLit;
  to?: Keyword;
  rangeEnd?: SignedIntLit | Max;
}

export interface Max extends Token {
  type: 'max';
}

export interface Reserved extends StatementBase {
  type: 'reserved';
  keyword: Keyword;
  reserved: Ranges | FieldNames;
  semi: Semi;
}

export interface FieldNames {
  type: 'field-names';
  strLitOrCommas: (StrLit | Comma)[];
}
