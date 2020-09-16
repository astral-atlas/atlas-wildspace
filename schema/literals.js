// @flow strict
/*:: import type { Schema } from './main'; */

/*:: type StringLiteralSchema = { type: 'string-literal', literalValue: string }; */
const stringLiteralSchema = (literalValue/*: string*/)/*: StringLiteralSchema*/ => ({
  type: 'string-literal',
  literalValue,
});
/*:: type NumberLiteralSchema = { type: 'number-literal', literalValue: number }; */
const numberLiteralSchema = (literalValue/*: number*/)/*: NumberLiteralSchema*/ => ({
  type: 'number-literal',
  literalValue,
});
/*:: type BooleanLiteralSchema = { type: 'boolean-literal', literalValue: boolean }; */
const booleanLiteralSchema = (literalValue/*: boolean*/)/*: BooleanLiteralSchema*/ => ({
  type: 'boolean-literal',
  literalValue,
});

/*:: type TupleSchema = { type: 'tuple', tupleSchemas: Schema[] }; */
const tupleSchema = (tupleSchemas/*: Schema[]*/)/*: TupleSchema*/ => ({
  type: 'tuple',
  tupleSchemas,
});

const literalSchema = (literalValue/*: boolean | number | string*/) => {
  switch (typeof literalValue) {
    default:
      throw new Error(`Only support boolean, number, string as literal, you passed: "${typeof literalValue}"`);
    case 'number':
      return numberLiteralSchema(literalValue);
    case 'string':
      return stringLiteralSchema(literalValue);
    case 'boolean':
      return booleanLiteralSchema(literalValue);
  }
}

/*::
type LiteralSchema =
  | StringLiteralSchema
  | NumberLiteralSchema
  | BooleanLiteralSchema
  | TupleSchema
*/

/*::
export type {
  LiteralSchema,
  StringLiteralSchema,
  NumberLiteralSchema,
  BooleanLiteralSchema,
  TupleSchema,
};
*/

module.exports = {
  stringLiteralSchema,
  numberLiteralSchema,
  booleanLiteralSchema,
  tupleSchema,
  literalSchema,

  literal: literalSchema,
  tuple: tupleSchema,
};