// @flow strict
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID } from "../game.js"; */
/*:: import type { Room, RoomID, RoomState, RoomAudioState } from "../room.js"; */

import { createObjectCaster, createConstantCaster, castString, createKeyedUnionCaster, createArrayCaster } from "@lukekaalim/cast";
import { castGameId } from "../game.js";
import { castRoom, castRoomId, castRoomAudioState, castRoomState } from "../room.js";

/*::
export type RoomResource = {|
  GET: {
    query: { roomId: RoomID, gameId: GameID },
    request: empty,
    response: { type: 'found', room: Room }
  },
  POST: {
    query: empty,
    request: { gameId: GameID, title: string },
    response: { type: 'created', room: Room }
  }
|};
export type AllRoomsResource = {|
  GET: {
    query: { gameId: GameID },
    request: empty,
    response: { type: 'found', rooms: $ReadOnlyArray<Room> }
  },
|};

export type RoomStateResource = {|
  GET: {
    query: { roomId: RoomID, gameId: GameID },
    request: empty,
    response: { type: 'found', state: RoomState },
  },
  PUT: {
    query: { roomId: RoomID, gameId: GameID },
    request: { state: RoomState },
    response: { type: 'updated' },
  }
|};

export type RoomStateConnection = {|
  query: { roomId: RoomID, gameId: GameID },
  client: empty,
  server: { type: 'update', state: RoomState },
|};

export type RoomAPI = {
  '/room': RoomResource,
  '/room/state': { connection: RoomStateConnection, resource: RoomStateResource },
  '/room/all': AllRoomsResource,
};
*/

export const roomResourceDescription/*: ResourceDescription<RoomAPI['/room']> */ = {
  path: '/room',

  GET: {
    toQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), room: castRoom })
  },
  POST: {
    toRequestBody: createObjectCaster({ title: castString, gameId: castGameId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('created'), room: castRoom })
  }
}

export const allRoomsResourceDescription/*: ResourceDescription<RoomAPI['/room/all']> */ = {
  path: '/room/all',

  GET: {
    toQuery: createObjectCaster({ gameId: castGameId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), rooms: createArrayCaster(castRoom) })
  },
}

export const roomStateConnectionDescription/*: ConnectionDescription<RoomAPI['/room/state']['connection']>*/ = {
  path: '/room/state',
  subprotocol: 'JSON.wildspace.room_state.v1.0.0',

  castQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
  castServerMessage: createKeyedUnionCaster('type', {
    'update': createObjectCaster({ type: createConstantCaster('update'), state: castRoomState }),
  })
}

export const roomStateResourceDescription/*: ResourceDescription<RoomAPI['/room/state']['resource']> */ = {
  path: '/room/state',

  GET: {
    toQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), state: castRoomState })
  },
  PUT: {
    toQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: createObjectCaster({ state: castRoomState }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('updated') })
  }
}

export const roomAPI = {
  '/room': roomResourceDescription,
  '/room/state': { connection: roomStateConnectionDescription, resource: roomStateResourceDescription },
  '/room/all': allRoomsResourceDescription,
};
