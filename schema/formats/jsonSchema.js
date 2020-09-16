// @flow strict
/*:: import type { Schema, IdSchema } from '../main'; */
const { flattenSchema } = require('./utils');

/*::
// Don't bother typing all of JSON Schema here
opaque type JSONSchema: mixed = mixed;

type JSONSchemaOptions = {
  root: boolean,
};
*/

const toJSONSchema = (schema/*: Schema*/)/*: JSONSchema*/ => {
  switch (schema.type) {
    // primitive
    case 'string':
      return {
        type: 'string',
      };
    case 'boolean':
      return {
        type: 'boolean',
      };
    case 'number':
      return {
        type: 'number',
      };
    case 'null':
      return {
        type: 'null',
      };
    // compound
    case 'array':
      return {
        type: 'array',
        items: toJSONSchema(schema.elementSchema),
      };
    case 'object':
      return {
        type: 'object',
        properties: Object.fromEntries(
          schema.propertySchemas
            .map(([property, schema]) => [property, toJSONSchema(schema)])
        ),
        required: schema.propertySchemas.map(([property]) => property)
      };
    // branch
    case 'union':
      return {
        'oneOf': schema.options.map(option => toJSONSchema(option))
      };
    case 'optional':
      return {
        'oneOf': [
          { type: 'null' },
          toJSONSchema(schema.option)
        ],
      };
    // literal
    case 'number-literal':
    case 'boolean-literal':
    case 'string-literal':
      return {
        const: schema.literalValue,
      };
    case 'tuple':
      return {
        type: 'array',
        items: schema.tupleSchemas.map(elementSchema => toJSONSchema(elementSchema))
      };
    // meta
    case 'name':
      return {
        ...toJSONSchema(schema.namedSchema),
        title: schema.name,
        description: schema.description,
      };
    case 'id':
      return {
        '$ref': `#${schema.id}`
      };
    default:
      (schema/*: empty*/)
      throw new Error('Unimplemented');
  }
};

const findAllIDSchemas = (schema/*: Schema*/)/*: IdSchema[]*/ => {
  const allSchema = flattenSchema(schema);
  return allSchema
    .map(schema => schema.type === 'id' ? schema : null)
    .filter(Boolean);
};

const toJSONSchemaDocument = (rootSchema/*: IdSchema*/, schemaDefs/*: IdSchema[]*/ = [])/*: JSONSchema*/ => {
  return {
    ...toJSONSchema(rootSchema.identifiedSchema),
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$id": rootSchema.id,
    "$defs": Object.fromEntries(
      [...findAllIDSchemas(rootSchema.identifiedSchema), ...schemaDefs]
          .map(schema => [schema.id, { ...toJSONSchema(schema.identifiedSchema), id: `#${schema.id}` }]),
    ),
  };
};

module.exports = {
  toJSONSchema, 
  toJSONSchemaDocument,
};