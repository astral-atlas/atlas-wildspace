// @flow strict
/*:: import type { S3 } from '@aws-sdk/client-s3'; */
/*:: import type { Table, CompositeTable } from './sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { join, resolve } from 'path';

import {
  createMemoryBufferStore, createMemoryBufferDB,
  createFileBufferStore, createFileStreamBufferDB,
  createAWSS3BufferDB,
  createS3BufferStore
} from "./sources/buffer.js";

/*::
import type {
  AssetDescription, AssetID,
  Game, GameID,
  AudioPlaylist, AudioPlaylistID,
  AudioTrack, AudioTrackID,
  Room, RoomID, RoomState
} from "@astral-atlas/wildspace-models";
*/
import { createBufferWildspaceData } from "./data.js";

/*::
export type WildspaceData = {
  assets: Table<AssetID, AssetDescription>,
  assetData: BufferDB<AssetID>,

  game: Table<GameID, Game>,
  room: CompositeTable<GameID, RoomID, Room>,
  roomState: CompositeTable<GameID, RoomID, RoomState>,
  roomUpdates: Channel<RoomID, void>,

  playlists: CompositeTable<GameID, AudioPlaylistID, AudioPlaylist>,
  tracks: CompositeTable<GameID, AudioTrackID, AudioTrack>,
};
*/

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