// @flow strict
const { toString } = require('./casting');

/*::
type UUID = string;

export type {
  UUID,
};
*/

const toUUID = (value/*: mixed*/)/*: UUID*/ => toString(value);;

module.exports = {
  toUUID,
};