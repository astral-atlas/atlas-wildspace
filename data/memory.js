// @flow strict
/*:: import type { WildspaceData }from './entry.js'; */
import { createMemoryChannel } from './channel.js';
import { createCompositeKeyTable, createMemoryTable } from './table.js';

export const createMemoryData = ()/*: WildspaceData*/ => {
  const assets = createMemoryTable();
  const assetData = createMemoryTable();
  const game = createMemoryTable();
  const room = createCompositeKeyTable(createMemoryTable());
  const roomState = createCompositeKeyTable(createMemoryTable());
  const roomUpdates = createMemoryChannel();

  const playlists = createCompositeKeyTable(createMemoryTable());
  const playlistStates = createCompositeKeyTable(createMemoryTable());
  const tracks = createCompositeKeyTable(createMemoryTable());

  const playlistStateUpdates = createMemoryChannel();

  return {
    assets,
    assetData,
    game,
    room,
    roomState,
    roomUpdates,
  
    playlists,
    playlistStates,
    tracks,
  
    playlistStateUpdates,
  };
};
