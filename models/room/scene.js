// @flow strict

import { c } from "@lukekaalim/cast";
import { castScene, castSceneContent } from "../game.js";
import { castExposition, castExpositionSubject } from "../game/exposition.js";
import { castMiniTheaterId } from "../game/miniTheater.js";

/*::
import type { SceneID, Scene, SceneContent } from "../game/scene";
import type { Cast } from "@lukekaalim/cast/main";
import type { Exposition } from "../game/exposition";
import type { MiniTheater, MiniTheaterID } from "../game/miniTheater";

export type RoomSceneState = {
  content: SceneContent,
}
*/

export const castRoomSceneState/*: Cast<RoomSceneState>*/ = c.obj({
  content: castSceneContent,
})

/*::
export type RoomSceneAction =
  | { type: 'scene-change', scene: Scene }
*/
export const castRoomSceneAction/*: Cast<RoomSceneAction>*/ = c.or('type', {
  'scene-change': c.obj({ type: c.lit('scene-change'), scene: castScene })
});

export const reduceSceneState = (state/*: RoomSceneState*/, action/*: RoomSceneAction*/)/*: RoomSceneState*/ => {
  switch (action.type) {
    case 'scene-change':
      return { ...state, content: action.scene.content };
    default:
      return state;
  }
}