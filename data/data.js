// @flow strict
/*:: import type { Table, CompositeTable } from './sources/table.js'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

/*:: import type { WildspaceData } from "./entry"; */

import { createBufferTable, createBufferCompositeTable } from "./sources/table.js";
import { createMemoryChannel } from "./sources/channel.js";
import * as m from '@astral-atlas/wildspace-models';



/*::
type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
  createBufferDB: (name: string) => BufferDB<string>,
}
*/

export const createBufferWildspaceData = ({ createBufferStore, createBufferDB }/*: DataConstructors*/)/*: { data: WildspaceData }*/ => {
  const assets = createBufferTable(createBufferStore('assets'), m.castAssetDescription);
  const assetData = createBufferDB('assetData');

  const game = createBufferTable(createBufferStore('game'), m.castGame);
  const room = createBufferCompositeTable(createBufferStore('room'), m.castRoom);
  const roomState = createBufferCompositeTable(createBufferStore('roomState'), m.castRoomState);
  const roomUpdates = createMemoryChannel();

  const playlists = createBufferCompositeTable(createBufferStore('playlists'), m.castAudioPlaylist);
  const tracks = createBufferCompositeTable(createBufferStore('tracks'), m.castAudioTrack);

  const data = {
    assets,
    assetData,

    game,
    room,
    roomState,
    roomUpdates,

    playlists,
    tracks
  }

  return { data };
};