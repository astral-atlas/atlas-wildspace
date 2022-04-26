// @flow strict

import { c } from "@lukekaalim/cast";
import { castRoomId } from "../../room.js";
import { castGameId } from "../../game.js";
import { castSceneRef } from "../../game/scene.js";

/*::
import type { ResourceDescription, } from "@lukekaalim/net-description/resource";
import type { RoomID } from "../../room";
import type { GameID } from "../../game";
import type { SceneRef } from "../../game/scene";

export type SceneRefResource = {|
  POST: {
    query: { roomId: RoomID, gameId: GameID },
    request: { activeScene: ?SceneRef },
    response: { type: 'updated' }
  },
|};
*/


const sceneRef/*: ResourceDescription<SceneRefResource> */ = {
  path: '/room/scene/ref',

  POST: {
    toQuery: c.obj({ roomId: castRoomId, gameId: castGameId }),
    toRequestBody: c.obj({ activeScene: c.maybe(castSceneRef) }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  }
}

/*::
export type SceneAPI = {|
  '/room/scene/ref': ResourceDescription<SceneRefResource>,
|}

*/

export const sceneAPI = {
  '/room/scene/ref': sceneRef
};