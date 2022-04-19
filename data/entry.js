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