// @flow strict
/*:: import type { PlayerID } from '../users'; */
/*:: import type { Game } from '../game'; */
const { toObject, toArray } = require('../casting');
const { toPlayerID } = require('../users');
const { toGame } = require('../game');

/*::
type GameParams = {|
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
    players: toArray(object.players).map(toPlayerID),
  };
};

module.exports = {
  toGameParams,
  toGameArray,
};
