// @flow strict
const { toObject, toString } = require('../casting');

/*::
type PlayerParams = {|
  name: string,
|};

export type {
  PlayerParams,
};
*/

const toPlayerParams = (value/*: mixed*/)/*: PlayerParams*/ => {
  const object = toObject(value);
  return {
    name: toString(object.name),
  };
};

module.exports = {
  toPlayerParams,
};