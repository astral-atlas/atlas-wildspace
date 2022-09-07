// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { createBufferCompositeTable } from "./sources/table.js"
import * as m from "@astral-atlas/wildspace-models"
import { createMemoryChannel } from "./sources/channel.js";
import { c } from "@lukekaalim/cast";

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type {
  GameID, RoomID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  RoomSceneState,
} from "@astral-atlas/wildspace-models";
import type { GameConnectionID } from "../models/game/connection";
import type { Cast } from "@lukekaalim/cast";
import type { RoomState } from "../models/room/state";
import type { WildspaceDataSources } from "./sources";
import type { Transactable } from "./sources/table2";
import type { Room } from "../models/room/room";
*/

/*::
export type WildspaceRoomData = {
  rooms: CompositeTable<GameID, RoomID, Room>,
  roomStates: {
    table: CompositeTable<GameID, RoomID, RoomState>,
    transactable: Transactable<GameID, RoomID, RoomState>
  },
  roomConnectionCounts: {
    table: CompositeTable<GameID, RoomID, { count: number }>,
    transactable: Transactable<GameID, RoomID, { count: number }>
  },
  roomConnections: CompositeTable<RoomID, GameConnectionID, {}>,
};
*/

export const createTableWildspaceRoomData = (sources/*: WildspaceDataSources*/)/*: WildspaceRoomData*/ => {
  const rooms = sources.createCompositeTable('rooms', m.castRoom);
  const roomStates = {
    table: sources.createCompositeTable('roomStates', m.castRoomState),
    transactable: sources.createTransactable('roomStates', m.castRoomState, 'version')
  }
  const roomConnectionCounts = {
    table: sources.createCompositeTable('roomConnectionCounts', c.obj({ count: c.num })),
    transactable: sources.createTransactable('roomConnectionCounts', c.obj({ count: c.num }), 'count'),
  };
  const roomConnections = sources.createCompositeTable('roomConnections', c.obj({}))

  return {
    rooms,
    roomStates,
    roomConnectionCounts,
    roomConnections
  }
}
