// @flow strict
/*:: import type { PlayerID } from '../users'; */
/*:: import type { Game } from '../game'; */
const { toObject, toArray, toString } = require('../casting');
const { toPlayerID } = require('../users');
const { toGame } = require('../game');

/*::
type GameParams = {|
  name: string,
  players: PlayerID[],
|};

export type {
  GameParams,
};
*/

const toGameArray = (value/*: mixed*/)/*: Game[]*/ => {
  const array = toArray(value);
  return array.map(toGame);
};

const toGameParams = (value/*: mixed*/)/*: GameParams*/ => {
  const object = toObject(value);

  return {
    name: toString(object.name),
    players: toArray(object.players).map(toPlayerID),
  };
};

module.exports = {
  toGameParams,
  toGameArray,
};
