// @flow strict
/*::
import type { GameID } from "../game/game";
import type { GamePage } from "../game/page";
import type { RoomPage } from "../room/page";
import type { RoomID } from "../room/room";
import type { ResourceDescription } from "@lukekaalim/net-description";
*/

import { c } from "@lukekaalim/cast";

import { castGameId, castGamePage } from "../game.js";
import { castRoomPage, castRoomId } from "../room.js";

/*::
type GamePageResource = {|
  GET: {
    query: { gameId: GameID },
    response: { type: 'found', gamePage: GamePage },
    request: empty,
  }
|}

type RoomPageResource = {|
  GET: {
    query: { gameId: GameID, roomId: RoomID },
    response: { type: 'found', roomPage: RoomPage },
    request: empty,
  }
|}
export type GamePageAPI = {|
  '/pages/game': GamePageResource,
  '/pages/room': RoomPageResource,
|};
*/


const gamePage/*: ResourceDescription<GamePageResource>*/ = {
  path: '/pages/game',
  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), gamePage: castGamePage })
  }
}
const roomPage/*: ResourceDescription<RoomPageResource>*/ = {
  path: '/pages/room',
  GET: {
    toQuery: c.obj({ gameId: castGameId, roomId: castRoomId }),
    toResponseBody: c.obj({ type: c.lit('found'), roomPage: castRoomPage })
  }
}

export const pageAPI = {
  '/pages/game': gamePage,
  '/pages/room': roomPage,
}