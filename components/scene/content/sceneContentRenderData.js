// @flow strict

/*::
import type { SceneContent } from "@astral-atlas/wildspace-models";
import type {
  SceneContentBackgroundRenderData,
  SceneContentForegroundRenderData,
  SceneContentRenderData,
} from "../SceneRenderer2";
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../../miniTheater/useMiniTheaterController2";
import type { AssetDownloadURLMap } from "../../asset/map";
*/
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../../utils/miniVector";

export const getBackgroundRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  assets/*: AssetDownloadURLMap*/,
)/*: ?SceneContentBackgroundRenderData*/ => {
  switch (content.type) {
    case 'mini-theater':
      if (!miniTheaterState)
        return null;
      return {
        type: 'mini-theater',
        cameraMode: { type: 'interactive', bounds: null },
        controller,
        state: miniTheaterState
      }

    case 'exposition':
      const { background } = content.exposition;
      switch (background.type) {
        case 'image':
          const imageAsset = assets.get(background.assetId);
          console.log(background)
          if (!imageAsset)
            return null;
          return { type: 'image', imageURL: imageAsset.downloadURL };
        case 'color':
          return { type: 'color', color: background.color }
        case 'mini-theater':
          if (!miniTheaterState)
            return null;
          const position = miniVectorToThreeVector(background.position);
          const quaternion = miniQuaternionToThreeQuaternion(background.rotation);
          return {
            type: 'mini-theater',
            cameraMode: { type: 'fixed', position, quaternion },
            controller: null,
            state: miniTheaterState
          }
        default:
          return null;
      }
    case 'none':
    default:
      return { type: 'color', color: 'white' }
  }
};

export const getForegroundRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
)/*: ?SceneContentForegroundRenderData*/ => {
  switch (content.type) {
    case 'exposition':
      const { description } = content.exposition
      return { type: 'exposition', description: description.rootNode };
    case "mini-theater":
      if (!controller || !miniTheaterState)
        return null;
      return { type: 'mini-theater-controls', controller, state: miniTheaterState };
    default:
      return { type: 'none' };
  }
}

export const getContentRenderData = (
  content/*: SceneContent*/,
  miniTheaterState/*: ?MiniTheaterLocalState*/,
  controller/*: ?MiniTheaterController2*/,
  assets/*: AssetDownloadURLMap*/,
)/*: ?SceneContentRenderData*/ => {

  const background = getBackgroundRenderData(content, miniTheaterState, controller, assets);
  const foreground = getForegroundRenderData(content, miniTheaterState, controller);
  if (!background || !foreground) 
    return null;

  return {
    background,
    foreground,
  }
};