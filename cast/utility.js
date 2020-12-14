// @flow strict

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
  toConstant,
  toEnum,
  toNullable,
}