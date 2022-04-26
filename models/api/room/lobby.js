// @flow strict

import { c } from "@lukekaalim/cast";
import { castRoomId, castLobbyMessageContent } from "../../room.js";
import { castGameId } from "../../game.js";

/*::
import type { ResourceDescription, } from "@lukekaalim/net-description/resource";
import type { RoomID, LobbyMessageContent } from "../../room";
import type { GameID } from "../../game";

export type LobbyMessageResource = {|
  POST: {
    query: { roomId: RoomID, gameId: GameID },
    request: { content: LobbyMessageContent },
    response: { type: 'updated' }
  },
|};
*/


export const lobbyMessageResource/*: ResourceDescription<LobbyMessageResource> */ = {
  path: '/room/lobby/message',

  POST: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: c.obj({ content: castLobbyMessageContent }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  }
}

/*::
export type LobbyAPI = {|
  '/room/lobby/message': ResourceDescription<LobbyMessageResource>,
|}

*/

export const lobbyApi = {
  '/room/lobby/message': lobbyMessageResource
};