// @flow strict
/*::
import type { ResourceDescription } from "@lukekaalim/net-description/resource";
import type { GameID } from "../../game/game";
import type { RoomID } from "../../room";
import type { RoomSceneState } from "../../room/scene";
*/

import { c } from "@lukekaalim/cast";
import { castGameId } from "../../game/game.js";
import { castRoomId } from "../../room.js";
import { castRoomSceneState } from "../../room/scene.js";

/*::
type SceneResource = {|
  GET: {
    query: { gameId: GameID, roomId: RoomID },
    request: empty,
    response: { type: 'found', state: RoomSceneState },
  },
  PUT: {
    query: { gameId: GameID, roomId: RoomID },
    request: { state: RoomSceneState},
    response: { type: 'updated', state: RoomSceneState },
  },
|};

export type SceneAPI = {|
  '/games/rooms/scene': SceneResource
|}
*/

const scenes/*: ResourceDescription<SceneResource>*/ = {
  path: '/games/rooms/scene',
  GET: {
    toQuery: c.obj({ gameId: castGameId, roomId: castRoomId }),
    toResponseBody: c.obj({ type: c.lit('found'), state: castRoomSceneState })
  },
  PUT: {
    toQuery: c.obj({ gameId: castGameId, roomId: castRoomId }),
    toRequestBody: c.obj({ state: castRoomSceneState }),
    toResponseBody: c.obj({ type: c.lit('updated'), state: castRoomSceneState })
  }
}

export const sceneAPI = {
  '/games/rooms/scene': scenes
}