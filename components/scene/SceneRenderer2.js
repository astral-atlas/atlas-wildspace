// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { SceneContent, GamePage, ExpositionSubject } from "@astral-atlas/wildspace-models";
import type { JSONNode, Node } from "prosemirror-model";

import type {
  MiniTheaterController2,
  MiniTheaterLocalState,
} from "../miniTheater/useMiniTheaterController2";
import type { KeyboardStateEmitter } from "../keyboard";
import type { AssetDownloadURLMap } from "../asset/map";
import type { Box2, Quaternion, Vector3 } from "three";
*/
import { h, useEffect, useState } from "@lukekaalim/act";
import { SceneContentForegroundRenderer } from "./SceneContentForegroundRenderer";
import { SceneContentBackgroundRenderer2 } from "./SceneContentBackgroundRenderer";
import { SceneContainer } from "./SceneContainer";

/*::
export type SceneContentMiniTheaterCameraMode =
  | { type: 'fixed', position: Vector3, quaternion: Quaternion }
  | { type: 'interactive', bounds: ?Box2 }

export type SceneContentBackgroundRenderData =
  | {
      type: 'mini-theater',
      state: MiniTheaterLocalState,
      controller: ?MiniTheaterController2,
      cameraMode: SceneContentMiniTheaterCameraMode,
      keys: ?KeyboardStateEmitter,
    }
  | { type: 'image', imageURL: string }
  | { type: 'color', color: string }
export type SceneContentForegroundRenderData =
  | { type: 'none' }
  | { type: 'mini-theater-controls', state: MiniTheaterLocalState, controller: MiniTheaterController2 }
  | { type: 'exposition', subject: ExpositionSubject }

export type SceneContentRenderData = {
  background: SceneContentBackgroundRenderData,
  foreground: SceneContentForegroundRenderData
}

export type SceneRenderer2Props = {
  sceneContentRenderData: SceneContentRenderData,
}
*/

export const SceneRenderer2/*: Component<SceneRenderer2Props>*/ = ({
  sceneContentRenderData,
}) => {

  return h(SceneContainer, {}, [
    h(SceneContentBackgroundRenderer2, {
      backgroundRenderData: sceneContentRenderData.background,
    }),
    h(SceneContentForegroundRenderer, {
      foregroundRenderData: sceneContentRenderData.foreground,
    }),
  ]);
};
