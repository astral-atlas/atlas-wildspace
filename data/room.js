// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { BufferStore, BufferDB } from './sources/buffer.js'; */
/*:: import type { Channel } from './sources/channel.js'; */

import { createBufferCompositeTable } from "./sources/table.js"
import * as m from "@astral-atlas/wildspace-models"
import { createMemoryChannel } from "./sources/channel.js";
import { c } from "@lukekaalim/cast";
import { castGameConnectionId, castRoomConnectionState, castRoomId, castRoomStateVersion } from "@astral-atlas/wildspace-models";
import { createNamespacedDynamoDBTable } from "./sources/dynamoTable.js";

/*::
import type { Table, CompositeTable } from './sources/table.js';

import type {
  GameID, RoomID,
  LocationID, Location,
  NonPlayerCharacterID, NonPlayerCharacter,
  RoomSceneState,
  RoomConnectionState,
  Room,
} from "@astral-atlas/wildspace-models";
import type { GameConnectionID } from "../models/game/connection";
import type { Cast } from "@lukekaalim/cast";
import type { RoomState, RoomStateVersion } from "../models/room/state";
import type { WildspaceDataSources } from "./sources";
import type { Transactable } from "./sources/table2";
import type { ExpirableCompositeTable } from "./sources/expiry";
import type { DynamoDBTable } from "./sources/dynamoTable";
*/

/*::
export type WildspaceRoomData = {
  rooms: CompositeTable<GameID, RoomID, Room>,
  roomStates: {
    table: CompositeTable<GameID, RoomID, RoomState>,
    versions: DynamoDBTable<GameID, [RoomID, RoomStateVersion], RoomState>,
    transactable: Transactable<GameID, RoomID, RoomState>
  },
  roomConnections: DynamoDBTable<GameID, [RoomID, GameConnectionID], RoomConnectionState>,
  roomConnectionUpdates: Channel<GameID, {
    connections: $ReadOnlyArray<RoomConnectionState>,
    counts: $ReadOnlyArray<{ roomId: RoomID, count: number }>
  }>,
};
*/

const castConnectionSortPair/*: Cast<[RoomID, GameConnectionID]>*/ = c.tup([castRoomId, castGameConnectionId]);
const castRoomStateVersionPair/*: Cast<[RoomID, RoomStateVersion]>*/ = c.tup([castRoomId, castRoomStateVersion]);

export const createTableWildspaceRoomData = (sources/*: WildspaceDataSources*/)/*: WildspaceRoomData*/ => {
  const rooms = sources.createCompositeTable('rooms', m.castRoom);
  const roomStates = {
    table: sources.createCompositeTable('roomStates', m.castRoomState),
    versions: createNamespacedDynamoDBTable(
      sources.createDynamoDBTable('roomStateVersions', m.castRoomState),
      pk => pk,
      sk => sk.join(':'),
      sk => castRoomStateVersionPair(sk.split(':')),
    ),
    transactable: sources.createTransactable('roomStates', m.castRoomState, 'version')
  }
  const roomConnections = createNamespacedDynamoDBTable(
    sources.createDynamoDBTable('roomConnections', m.castRoomConnectionState),
    pk => pk,
    sk => sk.join(':'),
    sk => castConnectionSortPair(sk.split(':')),
  );
  const roomConnectionUpdates = sources.createChannel('roomConnectionUpdates', c.obj({
    connections: c.arr(m.castRoomConnectionState),
    counts : c.arr(c.obj({
      roomId: m.castRoomId,
      count: c.num
    }))
  }));

  return {
    rooms,
    roomStates,
    roomConnections,
    roomConnectionUpdates,
  }
}
