// @flow strict
/*::
type Success<S> = {
  success: S,
  type: 'success',
};
type Failure<F> = {
  failure: F,
  type: 'failure',
};
type Result<S, F> =
  | Success<S>
  | Failure<F>

export type {
  Success,
  Failure,
  Result,
};
*/
const succeed = /*:: <T>*/(success/*: T*/)/*: Result<T, empty>*/ => ({
  success,
  type: 'success',
});
const fail = /*:: <T>*/(failure/*: T*/)/*: Result<empty, T>*/ => ({
  failure,
  type: 'failure',
});

module.exports = {
  succeed,
  fail,
};
