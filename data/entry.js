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
  Room, RoomID, RoomState, RoomUpdate,
  CharacterID, Character,
  EncounterID, Encounter, EncounterState,
  RoomAudioState,
  MonsterID, Monster,
} from "@astral-atlas/wildspace-models";

import type { WildspaceGameData } from "./game";
import type { WildspaceRoomData } from "./room";
import type { WikiData } from "./wiki.js";

import type { Transactable } from "./sources/table2";
import type { DynamoDBValueType } from "@aws-sdk/client-dynamodb";
import type { Cast } from "@lukekaalim/cast";
*/
import { join, resolve } from 'path';
import { S3 } from "@aws-sdk/client-s3";

import {
  createMemoryBufferStore, createMemoryBufferDB,
  createFileBufferStore, createFileStreamBufferDB,
  createAWSS3BufferDB,
  createS3BufferStore
} from "./sources/buffer.js";

import { createBufferWildspaceData } from "./data.js";
import { createTableWildspaceData } from './wildspace/index.js';
import { createMemoryChannel } from "./sources/channel.js";
import { createDynamoDBCompositeTable } from './sources/table.js';
import { createDynamoDBSimpleTable } from "./sources/table.js";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { createDynamoDBTrasactable } from './sources/table2.js';

/*::
export type WildspaceData = {
  assets: Table<AssetID, AssetDescription>,
  assetData: BufferDB<AssetID>,

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
  roomUpdates: Channel<RoomID, RoomUpdate>,

  playlists: CompositeTable<GameID, AudioPlaylistID, AudioPlaylist>,
  tracks: CompositeTable<GameID, AudioTrackID, AudioTrack>,
};
*/

export const createData = (config/*: APIConfig*/)/*: { data: WildspaceData }*/ => {
  const dataConfig = config.data;
  switch (dataConfig.type) {
    case 'memory':
      return createMemoryData();
    case 'file':
      return createFileData(dataConfig.directory);
    case 'awsS3':
      const s3 = new S3({ region: dataConfig.region })
      return createAWSS3Data(s3, dataConfig.bucket, dataConfig.keyPrefix);
    case 'dynamodb':
      const db = new DynamoDB({ region: dataConfig.region });
      return { data: createDynamoDBData(db, dataConfig.tableName) };
  }
}

export const createMemoryData = ()/*: { data: WildspaceData }*/ => {
  const { data } = createBufferWildspaceData({
    createBufferDB: () => createMemoryBufferDB(),
    createBufferStore: () => createMemoryBufferStore(),
  });
  return { data };
};

export const createFileData = (dataDir/*: string*/)/*: { data: WildspaceData, dirs: string[] }*/ => {
  const dirs = [dataDir];
  const { data } = createBufferWildspaceData({
    createBufferDB: (name) => (dirs.push(resolve(dataDir, name)), createFileStreamBufferDB(resolve(dataDir, name))),
    createBufferStore: (name) => createFileBufferStore(resolve(dataDir, `${name}.json`)),
  });
  return { data, dirs };
};

export const createAWSS3Data = (s3/*: S3*/, bucket/*: string*/, keyPrefix/*: string*/)/*: { data: WildspaceData }*/ => {
  const prefixes = [];

  const { data } = createBufferWildspaceData({
    createBufferDB: (name) => createAWSS3BufferDB(s3, bucket, join(keyPrefix, name)),
    createBufferStore: (name) => createS3BufferStore(s3, bucket, resolve(keyPrefix, name, `${name}.json`)),
  });
  return { data };
};

export const createDynamoDBData = (
  dynamodb/*: DynamoDB*/,
  tableName/*: string*/,
)/*: WildspaceData*/ => {
  const createTransactable = /*:: <PK: string, SK: string, V: {}>*/(
    namespace,
    cast/*: Cast<V>*/,
    createVersion/*: V => { key: string, value: mixed }*/
  )/*: Transactable<PK, SK, V>*/ => {
    return createDynamoDBTrasactable(
      dynamodb,
      tableName,
      cast,
      (pk, sk) => ({ ['Partition']: { S: `${namespace}:${pk}` }, ['Sort']: { S: sk } }),
      createVersion,
    );
  };
  const constructors = {
    createTransactable,
    createChannel: createMemoryChannel,
    createTable: /*:: <K: string, V>*/(key, cast)/*: Table<K, V>*/ => createDynamoDBSimpleTable(tableName, 'Partition', 'Sort', pk => `${key}:${pk}`, cast, dynamodb),
    createCompositeTable: /*:: <PK: string, SK: string, V>*/(key, cast)/*: CompositeTable<PK, SK, V>*/ => createDynamoDBCompositeTable(tableName, 'Partition', 'Sort', pk => `${key}:${pk}`, sk => sk, cast, dynamodb),
  }
  return createTableWildspaceData(constructors)
}

export * from './wildspace/index.js';