// @flow strict

/*::
export type * from './json';
export type * from './utility';
export type * from './primitives';

export type Cast<T> = (value: mixed) => T;
export type Equal<T> = (a: T, b: T) => boolean;
*/

module.exports = {
  ...require('./json'),
  ...require('./utility'),
  ...require('./primitives'),
}