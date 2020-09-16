// @flow strict
/*:: import type { Schema } from './main'; */

/*:: type NameSchema = { type: 'name', name: string, description: string, namedSchema: Schema };*/
const nameSchema = (name/*: string*/, description/*: string*/, namedSchema/*: Schema*/)/*: NameSchema*/ => ({
  type: 'name',
  name,
  description,
  namedSchema,
});
/*:: type IdSchema = { type: 'id', id: string, identifiedSchema: Schema };*/
const idSchema = (id/*: string*/, identifiedSchema/*: Schema*/)/*: IdSchema*/ => ({
  type: 'id',
  id,
  identifiedSchema,
});

/*::
type MetaSchema =
  | NameSchema
  | IdSchema

export type {
  MetaSchema,
  NameSchema,
  IdSchema
};
*/

module.exports = {
  nameSchema,
  idSchema,
};
