// @flow strict
import { c } from "@lukekaalim/cast";
import { castRoomId, castLobbyMessageContent, castRoomState } from "../../room.js";
import { castGameId } from "../../game.js";
import { castRoomStateEvent } from "../../room/state.js";

/*::
import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description";
import type { AuthorizedConnection } from "../meta.js"; 

import type { RoomID, LobbyMessageContent, RoomState } from "../../room";
import type { GameID } from "../../game";
import type { RoomStateEvent } from "../../room/state";

export type RoomStateResourceV2 = {|
  GET: {
    query: { roomId: RoomID, gameId: GameID },
    request: empty,
    response: { type: 'found', state: RoomState }
  },
|};
export type RoomStateConnectionV2 = AuthorizedConnection<{|
  query: { roomId: RoomID, gameId: GameID },
  client: empty,
  server:
    | RoomStateEvent
    | {| type: 'heartbeat' |},
|}>;

export type StateAPIV2 = {|
  '/room/state/v2': { connection: RoomStateConnectionV2, resource: RoomStateResourceV2 }
|}
*/

const connection/*: ConnectionDescription<RoomStateConnectionV2>*/ = {
  path: '/room/state/v2',
  subprotocol: 'JSON.wildspace.room_state.v2.0.0',

  castQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
  castServerMessage: e => {
    if (typeof e !== 'object' || !e)
      throw new Error();
    const type = c.str(e.type)
    switch (type) {
      case 'heartbeat':
        return { type: 'heartbeat' };
      default:
        return castRoomStateEvent(e);
    }
  }
};

const resource/*: ResourceDescription<RoomStateResourceV2>*/ = {
  path: '/room/state/v2',
  GET: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), state: castRoomState })
  },
}

export const stateApiV2 = {
  '/room/state/v2': { connection, resource }
};