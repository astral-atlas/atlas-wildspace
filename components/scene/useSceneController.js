// @flow strict

/*::
import type { RoomPage, GamePage, MiniTheater } from '@astral-atlas/wildspace-models';
import type { Ref } from "@lukekaalim/act";

import type { AssetDownloadURLMap } from "../asset/map";
import type { MiniTheaterController } from "../miniTheater/useMiniTheaterController";
*/

/*::
export type SceneBackground =
| { type: 'none' }
| { type: 'color', color: string }
| { type: 'image', imageURL: string }
| {
    type: 'mini-theater',
    miniTheater: MiniTheater,
    controlSurfaceRef: Ref<?HTMLElement>,
  }

export type SceneForeground =
  | { type: 'exposition-text', content: string }
  | {
      type: 'mini-theater',
      miniTheater: MiniTheater,
      controlSurfaceRef: Ref<?HTMLElement>
    }

export type ScenePage = {
  roomPage: RoomPage,
  gamePage: GamePage,
  
  controller: MiniTheaterController,

  assets: AssetDownloadURLMap,

  sceneBackground: SceneBackground,
  sceneForeground: SceneForeground
}

export type SceneController = {
  page: ScenePage,
};
*/

export const useSceneController = () => {


}