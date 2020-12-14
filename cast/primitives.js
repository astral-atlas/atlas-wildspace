// @flow strict

const toObject = (value/*: mixed*/)/*: { +[string]: mixed }*/ => {
  if (typeof value !== 'object')
    throw new TypeError();
  if (value === null)
    throw new TypeError();
  return value;
};

const toArray = (value/*: mixed*/)/*: $ReadOnlyArray<mixed>*/ => {
  if (!Array.isArray(value))
    throw new TypeError();
  return value;
};

const toNumber = (value/*: mixed*/)/*: number*/ => {
  if (typeof value !== 'number')
    throw new TypeError();
  return value;
};
const toString = (value/*: mixed*/)/*: string*/ => {
  if (typeof value !== 'string')
    throw new TypeError();
  return value;
};

module.exports = {
  toObject,
  toArray,
  toString,
  toNumber,
}
