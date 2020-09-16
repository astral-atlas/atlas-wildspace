// @flow strict
/*::import type { Schema } from './main';*/

/*:: type ObjectSchema = { type: 'object', propertySchemas: [string, Schema][] }; */
const objectSchema = (propertySchemas/*: [string, Schema][]*/) => ({
  type: 'object',
  propertySchemas,
});
/*:: type ArraySchema = { type: 'array', elementSchema: Schema }; */
const arraySchema = (elementSchema/*: Schema*/)/*: ArraySchema*/ => ({
  type: 'array',
  elementSchema,
});

/*:: type StringSchema = { type: 'string' }; */
const stringSchema = ()/*: StringSchema*/ => ({
  type: 'string',
});
/*:: type NumberSchema = { type: 'number' }; */
const numberSchema = ()/*: NumberSchema*/ => ({
  type: 'number',
});
/*:: type BooleanSchema = { type: 'boolean' }; */
const booleanSchema = ()/*: BooleanSchema*/ => ({
  type: 'boolean',
});

/*:: type NullSchema = { type: 'null' }; */
const nullSchema = ()/*: NullSchema*/ => ({
  type: 'null',
});

/*::
type PrimitiveSchema =
  | ObjectSchema
  | ArraySchema
  | StringSchema
  | NumberSchema
  | BooleanSchema
  | NullSchema
*/

/*::
export type {
  PrimitiveSchema,
  ObjectSchema,
  ArraySchema,
  StringSchema,
  NumberSchema,
  BooleanSchema,
  NullSchema,
};
*/

module.exports = {
  objectSchema,
  arraySchema,
  stringSchema,
  numberSchema,
  booleanSchema,
  nullSchema,

  string: stringSchema,
  number: numberSchema,
  boolean: booleanSchema,
  array: arraySchema,
  object: objectSchema,
  _null: nullSchema,
};
