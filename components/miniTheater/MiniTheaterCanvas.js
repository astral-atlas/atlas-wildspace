// @flow strict

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { MiniTheater, Board, Character, MonsterActorMask, BoardPosition } from "@astral-atlas/wildspace-models";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterResources } from "../encounter/useResources";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { SwampResources } from "../encounter/useSwampResources";
import type { MiniTheaterMode } from "./useMiniTheaterMode";
import type { MiniTheaterRenderResources } from "./useMiniTheaterResources";
import type { PerspectiveCamera } from "three";
*/

import { h} from "@lukekaalim/act";
import {
  PCFSoftShadowMap,
  Color,
} from "three";

import { useRenderSetup } from "../three/useRenderSetup";
import { MiniTheaterScene } from "./MiniTheaterScene";
import classes from './MiniTheaterCanvas.module.css';
import { useElementKeyboard } from "../keyboard/changes";

/*::
export type MiniTheaterCanvasProps = {
  mode: MiniTheaterMode,
  miniTheater: MiniTheater,
  resources: MiniTheaterRenderResources,

  showOverlay?: boolean,
  overrideCanvasRef?: Ref<?HTMLCanvasElement>,
  overrideCameraRef?: Ref<?PerspectiveCamera>,
}
*/

export const MiniTheaterCanvas/*: Component<MiniTheaterCanvasProps>*/ = ({
  mode,
  miniTheater,
  resources,
  
  showOverlay = true,
  overrideCanvasRef = null,
  overrideCameraRef = null,
  children,
}) => {
  const render = useRenderSetup({ canvasRef: overrideCanvasRef, cameraRef: overrideCameraRef }, ({ renderer }) => {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  }, [showOverlay, overrideCanvasRef]);

  window.lad = render;

  return [
    showOverlay && h('div', { ref: render.rootRef, className: classes.miniTheaterOverlay }),
    h('canvas', { ref: render.canvasRef, tabIndex: 0, className: classes.miniTheaterCanvas }),
    h('scene', { ref: render.sceneRef, background: new Color('black') }, [
      children,
      h(MiniTheaterScene, {
        mode, miniTheater,
        render, resources,
        controlSurfaceElementRef: (render.canvasRef/*: any*/)
      })
    ])
  ]
}