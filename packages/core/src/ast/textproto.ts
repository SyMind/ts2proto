import { Token } from './proto';

export interface Textproto {
  statements: TextprotoMessageStatement[];
}


export interface TextprotoComment extends Token {
  type: 'textproto-comment';
}

export type TextprotoMessageStatement =
  | TextprotoField
  | TextprotoSemi
  | TextprotoComma;

export interface TextprotoField {
  type: 'textproto-field';
  fieldName: TextprotoFieldName;
  colon?: Token;
  value: TextprotoListValue | TextprotoMessageValue | TextprotoScalarValue;
  semiOrComma?: TextprotoSemi | TextprotoComma;
}

export interface TextprotoSemi extends Token {
  type: 'textproto-semi';
}

export interface TextprotoComma extends Token {
  type: 'textproto-comma';
}

export interface TextprotoDot extends Token {
  type: 'textproto-dot';
}

export interface TextprotoFullIdent {
  type: 'textproto-full-ident';
  identOrDots: (TextprotoIdent | TextprotoDot)[];
}

export type TextprotoFieldName =
  | TextprotoExtensionName
  | TextprotoAnyName
  | TextprotoIdent;

export interface TextprotoExtensionName {
  type: 'textproto-extension-name';
  bracketOpen: Token;
  typeName: TextprotoFullIdent;
  bracketClose: Token;
}

export interface TextprotoAnyName {
  type: 'textproto-any-name';
  bracketOpen: Token;
  domain: TextprotoFullIdent;
  slash: Token;
  typeName: TextprotoFullIdent;
  bracketClose: Token;
}

export interface TextprotoListValue {
  type: 'textproto-list-value';
  bracketOpen: Token;
  valueOrCommas: (
    | TextprotoMessageValue
    | TextprotoScalarValue
    | TextprotoComma
  )[];
  bracketClose: Token;
}

export interface TextprotoMessageValue {
  type: 'textproto-message-value';
  bracketOpen: Token;
  statements: TextprotoMessageStatement[];
  bracketClose: Token;
}

export type TextprotoScalarValue =
  | TextprotoStrLit
  | TextprotoSignedIdent
  | TextprotoSignedFloatLit
  | TextprotoSignedOctLit
  | TextprotoSignedDecLit
  | TextprotoSignedHexLit;

export interface TextprotoStrLit {
  type: 'textproto-str-lit';
  tokens: Token[];
}

export interface TextprotoIdent extends Token {
  type: 'textproto-ident';
}

export interface TextprotoFloatLit extends Token {
  type: 'textproto-float-lit';
}

export interface TextprotoOctLit extends Token {
  type: 'textproto-oct-lit';
}

export interface TextprotoDecLit extends Token {
  type: 'textproto-dec-lit';
}

export interface TextprotoHexLit extends Token {
  type: 'textproto-hex-lit';
}

export interface TextprotoSignedIdent {
  type: 'textproto-signed-ident';
  sign?: Token;
  value: TextprotoIdent;
}

export interface TextprotoSignedFloatLit {
  type: 'textproto-signed-float-lit';
  sign?: Token;
  value: TextprotoFloatLit;
}

export interface TextprotoSignedDecLit {
  type: 'textproto-signed-dec-lit';
  sign?: Token;
  value: TextprotoDecLit;
}

export interface TextprotoSignedOctLit {
  type: 'textproto-signed-oct-lit';
  sign?: Token;
  value: TextprotoOctLit;
}

export interface TextprotoSignedHexLit {
  type: 'textproto-signed-hex-lit';
  sign?: Token;
  value: TextprotoHexLit;
}
