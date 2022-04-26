// @flow strict
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID } from "../game.js"; */
/*:: import type { Room, RoomID, RoomState, RoomUpdate, RoomAudioState } from "../room.js"; */
/*:: import type { EncounterState, EncounterAction } from "../encounter.js"; */
/*:: import type { AuthorizedConnection } from "./meta.js"; */

import { createObjectCaster, createConstantCaster, castString, createKeyedUnionCaster, createArrayCaster, c } from "@lukekaalim/cast";
import { castGameId } from "../game.js";
import { castRoom, castRoomAudioState, castRoomId, castRoomState, castRoomUpdate } from "../room.js";
import { castEncounterAction, castEncounterState } from "../encounter.js";
import { createAuthorizedConnectionDescription } from './meta.js';

import { lobbyApi } from "./room/lobby.js";
import { stateApiV2 } from "./room/state.js";
import { sceneAPI } from "./room/scene.js";

/*::
import type { LobbyAPI } from "./room/lobby.js";
import type { StateAPIV2 } from "./room/state.js";
import type { SceneAPI } from "./room/scene";

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
  },
  PUT: {
    query: { gameId: GameID, roomId: RoomID },
    request: { room: Room },
    response: { type: 'updated' }
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
export type RoomUpdateConnection = AuthorizedConnection<{|
  query: { roomId: RoomID, gameId: GameID },
  client: empty,
  server: RoomUpdate,
|}>;

export type RoomStateConnection = {|
  query: { roomId: RoomID, gameId: GameID },
  client: empty,
  server: { type: 'update', state: RoomState },
|};


export type RoomAudio = {|
  GET: {
    query: { roomId: RoomID, gameId: GameID },
    request: empty,
    response: {| type: 'found', audio: RoomAudioState |} | {| type: 'not_found' |}
  },
  PUT: {
    query: { roomId: RoomID, gameId: GameID },
    request: { audio: RoomAudioState },
    response: { type: 'updated' }
  }
|};
export type RoomEncounter = {|
  GET: {
    query: { roomId: RoomID, gameId: GameID },
    request: empty,
    response: { type: 'found', encounter: ?EncounterState }
  },
  PUT: {
    query: { roomId: RoomID, gameId: GameID },
    request: { encounter: ?EncounterState },
    response: { type: 'updated' }
  },
|};
export type RoomEncounterActions = {|
  POST: {
    query: { roomId: RoomID, gameId: GameID },
    request: { actions: $ReadOnlyArray<EncounterAction> },
    response: { type: 'accepted' }
  },
|};

export type RoomAPI = {|
  '/room': RoomResource,

  '/room/updates': RoomUpdateConnection,
  '/room/audio': RoomAudio,
  '/room/encounter': RoomEncounter,
  '/room/encounter/actions': RoomEncounterActions,

  '/room/state': { connection: RoomStateConnection, resource: RoomStateResource },

  '/room/all': AllRoomsResource,
  ...LobbyAPI,
  ...StateAPIV2,
  ...SceneAPI
|};
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
  },
  PUT: {
    toQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: createObjectCaster({ room: castRoom }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('updated') })
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
export const roomUpdatesConnectionDescription/*: ConnectionDescription<RoomAPI['/room/updates']>*/ = createAuthorizedConnectionDescription({
  path: '/room/updates',
  subprotocol: 'JSON.wildspace.room_updates.v1.0.0',

  castQuery: createObjectCaster({ roomId: castRoomId, gameId: castGameId }),
  castServerMessage: castRoomUpdate,
});

export const roomAudio/*: ResourceDescription<RoomAudio>*/ = {
  path: '/room/audio',

  GET: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: c.or('type', {
      'found': c.obj({ type: c.lit('found'), audio: castRoomAudioState }),
      'not_found': c.obj({ type: c.lit('not_found') }),
    }) 
  },
  PUT: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: c.obj({ audio: castRoomAudioState }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  }
};

export const roomEncounter/*: ResourceDescription<RoomEncounter>*/ = {
  path: '/room/encounter',

  GET: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), encounter: c.maybe(castEncounterState) }),
  },
  PUT: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: c.obj({ encounter: c.maybe(castEncounterState) }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  }
};
export const roomEncounterActions/*: ResourceDescription<RoomEncounterActions>*/ = {
  path: '/room/encounter/actions',

  POST: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: c.obj({ actions: c.arr(castEncounterAction) }),
    toResponseBody: c.obj({ type: c.lit('accepted') }),
  }
};

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

export * from './room/index.js';
export const roomAPI = {
  '/room': roomResourceDescription,
  '/room/updates': roomUpdatesConnectionDescription,
  '/room/audio': roomAudio,
  '/room/encounter': roomEncounter,
  '/room/encounter/actions': roomEncounterActions,
  '/room/state': { connection: roomStateConnectionDescription, resource: roomStateResourceDescription },
  '/room/all': allRoomsResourceDescription,
  ...stateApiV2,
  ...lobbyApi,
  ...sceneAPI
};