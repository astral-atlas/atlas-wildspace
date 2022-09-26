// @flow strict

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
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
import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../miniTheater/useMiniTheaterController2";
import type { MiniTheaterMode } from "../miniTheater/useMiniTheaterMode";

export type SceneContentBackgroundRendererProps = {
  content: SceneContent,
  isInteractive?: boolean,
  freeCam?: boolean,

  assets?: AssetDownloadURLMap,
  miniTheaterController?: ?MiniTheaterController2,
  miniTheaterState?: ?MiniTheaterLocalState,
};
*/

const useMode = (content, keys, controller)/*: ?MiniTheaterMode*/ => {
  return useMemo(() => {
    switch (content.type) {
      case 'mini-theater':
        if (!controller)
          return null;
        return {
          type: 'full-control',
          controller,
          keys
        }
      case 'exposition':
        const { background } = content.exposition;
        switch (background.type) {
          case 'mini-theater':
            return {
              type: 'fixed',
              transform: hydrateBasicTransformFromMini(background.position, background.rotation)
            };
            
        }
      default:
        return null;
    }
  }, [content, keys, controller])
};

export const SceneContentBackgroundRenderer/*: Component<SceneContentBackgroundRendererProps>*/ = ({
  content,
  isInteractive = true,
  freeCam = false,
  miniTheaterController = null,
  miniTheaterState = null,
  assets,
}) => {
  const overrideCanvasRef = useRef();
  const emitter = useElementKeyboard(overrideCanvasRef, [], [
    content.type,
    !!miniTheaterController,
    !!miniTheaterState,
  ]);
  const keys = useKeyboardTrack(emitter);
  const mode = useMode(content, keys, miniTheaterController);

  switch (content.type) {
    case 'exposition':
      const { background } = content.exposition;
      
      switch (background.type) {
        case 'mini-theater':
          if (!miniTheaterState || !mode)
            return null;
          return h(MiniTheaterCanvas, {
            mode,
            miniTheater: miniTheaterState.miniTheater,
            resources: miniTheaterState.resources,
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
      if (!miniTheaterState || !mode)
        return null;
      
      return h(MiniTheaterCanvas, {
        mode,
        miniTheater: miniTheaterState.miniTheater,
        resources: miniTheaterState.resources,
        overrideCanvasRef,
      });
    case 'none':
    default:
      return null;
  }
}