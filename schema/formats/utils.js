// @flow strict
/*:: import type { Schema } from '../main'; */

const flattenSchema = (schema/*: Schema*/, depth/*: number*/ = -1)/*: Schema[]*/ => {
  if (depth == 0)
    return [];
  switch (schema.type) {
    case 'object':
      return [
          schema,
          ...schema.propertySchemas
            .map(([property, schema]) => flattenSchema(schema, depth - 1))
            .flat(1)
        ];
    case 'array':
      return [schema, ...flattenSchema(schema.elementSchema, depth - 1)];
    case 'tuple':
      return [schema, ...schema.tupleSchemas.map(schema => flattenSchema(schema, depth - 1)).flat(1)];
    case 'optional':
      return [schema, ...flattenSchema(schema.option, depth)];
    case 'union':
      return [schema, ...schema.options.map(option => flattenSchema(option, depth)).flat(1)];
    case 'name':
      return [schema, ...flattenSchema(schema.namedSchema, depth)];
    case 'id':
      return [schema, ...flattenSchema(schema.identifiedSchema, depth)];
    default:
      return [schema];
  }
};

module.exports = {
  flattenSchema,
};