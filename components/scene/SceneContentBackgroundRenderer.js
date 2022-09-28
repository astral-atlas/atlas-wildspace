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
import { SceneMiniTheaterRenderer } from "./miniTheater/SceneMiniTheater";

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
import type { SceneContentBackgroundRenderData } from "./SceneRenderer2";

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

/*::
export type SceneBackgroundRenderData =
  | { type: 'color', color: string }
  | { type: 'image', imageURL: string }
  | {
      type: 'mini-theater',
      mode:
        | { type: 'fixed', miniTheater: MiniTheater, resources: MiniTheaterRenderResources, position: Vector3, quaternion: Quaternion }
        | { type: 'interactive', controller: MiniTheaterController2 }
    }

export type SceneContentBackgroundRenderer2Props = {
  backgroundRenderData: SceneContentBackgroundRenderData,
  focused?: boolean
}
*/

export const SceneContentBackgroundRenderer2/*: Component<SceneContentBackgroundRenderer2Props>*/ = ({
  backgroundRenderData,
  focused = false,
}) => {
  switch (backgroundRenderData.type) {
    case 'color':
      return h(ExpositionColor, { color: backgroundRenderData.color });
    case 'image':
      return h(ExpositionImage, { imageURL: backgroundRenderData.imageURL });
    case 'mini-theater':
      return h(SceneMiniTheaterRenderer, {
        state: backgroundRenderData.state,
        controller: backgroundRenderData.controller, 
        cameraMode: backgroundRenderData.cameraMode,
      })
    default:
      return null;
  }
}
