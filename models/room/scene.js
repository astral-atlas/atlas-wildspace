// @flow strict

import { c } from "@lukekaalim/cast";
import { castSceneRef } from "../game.js";

/*::
import type { SceneRef } from "../game/scene";
import type { Cast } from "@lukekaalim/cast/main";

export type RoomSceneState = {
  activeScene: ?SceneRef
};
*/

export const castRoomSceneState/*: Cast<RoomSceneState>*/ = c.obj({
  activeScene: c.maybe(castSceneRef),
})


/*::
export type RoomSceneAction =
  | { type: 'set-scene', activeSceneRef: ?SceneRef }

*/