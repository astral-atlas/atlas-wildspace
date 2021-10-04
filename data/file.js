// @flow strict
/*:: import type { WildspaceData }from './entry.js'; */
import { join } from 'path';
import { createArrayCaster, createTupleCaster } from '@lukekaalim/cast';

import { castAssetDescription, castGame, castAudioPlaylist, castAudioTrack, castAudioTrackId, castAudioPlaylistId } from '@astral-atlas/wildspace-models';

import { createMemoryChannel } from './channel.js';
import { createFileStreamBufferStore } from './buffer.js';
import { createCompositeKeyTable, createFileTable } from './table.js';

export const getDataFilePaths = (directory/*: string*/)/*: { [string]: string } */ => ({
  assets:     join(directory, 'assets.json'),
  game:       join(directory, 'game.json'),

  playlists:  join(directory, 'playlists.json'),
  tracks:     join(directory, 'tracks.json'),
});
export const getDataDirectoryPaths = (directory/*: string*/)/*: { [string]: string } */ => ({
  assetData:  join(directory, 'assetData'),
});

export const createPaths = (directory/*: string*/)/*: { [string]: string } */ => ({
  ...getDataFilePaths(directory),
  ...getDataDirectoryPaths(directory),
});

export const createFileData = (directory/*: string*/)/*: WildspaceData*/ => {
  const paths = createPaths(directory);

  const assets =    createFileTable(paths.assets, castAssetDescription);
  const assetData = createFileStreamBufferStore(paths.assetData);
  const game =      createFileTable(paths.game, castGame);

  const playlists = createCompositeKeyTable(createFileTable(paths.playlists,
    createArrayCaster(createTupleCaster([castAudioPlaylistId, castAudioPlaylist]))));
  const tracks = createCompositeKeyTable(createFileTable(paths.tracks,
    createArrayCaster(createTupleCaster([castAudioTrackId, castAudioTrack]))));

  const playlistStateUpdates = createMemoryChannel();

  return {
    assets,
    assetData,
    game,
  
    playlists,
    tracks,
  
    playlistStateUpdates,
  };
};
