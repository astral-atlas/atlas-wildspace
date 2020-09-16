// @flow strict
/*::import type { PrimitiveSchema } from './primitives';*/
/*::import type { LiteralSchema } from './literals';*/
/*::import type { BranchSchema } from './branches';*/
/*::import type { MetaSchema } from './meta';*/
/*::
type Schema =
  | LiteralSchema
  | BranchSchema
  | MetaSchema
  | PrimitiveSchema;

export type * from './primitives';
export type * from './literals';
export type * from './branches';
export type * from './meta';

export type {
  Schema
};
*/

module.exports = {
  ...require('./branches'),
  ...require('./literals'),
  ...require('./primitives'),
  ...require('./meta'),

  ...require('./utility'),

  ...require('./formats'),
};