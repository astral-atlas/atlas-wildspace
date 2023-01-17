// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { Table, CompositeTable } from './sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */
/*:: import type { ExpiryTable } from './sources/expiry.js'; */

/*::
import type {
  APIConfig,
  AssetDescription, AssetID,
  Game, GameID, GameUpdate,
  AudioPlaylist, AudioPlaylistID, AudioPlaylistState,
  AudioTrack, AudioTrackID,
  Room, RoomID, RoomState,
  CharacterID, Character,
  EncounterID, Encounter, EncounterState,
  RoomAudioState,
  MonsterID, Monster,
} from "@astral-atlas/wildspace-models";

import type { WildspaceGameData } from "./game";
import type { WildspaceRoomData } from "./room";
import type { AssetData } from "./asset";
import type { WikiData } from "./wiki.js";

import type { Transactable } from "./sources/table2";
import type { DynamoDBValueType } from "@aws-sdk/client-dynamodb";
import type { Cast } from "@lukekaalim/cast";
*/

import { createTableWildspaceData } from './wildspace/index.js';
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { createAWSSources } from './sources.js';
import { createMemorySources } from "./sources.js";

/*::
export type WildspaceData = {
  assets: Table<AssetID, AssetDescription>,
  assetData: BufferDB<AssetID>,
  assetsData: AssetData,

  assetLinkCache: ExpiryTable<{ downloadURL: string }>,

  game: Table<GameID, { id: GameID, name: string, gameMasterId: UserID }>,
  gameUpdates: Channel<GameID, GameUpdate>,
  gameParticipation: CompositeTable<UserID, GameID, { gameId: GameID, joined: boolean }>,
  gamePlayers: CompositeTable<GameID, UserID, { userId: UserID, joined: boolean }>,

  characters: CompositeTable<GameID, CharacterID, Character>,
  encounters: CompositeTable<GameID, EncounterID, Encounter>,
  monsters: CompositeTable<GameID, MonsterID, Monster>,

  gameData: WildspaceGameData,
  roomData: WildspaceRoomData,

  wiki: WikiData,

  room: CompositeTable<GameID, RoomID, Room>,
  roomAudio: CompositeTable<GameID, RoomID, RoomAudioState>,
  roomEncounter: CompositeTable<GameID, RoomID, EncounterState>,

  playlists: CompositeTable<GameID, AudioPlaylistID, AudioPlaylist>,
  tracks: CompositeTable<GameID, AudioTrackID, AudioTrack>,
};
*/

export const createData = (config/*: APIConfig*/)/*: WildspaceData*/ => {
  const dataConfig = config.data;
  switch (dataConfig.type) {
    case 'memory':
      return createMemoryData();
    case 'file':
    case 'awsS3':
    default:
      throw new Error(`Unimplemented`);
    case 'dynamodb':
      const db = new DynamoDB({ region: dataConfig.region });
      return createDynamoDBData(db, dataConfig.tableName);
  }
}

export const createMemoryData = ()/*: WildspaceData*/ => {
  return createTableWildspaceData(createMemorySources());
};

export const createDynamoDBData = (
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,
)/*: WildspaceData*/ => {
  return createTableWildspaceData(createAWSSources(dynamodb, tableName));
}

export * from './wildspace/index.js';
export * from './sources.js';