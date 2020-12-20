// @flow strict
/*:: import type { UUID } from './id'; */
/*:: import type { GameMasterID, PlayerID } from './users'; */
const { toUUID } = require('./id');
const { toObject, toArray, toString } = require('./casting');

/*::
type GameID = UUID;
type Game = {
  gameId: GameID,
  name: string,
  creator: GameMasterID,
  players: PlayerID[]
};

export type {
  GameID,
  Game,
};
*/

const toGameID = (value/*: mixed*/)/*: GameID*/ => toUUID(value);

const toGame = (value/*: mixed*/)/*: Game*/ => {
  const object = toObject(value);
  return {
    gameId: toGameID(object.gameId),
    name: toString(object.name || ''),
    creator: toUUID(object.creator),
    players: toArray(object.players).map(toUUID),
  };
}

module.exports = {
  toGameID,
  toGame,
};
