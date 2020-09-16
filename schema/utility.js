// @flow strict
/*:: import type { Schema } from './main'; */
const { idSchema, nameSchema } = require("./meta");

const defineSchema = (
  id/*: string*/,
  description/*: string*/,
  definedSchema/*: Schema*/,
) => (
  idSchema(id, nameSchema('', description, definedSchema))
);

module.exports = {
  defineSchema,
  define: defineSchema,
};