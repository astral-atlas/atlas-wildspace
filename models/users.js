// @flow strict
const { toObject, toString } = require('./casting');
const { toUUID } = require('./id');

/*::
type UUID = string;

type GameMasterID = UUID;
type GameMaster = {
  id: GameMasterID,
  name: string,
};

type PlayerID = UUID;
type Player = {
  id: PlayerID,
  name: string,
};

type User =
  | { type: 'player', player: Player }
  | { type: 'game-master', gameMaster: GameMaster }

export type {
  User,
  PlayerID,
  Player,
  GameMasterID,
  GameMaster,
};
*/
const toGameMasterID = (value/*: mixed*/)/*: GameMasterID*/ => toUUID(value);
const toGameMaster = (value/*: mixed*/)/*: GameMaster*/ => {
  const object = toObject(value);
  return {
    id: toGameMasterID(object.id),
    name: toString(object.id),
  };
}

const toPlayerID = (value/*: mixed*/)/*: PlayerID*/ => toUUID(value);
const toPlayer = (value/*: mixed*/)/*: Player*/ => {
  const object = toObject(value);
  return {
    id: toPlayerID(object.id),
    name: toString(object.id),
  };
}

const toUser = (value/*: mixed*/)/*: User*/ => {
  const object = toObject(value);
  switch (object.type) {
    case 'player':
      return { type: 'player', player: toPlayer(object.player) };
    case 'game-master':
      return { type: 'game-master', gameMaster: toGameMaster(object.player) };
    default:
      throw new TypeError();
  }
};

module.exports = {
  toGameMasterID,
  toGameMaster,
  toPlayerID,
  toPlayer,
  toUser,
};
