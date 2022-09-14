// @flow strict

import { h, useRef } from "@lukekaalim/act";
import { MiniTheaterCanvas } from "../miniTheater";
import { Quaternion, Vector3 } from "three";
import { hydrateBasicTransformFromMini } from "../utils/transform";
import { useElementKeyboard } from "../keyboard";
import { useKeyboardTrack } from "../keyboard/track";
import { ExpositionImage } from "./exposition/ExpositionImage";
import { ExpositionColor } from "./exposition/ExpositionColor";
import { GridHelperGroup } from "../../docs/src/controls/helpers"; 

/*::
import type { SceneContent, MiniTheater } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { MiniTheaterController } from "../miniTheater/useMiniTheaterController";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { MiniTheaterRenderResources } from "../miniTheater/useMiniTheaterResources";
import type { AssetDownloadURLMap } from "../asset/map";

export type SceneContentBackgroundRendererProps = {
  content: SceneContent,
  isInteractive?: boolean,
  freeCam?: boolean,

  assets?: AssetDownloadURLMap,
  miniTheater?: ?MiniTheater,
  miniTheaterResources?: ?MiniTheaterRenderResources,
  miniTheaterController?: ?MiniTheaterController,
};
*/

export const SceneContentBackgroundRenderer/*: Component<SceneContentBackgroundRendererProps>*/ = ({
  content,
  isInteractive = true,
  freeCam = false,
  miniTheater,
  assets,
  miniTheaterResources,
  miniTheaterController,
}) => {
  const overrideCanvasRef = useRef();
  const emitter = useElementKeyboard(overrideCanvasRef, [], [
    content.type,
    miniTheater,
    miniTheaterController
  ]);
  const keys = useKeyboardTrack(emitter);

  switch (content.type) {
    case 'exposition':
      const { background } = content.exposition;
      
      switch (background.type) {
        case 'mini-theater':
          if (!miniTheater || !miniTheaterResources)
            return null;
          const mode = {
            type: 'fixed',
            transform: hydrateBasicTransformFromMini(background.position, background.rotation)
          };
          return h(MiniTheaterCanvas, {
            mode,
            miniTheater,
            resources: miniTheaterResources,
            overrideCanvasRef,
          });
        case 'image':
          if (!assets)
            return null;
          return h(ExpositionImage, { assets, imageAssetId: background.assetId });
        case 'color':
          return h(ExpositionColor, { color: background.color });
        default:
          return null;
      }
    case 'mini-theater':
      if (!miniTheater || !miniTheaterController || !miniTheaterResources)
        return null;
      const mode = isInteractive ? {
        type: 'full-control',
        keys,
        controller: miniTheaterController,
      } : {
        type: 'stalled-control',
        controller: miniTheaterController,
      };
      return h(MiniTheaterCanvas, {
        mode,
        miniTheater,
        resources: miniTheaterResources,
        overrideCanvasRef,
      });
    case 'none':
    default:
      return null;
  }
}