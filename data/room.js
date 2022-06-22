// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { createBufferCompositeTable } from "./sources/table.js"
import {
  castRoomId,
  castRoomLobbyEvent,
  castRoomLobbyState,
  castRoomSceneState,
  castRoomStateEvent,
  castRoomUpdate
} from "@astral-atlas/wildspace-models"
import { createMemoryChannel } from "./sources/channel.js";
import { enhanceWithFakeTransactable } from "./sources/table2.js";
import { c } from "@lukekaalim/cast";

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type {
  GameID, RoomID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  RoomLobbyState,
  RoomSceneState,
  RoomStateEvent
} from "@astral-atlas/wildspace-models";
import type { TableDataConstructors } from "./wildspace/table";
import type { GameConnectionID } from "../models/game/connection";
import type { VersionedTable } from "./sources/meta";
import type { Cast } from "@lukekaalim/cast";
*/

/*::
type LobbyData = { roomId: RoomID, state: RoomLobbyState, version: string };

export type WildspaceRoomData = {
  lobby:  VersionedTable<GameID, RoomID, LobbyData>,
  lobbyUpdates: Channel<GameID, LobbyData>,
  scene: CompositeTable<GameID, RoomID, RoomSceneState>,
  updates: Channel<RoomID, RoomStateEvent>
};

type DataConstructors = {
  createBufferStore: (name: string) => BufferStore,
}
*/

const castLobbyData/*: Cast<LobbyData>*/ = c.obj({ roomId: castRoomId, state: castRoomLobbyState, version: c.str });

export const createBufferWildspaceRoomData = ({ createBufferStore }/*: DataConstructors*/)/*: WildspaceRoomData*/ => {
  const lobby = enhanceWithFakeTransactable(createBufferCompositeTable(
    createBufferStore('room_lobby'),
    castLobbyData
  ));
  const scene = createBufferCompositeTable(createBufferStore('room_scene'), castRoomSceneState);
  const updates = createMemoryChannel();
  const lobbyUpdates = createMemoryChannel();

  return {
    lobby,
    lobbyUpdates,
    scene,
    updates
  }
}

export const createTableWildspaceRoomData = ({ createChannel, createCompositeTable, createTransactable }/*: TableDataConstructors*/)/*: WildspaceRoomData*/ => {
  const lobby = {
    ...createCompositeTable('room_lobby', castLobbyData),
    ...createTransactable('room_lobby', castLobbyData, item => ({ key: 'version', value: item.version }))
  };
  const lobbyUpdates = createChannel('lobby_updates', castLobbyData);

  const scene = createCompositeTable('room_scene', castRoomSceneState);
  const updates = createChannel('updates', castRoomStateEvent);

  return {
    lobby,
    lobbyUpdates,
    scene,
    updates
  }
}