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
import { useBezierAnimation } from "@lukekaalim/act-curve";
import { useFadeTransition } from "../transitions/useFadeTransition";
import styles from './SceneContentBackgroundRenderer.module.css';

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
import type {
  CubicBezier,
  CubicBezierAnimation,
} from "@lukekaalim/act-curve/bezier";

export type SceneContentBackgroundRendererProps = {
  content: SceneContent,
  isInteractive?: boolean,
  freeCam?: boolean,

  assets?: AssetDownloadURLMap,
  miniTheaterController?: ?MiniTheaterController2,
  miniTheaterState?: ?MiniTheaterLocalState,
};
*/

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
  focused?: boolean,
}
*/

export const SceneContentBackgroundRenderer2/*: Component<SceneContentBackgroundRenderer2Props>*/ = ({
  backgroundRenderData,
  focused = false,
}) => {

  const backgroundTransitions = useFadeTransition(backgroundRenderData, b => {
    switch (b.type) {
      case 'color':
        return b.color;
      case 'image':
        return b.imageURL;
      case 'mini-theater':
        return b.state.miniTheater.id;
      default:
        return b.type;
    }
  }, [backgroundRenderData]);

  const getBackgroundElement = (data) => {
    switch (data.type) {
      case 'color':
        return h(ExpositionColor, { color: data.color });
      case 'image':
        return h(ExpositionImage, { imageURL: data.imageURL });
      case 'mini-theater':
        return h(SceneMiniTheaterRenderer, {
          state: data.state,
          controller: data.controller, 
          cameraMode: data.cameraMode,
          keys: data.keys,
        })
      default:
        return null;
    }
  }

  return backgroundTransitions.map(bt => {
    const backgroundElement = getBackgroundElement(bt.value);
    return h(TransitionAnimator, {
      transitionAnim: bt.anim,
      key: bt.key,
    }, backgroundElement);
  })
}

const TransitionAnimator = ({ transitionAnim, children }) => {
  const ref = useRef()
  useBezierAnimation(transitionAnim, point => {
    const { current: div } = ref;
    if (!div)
      return;
    div.style.opacity = point.position;
  });
  return h('div', { ref, class: styles.transitionContainer }, children)
}