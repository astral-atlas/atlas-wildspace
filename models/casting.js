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


const toConstant = /*:: <T>*/(value/*: mixed*/, constant/*: T*/)/*: T*/ => {
  if (constant !== value)
    throw new TypeError();
  return constant;
};
const toEnum = /*:: <T: mixed[]>*/(value/*: mixed*/, options/*: T*/)/*: $ElementType<T, number>*/ => {
  const enumIndex = options.indexOf(value);
  if (enumIndex === -1)
    throw new TypeError();
  return options[enumIndex];
};
const toNullable = /*::<T>*/(value/*: mixed*/, toValue/*: mixed => T*/)/*: null | T*/ => {
  if (value === null)
    return null;
  return toValue(value);
}

module.exports = {
  toObject,
  toArray,
  toString,
  toNumber,

  toConstant,
  toEnum,
  toNullable,
}
