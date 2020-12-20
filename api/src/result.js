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
type Result<S, F = null> =
  | Success<S>
  | Failure<F>

export type {
  Success,
  Failure,
  Result,
};
*/
const succeed = /*:: <T>*/(success/*: T*/)/*: Success<T>*/ => ({
  success,
  type: 'success',
});
const fail = /*:: <T>*/(failure/*: T*/)/*: Failure<T>*/ => ({
  failure,
  type: 'failure',
});

module.exports = {
  succeed,
  fail,
};
