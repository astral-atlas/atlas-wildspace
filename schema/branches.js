// @flow strict
/*::import type { Schema } from './main';*/

/*:: type UnionSchema = { type: 'union', options: Schema[] }; */
const unionSchema = (options/*: Schema[]*/)/*: UnionSchema*/ => ({
  type: 'union',
  options,
});

/*:: type OptionalSchema = { type: 'optional', option: Schema }; */
const optionalSchema = (option/*: Schema*/)/*: OptionalSchema*/ => ({
  type: 'optional',
  option,
});

/*::
type BranchSchema =
  | UnionSchema
  | OptionalSchema
*/

/*::
export type {
  BranchSchema,
  OptionalSchema,
  UnionSchema,
};
*/

module.exports = {
  unionSchema,
  optionalSchema,

  union: unionSchema,
  optional: optionalSchema,
};