// @flow strict
/*:: import type { GameID, GameMasterID, PlayerID } from '@astral-atlas/wildspace-models'; */
/*:: import type { ActiveTrackRow } from '@astral-atlas/wildspace-models'; */
/*:: import type { Table } from './services/table'; */
/*:: import type { AssetTables } from './tables/assets'; */
const { createFileTable } = require('./services/table');
const { toObject, toString } = require('@lukekaalim/cast');
const {
  toGameID, toGameMasterID, toPlayerID, toActiveTrackRow, isEqualActiveTrackRow
} = require('@astral-atlas/wildspace-models');

const { createAssetTables } = require('./tables/assets');

/*::
type GameRow = { gameId: GameID, name: string, creator: GameMasterID };
type PlayerInGameRow = { gameId: GameID, playerId: PlayerID };

export type Tables = {
  asset: AssetTables,
  games: Table<{ gameId?: GameID, creator?: GameMasterID }, GameRow>,
  playersInGames: Table<{ gameId?: GameID, playerId?: PlayerID }, PlayerInGameRow>,
  activeTracks: Table<{ gameId?: GameID }, ActiveTrackRow>,
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

const createTables = async ()/*: Promise<Tables>*/ => {
  const asset = await createAssetTables();
  const games = await createFileTable('./data/games.json', toGameRow,
    (a, b) => a.gameId === b.gameId);
  const playersInGames = await createFileTable('./data/playersInGames.json', toPlayerInGameRow,
    (a, b) => a.gameId === b.gameId && a.playerId === b.playerId);

  const activeTracks = await createFileTable('./data/activeTracks.json',
    toActiveTrackRow, isEqualActiveTrackRow);
  
  return {
    asset,
    games,
    playersInGames,
    activeTracks,
  };
};

module.exports = {
  createTables,
};
