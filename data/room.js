// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { createBufferCompositeTable } from "./sources/table.js"
import {
  castRoomLobbyState,
  castRoomSceneState
} from "@astral-atlas/wildspace-models"
import { createMemoryChannel } from "./sources/channel.js";

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type {
  GameID, RoomID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  ExpositionSceneID, ExpositionScene,
  RoomLobbyState,
  RoomSceneState,
  RoomStateEvent
} from "@astral-atlas/wildspace-models";
*/

/*::
export type WildspaceRoomData = {
  lobby:  CompositeTable<GameID, RoomID, RoomLobbyState>,
  scene: CompositeTable<GameID, RoomID, RoomSceneState>,
  updates: Channel<RoomID, RoomStateEvent>
};

type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
}
*/

export const createBufferWildspaceRoomData = ({ createBufferStore }/*: DataConstructors*/)/*: WildspaceRoomData*/ => {
  const lobby = createBufferCompositeTable(createBufferStore('room_lobby'), castRoomLobbyState);
  const scene = createBufferCompositeTable(createBufferStore('room_scene'), castRoomSceneState);
  const updates = createMemoryChannel();

  return {
    lobby,
    scene,
    updates
  }
}