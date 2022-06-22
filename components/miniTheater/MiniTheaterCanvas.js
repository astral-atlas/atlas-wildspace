// @flow strict

/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { MiniTheater, Board, Character, MonsterActorMask, BoardPosition } from "@astral-atlas/wildspace-models";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterResources } from "../encounter/useResources";
import type { KeyboardStateEmitter } from "../keyboard/changes";
import type { SwampResources } from "../encounter/useSwampResources";
*/

import { h} from "@lukekaalim/act";
import {
  PCFSoftShadowMap,
  Color,
} from "three";

import { useRenderSetup } from "../three/useRenderSetup";
import { MiniTheaterScene } from "./MiniTheaterScene";
import classes from './MiniTheaterCanvas.module.css';

/*::
export type MiniTheaterCanvasProps = {
  controller: MiniTheaterController,
  miniTheater: MiniTheater,

  characters: $ReadOnlyArray<Character>,
  monsterMasks: $ReadOnlyArray<MonsterActorMask>,
  assets: AssetDownloadURLMap,

  emitter?: KeyboardStateEmitter,
  controlSurfaceElementRef?: ?Ref<?HTMLElement>,

  resources: EncounterResources,
  swampResources: SwampResources,
}
*/

export const MiniTheaterCanvas/*: Component<MiniTheaterCanvasProps>*/ = ({
  controller,
  miniTheater,
  characters,
  monsterMasks,
  assets,
  resources,
  swampResources,
  emitter,
  children,
  controlSurfaceElementRef,
}) => {
  const render = useRenderSetup({}, ({ renderer }) => {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  });

  return [
    h('div', { ref: render.rootRef, className: classes.miniTheaterOverlay }),
    h('canvas', { ref: render.canvasRef, tabIndex: 0, className: classes.miniTheaterCanvas }),
    h('scene', { ref: render.sceneRef, background: new Color('black') }, [
      children,
      h(MiniTheaterScene, {
        controller, miniTheater, render,
        resources, swampResources,
        characters, assets,
        monsterMasks, emitter, controlSurfaceElementRef
      })
    ])
  ]
}