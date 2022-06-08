// @flow strict

import { c } from "@lukekaalim/cast";
import { castSceneId } from "../game.js";

/*::
import type { SceneID } from "../game/scene";
import type { Cast } from "@lukekaalim/cast/main";

export type RoomSceneState = {
  activeScene: ?SceneID
};
*/

export const castRoomSceneState/*: Cast<RoomSceneState>*/ = c.obj({
  activeScene: c.maybe(castSceneId),
})


/*::
export type RoomSceneAction =
  | { type: 'set-scene', activeSceneRef: ?SceneID }
*/