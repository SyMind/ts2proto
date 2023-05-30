import { Token, StatementBase } from './proto';
import {
  Comma,
  Semi,
  SignedIntLit,
  StrLit,
} from './lexical-elements';

export interface Extensions extends StatementBase {
  type: 'extensions';
  keyword: string;
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
  to?: string;
  rangeEnd?: SignedIntLit | Max;
}

export interface Max extends Token {
  type: 'max';
}

export interface Reserved extends StatementBase {
  type: 'reserved';
  keyword: string;
  reserved: Ranges | FieldNames;
  semi: Semi;
}

export interface FieldNames {
  type: 'field-names';
  strLitOrCommas: (StrLit | Comma)[];
}
