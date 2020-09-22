// @flow strict
/*::
type JSONValue =
  | JSONPrimitive
  | JSONComposite

type JSONString = string;
type JSONNumber = number;
type JSONBoolean= boolean;
type JSONNull = null;

type JSONPrimitive = JSONString | JSONNumber | JSONBoolean | JSONNull;

type JSONArray = $ReadOnlyArray<JSONValue>;
type JSONObject = $ReadOnly<{ [property: JSONString]: JSONValue }>;

type JSONComposite = JSONArray | JSONObject;

export type {
  JSONValue
};
*/

const parse = (input/*: string*/)/*: JSONValue*/ => {
  return JSON.parse(input);
};

const stringify = (input/*: JSONValue*/)/*: string*/ => {
  return JSON.stringify(input);
};

module.exports = {
  parse,
  stringify,
};