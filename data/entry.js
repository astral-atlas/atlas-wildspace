// @flow strict
/*:: import type { Readable } from 'stream'; */
/*:: import type { Table, CompositeTable } from './table.js'; */
/*:: import type { BufferStore } from './buffer.js'; */
/*:: import type { Channel } from './channel.js'; */
/*:: import type {
  AssetDescription, AssetID,
  Game, GameID,
  AudioPlaylist, AudioPlaylistID,
  AudioTrack, AudioTrackID,
  Room, RoomID, RoomState
} from "@astral-atlas/wildspace-models"; */

/*::
export type WildspaceData = {
  assets: Table<AssetID, AssetDescription>,
  assetData: BufferStore<AssetID>,

  game: Table<GameID, Game>,
  room: CompositeTable<GameID, RoomID, Room>,
  roomState: CompositeTable<GameID, RoomID, RoomState>,
  roomUpdates: Channel<RoomID, void>,

  playlists: CompositeTable<GameID, AudioPlaylistID, AudioPlaylist>,
  tracks: CompositeTable<GameID, AudioTrackID, AudioTrack>,

  playlistStateUpdates: Channel<AudioPlaylistID, void>
};
*/

export * from './memory.js';
export * from './file.js';

export * from './table.js';
export * from './channel.js';
export * from './buffer.js';