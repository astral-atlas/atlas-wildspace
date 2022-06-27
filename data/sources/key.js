// @flow strict

/*::
export opaque type CompositeKey<A, B>: string = string;

export type CompositeKeyCutter<A, B> = {
  compose(a: A, b: B): CompositeKey<A, B>,
  decompose(key: CompositeKey<A, B>): [A, B],
}
*/

export const createStringCompositeKeyCutter = /*:: <A: string, B: string>*/()/*: CompositeKeyCutter<A, B>*/ => {
  const compose = (a, b) => {
    return [a, b].join(':')
  };
  const decompose = (key) => {
    const [a, b] = key.split(':');
    return [a, b];
  };

  // $FlowFixMe
  return { compose, decompose };
};
