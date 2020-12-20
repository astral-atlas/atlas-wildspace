// @flow strict
/*:: import type { GameID, GameMasterID, PlayerID } from '@astral-atlas/wildspace-models'; */
/*:: import type { ActiveTrackRow } from '@astral-atlas/wildspace-models'; */
/*:: import type { ReadWriteTable } from '@astral-atlas/table'; */
const { createFileTable } = require('@astral-atlas/table');
const { toGameMasterID, toGameID, toPlayerID } = require('@astral-atlas/wildspace-models');
const { toObject, toString } = require('@lukekaalim/cast');

/*::
type GameRow = { gameId: GameID, name: string, creator: GameMasterID };
type PlayerInGameRow = { gameId: GameID, playerId: PlayerID };

export type GameTables = {
  games: ReadWriteTable<GameRow>,
  playersInGames: ReadWriteTable<PlayerInGameRow>,
};
*/
const toGameRow = (value/*: mixed*/)/*: GameRow*/ => {
  const object = toObject(value);
  return {
    creator: toGameMasterID(object.creator),
    gameId: toGameID(object.gameId),
    name: toString(object.name),
  }
};

const toPlayerInGameRow = (value/*: mixed*/)/*: PlayerInGameRow*/ => {
  const object = toObject(value);
  return {
    playerId: toPlayerID(object.playerId),
    gameId: toGameID(object.gameId),
  }
};

const createGameTables = async ()/*: Promise<GameTables>*/ => {
  const games = await createFileTable('games', './data/games.json', toGameRow);
  const playersInGames = await createFileTable('assetPushTokens', './data/games/players.json', toPlayerInGameRow);

  return {
    games,
    playersInGames,
  };
};

module.exports = {
  createGameTables,
};
