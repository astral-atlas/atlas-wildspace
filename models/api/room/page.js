// @flow strict

import { c } from "@lukekaalim/cast"
import { castRoomId } from "../../room/room";
import { castGameId } from "../../game/game";
import { castRoomPage } from "../../room/page";

/*::
import type { ResourceDescription } from "@lukekaalim/net-description";
import type { GameID } from "../../game/game";
import type { RoomID } from "../../room/room";
import type { RoomPage } from "../../room/page";
*/

/*::
type RoomPageResource = {
  GET: {
    query: { gameId: GameID, roomId: RoomID },
    request: empty,
    response: { type: 'found', roomPage: RoomPage }
  }
}
*/

const roomPage/*: ResourceDescription<RoomPageResource>*/ = {
  path:  '/games/rooms/page',
  GET: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), roomPage: castRoomPage })
  }
}

export const roomPageAPI = {
  '/games/rooms/page': roomPage
}